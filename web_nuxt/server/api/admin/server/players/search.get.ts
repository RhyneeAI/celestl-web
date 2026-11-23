import { defineEventHandler, getQuery } from 'h3';
// @ts-ignore: better-sqlite3 uses export = Database CommonJS syntax
import Database from 'better-sqlite3';
import { getServerDbPath } from '../../../../utils/server-paths.ts';
import { searchPlayersFromVps } from '../../../../utils/vps-sync.ts';

export interface PlayerSearchResult {
    userId: number;
    name: string;
    userCode: string;
    characterId: number;
    characterAvatar: string;
    ratingPtt: number;
    totalScores: number;
}

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const q = String(query.q || '').trim();
    const limit = Math.min(Math.max(Number(query.limit) || 15, 1), 50);

    // 1. Try VPS live database first
    try {
        const vpsRows = await searchPlayersFromVps(q, limit);
        if (vpsRows && Array.isArray(vpsRows)) {
            const players: PlayerSearchResult[] = vpsRows.map((u: any) => {
                const rawPtt = Number(u.rating_ptt) || 0;
                const ptt = rawPtt > 100 ? Number((rawPtt / 100).toFixed(3)) : Number(rawPtt.toFixed(3));
                return {
                    userId: u.user_id,
                    name: u.name || `Player #${u.user_id}`,
                    userCode: u.user_code || `00${u.user_id}`,
                    characterId: u.character_id ?? 0,
                    characterAvatar: `/storage/characters/${u.character_id ?? 0}_icon.png`,
                    ratingPtt: ptt,
                    totalScores: Number(u.total_scores) || 0,
                };
            });
            return { success: true, players, source: 'vps' };
        }
    } catch (err) {
        console.warn('[Player Search] VPS search error, falling back to local DB:', err);
    }

    // 2. Fallback to local SQLite database
    const dbPath = getServerDbPath();
    if (!dbPath) {
        return { success: false, players: [] };
    }

    try {
        const db = new Database(dbPath, { readonly: true });
        let rows: any[] = [];
        if (q) {
            const pattern = `%${q}%`;
            rows = db.prepare(`
                SELECT 
                    u.user_id, 
                    u.name, 
                    u.user_code, 
                    u.rating_ptt, 
                    u.character_id,
                    COUNT(b.song_id) as total_scores
                FROM user u
                LEFT JOIN best_score b ON u.user_id = b.user_id
                WHERE u.name LIKE ? OR u.user_code LIKE ? OR CAST(u.user_id AS TEXT) = ?
                GROUP BY u.user_id
                ORDER BY u.rating_ptt DESC
                LIMIT ?
            `).all(pattern, pattern, q, limit);
        } else {
            rows = db.prepare(`
                SELECT 
                    u.user_id, 
                    u.name, 
                    u.user_code, 
                    u.rating_ptt, 
                    u.character_id,
                    COUNT(b.song_id) as total_scores
                FROM user u
                LEFT JOIN best_score b ON u.user_id = b.user_id
                GROUP BY u.user_id
                ORDER BY u.rating_ptt DESC
                LIMIT ?
            `).all(limit);
        }
        db.close();

        const players: PlayerSearchResult[] = rows.map((u: any) => {
            const rawPtt = Number(u.rating_ptt) || 0;
            const ptt = rawPtt > 100 ? Number((rawPtt / 100).toFixed(3)) : Number(rawPtt.toFixed(3));
            return {
                userId: u.user_id,
                name: u.name || `Player #${u.user_id}`,
                userCode: u.user_code || `00${u.user_id}`,
                characterId: u.character_id ?? 0,
                characterAvatar: `/storage/characters/${u.character_id ?? 0}_icon.png`,
                ratingPtt: ptt,
                totalScores: Number(u.total_scores) || 0,
            };
        });

        return { success: true, players, source: 'local' };
    } catch (err) {
        console.error('[Player Search] Local DB query error:', err);
        return { success: false, players: [], error: String(err) };
    }
});

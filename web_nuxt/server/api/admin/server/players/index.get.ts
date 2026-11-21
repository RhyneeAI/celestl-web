import { defineEventHandler } from 'h3';
// @ts-ignore: better-sqlite3 uses export = Database CommonJS syntax
import Database from 'better-sqlite3';
import { getServerDbPath } from '../../../../utils/server-paths.ts';
import { fetchAdminPlayersFromVps } from '../../../../utils/vps-sync.ts';

export interface AdminPlayerItem {
    userId: number;
    name: string;
    userCode: string;
    email: string;
    ratingPtt: number;
    ratingPttFormatted: string;
    memories: number;
    characterId: number;
    isBanned: boolean;
    banReason: string | null;
    joinDate: string;
    joinTimestamp: number;
    playCount: number;
    lastPlay: {
        songId: string;
        difficulty: number;
        score: number;
        clearType: number;
        timePlayed: number;
    } | null;
}

function mapPlayerRow(r: any, playCount: number): AdminPlayerItem {
    const isPasswordEmpty = !r.password || r.password === '';
    const isBanFlagSet = r.ban_flag && String(r.ban_flag).trim() !== '' && String(r.ban_flag) !== '0';
    const isBanned = Boolean(isPasswordEmpty || isBanFlagSet);

    let joinTs = 0;
    const parsed = parseInt(String(r.join_date || '0'), 10);
    if (!isNaN(parsed) && parsed > 0) {
        joinTs = parsed < 10000000000 ? parsed * 1000 : parsed;
    }

    const pttVal = typeof r.rating_ptt === 'number' ? r.rating_ptt : (Number(r.rating_ptt) || 0);
    const pttFormatted = (pttVal > 100 ? (pttVal / 100).toFixed(2) : pttVal.toFixed(3));

    return {
        userId: r.user_id,
        name: r.name || `User ${r.user_id}`,
        userCode: r.user_code || String(r.user_id).padStart(9, '0'),
        email: r.email || '',
        ratingPtt: Number(pttVal.toFixed(3)),
        ratingPttFormatted: pttFormatted,
        memories: r.ticket ?? 0,
        characterId: r.character_id ?? 0,
        isBanned,
        banReason: isBanFlagSet ? String(r.ban_flag) : (isPasswordEmpty ? 'Account locked' : null),
        joinDate: joinTs > 0 ? new Date(joinTs).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—',
        joinTimestamp: joinTs,
        playCount,
        lastPlay: r.song_id ? {
            songId: r.song_id,
            difficulty: r.difficulty ?? 2,
            score: r.score ?? 0,
            clearType: r.clear_type ?? 0,
            timePlayed: r.time_played ?? 0,
        } : null,
    };
}

export default defineEventHandler(async () => {
    // 1. Try fetching from VPS live database first (Option A)
    try {
        const vpsRows = await fetchAdminPlayersFromVps();
        if (vpsRows && vpsRows.length > 0) {
            const players: AdminPlayerItem[] = vpsRows.map(r => mapPlayerRow(r, r.play_count ?? 0));
            return {
                success: true,
                total: players.length,
                activeCount: players.filter(p => !p.isBanned).length,
                bannedCount: players.filter(p => p.isBanned).length,
                players,
                source: 'vps',
            };
        }
    } catch (vpsErr) {
        console.warn('[Admin Players] VPS fetch error, falling back to local DB:', vpsErr);
    }

    // 2. Fallback to local database
    const dbPath = getServerDbPath();
    if (!dbPath) {
        return { success: false, error: 'Server database not found', players: [] };
    }

    try {
        const db = new Database(dbPath, { readonly: true });
        const scoreCounts = new Map<number, number>();
        try {
            const counts = db.prepare('SELECT user_id, COUNT(*) as c FROM best_score GROUP BY user_id').all() as Array<{ user_id: number; c: number }>;
            for (const row of counts) {
                scoreCounts.set(row.user_id, row.c);
            }
        } catch {}

        const rows = db.prepare(`
            SELECT 
                user_id, name, password, join_date, user_code, rating_ptt, 
                character_id, ticket, email, ban_flag,
                song_id, difficulty, score, clear_type, time_played
            FROM user
            ORDER BY rating_ptt DESC, user_id ASC
        `).all() as any[];

        db.close();

        const players: AdminPlayerItem[] = rows.map(r => mapPlayerRow(r, scoreCounts.get(r.user_id) ?? 0));

        return {
            success: true,
            total: players.length,
            activeCount: players.filter(p => !p.isBanned).length,
            bannedCount: players.filter(p => p.isBanned).length,
            players,
            source: 'local',
        };
    } catch (err: any) {
        return {
            success: false,
            error: err.message || 'Failed to fetch player list',
            players: [],
        };
    }
});

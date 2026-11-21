import { defineEventHandler, readBody, createError, setCookie } from 'h3';
// @ts-ignore: better-sqlite3 uses export = Database CommonJS syntax
import Database from 'better-sqlite3';
import { getServerDbPath } from '../../utils/server-paths.ts';
import { fetchPlayerFromVps } from '../../utils/vps-sync.ts';

export default defineEventHandler(async (event) => {
    const body = await readBody<{ username?: string }>(event);
    const username = (body?.username || '').trim();

    if (!username) {
        throw createError({
            statusCode: 422,
            statusMessage: 'Username or User Code is required.',
        });
    }

    let row: any = null;

    // 1. Try fetching from VPS live database first (skipCache: true for live auth)
    try {
        row = await fetchPlayerFromVps(username, true);
    } catch (e) {
        console.warn('[Player Login] VPS lookup error, falling back to local DB:', e);
    }

    // 2. Fall back to local database if not found on VPS or VPS unreachable
    if (!row) {
        const dbPath = getServerDbPath();
        if (dbPath) {
            try {
                const db = new Database(dbPath, { readonly: true });
                row = db.prepare(`
                    SELECT user_id, name, user_code, rating_ptt, character_id
                    FROM user
                    WHERE name = ? COLLATE NOCASE OR user_code = ?
                    LIMIT 1
                `).get(username, username) as any;
                db.close();
            } catch (err) {
                console.warn('[Player Login] Local DB lookup error:', err);
            }
        }
    }

    if (!row) {
        throw createError({
            statusCode: 404,
            statusMessage: `Player "${username}" not found on Celest Server.`,
        });
    }

    const ptt = row.rating_ptt != null ? Number(row.rating_ptt) : 0;
    const charId = row.character_id != null ? Number(row.character_id) : 0;

    const player = {
        userId: row.user_id,
        name: row.name,
        userCode: row.user_code,
        ratingPtt: ptt,
        ratingPttFormatted: ptt.toFixed(2),
        characterId: charId,
        characterAvatar: `/storage/characters/${charId}_icon.png`,
    };

    // Save session cookie for 30 days
    setCookie(event, 'celest_player_uid', String(row.user_id), {
        httpOnly: false, // Accessible to frontend if needed
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
    });

    return {
        success: true,
        player,
    };
});

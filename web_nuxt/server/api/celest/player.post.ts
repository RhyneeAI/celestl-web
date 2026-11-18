import { defineEventHandler, readBody, createError, setCookie } from 'h3';
// @ts-ignore: better-sqlite3 uses export = Database CommonJS syntax
import Database from 'better-sqlite3';
import { getServerDbPath } from '../../utils/server-paths.ts';

export default defineEventHandler(async (event) => {
    const body = await readBody<{ username?: string }>(event);
    const username = (body?.username || '').trim();

    if (!username) {
        throw createError({
            statusCode: 422,
            statusMessage: 'Username or User Code is required.',
        });
    }

    const dbPath = getServerDbPath();
    if (!dbPath) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Server database is currently unavailable.',
        });
    }

    try {
        const db = new Database(dbPath, { readonly: true });
        const row = db.prepare(`
            SELECT user_id, name, user_code, rating_ptt, character_id
            FROM user
            WHERE name = ? COLLATE NOCASE OR user_code = ?
            LIMIT 1
        `).get(username, username) as any;

        db.close();

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
    } catch (err: any) {
        if (err.statusCode) throw err;
        throw createError({
            statusCode: 500,
            statusMessage: err.message || 'Failed to authenticate player',
        });
    }
});

import { defineEventHandler, getCookie, getQuery } from 'h3';
// @ts-ignore: better-sqlite3 uses export = Database CommonJS syntax
import Database from 'better-sqlite3';
import { getServerDbPath } from '../../utils/server-paths.ts';
import { fetchPlayerFromVps } from '../../utils/vps-sync.ts';

export default defineEventHandler(async (event) => {
    const cookieUid = getCookie(event, 'celest_player_uid');
    const query = getQuery(event);
    const targetUid = query.userId ? String(query.userId) : cookieUid;

    if (!targetUid) {
        return {
            player: null,
        };
    }

    let row: any = null;

    // 1. Try fetching from VPS live database first
    try {
        row = await fetchPlayerFromVps(Number(targetUid) || targetUid);
    } catch {
        // ignore and fallback
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
                    WHERE user_id = ?
                    LIMIT 1
                `).get(Number(targetUid)) as any;
                db.close();
            } catch { }
        }
    }

    if (!row) {
        return {
            player: null,
        };
    }

    const ptt = row.rating_ptt != null ? Number(row.rating_ptt) : 0;
    const charId = row.character_id != null ? Number(row.character_id) : 0;

    return {
        player: {
            userId: row.user_id,
            name: row.name,
            userCode: row.user_code,
            ratingPtt: ptt,
            ratingPttFormatted: ptt.toFixed(2),
            characterId: charId,
            characterAvatar: `/storage/characters/${charId}_icon.png`,
        },
    };
});

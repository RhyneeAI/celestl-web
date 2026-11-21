import { defineEventHandler, readBody, createError } from 'h3';
// @ts-ignore: better-sqlite3 uses export = Database CommonJS syntax
import Database from 'better-sqlite3';
import { getServerDbPath } from '../../../../utils/server-paths.ts';
import { syncPlayerWipeScoresToVps } from '../../../../utils/vps-sync.ts';

interface WipeScoresBody {
    userId: number;
}

export default defineEventHandler(async (event) => {
    const body = await readBody<WipeScoresBody>(event);
    if (!body || typeof body.userId !== 'number') {
        throw createError({ statusCode: 400, statusMessage: 'Invalid parameters: userId required' });
    }

    let playerName = `User ${body.userId}`;

    const dbPath = getServerDbPath();
    if (dbPath) {
        try {
            const db = new Database(dbPath);
            const current = db.prepare('SELECT user_id, name FROM user WHERE user_id = ?').get(body.userId) as any;
            if (current) {
                playerName = current.name || playerName;
                db.prepare('DELETE FROM best_score WHERE user_id = ?').run(body.userId);
                db.prepare('DELETE FROM recent30 WHERE user_id = ?').run(body.userId);
                db.prepare(`
                    UPDATE user 
                    SET rating_ptt = 0,
                        song_id = '',
                        difficulty = 0,
                        score = 0,
                        shiny_perfect_count = 0,
                        perfect_count = 0,
                        near_count = 0,
                        miss_count = 0,
                        health = 0,
                        time_played = 0,
                        rating = 0,
                        world_rank_score = 0
                    WHERE user_id = ?
                `).run(body.userId);
            }
            db.close();
        } catch { }
    }

    // Sync score wipe to VPS and trigger recalculate
    const vpsRes = await syncPlayerWipeScoresToVps(body.userId);

    return {
        success: true,
        userId: body.userId,
        name: playerName,
        synced_vps: vpsRes.synced_vps,
        message: `All scores wiped for player ${playerName} (UID ${body.userId})${vpsRes.synced_vps ? ' (Synced to VPS)' : ''}`,
    };
});

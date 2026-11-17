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

    const dbPath = getServerDbPath();
    if (!dbPath) {
        throw createError({ statusCode: 500, statusMessage: 'Server database not found' });
    }

    try {
        const db = new Database(dbPath);

        const current = db.prepare('SELECT user_id, name FROM user WHERE user_id = ?').get(body.userId) as any;
        if (!current) {
            db.close();
            throw createError({ statusCode: 404, statusMessage: 'Player not found' });
        }

        // Wipe best_score
        const deletedBest = db.prepare('DELETE FROM best_score WHERE user_id = ?').run(body.userId);
        // Wipe recent30
        const deletedRecent = db.prepare('DELETE FROM recent30 WHERE user_id = ?').run(body.userId);

        // Reset user table stats
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

        db.close();

        // Sync score wipe to VPS and trigger recalculate
        const vpsRes = await syncPlayerWipeScoresToVps(body.userId);

        return {
            success: true,
            userId: body.userId,
            deletedBestCount: deletedBest.changes,
            deletedRecentCount: deletedRecent.changes,
            synced_vps: vpsRes.synced_vps,
            message: `Successfully wiped ${deletedBest.changes} scores and reset PTT to 0 for ${current.name} (UID ${body.userId})${vpsRes.synced_vps ? ' (Synced to VPS)' : ''}`,
        };
    } catch (err: any) {
        if (err.statusCode) throw err;
        throw createError({ statusCode: 500, statusMessage: err.message || 'Database wipe failed' });
    }
});

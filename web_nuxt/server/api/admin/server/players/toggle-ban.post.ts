import { defineEventHandler, readBody, createError } from 'h3';
import crypto from 'crypto';
// @ts-ignore: better-sqlite3 uses export = Database CommonJS syntax
import Database from 'better-sqlite3';
import { getServerDbPath } from '../../../../utils/server-paths.ts';
import { syncPlayerBanToVps, syncPlayerPasswordToVps } from '../../../../utils/vps-sync.ts';

interface ToggleBanBody {
    userId: number;
    ban: boolean;
    reason?: string;
    unbanPassword?: string;
}

export default defineEventHandler(async (event) => {
    const body = await readBody<ToggleBanBody>(event);
    if (!body || typeof body.userId !== 'number' || typeof body.ban !== 'boolean') {
        throw createError({ statusCode: 400, statusMessage: 'Invalid parameters: userId and ban flag required' });
    }

    const dbPath = getServerDbPath();
    if (!dbPath) {
        throw createError({ statusCode: 500, statusMessage: 'Server database not found' });
    }

    try {
        const db = new Database(dbPath);

        const current = db.prepare('SELECT user_id, name, password, ban_flag FROM user WHERE user_id = ?').get(body.userId) as any;
        if (!current) {
            db.close();
            throw createError({ statusCode: 404, statusMessage: 'Player not found' });
        }

        if (body.ban) {
            // Ban player: clear password, set ban_flag, kill active sessions
            db.prepare("UPDATE user SET password = '', ban_flag = ? WHERE user_id = ?").run(body.reason || 'Banned by Administrator', body.userId);
            db.prepare('DELETE FROM login WHERE user_id = ?').run(body.userId);
            db.close();

            // Sync ban to VPS
            const vpsRes = await syncPlayerBanToVps(body.userId, true, body.reason || 'Banned by Administrator');

            return {
                success: true,
                userId: body.userId,
                isBanned: true,
                synced_vps: vpsRes.synced_vps,
                message: `Player ${current.name} (UID ${body.userId}) has been banned.${vpsRes.synced_vps ? ' (Synced to VPS)' : ''}`,
            };
        } else {
            // Unban player: assign password (either provided or default 'Arcaea123!') and clear ban_flag
            const pwd = body.unbanPassword || 'Arcaea123!';
            const hashed = crypto.createHash('sha256').update(pwd).digest('hex');

            db.prepare("UPDATE user SET password = ?, ban_flag = NULL WHERE user_id = ?").run(hashed, body.userId);
            db.close();

            // Sync unban & password to VPS
            await syncPlayerBanToVps(body.userId, false, null);
            const vpsRes = await syncPlayerPasswordToVps(body.userId, hashed);

            return {
                success: true,
                userId: body.userId,
                isBanned: false,
                tempPassword: pwd,
                synced_vps: vpsRes.synced_vps,
                message: `Player ${current.name} (UID ${body.userId}) has been unbanned. Password set to: ${pwd}${vpsRes.synced_vps ? ' (Synced to VPS)' : ''}`,
            };
        }
    } catch (err: any) {
        if (err.statusCode) throw err;
        throw createError({ statusCode: 500, statusMessage: err.message || 'Database update failed' });
    }
});

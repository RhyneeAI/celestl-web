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

    let playerName = `User ${body.userId}`;
    let existsLocally = false;

    const dbPath = getServerDbPath();
    if (dbPath) {
        try {
            const db = new Database(dbPath);
            const current = db.prepare('SELECT user_id, name, password, ban_flag FROM user WHERE user_id = ?').get(body.userId) as any;
            if (current) {
                existsLocally = true;
                playerName = current.name || playerName;
                if (body.ban) {
                    db.prepare("UPDATE user SET password = '', ban_flag = ? WHERE user_id = ?").run(body.reason || 'Banned by Administrator', body.userId);
                    db.prepare('DELETE FROM login WHERE user_id = ?').run(body.userId);
                } else {
                    const pwd = body.unbanPassword || 'Arcaea123!';
                    const hashed = crypto.createHash('sha256').update(pwd).digest('hex');
                    db.prepare("UPDATE user SET password = ?, ban_flag = NULL WHERE user_id = ?").run(hashed, body.userId);
                }
            }
            db.close();
        } catch (localErr) {
            console.warn('[Toggle Ban] Local DB update error:', localErr);
        }
    }

    if (body.ban) {
        // Sync ban to VPS
        const vpsRes = await syncPlayerBanToVps(body.userId, true, body.reason || 'Banned by Administrator');
        if (!existsLocally && !vpsRes.synced_vps) {
            throw createError({ statusCode: 404, statusMessage: 'Player not found on server' });
        }

        return {
            success: true,
            userId: body.userId,
            isBanned: true,
            synced_vps: vpsRes.synced_vps,
            message: `Player ${playerName} (UID ${body.userId}) has been banned.${vpsRes.synced_vps ? ' (Synced to VPS)' : ''}`,
        };
    } else {
        const pwd = body.unbanPassword || 'Arcaea123!';
        const hashed = crypto.createHash('sha256').update(pwd).digest('hex');

        // Sync unban & password to VPS
        await syncPlayerBanToVps(body.userId, false, null);
        const vpsRes = await syncPlayerPasswordToVps(body.userId, hashed);
        if (!existsLocally && !vpsRes.synced_vps) {
            throw createError({ statusCode: 404, statusMessage: 'Player not found on server' });
        }

        return {
            success: true,
            userId: body.userId,
            isBanned: false,
            synced_vps: vpsRes.synced_vps,
            message: `Player ${playerName} (UID ${body.userId}) unbanned. Password set to: ${pwd}${vpsRes.synced_vps ? ' (Synced to VPS)' : ''}`,
        };
    }
});

import { defineEventHandler, readBody, createError } from 'h3';
import crypto from 'crypto';
// @ts-ignore: better-sqlite3 uses export = Database CommonJS syntax
import Database from 'better-sqlite3';
import { getServerDbPath } from '../../../../utils/server-paths.ts';
import { syncPlayerPasswordToVps } from '../../../../utils/vps-sync.ts';

interface ResetPasswordBody {
    userId: number;
    newPassword: string;
}

export default defineEventHandler(async (event) => {
    const body = await readBody<ResetPasswordBody>(event);
    if (!body || typeof body.userId !== 'number' || !body.newPassword) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid parameters: userId and newPassword required' });
    }

    if (body.newPassword.length < 6) {
        throw createError({ statusCode: 400, statusMessage: 'Password must be at least 6 characters' });
    }

    let playerName = `User ${body.userId}`;
    let existsLocally = false;
    const hashed = crypto.createHash('sha256').update(body.newPassword).digest('hex');

    const dbPath = getServerDbPath();
    if (dbPath) {
        try {
            const db = new Database(dbPath);
            const current = db.prepare('SELECT user_id, name FROM user WHERE user_id = ?').get(body.userId) as any;
            if (current) {
                existsLocally = true;
                playerName = current.name || playerName;
                db.prepare('UPDATE user SET password = ?, ban_flag = NULL WHERE user_id = ?').run(hashed, body.userId);
                db.prepare('DELETE FROM login WHERE user_id = ?').run(body.userId);
            }
            db.close();
        } catch (localErr) {
            console.warn('[Reset Password] Local DB update error:', localErr);
        }
    }

    // Sync password reset to VPS
    const vpsRes = await syncPlayerPasswordToVps(body.userId, hashed);
    if (!existsLocally && !vpsRes.synced_vps) {
        throw createError({ statusCode: 404, statusMessage: 'Player not found on server' });
    }

    return {
        success: true,
        userId: body.userId,
        name: playerName,
        synced_vps: vpsRes.synced_vps,
        message: `Password reset successfully for player ${playerName} (UID ${body.userId})${vpsRes.synced_vps ? ' (Synced to VPS)' : ''}`,
    };
});

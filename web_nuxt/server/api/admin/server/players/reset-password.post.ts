import { defineEventHandler, readBody, createError } from 'h3';
import crypto from 'crypto';
// @ts-ignore: better-sqlite3 uses export = Database CommonJS syntax
import Database from 'better-sqlite3';
import { getServerDbPath } from '../../../../utils/server-paths.ts';

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

    const dbPath = getServerDbPath();
    if (!dbPath) {
        throw createError({ statusCode: 500, statusMessage: 'Server database not found' });
    }

    try {
        const db = new Database(dbPath);

        const current = db.prepare('SELECT user_id, name FROM user WHERE user_id = ?').get(body.userId) as { user_id: number; name: string } | undefined;
        if (!current) {
            db.close();
            throw createError({ statusCode: 404, statusMessage: 'Player not found' });
        }

        const hashed = crypto.createHash('sha256').update(body.newPassword).digest('hex');

        // Update password and clear ban flag / old sessions
        db.prepare('UPDATE user SET password = ?, ban_flag = NULL WHERE user_id = ?').run(hashed, body.userId);
        db.prepare('DELETE FROM login WHERE user_id = ?').run(body.userId);
        db.close();

        return {
            success: true,
            userId: body.userId,
            name: current.name,
            message: `Password reset successfully for player ${current.name} (UID ${body.userId})`,
        };
    } catch (err: any) {
        if (err.statusCode) throw err;
        throw createError({ statusCode: 500, statusMessage: err.message || 'Database update failed' });
    }
});

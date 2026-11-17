import { defineEventHandler, readBody, createError } from 'h3';
// @ts-ignore: better-sqlite3 uses export = Database CommonJS syntax
import Database from 'better-sqlite3';
import { getServerDbPath } from '../../../../utils/server-paths.ts';

interface UpdateMemoriesBody {
    userId: number;
    amount: number;
    mode: 'set' | 'add';
}

export default defineEventHandler(async (event) => {
    const body = await readBody<UpdateMemoriesBody>(event);
    if (!body || typeof body.userId !== 'number' || typeof body.amount !== 'number') {
        throw createError({ statusCode: 400, statusMessage: 'Invalid parameters: userId and amount required' });
    }

    const dbPath = getServerDbPath();
    if (!dbPath) {
        throw createError({ statusCode: 500, statusMessage: 'Server database not found' });
    }

    try {
        const db = new Database(dbPath);

        const current = db.prepare('SELECT ticket FROM user WHERE user_id = ?').get(body.userId) as { ticket: number } | undefined;
        if (!current) {
            db.close();
            throw createError({ statusCode: 404, statusMessage: 'Player not found' });
        }

        let newBalance = body.amount;
        if (body.mode === 'add') {
            newBalance = Math.max(0, (current.ticket || 0) + body.amount);
        } else {
            newBalance = Math.max(0, body.amount);
        }

        db.prepare('UPDATE user SET ticket = ? WHERE user_id = ?').run(newBalance, body.userId);
        db.close();

        return {
            success: true,
            userId: body.userId,
            oldBalance: current.ticket || 0,
            newBalance,
            message: `Memories updated to ${newBalance} for User ID ${body.userId}`,
        };
    } catch (err: any) {
        if (err.statusCode) throw err;
        throw createError({ statusCode: 500, statusMessage: err.message || 'Database update failed' });
    }
});

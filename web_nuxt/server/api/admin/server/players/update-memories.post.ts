import { defineEventHandler, readBody, createError } from 'h3';
// @ts-ignore: better-sqlite3 uses export = Database CommonJS syntax
import Database from 'better-sqlite3';
import { getServerDbPath } from '../../../../utils/server-paths.ts';
import { syncPlayerMemoriesToVps, fetchPlayerFromVps } from '../../../../utils/vps-sync.ts';

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

    let currentTicket = 0;
    let existsLocally = false;

    const dbPath = getServerDbPath();
    if (dbPath) {
        try {
            const db = new Database(dbPath);
            const current = db.prepare('SELECT ticket FROM user WHERE user_id = ?').get(body.userId) as any;
            if (current) {
                existsLocally = true;
                currentTicket = current.ticket || 0;
            }
            db.close();
        } catch {}
    }

    // If not found locally, fetch current ticket from VPS
    if (!existsLocally) {
        try {
            const vpsUser = await fetchPlayerFromVps(body.userId);
            if (vpsUser) {
                currentTicket = vpsUser.ticket || 0;
            }
        } catch {}
    }

    let newBalance = body.amount;
    if (body.mode === 'add') {
        newBalance = Math.max(0, currentTicket + body.amount);
    } else {
        newBalance = Math.max(0, body.amount);
    }

    if (existsLocally && dbPath) {
        try {
            const db = new Database(dbPath);
            db.prepare('UPDATE user SET ticket = ? WHERE user_id = ?').run(newBalance, body.userId);
            db.close();
        } catch {}
    }

    // Sync memories update to VPS
    const vpsRes = await syncPlayerMemoriesToVps(body.userId, newBalance);

    return {
        success: true,
        userId: body.userId,
        oldBalance: currentTicket,
        newBalance,
        synced_vps: vpsRes.synced_vps,
        message: `Memories updated to ${newBalance} for User ID ${body.userId}${vpsRes.synced_vps ? ' (Synced to VPS)' : ''}`,
    };
});

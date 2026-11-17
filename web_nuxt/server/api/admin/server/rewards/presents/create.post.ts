import { defineEventHandler, readBody, createError } from 'h3';
// @ts-ignore: better-sqlite3 uses export = Database CommonJS syntax
import Database from 'better-sqlite3';
import { getServerDbPath } from '../../../../../utils/server-paths.ts';
import { syncPresentCreateToVps } from '../../../../../utils/vps-sync.ts';

interface CreatePresentBody {
    presentId?: string;
    description: string;
    expireDays: number;
    target: 'all' | 'single';
    userId?: number;
    items: Array<{
        itemId: string;
        type: string;
        amount: number;
    }>;
}

export default defineEventHandler(async (event) => {
    const body = await readBody<CreatePresentBody>(event);
    if (!body || !body.description || !Array.isArray(body.items) || body.items.length === 0) {
        throw createError({ statusCode: 400, statusMessage: 'Description and at least one reward item are required' });
    }

    const dbPath = getServerDbPath();
    if (!dbPath) {
        throw createError({ statusCode: 500, statusMessage: 'Server database not found' });
    }

    const presentId = (body.presentId && body.presentId.trim()) 
        ? body.presentId.trim() 
        : `present_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const expireDays = Math.max(1, body.expireDays || 30);
    const expireTs = Date.now() + (expireDays * 86400 * 1000);

    try {
        const db = new Database(dbPath);

        // Check if present exists
        const exists = db.prepare('SELECT 1 FROM present WHERE present_id = ?').get(presentId);
        if (exists) {
            db.close();
            throw createError({ statusCode: 400, statusMessage: `Present ID "${presentId}" already exists` });
        }

        // Insert present
        db.prepare('INSERT INTO present (present_id, expire_ts, description) VALUES (?, ?, ?)').run(
            presentId,
            expireTs,
            body.description.trim()
        );

        // Insert present items
        const insertItem = db.prepare('INSERT INTO present_item (present_id, item_id, type, amount) VALUES (?, ?, ?, ?)');
        for (const it of body.items) {
            insertItem.run(presentId, it.itemId, it.type, Math.max(1, it.amount));
        }

        // Deliver to target
        let deliveredCount = 0;
        if (body.target === 'all') {
            const users = db.prepare('SELECT user_id FROM user').all() as Array<{ user_id: number }>;
            const deliver = db.prepare('INSERT OR IGNORE INTO user_present (user_id, present_id) VALUES (?, ?)');
            for (const u of users) {
                deliver.run(u.user_id, presentId);
                deliveredCount++;
            }
        } else if (typeof body.userId === 'number') {
            const deliver = db.prepare('INSERT OR IGNORE INTO user_present (user_id, present_id) VALUES (?, ?)');
            deliver.run(body.userId, presentId);
            deliveredCount = 1;
        }

        db.close();

        // Sync to VPS celest-server
        const vpsRes = await syncPresentCreateToVps({
            presentId,
            expireTs,
            description: body.description.trim(),
            target: body.target,
            userId: body.userId,
            items: body.items,
        });

        return {
            success: true,
            presentId,
            deliveredCount,
            synced_vps: vpsRes.synced_vps,
            message: `Present "${presentId}" created and delivered to ${deliveredCount} player(s).${vpsRes.synced_vps ? ' (Synced to VPS)' : ''}`,
        };
    } catch (err: any) {
        if (err.statusCode) throw err;
        throw createError({ statusCode: 500, statusMessage: err.message || 'Failed to create present' });
    }
});

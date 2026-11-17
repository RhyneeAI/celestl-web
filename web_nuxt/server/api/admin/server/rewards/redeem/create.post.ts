import { defineEventHandler, readBody, createError } from 'h3';
// @ts-ignore: better-sqlite3 uses export = Database CommonJS syntax
import Database from 'better-sqlite3';
import { getServerDbPath } from '../../../../../utils/server-paths.ts';

interface CreateRedeemBody {
    code?: string;
    type: number; // 0: single use, 1: 1x per user
    items: Array<{
        itemId: string;
        type: string;
        amount: number;
    }>;
}

export default defineEventHandler(async (event) => {
    const body = await readBody<CreateRedeemBody>(event);
    if (!body || !Array.isArray(body.items) || body.items.length === 0) {
        throw createError({ statusCode: 400, statusMessage: 'At least one reward item is required' });
    }

    const dbPath = getServerDbPath();
    if (!dbPath) {
        throw createError({ statusCode: 500, statusMessage: 'Server database not found' });
    }

    // Auto-generate random 10-char uppercase code if not provided
    const code = (body.code && body.code.trim())
        ? body.code.trim().toUpperCase()
        : Array.from({ length: 10 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');

    const redeemType = body.type === 1 ? 1 : 0;

    try {
        const db = new Database(dbPath);

        const exists = db.prepare('SELECT 1 FROM redeem WHERE code = ?').get(code);
        if (exists) {
            db.close();
            throw createError({ statusCode: 400, statusMessage: `Redeem code "${code}" already exists` });
        }

        db.prepare('INSERT INTO redeem (code, type) VALUES (?, ?)').run(code, redeemType);

        const insertItem = db.prepare('INSERT INTO redeem_item (code, item_id, type, amount) VALUES (?, ?, ?, ?)');
        for (const it of body.items) {
            insertItem.run(code, it.itemId, it.type, Math.max(1, it.amount));
        }

        db.close();

        return {
            success: true,
            code,
            type: redeemType,
            message: `Redeem code "${code}" successfully created!`,
        };
    } catch (err: any) {
        if (err.statusCode) throw err;
        throw createError({ statusCode: 500, statusMessage: err.message || 'Failed to create redeem code' });
    }
});

import { defineEventHandler, readBody, createError } from 'h3';
// @ts-ignore: better-sqlite3 uses export = Database CommonJS syntax
import Database from 'better-sqlite3';
import { getServerDbPath } from '../../../../../utils/server-paths.ts';
import { syncRedeemDeleteToVps } from '../../../../../utils/vps-sync.ts';

interface DeleteRedeemBody {
    code: string;
}

export default defineEventHandler(async (event) => {
    const body = await readBody<DeleteRedeemBody>(event);
    if (!body || !body.code) {
        throw createError({ statusCode: 400, statusMessage: 'code is required' });
    }

    const dbPath = getServerDbPath();
    if (!dbPath) {
        throw createError({ statusCode: 500, statusMessage: 'Server database not found' });
    }

    try {
        const db = new Database(dbPath);

        db.prepare('DELETE FROM user_redeem WHERE code = ?').run(body.code);
        db.prepare('DELETE FROM redeem_item WHERE code = ?').run(body.code);
        const res = db.prepare('DELETE FROM redeem WHERE code = ?').run(body.code);

        db.close();

        // Sync deletion to VPS
        const vpsRes = await syncRedeemDeleteToVps(body.code);

        return {
            success: true,
            code: body.code,
            synced_vps: vpsRes.synced_vps,
            message: `Redeem code "${body.code}" deleted successfully.${vpsRes.synced_vps ? ' (Synced to VPS)' : ''}`,
        };
    } catch (err: any) {
        if (err.statusCode) throw err;
        throw createError({ statusCode: 500, statusMessage: err.message || 'Failed to delete redeem code' });
    }
});

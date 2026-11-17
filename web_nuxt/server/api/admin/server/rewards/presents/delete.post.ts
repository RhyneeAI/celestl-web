import { defineEventHandler, readBody, createError } from 'h3';
// @ts-ignore: better-sqlite3 uses export = Database CommonJS syntax
import Database from 'better-sqlite3';
import { getServerDbPath } from '../../../../../utils/server-paths.ts';
import { syncPresentDeleteToVps } from '../../../../../utils/vps-sync.ts';

interface DeletePresentBody {
    presentId: string;
}

export default defineEventHandler(async (event) => {
    const body = await readBody<DeletePresentBody>(event);
    if (!body || !body.presentId) {
        throw createError({ statusCode: 400, statusMessage: 'presentId is required' });
    }

    const dbPath = getServerDbPath();
    if (!dbPath) {
        throw createError({ statusCode: 500, statusMessage: 'Server database not found' });
    }

    try {
        const db = new Database(dbPath);

        db.prepare('DELETE FROM user_present WHERE present_id = ?').run(body.presentId);
        db.prepare('DELETE FROM present_item WHERE present_id = ?').run(body.presentId);
        const res = db.prepare('DELETE FROM present WHERE present_id = ?').run(body.presentId);

        db.close();

        // Sync deletion to VPS
        const vpsRes = await syncPresentDeleteToVps(body.presentId);

        return {
            success: true,
            presentId: body.presentId,
            synced_vps: vpsRes.synced_vps,
            message: `Present "${body.presentId}" deleted successfully.${vpsRes.synced_vps ? ' (Synced to VPS)' : ''}`,
        };
    } catch (err: any) {
        if (err.statusCode) throw err;
        throw createError({ statusCode: 500, statusMessage: err.message || 'Failed to delete present' });
    }
});

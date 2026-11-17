import { defineEventHandler, readBody, createError } from 'h3';
import Database from 'better-sqlite3';
import { getServerDbPath } from '../../../../utils/server-paths.ts';
import { syncStoreUpdateToVps } from '../../../../utils/vps-sync.ts';

interface StoreUpdateBody {
    purchase_name: string;
    price: number;
    orig_price?: number;
    discount_from?: number;
    discount_to?: number;
    discount_reason?: string;
}

export default defineEventHandler(async (event) => {
    const body = await readBody<StoreUpdateBody>(event);
    if (!body || !body.purchase_name) {
        throw createError({
            statusCode: 422,
            statusMessage: 'purchase_name is required',
        });
    }

    const serverDbPath = getServerDbPath();
    if (!serverDbPath) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Arcaea server database not found',
        });
    }

    const price = Math.max(0, Math.floor(body.price));
    const origPrice = body.orig_price !== undefined ? Math.max(0, Math.floor(body.orig_price)) : price;
    const discountFrom = body.discount_from !== undefined ? body.discount_from : -1;
    const discountTo = body.discount_to !== undefined ? body.discount_to : -1;
    const discountReason = body.discount_reason || '';

    try {
        const db = new Database(serverDbPath);
        const stmt = db.prepare(`
            UPDATE purchase 
            SET price = ?, orig_price = ?, discount_from = ?, discount_to = ?, discount_reason = ?
            WHERE purchase_name = ?
        `);
        const info = stmt.run(price, origPrice, discountFrom, discountTo, discountReason, body.purchase_name);
        db.close();

        if (info.changes === 0) {
            throw createError({
                statusCode: 404,
                statusMessage: `Item '${body.purchase_name}' not found in store`,
            });
        }

        // Automatically sync update to VPS celest-server database
        const vpsResult = await syncStoreUpdateToVps(
            body.purchase_name,
            price,
            origPrice,
            discountFrom,
            discountTo,
            discountReason
        );

        return {
            success: true,
            purchase_name: body.purchase_name,
            price,
            orig_price: origPrice,
            discount_from: discountFrom,
            discount_to: discountTo,
            discount_reason: discountReason,
            synced_vps: vpsResult.synced_vps,
            vps_message: vpsResult.message,
            vps_error: vpsResult.error,
        };
    } catch (err: any) {
        throw createError({
            statusCode: 500,
            statusMessage: err.message || 'Failed to update store item',
        });
    }
});

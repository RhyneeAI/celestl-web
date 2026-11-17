import Database from 'better-sqlite3';
import { getServerDbPath } from '../../../utils/server-paths.ts';

export interface StorePurchaseItem {
    purchase_name: string;
    price: number;
    orig_price: number;
    discount_reason: string | null;
}

export default defineEventHandler(async () => {
    const serverDbPath = getServerDbPath();
    
    if (!serverDbPath) {
        return {
            items: [] as StorePurchaseItem[],
            total: 0,
            message: 'Arcaea server database not found'
        };
    }

    try {
        const db = new Database(serverDbPath, { readonly: true });
        const purchases = db.prepare('SELECT * FROM purchase ORDER BY price DESC').all() as StorePurchaseItem[];
        db.close();

        return {
            total: purchases.length,
            items: purchases
        };
    } catch (e: any) {
        return {
            items: [] as StorePurchaseItem[],
            total: 0,
            error: e.message
        };
    }
});

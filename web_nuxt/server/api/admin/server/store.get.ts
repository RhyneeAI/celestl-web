import Database from 'better-sqlite3';
import { getServerDbPath } from '../../../utils/server-paths.ts';

export default defineEventHandler(async () => {
    const serverDbPath = getServerDbPath();
    
    if (!serverDbPath) {
        return {
            items: [],
            total: 0,
            message: 'Arcaea server database not found'
        };
    }

    try {
        const db = new Database(serverDbPath, { readonly: true });
        const purchases = db.prepare('SELECT * FROM purchase ORDER BY price DESC').all();
        db.close();

        return {
            total: purchases.length,
            items: purchases
        };
    } catch (e: any) {
        return {
            items: [],
            total: 0,
            error: e.message
        };
    }
});

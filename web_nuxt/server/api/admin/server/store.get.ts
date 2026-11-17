import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

export default defineEventHandler(async () => {
    const serverDbPath = path.resolve(process.cwd(), '../ArcaeaServerFork/database/arcaea_database.db');
    
    if (!fs.existsSync(serverDbPath)) {
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

import { defineEventHandler } from 'h3';
// @ts-ignore: better-sqlite3 uses export = Database CommonJS syntax
import Database from 'better-sqlite3';
import { getServerDbPath } from '../../../../utils/server-paths.ts';
import { fetchPresentsFromVps } from '../../../../utils/vps-sync.ts';

export interface PresentRewardItem {
    itemId: string;
    type: string;
    amount: number;
}

export interface AdminPresentItem {
    presentId: string;
    description: string;
    expireTs: number;
    expireDate: string;
    isExpired: boolean;
    deliveredCount: number;
    items: PresentRewardItem[];
}

export default defineEventHandler(async () => {
    // 1. Try fetching live data directly from VPS database
    const vpsPresents = await fetchPresentsFromVps();
    if (vpsPresents !== null) {
        return {
            success: true,
            total: vpsPresents.length,
            presents: vpsPresents,
            source: 'vps',
        };
    }

    // 2. Fallback to local database
    const dbPath = getServerDbPath();
    if (!dbPath) {
        return { success: false, error: 'Server database not found', presents: [] };
    }

    try {
        const db = new Database(dbPath, { readonly: true });

        // Fetch all presents
        const presentsRows = db.prepare('SELECT present_id, expire_ts, description FROM present ORDER BY expire_ts DESC').all() as any[];

        // Fetch present items
        const itemsRows = db.prepare('SELECT present_id, item_id, type, amount FROM present_item').all() as any[];
        const itemsMap = new Map<string, PresentRewardItem[]>();
        for (const it of itemsRows) {
            if (!itemsMap.has(it.present_id)) itemsMap.set(it.present_id, []);
            itemsMap.get(it.present_id)!.push({
                itemId: it.item_id,
                type: it.type || 'single',
                amount: it.amount ?? 1,
            });
        }

        // Fetch recipient counts
        const countRows = db.prepare('SELECT present_id, COUNT(DISTINCT user_id) as c FROM user_present GROUP BY present_id').all() as any[];
        const countMap = new Map<string, number>();
        for (const c of countRows) {
            countMap.set(c.present_id, c.c);
        }

        db.close();

        const now = Date.now();
        const presents: AdminPresentItem[] = presentsRows.map((r) => {
            const exp = typeof r.expire_ts === 'number' ? r.expire_ts : 0;
            return {
                presentId: r.present_id,
                description: r.description || 'No description',
                expireTs: exp,
                expireDate: exp > 0 ? new Date(exp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never',
                isExpired: exp > 0 && exp < now,
                deliveredCount: countMap.get(r.present_id) ?? 0,
                items: itemsMap.get(r.present_id) ?? [],
            };
        });

        return {
            success: true,
            total: presents.length,
            activeCount: presents.filter(p => !p.isExpired).length,
            presents,
        };
    } catch (err: any) {
        return {
            success: false,
            error: err.message || 'Failed to fetch presents',
            presents: [],
        };
    }
});

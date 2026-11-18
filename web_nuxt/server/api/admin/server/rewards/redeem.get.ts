import { defineEventHandler } from 'h3';
// @ts-ignore: better-sqlite3 uses export = Database CommonJS syntax
import Database from 'better-sqlite3';
import { getServerDbPath } from '../../../../utils/server-paths.ts';
import { fetchRedeemCodesFromVps } from '../../../../utils/vps-sync.ts';

export interface RedeemRewardItem {
    itemId: string;
    type: string;
    amount: number;
}

export interface AdminRedeemItem {
    code: string;
    type: number; // 0 = Single-use globally, 1 = 1x per player
    typeLabel: string;
    items: RedeemRewardItem[];
    claimedCount: number;
    claimedUsers: Array<{
        userId: number;
        name: string;
    }>;
}

export default defineEventHandler(async () => {
    // 1. Try fetching live data directly from VPS database
    const vpsCodes = await fetchRedeemCodesFromVps();
    if (vpsCodes !== null) {
        return {
            success: true,
            total: vpsCodes.length,
            codes: vpsCodes,
            source: 'vps',
        };
    }

    // 2. Fallback to local database
    const dbPath = getServerDbPath();
    if (!dbPath) {
        return { success: false, error: 'Server database not found', codes: [] };
    }

    try {
        const db = new Database(dbPath, { readonly: true });

        // Fetch redeem table
        const redeemRows = db.prepare('SELECT code, type FROM redeem').all() as any[];

        // Fetch items per code
        const itemsRows = db.prepare('SELECT code, item_id, type, amount FROM redeem_item').all() as any[];
        const itemsMap = new Map<string, RedeemRewardItem[]>();
        for (const it of itemsRows) {
            if (!itemsMap.has(it.code)) itemsMap.set(it.code, []);
            itemsMap.get(it.code)!.push({
                itemId: it.item_id,
                type: it.type || 'single',
                amount: it.amount ?? 1,
            });
        }

        // Fetch claims per code with user name
        const claimsRows = db.prepare(`
            SELECT ur.code, ur.user_id, u.name 
            FROM user_redeem ur 
            LEFT JOIN user u ON ur.user_id = u.user_id
        `).all() as any[];

        const claimsMap = new Map<string, Array<{ userId: number; name: string }>>();
        for (const c of claimsRows) {
            if (!claimsMap.has(c.code)) claimsMap.set(c.code, []);
            claimsMap.get(c.code)!.push({
                userId: c.user_id,
                name: c.name || `User ${c.user_id}`,
            });
        }

        db.close();

        const codes: AdminRedeemItem[] = redeemRows.map((r) => {
            const claims = claimsMap.get(r.code) ?? [];
            return {
                code: r.code,
                type: r.type ?? 0,
                typeLabel: r.type === 1 ? '1x per Player' : 'Single Use (Global)',
                items: itemsMap.get(r.code) ?? [],
                claimedCount: claims.length,
                claimedUsers: claims,
            };
        });

        return {
            success: true,
            total: codes.length,
            codes,
        };
    } catch (err: any) {
        return {
            success: false,
            error: err.message || 'Failed to fetch redeem codes',
            codes: [],
        };
    }
});

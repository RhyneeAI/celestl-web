import Database from 'better-sqlite3';
import fs from 'fs';
import { getServerDbPath, getServerSonglistPath, getPacklistPath } from '../../../utils/server-paths.ts';

export interface PurchaseDetailItem {
    item_id: string;
    type: 'single' | 'pack' | 'character' | 'core' | string;
    amount: number;
    name: string;
}

export interface StoreItemPayload {
    purchase_name: string;
    title: string;
    artist?: string;
    category: 'pack' | 'single' | 'other';
    price: number;
    orig_price: number;
    discount_from: number;
    discount_to: number;
    discount_reason: string | null;
    is_on_sale: boolean;
    discount_percent: number;
    jacket_url?: string;
    items: PurchaseDetailItem[];
}

export default defineEventHandler(async () => {
    const serverDbPath = getServerDbPath();
    if (!serverDbPath) {
        return {
            items: [] as StoreItemPayload[],
            total: 0,
            counts: { all: 0, packs: 0, singles: 0, onSale: 0 },
            message: 'Arcaea server database not found',
        };
    }

    try {
        const db = new Database(serverDbPath, { readonly: true });
        const purchases = db.prepare('SELECT purchase_name, price, orig_price, discount_from, discount_to, discount_reason FROM purchase ORDER BY price DESC, purchase_name ASC').all() as any[];
        const purchaseItems = db.prepare('SELECT purchase_name, item_id, type, amount FROM purchase_item').all() as any[];
        const characters = db.prepare('SELECT character_id, name FROM character').all() as any[];
        db.close();

        // 1. Build character names lookup
        const charMap = new Map<string, string>();
        for (const c of characters) {
            charMap.set(c.name.toLowerCase(), c.name);
        }

        // 2. Build songs lookup from songlist
        const songMap = new Map<string, { title: string; artist: string }>();
        const songlistPath = getServerSonglistPath();
        if (songlistPath && fs.existsSync(songlistPath)) {
            try {
                const sdata = JSON.parse(fs.readFileSync(songlistPath, 'utf8'));
                for (const s of sdata.songs || []) {
                    songMap.set(s.id, {
                        title: s.title_localized?.en || s.id,
                        artist: s.artist || '',
                    });
                }
            } catch (err) {
                console.error('[Store API] Failed to parse songlist:', err);
            }
        }

        // 3. Build packs lookup from packlist.json
        const packMap = new Map<string, string>();
        const packlistPath = getPacklistPath();
        if (packlistPath && fs.existsSync(packlistPath)) {
            try {
                const pdata = JSON.parse(fs.readFileSync(packlistPath, 'utf8'));
                for (const p of pdata.packs || []) {
                    packMap.set(p.id, p.custom_name || p.name_localized?.en || p.id);
                }
            } catch (err) {
                console.error('[Store API] Failed to parse packlist:', err);
            }
        }

        // 4. Custom packs metadata mapping
        const CUSTOM_PACK_METAS: Record<string, { title: string; image: string }> = {
            yue: {
                title: "Yue's Collection",
                image: '/storage/packs/yue.png',
            },
            kurumi: {
                title: 'Kurumi',
                image: '/storage/packs/kurumi.png',
            },
            wanderlust: {
                title: 'Wanderlust Eternal',
                image: '/storage/packs/wanderlust.png',
            },
        };

        // 5. Group purchase items by purchase_name
        const itemGroups = new Map<string, PurchaseDetailItem[]>();
        for (const pi of purchaseItems) {
            let itemName = pi.item_id;
            if (pi.type === 'single') {
                const song = songMap.get(pi.item_id);
                itemName = song ? song.title : pi.item_id;
            } else if (pi.type === 'pack') {
                itemName = CUSTOM_PACK_METAS[pi.item_id.toLowerCase()]?.title || packMap.get(pi.item_id) || pi.item_id;
            } else if (pi.type === 'character') {
                itemName = charMap.get(pi.item_id.toLowerCase()) || pi.item_id;
            } else if (pi.type === 'core') {
                itemName = `${pi.amount}x ${pi.item_id === 'core_generic' ? 'Awakening Core' : pi.item_id}`;
            }

            if (!itemGroups.has(pi.purchase_name)) {
                itemGroups.set(pi.purchase_name, []);
            }
            itemGroups.get(pi.purchase_name)!.push({
                item_id: pi.item_id,
                type: pi.type,
                amount: pi.amount,
                name: itemName,
            });
        }

        // 6. Build enriched store items (omitting official vanilla packs)
        const enriched: StoreItemPayload[] = [];
        let packCount = 0;
        let singleCount = 0;
        let onSaleCount = 0;

        for (const p of purchases) {
            const items = itemGroups.get(p.purchase_name) || [];
            const types = items.map((it) => it.type);
            const isPack = types.includes('pack');
            const isSingle = types.includes('single');

            // Filter out official packs: only custom packs (yue, kurumi, wanderlust) and custom songs
            if (isPack) {
                const isCustomPack = Boolean(CUSTOM_PACK_METAS[p.purchase_name.toLowerCase()]);
                if (!isCustomPack) {
                    continue; // Skip official pack
                }
            }

            const category: 'pack' | 'single' | 'other' = isPack
                ? 'pack'
                : isSingle
                ? 'single'
                : 'other';

            if (category === 'pack') packCount++;
            else if (category === 'single') singleCount++;

            const isOnSale = p.price < p.orig_price;
            if (isOnSale) onSaleCount++;

            const discountPercent = isOnSale && p.orig_price > 0
                ? Math.round((1 - p.price / p.orig_price) * 100)
                : 0;

            // Determine display title & artist
            let displayTitle = p.purchase_name;
            let artist: string | undefined;
            let jacketUrl: string | undefined;

            if (category === 'single') {
                const songItem = items.find((it) => it.type === 'single');
                const sid = songItem ? songItem.item_id : p.purchase_name;
                const sMeta = songMap.get(sid);
                displayTitle = sMeta ? sMeta.title : p.purchase_name;
                artist = sMeta?.artist;
                jacketUrl = `/api/jacket/${sid}`;
            } else if (category === 'pack') {
                const customMeta = CUSTOM_PACK_METAS[p.purchase_name.toLowerCase()];
                displayTitle = customMeta?.title || packMap.get(p.purchase_name) || p.purchase_name;
                artist = 'Arcaea Custom Pack';
                jacketUrl = customMeta?.image || `/storage/packs/${p.purchase_name}.png`;
            }

            enriched.push({
                purchase_name: p.purchase_name,
                title: displayTitle,
                artist,
                category,
                price: p.price,
                orig_price: p.orig_price,
                discount_from: p.discount_from,
                discount_to: p.discount_to,
                discount_reason: p.discount_reason || null,
                is_on_sale: isOnSale,
                discount_percent: discountPercent,
                jacket_url: jacketUrl,
                items,
            });
        }

        return {
            total: enriched.length,
            counts: {
                all: enriched.length,
                packs: packCount,
                singles: singleCount,
                onSale: onSaleCount,
            },
            items: enriched,
        };
    } catch (e: any) {
        console.error('[Store API Error]:', e);
        return {
            items: [] as StoreItemPayload[],
            total: 0,
            counts: { all: 0, packs: 0, singles: 0, onSale: 0 },
            error: e.message,
        };
    }
});

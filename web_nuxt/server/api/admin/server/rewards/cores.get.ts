import { defineEventHandler } from 'h3';
// @ts-ignore: better-sqlite3 uses export = Database CommonJS syntax
import Database from 'better-sqlite3';
import { getServerDbPath } from '../../../../utils/server-paths.ts';

export interface CoreOption {
    id: string;
    label: string;
}

const CORE_LABELS: Record<string, string> = {
    core_generic: 'Ether Drop (core_generic)',
    core_course_skip_purchase: 'Course Skip / Bypass (core_course_skip_purchase)',
};

function formatCoreLabel(id: string): string {
    if (CORE_LABELS[id]) return CORE_LABELS[id];
    const name = id.replace(/^core_/, '').replace(/_/g, ' ');
    const titled = name.replace(/\b\w/g, (c) => c.toUpperCase());
    return `${titled} Core (${id})`;
}

export default defineEventHandler(async () => {
    const dbPath = getServerDbPath();
    if (!dbPath) {
        return { success: false, cores: [] as CoreOption[] };
    }

    try {
        const db = new Database(dbPath, { readonly: true });
        const rows = db
            .prepare("SELECT item_id FROM item WHERE type = 'core' AND is_available = 1 ORDER BY item_id ASC")
            .all() as Array<{ item_id: string }>;
        db.close();

        const cores: CoreOption[] = rows.map((r) => ({
            id: r.item_id,
            label: formatCoreLabel(r.item_id),
        }));

        return { success: true, cores };
    } catch (err: any) {
        return { success: false, cores: [] as CoreOption[], error: err.message };
    }
});


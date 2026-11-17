import { db, schema } from '../../database/index';
import { eq, isNull } from 'drizzle-orm';

export default defineEventHandler(async () => {
    const allPacks = db.select().from(schema.officialPacks).all();
    const allSongs = db.select({
        id: schema.officialSongs.id,
        packId: schema.officialSongs.packId,
    }).from(schema.officialSongs).all();

    const songCountByPack = new Map<number, number>();
    for (const s of allSongs) {
        if (s.packId) {
            songCountByPack.set(s.packId, (songCountByPack.get(s.packId) || 0) + 1);
        }
    }

    // Organize into parent and children
    const parentPacks = allPacks.filter(p => !p.parentId);
    const childrenByParent = new Map<number, typeof allPacks>();
    for (const p of allPacks) {
        if (p.parentId) {
            if (!childrenByParent.has(p.parentId)) {
                childrenByParent.set(p.parentId, []);
            }
            childrenByParent.get(p.parentId)!.push({
                ...p,
                songCount: songCountByPack.get(p.id) || 0,
            } as any);
        }
    }

    const sections: Record<string, any[]> = {};
    for (const p of parentPacks) {
        const sec = p.section || 'Other';
        if (!sections[sec]) {
            sections[sec] = [];
        }
        sections[sec].push({
            ...p,
            songCount: songCountByPack.get(p.id) || 0,
            children: childrenByParent.get(p.id) || [],
        });
    }

    return {
        sections
    };
});

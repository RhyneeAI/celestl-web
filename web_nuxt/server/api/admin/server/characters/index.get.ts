import { defineEventHandler } from 'h3';
// @ts-ignore: better-sqlite3 uses export = Database CommonJS syntax
import Database from 'better-sqlite3';
import { getServerDbPath } from '../../../../utils/server-paths.ts';

export interface AdminCharacterItem {
    characterId: number;
    name: string;
    displayName: string;
    maxLevel: number;
    isUncapped: boolean;
    skillId: string;
    skillUnlockLevel: number;
    skillIdUncap: string;
    charType: number;
    activeUsersCount: number;
    stats: {
        frag1: number;
        prog1: number;
        overdrive1: number;
        frag20: number;
        prog20: number;
        overdrive20: number;
        frag30: number;
        prog30: number;
        overdrive30: number;
    };
    iconNormal: string;
    iconUncapped: string;
}

export default defineEventHandler(async () => {
    const dbPath = getServerDbPath();
    if (!dbPath) {
        return { success: false, error: 'Server database not found', characters: [] };
    }

    try {
        const db = new Database(dbPath, { readonly: true });

        // Count users using each character
        const userCounts = new Map<number, number>();
        try {
            const counts = db.prepare('SELECT character_id, COUNT(*) as c FROM user GROUP BY character_id').all() as Array<{ character_id: number; c: number }>;
            for (const row of counts) {
                userCounts.set(row.character_id, row.c);
            }
        } catch {}

        const rows = db.prepare(`
            SELECT 
                character_id, name, max_level, 
                frag1, prog1, overdrive1, 
                frag20, prog20, overdrive20, 
                frag30, prog30, overdrive30, 
                skill_id, skill_unlock_level, skill_requires_uncap, skill_id_uncap, 
                char_type, is_uncapped 
            FROM character 
            ORDER BY character_id ASC
        `).all() as any[];

        db.close();

        const characters: AdminCharacterItem[] = rows.map((r) => {
            const id = r.character_id;
            const rawName = r.name || `Partner ${id}`;
            const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1).replace(/_/g, ' ');

            return {
                characterId: id,
                name: rawName,
                displayName,
                maxLevel: r.max_level ?? 20,
                isUncapped: Boolean(r.is_uncapped),
                skillId: r.skill_id || 'none',
                skillUnlockLevel: r.skill_unlock_level ?? 0,
                skillIdUncap: r.skill_id_uncap || '',
                charType: r.char_type ?? 0,
                activeUsersCount: userCounts.get(id) ?? 0,
                stats: {
                    frag1: Number(r.frag1 ?? 0),
                    prog1: Number(r.prog1 ?? 0),
                    overdrive1: Number(r.overdrive1 ?? 0),
                    frag20: Number(r.frag20 ?? 0),
                    prog20: Number(r.prog20 ?? 0),
                    overdrive20: Number(r.overdrive20 ?? 0),
                    frag30: Number(r.frag30 ?? 0),
                    prog30: Number(r.prog30 ?? 0),
                    overdrive30: Number(r.overdrive30 ?? 0),
                },
                iconNormal: `/storage/characters/${id}_icon.png`,
                iconUncapped: `/storage/characters/${id}u_icon.png`,
            };
        });

        return {
            success: true,
            total: characters.length,
            uncappedCount: characters.filter(c => c.isUncapped).length,
            characters,
        };
    } catch (err: any) {
        return {
            success: false,
            error: err.message || 'Failed to fetch characters',
            characters: [],
        };
    }
});

import { defineEventHandler } from 'h3';
// @ts-ignore: better-sqlite3 uses export = Database CommonJS syntax
import Database from 'better-sqlite3';
import { getServerDbPath } from '../../../../utils/server-paths.ts';
import { fetchCharactersFromVps } from '../../../../utils/vps-sync.ts';
import {
    getCharacterSkillInfo,
    getCharacterTypeInfo,
    getCharacterMeta,
    getCharacterPortraits,
    formatCharacterDisplayName,
    type CharacterSkillInfo,
    type CharacterTypeInfo,
    type UncapCoreInfo,
} from '../../../../utils/characters-meta.ts';

export interface AdminCharacterItem {
    characterId: number;
    name: string;
    displayName: string;
    searchStrings: string[];
    charType: number;
    charTypeInfo: CharacterTypeInfo;
    maxLevel: number;
    isUncapped: boolean;
    skillId: string;
    skillInfo: CharacterSkillInfo;
    skillUnlockLevel: number;
    skillIdUncap: string;
    skillUncapInfo: CharacterSkillInfo;
    uncapCores: UncapCoreInfo[];
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
    portraitNormal: string;
    portraitUncapped: string;
    hasUncappedPortrait: boolean;
    portraitAlt: string;
    hasAltPortrait: boolean;
    iconNormal: string;
    iconUncapped: string;
    hasUncappedIcon: boolean;
}

export default defineEventHandler(async () => {
    let rows: any[] = [];
    const userCounts = new Map<number, number>();
    let dataSource: 'vps' | 'local' = 'local';

    // 1. Try fetching from live VPS first (Option A)
    try {
        const vpsRes = await fetchCharactersFromVps();
        if (vpsRes && Array.isArray(vpsRes.characters) && vpsRes.characters.length > 0) {
            rows = vpsRes.characters;
            dataSource = 'vps';
            if (vpsRes.userCounts) {
                for (const [cid, count] of Object.entries(vpsRes.userCounts)) {
                    userCounts.set(Number(cid), Number(count));
                }
            }
        }
    } catch (vpsErr) {
        console.warn('[Characters API] VPS fetch failed, falling back to local DB:', vpsErr);
    }

    // 2. Fallback to local SQLite database if VPS failed or returned empty
    if (rows.length === 0) {
        const dbPath = getServerDbPath();
        if (!dbPath) {
            return {
                success: false,
                error: 'Server database not found',
                characters: [],
                total: 0,
                uncappedCount: 0,
                dataSource,
            };
        }

        try {
            const db = new Database(dbPath, { readonly: true });

            try {
                const counts = db.prepare('SELECT character_id, COUNT(*) as c FROM user GROUP BY character_id').all() as Array<{ character_id: number; c: number }>;
                for (const row of counts) {
                    userCounts.set(row.character_id, row.c);
                }
            } catch {}

            rows = db.prepare(`
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
            dataSource = 'local';
        } catch (dbErr: any) {
            return {
                success: false,
                error: dbErr.message || 'Failed to query local database',
                characters: [],
                total: 0,
                uncappedCount: 0,
                dataSource,
            };
        }
    }

    // 3. Assemble rich character objects
    const characters: AdminCharacterItem[] = rows.map((r) => {
        const id = Number(r.character_id);
        const rawName = r.name || `Partner ${id}`;
        const displayName = formatCharacterDisplayName(rawName, id);
        const meta = getCharacterMeta(id);
        const portraits = getCharacterPortraits(id);
        const charType = Number(r.char_type ?? 0);
        const charTypeInfo = getCharacterTypeInfo(charType);
        const skillInfo = getCharacterSkillInfo(r.skill_id || '');
        const skillUncapInfo = getCharacterSkillInfo(r.skill_id_uncap || '');

        return {
            characterId: id,
            name: rawName,
            displayName,
            searchStrings: meta.searchStrings,
            charType,
            charTypeInfo,
            maxLevel: Number(r.max_level ?? 20),
            isUncapped: Boolean(r.is_uncapped),
            skillId: r.skill_id || 'none',
            skillInfo,
            skillUnlockLevel: Number(r.skill_unlock_level ?? 0),
            skillIdUncap: r.skill_id_uncap || '',
            skillUncapInfo,
            uncapCores: meta.uncapCores,
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
            ...portraits,
        };
    });

    return {
        success: true,
        total: characters.length,
        uncappedCount: characters.filter(c => c.isUncapped).length,
        dataSource,
        characters,
    };
});

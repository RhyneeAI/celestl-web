import fs from 'fs';
import path from 'path';
import { db, schema } from './index.ts';
import { eq } from 'drizzle-orm';

function getRootDataDir(): string {
    const candidates = [
        path.resolve(process.cwd(), 'data'),
        path.resolve(process.cwd(), '../data'),
    ];
    for (const c of candidates) {
        if (fs.existsSync(c)) return c;
    }
    return candidates[0] || path.resolve(process.cwd(), 'data');
}

const ROOT_DATA_DIR = getRootDataDir();

const SECTION_LABELS: Record<string, string> = {
    arcaea: 'Arcaea',
    mainstory: 'Main Story · Act I',
    mainstory2: 'Main Story · Act II',
    sidestory: 'Side Story',
    collab: 'Collaboration',
    variety: 'Variety',
};

const SIDE_LABELS: Record<number, string> = {
    0: 'Light',
    1: 'Conflict',
    2: 'Colorless',
    3: 'Lephon',
    4: 'Catastrophe',
};

function fromRatingClass(ratingClass: number, ratingClassAlias?: number): string {
    if (ratingClassAlias === 1) return 'INS';
    switch (ratingClass) {
        case 0: return 'PST';
        case 1: return 'PRS';
        case 2: return 'FTR';
        case 3: return 'BYD';
        case 4: return 'ETR';
        case 5: return 'INS';
        default: return 'FTR';
    }
}

function readJson<T>(filename: string): T {
    const fullPath = path.join(ROOT_DATA_DIR, filename);
    if (!fs.existsSync(fullPath)) {
        console.warn(`[WARN] Missing file ${filename}, returning default.`);
        return {} as T;
    }
    return JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
}

async function seed() {
    console.log('[*] Starting seed for Official Arcaea Catalog into SQLite...');

    // 1. Ensure game exists
    let game = db.select().from(schema.officialGames).where(eq(schema.officialGames.slug, 'arcaea')).get();
    if (!game) {
        const res = db.insert(schema.officialGames).values({ slug: 'arcaea', name: 'Arcaea' }).returning().get();
        game = res;
    }

    const packlistRaw = readJson<{ packs: any[] }>('packlist.json').packs || [];
    const songlistRaw = readJson<{ songs: any[] }>('songlist.json').songs || [];
    const chartconstant = readJson<Record<string, Record<string, { constant: number }>>>('chartconstant.json');
    const notecount = readJson<{ notes: Record<string, Record<string, number>> }>('notecount.json').notes || {};
    const songlength = readJson<Record<string, number>>('songlength.json');
    const others = readJson<{ deleted?: any[]; special?: any[] }>('songlistothers.json');

    // 2. Insert packs
    const packSlugToId: Record<string, number> = {};
    for (const p of packlistRaw) {
        const slug = p.id;
        const name = p.name_localized?.en || p.id;
        const section = SECTION_LABELS[p.section] || 'Other';
        const smallPackImage = Boolean(p.small_pack_image);

        let pack = db.select().from(schema.officialPacks).where(eq(schema.officialPacks.slug, slug)).get();
        if (!pack) {
            pack = db.insert(schema.officialPacks).values({
                gameId: game.id,
                slug,
                name,
                section,
                smallPackImage,
            }).returning().get();
        }
        packSlugToId[slug] = pack.id;
    }

    // Pass 2: wire up parent_id
    for (const p of packlistRaw) {
        if (p.pack_parent && packSlugToId[p.pack_parent]) {
            db.update(schema.officialPacks)
                .set({ parentId: packSlugToId[p.pack_parent] })
                .where(eq(schema.officialPacks.slug, p.id))
                .run();
        }
    }

    // Synthetic April Fools pack
    let aprilPack = db.select().from(schema.officialPacks).where(eq(schema.officialPacks.slug, 'aprilfools')).get();
    if (!aprilPack) {
        aprilPack = db.insert(schema.officialPacks).values({
            gameId: game.id,
            slug: 'aprilfools',
            name: 'April Fools',
            section: 'Other',
            smallPackImage: false,
        }).returning().get();
    }
    packSlugToId['aprilfools'] = aprilPack.id;

    // 3. Insert songs and charts
    let songCount = 0;
    let chartCount = 0;

    const allSongs = [...songlistRaw, ...(others.special || [])];

    for (const s of allSongs) {
        if (s.deleted || !s.difficulties) {
            continue;
        }

        const packId = packSlugToId[s.set] || null;
        const slug = s.id;
        const title = s.title_localized?.en || s.id;
        const titleLocalized = JSON.stringify(s.title_localized || {});
        const artist = s.artist || '';
        const side = SIDE_LABELS[s.side ?? -1] || null;
        const bpm = s.bpm || null;
        const length = songlength[s.id] || null;
        const version = s.version || null;
        const releasedAt = s.date ? new Date(s.date * 1000).toISOString().split('T')[0] : null;

        let song = db.select().from(schema.officialSongs).where(eq(schema.officialSongs.slug, slug)).get();
        if (!song) {
            song = db.insert(schema.officialSongs).values({
                gameId: game.id,
                packId,
                slug,
                title,
                titleLocalized,
                artist,
                side,
                bpm,
                length,
                version,
                releasedAt,
            }).returning().get();
            songCount++;
        }

        const songConstants = chartconstant[s.id] || {};
        const songNotes = notecount[s.id] || {};

        for (const diff of s.difficulties) {
            const diffCode = fromRatingClass(diff.ratingClass, diff.ratingClassAlias);
            let level = String(diff.rating);
            if (diff.ratingPlus) {
                level += '+';
            }

            const constEntry = songConstants[String(diff.ratingClass)];
            const noteCountVal = diff.notes || songNotes[String(diff.ratingClass)] || null;

            const existingChart = db.select().from(schema.officialCharts)
                .where(eq(schema.officialCharts.songId, song.id))
                .all()
                .find(c => c.difficulty === diffCode);

            if (!existingChart) {
                db.insert(schema.officialCharts).values({
                    songId: song.id,
                    difficulty: diffCode,
                    level,
                    constant: constEntry ? constEntry.constant : null,
                    ratingPlus: Boolean(diff.ratingPlus),
                    chartDesigner: diff.chartDesigner || null,
                    jacketDesigner: diff.jacketDesigner || null,
                    noteCount: noteCountVal,
                    gameVersion: version,
                }).run();
                chartCount++;
            }
        }
    }

    const totalSongs = db.select().from(schema.officialSongs).all().length;
    const totalCharts = db.select().from(schema.officialCharts).all().length;
    console.log(`[+] Seed complete! Inserted ${songCount} new songs, ${chartCount} new charts. Database now has ${Object.keys(packSlugToId).length} packs, ${totalSongs} songs, ${totalCharts} charts.`);
}

seed().catch(err => {
    console.error('Seed failed:', err);
    process.exit(1);
});

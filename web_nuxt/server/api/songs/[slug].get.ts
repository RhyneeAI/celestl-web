import fs from 'fs';
import path from 'path';
import { db, schema } from '../../database/index';
import { eq } from 'drizzle-orm';
import { getServerSonglistPath, getSongPackageLocation, getOggDurationFormatted } from '../../utils/server-paths.ts';

function getDiffCode(rc: number): string {
    switch (rc) {
        case 0: return 'PST';
        case 1: return 'PRS';
        case 2: return 'FTR';
        case 3: return 'BYD';
        case 4: return 'ETR';
        case 5: return 'INS';
        default: return `RC${rc}`;
    }
}

export default defineEventHandler(async (event) => {
    const slug = getRouterParam(event, 'slug');
    if (!slug) {
        throw createError({ statusCode: 400, message: 'Missing song slug' });
    }

    const officialPkg = getSongPackageLocation(slug, 'official');
    const songDir = officialPkg?.dir || null;
    const hasServerPackage = Boolean(officialPkg);

    const song = db.select({
        id: schema.officialSongs.id,
        slug: schema.officialSongs.slug,
        title: schema.officialSongs.title,
        titleLocalized: schema.officialSongs.titleLocalized,
        artist: schema.officialSongs.artist,
        composer: schema.officialSongs.composer,
        jacketDesigner: schema.officialSongs.jacketDesigner,
        side: schema.officialSongs.side,
        bpm: schema.officialSongs.bpm,
        length: schema.officialSongs.length,
        version: schema.officialSongs.version,
        releasedAt: schema.officialSongs.releasedAt,
        jacketPath: schema.officialSongs.jacketPath,
        jacketThumbPath: schema.officialSongs.jacketThumbPath,
        packSlug: schema.officialPacks.slug,
        packName: schema.officialPacks.name,
    })
    .from(schema.officialSongs)
    .leftJoin(schema.officialPacks, eq(schema.officialSongs.packId, schema.officialPacks.id))
    .where(eq(schema.officialSongs.slug, slug))
    .get();

    if (song) {
        let length = song.length;
        if (!length && songDir) {
            length = getOggDurationFormatted(path.join(songDir, 'base.ogg'));
        }

        const charts = db.select().from(schema.officialCharts)
            .where(eq(schema.officialCharts.songId, song.id))
            .all()
            .sort((a, b) => {
                const order = ['PST', 'PRS', 'FTR', 'BYD', 'ETR', 'INS'];
                return order.indexOf(a.difficulty) - order.indexOf(b.difficulty);
            });

        return {
            song: {
                ...song,
                length,
                hasServerPackage,
                isOfficial: true,
                packageSource: officialPkg?.source || null,
                packagePath: officialPkg?.relativePath || null,
            },
            charts
        };
    }

    // Fallback: Check Celest Server songlist for custom charts
    const songlistPath = getServerSonglistPath();
    if (songlistPath && fs.existsSync(songlistPath)) {
        try {
            const raw = JSON.parse(fs.readFileSync(songlistPath, 'utf-8'));
            const s = (raw.songs || []).find((item: any) => item.id === slug || item.id === slug.toLowerCase());
            if (s) {
                const unofficialPkg = getSongPackageLocation(s.id, 'unofficial');
                const targetDir = unofficialPkg?.dir || null;
                let length = null;
                if (targetDir) {
                    length = getOggDurationFormatted(path.join(targetDir, 'base.ogg'));
                }

                const order = ['PST', 'PRS', 'FTR', 'BYD', 'ETR', 'INS'];
                const customCharts = (s.difficulties || []).map((d: any) => ({
                    difficulty: getDiffCode(d.ratingClass),
                    level: `${d.rating}${d.ratingPlus ? '+' : ''}`,
                    constant: d.constant ?? d.rating,
                    chartDesigner: d.chartDesigner || '-',
                    jacketDesigner: d.jacketDesigner || '',
                    noteCount: null,
                })).sort((a: any, b: any) => order.indexOf(a.difficulty) - order.indexOf(b.difficulty));

                const sideText =
                    s.side === 0 ? 'Light' :
                    s.side === 1 ? 'Conflict' :
                    s.side === 2 ? 'Colorless' :
                    s.side === 3 ? 'Lephon' :
                    s.side === 4 ? 'Catastrophe' : 'Other';

                const customSong = {
                    id: 100000 + (s.date || 0),
                    slug: s.id,
                    title: s.title_localized?.en || s.id,
                    titleLocalized: JSON.stringify(s.title_localized || {}),
                    artist: s.artist || 'Unknown Artist',
                    composer: s.artist || 'Unknown Artist',
                    jacketDesigner: '',
                    side: sideText,
                    category: s.category || null,
                    sourceCopyright: s.source_copyright || null,
                    bpm: s.bpm || '—',
                    length,
                    version: s.version || '1.0',
                    releasedAt: s.date ? new Date(s.date * 1000).toISOString().split('T')[0] : null,
                    jacketPath: `/api/jacket/${s.id}`,
                    jacketThumbPath: `/api/jacket/${s.id}`,
                    packSlug: s.set || 'single',
                    packName: s.set ? `Celest • ${s.set}` : 'Celest Custom',
                    hasServerPackage: Boolean(unofficialPkg),
                    isOfficial: false,
                    packageSource: unofficialPkg?.source || null,
                    packagePath: unofficialPkg?.relativePath || null,
                };

                return {
                    song: customSong,
                    charts: customCharts,
                };
            }
        } catch {}
    }

    throw createError({ statusCode: 404, message: `Song '${slug}' not found` });
});

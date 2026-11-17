import { db, schema } from '../../database/index';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    const slug = getRouterParam(event, 'slug');
    if (!slug) {
        throw createError({ statusCode: 400, message: 'Missing song slug' });
    }

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

    if (!song) {
        throw createError({ statusCode: 404, message: `Song '${slug}' not found` });
    }

    const charts = db.select().from(schema.officialCharts)
        .where(eq(schema.officialCharts.songId, song.id))
        .all()
        .sort((a, b) => {
            const order = ['PST', 'PRS', 'FTR', 'BYD', 'ETR', 'INS'];
            return order.indexOf(a.difficulty) - order.indexOf(b.difficulty);
        });

    return {
        song,
        charts
    };
});

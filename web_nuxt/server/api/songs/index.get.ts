import { db, schema } from '../../database/index';
import { eq, like, or } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const search = query.q ? String(query.q).trim() : '';
    const packSlug = query.pack ? String(query.pack).trim() : '';

    let songList = db.select({
        id: schema.officialSongs.id,
        slug: schema.officialSongs.slug,
        title: schema.officialSongs.title,
        artist: schema.officialSongs.artist,
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
    .all();

    if (packSlug) {
        songList = songList.filter(s => s.packSlug === packSlug);
    }

    if (search) {
        const lower = search.toLowerCase();
        songList = songList.filter(s => 
            s.title.toLowerCase().includes(lower) || 
            s.artist.toLowerCase().includes(lower) ||
            s.slug.toLowerCase().includes(lower)
        );
    }

    // Attach chart difficulties for each song
    const allCharts = db.select().from(schema.officialCharts).all();
    const chartsBySongId = new Map<number, typeof allCharts>();
    for (const c of allCharts) {
        if (!chartsBySongId.has(c.songId)) {
            chartsBySongId.set(c.songId, []);
        }
        chartsBySongId.get(c.songId)!.push(c);
    }

    const results = songList.map(song => ({
        ...song,
        charts: (chartsBySongId.get(song.id) || []).sort((a, b) => {
            const order = ['PST', 'PRS', 'FTR', 'BYD', 'ETR', 'INS'];
            return order.indexOf(a.difficulty) - order.indexOf(b.difficulty);
        })
    }));

    return {
        total: results.length,
        songs: results
    };
});

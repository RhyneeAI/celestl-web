import { db, schema } from '../../database/index';

export default defineEventHandler(async () => {
    const config = useRuntimeConfig();

    const totalSongs = db.select().from(schema.officialSongs).all().length;
    const allCharts = db.select().from(schema.officialCharts).all();
    const totalCharts = allCharts.length;

    const difficultyBreakdown: Record<string, number> = {
        PST: 0, PRS: 0, FTR: 0, BYD: 0, ETR: 0, INS: 0
    };
    for (const c of allCharts) {
        const count = difficultyBreakdown[c.difficulty];
        if (count !== undefined) {
            difficultyBreakdown[c.difficulty] = count + 1;
        }
    }

    const recentSongs = db.select({
        id: schema.officialSongs.id,
        slug: schema.officialSongs.slug,
        title: schema.officialSongs.title,
        artist: schema.officialSongs.artist,
        version: schema.officialSongs.version,
        releasedAt: schema.officialSongs.releasedAt,
    })
    .from(schema.officialSongs)
    .orderBy(schema.officialSongs.releasedAt)
    .all()
    .filter(s => s.releasedAt)
    .reverse()
    .slice(0, 15);

    // Check ArcaeaServerFork connection
    let serverStatus = 'checking';
    try {
        const res = await fetch(`${config.arcaeaServerUrl}/`, { signal: AbortSignal.timeout(2000) });
        serverStatus = res.ok ? 'online' : `http_${res.status}`;
    } catch (e: any) {
        serverStatus = 'offline';
    }

    return {
        totalSongs,
        totalCharts,
        difficultyBreakdown,
        recentSongs,
        server: {
            url: config.arcaeaServerUrl,
            status: serverStatus
        }
    };
});


import https from 'https';
import http from 'http';
import { db, schema } from '../../database/index';

function checkServerHealth(serverUrl: string): Promise<string> {
    return new Promise((resolve) => {
        try {
            const url = new URL(serverUrl);
            const client = url.protocol === 'https:' ? https : http;
            const req = client.get(
                serverUrl,
                {
                    rejectUnauthorized: false,
                    timeout: 3000,
                },
                (res) => {
                    resolve(res.statusCode === 200 ? 'online' : `http_${res.statusCode}`);
                }
            );
            req.on('error', () => resolve('offline'));
            req.on('timeout', () => {
                req.destroy();
                resolve('offline');
            });
        } catch {
            resolve('offline');
        }
    });
}

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

    // Check ArcaeaServerFork connection (handles self-signed HTTPS)
    const serverUrl = config.arcaeaServerUrl || 'https://139.190.96.194:8765';
    const serverStatus = await checkServerHealth(serverUrl);

    return {
        totalSongs,
        totalCharts,
        difficultyBreakdown,
        recentSongs,
        server: {
            url: serverUrl,
            status: serverStatus
        }
    };
});


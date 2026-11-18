import { defineEventHandler, getRouterParam, createError, setHeader, getQuery } from 'h3';
import fs from 'fs';
import path from 'path';

export default defineEventHandler((event) => {
    const rawSongId = getRouterParam(event, 'songId') || '';
    let songId = rawSongId.replace(/\.(jpg|png|webp)$/i, '').trim();

    if (!songId) {
        throw createError({ statusCode: 400, statusMessage: 'Song ID is required' });
    }

    const query = getQuery(event);
    let diffParam = query.diff ?? query.rc ?? query.ratingClass;

    // Check if songId has a difficulty suffix, e.g. aegleseeker_3 or antithese_byd
    const suffixMatch = songId.match(/^(.+?)_(byd|etr|ftr|prs|pst|ins|[0-5])$/i);
    const matchedBase = suffixMatch?.[1];
    const matchedDiff = suffixMatch?.[2];
    if (matchedBase) {
        songId = matchedBase;
        if ((diffParam === undefined || diffParam === null || diffParam === '') && matchedDiff) {
            diffParam = matchedDiff;
        }
    }

    // Normalize difficulty into numeric ratingClass (0..5) and code string ('pst'..'ins')
    let rc: number | null = null;
    let code: string | null = null;
    if (diffParam !== undefined && diffParam !== null && diffParam !== '') {
        const s = String(diffParam).toLowerCase().trim();
        if (s === '0' || s === 'pst' || s === 'past') {
            rc = 0;
            code = 'pst';
        } else if (s === '1' || s === 'prs' || s === 'present') {
            rc = 1;
            code = 'prs';
        } else if (s === '2' || s === 'ftr' || s === 'future') {
            rc = 2;
            code = 'ftr';
        } else if (s === '3' || s === 'byd' || s === 'beyond') {
            rc = 3;
            code = 'byd';
        } else if (s === '4' || s === 'etr' || s === 'eternal') {
            rc = 4;
            code = 'etr';
        } else if (s === '5' || s === 'ins' || s === 'special') {
            rc = 5;
            code = 'ins';
        }
    }

    const songDirs = [
        path.resolve(process.cwd(), '../ArcaeaServerFork/database/songs', songId),
        path.resolve(process.cwd(), 'ArcaeaServerFork/database/songs', songId),
        path.resolve(process.cwd(), '../ArcaeaServerFork/database/songs', `dl_${songId}`),
        path.resolve(process.cwd(), 'ArcaeaServerFork/database/songs', `dl_${songId}`),
    ];

    const storageDirs = [
        path.resolve(process.cwd(), 'public/storage/jackets'),
        path.resolve(process.cwd(), 'web_nuxt/public/storage/jackets'),
        path.resolve(process.cwd(), '../web/storage/app/public/jackets'),
        path.resolve(process.cwd(), 'data/jackets'),
        path.resolve(process.cwd(), '../data/jackets'),
        path.resolve(process.cwd(), 'web_nuxt/data/jackets'),
        path.resolve(process.cwd(), 'server/database/data/jackets'),
    ];

    // 1. If difficulty is specified, search for difficulty-specific override jackets first
    if (rc !== null && code !== null) {
        // Check Arcaea server song folders for {rc}.jpg / 1080_{rc}.jpg (e.g. 3.jpg, 4.jpg)
        for (const dir of songDirs) {
            const files = [
                `1080_${rc}.jpg`,
                `${rc}.jpg`,
                `1080_${rc}.png`,
                `${rc}.png`,
                `${rc}_256.jpg`,
                `1080_${rc}_256.jpg`,
            ];
            for (const f of files) {
                const full = path.join(dir, f);
                if (fs.existsSync(full)) {
                    const ext = path.extname(full).toLowerCase();
                    setHeader(event, 'Content-Type', ext === '.png' ? 'image/png' : 'image/jpeg');
                    setHeader(event, 'Cache-Control', 'public, max-age=86400');
                    return fs.readFileSync(full);
                }
            }
        }

        // Check storage directories for {songId}_{code}.jpg / {songId}_{rc}.jpg (e.g. antithese_byd.jpg)
        for (const dir of storageDirs) {
            const files = [
                `${songId}_${code}.jpg`,
                `${songId}_${code}.png`,
                `${songId}_${rc}.jpg`,
                `${songId}_${rc}.png`,
                `${songId}_${code}_256.jpg`,
            ];
            for (const f of files) {
                const full = path.join(dir, f);
                if (fs.existsSync(full)) {
                    const ext = path.extname(full).toLowerCase();
                    setHeader(event, 'Content-Type', ext === '.png' ? 'image/png' : 'image/jpeg');
                    setHeader(event, 'Cache-Control', 'public, max-age=86400');
                    return fs.readFileSync(full);
                }
            }
        }
    }

    // 2. Base jacket search (when no override exists or no diff is requested)
    for (const dir of storageDirs) {
        const files = [`${songId}.jpg`, `${songId}.png`, `${songId}_256.jpg`];
        for (const f of files) {
            const full = path.join(dir, f);
            if (fs.existsSync(full)) {
                const ext = path.extname(full).toLowerCase();
                setHeader(event, 'Content-Type', ext === '.png' ? 'image/png' : 'image/jpeg');
                setHeader(event, 'Cache-Control', 'public, max-age=86400');
                return fs.readFileSync(full);
            }
        }
    }

    for (const dir of songDirs) {
        const files = [`1080_base.jpg`, `base.jpg`, `base.png`, `base_256.jpg`, `1080_base_256.jpg`];
        for (const f of files) {
            const full = path.join(dir, f);
            if (fs.existsSync(full)) {
                const ext = path.extname(full).toLowerCase();
                setHeader(event, 'Content-Type', ext === '.png' ? 'image/png' : 'image/jpeg');
                setHeader(event, 'Cache-Control', 'public, max-age=86400');
                return fs.readFileSync(full);
            }
        }
    }

    // 3. Default SVG fallback placeholder if no jacket found
    setHeader(event, 'Content-Type', 'image/svg+xml');
    setHeader(event, 'Cache-Control', 'public, max-age=3600');
    return `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
        <defs>
            <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#16133e"/>
                <stop offset="100%" stop-color="#3f3c68"/>
            </linearGradient>
        </defs>
        <rect width="256" height="256" fill="url(#g)"/>
        <text x="50%" y="45%" text-anchor="middle" fill="#f768dd" font-family="sans-serif" font-size="13" font-weight="bold">ARCAEA</text>
        <text x="50%" y="60%" text-anchor="middle" fill="#fffafa" font-family="sans-serif" font-size="11" opacity="0.8">${songId.slice(0, 18)}</text>
    </svg>`;
});

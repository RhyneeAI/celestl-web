import { defineEventHandler, getRouterParam, createError, setHeader } from 'h3';
import fs from 'fs';
import path from 'path';

export default defineEventHandler((event) => {
    const rawSongId = getRouterParam(event, 'songId') || '';
    const songId = rawSongId.replace(/\.(jpg|png|webp)$/i, '').trim();

    if (!songId) {
        throw createError({ statusCode: 400, statusMessage: 'Song ID is required' });
    }

    const candidates = [
        path.resolve(process.cwd(), 'public/storage/jackets', `${songId}.jpg`),
        path.resolve(process.cwd(), '../web/storage/app/public/jackets', `${songId}.jpg`),
        path.resolve(process.cwd(), 'server/database/data/jackets', `${songId}.jpg`),
        path.resolve(process.cwd(), '../ArcaeaServerFork/database/songs', songId, 'base.jpg'),
        path.resolve(process.cwd(), '../ArcaeaServerFork/database/songs', `dl_${songId}`, 'base.jpg'),
        path.resolve(process.cwd(), 'ArcaeaServerFork/database/songs', songId, 'base.jpg'),
        path.resolve(process.cwd(), 'ArcaeaServerFork/database/songs', `dl_${songId}`, 'base.jpg'),
    ];

    for (const filePath of candidates) {
        if (fs.existsSync(filePath)) {
            const buffer = fs.readFileSync(filePath);
            setHeader(event, 'Content-Type', 'image/jpeg');
            setHeader(event, 'Cache-Control', 'public, max-age=86400');
            return buffer;
        }
    }

    // Default SVG fallback placeholder if no jacket found
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

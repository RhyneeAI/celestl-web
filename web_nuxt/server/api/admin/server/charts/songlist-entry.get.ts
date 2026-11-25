import { defineEventHandler, getQuery, createError } from 'h3';
import fs from 'fs';
import { getServerSonglistPath } from '../../../../utils/server-paths.ts';
import { fetchSonglistFromVps } from '../../../../utils/vps-sync.ts';

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const songId = query.song_id ? String(query.song_id).trim() : (query.id ? String(query.id).trim() : '');

    if (!songId) {
        throw createError({
            statusCode: 422,
            statusMessage: 'song_id parameter is required',
        });
    }

    try {
        let raw: any = await fetchSonglistFromVps();
        let source: 'vps' | 'local' = 'vps';
        const songlistPath = getServerSonglistPath();

        if (!raw) {
            source = 'local';
            if (!songlistPath || !fs.existsSync(songlistPath)) {
                throw createError({
                    statusCode: 500,
                    statusMessage: 'Server songlist not found',
                });
            }
            raw = JSON.parse(fs.readFileSync(songlistPath, 'utf-8'));
        }

        const songs: any[] = raw.songs || [];
        const found = songs.find((s: any) => s.id === songId);

        if (!found) {
            throw createError({
                statusCode: 404,
                statusMessage: `Song "${songId}" not found in songlist`,
            });
        }

        return {
            success: true,
            id: songId,
            entry: found,
            formatted: JSON.stringify(found, null, 2),
            source,
            songlistPath: source === 'vps' ? '/home/sefeo-english/celest-server/database/songs/songlist' : songlistPath,
        };
    } catch (err: any) {
        if (err.statusCode) throw err;
        throw createError({
            statusCode: 500,
            statusMessage: err.message || 'Failed to read songlist entry',
        });
    }
});

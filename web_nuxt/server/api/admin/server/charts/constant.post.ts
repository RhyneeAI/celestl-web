import { defineEventHandler, readBody, createError } from 'h3';
import fs from 'fs';
import { getServerSonglistPath } from '../../../../utils/server-paths.ts';
import { syncSonglistToVps, recalculateRatingsLocal, recalculateRatingsOnVps } from '../../../../utils/vps-sync.ts';

interface ConstantUpdateBody {
    song_id: string;
    ratingClass: number;
    rating: number;
    ratingPlus?: boolean;
    constant?: number;
}

export default defineEventHandler(async (event) => {
    const body = await readBody<ConstantUpdateBody>(event);
    if (!body || !body.song_id || body.ratingClass === undefined || body.rating === undefined) {
        throw createError({
            statusCode: 422,
            statusMessage: 'song_id, ratingClass, and rating are required',
        });
    }

    const songlistPath = getServerSonglistPath();
    if (!songlistPath) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Server songlist not found',
        });
    }

    try {
        const raw = JSON.parse(fs.readFileSync(songlistPath, 'utf-8'));
        const songs = raw.songs || [];
        const song = songs.find((s: any) => s.id === body.song_id);

        if (!song) {
            throw createError({
                statusCode: 404,
                statusMessage: `Song '${body.song_id}' not found in server songlist`,
            });
        }

        const diff = (song.difficulties || []).find((d: any) => d.ratingClass === body.ratingClass);
        if (!diff) {
            throw createError({
                statusCode: 404,
                statusMessage: `Difficulty ratingClass ${body.ratingClass} not found on song '${body.song_id}'`,
            });
        }

        diff.rating = Math.max(0, Math.floor(body.rating));
        if (body.ratingPlus !== undefined) {
            diff.ratingPlus = Boolean(body.ratingPlus);
        }
        if (body.constant !== undefined) {
            diff.constant = parseFloat(body.constant.toFixed(1));
        }

        // Hot reload timestamp bump for client cache invalidation
        song.date = Math.floor(Date.now() / 1000);

        fs.writeFileSync(songlistPath, JSON.stringify(raw, null, 2), 'utf-8');

        // Automatically sync updated songlist to VPS celest-server
        const vpsResult = await syncSonglistToVps(songlistPath);

        // Automatically recalculate SQLite chart table, ratings, and user PTT (B50)
        await recalculateRatingsLocal().catch((e) => console.error('[Recalculate Local Background Error]:', e));
        if (vpsResult.synced_vps) {
            recalculateRatingsOnVps().catch((e) => console.error('[Recalculate VPS Background Error]:', e));
        }

        return {
            success: true,
            song_id: body.song_id,
            ratingClass: body.ratingClass,
            rating: diff.rating,
            ratingPlus: diff.ratingPlus,
            constant: diff.constant,
            updated_at: song.date,
            synced_vps: vpsResult.synced_vps,
            vps_message: vpsResult.message,
            vps_error: vpsResult.error,
        };
    } catch (err: any) {
        throw createError({
            statusCode: err.statusCode || 500,
            statusMessage: err.statusMessage || err.message || 'Failed to update song constant',
        });
    }
});

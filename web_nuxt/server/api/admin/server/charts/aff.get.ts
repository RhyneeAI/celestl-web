import { defineEventHandler, getQuery, createError } from 'h3';
import { fetchChartAff } from '../../../../utils/vps-sync.ts';

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const songId = query.song_id ? String(query.song_id).trim() : '';
    const rcRaw = query.ratingClass !== undefined ? parseInt(String(query.ratingClass), 10) : NaN;

    if (!songId || isNaN(rcRaw) || rcRaw < 0 || rcRaw > 5) {
        throw createError({
            statusCode: 422,
            statusMessage: 'song_id and a valid ratingClass (0-5) are required',
        });
    }

    try {
        const result = await fetchChartAff(songId, rcRaw);
        return {
            success: true,
            song_id: songId,
            ratingClass: rcRaw,
            filename: `${rcRaw}.aff`,
            content: result.content,
            source: result.source,
            size: result.size,
        };
    } catch (err: any) {
        throw createError({
            statusCode: err.statusCode || 404,
            statusMessage: err.message || `Failed to fetch chart .aff for ${songId} (rc: ${rcRaw})`,
        });
    }
});


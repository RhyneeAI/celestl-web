import { defineEventHandler, readBody, createError } from 'h3';
import { saveChartAff } from '../../../../utils/vps-sync.ts';

interface AffUpdateBody {
    song_id: string;
    ratingClass: number;
    content: string;
}

export default defineEventHandler(async (event) => {
    const body = await readBody<AffUpdateBody>(event);

    if (!body || !body.song_id || body.ratingClass === undefined || typeof body.content !== 'string') {
        throw createError({
            statusCode: 422,
            statusMessage: 'song_id, ratingClass, and content string are required',
        });
    }

    if (body.ratingClass < 0 || body.ratingClass > 5) {
        throw createError({
            statusCode: 422,
            statusMessage: 'ratingClass must be between 0 and 5',
        });
    }

    try {
        const result = await saveChartAff(body.song_id, body.ratingClass, body.content);
        return {
            success: true,
            song_id: body.song_id,
            ratingClass: body.ratingClass,
            filename: `${body.ratingClass}.aff`,
            size: result.size,
            updated_at: result.updated_at,
            synced_vps: result.synced_vps,
            message: result.message,
            error: result.error,
        };
    } catch (err: any) {
        throw createError({
            statusCode: err.statusCode || 500,
            statusMessage: err.message || 'Failed to save chart .aff file',
        });
    }
});


import { defineEventHandler, readBody, createError } from 'h3';
import { validateChartAff } from '../../../../utils/vps-sync.ts';

interface AffValidateBody {
    song_id: string;
    ratingClass: number;
    content: string;
}

export default defineEventHandler(async (event) => {
    const body = await readBody<AffValidateBody>(event);

    if (!body || !body.song_id || body.ratingClass === undefined || typeof body.content !== 'string') {
        throw createError({
            statusCode: 422,
            statusMessage: 'song_id, ratingClass, and content string are required',
        });
    }

    try {
        const result = await validateChartAff(body.song_id, body.ratingClass, body.content);
        return {
            success: true,
            song_id: body.song_id,
            ratingClass: body.ratingClass,
            ...result,
        };
    } catch (err: any) {
        throw createError({
            statusCode: err.statusCode || 500,
            statusMessage: err.message || 'Failed to validate chart .aff file',
        });
    }
});


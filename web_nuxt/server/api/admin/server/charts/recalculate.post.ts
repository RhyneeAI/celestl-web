import { defineEventHandler, createError } from 'h3';
import { recalculateRatingsLocal, recalculateRatingsOnVps } from '../../../../utils/vps-sync.ts';

export default defineEventHandler(async () => {
    const startTime = Date.now();

    try {
        // 1. Run local recalculation
        const localResult = await recalculateRatingsLocal();
        if (!localResult.success) {
            throw createError({
                statusCode: 500,
                statusMessage: localResult.error || 'Failed to recalculate ratings locally',
            });
        }

        // 2. Run remote VPS recalculation (atomic on celest-arcaea-server)
        const vpsResult = await recalculateRatingsOnVps();

        const elapsedMs = Date.now() - startTime;

        return {
            success: true,
            message: 'Ratings & user PTT successfully recalculated using modern B50 formula',
            elapsed_ms: elapsedMs,
            local_output: localResult.output,
            vps_synced: vpsResult.synced_vps,
            vps_message: vpsResult.message,
            vps_error: vpsResult.error,
        };
    } catch (err: any) {
        throw createError({
            statusCode: err.statusCode || 500,
            statusMessage: err.statusMessage || err.message || 'Failed to recalculate ratings',
        });
    }
});

import { defineEventHandler, createError } from 'h3';
import { recalculateRatingsLocal, recalculateRatingsOnVps } from '../../../../utils/vps-sync.ts';

export default defineEventHandler(async () => {
    try {
        const localRes = await recalculateRatingsLocal();
        const vpsRes = await recalculateRatingsOnVps();

        return {
            success: localRes.success,
            localOutput: localRes.output,
            vpsSynced: vpsRes.synced_vps,
            vpsOutput: vpsRes.message,
            message: 'Modern B50 Potential ratings recomputed for all registered players.',
        };
    } catch (err: any) {
        throw createError({ statusCode: 500, statusMessage: err.message || 'Failed to recalculate ratings' });
    }
});

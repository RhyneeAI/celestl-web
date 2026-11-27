import { defineEventHandler, readBody, createError } from 'h3';
// @ts-ignore: better-sqlite3 uses export = Database CommonJS syntax
import Database from 'better-sqlite3';
import { getServerDbPath } from '../../../../utils/server-paths.ts';
import { fetchPlayerFromVps, syncPlayerProfileToVps } from '../../../../utils/vps-sync.ts';

interface UpdateProfileBody {
    userId: number;
    name?: string;
    ratingPtt?: number | null;
}

function isGeneratedMockAccount(userId: number, email?: string | null): boolean {
    const emailStr = String(email || '').trim().toLowerCase();
    return emailStr.endsWith('@celest.local') || (userId >= 2000000 && userId <= 2000004);
}

export default defineEventHandler(async (event) => {
    const body = await readBody<UpdateProfileBody>(event);
    if (!body || typeof body.userId !== 'number' || !Number.isInteger(body.userId)) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid parameter: valid integer userId is required.' });
    }

    const hasNameUpdate = typeof body.name === 'string';
    const hasPttUpdate = body.ratingPtt !== undefined && body.ratingPtt !== null;
    if (!hasNameUpdate && !hasPttUpdate) {
        throw createError({ statusCode: 400, statusMessage: 'Provide at least name or ratingPtt to update.' });
    }

    let normalizedName: string | undefined;
    if (hasNameUpdate) {
        normalizedName = body.name!.trim();
        if (!normalizedName || normalizedName.length > 64) {
            throw createError({ statusCode: 400, statusMessage: 'Nickname must be between 1 and 64 characters.' });
        }
        if (/[\r\n\t\x00-\x1f]/.test(normalizedName)) {
            throw createError({ statusCode: 400, statusMessage: 'Nickname contains invalid control characters.' });
        }
    }

    let normalizedPtt: number | undefined;
    if (hasPttUpdate) {
        if (typeof body.ratingPtt !== 'number' || !Number.isFinite(body.ratingPtt)) {
            throw createError({ statusCode: 400, statusMessage: 'ratingPtt must be a valid finite number.' });
        }
        if (body.ratingPtt < 0 || body.ratingPtt > 15) {
            throw createError({ statusCode: 400, statusMessage: 'ratingPtt must be between 0.000 and 15.000.' });
        }
        normalizedPtt = Math.round(body.ratingPtt * 1000) / 1000;
    }

    const dbPath = getServerDbPath();
    let localRow: { user_id: number; name: string; email: string | null; rating_ptt: number } | undefined;

    if (dbPath) {
        try {
            const db = new Database(dbPath, { readonly: true });
            localRow = db.prepare('SELECT user_id, name, email, rating_ptt FROM user WHERE user_id = ?').get(body.userId) as any;
            if (normalizedName) {
                const dup = db.prepare('SELECT user_id FROM user WHERE name = ? COLLATE NOCASE AND user_id != ?').get(normalizedName, body.userId);
                if (dup) {
                    db.close();
                    throw createError({ statusCode: 409, statusMessage: `Nickname "${normalizedName}" is already taken.` });
                }
            }
            db.close();
        } catch (err: any) {
            if (err?.statusCode) throw err;
            console.warn('[Update Profile] Local DB lookup error:', err);
        }
    }

    let vpsRow: any = null;
    try {
        vpsRow = await fetchPlayerFromVps(body.userId, true);
    } catch { }

    if (!localRow && !vpsRow) {
        throw createError({ statusCode: 404, statusMessage: `Player UID ${body.userId} not found.` });
    }

    const effectiveEmail = localRow?.email ?? vpsRow?.email ?? '';
    if (normalizedPtt !== undefined && !isGeneratedMockAccount(body.userId, effectiveEmail)) {
        throw createError({
            statusCode: 403,
            statusMessage: 'PTT adjustment is restricted to generated mock accounts (@celest.local) only.',
        });
    }

    // Sync to VPS first so remote uniqueness/validation errors abort cleanly before local write
    const vpsRes = await syncPlayerProfileToVps(body.userId, {
        name: normalizedName,
        ratingPtt: normalizedPtt,
    });
    if (!vpsRes.success && vpsRes.error) {
        if (!(localRow && vpsRes.error === 'Player not found on VPS')) {
            throw createError({ statusCode: 409, statusMessage: vpsRes.error });
        }
    }

    if (localRow && dbPath) {
        const db = new Database(dbPath);
        try {
            if (normalizedName !== undefined && normalizedPtt !== undefined) {
                db.prepare('UPDATE user SET name = ?, rating_ptt = ? WHERE user_id = ?').run(normalizedName, normalizedPtt, body.userId);
            } else if (normalizedName !== undefined) {
                db.prepare('UPDATE user SET name = ? WHERE user_id = ?').run(normalizedName, body.userId);
            } else if (normalizedPtt !== undefined) {
                db.prepare('UPDATE user SET rating_ptt = ? WHERE user_id = ?').run(normalizedPtt, body.userId);
            }
        } finally {
            db.close();
        }
    }

    const updatedName = normalizedName ?? localRow?.name ?? vpsRow?.name ?? `User ${body.userId}`;
    const updatedPtt = normalizedPtt ?? Number(localRow?.rating_ptt ?? vpsRow?.rating_ptt ?? 0);

    return {
        success: true,
        userId: body.userId,
        name: updatedName,
        ratingPtt: updatedPtt,
        synced_vps: vpsRes.synced_vps,
        message: `Profile updated for ${updatedName} (UID ${body.userId})${vpsRes.synced_vps ? ' (Synced to VPS)' : ''}`,
    };
});

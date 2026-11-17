import { defineEventHandler, readBody, setCookie, createError } from 'h3';
import { isTotpConfigured, verifyTotpCode, createAdminSessionToken } from '../../../utils/totp.ts';

export default defineEventHandler(async (event) => {
    if (!isTotpConfigured()) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Admin TOTP is not configured on this installation.',
        });
    }

    const body = await readBody<{ code?: string }>(event);
    const code = (body?.code || '').trim();

    if (!code) {
        throw createError({
            statusCode: 422,
            statusMessage: 'Authentication code is required.',
        });
    }

    const isValid = verifyTotpCode(code);
    if (!isValid) {
        throw createError({
            statusCode: 401,
            statusMessage: 'That code is not valid right now.',
        });
    }

    const sessionToken = createAdminSessionToken();
    setCookie(event, 'celestl_admin_session', sessionToken, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return {
        success: true,
        message: 'Authenticated successfully.',
    };
});

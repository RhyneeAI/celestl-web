import { defineEventHandler, getCookie, createError, getRequestPath } from 'h3';
import { verifyAdminSessionToken } from '../utils/totp.ts';

export default defineEventHandler((event) => {
    const path = getRequestPath(event);

    // Only protect /api/admin/* routes
    if (!path.startsWith('/api/admin/')) {
        return;
    }

    // Allow /api/admin/auth/* without session
    if (path.startsWith('/api/admin/auth/')) {
        return;
    }

    const token = getCookie(event, 'celestl_admin_session');
    if (!verifyAdminSessionToken(token)) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized. Valid admin session required.',
        });
    }
});

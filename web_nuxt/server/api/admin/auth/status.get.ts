import { defineEventHandler, getCookie } from 'h3';
import { isTotpConfigured, verifyAdminSessionToken } from '../../../utils/totp.ts';

export default defineEventHandler((event) => {
    const enrolled = isTotpConfigured();
    const token = getCookie(event, 'celestl_admin_session');
    const authenticated = verifyAdminSessionToken(token);

    return {
        enrolled,
        authenticated,
    };
});

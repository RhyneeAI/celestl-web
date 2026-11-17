import { defineEventHandler, deleteCookie } from 'h3';

export default defineEventHandler((event) => {
    deleteCookie(event, 'celestl_admin_session', { path: '/' });
    return {
        success: true,
        message: 'Signed out successfully.',
    };
});

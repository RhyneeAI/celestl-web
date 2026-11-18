import { defineEventHandler, deleteCookie } from 'h3';

export default defineEventHandler((event) => {
    deleteCookie(event, 'celest_player_uid', { path: '/' });
    return {
        success: true,
        message: 'Logged out successfully.',
    };
});


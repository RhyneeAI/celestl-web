export default defineNuxtRouteMiddleware(async (to) => {
    // Skip if SSR check is already handled or on non-admin routes
    if (!to.path.startsWith('/admin')) {
        return;
    }

    try {
        const { data } = await useFetch('/api/admin/auth/status');
        const auth = data.value;

        if (to.path === '/admin/login') {
            if (auth?.authenticated) {
                return navigateTo('/admin');
            }
            return;
        }

        if (!auth?.authenticated) {
            return navigateTo('/admin/login');
        }
    } catch {
        if (to.path !== '/admin/login') {
            return navigateTo('/admin/login');
        }
    }
});

export default defineNuxtRouteMiddleware(async (to) => {
    // Only guard admin routes
    if (!to.path.startsWith('/admin')) {
        return;
    }

    try {
        // Use $fetch with request headers to prevent stale cache in Nuxt useFetch payload
        const headers = useRequestHeaders(['cookie']);
        const auth = await $fetch<{ enrolled: boolean; authenticated: boolean }>('/api/admin/auth/status', {
            headers,
        });

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

<script setup lang="ts">
import { ref } from 'vue';

definePageMeta({
    layout: false,
    middleware: ['admin'],
});

const code = ref('');
const error = ref('');
const loading = ref(false);

const { data: authStatus } = await useFetch('/api/admin/auth/status');
const enrolled = computed(() => authStatus.value?.enrolled ?? false);

async function handleLogin() {
    if (code.value.length < 6 || loading.value) return;

    error.value = '';
    loading.value = true;

    try {
        await $fetch('/api/admin/auth/login', {
            method: 'POST',
            body: { code: code.value },
        });

        // Navigate to admin home
        await navigateTo('/admin');
    } catch (err: any) {
        error.value = err?.data?.statusMessage || 'That code is not valid right now.';
        code.value = '';
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <div class="flex min-h-screen items-center justify-center bg-bg px-4 text-text font-sans">
        <Head>
            <title>Admin Sign In · Celestl</title>
        </Head>

        <div class="w-full max-w-[360px]">
            <!-- Header Brand -->
            <div class="mb-6 flex items-center gap-2.5">
                <div class="size-7 flex-none rotate-45 rounded-[9px] bg-lav shadow-lg shadow-lav/20" />
                <span class="font-brand text-[17px] font-semibold tracking-wide text-white">
                    CELESTL
                </span>
            </div>

            <!-- Login Form -->
            <div v-if="enrolled" class="rounded-3xl bg-card p-6 border border-white/5 shadow-2xl">
                <h1 class="text-[17px] font-semibold text-white">Admin</h1>
                <p class="mt-1 text-[12.5px] text-muted">
                    Enter the current 6-digit code from your authenticator app.
                </p>

                <form @submit.prevent="handleLogin" class="mt-4">
                    <input
                        v-model="code"
                        type="text"
                        inputmode="numeric"
                        autocomplete="one-time-code"
                        autofocus
                        maxlength="6"
                        placeholder="000000"
                        aria-label="Authentication code"
                        class="w-full rounded-xl bg-violet px-4 py-3 text-center font-mono text-[22px] tracking-[0.35em] text-white placeholder:text-dim border border-white/5 focus:outline-none focus:ring-2 focus:ring-pst/60 transition"
                    />

                    <p v-if="error" class="mt-2 text-center text-[12.5px] text-byd font-medium">
                        {{ error }}
                    </p>

                    <button
                        type="submit"
                        :disabled="loading || code.length < 6"
                        class="mt-4 w-full rounded-xl bg-lav py-3 text-[13.5px] font-bold text-bg hover:opacity-95 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-lav/20"
                    >
                        {{ loading ? 'Checking…' : 'Sign in' }}
                    </button>
                </form>
            </div>

            <!-- Not Enrolled State -->
            <div v-else class="rounded-3xl bg-card p-6 border border-white/5 shadow-2xl">
                <h1 class="text-[17px] font-semibold text-white">Admin is locked</h1>
                <p class="mt-1.5 text-[12.5px] text-muted leading-relaxed">
                    Nobody has claimed this install yet, so there is no code that would work. Enrol once from the server terminal:
                </p>
                <pre class="mt-4 overflow-x-auto rounded-xl bg-violet px-4 py-3 font-mono text-[11.5px] text-lav border border-white/5 select-all">npm run admin:setup -- --email=you@example.com</pre>
            </div>
        </div>
    </div>
</template>

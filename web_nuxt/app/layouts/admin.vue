<template>
  <div class="flex min-h-screen bg-[#0c0c22] text-[#fffafa] font-sans antialiased">
    <!-- Mobile Backdrop -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
      @click="sidebarOpen = false"
    ></div>

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-[#16133e] bg-[#0c0c22] transition-transform duration-200 lg:static lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <!-- Sidebar Brand -->
      <div class="flex h-16 items-center justify-between border-b border-[#16133e] px-6">
        <NuxtLink to="/admin" class="flex items-center gap-2.5 font-brand text-[17px] font-bold tracking-wide">
          <span class="inline-block h-3 w-3 rounded-full bg-[#f768dd] shadow-[0_0_10px_#f768dd]"></span>
          <span>Celestl <span class="text-[12px] font-normal text-[#9a99a8]">Admin</span></span>
        </NuxtLink>
        <button
          class="rounded-lg p-1.5 text-[#9a99a8] hover:bg-[#1a1d32] lg:hidden"
          @click="sidebarOpen = false"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Navigation Links -->
      <div class="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        <div v-for="(group, idx) in navGroups" :key="idx" class="space-y-1">
          <div v-if="group.label" class="px-3 text-[11px] font-semibold uppercase tracking-wider text-[#6f6e80]">
            {{ group.label }}
          </div>
          <div class="space-y-1">
            <NuxtLink
              v-for="item in group.items"
              :key="item.href"
              :to="item.href"
              :class="[
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-colors',
                isActive(item.href)
                  ? 'bg-[#16133e] text-[#fffafa] shadow-inner font-semibold'
                  : 'text-[#9a99a8] hover:bg-[#1a1d32] hover:text-[#fffafa]'
              ]"
              @click="sidebarOpen = false"
            >
              <component :is="item.icon" class="h-4 w-4 shrink-0 text-[#f768dd]" />
              <span>{{ item.label }}</span>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Footer / Back to App -->
      <div class="border-t border-[#16133e] p-4 space-y-2">
        <button
          @click="logout"
          class="flex w-full items-center justify-center gap-2 rounded-xl bg-red-950/30 border border-red-500/20 px-4 py-2 text-[12.5px] font-medium text-red-300 hover:bg-red-900/40 transition-colors"
        >
          <span>Sign Out</span>
        </button>
        <NuxtLink
          to="/"
          class="flex items-center justify-center gap-2 rounded-xl bg-[#1a1d32] px-4 py-2 text-[12.5px] font-medium text-[#9a99a8] hover:bg-[#1e203a] hover:text-[#fffafa] transition-colors"
        >
          <span>← Back to Public Site</span>
        </NuxtLink>
      </div>
    </aside>

    <!-- Main Content Shell -->
    <div class="flex flex-1 flex-col min-w-0">
      <!-- Top Mobile Bar -->
      <header class="flex h-16 items-center justify-between border-b border-[#16133e] bg-[#0c0c22]/90 px-4 backdrop-blur lg:hidden">
        <button
          class="rounded-xl bg-[#1a1d32] p-2 text-[#fffafa]"
          @click="sidebarOpen = true"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span class="font-brand font-semibold text-[15px]">Celestl Management</span>
        <NuxtLink to="/" class="text-[12px] text-[#9a99a8]">Public</NuxtLink>
      </header>

      <!-- Page Content -->
      <main class="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h, ref } from 'vue';

const route = useRoute();
const sidebarOpen = ref(false);

async function logout() {
  try {
    await $fetch('/api/admin/auth/logout', { method: 'POST' });
  } catch {}
  await navigateTo('/admin/login', { external: true });
}

const createSvgIcon = (d: string) => ({
  render: () => h('svg', {
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': 2,
    innerHTML: d
  })
});

const HomeIcon = createSvgIcon('<path d="M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" />');
const PacksIcon = createSvgIcon('<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" /><path d="M4 7.5 12 12l8-4.5M12 12v9" />');
const SongsIcon = createSvgIcon('<path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />');
const UnofficialIcon = createSvgIcon('<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>');
const ScoresIcon = createSvgIcon('<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.45 1-1 1H8c-.55 0-1 .45-1 1v1h10v-1c0-.55-.45-1-1-1h-1c-.55 0-1-.45-1-1v-2.34M18 4H6v7a6 6 0 0 0 12 0V4z" />');
const RecordsIcon = createSvgIcon('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="15" y2="11"/>');
const StoreIcon = createSvgIcon('<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>');
const LogIcon = createSvgIcon('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>');
const TestingIcon = createSvgIcon('<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>');

const navGroups = [
  { label: null, items: [{ href: '/admin', label: 'Home', icon: HomeIcon }] },
  {
    label: 'Official Content',
    items: [
      { href: '/admin/packs', label: 'Official Packs', icon: PacksIcon },
      { href: '/admin/songs', label: 'Songs & Charts', icon: SongsIcon },
    ],
  },
  {
    label: 'Server Client (Unofficial)',
    items: [
      { href: '/admin/unofficial', label: 'Custom Charts (.aff)', icon: UnofficialIcon },
      { href: '/admin/scores', label: 'Leaderboard (World)', icon: ScoresIcon },
      { href: '/admin/records', label: 'Score Data (Player)', icon: RecordsIcon },
      { href: '/admin/store', label: 'Constants & Store', icon: StoreIcon },
    ],
  },
  {
    label: 'Operations & Testing',
    items: [
      { href: '/admin/log', label: 'Activity Log', icon: LogIcon },
      { href: '/admin/testing', label: 'Testing Tools / OCR', icon: TestingIcon },
    ],
  },
];

function isActive(href: string): boolean {
  return href === '/admin' ? route.path === '/admin' : route.path.startsWith(href);
}
</script>

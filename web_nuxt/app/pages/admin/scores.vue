<template>
  <div class="relative min-h-[90vh] bg-[#0c0c22] text-[#fffafa] font-sans antialiased rounded-3xl overflow-hidden shadow-2xl border border-[#16133e]">
    <!-- Top Cathedral Atmosphere Banner (Arcaea base_conflict.jpg) -->
    <div class="relative h-64 sm:h-72 w-full overflow-hidden">
      <img
        src="/storage/backgrounds/base_conflict.jpg"
        alt="Arcaea Conflict Cathedral"
        class="h-full w-full object-cover object-top filter brightness-90 opacity-75"
        @error="onBgError"
      />
      <!-- Gradient overlay fading smoothly into dark body -->
      <div class="absolute inset-0 bg-gradient-to-b from-[#0c0c22]/20 via-[#0c0c22]/60 to-[#0c0c22]"></div>
      <!-- Top Architectural Vignette -->
      <div class="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/40 to-transparent"></div>
    </div>

    <!-- Main Content Container (Arcaea Center Canvas) -->
    <div class="relative -mt-44 sm:-mt-48 mx-auto w-full max-w-[620px] px-4 pb-16 space-y-6">
      <!-- Title Badge: Hexagon "< LEADERBOARDS" (Image 1 Header in Dark Mode) -->
      <div class="flex justify-center">
        <div class="relative inline-flex items-center justify-center px-10 py-3.5 bg-[#16133e]/90 backdrop-blur-md rounded-2xl shadow-2xl border border-[#3f3c68]/60 header-hexagon transition-transform hover:scale-[1.01]">
          <div class="flex items-center gap-3">
            <svg class="h-6 w-6 text-[#f768dd] stroke-[3.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <h1 class="font-brand font-black text-xl sm:text-2xl tracking-[0.18em] text-[#fffafa] uppercase">
              LEADERBOARDS
            </h1>
          </div>
        </div>
      </div>

      <!-- Controls Row: Difficulty Selector & Segmented Tabs -->
      <div class="flex flex-col items-center gap-4">
        <div class="relative flex items-center justify-between w-full max-w-[480px] px-2 z-30">
          <!-- Difficulty Dropdown Pill (Image 1: FTR dark dropdown) -->
          <div class="relative">
            <button
              type="button"
              @click="diffDropdownOpen = !diffDropdownOpen"
              class="relative flex flex-col items-center justify-center px-6 py-2 rounded-xl text-white font-brand font-bold text-xs shadow-lg transition-transform active:scale-95 border border-white/20"
              :style="{ backgroundColor: currentDiffConfig.color }"
            >
              <span class="text-[10px] uppercase tracking-wider opacity-90">Difficulty</span>
              <span class="text-sm tracking-widest font-extrabold">{{ currentDiffConfig.label }}</span>
              <svg class="h-3 w-3 mt-0.5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- Vertical Dropdown Menu (PST, PRS, FTR, ETR, BYD, ALL) -->
            <div
              v-if="diffDropdownOpen"
              class="absolute left-0 mt-2 w-36 rounded-2xl bg-[#1a1d32] p-2 shadow-2xl border border-[#3f3c68]/60 space-y-1 z-50 text-white animate-in fade-in zoom-in-95 duration-150"
            >
              <button
                type="button"
                @click="setDifficulty(null)"
                :class="[
                  'w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-colors',
                  selectedDiff === null ? 'bg-white/20 text-white' : 'text-[#9a99a8] hover:bg-white/10 hover:text-white'
                ]"
              >
                <span>ALL</span>
                <span class="text-[10px] text-[#6f6e80]">Total</span>
              </button>

              <button
                v-for="d in difficultyOptions"
                :key="d.code"
                type="button"
                @click="setDifficulty(d.rc)"
                :class="[
                  'w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-colors',
                  selectedDiff === d.rc ? 'bg-white/20 text-white' : 'text-[#9a99a8] hover:bg-white/10 hover:text-white'
                ]"
              >
                <span :style="{ color: d.color }">{{ d.code }}</span>
                <span class="text-[10px] text-[#6f6e80]">{{ d.name }}</span>
              </button>
            </div>
          </div>

          <!-- Segmented View Tabs: World vs Score Data (Image 1) -->
          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="activeTab = 'world'"
              :class="[
                'px-6 py-2 rounded-xl font-brand font-bold text-xs uppercase tracking-wider transition shadow-md',
                activeTab === 'world'
                  ? 'bg-[#79287a] text-white border border-[#f768dd]/50 shadow-[#79287a]/40'
                  : 'bg-[#1a1d32] text-[#9a99a8] hover:bg-[#1e203a] hover:text-white border border-[#16133e]'
              ]"
            >
              World
            </button>
            <NuxtLink
              to="/admin/records"
              class="px-5 py-2 rounded-xl font-brand font-bold text-xs uppercase tracking-wider bg-[#1a1d32] text-[#9a99a8] hover:bg-[#1e203a] hover:text-white border border-[#16133e] transition shadow-md flex items-center gap-1.5"
            >
              <span>Score Data</span>
              <svg class="h-3.5 w-3.5 text-[#f768dd]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </NuxtLink>
          </div>
        </div>

        <!-- Diamond Divider: "—— ◇ ——" -->
        <div class="flex items-center justify-center w-full max-w-[460px] py-1">
          <div class="h-px flex-1 bg-[#16133e]"></div>
          <div class="mx-3 text-[#6f6e80] text-xs">◇</div>
          <div class="h-px flex-1 bg-[#16133e]"></div>
        </div>
      </div>

      <!-- Featured / Top User Highlight Card (Image 1 user banner in Dark Mode) -->
      <div v-if="featuredPlayer" class="relative">
        <NuxtLink
          :to="`/admin/records?userId=${featuredPlayer.userId}`"
          class="group block relative w-full rounded-2xl bg-[#1a1d32] border border-[#3f3c68]/40 shadow-xl p-4 sm:p-5 transition hover:shadow-2xl hover:border-[#f768dd]/40 overflow-hidden"
        >
          <!-- Left Decorative Accent Chevron -->
          <div class="absolute left-0 top-0 bottom-0 w-3 bg-[#79287a]"></div>

          <div class="flex items-center justify-between pl-3 pr-2">
            <div class="min-w-0 pr-4">
              <div class="text-[11px] font-bold tracking-widest uppercase text-[#9a99a8] font-brand">Featured Player</div>
              <div class="text-xl sm:text-2xl font-black text-[#fffafa] tracking-tight font-brand truncate group-hover:text-[#f768dd] transition-colors">
                {{ featuredPlayer.name }}
              </div>
              <div class="mt-0.5 font-mono text-sm sm:text-base font-extrabold text-[#ffd76a]">
                {{ featuredPlayer.totalScoreFormatted }}
              </div>
            </div>

            <!-- Diamond Avatar Frame -->
            <div class="relative shrink-0 pr-2">
              <div class="h-16 w-16 rotate-45 overflow-hidden rounded-2xl bg-gradient-to-tr from-[#79287a] to-[#03a8e6] p-1 shadow-xl border-2 border-white/20">
                <div class="relative h-full w-full overflow-hidden rounded-xl bg-slate-900">
                  <img
                    :src="featuredPlayer.characterAvatar"
                    :alt="featuredPlayer.name"
                    class="absolute inset-[-25%] h-[150%] w-[150%] max-w-none -rotate-45 object-cover"
                    @error="onAvatarError"
                  />
                </div>
              </div>
            </div>
          </div>
        </NuxtLink>
      </div>

      <!-- Ranked List of Players (Image 1 Ribbons) -->
      <div v-if="pending" class="py-16 text-center">
        <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#f768dd] border-t-transparent"></div>
        <div class="mt-3 font-brand text-xs uppercase tracking-wider text-[#9a99a8]">Loading Leaderboards…</div>
      </div>

      <div v-else-if="leaderboard.length === 0" class="rounded-2xl bg-[#1a1d32] p-8 text-center border border-[#16133e] text-[#9a99a8]">
        <p class="font-brand font-semibold text-sm">No player scores found for this difficulty.</p>
      </div>

      <div v-else class="space-y-4">
        <NuxtLink
          v-for="entry in leaderboard"
          :key="entry.userId"
          :to="`/admin/records?userId=${entry.userId}`"
          :class="[
            'group relative block rounded-2xl p-4 sm:p-5 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-2xl overflow-hidden cursor-pointer select-none',
            getRibbonClasses(entry.rank)
          ]"
        >
          <!-- Left Chevron Pointer / Rank Badge -->
          <div class="flex items-center justify-between pr-2">
            <!-- Rank & Info -->
            <div class="flex items-center gap-4 sm:gap-6 min-w-0 pr-4">
              <!-- Rank Number with Arcaea Arrow Badge -->
              <div class="flex items-center gap-1 shrink-0 font-brand font-black text-2xl sm:text-3xl tracking-tighter" :class="getRankNumberColor(entry.rank)">
                <span>#{{ entry.rank }}</span>
              </div>

              <!-- Player Credentials -->
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <h3 class="font-brand font-black text-lg sm:text-2xl tracking-tight truncate drop-shadow-sm" :class="getRankTextColor(entry.rank)">
                    {{ entry.name }}
                  </h3>
                  <span
                    v-if="entry.ratingPtt > 0"
                    class="rounded-full bg-black/30 px-2 py-0.5 font-mono text-[11px] font-bold text-white/90 backdrop-blur-sm"
                  >
                    {{ entry.ratingPtt.toFixed(2) }}
                  </span>
                </div>

                <!-- Total Score (Formatted e.g. 5,590,578,790) -->
                <div class="mt-0.5 font-mono font-black text-sm sm:text-lg tracking-wide drop-shadow-sm" :class="getScoreColor(entry.rank)">
                  {{ entry.totalScoreFormatted }}
                </div>

                <!-- Best Play Subtext -->
                <div v-if="entry.topSongTitle" class="mt-0.5 text-[11px] truncate opacity-80" :class="getRankTextColor(entry.rank)">
                  Top: {{ entry.topSongTitle }} · c{{ entry.topRating }} ({{ entry.topGrade }})
                </div>
              </div>
            </div>

            <!-- Right: Diamond Avatar Frame (overlapping 45-deg square) -->
            <div class="relative shrink-0 pr-1">
              <div
                :class="[
                  'h-14 w-14 sm:h-16 sm:w-16 rotate-45 overflow-hidden rounded-2xl p-1 shadow-2xl transition-transform group-hover:scale-105 border-2',
                  getAvatarBorderColor(entry.rank)
                ]"
              >
                <div class="relative h-full w-full overflow-hidden rounded-xl bg-slate-900">
                  <img
                    :src="entry.characterAvatar"
                    :alt="entry.name"
                    class="absolute inset-[-25%] h-[150%] w-[150%] max-w-none -rotate-45 object-cover"
                    @error="onAvatarError"
                  />
                </div>
              </div>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { LeaderboardEntry } from '~/types/leaderboard';

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
});

const activeTab = ref<'world' | 'friend'>('world');
const selectedDiff = ref<number | null>(null);
const diffDropdownOpen = ref(false);

const difficultyOptions = [
  { rc: 0, code: 'PST', name: 'Past', color: '#03a8e6' },
  { rc: 1, code: 'PRS', name: 'Present', color: '#5bc446' },
  { rc: 2, code: 'FTR', name: 'Future', color: '#79287a' },
  { rc: 4, code: 'ETR', name: 'Eternal', color: '#4caed1' },
  { rc: 3, code: 'BYD', name: 'Beyond', color: '#921a32' },
];

const currentDiffConfig = computed(() => {
  if (selectedDiff.value === null) {
    return { code: 'ALL', label: 'ALL', color: '#79287a' };
  }
  const match = difficultyOptions.find(d => d.rc === selectedDiff.value);
  return match ? { code: match.code, label: match.code, color: match.color } : { code: 'ALL', label: 'ALL', color: '#79287a' };
});

function setDifficulty(rc: number | null) {
  selectedDiff.value = rc;
  diffDropdownOpen.value = false;
}

const { data, pending } = await useFetch('/api/admin/server/leaderboard', {
  query: computed(() => ({
    difficulty: selectedDiff.value !== null ? selectedDiff.value : undefined,
  })),
});

const leaderboard = computed<LeaderboardEntry[]>(() => data.value?.leaderboard || []);
const featuredPlayer = computed(() => leaderboard.value[0] || null);

function onAvatarError(e: Event) {
  const target = e.target as HTMLImageElement;
  target.src = '/storage/characters/0_icon.png';
}

function onBgError(e: Event) {
  const target = e.target as HTMLImageElement;
  target.style.display = 'none';
}

// Styling helpers matching Image 1 gold, silver, bronze ribbons in dark theme
function getRibbonClasses(rank: number) {
  switch (rank) {
    case 1:
      // Gold metallic gradient banner (#1)
      return 'bg-gradient-to-r from-[#b45309] via-[#d97706] to-[#fde047] text-white shadow-lg shadow-[#d97706]/30 border-2 border-[#ffd76a]';
    case 2:
      // Silver metallic gradient banner (#2)
      return 'bg-gradient-to-r from-[#334155] via-[#475569] to-[#94a3b8] text-white shadow-lg shadow-[#475569]/30 border-2 border-[#cbd5e1]';
    case 3:
      // Bronze / Copper gradient banner (#3)
      return 'bg-gradient-to-r from-[#7c2d12] via-[#9a3412] to-[#ea580c] text-white shadow-lg shadow-[#ea580c]/30 border-2 border-[#fb923c]';
    default:
      // #4+ Dark glass sleek ribbon
      return 'bg-[#1a1d32] hover:bg-[#1e203a] text-[#fffafa] border border-[#16133e] hover:border-[#3f3c68] shadow-md';
  }
}

function getRankTextColor(rank: number) {
  return 'text-[#fffafa]';
}

function getScoreColor(rank: number) {
  if (rank <= 3) return 'text-white/95';
  return 'text-[#ffd76a]';
}

function getRankNumberColor(rank: number) {
  if (rank === 1) return 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]';
  if (rank === 2) return 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]';
  if (rank === 3) return 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]';
  return 'text-[#6f6e80] group-hover:text-[#9a99a8]';
}

function getAvatarBorderColor(rank: number) {
  if (rank === 1) return 'border-[#ffd76a] bg-[#b45309]';
  if (rank === 2) return 'border-[#cbd5e1] bg-[#334155]';
  if (rank === 3) return 'border-[#fb923c] bg-[#7c2d12]';
  return 'border-white/20 bg-[#16133e]';
}
</script>

<style scoped>
.header-hexagon {
  clip-path: polygon(14px 0%, calc(100% - 14px) 0%, 100% 50%, calc(100% - 14px) 100%, 14px 100%, 0% 50%);
}
</style>

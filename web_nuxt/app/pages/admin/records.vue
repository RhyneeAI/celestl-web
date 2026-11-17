<template>
  <div class="relative min-h-[90vh] bg-gradient-to-b from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] text-slate-900 font-sans antialiased rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
    <!-- Top Cathedral Atmosphere Banner (Arcaea base_light.jpg) -->
    <div class="relative h-64 sm:h-72 w-full overflow-hidden">
      <img
        src="/storage/backgrounds/base_light.jpg"
        alt="Arcaea Light Cathedral"
        class="h-full w-full object-cover object-top filter brightness-95 opacity-80"
        @error="onBgError"
      />
      <!-- Gradient overlay fading smoothly into page body -->
      <div class="absolute inset-0 bg-gradient-to-b from-white/20 via-[#f8fafc]/70 to-[#f8fafc]"></div>
      <!-- Top Vignette -->
      <div class="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/20 to-transparent"></div>
    </div>

    <!-- Main Content Container (Arcaea Center Canvas) -->
    <div class="relative -mt-44 sm:-mt-48 mx-auto w-full max-w-[620px] px-4 pb-16 space-y-6">
      <!-- Title Badge: Hexagon "< SCORE DATA" (Image 2 Header) -->
      <div class="flex justify-center">
        <NuxtLink
          to="/admin/scores"
          class="relative inline-flex items-center justify-center px-10 py-3.5 bg-white rounded-2xl shadow-xl border border-slate-200/80 header-hexagon transition-transform hover:scale-[1.01]"
        >
          <div class="flex items-center gap-3">
            <svg class="h-6 w-6 text-black stroke-[3.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <h1 class="font-brand font-black text-xl sm:text-2xl tracking-[0.18em] text-slate-900 uppercase">
              SCORE DATA
            </h1>
          </div>
        </NuxtLink>
      </div>

      <!-- Scope: Player Selector Dropdown (Admin Switcher) -->
      <div class="rounded-2xl bg-white/90 backdrop-blur-sm p-4 border border-slate-200 shadow-lg space-y-2">
        <div class="flex items-center justify-between text-xs font-brand font-bold uppercase tracking-wider text-slate-400">
          <span>Active Player Profile</span>
          <span class="text-slate-500 font-mono">{{ sortedScores.length }} record(s)</span>
        </div>

        <div class="flex items-center gap-3">
          <!-- Active Player Avatar Diamond -->
          <div class="h-11 w-11 rotate-45 overflow-hidden rounded-xl bg-gradient-to-tr from-[#79287a] to-[#03a8e6] p-0.5 shadow-md shrink-0 border border-white">
            <div class="h-full w-full -rotate-45 overflow-hidden rounded-lg bg-slate-900">
              <img
                :src="selectedPlayer?.characterAvatar || '/storage/characters/0_icon.png'"
                alt="Avatar"
                class="h-full w-full object-cover scale-125"
                @error="onAvatarError"
              />
            </div>
          </div>

          <!-- Select Input Dropdown -->
          <select
            v-model="activeUserId"
            class="flex-1 rounded-xl bg-slate-50 px-3 py-2 text-sm font-bold text-slate-800 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#79287a] transition font-brand cursor-pointer"
          >
            <option
              v-for="p in players"
              :key="p.userId"
              :value="p.userId"
            >
              {{ p.name }} ({{ p.userCode || `ID ${p.userId}` }}) — {{ p.totalScores }} plays
            </option>
          </select>

          <!-- Back to Global Leaderboards Button -->
          <NuxtLink
            to="/admin/scores"
            class="px-3 py-2 rounded-xl text-xs font-bold text-[#79287a] hover:bg-[#79287a]/10 transition shrink-0"
            title="View World Leaderboards"
          >
            Leaderboard →
          </NuxtLink>
        </div>
      </div>

      <!-- Controls Block: Sort by Dropdown (Image 2) -->
      <div class="rounded-2xl bg-white border border-slate-200/90 shadow-md p-3">
        <div class="flex items-center justify-between gap-3">
          <label class="text-xs font-bold text-slate-500 uppercase tracking-wider font-brand shrink-0">
            Sort by:
          </label>
          <select
            v-model="sortMode"
            class="flex-1 rounded-xl bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 border border-slate-200 focus:outline-none font-brand cursor-pointer"
          >
            <option value="rating">Rating (Highest to Lowest)</option>
            <option value="date">Date Obtained (Newest First)</option>
            <option value="score">Score (Highest to Lowest)</option>
          </select>
        </div>
      </div>

      <!-- Difficulty Filter Diamonds (Image 2: PST, PRS, FTR, ETR, BYD) -->
      <div class="flex items-center justify-center gap-2 sm:gap-3 py-1">
        <button
          type="button"
          @click="selectedDiff = null"
          :class="[
            'px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono transition-all shadow-sm border',
            selectedDiff === null
              ? 'bg-[#1e2038] text-white border-transparent scale-105 shadow-md'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          ]"
        >
          ALL
        </button>

        <button
          v-for="d in difficultyOptions"
          :key="d.code"
          type="button"
          @click="selectedDiff = selectedDiff === d.rc ? null : d.rc"
          :class="[
            'diamond-btn relative flex items-center justify-center w-11 h-11 text-xs font-black font-mono transition-all transform shadow-md',
            selectedDiff === d.rc
              ? 'scale-110 shadow-lg text-white'
              : 'bg-white text-slate-700 hover:scale-105 border border-slate-200'
          ]"
          :style="selectedDiff === d.rc ? { backgroundColor: d.color, borderColor: d.color } : {}"
        >
          <span class="z-10">{{ d.code }}</span>
        </button>
      </div>

      <!-- Search Input Bar (Image 2: Search... with magnifying glass) -->
      <div class="relative">
        <input
          v-model="search"
          type="text"
          placeholder="Search song title or artist..."
          class="w-full rounded-2xl bg-white px-5 py-3 text-sm text-slate-800 placeholder:text-slate-400 border border-slate-200 shadow-md focus:outline-none focus:ring-2 focus:ring-[#79287a]/50 transition pr-10 font-brand"
        />
        <svg class="absolute right-4 top-3.5 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <!-- Loading / Empty States -->
      <div v-if="pending" class="py-16 text-center">
        <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#79287a] border-t-transparent"></div>
        <div class="mt-3 font-brand text-xs uppercase tracking-wider text-slate-500">Loading Player Records…</div>
      </div>

      <div v-else-if="sortedScores.length === 0" class="rounded-2xl bg-white p-8 text-center border border-slate-200 text-slate-500">
        <p class="font-brand font-semibold text-sm">No scores match the selected filters for this player.</p>
      </div>

      <!-- Score Cards List (Image 2 stacked cards) -->
      <div v-else class="space-y-4">
        <div
          v-for="item in sortedScores"
          :key="item.songId + '-' + item.ratingClass"
          class="rounded-3xl bg-white p-4 sm:p-5 border border-slate-200/90 shadow-lg hover:shadow-xl transition-shadow space-y-3"
        >
          <div class="flex items-start justify-between gap-3">
            <!-- Left: Song Jacket with Difficulty Badge attached below (Image 2) -->
            <div class="relative shrink-0 flex flex-col items-center">
              <div class="h-20 w-20 sm:h-24 sm:w-24 overflow-hidden rounded-2xl shadow-md bg-slate-100 border border-slate-200">
                <img
                  :src="item.jacketUrl"
                  :alt="item.songTitle"
                  class="h-full w-full object-cover"
                  loading="lazy"
                  @error="onJacketError"
                />
              </div>

              <!-- Difficulty Pill Chevron underneath jacket (Image 2) -->
              <div
                class="mt-1 -mb-1 px-2.5 py-0.5 rounded-full text-[10px] font-black font-mono text-white shadow-sm"
                :style="{ backgroundColor: getDifficultyColor(item.ratingClass) }"
              >
                {{ item.difficulty }} {{ Number(item.constant).toFixed(1) }}
              </div>
            </div>

            <!-- Center: Song Title, Artist, Grade & Score, Date Obtained (Image 2) -->
            <div class="flex-1 min-w-0 px-2 space-y-1">
              <div>
                <span class="text-[9px] uppercase font-bold tracking-widest text-slate-400 font-brand block">Title</span>
                <h3 class="font-brand font-black text-base sm:text-lg text-slate-900 leading-tight truncate">
                  {{ item.songTitle }}
                </h3>
              </div>

              <div>
                <span class="text-[9px] uppercase font-bold tracking-widest text-slate-400 font-brand block">Artist</span>
                <p class="text-xs text-slate-600 font-medium truncate">
                  {{ item.artist }}
                </p>
              </div>

              <!-- Grade & Score (EX+ 09,972,135) -->
              <div class="pt-1 flex items-baseline gap-2">
                <span class="font-brand font-black text-sm text-[#79287a]">
                  {{ item.grade }}
                </span>
                <span class="font-mono font-black text-base sm:text-lg tracking-wider text-slate-900">
                  {{ item.scoreFormatted }}
                </span>
              </div>

              <!-- Date Obtained & Play Rating -->
              <div class="pt-0.5">
                <span class="text-[9px] uppercase font-bold tracking-widest text-slate-400 font-brand block">Date Obtained</span>
                <div class="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <span>{{ item.dateObtained }}</span>
                  <span class="text-slate-300">·</span>
                  <span class="font-mono font-bold text-[#79287a] bg-[#79287a]/10 px-1.5 py-0.5 rounded text-[11px]">
                    ★ {{ item.recalculatedRating.toFixed(3) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Right: Clear Lamp Badge (Image 2: diamond jewel with C, F, PM, H, E, L) -->
            <div class="shrink-0 pt-3 pr-1">
              <LampBadge :lamp="item.lamp" :size="48" />
            </div>
          </div>

          <!-- Divider between cards: "—— ◇ ——" -->
          <div class="flex items-center justify-center pt-2">
            <div class="h-px flex-1 bg-slate-200"></div>
            <div class="mx-3 text-slate-300 text-[10px]">◇</div>
            <div class="h-px flex-1 bg-slate-200"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { PlayerProfile, PlayerScoreItem } from '~/types/leaderboard';
import LampBadge from '~/components/LampBadge.vue';

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
});

const route = useRoute();
const activeUserId = ref<number | null>(route.query.userId ? Number(route.query.userId) : null);
const selectedDiff = ref<number | null>(null);
const sortMode = ref<'rating' | 'date' | 'score'>('rating');
const search = ref('');

const difficultyOptions = [
  { rc: 0, code: 'PST', color: '#03a8e6' },
  { rc: 1, code: 'PRS', color: '#5bc446' },
  { rc: 2, code: 'FTR', color: '#79287a' },
  { rc: 4, code: 'ETR', color: '#4caed1' },
  { rc: 3, code: 'BYD', color: '#921a32' },
];

function getDifficultyColor(rc: number) {
  const match = difficultyOptions.find(d => d.rc === rc);
  return match ? match.color : '#79287a';
}

const { data, pending } = await useFetch('/api/admin/server/player-scores', {
  query: computed(() => ({
    userId: activeUserId.value || undefined,
    difficulty: selectedDiff.value !== null ? selectedDiff.value : undefined,
  })),
});

const players = computed<PlayerProfile[]>(() => data.value?.players || []);
const selectedPlayer = computed(() => data.value?.selectedPlayer || null);
const rawScores = computed<PlayerScoreItem[]>(() => data.value?.scores || []);

// Auto set active user if none set
watch(players, (list) => {
  if (!activeUserId.value && list.length > 0) {
    activeUserId.value = list[0]!.userId;
  }
}, { immediate: true });

const filteredScores = computed(() => {
  let list = rawScores.value;
  if (search.value.trim()) {
    const q = search.value.trim().toLowerCase();
    list = list.filter(s =>
      s.songTitle.toLowerCase().includes(q) ||
      s.artist.toLowerCase().includes(q) ||
      s.songId.toLowerCase().includes(q)
    );
  }
  return list;
});

const sortedScores = computed(() => {
  const list = [...filteredScores.value];
  if (sortMode.value === 'rating') {
    // Highest rating to lowest rating (Requested default)
    return list.sort((a, b) => b.recalculatedRating - a.recalculatedRating);
  }
  if (sortMode.value === 'date') {
    return list.sort((a, b) => b.playedAt - a.playedAt);
  }
  if (sortMode.value === 'score') {
    return list.sort((a, b) => b.score - a.score);
  }
  return list;
});

function onJacketError(e: Event) {
  const target = e.target as HTMLImageElement;
  target.src = '/favicon.svg';
}

function onAvatarError(e: Event) {
  const target = e.target as HTMLImageElement;
  target.src = '/storage/characters/0_icon.png';
}

function onBgError(e: Event) {
  const target = e.target as HTMLImageElement;
  target.style.display = 'none';
}
</script>

<style scoped>
.header-hexagon {
  clip-path: polygon(14px 0%, calc(100% - 14px) 0%, 100% 50%, calc(100% - 14px) 100%, 14px 100%, 0% 50%);
}

.diamond-btn {
  clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
}
</style>

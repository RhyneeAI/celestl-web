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
      <!-- Top Vignette -->
      <div class="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/40 to-transparent"></div>
    </div>

    <!-- Main Content Container (Arcaea Center Canvas) -->
    <div class="relative -mt-44 sm:-mt-48 mx-auto w-full max-w-[620px] px-4 pb-16 space-y-6">
      <!-- Title Badge: Hexagon "< SCORE DATA" (Image 2 Header in Dark Mode) -->
      <div class="flex justify-center">
        <NuxtLink
          to="/admin/scores"
          class="relative inline-flex items-center justify-center px-10 py-3.5 bg-[#16133e]/90 backdrop-blur-md rounded-2xl shadow-2xl border border-[#3f3c68]/60 header-hexagon transition-transform hover:scale-[1.01]"
        >
          <div class="flex items-center gap-3">
            <svg class="h-6 w-6 text-[#f768dd] stroke-[3.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <h1 class="font-brand font-black text-xl sm:text-2xl tracking-[0.18em] text-[#fffafa] uppercase">
              SCORE DATA
            </h1>
          </div>
        </NuxtLink>
      </div>

      <!-- Scope: Player Selector Dropdown (Admin Switcher) -->
      <div class="rounded-2xl bg-[#1a1d32] p-4 border border-[#16133e] shadow-xl space-y-2">
        <div class="flex items-center justify-between text-xs font-brand font-bold uppercase tracking-wider text-[#9a99a8]">
          <span>Active Player Profile</span>
          <span class="text-[#acff82] font-mono">{{ sortedScores.length }} record(s)</span>
        </div>

        <div class="flex items-center gap-3">
          <!-- Active Player Avatar Diamond -->
          <div class="h-11 w-11 rotate-45 overflow-hidden rounded-xl bg-gradient-to-tr from-[#79287a] to-[#03a8e6] p-0.5 shadow-md shrink-0 border border-white/20">
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
            class="flex-1 rounded-xl bg-[#0c0c22] px-3 py-2 text-sm font-bold text-[#fffafa] border border-[#3f3c68]/50 focus:outline-none focus:ring-2 focus:ring-[#f768dd] transition font-brand cursor-pointer"
          >
            <option
              v-for="p in players"
              :key="p.userId"
              :value="p.userId"
              class="bg-[#1a1d32] text-white"
            >
              {{ p.name }} ({{ p.userCode || `ID ${p.userId}` }}) — {{ p.totalScores }} plays
            </option>
          </select>

          <!-- Back to Global Leaderboards Button -->
          <NuxtLink
            to="/admin/scores"
            class="px-3 py-2 rounded-xl text-xs font-bold text-[#f768dd] hover:bg-[#f768dd]/10 transition shrink-0"
            title="View World Leaderboards"
          >
            Leaderboard →
          </NuxtLink>
        </div>
      </div>

      <!-- Controls Block: Sort by Dropdown (Image 2) -->
      <div class="rounded-2xl bg-[#1a1d32] border border-[#16133e] shadow-md p-3">
        <div class="flex items-center justify-between gap-3">
          <label class="text-xs font-bold text-[#9a99a8] uppercase tracking-wider font-brand shrink-0">
            Sort by:
          </label>
          <select
            v-model="sortMode"
            class="flex-1 rounded-xl bg-[#0c0c22] px-3 py-1.5 text-xs font-bold text-[#fffafa] border border-[#3f3c68]/40 focus:outline-none font-brand cursor-pointer"
          >
            <option value="rating" class="bg-[#1a1d32] text-white">Rating (Highest to Lowest)</option>
            <option value="date" class="bg-[#1a1d32] text-white">Date Obtained (Newest First)</option>
            <option value="score" class="bg-[#1a1d32] text-white">Score (Highest to Lowest)</option>
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
              ? 'bg-[#79287a] text-white border-[#f768dd]/50 scale-105 shadow-lg'
              : 'bg-[#1a1d32] text-[#9a99a8] border-[#16133e] hover:bg-[#1e203a] hover:text-white'
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
              ? 'scale-110 shadow-xl text-white'
              : 'bg-[#1a1d32] text-[#9a99a8] hover:scale-105 border border-[#16133e] hover:text-white'
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
          class="w-full rounded-2xl bg-[#1a1d32] px-5 py-3 text-sm text-[#fffafa] placeholder:text-[#6f6e80] border border-[#16133e] shadow-md focus:outline-none focus:ring-2 focus:ring-[#f768dd]/50 transition pr-10 font-brand"
        />
        <svg class="absolute right-4 top-3.5 h-4 w-4 text-[#6f6e80]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <!-- Loading / Empty States -->
      <div v-if="pending" class="py-16 text-center">
        <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#f768dd] border-t-transparent"></div>
        <div class="mt-3 font-brand text-xs uppercase tracking-wider text-[#9a99a8]">Loading Player Records…</div>
      </div>

      <div v-else-if="sortedScores.length === 0" class="rounded-2xl bg-[#1a1d32] p-8 text-center border border-[#16133e] text-[#9a99a8]">
        <p class="font-brand font-semibold text-sm">No scores match the selected filters for this player.</p>
      </div>

      <!-- Score Cards List (Image 2 stacked cards in Dark Mode) -->
      <div v-else class="space-y-4">
        <div
          v-for="item in sortedScores"
          :key="item.songId + '-' + item.ratingClass"
          class="rounded-3xl bg-[#1a1d32] hover:bg-[#1e203a] p-4 sm:p-5 border border-[#16133e] hover:border-[#3f3c68]/60 shadow-xl transition-all space-y-3"
        >
          <div class="flex items-start justify-between gap-3">
            <!-- Left: Song Jacket with Difficulty Badge attached below (Image 2) -->
            <div class="relative shrink-0 flex flex-col items-center">
              <div class="h-20 w-20 sm:h-24 sm:w-24 overflow-hidden rounded-2xl shadow-md bg-[#0c0c22] border border-[#16133e]">
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
                class="mt-1.5 -mb-1 px-2.5 py-0.5 rounded-full text-[10px] font-black font-mono text-white shadow-sm"
                :style="{ backgroundColor: getDifficultyColor(item.ratingClass) }"
              >
                {{ item.difficulty }} {{ Number(item.constant).toFixed(1) }}
              </div>
            </div>

            <!-- Center: Song Title, Artist, Grade & Score, Date Obtained (Image 2) -->
            <div class="flex-1 min-w-0 px-2 space-y-1">
              <div>
                <span class="text-[9px] uppercase font-bold tracking-widest text-[#6f6e80] font-brand block">Title</span>
                <h3 class="font-brand font-black text-base sm:text-lg text-[#fffafa] leading-tight truncate">
                  {{ item.songTitle }}
                </h3>
              </div>

              <div>
                <span class="text-[9px] uppercase font-bold tracking-widest text-[#6f6e80] font-brand block">Artist</span>
                <p class="text-xs text-[#9a99a8] font-medium truncate">
                  {{ item.artist }}
                </p>
              </div>

              <!-- Grade & Score (EX+ 09,972,135) -->
              <div class="pt-1 flex items-baseline gap-2">
                <span class="font-brand font-black text-sm text-[#f768dd]">
                  {{ item.grade }}
                </span>
                <span class="font-mono font-black text-base sm:text-lg tracking-wider text-[#ffd76a]">
                  {{ item.scoreFormatted }}
                </span>
              </div>

              <!-- Date Obtained & Play Rating -->
              <div class="pt-0.5">
                <span class="text-[9px] uppercase font-bold tracking-widest text-[#6f6e80] font-brand block">Date Obtained</span>
                <div class="flex items-center gap-2 text-xs text-[#9a99a8] font-medium">
                  <span>{{ item.dateObtained }}</span>
                  <span class="text-[#3f3c68]">·</span>
                  <span class="font-mono font-bold text-[#acff82] bg-[#acff82]/10 px-1.5 py-0.5 rounded text-[11px] border border-[#acff82]/20">
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
            <div class="h-px flex-1 bg-[#16133e]"></div>
            <div class="mx-3 text-[#3f3c68] text-[10px]">◇</div>
            <div class="h-px flex-1 bg-[#16133e]"></div>
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

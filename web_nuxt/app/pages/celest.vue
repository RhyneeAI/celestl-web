<template>
  <div class="space-y-6">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div class="flex items-center gap-2.5">
          <span class="inline-block h-3 w-3 rounded-full bg-[#f768dd] shadow-[0_0_10px_#f768dd]"></span>
          <h1 class="text-2xl sm:text-3xl font-black font-brand tracking-tight text-[#fffafa]">
            Celest Network Charts
          </h1>
          <span class="rounded-full bg-[#f768dd]/15 px-2.5 py-0.5 text-[11px] font-mono font-bold text-[#f768dd] border border-[#f768dd]/30">
            YTTA
          </span>
        </div>
        <p class="text-xs sm:text-[13px] text-[#9a99a8] mt-1.5">
          Exclusive custom arrangements, chart creations, and server tracks available on the Celest Arcaea client.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <NuxtLink
          to="/calculator"
          class="rounded-xl bg-[#16133e] px-4 py-2 text-xs font-semibold text-[#f768dd] hover:bg-[#1e203a] border border-[#f768dd]/30 transition-colors flex items-center gap-1.5"
        >
          <span>Rating Calculator</span>
          <span>↗</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Sticky Search & Filter Controls -->
    <div class="sticky top-[58px] z-20 -mx-4 bg-[#0c0c22]/95 px-4 pt-1 pb-3 backdrop-blur sm:-mx-6 sm:px-6 space-y-3">
      <!-- Search Input -->
      <div class="relative">
        <input
          v-model="search"
          type="search"
          placeholder="Search custom charts by title, artist, or charter…"
          class="w-full rounded-full bg-[#1a1d32] px-5 py-3 text-[14px] text-[#fffafa] placeholder-[#6f6e80] focus:outline-none focus:ring-2 focus:ring-[#f768dd]/60 transition-all font-brand"
        />
        <button
          v-if="search"
          type="button"
          class="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#9a99a8] hover:text-[#fffafa]"
          @click="search = ''"
        >
          ✕
        </button>
      </div>

      <!-- Quick Filter Bar -->
      <div class="flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
        <!-- Difficulty Badges Filter -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            @click="diffFilter = null"
            :class="[
              'px-3 py-1 rounded-xl font-bold font-mono text-[11px] transition-colors',
              diffFilter === null
                ? 'bg-[#16133e] text-[#f768dd] border border-[#f768dd]/50'
                : 'bg-[#1a1d32] text-[#9a99a8] hover:text-white'
            ]"
          >
            ALL DIFFS
          </button>
          <button
            v-for="d in ['PST', 'PRS', 'FTR', 'BYD', 'ETR']"
            :key="d"
            type="button"
            @click="diffFilter = diffFilter === d ? null : d"
            :class="[
              'px-2.5 py-1 rounded-xl font-bold font-mono text-[11px] transition-colors',
              diffFilter === d
                ? 'bg-[#f768dd] text-[#0c0c22] font-black'
                : 'bg-[#1a1d32] text-[#9a99a8] hover:text-white'
            ]"
          >
            {{ d }}
          </button>
        </div>

        <span class="text-[12px] text-[#6f6e80] font-mono">
          Showing {{ filteredSongs.length }} of {{ allSongs.length }} songs
        </span>
      </div>
    </div>

    <!-- Song Grid -->
    <div v-if="filteredSongs.length > 0" class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      <div
        v-for="song in visibleSongs"
        :key="song.id"
        class="group min-w-0 rounded-2xl p-2.5 transition-colors bg-[#1a1d32]/60 hover:bg-[#1e203a] border border-[#16133e] hover:border-[#f768dd]/40 flex flex-col justify-between"
      >
        <!-- Jacket Artwork Frame -->
        <div
          class="aspect-square w-full rounded-xl shadow-md relative overflow-hidden bg-[#0c0c22] flex items-center justify-center text-xs font-bold font-brand tracking-wider"
          :style="{ background: jacketGradient(song.id) }"
        >
          <img
            :src="song.jacket"
            :alt="song.title"
            loading="lazy"
            class="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            @error="(e: Event) => (e.target as HTMLElement).style.display = 'none'"
          />
          <div class="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors pointer-events-none"></div>

          <!-- Fallback title preview -->
          <span class="text-white/40 drop-shadow select-none text-[10px] pointer-events-none">
            {{ song.title.slice(0, 3).toUpperCase() }}
          </span>

          <!-- BPM Badge (Top Left) -->
          <div
            v-if="song.bpm"
            class="absolute top-1.5 left-1.5 rounded-md bg-black/70 backdrop-blur-sm px-1.5 py-0.5 text-[9.5px] font-mono font-bold text-white/90 shadow-sm border border-white/10"
          >
            {{ song.bpm }} BPM
          </div>

          <!-- Side Badge (Top Right) -->
          <div
            v-if="song.side"
            class="absolute top-1.5 right-1.5 rounded-md bg-[#0c0c22]/80 backdrop-blur-sm px-1.5 py-0.5 text-[9px] font-mono uppercase text-[#acff82] border border-white/10"
          >
            {{ song.side }}
          </div>
        </div>

        <!-- Info Meta -->
        <div class="mt-2.5 flex-1 min-w-0">
          <p class="line-clamp-2 break-words text-[13px] font-semibold leading-snug text-[#fffafa] group-hover:text-[#f768dd] transition-colors font-brand">
            {{ song.title }}
          </p>
          <p class="mt-1 line-clamp-1 text-[11px] text-[#9a99a8]">
            {{ song.artist }}
          </p>

          <!-- Difficulty Badges Pill -->
          <div class="mt-2 flex flex-wrap gap-1">
            <span
              v-for="d in song.diffs"
              :key="d.difficulty"
              :class="[
                'px-1.5 py-0.5 rounded text-[10px] font-mono font-bold',
                getDiffPillColor(d.difficulty)
              ]"
              :title="`${d.difficulty} ${d.level} (Constant ${d.constant}) • Charter: ${d.chart_designer}`"
            >
              {{ d.difficulty }} {{ d.level }}
            </span>
          </div>
        </div>

        <!-- Card Footer Actions -->
        <div class="mt-3 pt-2 border-t border-[#3f3c68]/20 flex items-center justify-between text-[11px]">
          <span class="text-[#6f6e80] font-mono truncate max-w-[90px]">
            {{ song.diffs[song.diffs.length - 1]?.chart_designer || '-' }}
          </span>
          <NuxtLink
            :to="`/calculator?song=${song.id}&title=${encodeURIComponent(song.title)}&diff=${song.diffs[song.diffs.length - 1]?.difficulty.toLowerCase() || 'ftr'}`"
            class="text-[#f768dd] hover:underline font-semibold font-brand"
          >
            Calculate →
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="mt-12 rounded-3xl bg-[#1a1d32] p-12 text-center border border-[#16133e]">
      <p class="text-base font-semibold text-[#fffafa] font-brand">No custom charts found</p>
      <p class="mt-1 text-xs text-[#9a99a8]">Try adjusting your search query or selected difficulty filter.</p>
    </div>

    <!-- Load More Trigger -->
    <div v-if="visibleCount < filteredSongs.length" class="text-center py-6">
      <button
        type="button"
        class="rounded-full bg-[#1a1d32] px-6 py-2.5 text-xs font-semibold text-[#fffafa] hover:bg-[#1e203a] border border-[#3f3c68]/40 transition-colors cursor-pointer"
        @click="visibleCount += 40"
      >
        Load More ({{ filteredSongs.length - visibleCount }} remaining)
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { jacketGradient } from '~/utils/jacket';
import type { CelestSongItem } from '~~/server/api/celest/songs.get';

useHead({
  title: 'Celest Network Charts — Custom Charts & Server Tracks',
});

const { data } = await useFetch<{ total: number; songs: CelestSongItem[] }>('/api/celest/songs');
const allSongs = computed(() => data.value?.songs || []);

const search = ref('');
const diffFilter = ref<string | null>(null);
const visibleCount = ref(40);

const filteredSongs = computed(() => {
  const q = search.value.trim().toLowerCase();
  return allSongs.value.filter((s) => {
    // Difficulty filter
    if (diffFilter.value) {
      const hasDiff = s.diffs.some((d) => d.difficulty.toUpperCase() === diffFilter.value);
      if (!hasDiff) return false;
    }

    // Query filter
    if (!q) return true;
    const matchCharter = s.diffs.some((d) => d.chart_designer.toLowerCase().includes(q));
    return (
      s.title.toLowerCase().includes(q) ||
      s.artist.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q) ||
      matchCharter
    );
  });
});

const visibleSongs = computed(() => {
  return filteredSongs.value.slice(0, visibleCount.value);
});

function getDiffPillColor(diff: string) {
  switch (diff.toUpperCase()) {
    case 'PST':
      return 'bg-pst/20 text-pst border border-pst/40';
    case 'PRS':
      return 'bg-prs/20 text-prs border border-prs/40';
    case 'FTR':
      return 'bg-ftr/20 text-ftr border border-ftr/40';
    case 'BYD':
      return 'bg-byd/20 text-byd border border-byd/40';
    case 'ETR':
      return 'bg-etr/20 text-etr border border-etr/40';
    default:
      return 'bg-gray-500/20 text-gray-300 border border-gray-500/40';
  }
}
</script>

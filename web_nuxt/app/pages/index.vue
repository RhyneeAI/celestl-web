<template>
  <div class="space-y-4">
    <!-- Search Bar (Sticky Pill) -->
    <div class="sticky top-[58px] z-20 -mx-4 bg-[#0c0c22]/95 px-4 pt-1 pb-3 backdrop-blur sm:-mx-6 sm:px-6">
      <div class="relative">
        <input
          v-model="search"
          type="search"
          placeholder="Search songs, artists, or packs..."
          class="w-full rounded-full bg-[#1a1d32] px-5 py-3 text-[14px] text-[#fffafa] placeholder-[#6f6e80] focus:outline-none focus:ring-2 focus:ring-[#03a8e6]/60 transition-all"
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

      <div class="mt-2 flex items-center justify-between px-2 text-[12px] text-[#6f6e80]">
        <span>Showing {{ filteredSongs.length }} of {{ allSongs.length }} official songs</span>
        <NuxtLink to="/packs" class="text-[#03a8e6] hover:underline">View Packs →</NuxtLink>
      </div>
    </div>

    <!-- Song Grid -->
    <div v-if="filteredSongs.length > 0" class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      <NuxtLink
        v-for="song in visibleSongs"
        :key="song.slug"
        :to="`/songs/${song.slug}`"
        class="group min-w-0 rounded-2xl p-2.5 transition-colors hover:bg-[#1e203a] border border-transparent hover:border-[#3f3c68]/30 flex flex-col"
      >
        <!-- Jacket Artwork / Artwork Image with Fallback Gradient -->
        <div
          class="aspect-square w-full rounded-xl shadow-md flex items-center justify-center text-xs font-bold font-brand tracking-wider relative overflow-hidden bg-[#0c0c22]"
          :style="{ background: jacketGradient(song.slug) }"
        >
          <img
            :src="`/api/jacket/${song.slug}`"
            :alt="song.title"
            loading="lazy"
            class="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            @error="(e: Event) => (e.target as HTMLElement).style.display = 'none'"
          />
          <div class="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors pointer-events-none"></div>

          <!-- Fallback initials (visible if image fails or before load) -->
          <span class="text-white/40 drop-shadow select-none text-[10px] pointer-events-none">
            {{ song.title.slice(0, 3).toUpperCase() }}
          </span>

          <!-- Length badge (Top Left) -->
          <div
            v-if="song.length"
            class="absolute top-1.5 left-1.5 rounded-md bg-black/70 backdrop-blur-sm px-1.5 py-0.5 text-[9.5px] font-mono font-bold text-white/90 shadow-sm border border-white/10"
          >
            {{ song.length }}
          </div>

          <!-- Difficulty count dots (Bottom Right) -->
          <div class="absolute bottom-1.5 right-1.5 flex gap-0.5 rounded-full bg-black/60 backdrop-blur-sm px-1.5 py-1 border border-white/10">
            <span
              v-for="c in song.charts"
              :key="c.difficulty"
              :class="['h-1.5 w-1.5 rounded-full', getDiffBg(c.difficulty)]"
            ></span>
          </div>
        </div>

        <!-- Info -->
        <div class="mt-2.5 flex-1 min-w-0">
          <p class="line-clamp-2 break-words text-[13px] font-semibold leading-snug text-[#fffafa] group-hover:text-[#f768dd] transition-colors font-brand">
            {{ song.title }}
          </p>
          <p class="mt-1 line-clamp-1 text-[11px] text-[#9a99a8]">
            {{ song.artist }}
          </p>
          <div class="mt-1 flex items-center justify-between text-[10px] font-mono text-[#6f6e80]">
            <span v-if="song.pack" class="truncate max-w-[100px]">{{ song.pack }}</span>
            <span v-if="song.bpm" class="ml-auto shrink-0">{{ song.bpm }} BPM</span>
          </div>
        </div>
      </NuxtLink>
    </div>

    <!-- Empty State -->
    <div v-else class="mt-12 rounded-3xl bg-[#1a1d32] p-12 text-center border border-[#16133e]">
      <p class="text-base font-semibold text-[#fffafa]">No matching songs found</p>
      <p class="mt-1 text-xs text-[#9a99a8]">Try adjusting your search terms or keywords.</p>
    </div>

    <!-- Load More Trigger -->
    <div v-if="visibleCount < filteredSongs.length" class="text-center py-6">
      <button
        type="button"
        class="rounded-full bg-[#1a1d32] px-6 py-2.5 text-xs font-semibold text-[#fffafa] hover:bg-[#1e203a] border border-[#3f3c68]/40 transition-colors"
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
import { DIFFICULTY_COLOR, type DifficultyCode } from '~/utils/difficulty';

const { data } = await useFetch('/api/songs');
const allSongs = computed(() => data.value?.songs || []);

const search = ref('');
const visibleCount = ref(40);

const filteredSongs = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return allSongs.value;
  return allSongs.value.filter(s =>
    s.title.toLowerCase().includes(q) ||
    s.artist.toLowerCase().includes(q) ||
    (s.packName && s.packName.toLowerCase().includes(q))
  );
});

const visibleSongs = computed(() => {
  return filteredSongs.value.slice(0, visibleCount.value);
});

function getDiffBg(diff: string) {
  return DIFFICULTY_COLOR[diff as DifficultyCode]?.[1] || 'bg-gray-400';
}
</script>

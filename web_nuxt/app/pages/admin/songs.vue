<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-[#fffafa] font-brand">Official Songs & Charts</h1>
        <p class="text-sm text-[#9a99a8]">View and inspect official Arcaea catalogue songs, difficulty levels, and constants.</p>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="flex flex-col sm:flex-row gap-3">
      <div class="relative flex-1">
        <input
          v-model="search"
          type="text"
          placeholder="Filter by title, artist, or slug..."
          class="w-full rounded-2xl bg-[#1a1d32] px-4 py-2.5 text-sm text-[#fffafa] placeholder-[#6f6e80] border border-[#3f3c68]/40 focus:border-[#f768dd] focus:outline-none transition-colors"
        />
      </div>
      <select
        v-model="selectedPack"
        class="rounded-2xl bg-[#1a1d32] px-4 py-2.5 text-sm text-[#fffafa] border border-[#3f3c68]/40 focus:border-[#f768dd] focus:outline-none"
      >
        <option value="">All Packs ({{ allSongs.length }} songs)</option>
        <option v-for="pack in uniquePacks" :key="pack" :value="pack">{{ pack }}</option>
      </select>
    </div>

    <!-- Table -->
    <div class="rounded-3xl bg-[#1a1d32] border border-[#16133e] overflow-hidden shadow-xl">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-[#0c0c22] border-b border-[#16133e] text-[#6f6e80] uppercase tracking-wider font-bold">
            <tr>
              <th class="py-3 px-4">Song</th>
              <th class="py-3 px-4">Pack</th>
              <th class="py-3 px-4">Difficulties & Constants</th>
              <th class="py-3 px-4">BPM</th>
              <th class="py-3 px-4">Version</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#16133e]/60">
            <template v-for="song in pagedSongs" :key="song.id">
              <tr
                class="hover:bg-[#1e203a] transition-colors cursor-pointer"
                @click="expandedSongId = expandedSongId === song.id ? null : song.id"
              >
                <td class="py-3 px-4">
                  <div class="font-semibold text-sm text-[#fffafa]">{{ song.title }}</div>
                  <div class="text-[11px] text-[#9a99a8]">{{ song.artist }}</div>
                </td>
                <td class="py-3 px-4 text-[#9a99a8] font-medium">
                  {{ song.packName || 'Single' }}
                </td>
                <td class="py-3 px-4">
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="c in song.charts"
                      :key="c.difficulty"
                      :class="['px-1.5 py-0.5 rounded text-[10px] font-bold', getDiffColor(c.difficulty)[1], 'text-[#0c0c22]']"
                    >
                      {{ c.difficulty }} {{ c.level }} ({{ c.constant ? c.constant.toFixed(1) : '?' }})
                    </span>
                  </div>
                </td>
                <td class="py-3 px-4 font-mono text-[#9a99a8]">{{ song.bpm || '—' }}</td>
                <td class="py-3 px-4 font-mono text-[#9a99a8]">{{ song.version || '—' }}</td>
              </tr>

              <!-- Expanded Details Row -->
              <tr v-if="expandedSongId === song.id" class="bg-[#0c0c22]/80">
                <td colspan="5" class="p-4 border-t border-[#3f3c68]/20">
                  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                    <div
                      v-for="c in song.charts"
                      :key="c.difficulty"
                      class="rounded-xl bg-[#1a1d32] p-2.5 border border-[#3f3c68]/30 space-y-1"
                    >
                      <div class="flex justify-between items-center">
                        <span :class="['text-xs font-bold', getDiffColor(c.difficulty)[0]]">{{ c.difficulty }}</span>
                        <span class="font-extrabold text-sm text-[#fffafa]">{{ c.level }}</span>
                      </div>
                      <div class="text-[11px] text-[#9a99a8] flex justify-between">
                        <span>Constant:</span>
                        <span class="font-mono text-[#acff82] font-semibold">{{ c.constant ? c.constant.toFixed(1) : '—' }}</span>
                      </div>
                      <div class="text-[11px] text-[#9a99a8] flex justify-between">
                        <span>Notes:</span>
                        <span class="font-mono text-[#fffafa]">{{ c.noteCount || '—' }}</span>
                      </div>
                      <div class="text-[10px] text-[#6f6e80] truncate pt-1 border-t border-[#3f3c68]/20">
                        {{ c.chartDesigner || 'No designer' }}
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between border-t border-[#16133e] px-4 py-3 text-xs text-[#9a99a8]">
        <span>Showing {{ pagedSongs.length }} of {{ filteredSongs.length }} songs</span>
        <div class="flex gap-1">
          <button
            type="button"
            :disabled="page <= 1"
            class="rounded-lg bg-[#0c0c22] px-3 py-1 font-semibold disabled:opacity-30 hover:bg-[#1e203a] transition-colors"
            @click="page--"
          >
            Previous
          </button>
          <span class="px-2 py-1 font-mono text-[#fffafa]">Page {{ page }} / {{ maxPage }}</span>
          <button
            type="button"
            :disabled="page >= maxPage"
            class="rounded-lg bg-[#0c0c22] px-3 py-1 font-semibold disabled:opacity-30 hover:bg-[#1e203a] transition-colors"
            @click="page++"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { DIFFICULTY_COLOR, type DifficultyCode } from '~/utils/difficulty';

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
});

const { data } = await useFetch('/api/songs');
const allSongs = computed(() => data.value?.songs || []);

const search = ref('');
const selectedPack = ref('');
const expandedSongId = ref<number | null>(null);
const page = ref(1);
const perPage = 25;

const uniquePacks = computed(() => {
  const set = new Set<string>();
  for (const s of allSongs.value) {
    if (s.packName) set.add(s.packName);
  }
  return Array.from(set).sort();
});

const filteredSongs = computed(() => {
  let list = allSongs.value;
  if (selectedPack.value) {
    list = list.filter(s => s.packName === selectedPack.value);
  }
  if (search.value.trim()) {
    const q = search.value.trim().toLowerCase();
    list = list.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.artist.toLowerCase().includes(q) ||
      s.slug.toLowerCase().includes(q)
    );
  }
  return list;
});

const maxPage = computed(() => Math.max(1, Math.ceil(filteredSongs.value.length / perPage)));

const pagedSongs = computed(() => {
  const start = (page.value - 1) * perPage;
  return filteredSongs.value.slice(start, start + perPage);
});

function getDiffColor(diff: string) {
  return DIFFICULTY_COLOR[diff as DifficultyCode] || ['text-gray-400', 'bg-gray-400'];
}
</script>

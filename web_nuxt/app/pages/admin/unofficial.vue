<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-[#fffafa] font-brand">Private Server Custom Charts</h1>
        <p class="text-sm text-[#9a99a8]">Manage and inspect custom fanmade charts deployed on ArcaeaServerFork.</p>
      </div>

      <div class="flex items-center gap-2">
        <span class="rounded-xl bg-[#16133e] px-3 py-1.5 text-xs font-mono text-[#acff82] border border-[#acff82]/30">
          {{ serverSongs.length }} Custom Songs Deployed
        </span>
      </div>
    </div>

    <!-- Search Input -->
    <div class="relative">
      <input
        v-model="search"
        type="text"
        placeholder="Search custom server songs by ID, title, or artist..."
        class="w-full rounded-2xl bg-[#1a1d32] px-4 py-2.5 text-sm text-[#fffafa] placeholder-[#6f6e80] border border-[#3f3c68]/40 focus:border-[#f768dd] focus:outline-none transition-colors"
      />
    </div>

    <!-- Table of Custom Songs -->
    <div class="rounded-3xl bg-[#1a1d32] border border-[#16133e] overflow-hidden shadow-xl">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-[#0c0c22] border-b border-[#16133e] text-[#6f6e80] uppercase tracking-wider font-bold">
            <tr>
              <th class="py-3 px-4">Song ID</th>
              <th class="py-3 px-4">Title & Artist</th>
              <th class="py-3 px-4">Difficulties & Constants</th>
              <th class="py-3 px-4">BPM</th>
              <th class="py-3 px-4">Remote DL</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#16133e]/60">
            <tr
              v-for="song in pagedSongs"
              :key="song.id"
              class="hover:bg-[#1e203a] transition-colors"
            >
              <td class="py-3 px-4 font-mono font-bold text-[#f768dd]">{{ song.id }}</td>
              <td class="py-3 px-4">
                <div class="font-semibold text-sm text-[#fffafa]">{{ song.title }}</div>
                <div class="text-[11px] text-[#9a99a8]">{{ song.artist }}</div>
              </td>
              <td class="py-3 px-4">
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="d in song.difficulties"
                    :key="d.ratingClass"
                    :class="['px-1.5 py-0.5 rounded text-[10px] font-bold', getDiffBg(d.ratingClass)]"
                  >
                    {{ getDiffName(d.ratingClass) }} {{ d.rating }} ({{ Number(d.constant).toFixed(1) }})
                  </span>
                </div>
              </td>
              <td class="py-3 px-4 font-mono text-[#9a99a8]">{{ song.bpm }}</td>
              <td class="py-3 px-4">
                <span
                  :class="[
                    'px-2 py-0.5 rounded-full text-[10px] font-bold font-mono',
                    song.remoteDl ? 'bg-[#acff82]/20 text-[#acff82]' : 'bg-[#e14763]/20 text-[#e14763]'
                  ]"
                >
                  {{ song.remoteDl ? 'remote_dl' : 'offline' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between border-t border-[#16133e] px-4 py-3 text-xs text-[#9a99a8]">
        <span>Showing {{ pagedSongs.length }} of {{ filteredSongs.length }} server songs</span>
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

definePageMeta({
  layout: 'admin'
});

const { data } = await useFetch('/api/admin/server/songs');
const serverSongs = computed(() => data.value?.songs || []);

const search = ref('');
const page = ref(1);
const perPage = 25;

const filteredSongs = computed(() => {
  if (!search.value.trim()) return serverSongs.value;
  const q = search.value.trim().toLowerCase();
  return serverSongs.value.filter(s =>
    s.id.toLowerCase().includes(q) ||
    s.title.toLowerCase().includes(q) ||
    s.artist.toLowerCase().includes(q)
  );
});

const maxPage = computed(() => Math.max(1, Math.ceil(filteredSongs.value.length / perPage)));

const pagedSongs = computed(() => {
  const start = (page.value - 1) * perPage;
  return filteredSongs.value.slice(start, start + perPage);
});

function getDiffName(rc: number) {
  switch (rc) {
    case 0: return 'PST';
    case 1: return 'PRS';
    case 2: return 'FTR';
    case 3: return 'BYD';
    case 4: return 'ETR';
    case 5: return 'INS';
    default: return `RC${rc}`;
  }
}

function getDiffBg(rc: number) {
  switch (rc) {
    case 0: return 'bg-[#03a8e6] text-[#0c0c22]';
    case 1: return 'bg-[#acff82] text-[#0c0c22]';
    case 2: return 'bg-[#f768dd] text-[#0c0c22]';
    case 3: return 'bg-[#e14763] text-[#fffafa]';
    case 4: return 'bg-[#8975a8] text-[#fffafa]';
    case 5: return 'bg-[#7474dc] text-[#fffafa]';
    default: return 'bg-gray-500 text-white';
  }
}
</script>

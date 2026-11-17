<template>
  <div>
    <!-- Split Layout: Master (Song List) & Detail (Song & Chart Info) -->
    <div class="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(400px,1fr)]">
      <!-- Left Panel: Songs & charts List -->
      <section class="overflow-hidden rounded-2xl bg-[#1a1d32] border border-[#16133e] shadow-xl">
        <!-- Panel Head -->
        <div class="flex flex-wrap items-center gap-2.5 px-4 py-[13px] border-b border-[#16133e]">
          <h2 class="text-[15px] font-semibold text-[#fffafa] font-brand">Songs & charts</h2>
          <span class="rounded-full bg-[#1e203a] px-[9px] py-[2px] text-[11px] font-bold text-[#9a99a8]">
            {{ filtered.length }} / {{ songs.length }} songs
          </span>
          <span class="ml-auto flex items-center gap-2">
            <!-- Sort By Select -->
            <select
              v-model="sortBy"
              class="rounded-lg bg-[#1e203a] px-2.5 py-1.5 text-xs font-semibold text-[#fffafa] border border-[#3f3c68]/40 focus:outline-none focus:ring-1 focus:ring-[#f768dd] cursor-pointer"
            >
              <option value="title">Title (A–Z)</option>
              <option value="pack">Pack</option>
              <option value="date">Newest</option>
              <option value="bpm">BPM</option>
              <option value="cc">Highest constant</option>
            </select>

            <!-- + Add Song Button -->
            <button
              type="button"
              @click="addSongOpen = true"
              class="rounded-[11px] bg-[#3f3c68] px-3.5 py-2 text-[12.5px] font-semibold text-[#fffafa] hover:bg-[#4a4780] transition-colors cursor-pointer"
            >
              + Add song
            </button>
          </span>
        </div>

        <!-- Filter Row -->
        <div class="flex flex-wrap items-center gap-1.5 px-4 pt-3 pb-3">
          <input
            v-model="query"
            type="search"
            placeholder="Search title, artist, pack…"
            class="min-w-[160px] flex-1 rounded-lg bg-[#1e203a] px-3 py-1.5 text-[12.5px] text-[#fffafa] placeholder:text-[#6f6e80] border border-[#3f3c68]/30 focus:border-[#f768dd] focus:outline-none transition-colors"
          />
          <span
            v-if="packFilter"
            class="flex items-center gap-1.5 rounded-[9px] bg-[#16133e] px-3 py-1.5 text-[11.5px] font-bold text-[#acff82] border border-[#acff82]/30"
          >
            Pack: {{ packFilter }}
            <button
              type="button"
              aria-label="Clear pack filter"
              @click="packFilter = null"
              class="font-bold hover:text-white transition-colors cursor-pointer"
            >
              ✕
            </button>
          </span>
        </div>

        <!-- Scrollable Song List -->
        <div class="flex h-[calc(100vh-210px)] flex-col overflow-y-auto">
          <!-- Empty State -->
          <div v-if="filtered.length === 0" class="p-9 text-center text-[#9a99a8]">
            <b class="mb-1 block text-[#fffafa] font-brand">No songs match</b>
            Change the filter, pack, or search text.
          </div>

          <!-- Song Items -->
          <button
            v-for="song in filtered"
            :key="song.id"
            type="button"
            :aria-current="song.id === selectedId"
            @click="selectedId = song.id"
            :class="[
              'flex w-full items-center gap-3 border-t border-[#0c0c22] px-4 py-2.5 text-left first:border-t-0 hover:bg-[#1e203a] transition-colors cursor-pointer',
              song.id === selectedId ? 'bg-[#16133e] border-l-2 border-l-[#f768dd]' : ''
            ]"
          >
            <!-- Jacket Thumbnail (38px) -->
            <div
              class="size-[38px] flex-none rounded-[10px] bg-cover bg-center shadow-sm border border-white/5 overflow-hidden"
              :style="{ background: artworkBackground(song.jacket, song.title) }"
            />

            <!-- Title & Artist -->
            <div class="min-w-0 flex-1">
              <b class="block overflow-hidden text-[14.5px] font-bold text-ellipsis whitespace-nowrap text-[#fffafa]">
                {{ song.title }}
              </b>
              <span class="block overflow-hidden text-[12px] text-ellipsis whitespace-nowrap text-[#9a99a8]">
                {{ song.artist || 'Unknown artist' }}
              </span>
            </div>

            <!-- Difficulties Levels on Right -->
            <div class="flex flex-none items-center gap-1.5">
              <b
                v-for="(d, i) in song.diffs"
                :key="d.difficulty"
                :title="d.constant ? `Constant: ${d.constant}` : '—'"
                :class="[
                  'text-[11.5px] font-bold font-mono',
                  i > 0 ? 'border-l border-[#6f6e80]/40 pl-1.5' : '',
                  getDiffColor(d.difficulty)
                ]"
              >
                {{ d.level }}
              </b>
            </div>
          </button>
        </div>
      </section>

      <!-- Right Panel: Selected Song Details -->
      <section class="overflow-hidden rounded-2xl bg-[#1a1d32] border border-[#16133e] shadow-xl">
        <div v-if="!selected" class="p-10 text-center text-[13px] text-[#9a99a8]">
          No song selected
        </div>

        <div v-else class="p-[18px]">
          <!-- Aspect-video banner with click-to-zoom Lightbox -->
          <div class="relative mb-3.5">
            <button
              type="button"
              @click="lightboxBg = artworkBackground(currentBannerJacket, selected.title)"
              class="aspect-video w-full cursor-zoom-in rounded-2xl bg-cover bg-center shadow-lg border border-white/10 hover:brightness-105 transition-all overflow-hidden"
              :style="{ background: artworkBackground(currentBannerJacket, selected.title) }"
              title="Click to view full artwork"
            />
            <!-- If diff jacket preview is active, show badge indicator with reset button -->
            <div
              v-if="selectedDiff !== null"
              class="absolute top-2.5 right-2.5 flex items-center gap-1.5 rounded-lg bg-black/75 backdrop-blur-md px-2.5 py-1 text-xs font-mono font-bold text-white border border-white/20 shadow-md"
            >
              <span>Previewing {{ selectedDiff }} Jacket</span>
              <button
                type="button"
                @click.stop="selectedDiff = null"
                class="hover:text-[#f768dd] ml-1 text-xs cursor-pointer"
                title="Reset to default jacket"
              >
                ✕
              </button>
            </div>
          </div>

          <!-- Title & Artist Header -->
          <div class="mb-3.5 flex flex-col gap-0.5">
            <h1 class="text-2xl leading-[1.2] font-bold text-[#fffafa] font-brand">
              {{ selected.title }}
            </h1>
            <span class="text-[13.5px] text-[#9a99a8]">
              {{ selected.artist || 'Unknown artist' }}
            </span>

            <!-- Metadata Grid -->
            <div class="mt-3 grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-2">
              <div
                v-for="[label, value] in metadataItems"
                :key="label"
                class="flex flex-col gap-0.5"
              >
                <span class="text-[10.5px] font-bold tracking-[0.08em] text-[#9a99a8] uppercase">
                  {{ label }}
                </span>
                <b class="text-[13px] font-semibold text-[#fffafa]">
                  {{ value ?? '—' }}
                </b>
              </div>
            </div>
          </div>

          <!-- Difficulty Charts Table -->
          <div class="overflow-x-auto rounded-xl border border-[#16133e]">
            <table class="w-full min-w-[540px] border-collapse text-[13.5px]">
              <thead>
                <tr>
                  <th
                    v-for="h in ['Diff', 'Level', 'Constant', 'Chart designer', 'Jacket designer', 'Notes']"
                    :key="h"
                    class="bg-[#1e203a] px-2.5 py-[7px] text-left text-[10.5px] tracking-[0.06em] text-[#6f6e80] uppercase font-bold"
                  >
                    {{ h }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="d in selected.diffs"
                  :key="d.difficulty"
                  @click="selectedDiff = selectedDiff === d.difficulty ? null : d.difficulty"
                  :class="[
                    'border-t border-[#0c0c22] hover:bg-[#1e203a]/50 transition-colors cursor-pointer',
                    selectedDiff === d.difficulty ? 'bg-[#16133e] ring-1 ring-inset ring-[#f768dd]' : ''
                  ]"
                >
                  <td :class="['px-2.5 py-2 font-bold font-mono flex items-center gap-1.5', getDiffColor(d.difficulty)]">
                    <span>{{ d.difficulty }}</span>
                    <span
                      v-if="d.jacket_override"
                      class="px-1.5 py-0.5 rounded text-[10px] font-sans font-bold bg-[#f768dd]/20 text-[#f768dd] border border-[#f768dd]/40"
                      title="Custom jacket override active"
                    >
                      Jacket
                    </span>
                  </td>
                  <td class="px-2.5 py-2 tabular-nums text-[#fffafa]">
                    {{ d.level }}
                  </td>
                  <td class="px-2.5 py-2 tabular-nums text-[#ffd76a] font-mono font-semibold">
                    {{ d.constant ?? '—' }}
                  </td>
                  <td class="px-2.5 py-2 text-xs text-[#9a99a8]">
                    {{ d.chart_designer || 'uncredited' }}
                  </td>
                  <td class="px-2.5 py-2 text-xs text-[#9a99a8]">
                    {{ d.jacket_designer || 'uncredited' }}
                  </td>
                  <td class="px-2.5 py-2 tabular-nums text-xs font-mono text-[#fffafa]">
                    {{ d.note_count ?? '—' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>

    <!-- Lightbox Modal (Click on Jacket Artwork) -->
    <Teleport to="body">
      <div
        v-if="lightboxBg"
        class="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-[#06060f]/85 p-8 backdrop-blur-[3px] animate-in fade-in duration-150"
        @click.self="lightboxBg = null"
      >
        <button
          type="button"
          aria-label="Close"
          @click="lightboxBg = null"
          class="fixed top-[22px] right-[26px] z-[51] flex size-[38px] items-center justify-center rounded-xl bg-[#1e203a] hover:bg-[#3f3c68] text-white transition-colors cursor-pointer"
        >
          ✕
        </button>
        <div
          class="aspect-square w-[min(74vw,560px)] rounded-[22px] bg-cover bg-center shadow-[0_24px_64px_-16px_rgba(0,0,0,.6)] border border-white/10 overflow-hidden"
          :style="{ background: lightboxBg }"
        />
      </div>
    </Teleport>

    <!-- Add Song Modal -->
    <Teleport to="body">
      <div
        v-if="addSongOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-[#06060f]/85 p-5 backdrop-blur-[3px] animate-in fade-in duration-150"
        @click.self="addSongOpen = false"
      >
        <div class="max-h-[calc(100vh-40px)] w-full max-w-[440px] overflow-y-auto rounded-[24px] bg-[#1a1d32] px-6 py-[22px] border border-[#16133e] text-[#fffafa] shadow-2xl">
          <!-- Modal Header -->
          <div class="mb-0.5 flex items-center gap-2.5">
            <h2 class="flex-1 text-[17px] font-bold font-brand">Add song</h2>
            <button
              type="button"
              aria-label="Close"
              @click="addSongOpen = false"
              class="flex size-6 flex-none items-center justify-center rounded-[7px] border border-[#3f3c68] bg-[#1e203a] text-sm hover:border-[#fffafa] text-[#9a99a8] hover:text-[#fffafa] transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
          <p class="mb-3.5 text-xs text-[#9a99a8]">
            Field lain (BPM, side, length, difficulty, level, constant, dll.) diisi sesudahnya dari panel detail — di sini cukup yang minimal untuk membuat entrinya dulu.
          </p>

          <!-- Modal Fields -->
          <div class="grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-2">
            <div class="flex flex-col gap-1">
              <label class="text-[10.5px] font-bold tracking-[0.08em] text-[#9a99a8] uppercase">Song name</label>
              <input
                v-model="newSong.title"
                placeholder="Song title"
                class="rounded-xl bg-[#0c0c22] px-3 py-2 text-xs text-[#fffafa] border border-[#3f3c68]/40 focus:border-[#f768dd] focus:outline-none"
                autofocus
              />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-[10.5px] font-bold tracking-[0.08em] text-[#9a99a8] uppercase">Artist</label>
              <input
                v-model="newSong.artist"
                placeholder="Artist (kosongkan kalau tidak dikreditkan)"
                class="rounded-xl bg-[#0c0c22] px-3 py-2 text-xs text-[#fffafa] border border-[#3f3c68]/40 focus:border-[#f768dd] focus:outline-none"
              />
            </div>
            <div class="flex flex-col gap-1 sm:col-span-2">
              <label class="text-[10.5px] font-bold tracking-[0.08em] text-[#9a99a8] uppercase">Pack</label>
              <select
                v-model="newSong.pack"
                class="rounded-xl bg-[#0c0c22] px-3 py-2 text-xs text-[#fffafa] border border-[#3f3c68]/40 focus:border-[#f768dd] focus:outline-none cursor-pointer"
              >
                <optgroup
                  v-for="group in packOptions"
                  :key="group.label"
                  :label="group.label"
                >
                  <option
                    v-for="p in group.packs"
                    :key="p.name"
                    :value="p.name"
                  >
                    {{ p.is_child ? `— ${p.name}` : p.name }}
                  </option>
                </optgroup>
              </select>
            </div>
          </div>

          <!-- Jacket Art Upload Section -->
          <div class="mt-3.5 border-t-0 pt-0">
            <span class="text-[10.5px] font-bold tracking-[0.1em] text-[#9a99a8] uppercase block mb-1.5">
              Jacket art
            </span>
            <div class="flex items-center gap-3.5">
              <button
                type="button"
                :disabled="!uploadPreview"
                @click="uploadPreview && (lightboxBg = `url(${uploadPreview}) center/cover`)"
                class="size-[120px] flex-none rounded-2xl bg-[#0c0c22] bg-cover bg-center border border-[#3f3c68]/40 disabled:cursor-default overflow-hidden"
                :style="uploadPreview ? { backgroundImage: `url(${uploadPreview})` } : {}"
              />
              <div class="flex flex-col items-start gap-2">
                <label class="cursor-pointer rounded-[11px] border border-dashed border-[#3f3c68] px-3.5 py-2 text-[12.5px] font-semibold text-[#9a99a8] hover:border-[#fffafa] hover:text-[#fffafa] transition-colors">
                  ↑ Upload image
                  <input
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="onFileSelected"
                  />
                </label>
                <span class="text-[11.5px] text-[#6f6e80]">
                  {{ uploadFileName || 'No file — click preview to zoom once uploaded' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="mt-4 flex items-center gap-2.5 border-t border-dashed border-[#0c0c22] pt-3.5">
            <button
              type="button"
              @click="saveNewSong"
              class="rounded-[11px] bg-[#3f3c68] px-3.5 py-2 text-[12.5px] font-semibold text-[#fffafa] hover:bg-[#4a4780] transition-colors cursor-pointer"
            >
              Save
            </button>
            <button
              type="button"
              @click="addSongOpen = false"
              class="rounded-[11px] bg-[#1e203a] px-3.5 py-2 text-[12.5px] font-semibold text-[#9a99a8] hover:bg-[#0c0c22] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <span class="ml-auto text-[11px] text-[#6f6e80]">
              Prototipe
            </span>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { artworkBackground } from '~/utils/jacket';
import { DIFFICULTY_COLOR, type DifficultyCode } from '~/utils/difficulty';

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
});

useHead({
  title: 'Admin · Songs & charts',
});

export type ChartRow = {
  difficulty: DifficultyCode;
  level: string;
  constant: string | null;
  chart_designer: string | null;
  jacket_designer: string | null;
  note_count: number | null;
  jacket_override?: boolean;
  jacket?: string;
};

export type SongRow = {
  id: number;
  slug: string;
  title: string;
  artist: string | null;
  jacket: string | null;
  jacket_full: string | null;
  pack: string | null;
  side: string | null;
  bpm: string | null;
  length: string | null;
  version: string | null;
  released_at: string | null;
  diffs: ChartRow[];
};

export type SortBy = 'title' | 'pack' | 'date' | 'bpm' | 'cc';

const route = useRoute();
const query = ref<string>(route.query.q ? String(route.query.q) : '');
const sortBy = ref<SortBy>('title');
const packFilter = ref<string | null>(route.query.pack ? String(route.query.pack) : null);
const selectedId = ref<number | null>(null);
const selectedDiff = ref<string | null>(null);
const addSongOpen = ref(false);
const lightboxBg = ref<string | null>(null);

// Reset difficulty selection when changing selected song
watch(selectedId, () => {
  selectedDiff.value = null;
});

// Upload state for Add Song modal
const newSong = ref({
  title: '',
  artist: '',
  pack: 'Arcaea',
});
const uploadPreview = ref<string | null>(null);
const uploadFileName = ref<string | null>(null);

function onFileSelected(e: Event) {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  uploadFileName.value = file.name;
  uploadPreview.value = URL.createObjectURL(file);
}

function saveNewSong() {
  addSongOpen.value = false;
  uploadPreview.value = null;
  uploadFileName.value = null;
  newSong.value = { title: '', artist: '', pack: 'Arcaea' };
}

// Fetch Songs & Packs
const { data: songsData } = await useFetch('/api/songs');
const { data: packsData } = await useFetch('/api/packs');

const songs = computed<SongRow[]>(() => {
  return (songsData.value?.songs || []) as SongRow[];
});

// Auto-select first song
watch(
  songs,
  (list) => {
    if (!selectedId.value && list.length > 0) {
      selectedId.value = list[0]!.id;
    }
  },
  { immediate: true }
);

// Grouped Pack Options
const packOptions = computed(() => {
  const sections = packsData.value?.sections || {};
  return Object.entries(sections).map(([label, packs]: [string, any[]]) => ({
    label,
    packs: packs.flatMap((p) => [
      { name: p.name, is_child: false },
      ...(p.children || []).map((c: any) => ({ name: c.name, is_child: true })),
    ]),
  }));
});

function maxConstant(song: SongRow): number {
  return Math.max(
    0,
    ...song.diffs.map((d) => (d.constant ? parseFloat(d.constant) : 0))
  );
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function getDiffColor(diff: string) {
  const c = DIFFICULTY_COLOR[diff as DifficultyCode];
  return c ? c[0] : 'text-gray-400';
}

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  const rows = songs.value.filter(
    (s) =>
      (!packFilter.value || s.pack === packFilter.value) &&
      (!q ||
        s.title.toLowerCase().includes(q) ||
        (s.pack ?? '').toLowerCase().includes(q) ||
        (s.artist ?? '').toLowerCase().includes(q))
  );

  const sorters: Record<SortBy, (a: SongRow, b: SongRow) => number> = {
    title: (a, b) => a.title.localeCompare(b.title),
    pack: (a, b) => (a.pack ?? '').localeCompare(b.pack ?? '') || a.title.localeCompare(b.title),
    date: (a, b) => (b.released_at ?? '').localeCompare(a.released_at ?? ''),
    bpm: (a, b) => (parseFloat(b.bpm ?? '0') || 0) - (parseFloat(a.bpm ?? '0') || 0),
    cc: (a, b) => maxConstant(b) - maxConstant(a),
  };

  return [...rows].sort(sorters[sortBy.value]);
});

const selected = computed(() => {
  return songs.value.find((s) => s.id === selectedId.value) || null;
});

const currentBannerJacket = computed(() => {
  if (!selected.value) return '';
  if (selectedDiff.value !== null) {
    return `/api/jacket/${selected.value.slug}?diff=${selectedDiff.value.toLowerCase()}`;
  }
  return selected.value.jacket_full || selected.value.jacket;
});

const metadataItems = computed(() => {
  if (!selected.value) return [];
  const s = selected.value;
  return [
    ['Pack', s.pack],
    ['Side', s.side],
    ['BPM', s.bpm],
    ['Length', s.length ?? 'not in this source'],
    ['Released', formatDate(s.released_at)],
    ['Version', s.version],
  ] as const;
});

// Global Keyboard listener for Lightbox
function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    if (lightboxBg.value) lightboxBg.value = null;
    else if (addSongOpen.value) addSongOpen.value = false;
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

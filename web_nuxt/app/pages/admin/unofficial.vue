<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-[#fffafa] font-brand">Private Server Charts (.aff)</h1>
        <p class="text-sm text-[#9a99a8]">Inspect deployed custom songs on ArcaeaServerFork, verify rating classes, and tune chart constants.</p>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs text-[#9a99a8]">Custom Server Songs:</span>
        <span class="rounded-full bg-[#1a1d32] px-3 py-1 font-mono text-xs font-bold text-[#f768dd] border border-[#16133e]">
          {{ serverSongs.length }}
        </span>
      </div>
    </div>

    <!-- Search filter -->
    <div class="flex flex-col sm:flex-row gap-3">
      <input
        v-model="search"
        type="text"
        placeholder="Filter by song id, title, or artist..."
        class="w-full sm:max-w-md rounded-2xl bg-[#1a1d32] px-4 py-2.5 text-sm text-[#fffafa] placeholder-[#6f6e80] border border-[#3f3c68]/40 focus:border-[#f768dd] focus:outline-none transition-colors"
      />
    </div>

    <!-- Table -->
    <div class="rounded-3xl border border-[#16133e] bg-[#1a1d32] overflow-hidden shadow-2xl">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-[#0c0c22] border-b border-[#16133e] text-[#6f6e80] uppercase tracking-wider font-bold">
            <tr>
              <th class="py-3 px-4">Song ID</th>
              <th class="py-3 px-4">Title & Artist</th>
              <th class="py-3 px-4">Difficulties & Constants</th>
              <th class="py-3 px-4">BPM</th>
              <th class="py-3 px-4">DL Status</th>
              <th class="py-3 px-4 text-right">Actions</th>
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
                    {{ getDiffName(d.ratingClass) }} {{ d.rating }}{{ d.ratingPlus ? '+' : '' }} ({{ Number(d.constant).toFixed(1) }})
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
              <td class="py-3 px-4 text-right">
                <button
                  @click="openConstantModal(song)"
                  class="rounded-lg bg-[#3f3c68]/40 hover:bg-[#f768dd] hover:text-[#0c0c22] px-3 py-1 font-semibold text-[#fffafa] transition-colors"
                >
                  Edit Constant
                </button>
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

    <!-- Edit Constant Modal -->
    <div
      v-if="editingSong"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    >
      <div class="w-full max-w-lg rounded-3xl bg-[#1a1d32] p-6 border border-[#3f3c68]/40 shadow-2xl space-y-4">
        <h2 class="text-lg font-bold text-[#fffafa] font-brand">Tune Chart Constants</h2>
        <div class="font-mono text-xs text-[#f768dd]">{{ editingSong.title }} ({{ editingSong.id }})</div>

        <div class="space-y-4 text-xs">
          <div>
            <label class="block text-[#9a99a8] mb-1 font-medium">Select Difficulty Class</label>
            <select
              v-model.number="selectedRatingClass"
              @change="syncDiffForm"
              class="w-full rounded-xl bg-[#0c0c22] px-3 py-2 text-sm text-[#fffafa] border border-[#3f3c68]/40 focus:outline-none focus:border-[#f768dd]"
            >
              <option v-for="d in editingSong.difficulties" :key="d.ratingClass" :value="d.ratingClass">
                {{ getDiffName(d.ratingClass) }} — Current: {{ d.rating }}{{ d.ratingPlus ? '+' : '' }} ({{ Number(d.constant).toFixed(1) }})
              </option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[#9a99a8] mb-1 font-medium">Base Rating Level (e.g. 9)</label>
              <input
                v-model.number="diffForm.rating"
                type="number"
                min="0"
                max="13"
                class="w-full rounded-xl bg-[#0c0c22] px-3 py-2 text-sm text-[#fffafa] font-mono border border-[#3f3c68]/40 focus:outline-none focus:border-[#f768dd]"
              />
            </div>
            <div>
              <label class="block text-[#9a99a8] mb-1 font-medium">Chart Constant (e.g. 9.8)</label>
              <input
                v-model.number="diffForm.constant"
                type="number"
                step="0.1"
                min="0"
                max="14"
                class="w-full rounded-xl bg-[#0c0c22] px-3 py-2 text-sm text-[#ffd76a] font-mono border border-[#3f3c68]/40 focus:outline-none focus:border-[#f768dd]"
              />
            </div>
          </div>

          <label class="flex items-center gap-2 cursor-pointer pt-1">
            <input
              v-model="diffForm.ratingPlus"
              type="checkbox"
              class="rounded bg-[#0c0c22] border-[#3f3c68] text-[#f768dd] focus:ring-0"
            />
            <span class="text-[#fffafa]">Plus Modifier (+) (e.g. 9+ or 10+)</span>
          </label>
        </div>

        <div v-if="saveError" class="text-xs text-red-400">
          {{ saveError }}
        </div>

        <div class="flex justify-end gap-2 pt-2 border-t border-[#16133e]">
          <button
            @click="editingSong = null"
            class="rounded-xl bg-[#0c0c22] px-4 py-2 text-xs font-semibold text-[#9a99a8] hover:bg-[#1e203a]"
          >
            Cancel
          </button>
          <button
            @click="saveChartConstant"
            :disabled="saving"
            class="rounded-xl bg-[#f768dd] text-[#0c0c22] px-4 py-2 text-xs font-bold hover:opacity-90 disabled:opacity-50"
          >
            {{ saving ? 'Saving & Hot Reloading…' : 'Save & Hot Reload' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';

definePageMeta({
  layout: 'admin',
  middleware: ['admin']
});

const { data, refresh } = await useFetch('/api/admin/server/songs');
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

// Edit Modal
const editingSong = ref<any | null>(null);
const selectedRatingClass = ref(2);
const saving = ref(false);
const saveError = ref('');

const diffForm = reactive({
  rating: 0,
  constant: 0,
  ratingPlus: false,
});

function openConstantModal(song: any) {
  editingSong.value = song;
  saveError.value = '';
  const firstDiff = (song.difficulties || [])[0];
  selectedRatingClass.value = firstDiff?.ratingClass ?? 2;
  syncDiffForm();
}

function syncDiffForm() {
  if (!editingSong.value) return;
  const target = (editingSong.value.difficulties || []).find((d: any) => d.ratingClass === selectedRatingClass.value);
  if (target) {
    diffForm.rating = target.rating;
    diffForm.constant = target.constant || target.rating;
    diffForm.ratingPlus = Boolean(target.ratingPlus);
  }
}

async function saveChartConstant() {
  if (!editingSong.value) return;
  saving.value = true;
  saveError.value = '';

  try {
    await $fetch('/api/admin/server/charts/constant', {
      method: 'POST',
      body: {
        song_id: editingSong.value.id,
        ratingClass: selectedRatingClass.value,
        rating: diffForm.rating,
        ratingPlus: diffForm.ratingPlus,
        constant: diffForm.constant,
      },
    });

    editingSong.value = null;
    await refresh();
  } catch (err: any) {
    saveError.value = err?.data?.statusMessage || err.message || 'Failed to update constant';
  } finally {
    saving.value = false;
  }
}
</script>

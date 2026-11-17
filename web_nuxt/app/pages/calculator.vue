<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-[#fffafa] font-brand">Rating Calculator</h1>
        <p class="text-sm text-[#9a99a8]">Calculate Arcaea play ratings real-time with accurate +0.2 clear bonus.</p>
      </div>
    </div>

    <!-- Main Grid -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- Calculator Controls (Left 2 cols) -->
      <div class="space-y-6 lg:col-span-2">
        <!-- Song Search & Select Card -->
        <div class="rounded-3xl bg-[#1a1d32] p-5 sm:p-6 border border-[#16133e] space-y-4">
          <label class="block text-xs font-bold uppercase tracking-wider text-[#6f6e80]">1. Select Song</label>
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search by title, artist, or slug..."
              class="w-full rounded-2xl bg-[#0c0c22] px-4 py-3 text-sm text-[#fffafa] placeholder-[#6f6e80] border border-[#3f3c68]/40 focus:border-[#f768dd] focus:outline-none transition-colors"
            />
            <!-- Search Results Dropdown -->
            <div
              v-if="searchQuery && filteredSongs.length > 0"
              class="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl bg-[#1e203a] border border-[#3f3c68] shadow-2xl p-1.5 space-y-1"
            >
              <button
                v-for="s in filteredSongs"
                :key="s.slug"
                type="button"
                class="w-full flex items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-[#16133e] transition-colors"
                @click="selectSong(s)"
              >
                <div class="min-w-0 pr-2">
                  <div class="truncate text-sm font-semibold text-[#fffafa]">{{ s.title }}</div>
                  <div class="truncate text-xs text-[#9a99a8]">{{ s.artist }}</div>
                </div>
                <div class="flex gap-1 shrink-0">
                  <span
                    v-for="c in s.charts"
                    :key="c.difficulty"
                    :class="['px-1.5 py-0.5 rounded text-[10px] font-bold', getDifficultyColor(c.difficulty)[1], 'text-[#0c0c22]']"
                  >
                    {{ c.difficulty }} {{ c.level }}
                  </span>
                </div>
              </button>
            </div>
          </div>

          <!-- Selected Song Banner -->
          <div v-if="selectedSong" class="flex items-center gap-4 rounded-2xl bg-[#16133e]/60 p-3.5 border border-[#3f3c68]/30">
            <div
              class="h-14 w-14 rounded-xl shadow shrink-0 flex items-center justify-center font-bold text-xs"
              :style="{ background: jacketGradient(selectedSong.slug) }"
            >
              {{ selectedSong.title.slice(0, 2).toUpperCase() }}
            </div>
            <div class="min-w-0 flex-1">
              <div class="truncate font-brand font-bold text-base text-[#fffafa]">{{ selectedSong.title }}</div>
              <div class="truncate text-xs text-[#9a99a8]">{{ selectedSong.artist }} &bull; {{ selectedSong.packName || 'Single' }}</div>
            </div>
          </div>

          <!-- Difficulty Selector -->
          <div v-if="selectedSong" class="space-y-2">
            <label class="block text-xs font-bold uppercase tracking-wider text-[#6f6e80]">2. Select Difficulty</label>
            <div class="grid grid-cols-3 sm:grid-cols-6 gap-2">
              <button
                v-for="c in selectedSong.charts"
                :key="c.difficulty"
                type="button"
                :class="[
                  'flex flex-col items-center justify-center rounded-2xl py-2.5 px-2 border transition-all',
                  selectedDifficulty === c.difficulty
                    ? 'border-[#f768dd] bg-[#16133e] shadow-[0_0_12px_rgba(247,104,221,0.25)]'
                    : 'border-[#3f3c68]/30 bg-[#0c0c22] hover:bg-[#1e203a]'
                ]"
                @click="selectedDifficulty = c.difficulty"
              >
                <span :class="['text-xs font-bold', getDifficultyColor(c.difficulty)[0]]">{{ c.difficulty }}</span>
                <span class="text-sm font-extrabold text-[#fffafa]">{{ c.level }}</span>
                <span class="text-[11px] font-mono text-[#9a99a8]">cc: {{ c.constant ? c.constant.toFixed(1) : '?' }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Score & Lamp Input Card -->
        <div class="rounded-3xl bg-[#1a1d32] p-5 sm:p-6 border border-[#16133e] space-y-5">
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-xs font-bold uppercase tracking-wider text-[#6f6e80]">3. Enter Score</label>
              <span class="font-mono text-xs text-[#9a99a8]">Formatted: {{ formatScore(score) }}</span>
            </div>
            <input
              v-model.number="score"
              type="number"
              min="0"
              max="10002000"
              step="1"
              class="w-full rounded-2xl bg-[#0c0c22] px-4 py-3 text-lg font-mono font-bold text-[#fffafa] border border-[#3f3c68]/40 focus:border-[#f768dd] focus:outline-none transition-colors"
            />
            <!-- Quick Score Buttons -->
            <div class="flex flex-wrap gap-2 pt-1">
              <button
                v-for="preset in scorePresets"
                :key="preset.val"
                type="button"
                class="rounded-xl bg-[#0c0c22] px-3 py-1.5 text-xs font-mono font-medium text-[#9a99a8] hover:bg-[#1e203a] hover:text-[#fffafa] border border-[#3f3c68]/30 transition-colors"
                @click="score = preset.val"
              >
                {{ preset.label }}
              </button>
            </div>
          </div>

          <!-- Lamp Selector -->
          <div class="space-y-2">
            <label class="block text-xs font-bold uppercase tracking-wider text-[#6f6e80]">4. Select Clear Lamp</label>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                v-for="l in lamps"
                :key="l.key"
                type="button"
                :class="[
                  'rounded-xl py-2 px-3 text-xs font-bold border transition-colors flex items-center justify-between',
                  selectedLamp === l.key
                    ? 'border-[#f768dd] bg-[#16133e] text-[#fffafa]'
                    : 'border-[#3f3c68]/30 bg-[#0c0c22] text-[#9a99a8] hover:bg-[#1e203a]'
                ]"
                @click="selectedLamp = l.key"
              >
                <span>{{ l.label }}</span>
                <span v-if="l.key !== 'lost'" class="text-[10px] text-[#acff82]">+0.20</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Result Card & History (Right col) -->
      <div class="space-y-6">
        <!-- Live Rating Big Display Card -->
        <div class="rounded-3xl bg-gradient-to-br from-[#16133e] to-[#1a1d32] p-6 border border-[#f768dd]/30 shadow-2xl space-y-4 text-center">
          <div class="text-xs font-bold tracking-widest uppercase text-[#9a99a8]">Play Rating</div>
          <div class="text-5xl sm:text-6xl font-extrabold font-mono text-[#fffafa] tracking-tight">
            {{ calculatedRating !== null ? calculatedRating.toFixed(3) : '—' }}
          </div>
          <div class="flex items-center justify-center gap-3">
            <span class="rounded-xl bg-[#0c0c22] px-3 py-1 font-mono text-sm font-bold text-[#f768dd]">
              Grade: {{ calculatedGrade }}
            </span>
            <span v-if="activeChart?.constant" class="rounded-xl bg-[#0c0c22] px-3 py-1 font-mono text-xs text-[#9a99a8]">
              cc: {{ activeChart.constant.toFixed(1) }}
            </span>
          </div>
          <button
            type="button"
            :disabled="calculatedRating === null"
            :class="[
              'w-full rounded-2xl py-3 text-sm font-bold shadow transition-all',
              calculatedRating !== null
                ? 'bg-[#f768dd] text-[#0c0c22] hover:bg-[#f768dd]/90 cursor-pointer'
                : 'bg-[#3f3c68]/30 text-[#6f6e80] cursor-not-allowed'
            ]"
            @click="saveToHistory"
          >
            {{ justSaved ? '✓ Saved to History!' : 'Save to Calculation Log' }}
          </button>
        </div>

        <!-- Calculation Log / History -->
        <div class="rounded-3xl bg-[#1a1d32] p-5 border border-[#16133e] space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-bold uppercase tracking-wider text-[#6f6e80]">History Log (Local)</h3>
            <button
              v-if="history.length > 0"
              type="button"
              class="text-xs text-[#9a99a8] hover:text-[#fffafa]"
              @click="clearHistory"
            >
              Clear
            </button>
          </div>
          <div v-if="history.length === 0" class="py-6 text-center text-xs text-[#6f6e80]">
            No calculation records saved yet.
          </div>
          <div v-else class="space-y-1.5 max-h-80 overflow-y-auto pr-1">
            <div
              v-for="item in history"
              :key="item.id"
              class="flex items-center justify-between rounded-xl bg-[#0c0c22] p-2.5 text-xs border border-[#3f3c68]/20"
            >
              <div class="min-w-0 pr-2">
                <div class="truncate font-semibold text-[#fffafa]">{{ item.title }}</div>
                <div class="font-mono text-[11px] text-[#6f6e80]">
                  <span :class="getDifficultyColor(item.difficulty)[0]">{{ item.difficulty }}</span>
                  &bull; {{ formatScore(item.score) }}
                </div>
              </div>
              <div class="text-right shrink-0">
                <div class="font-mono font-bold text-sm text-[#fffafa]">{{ item.rating.toFixed(3) }}</div>
                <div class="text-[10px] text-[#9a99a8]">{{ item.grade }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { playRating, grade, formatScore, type Lamp } from '~/utils/arcaea-rating';
import { jacketGradient } from '~/utils/jacket';
import { DIFFICULTY_COLOR, type DifficultyCode } from '~/utils/difficulty';

const { data: songsData } = await useFetch('/api/songs');
const songs = computed(() => songsData.value?.songs || []);

const searchQuery = ref('');
const selectedSong = ref<any>(null);
const selectedDifficulty = ref<string>('FTR');
const score = ref<number>(9900000);
const selectedLamp = ref<Lamp>('normal_clear');
const justSaved = ref(false);

const lamps: { key: Lamp; label: string }[] = [
  { key: 'pure_memory', label: 'Pure Memory' },
  { key: 'full_recall', label: 'Full Recall' },
  { key: 'hard_clear', label: 'Hard Clear' },
  { key: 'normal_clear', label: 'Normal Clear' },
  { key: 'easy_clear', label: 'Easy Clear' },
  { key: 'lost', label: 'Track Lost' },
];

const scorePresets = [
  { label: 'PM (10.0M)', val: 10000000 },
  { label: 'EX+ (9.9M)', val: 9900000 },
  { label: 'EX (9.8M)', val: 9800000 },
  { label: 'AA (9.5M)', val: 9500000 },
];

const filteredSongs = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return [];
  return songs.value.filter(s =>
    s.title.toLowerCase().includes(q) ||
    s.artist.toLowerCase().includes(q) ||
    s.slug.toLowerCase().includes(q)
  ).slice(0, 20);
});

function selectSong(s: any) {
  selectedSong.value = s;
  searchQuery.value = '';
  const ftr = s.charts.find((c: any) => c.difficulty === 'FTR') || s.charts[s.charts.length - 1];
  selectedDifficulty.value = ftr?.difficulty || 'FTR';
}

// Auto-select first song on mount
onMounted(() => {
  if (songs.value.length > 0 && !selectedSong.value) {
    selectSong(songs.value[0]);
  }
  loadHistory();
});

const activeChart = computed(() => {
  if (!selectedSong.value) return null;
  return selectedSong.value.charts.find((c: any) => c.difficulty === selectedDifficulty.value) || null;
});

const calculatedRating = computed(() => {
  if (!activeChart.value || activeChart.value.constant === null) return null;
  return playRating(activeChart.value.constant, score.value, selectedLamp.value);
});

const calculatedGrade = computed(() => grade(score.value));

function getDifficultyColor(diff: string) {
  return DIFFICULTY_COLOR[diff as DifficultyCode] || ['text-gray-300', 'bg-gray-500'];
}

// Local storage history
interface HistoryItem {
  id: string;
  title: string;
  difficulty: string;
  score: number;
  rating: number;
  grade: string;
  date: string;
}

const history = ref<HistoryItem[]>([]);

function loadHistory() {
  if (import.meta.client) {
    try {
      const raw = localStorage.getItem('celestl_rating_history');
      if (raw) history.value = JSON.parse(raw);
    } catch (e) {}
  }
}

function saveToHistory() {
  if (calculatedRating.value === null || !selectedSong.value) return;
  const item: HistoryItem = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: selectedSong.value.title,
    difficulty: selectedDifficulty.value,
    score: score.value,
    rating: calculatedRating.value,
    grade: calculatedGrade.value,
    date: new Date().toISOString(),
  };
  history.value.unshift(item);
  history.value = history.value.slice(0, 100);
  if (import.meta.client) {
    localStorage.setItem('celestl_rating_history', JSON.stringify(history.value));
  }
  justSaved.value = true;
  setTimeout(() => justSaved.value = false, 1500);
}

function clearHistory() {
  history.value = [];
  if (import.meta.client) {
    localStorage.removeItem('celestl_rating_history');
  }
}
</script>

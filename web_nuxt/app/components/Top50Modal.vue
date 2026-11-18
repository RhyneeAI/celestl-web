<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
    <!-- Modal Container: Portrait constrained (max-w-[680px]) -->
    <div class="relative w-full max-w-[680px] max-h-[96vh] flex flex-col rounded-3xl bg-[#0c0c22] border border-[#2b2d4f] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      
      <!-- Top Action & Navigation Bar -->
      <div class="flex flex-wrap items-center justify-between gap-2.5 px-4 py-3 bg-[#14162e] border-b border-[#2b2d4f] shrink-0">
        <div class="flex items-center gap-2.5">
          <div class="h-2.5 w-2.5 rounded-full bg-[#f768dd] shadow-[0_0_8px_#f768dd]"></div>
          <div>
            <h2 class="text-sm font-bold font-brand text-[#fffafa] flex items-center gap-2">
              <span>Top 50 (B50)</span>
              <span class="text-[11px] px-2 py-0.5 rounded-full bg-[#1e203a] text-[#ffd76a] font-mono font-normal">
                {{ player?.name || 'Player' }}
              </span>
            </h2>
            <p class="text-[10px] text-[#9a99a8]">
              Arcaea Portrait B50 Poster &bull; Modern +0.2 clear formula
            </p>
          </div>
        </div>

        <!-- Export Actions & View Mode -->
        <div class="flex items-center gap-2">
          <!-- View Filter Tabs (All / Top 25 / Next 25) -->
          <div class="flex items-center rounded-xl bg-[#0c0c22] p-0.5 border border-[#2b2d4f]">
            <button
              type="button"
              @click="viewMode = 'all'"
              :class="[
                'px-2 py-1 text-[10px] font-bold rounded-lg transition-all',
                viewMode === 'all'
                  ? 'bg-[#1e203a] text-[#fffafa] shadow'
                  : 'text-[#9a99a8] hover:text-[#fffafa]'
              ]"
            >
              All 50
            </button>
            <button
              type="button"
              @click="viewMode = 'top25'"
              :class="[
                'px-2 py-1 text-[10px] font-bold rounded-lg transition-all',
                viewMode === 'top25'
                  ? 'bg-[#1e203a] text-[#f768dd] shadow'
                  : 'text-[#9a99a8] hover:text-[#fffafa]'
              ]"
            >
              #1–25
            </button>
            <button
              type="button"
              @click="viewMode = 'next25'"
              :class="[
                'px-2 py-1 text-[10px] font-bold rounded-lg transition-all',
                viewMode === 'next25'
                  ? 'bg-[#1e203a] text-[#70a6ff] shadow'
                  : 'text-[#9a99a8] hover:text-[#fffafa]'
              ]"
            >
              #26–50
            </button>
          </div>

          <!-- Download PNG Button -->
          <button
            type="button"
            :disabled="generating"
            @click="downloadImage"
            class="px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-[#9b51e0] via-[#f768dd] to-[#03a8e6] text-[#0c0c22] hover:opacity-90 shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Download high-resolution Portrait PNG"
          >
            <svg v-if="generating" class="h-3.5 w-3.5 animate-spin text-[#0c0c22]" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            <svg v-else class="h-3.5 w-3.5 text-[#0c0c22]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>{{ generating ? 'Generating…' : 'PNG' }}</span>
          </button>

          <!-- Copy Image Button -->
          <button
            type="button"
            :disabled="generating"
            @click="copyImage"
            class="p-1.5 rounded-xl bg-[#1a1d35] hover:bg-[#252849] text-[#70a6ff] border border-[#3f426b] transition-all cursor-pointer disabled:opacity-50"
            :title="copied ? 'Copied to clipboard!' : 'Copy Image to Clipboard'"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
          </button>

          <!-- Close Button -->
          <button
            type="button"
            @click="emit('close')"
            class="p-1.5 rounded-xl bg-[#1a1d35] hover:bg-red-950/40 text-[#9a99a8] hover:text-red-400 border border-[#3f426b] transition-colors cursor-pointer"
            title="Close"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Scrollable Preview Area -->
      <div class="flex-1 overflow-auto p-2 sm:p-4 flex justify-center bg-[#070814]">
        <!-- The Portrait Canvas (Export target: 580px width, 9:16 portrait aspect ratio) -->
        <div
          ref="exportCanvasRef"
          id="b50-export-canvas"
          class="relative w-[580px] shrink-0 rounded-2xl overflow-hidden shadow-2xl p-4 border border-[#232747]"
          style="background: linear-gradient(180deg, #0d0f22 0%, #12142a 50%, #0a0b18 100%);"
        >
          <!-- Background Cathedral Artwork with Vignette -->
          <div class="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <img
              src="/storage/backgrounds/base_conflict.jpg"
              alt="Cathedral Wallpaper"
              class="w-full h-full object-cover object-center filter brightness-[0.22] saturate-150 scale-105"
              crossorigin="anonymous"
            />
            <div class="absolute inset-0 bg-gradient-to-b from-[#0c0d1e]/85 via-[#0e1024]/85 to-[#080914]/95"></div>
            <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[220px] bg-gradient-to-b from-[#9b51e0]/20 to-transparent blur-3xl pointer-events-none"></div>
          </div>

          <!-- Board Header -->
          <div class="relative z-10 flex items-center justify-between mb-3 px-1">
            <!-- Left: Logo -->
            <div class="w-1/4">
              <div class="font-brand font-black text-lg tracking-[0.2em] text-white drop-shadow">
                ARCAEA
              </div>
              <div class="text-[7.5px] text-[#9a99a8] tracking-[0.1em] italic opacity-80 leading-none mt-0.5">
                New Dimension
              </div>
            </div>

            <!-- Center: Player Nameplate Banner -->
            <div class="flex-1 flex justify-center">
              <div
                class="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/20 shadow-lg"
                style="background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(20, 22, 45, 0.85) 100%);"
              >
                <!-- Name & ID -->
                <div class="text-right">
                  <div class="text-[12px] font-black font-brand text-[#fffafa] leading-tight truncate max-w-[120px]">
                    {{ player?.name || 'Anonymous' }}
                  </div>
                  <div class="text-[7.5px] font-mono text-[#9a99a8] leading-none">
                    ID: {{ player?.userCode || '000000000' }}
                  </div>
                </div>

                <!-- Diamond Character Avatar -->
                <div class="relative h-8 w-8 rotate-45 overflow-hidden rounded-lg bg-gradient-to-tr from-[#9b51e0] via-[#f768dd] to-[#03a8e6] p-0.5 shadow shrink-0 border border-white/30">
                  <div class="relative h-full w-full overflow-hidden rounded-md bg-slate-950">
                    <img
                      :src="player?.characterAvatar || '/storage/characters/0_icon.png'"
                      alt="Avatar"
                      class="absolute inset-[-25%] h-[150%] w-[150%] max-w-none -rotate-45 object-cover"
                      crossorigin="anonymous"
                    />
                  </div>
                </div>

                <!-- Rating & B50 Badge -->
                <div>
                  <div
                    class="px-1.5 py-0.5 rounded text-[9px] font-black font-mono shadow-sm border flex items-center gap-0.5 leading-none"
                    :class="[pttStyle.bg, pttStyle.border]"
                  >
                    <span>{{ pttStyle.stars }}</span>
                    <span>{{ Number(player?.ratingPtt || b50Avg).toFixed(3) }}</span>
                  </div>
                  <div class="text-[7.5px] font-mono text-[#acff82] mt-0.5 font-bold leading-none">
                    B50: {{ b50Avg }} &bull; B10: {{ b10Avg }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Right: Timestamp -->
            <div class="w-1/4 text-right">
              <div class="text-[7.5px] uppercase tracking-wider text-[#9a99a8] leading-none">
                Generated on:
              </div>
              <div class="text-[10.5px] font-black font-mono text-[#ffd76a] leading-tight mt-0.5">
                {{ currentDate }}
              </div>
            </div>
          </div>

          <!-- SECTION 1: Best #1 – #25 (5 Rows x 5 Cards = 25 Cards) -->
          <div v-if="viewMode === 'all' || viewMode === 'top25'" class="relative z-10">
            <div class="grid grid-cols-5 gap-1.5">
              <div
                v-for="(item, idx) in cardsGroup1"
                :key="`g1-${idx}`"
                class="relative rounded-lg border border-white/10 shadow p-1 flex flex-col justify-between overflow-hidden"
                style="background: linear-gradient(135deg, rgba(26, 29, 53, 0.92) 0%, rgba(14, 16, 32, 0.96) 100%); height: 80px;"
              >
                <!-- Row 1: Rank + Potential + Grade -->
                <div class="flex items-center justify-between leading-none">
                  <span
                    class="px-1 py-0.5 rounded text-[8px] font-black font-mono"
                    :class="idx < 10 ? 'bg-[#3b2b68] text-[#f768dd] border border-[#f768dd]/40' : 'bg-[#1e2342] text-[#9bb4ff]'"
                  >
                    #{{ idx + 1 }}
                  </span>
                  <span class="text-[9px] font-black font-mono text-[#ffd76a]">
                    {{ item ? Number(item.recalculatedRating).toFixed(3) : '—' }}
                  </span>
                  <span
                    v-if="item"
                    class="px-1 py-0.5 rounded text-[7px] font-black leading-none"
                    :class="getGradeBadgeClass(item.grade)"
                  >
                    {{ item.grade }}
                  </span>
                  <span v-else class="text-[7.5px] text-[#6f6e80] font-mono">—</span>
                </div>

                <!-- Row 2: Score + Mini Jacket with badges -->
                <div class="flex items-center justify-between gap-1 mt-0.5">
                  <div class="flex flex-col justify-center min-w-0">
                    <span class="text-[6px] font-bold text-[#8a8aa3] uppercase tracking-wider leading-none">SCORE</span>
                    <span class="font-mono font-bold text-[8.5px] text-white tracking-tight truncate drop-shadow-sm mt-0.5">
                      {{ item ? formatScoreArcaea(item.score) : "00'000'000" }}
                    </span>
                  </div>

                  <div class="relative h-[36px] w-[36px] shrink-0 rounded overflow-hidden bg-[#0c0c22] border border-white/10 shadow-sm">
                    <img
                      v-if="item"
                      :src="item.jacketUrl"
                      :alt="item.songTitle"
                      class="h-full w-full object-cover"
                      crossorigin="anonymous"
                      @error="onJacketError"
                    />
                    <div v-else class="h-full w-full flex items-center justify-center text-[7px] text-[#6f6e80]">
                      —
                    </div>

                    <div
                      v-if="item"
                      class="absolute top-0 right-0 px-0.5 text-[6.5px] font-black font-mono text-white rounded-bl leading-tight shadow-sm"
                      :class="getDiffBadgeColor(item.ratingClass)"
                    >
                      {{ item.ratingDisplay || item.difficulty }}
                    </div>

                    <div
                      v-if="item"
                      class="absolute bottom-0 right-0 px-0.5 text-[6.5px] font-black font-mono shadow-md text-white rounded-tl leading-tight"
                      :class="getLampBadgeColor(item.lamp)"
                    >
                      {{ getLampLetter(item.lamp) }}
                    </div>
                  </div>
                </div>

                <!-- Row 3: Song Title -->
                <div
                  class="text-[7.5px] font-bold text-white/95 truncate tracking-tight border-t border-white/5 pt-0.5 leading-none"
                  :title="item?.songTitle"
                >
                  {{ item ? item.songTitle : '—' }}
                </div>
              </div>
            </div>
          </div>

          <!-- Section Divider (Separation per 5 baris) -->
          <div
            v-if="viewMode === 'all'"
            class="relative z-10 flex items-center justify-center gap-2 my-2 text-[8px] font-brand font-bold uppercase tracking-widest text-[#9a99a8]"
          >
            <div class="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            <span class="px-2.5 py-0.5 rounded-full bg-[#181a33] border border-white/10 text-[#f768dd] shadow-sm">
              #26 – #50 Best Records
            </span>
            <div class="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          </div>

          <!-- SECTION 2: Best #26 – #50 (5 Rows x 5 Cards = 25 Cards) -->
          <div v-if="viewMode === 'all' || viewMode === 'next25'" class="relative z-10">
            <div class="grid grid-cols-5 gap-1.5">
              <div
                v-for="(item, idx) in cardsGroup2"
                :key="`g2-${idx}`"
                class="relative rounded-lg border border-white/10 shadow p-1 flex flex-col justify-between overflow-hidden"
                style="background: linear-gradient(135deg, rgba(26, 29, 53, 0.92) 0%, rgba(14, 16, 32, 0.96) 100%); height: 80px;"
              >
                <!-- Row 1: Rank + Potential + Grade -->
                <div class="flex items-center justify-between leading-none">
                  <span class="px-1 py-0.5 rounded text-[8px] font-black font-mono bg-[#1e2342] text-[#9bb4ff]">
                    #{{ idx + 26 }}
                  </span>
                  <span class="text-[9px] font-black font-mono text-[#ffd76a]">
                    {{ item ? Number(item.recalculatedRating).toFixed(3) : '—' }}
                  </span>
                  <span
                    v-if="item"
                    class="px-1 py-0.5 rounded text-[7px] font-black leading-none"
                    :class="getGradeBadgeClass(item.grade)"
                  >
                    {{ item.grade }}
                  </span>
                  <span v-else class="text-[7.5px] text-[#6f6e80] font-mono">—</span>
                </div>

                <!-- Row 2: Score + Mini Jacket with badges -->
                <div class="flex items-center justify-between gap-1 mt-0.5">
                  <div class="flex flex-col justify-center min-w-0">
                    <span class="text-[6px] font-bold text-[#8a8aa3] uppercase tracking-wider leading-none">SCORE</span>
                    <span class="font-mono font-bold text-[8.5px] text-white tracking-tight truncate drop-shadow-sm mt-0.5">
                      {{ item ? formatScoreArcaea(item.score) : "00'000'000" }}
                    </span>
                  </div>

                  <div class="relative h-[36px] w-[36px] shrink-0 rounded overflow-hidden bg-[#0c0c22] border border-white/10 shadow-sm">
                    <img
                      v-if="item"
                      :src="item.jacketUrl"
                      :alt="item.songTitle"
                      class="h-full w-full object-cover"
                      crossorigin="anonymous"
                      @error="onJacketError"
                    />
                    <div v-else class="h-full w-full flex items-center justify-center text-[7px] text-[#6f6e80]">
                      —
                    </div>

                    <div
                      v-if="item"
                      class="absolute top-0 right-0 px-0.5 text-[6.5px] font-black font-mono text-white rounded-bl leading-tight shadow-sm"
                      :class="getDiffBadgeColor(item.ratingClass)"
                    >
                      {{ item.ratingDisplay || item.difficulty }}
                    </div>

                    <div
                      v-if="item"
                      class="absolute bottom-0 right-0 px-0.5 text-[6.5px] font-black font-mono shadow-md text-white rounded-tl leading-tight"
                      :class="getLampBadgeColor(item.lamp)"
                    >
                      {{ getLampLetter(item.lamp) }}
                    </div>
                  </div>
                </div>

                <!-- Row 3: Song Title -->
                <div
                  class="text-[7.5px] font-bold text-white/95 truncate tracking-tight border-t border-white/5 pt-0.5 leading-none"
                  :title="item?.songTitle"
                >
                  {{ item ? item.songTitle : '—' }}
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="relative z-10 flex items-center justify-between mt-3 px-1 pt-2 border-t border-white/10 text-[7.5px] text-[#8a8aa3]">
            <div class="font-brand font-black text-white opacity-60">
              lowiro &bull; Celest Arcaea Server
            </div>
            <div class="font-mono text-[#ffd76a] font-semibold">
              {{ viewMode === 'all' ? '50 Records &bull; 5x10 Modern B50' : (viewMode === 'top25' ? 'Top 25 Records &bull; 5x5' : 'Next 25 Records &bull; 5x5') }}
            </div>
            <div class="font-brand font-bold text-white opacity-60">
              moe.cel.arc
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { toPng } from 'html-to-image';
import type { PlayerProfile, PlayerScoreItem } from '~/types/leaderboard';

const props = defineProps<{
  isOpen: boolean;
  player: PlayerProfile | null;
  scores: PlayerScoreItem[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const exportCanvasRef = ref<HTMLElement | null>(null);
const generating = ref(false);
const copied = ref(false);
const viewMode = ref<'all' | 'top25' | 'next25'>('all');

// Format date as YYYY/MM/DD
const currentDate = computed(() => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
});

// Top 50 scores sorted descending
const top50Scores = computed(() => {
  const list = [...(props.scores || [])];
  list.sort((a, b) => b.recalculatedRating - a.recalculatedRating);
  return list.slice(0, 50);
});

// Group 1: Best #1 to #25 (5 rows of 5)
const cardsGroup1 = computed(() => {
  const list = top50Scores.value.slice(0, 25);
  while (list.length < 25) {
    list.push(null as any);
  }
  return list;
});

// Group 2: Best #26 to #50 (5 rows of 5)
const cardsGroup2 = computed(() => {
  const list = top50Scores.value.slice(25, 50);
  while (list.length < 25) {
    list.push(null as any);
  }
  return list;
});

// B50 Average
const b50Avg = computed(() => {
  const list = top50Scores.value;
  if (!list.length) return '0.000';
  const sum = list.reduce((acc, s) => acc + s.recalculatedRating, 0);
  return (sum / list.length).toFixed(3);
});

// B10 Average
const b10Avg = computed(() => {
  const list = top50Scores.value.slice(0, 10);
  if (!list.length) return '0.000';
  const sum = list.reduce((acc, s) => acc + s.recalculatedRating, 0);
  return (sum / list.length).toFixed(3);
});

// Potential Emblem Style based on PTT value
const pttStyle = computed(() => {
  const ptt = Number(props.player?.ratingPtt || b50Avg.value) || 0;
  if (ptt >= 13.0) {
    return {
      bg: 'bg-gradient-to-r from-[#ffd76a] via-[#f768dd] to-[#03a8e6] text-[#0c0c22]',
      border: 'border-[#ffd76a]',
      stars: '★★★',
    };
  }
  if (ptt >= 12.5) {
    return {
      bg: 'bg-gradient-to-r from-[#8b1538] to-[#d82a6e] text-white',
      border: 'border-[#ff70a0]',
      stars: '★★',
    };
  }
  if (ptt >= 12.0) {
    return {
      bg: 'bg-gradient-to-r from-[#7a1832] to-[#b31f45] text-white',
      border: 'border-[#ff5983]',
      stars: '★',
    };
  }
  if (ptt >= 11.0) {
    return {
      bg: 'bg-[#881830] text-white',
      border: 'border-[#b52a48]',
      stars: '',
    };
  }
  if (ptt >= 10.0) {
    return {
      bg: 'bg-[#5b2a82] text-white',
      border: 'border-[#8e45c7]',
      stars: '',
    };
  }
  return {
    bg: 'bg-[#1e3a68] text-white',
    border: 'border-[#376bb8]',
    stars: '',
  };
});

function formatScoreArcaea(s: number): string {
  const padded = String(Math.max(0, Math.trunc(s || 0))).padStart(8, '0');
  return `${padded.slice(0, 2)}'${padded.slice(2, 5)}'${padded.slice(5, 8)}`;
}

function getGradeBadgeClass(grade: string): string {
  switch (grade) {
    case 'PM':
      return 'bg-gradient-to-r from-[#ffd76a] via-[#f768dd] to-[#03a8e6] text-[#0c0c22] font-black shadow-md';
    case 'EX+':
      return 'bg-[#4d2d6c] text-[#f768dd] border border-[#f768dd]/50 font-bold';
    case 'EX':
      return 'bg-[#3a2556] text-[#d672f0] border border-[#d672f0]/30 font-bold';
    case 'AA':
      return 'bg-[#242b58] text-[#70a6ff] border border-[#70a6ff]/30 font-bold';
    case 'A':
      return 'bg-[#1c384a] text-[#5cd5ff] border border-[#5cd5ff]/30';
    case 'B':
      return 'bg-[#1f3f26] text-[#69e083] border border-[#69e083]/30';
    case 'C':
      return 'bg-[#453618] text-[#ffd76a] border border-[#ffd76a]/30';
    default:
      return 'bg-[#441a1a] text-[#ff7070] border border-[#ff7070]/30';
  }
}

function getDiffBadgeColor(rc: number): string {
  switch (rc) {
    case 0: return 'bg-[#2084c6]'; // Past
    case 1: return 'bg-[#45a44a]'; // Present
    case 2: return 'bg-[#7a3db8]'; // Future
    case 3: return 'bg-[#a81938]'; // Beyond
    case 4: return 'bg-[#d82a6e]'; // Eternal
    default: return 'bg-[#7a3db8]';
  }
}

function getLampBadgeColor(lamp: string): string {
  switch (lamp) {
    case 'pure_memory':
    case 'pm':
      return 'bg-[#119190] text-white shadow-[0_0_6px_#119190]';
    case 'full_recall':
    case 'fr':
      return 'bg-[#5b32a8] text-white shadow-[0_0_6px_#5b32a8]';
    case 'hard_clear':
      return 'bg-[#a82b4b] text-white shadow-[0_0_6px_#a82b4b]';
    case 'easy_clear':
      return 'bg-[#16a34a] text-white shadow-[0_0_6px_#16a34a]';
    case 'lost':
    case 'fail':
      return 'bg-[#374151] text-red-300';
    case 'normal_clear':
    default:
      return 'bg-[#9623a5] text-white shadow-[0_0_6px_#9623a5]';
  }
}

function getLampLetter(lamp: string): string {
  switch (lamp) {
    case 'pure_memory':
    case 'pm':
      return 'P';
    case 'full_recall':
    case 'fr':
      return 'F';
    case 'easy_clear':
      return 'E';
    case 'lost':
    case 'fail':
      return 'L';
    default:
      return 'C';
  }
}

function onJacketError(e: Event) {
  const target = e.target as HTMLImageElement;
  target.src = '/favicon.svg';
}

async function renderPng(): Promise<string | null> {
  if (!exportCanvasRef.value) return null;
  generating.value = true;
  try {
    const dataUrl = await toPng(exportCanvasRef.value, {
      pixelRatio: 2,
      quality: 0.95,
      cacheBust: true,
    });
    return dataUrl;
  } catch (err) {
    console.error('Failed to render B50 image:', err);
    return null;
  } finally {
    generating.value = false;
  }
}

async function downloadImage() {
  const dataUrl = await renderPng();
  if (!dataUrl) return;
  const link = document.createElement('a');
  const safeName = (props.player?.name || 'Player').replace(/[^a-zA-Z0-9_-]/g, '_');
  const suffix = viewMode.value === 'all' ? 'B50' : (viewMode.value === 'top25' ? 'Top25' : 'Next25');
  link.download = `Arcelest_${suffix}_${safeName}_${currentDate.value.replace(/\//g, '')}.png`;
  link.href = dataUrl;
  link.click();
}

async function copyImage() {
  const dataUrl = await renderPng();
  if (!dataUrl) return;
  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob }),
    ]);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2500);
  } catch (err) {
    console.error('Failed to copy image to clipboard:', err);
  }
}
</script>

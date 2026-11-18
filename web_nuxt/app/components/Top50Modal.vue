<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
    <!-- Modal Container -->
    <div class="relative w-full max-w-[1360px] max-h-[96vh] flex flex-col rounded-3xl bg-[#0c0c22] border border-[#2b2d4f] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      
      <!-- Top Action & Navigation Bar -->
      <div class="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-[#14162e] border-b border-[#2b2d4f] shrink-0">
        <div class="flex items-center gap-3">
          <div class="h-3 w-3 rounded-full bg-[#f768dd] shadow-[0_0_8px_#f768dd]"></div>
          <div>
            <h2 class="text-sm sm:text-base font-bold font-brand text-[#fffafa] flex items-center gap-2">
              <span>Top 50 Best Records (B50)</span>
              <span class="text-xs px-2 py-0.5 rounded-full bg-[#1e203a] text-[#ffd76a] font-mono font-normal">
                {{ player?.name || 'Player' }}
              </span>
            </h2>
            <p class="text-[11px] text-[#9a99a8]">
              High-resolution exportable Arcaea B50 board generated with modern B50 formula (+0.2 clear bonus).
            </p>
          </div>
        </div>

        <!-- Export Actions -->
        <div class="flex items-center gap-2 sm:gap-3">
          <!-- Copy Image Button -->
          <button
            type="button"
            :disabled="generating"
            @click="copyImage"
            class="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#1a1d35] hover:bg-[#252849] text-[#fffafa] border border-[#3f426b] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Copy image to clipboard"
          >
            <svg class="h-4 w-4 text-[#70a6ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            <span>{{ copied ? '✓ Copied!' : 'Copy Image' }}</span>
          </button>

          <!-- Download PNG Button -->
          <button
            type="button"
            :disabled="generating"
            @click="downloadImage"
            class="px-4 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-[#9b51e0] via-[#f768dd] to-[#03a8e6] text-[#0c0c22] hover:opacity-90 shadow-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Download high-resolution PNG image"
          >
            <svg v-if="generating" class="h-4 w-4 animate-spin text-[#0c0c22]" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            <svg v-else class="h-4 w-4 text-[#0c0c22]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>{{ generating ? 'Generating…' : 'Download PNG' }}</span>
          </button>

          <!-- Close Modal Button -->
          <button
            type="button"
            @click="emit('close')"
            class="p-1.5 rounded-xl bg-[#1a1d35] hover:bg-red-950/40 text-[#9a99a8] hover:text-red-400 border border-[#3f426b] transition-colors cursor-pointer"
            title="Close"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Scrollable Preview Area -->
      <div class="flex-1 overflow-auto p-3 sm:p-5 flex justify-center bg-[#070814]">
        <!-- The Actual Top 50 Canvas (Element to be captured by html-to-image) -->
        <div
          ref="exportCanvasRef"
          id="b50-export-canvas"
          class="relative w-[1240px] shrink-0 rounded-2xl overflow-hidden shadow-2xl p-6 border border-[#232747]"
          style="background: linear-gradient(180deg, #0d0f22 0%, #101227 50%, #0a0b18 100%);"
        >
          <!-- Background Wallpaper with Vignette & Glass Blur -->
          <div class="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <img
              src="/storage/backgrounds/base_conflict.jpg"
              alt="Cathedral Wallpaper"
              class="w-full h-full object-cover object-center filter brightness-[0.25] saturate-150 scale-105"
              crossorigin="anonymous"
            />
            <div class="absolute inset-0 bg-gradient-to-b from-[#0c0d1e]/80 via-[#0e1024]/85 to-[#080914]/95"></div>
            <!-- Radial glow in the center top -->
            <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-gradient-to-b from-[#9b51e0]/20 to-transparent blur-3xl pointer-events-none"></div>
          </div>

          <!-- Board Header -->
          <div class="relative z-10 flex items-center justify-between mb-5 px-2">
            <!-- Left: Arcaea Logo & Tagline -->
            <div class="w-1/4">
              <div class="font-brand font-black text-2xl tracking-[0.25em] text-white flex items-center gap-1.5 drop-shadow-[0_2px_8px_rgba(255,255,255,0.3)]">
                <span>ARCAEA</span>
              </div>
              <div class="text-[9.5px] text-[#9a99a8] tracking-[0.15em] font-sans italic opacity-80 mt-0.5">
                New Dimension Rhythm Game
              </div>
            </div>

            <!-- Center: Sleek Player Nameplate Banner -->
            <div class="w-2/4 flex justify-center">
              <div
                class="relative flex items-center gap-4 px-6 py-2 rounded-2xl border border-white/20 shadow-2xl backdrop-blur-md"
                style="background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(20, 22, 45, 0.85) 100%);"
              >
                <!-- Player Name -->
                <div class="text-right">
                  <div class="text-[17px] font-black font-brand text-[#fffafa] tracking-wide drop-shadow-md">
                    {{ player?.name || 'Anonymous' }}
                  </div>
                  <div class="text-[9.5px] font-mono text-[#9a99a8] tracking-wider">
                    ID: {{ player?.userCode || '000000000' }}
                  </div>
                </div>

                <!-- Diamond Character Avatar -->
                <div class="relative h-12 w-12 rotate-45 overflow-hidden rounded-xl bg-gradient-to-tr from-[#9b51e0] via-[#f768dd] to-[#03a8e6] p-0.5 shadow-xl shrink-0 border border-white/30">
                  <div class="relative h-full w-full overflow-hidden rounded-lg bg-slate-950">
                    <img
                      :src="player?.characterAvatar || '/storage/characters/0_icon.png'"
                      alt="Avatar"
                      class="absolute inset-[-25%] h-[150%] w-[150%] max-w-none -rotate-45 object-cover"
                      crossorigin="anonymous"
                    />
                  </div>
                </div>

                <!-- Potential Rating Emblem -->
                <div class="flex flex-col items-start">
                  <div
                    class="px-2.5 py-0.5 rounded-lg text-xs font-black font-mono shadow-md border flex items-center gap-1 tracking-wider"
                    :class="[pttStyle.bg, pttStyle.border]"
                  >
                    <span>{{ pttStyle.stars }}</span>
                    <span>{{ Number(player?.ratingPtt || b50Avg).toFixed(3) }}</span>
                  </div>
                  <div class="text-[9px] font-mono text-[#acff82] mt-0.5 font-semibold">
                    B50: {{ b50Avg }} &bull; B10: {{ b10Avg }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Right: Timestamp -->
            <div class="w-1/4 text-right">
              <div class="text-[10px] uppercase font-bold tracking-widest text-[#9a99a8]">
                Generated on:
              </div>
              <div class="text-sm font-black font-mono text-[#ffd76a] tracking-wider drop-shadow-sm">
                {{ currentDate }}
              </div>
            </div>
          </div>

          <!-- 5x10 Cards Grid (Top 50 Plays) -->
          <div class="relative z-10 grid grid-cols-5 gap-2 px-1">
            <div
              v-for="(item, idx) in displayCards"
              :key="idx"
              class="relative rounded-xl border border-white/10 shadow-lg p-2 flex flex-col justify-between overflow-hidden"
              style="background: linear-gradient(135deg, rgba(26, 29, 53, 0.90) 0%, rgba(14, 16, 32, 0.96) 100%); backdrop-filter: blur(8px); height: 88px;"
            >
              <!-- Card Main Content: Left Info + Right Artwork -->
              <div class="flex items-center justify-between gap-1.5 flex-1 min-h-0">
                <!-- Left Column: Rank Pill, Potential, Grade -->
                <div class="flex flex-col justify-between h-full py-0.5 shrink-0">
                  <!-- Rank Pill (#1..#50) -->
                  <div
                    class="px-1.5 py-0.5 rounded text-[10px] font-black font-mono tracking-wider text-center"
                    :class="idx < 10 ? 'bg-[#3b2b68] text-[#f768dd] border border-[#f768dd]/40' : 'bg-[#1e2342] text-[#9bb4ff]'"
                  >
                    #{{ idx + 1 }}
                  </div>

                  <!-- Potential Value -->
                  <div class="flex flex-col items-start leading-none mt-0.5">
                    <span class="text-[7px] font-bold uppercase tracking-widest text-[#8a8aa3]">POTENTIAL</span>
                    <span class="text-[11.5px] font-black font-mono text-[#ffd76a] mt-0.5">
                      {{ item ? Number(item.recalculatedRating).toFixed(3) : '—' }}
                    </span>
                  </div>

                  <!-- Grade Badge -->
                  <div
                    v-if="item"
                    class="px-1 py-0.5 rounded text-[8.5px] font-black text-center tracking-wider leading-none shadow-sm mt-0.5 w-fit"
                    :class="getGradeBadgeClass(item.grade)"
                  >
                    {{ item.grade }}
                  </div>
                  <div v-else class="text-[9px] text-[#6f6e80] font-mono">—</div>
                </div>

                <!-- Right Column: Jacket + Score -->
                <div class="flex flex-col items-end shrink-0">
                  <!-- Jacket with Corner Difficulty & Lamp Badges -->
                  <div class="relative h-[48px] w-[48px] rounded-lg overflow-hidden bg-[#0c0c22] border border-white/15 shadow-md">
                    <img
                      v-if="item"
                      :src="item.jacketUrl"
                      :alt="item.songTitle"
                      class="h-full w-full object-cover"
                      crossorigin="anonymous"
                      @error="onJacketError"
                    />
                    <div v-else class="h-full w-full flex items-center justify-center text-[8px] text-[#6f6e80]">
                      EMPTY
                    </div>

                    <!-- Top-Right Difficulty Badge -->
                    <div
                      v-if="item"
                      class="absolute top-0 right-0 px-1 py-0.5 rounded-bl text-[8px] font-black font-mono shadow-sm text-white"
                      :class="getDiffBadgeColor(item.ratingClass)"
                    >
                      {{ item.ratingDisplay || item.difficulty }}
                    </div>

                    <!-- Bottom-Right Lamp Badge -->
                    <div
                      v-if="item"
                      class="absolute bottom-0 right-0 px-1 py-0.5 rounded-tl text-[8px] font-black font-mono shadow-md"
                      :class="getLampBadgeColor(item.lamp)"
                    >
                      {{ getLampLetter(item.lamp) }}
                    </div>
                  </div>

                  <!-- Score formatted: 09'900'167 -->
                  <div class="font-mono font-bold text-[10px] text-white tracking-wider drop-shadow-sm mt-0.5">
                    {{ item ? formatScoreArcaea(item.score) : "00'000'000" }}
                  </div>
                </div>
              </div>

              <!-- Bottom: Song Title (Truncated across bottom) -->
              <div
                class="text-[9.5px] font-bold text-white/95 truncate tracking-tight border-t border-white/5 pt-0.5 mt-0.5 w-full text-left"
                :title="item?.songTitle"
              >
                {{ item ? item.songTitle : '—' }}
              </div>
            </div>
          </div>

          <!-- Board Footer -->
          <div class="relative z-10 flex items-center justify-between mt-5 px-3 pt-3 border-t border-white/10 text-[10px] text-[#8a8aa3]">
            <div class="font-brand font-black tracking-widest text-[#fffafa] opacity-60">
              lowiro &bull; Celest Arcaea Server
            </div>
            <div class="font-mono text-[#ffd76a] font-semibold">
              Arcaea Best 50 Modern Rating System &bull; 50 Records Total
            </div>
            <div class="font-brand font-bold tracking-wider text-[#fffafa] opacity-60">
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

// Format date as YYYY/MM/DD
const currentDate = computed(() => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
});

// Top 50 scores (slice up to 50)
const top50Scores = computed(() => {
  const list = [...(props.scores || [])];
  list.sort((a, b) => b.recalculatedRating - a.recalculatedRating);
  return list.slice(0, 50);
});

// Always display 50 card slots (pad with null if fewer than 50)
const displayCards = computed(() => {
  const list = [...top50Scores.value];
  while (list.length < 50) {
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
  link.download = `Arcelest_B50_${safeName}_${currentDate.value.replace(/\//g, '')}.png`;
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

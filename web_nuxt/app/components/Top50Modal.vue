<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
    <!-- Modal Dialog Container -->
    <div class="relative w-full max-w-[760px] max-h-[96vh] flex flex-col rounded-3xl bg-[#0e1022] border border-[#2b2d4f] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      
      <!-- Top Action & Navigation Bar -->
      <div class="flex flex-wrap items-center justify-between gap-2.5 px-4 py-3 bg-[#13152d] border-b border-[#2b2d4f] shrink-0">
        <div class="flex items-center gap-2.5">
          <div class="h-2.5 w-2.5 rounded-full bg-[#e0d3b6] shadow-[0_0_8px_#e0d3b6]"></div>
          <div>
            <h2 class="text-sm font-bold font-brand text-[#fffafa] flex items-center gap-2">
              <span>Top 50 (B50)</span>
              <span class="text-[11px] px-2 py-0.5 rounded-full bg-[#1e203a] text-[#ffd76a] font-normal">
                {{ player?.name || 'Player' }}
              </span>
            </h2>
            <p class="text-[10px] text-[#9a99a8]">
              Arcaea Portrait B50 Poster &bull; Official lowiro Aesthetic
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
                'px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer',
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
                'px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer',
                viewMode === 'top25'
                  ? 'bg-[#1e203a] text-[#ffd76a] shadow'
                  : 'text-[#9a99a8] hover:text-[#fffafa]'
              ]"
            >
              #1–25
            </button>
            <button
              type="button"
              @click="viewMode = 'next25'"
              :class="[
                'px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer',
                viewMode === 'next25'
                  ? 'bg-[#1e203a] text-[#9bb4ff] shadow'
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
            class="px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-[#ffd76a] via-[#e8c051] to-[#c79c32] text-[#121424] hover:opacity-95 shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Download high-resolution Portrait PNG"
          >
            <svg v-if="generating" class="h-3.5 w-3.5 animate-spin text-[#121424]" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            <svg v-else class="h-3.5 w-3.5 text-[#121424]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>{{ generating ? 'Generating…' : 'PNG' }}</span>
          </button>

          <!-- Copy Image Button -->
          <button
            type="button"
            :disabled="generating"
            @click="copyImage"
            class="p-1.5 rounded-xl bg-[#1a1d35] hover:bg-[#252849] text-[#ffd76a] border border-[#3f426b] transition-all cursor-pointer disabled:opacity-50"
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
        <!-- Scaled Preview Wrapper for responsive UI fit -->
        <div
          class="relative shrink-0 flex justify-center"
          :style="{
            width: isExporting ? '1445px' : `${1445 * previewScale}px`,
            height: isExporting ? `${canvasHeight}px` : `${canvasHeight * previewScale}px`,
          }"
        >
          <!-- 1445px Authentic lowiro Portrait Canvas -->
          <div
            ref="exportCanvasRef"
            id="b50-export-canvas"
            class="origin-top-left absolute top-0 left-0"
            :style="{
              width: '1445px',
              height: `${canvasHeight}px`,
              transform: isExporting ? 'none' : `scale(${previewScale})`,
            }"
          >
            <!-- Background Layer: Desaturated Key-art with Vignette -->
            <div class="bg-layer">
              <img
                src="/storage/backgrounds/base_light.jpg"
                alt="Arcaea Atmosphere Wallpaper"
                class="bg-img"
                crossorigin="anonymous"
                @error="onBgError"
              />
              <div class="bg-overlay"></div>
              <div class="bg-vignette"></div>
            </div>

            <!-- Soft Translucent Glass Bokeh Spheres -->
            <div class="glass-sphere sphere-1"></div>
            <div class="glass-sphere sphere-2"></div>
            <div class="glass-sphere sphere-3"></div>
            <div class="glass-sphere sphere-4"></div>

            <!-- Side Thin Gold Corner Brackets -->
            <svg class="edge-bracket edge-bracket-left" viewBox="0 0 18 50">
              <path d="M16,2 L4,25 L16,48" stroke="#e0d3b6" stroke-width="1.8" fill="none" />
            </svg>
            <svg class="edge-bracket edge-bracket-right" viewBox="0 0 18 50">
              <path d="M2,2 L14,25 L2,48" stroke="#e0d3b6" stroke-width="1.8" fill="none" />
            </svg>

            <!-- HEADER SECTION (~270px) -->
            <div class="header">
              <!-- Top Left Arcaea Wordmark / Official Logo -->
              <div class="logo-wrap">
                <img
                  src="/img/arcaea_logo.png"
                  alt="ARCAEA"
                  class="arcaea-logo"
                  crossorigin="anonymous"
                  @error="onLogoError"
                />
              </div>

              <!-- Thin Gold/Cream Lines extending across header -->
              <svg class="gold-lines" viewBox="0 0 1445 270">
                <path d="M65,112 L430,112 L485,138" stroke="#e0d3b6" stroke-width="1.5" fill="none" opacity="0.75" />
                <path d="M1380,112 L1015,112 L960,138" stroke="#e0d3b6" stroke-width="1.5" fill="none" opacity="0.75" />
              </svg>

              <!-- Center Nameplate (Angled Parallelogram) -->
              <div class="nameplate-container">
                <div class="nameplate-parallelogram">
                  <!-- Diagonal stripe texture on left of nameplate -->
                  <div class="nameplate-stripes"></div>

                  <!-- Player Name -->
                  <div class="player-name">
                    {{ player?.name || 'Player' }}
                  </div>

                  <!-- Diamond Character Avatar at right end of plate -->
                  <div class="avatar-diamond-frame">
                    <div class="avatar-diamond-inner">
                      <img
                        :src="player?.characterAvatar || '/storage/characters/0_icon.png'"
                        alt="Avatar"
                        class="avatar-img"
                        crossorigin="anonymous"
                        @error="onAvatarError"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Potential Rating & Star Pill below Avatar -->
              <div class="ptt-badge-group">
                <div class="ptt-value">
                  {{ Number(player?.ratingPtt || b50Avg).toFixed(3) }}
                </div>
                <div v-if="pttStyle.stars" class="star-pill" :class="pttStyle.pillClass">
                  {{ pttStyle.stars }}
                </div>
              </div>

              <!-- Player Stats line below nameplate (Dim Lavender) -->
              <div class="stats-line">
                <span>ID: {{ player?.userCode || '000000000' }}</span>
                <span class="stat-sep">&bull;</span>
                <span>B50: {{ b50Avg }}</span>
                <span class="stat-sep">&bull;</span>
                <span>B10: {{ b10Avg }}</span>
              </div>

              <!-- Top Right Generated Date -->
              <div class="timestamp-wrap">
                <div class="timestamp-label">Generated on:</div>
                <div class="timestamp-val">{{ currentDate }}</div>
              </div>
            </div>

            <!-- CARDS GRID (5 columns, 230px card width, 38px gap, 65px margin) -->
            <div class="grid-container">
              <div
                v-for="(item, idx) in displayedCards"
                :key="`card-${idx}`"
                :class="['card', { 'empty-card': !item }]"
              >
                <!-- EMPTY SLOT CARD -->
                <template v-if="!item">
                  <div class="rank-tag">
                    <span class="rank-num">#{{ getRankNumber(idx) }}</span>
                  </div>
                  <div class="empty-dashes">—</div>
                  <div class="title-strip">
                    <span class="title-text">—</span>
                  </div>
                </template>

                <!-- FILLED RECORD CARD -->
                <template v-else>
                  <!-- Left Area: Rank Tag, Potential, Grade -->
                  <div class="left-col">
                    <div class="rank-tag">
                      <span class="rank-num">#{{ getRankNumber(idx) }}</span>
                    </div>
                    <div class="pot-label">POTENTIAL</div>
                    <div class="pot-num">
                      {{ Number(item.recalculatedRating).toFixed(3) }}
                    </div>
                    <div class="pot-dots">&bull; &bull;</div>
                    <div class="grade-text">{{ item.grade }}</div>
                  </div>

                  <!-- Right Area: Square Jacket (145x145) with Badges & Score -->
                  <div class="jacket-wrap">
                    <img
                      :src="item.jacketUrl"
                      :alt="item.songTitle"
                      class="jacket-img"
                      crossorigin="anonymous"
                      @error="onJacketError"
                    />
                    <!-- Dark bottom gradient for score legibility -->
                    <div class="jacket-shade"></div>
                    <div class="score-text">
                      {{ formatScoreArcaea(item.score) }}
                    </div>

                    <!-- Diamond Level Badge (Rotated 45°) -->
                    <div
                      class="lvl-diamond"
                      :style="getDiffBadgeStyle(item.ratingClass)"
                    >
                      <div class="lvl-text">
                        {{ item.ratingDisplay || item.difficulty }}
                      </div>
                    </div>

                    <!-- Hexagon Clear Lamp Badge -->
                    <div
                      class="lamp-badge"
                      :style="getLampBadgeStyle(item.lamp)"
                    >
                      {{ getLampLetter(item.lamp) }}
                    </div>
                  </div>

                  <!-- Bottom Title Strip (Full card width, clipped text) -->
                  <div class="title-strip">
                    <span class="title-text">{{ item.songTitle }}</span>
                  </div>
                </template>
              </div>
            </div>

            <!-- FOOTER (~100px) -->
            <div class="footer">
              <div class="footer-left">Celest Arcaea Server &bull; Arcaea by lowiro</div>
              <div class="footer-center">
                {{ displayedCards.length }} Records &bull; Modern B50 (+0.2 Clear)
              </div>
              <div class="footer-right">moe.cel.arc</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
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
const isExporting = ref(false);
const copied = ref(false);
const viewMode = ref<'all' | 'top25' | 'next25'>('all');

// Preview scaling factor: scales 1445px down to ~620px for comfortable dialog viewing
const previewScale = ref(0.44);

// Format date as YYYY/MM/DD
const currentDate = computed(() => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
});

// Top 50 scores sorted descending by recalculated potential rating
const top50Scores = computed(() => {
  const list = [...(props.scores || [])];
  list.sort((a, b) => b.recalculatedRating - a.recalculatedRating);
  return list.slice(0, 50);
});

// Cards list according to viewMode
const displayedCards = computed(() => {
  if (viewMode.value === 'top25') {
    const list = top50Scores.value.slice(0, 25);
    while (list.length < 25) {
      list.push(null as any);
    }
    return list;
  }
  if (viewMode.value === 'next25') {
    const list = top50Scores.value.slice(25, 50);
    while (list.length < 25) {
      list.push(null as any);
    }
    return list;
  }
  // 'all': 50 slots (10 rows of 5)
  const list = top50Scores.value.slice(0, 50);
  while (list.length < 50) {
    list.push(null as any);
  }
  return list;
});

// Dynamic canvas height based on number of rows
const canvasHeight = computed(() => {
  const rows = Math.ceil(displayedCards.value.length / 5);
  // Header: 270px, Grid: rows * 185 + (rows - 1) * 33, Margins: ~15px top, Footer: ~100px
  return 270 + 15 + rows * 185 + Math.max(0, rows - 1) * 33 + 100;
});

// Calculate rank number based on viewMode and index
function getRankNumber(idx: number): number {
  if (viewMode.value === 'next25') {
    return idx + 26;
  }
  return idx + 1;
}

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

// Potential emblem style based on PTT value
const pttStyle = computed(() => {
  const ptt = Number(props.player?.ratingPtt || b50Avg.value) || 0;
  if (ptt >= 13.0) {
    return {
      stars: '★★★',
      pillClass: 'bg-gradient-to-r from-[#ffd76a] via-[#f768dd] to-[#03a8e6] text-[#0c0c22]',
    };
  }
  if (ptt >= 12.5) {
    return {
      stars: '★★',
      pillClass: 'bg-gradient-to-r from-[#6b2259] to-[#88246d] text-[#ffd76a]',
    };
  }
  if (ptt >= 12.0) {
    return {
      stars: '★',
      pillClass: 'bg-gradient-to-r from-[#5a1b48] to-[#731c5b] text-[#ffd76a]',
    };
  }
  if (ptt >= 11.0) {
    return {
      stars: '★',
      pillClass: 'bg-[#5a1b48] text-white',
    };
  }
  return {
    stars: '',
    pillClass: 'bg-[#1e2342] text-white',
  };
});

function formatScoreArcaea(s: number): string {
  const padded = String(Math.max(0, Math.trunc(s || 0))).padStart(8, '0');
  return `${padded.slice(0, 2)}'${padded.slice(2, 5)}'${padded.slice(5, 8)}`;
}

function getDiffBadgeStyle(rc: number): string {
  switch (rc) {
    case 0: return 'background: #1976d2; border-color: #64b5f6;'; // Past
    case 1: return 'background: #2e7d32; border-color: #81c784;'; // Present
    case 2: return 'background: #5c2482; border-color: #9b48d4;'; // Future
    case 3: return 'background: #8b1832; border-color: #d83458;'; // Beyond
    case 4: return 'background: #a31962; border-color: #e64598;'; // Eternal
    default: return 'background: #5c2482; border-color: #9b48d4;';
  }
}

function getLampBadgeStyle(lamp: string): string {
  switch (lamp) {
    case 'pure_memory':
    case 'pm':
      return 'background: linear-gradient(180deg, #137e9e 0%, #0c4d63 100%); box-shadow: inset 0 0 0 1px #2dd4bf, 0 2px 6px rgba(0,0,0,0.5);';
    case 'full_recall':
    case 'fr':
      return 'background: linear-gradient(180deg, #741d7a 0%, #4c1150 100%); box-shadow: inset 0 0 0 1px #e879f9, 0 2px 6px rgba(0,0,0,0.5);';
    case 'easy_clear':
    case 'ec':
      return 'background: linear-gradient(180deg, #1b6338 0%, #114124 100%); box-shadow: inset 0 0 0 1px #4ade80, 0 2px 6px rgba(0,0,0,0.5);';
    case 'hard_clear':
    case 'hc':
      return 'background: linear-gradient(180deg, #991b1b 0%, #681111 100%); box-shadow: inset 0 0 0 1px #f87171, 0 2px 6px rgba(0,0,0,0.5);';
    case 'lost':
    case 'fail':
      return 'background: linear-gradient(180deg, #374151 0%, #1f2937 100%); box-shadow: inset 0 0 0 1px #9ca3af, 0 2px 6px rgba(0,0,0,0.5);';
    case 'normal_clear':
    default:
      return 'background: linear-gradient(180deg, #233162 0%, #151d3b 100%); box-shadow: inset 0 0 0 1px #60a5fa, 0 2px 6px rgba(0,0,0,0.5);';
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
    case 'ec':
      return 'E';
    case 'hard_clear':
    case 'hc':
      return 'H';
    case 'lost':
    case 'fail':
      return 'L';
    default:
      return 'C';
  }
}

function onJacketError(e: Event) {
  const target = e.target as HTMLImageElement;
  target.src = '/storage/characters/0_icon.png';
}

function onAvatarError(e: Event) {
  const target = e.target as HTMLImageElement;
  target.src = '/storage/characters/0_icon.png';
}

function onBgError(e: Event) {
  const target = e.target as HTMLImageElement;
  target.src = '/storage/backgrounds/base_conflict.jpg';
}

function onLogoError(e: Event) {
  const target = e.target as HTMLImageElement;
  target.style.display = 'none';
}

async function renderPng(): Promise<string | null> {
  if (!exportCanvasRef.value) return null;
  generating.value = true;
  isExporting.value = true;
  await nextTick();
  // Small delay for DOM layout repaint at 1:1 scale
  await new Promise((resolve) => setTimeout(resolve, 80));

  try {
    const dataUrl = await toPng(exportCanvasRef.value, {
      pixelRatio: 1,
      quality: 0.96,
      cacheBust: true,
    });
    return dataUrl;
  } catch (err) {
    console.error('Failed to render lowiro B50 image:', err);
    return null;
  } finally {
    isExporting.value = false;
    generating.value = false;
  }
}

async function downloadImage() {
  const dataUrl = await renderPng();
  if (!dataUrl) return;
  const link = document.createElement('a');
  const safeName = (props.player?.name || 'Player').replace(/[^a-zA-Z0-9_-]/g, '_');
  const suffix = viewMode.value === 'all' ? 'B50' : (viewMode.value === 'top25' ? 'Top25' : 'Next25');
  link.download = `Arcaea_${suffix}_${safeName}_${currentDate.value.replace(/\//g, '')}.png`;
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

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Exo+2:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,700;1,800;1,900&family=Noto+Sans+JP:wght@400;500;700&display=swap');

/* 1445px Standard lowiro Canvas */
#b50-export-canvas {
  font-family: 'Exo 2', -apple-system, BlinkMacSystemFont, sans-serif;
  overflow: hidden;
  background: #73808b;
  -webkit-font-smoothing: antialiased;
}

/* Blurred, Pale Desaturated Background */
.bg-layer {
  position: absolute;
  inset: -20px;
  z-index: 0;
  overflow: hidden;
}
.bg-img {
  width: calc(100% + 40px);
  height: calc(100% + 40px);
  object-fit: cover;
  object-position: center top;
  filter: blur(28px) saturate(0.35) brightness(1.22) contrast(0.88);
  transform: scale(1.05);
}
.bg-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 8%, rgba(246, 248, 244, 0.85) 0%, rgba(220, 228, 228, 0.75) 30%, rgba(140, 155, 168, 0.7) 65%, rgba(45, 48, 62, 0.85) 100%);
}
.bg-vignette {
  position: absolute;
  inset: 0;
  box-shadow: inset 0 0 140px rgba(18, 20, 32, 0.65);
  pointer-events: none;
}

/* Translucent Glass Bokeh Spheres */
.glass-sphere {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  z-index: 1;
  backdrop-filter: blur(4px);
  background: radial-gradient(circle at 35% 30%, rgba(255,255,255,0.48) 0%, rgba(255,255,255,0.06) 55%, rgba(180,205,215,0.18) 85%, rgba(255,255,255,0.38) 100%);
  box-shadow: inset 0 0 18px rgba(255,255,255,0.35), 0 6px 24px rgba(0,0,0,0.12);
}
.sphere-1 {
  width: 145px;
  height: 145px;
  top: 35px;
  left: 740px;
}
.sphere-2 {
  width: 95px;
  height: 95px;
  top: 80px;
  left: 865px;
}
.sphere-3 {
  width: 180px;
  height: 180px;
  top: 600px;
  left: -40px;
  opacity: 0.4;
}
.sphere-4 {
  width: 160px;
  height: 160px;
  bottom: 250px;
  right: -30px;
  opacity: 0.35;
}

/* Side Golden Corner Brackets */
.edge-bracket {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 50px;
  z-index: 5;
  opacity: 0.65;
}
.edge-bracket-left {
  left: 14px;
}
.edge-bracket-right {
  right: 14px;
}

/* HEADER (~270px) */
.header {
  position: relative;
  z-index: 10;
  height: 270px;
  width: 100%;
}

/* Top Left Arcaea Logo */
.logo-wrap {
  position: absolute;
  top: 36px;
  left: 65px;
  z-index: 12;
}
.arcaea-logo {
  width: 270px;
  height: auto;
  filter: drop-shadow(0 2px 5px rgba(0,0,0,0.45));
}

/* Thin Gold/Cream Lines */
.gold-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 270px;
  pointer-events: none;
  z-index: 8;
}

/* Center Nameplate Banner */
.nameplate-container {
  position: absolute;
  top: 88px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  z-index: 15;
}

.nameplate-parallelogram {
  position: relative;
  display: flex;
  align-items: center;
  width: 480px;
  height: 64px;
  transform: skewX(-14deg);
  background: linear-gradient(90deg, rgba(22, 25, 46, 0.95) 0%, rgba(32, 36, 64, 0.96) 100%);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(224, 211, 182, 0.45);
  border-radius: 2px;
  padding-left: 20px;
  overflow: visible;
}

/* Diagonal Stripe Pattern on Left of Nameplate */
.nameplate-stripes {
  position: absolute;
  top: 0;
  left: 0;
  width: 140px;
  height: 100%;
  background: repeating-linear-gradient(45deg, rgba(255,255,255,0.06), rgba(255,255,255,0.06) 2px, transparent 2px, transparent 8px);
  pointer-events: none;
  border-top-left-radius: 2px;
  border-bottom-left-radius: 2px;
}

.player-name {
  transform: skewX(14deg);
  color: #ffffff;
  font-size: 25px;
  font-weight: 500;
  letter-spacing: 0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 330px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}

/* Diamond Avatar at right end of plate */
.avatar-diamond-frame {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
  width: 58px;
  height: 58px;
  background: #ffffff;
  padding: 2px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.4), 0 0 0 2px rgba(255, 230, 240, 0.8);
  border-radius: 4px;
  overflow: hidden;
  z-index: 20;
}
.avatar-diamond-inner {
  position: relative;
  width: 100%;
  height: 100%;
  background: #0f1124;
  overflow: hidden;
  border-radius: 2px;
}
.avatar-img {
  position: absolute;
  inset: -25%;
  width: 150%;
  height: 150%;
  object-fit: cover;
  transform: rotate(-45deg);
}

/* Potential & Star Pill under Avatar */
.ptt-badge-group {
  position: absolute;
  top: 158px;
  left: calc(50% + 220px);
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 16;
}
.ptt-value {
  font-size: 27px;
  font-weight: 800;
  color: #ffffff;
  line-height: 1;
  text-shadow: 0 2px 4px rgba(0,0,0,0.6);
  letter-spacing: -0.02em;
}
.star-pill {
  margin-top: 3px;
  border: 1px solid #d8459e;
  border-radius: 9999px;
  padding: 1px 9px;
  font-size: 11px;
  line-height: 1.2;
  box-shadow: 0 2px 6px rgba(0,0,0,0.4);
}

/* Stats line below nameplate: ID, B50, B10 */
.stats-line {
  position: absolute;
  top: 162px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 16px;
  color: #b9aed4;
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: 0.04em;
  z-index: 14;
  white-space: nowrap;
}
.stat-sep {
  opacity: 0.4;
}

/* Top Right Timestamp */
.timestamp-wrap {
  position: absolute;
  top: 42px;
  right: 65px;
  text-align: right;
  z-index: 12;
}
.timestamp-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.75);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 600;
}
.timestamp-val {
  font-size: 21px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.01em;
  margin-top: 2px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.4);
}

/* GRID CONTAINER (5 columns, 230px card width, 38px gap, 65px margin) */
.grid-container {
  position: relative;
  z-index: 10;
  width: 1302px; /* 5 * 230 + 4 * 38 = 1302px */
  margin: 15px auto 0 auto;
  display: grid;
  grid-template-columns: repeat(5, 230px);
  column-gap: 38px;
  row-gap: 33px;
}

/* CARD ANATOMY (~230w x 185h) */
.card {
  position: relative;
  width: 230px;
  height: 185px;
  /* 4-corner chamfer cut */
  clip-path: polygon(10px 0, calc(100% - 10px) 0, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0 calc(100% - 10px), 0 10px);
  background: linear-gradient(135deg, rgba(98, 85, 152, 0.72) 0%, rgba(58, 48, 102, 0.82) 100%);
  backdrop-filter: blur(8px);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.22), inset 1px 1px 2px rgba(255, 255, 255, 0.35);
  overflow: visible;
}

/* Sheen overlay on card */
.card::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(115deg, rgba(255, 255, 255, 0.12) 0%, transparent 45%, rgba(255, 255, 255, 0.04) 100%);
  pointer-events: none;
}

/* Empty Card */
.card.empty-card {
  opacity: 0.35;
  background: linear-gradient(135deg, rgba(80, 70, 125, 0.5) 0%, rgba(45, 38, 75, 0.6) 100%);
}
.empty-dashes {
  position: absolute;
  top: 55px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 36px;
  color: rgba(255, 255, 255, 0.5);
}

/* Left Area (width: 83px, height: 147px) */
.left-col {
  position: absolute;
  top: 0;
  left: 0;
  width: 83px;
  height: 147px;
}

/* Rank Tag: Chevron ribbon pointing right */
.rank-tag {
  position: absolute;
  top: 6px;
  left: 0;
  width: 50px;
  height: 21px;
  clip-path: polygon(0 0, calc(100% - 7px) 0, 100% 50%, calc(100% - 7px) 100%, 0 100%);
  background: linear-gradient(90deg, #64589c 0%, #7c6ebc 100%);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.3);
  display: flex;
  align-items: center;
  padding-left: 8px;
}
.rank-num {
  font-size: 11px;
  font-weight: 800;
  color: #ffffff;
  line-height: 1;
  letter-spacing: -0.02em;
}

/* Potential in Card */
.pot-label {
  position: absolute;
  top: 30px;
  left: 10px;
  font-size: 7.5px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.pot-num {
  position: absolute;
  top: 41px;
  left: 10px;
  font-size: 21px;
  font-weight: 800;
  color: #ffd76a;
  letter-spacing: -0.03em;
  line-height: 1;
}
.pot-dots {
  position: absolute;
  top: 64px;
  left: 10px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.35);
  line-height: 1;
}

/* Grade Text */
.grade-text {
  position: absolute;
  top: 75px;
  left: 8px;
  font-size: 34px;
  font-weight: 900;
  font-style: italic;
  letter-spacing: -0.04em;
  line-height: 1;
  background: linear-gradient(180deg, #ffffff 0%, #eddcf2 45%, #c5b0db 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));
}

/* Right Area: Square Jacket (145x145) */
.jacket-wrap {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 145px;
  height: 145px;
  background: #111428;
  overflow: hidden;
}
.jacket-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.jacket-shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.45) 45%, transparent 100%);
}
.score-text {
  position: absolute;
  bottom: 5px;
  left: 8px;
  font-size: 14.5px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.02em;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.95));
}

/* Diamond Level Badge */
.lvl-diamond {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 25px;
  height: 25px;
  transform: rotate(45deg);
  border-radius: 3px;
  border: 1px solid rgba(255,255,255,0.4);
  box-shadow: 0 2px 5px rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}
.lvl-text {
  transform: rotate(-45deg);
  font-size: 12px;
  font-weight: 800;
  color: #ffffff;
  line-height: 1;
  text-align: center;
}

/* Hexagon Clear Lamp Badge */
.lamp-badge {
  position: absolute;
  bottom: -5px;
  right: -5px;
  width: 23px;
  height: 26px;
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  color: #ffffff;
  line-height: 1;
  z-index: 10;
}

/* Bottom Title Strip */
.title-strip {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 36px;
  background: rgba(88, 76, 136, 0.88);
  border-top: 1px solid rgba(255, 255, 255, 0.22);
  display: flex;
  align-items: center;
  padding: 0 10px 0 12px;
  overflow: hidden;
}
.title-text {
  font-family: 'Noto Sans JP', sans-serif;
  font-size: 11.5px;
  font-weight: 500;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: clip; /* Clipped without ellipsis */
  line-height: 36px;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}

/* FOOTER (~100px) */
.footer {
  position: relative;
  z-index: 10;
  width: 1302px;
  margin: 35px auto 40px auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: rgba(255, 255, 255, 0.65);
  font-size: 13px;
  font-weight: 500;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
}
.footer-left {
  letter-spacing: 0.02em;
}
.footer-center {
  color: #ffd76a;
  font-weight: 700;
  letter-spacing: 0.05em;
}
.footer-right {
  font-weight: 800;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.8);
}
</style>

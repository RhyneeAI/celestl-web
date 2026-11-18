<template>
  <div v-if="song" class="space-y-6">
    <!-- Back Button & Actions -->
    <div class="flex items-center justify-between">
      <NuxtLink to="/" class="flex items-center gap-1.5 text-xs font-semibold text-[#9a99a8] hover:text-[#fffafa] transition-colors">
        <span>← All Songs</span>
      </NuxtLink>
      <div class="flex items-center gap-2">
        <!-- Download Server Package Zip (if hosted on server) -->
        <a
          v-if="song.hasServerPackage"
          :href="`/api/songs/${song.slug}/download`"
          download
          class="rounded-xl bg-[#acff82]/15 text-[#acff82] hover:bg-[#acff82]/25 border border-[#acff82]/40 px-3 py-1.5 text-xs font-bold font-brand transition-colors flex items-center gap-1.5 shadow-sm"
          title="Download Complete Server Chart Package (.zip)"
        >
          <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>Package (.zip)</span>
        </a>

        <a
          :href="fandomWikiUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="rounded-xl bg-[#1e203a] px-3 py-1.5 text-xs font-semibold text-[#03a8e6] hover:bg-[#1e203a]/80 border border-[#03a8e6]/30 transition-colors flex items-center gap-1"
          title="Open Arcaea Fandom Wiki"
        >
          <span>Arcaea Wiki</span>
          <span>↗</span>
        </a>
        <NuxtLink
          :to="`/calculator`"
          class="rounded-xl bg-[#16133e] px-3 py-1.5 text-xs font-semibold text-[#f768dd] hover:bg-[#16133e]/80 border border-[#f768dd]/20 transition-colors"
        >
          Open in Calculator ↗
        </NuxtLink>
      </div>
    </div>

    <!-- Song Header Banner Card -->
    <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6 rounded-3xl bg-[#1a1d32] p-6 border border-[#16133e]">
      <!-- Jacket Artwork -->
      <div
        class="h-40 w-40 sm:h-48 sm:w-48 rounded-2xl shadow-xl shrink-0 flex items-center justify-center font-bold text-2xl font-brand text-white/80 select-none relative overflow-hidden bg-[#0c0c22] border border-white/10"
        :style="{ background: jacketGradient(song.slug) }"
      >
        <img
          :src="`/api/jacket/${song.slug}`"
          :alt="song.title"
          class="absolute inset-0 h-full w-full object-cover"
          @error="(e: Event) => (e.target as HTMLElement).style.display = 'none'"
        />
        <span class="text-white/30 select-none">{{ song.title.slice(0, 3).toUpperCase() }}</span>
      </div>

      <!-- Info Meta -->
      <div class="flex-1 text-center sm:text-left space-y-3 min-w-0">
        <div>
          <span v-if="song.side" class="inline-block rounded-lg bg-[#0c0c22] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#9a99a8] border border-[#3f3c68]/30">
            {{ song.side }} Side
          </span>
          <h1 class="mt-2 text-2xl sm:text-3xl font-extrabold font-brand text-[#fffafa] tracking-tight leading-snug break-words">
            {{ song.title }}
          </h1>
          <p class="text-base text-[#f768dd] font-medium">{{ song.artist }}</p>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 text-xs border-t border-[#3f3c68]/30">
          <div>
            <span class="text-[#6f6e80] block text-[11px]">Pack</span>
            <span class="font-semibold text-[#fffafa] truncate block">{{ song.packName || 'Memory Archive (Single)' }}</span>
          </div>
          <div>
            <span class="text-[#6f6e80] block text-[11px]">BPM</span>
            <span class="font-semibold text-[#fffafa]">{{ song.bpm || '—' }}</span>
          </div>
          <div>
            <span class="text-[#6f6e80] block text-[11px]">Length</span>
            <span class="font-semibold text-[#fffafa]">{{ formatLength(song.length) }}</span>
          </div>
          <div>
            <span class="text-[#6f6e80] block text-[11px]">Released</span>
            <span class="font-semibold text-[#fffafa]">{{ song.releasedAt || '—' }}</span>
          </div>
          <div>
            <span class="text-[#6f6e80] block text-[11px]">Version</span>
            <span class="font-semibold text-[#fffafa]">{{ song.version || '—' }}</span>
          </div>
          <div>
            <span class="text-[#6f6e80] block text-[11px]">Composer</span>
            <span class="font-semibold text-[#fffafa] truncate block">{{ song.composer || song.artist || '—' }}</span>
          </div>
        </div>

        <!-- Server Package Download Banner (if hosted on server) -->
        <div v-if="song.hasServerPackage" class="pt-3 border-t border-[#3f3c68]/30 flex flex-wrap items-center justify-between gap-3">
          <div class="text-xs text-[#9a99a8] flex items-center gap-2">
            <span class="inline-block w-2 h-2 rounded-full bg-[#acff82] shadow-[0_0_6px_#acff82]"></span>
            <span>Server Asset Package (.aff charts, .ogg audio, jackets, background)</span>
          </div>
          <a
            :href="`/api/songs/${song.slug}/download`"
            download
            class="rounded-xl bg-[#acff82] text-[#0c0c22] hover:bg-[#acff82]/90 px-3.5 py-1.5 text-xs font-extrabold font-brand transition-all flex items-center gap-1.5 shadow-md hover:scale-[1.02]"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Download Package (.zip)</span>
          </a>
        </div>
      </div>
    </div>

    <!-- Charts / Difficulties Section -->
    <div class="space-y-3">
      <h2 class="text-xs font-bold uppercase tracking-widest text-[#6f6e80] px-1">Chart Difficulties ({{ charts.length }})</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div
          v-for="c in charts"
          :key="c.difficulty"
          class="rounded-2xl bg-[#1a1d32] p-4 border border-[#3f3c68]/30 hover:border-[#f768dd]/50 transition-colors flex flex-col justify-between space-y-3"
        >
          <div class="flex items-center justify-between">
            <span :class="['px-2.5 py-1 rounded-xl text-xs font-extrabold', getDiffColor(c.difficulty)[1], 'text-[#0c0c22]']">
              {{ c.difficulty }}
            </span>
            <div class="text-right">
              <span class="text-xl font-extrabold text-[#fffafa]">{{ c.level }}</span>
            </div>
          </div>

          <div class="space-y-1.5 text-xs border-t border-[#3f3c68]/20 pt-2.5">
            <div class="flex justify-between">
              <span class="text-[#6f6e80]">Chart Constant</span>
              <span class="font-mono font-bold text-[#acff82] text-sm">
                {{ c.constant ? c.constant.toFixed(1) : '—' }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#6f6e80]">Total Notes</span>
              <span class="font-mono text-[#fffafa]">{{ c.noteCount ? c.noteCount.toLocaleString() : '—' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#6f6e80]">Charter</span>
              <span class="text-[#9a99a8] truncate max-w-[140px] text-right">{{ c.chartDesigner || '—' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { jacketGradient } from '~/utils/jacket';
import { DIFFICULTY_COLOR, type DifficultyCode } from '~/utils/difficulty';

const route = useRoute();
const slug = computed(() => route.params.slug as string);

const { data } = await useFetch(`/api/songs/${slug.value}`);
const song = computed(() => data.value?.song);
const charts = computed(() => data.value?.charts || []);

const fandomWikiUrl = computed(() => {
  if (!song.value?.title) return 'https://arcaea.fandom.com/wiki/Arcaea_Wiki';
  const cleanTitle = song.value.title.replace(/ /g, '_');
  return `https://arcaea.fandom.com/wiki/${encodeURIComponent(cleanTitle)}`;
});

function getDiffColor(diff: string) {
  return DIFFICULTY_COLOR[diff as DifficultyCode] || ['text-gray-400', 'bg-gray-400'];
}

function formatLength(val: string | number | null | undefined) {
  if (!val) return '—';
  if (typeof val === 'string' && val.includes(':')) return val;
  const num = Number(val);
  if (isNaN(num) || num <= 0) return String(val);
  const m = Math.floor(num / 60);
  const s = Math.floor(num % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
</script>

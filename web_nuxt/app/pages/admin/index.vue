<template>
  <div class="space-y-6">
    <!-- Top Welcome -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-[#fffafa] font-brand">Administration Dashboard</h1>
        <p class="text-sm text-[#9a99a8]">Manage Arcaea official catalog and Celest private server core.</p>
      </div>
    </div>

    <!-- Hero Stat Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="rounded-2xl bg-[#1a1d32] p-5 border border-[#16133e] space-y-1">
        <span class="text-xs font-bold uppercase tracking-wider text-[#6f6e80]">Official Songs</span>
        <div class="text-3xl font-extrabold font-mono text-[#fffafa]">{{ stats?.totalSongs || 0 }}</div>
        <span class="text-[11px] text-[#9a99a8]">Across 63 official packs</span>
      </div>

      <div class="rounded-2xl bg-[#1a1d32] p-5 border border-[#16133e] space-y-1">
        <span class="text-xs font-bold uppercase tracking-wider text-[#6f6e80]">Total Charts</span>
        <div class="text-3xl font-extrabold font-mono text-[#f768dd]">{{ stats?.totalCharts || 0 }}</div>
        <span class="text-[11px] text-[#9a99a8]">PST, PRS, FTR, BYD, ETR, INS</span>
      </div>

      <div class="rounded-2xl bg-[#1a1d32] p-5 border border-[#16133e] space-y-1">
        <span class="text-xs font-bold uppercase tracking-wider text-[#6f6e80]">Server Custom Songs</span>
        <div class="text-3xl font-extrabold font-mono text-[#acff82]">167</div>
        <span class="text-[11px] text-[#9a99a8]">Fanmade charts with remote_dl</span>
      </div>

      <div class="rounded-2xl bg-[#1a1d32] p-5 border border-[#16133e] space-y-1">
        <span class="text-xs font-bold uppercase tracking-wider text-[#6f6e80]">Course Mode (Dan)</span>
        <div class="text-3xl font-extrabold font-mono text-[#03a8e6]">12 Phases</div>
        <span class="text-[11px] text-[#9a99a8]">Active on ArcaeaServerFork</span>
      </div>
    </div>

    <!-- Difficulty Breakdown & Quick Navigation -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Breakdown Card (2 cols) -->
      <div class="rounded-3xl bg-[#1a1d32] p-6 border border-[#16133e] lg:col-span-2 space-y-4">
        <h2 class="text-sm font-bold uppercase tracking-wider text-[#6f6e80]">Official Chart Difficulties Breakdown</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div
            v-for="(count, diff) in stats?.difficultyBreakdown"
            :key="diff"
            class="rounded-2xl bg-[#0c0c22] p-3.5 border border-[#3f3c68]/20 flex items-center justify-between"
          >
            <div>
              <span :class="['text-xs font-extrabold', getDiffColor(diff)[0]]">{{ diff }}</span>
              <span class="text-[11px] text-[#6f6e80] block">{{ getDiffName(diff) }}</span>
            </div>
            <div class="text-2xl font-extrabold font-mono text-[#fffafa]">{{ count }}</div>
          </div>
        </div>

        <!-- Quick Access Shortcuts -->
        <div class="border-t border-[#3f3c68]/20 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <NuxtLink
            to="/admin/songs"
            class="rounded-xl bg-[#16133e] p-3 text-center text-xs font-semibold text-[#fffafa] hover:bg-[#1e203a] transition-colors"
          >
            Manage Songs & Charts →
          </NuxtLink>
          <NuxtLink
            to="/admin/unofficial"
            class="rounded-xl bg-[#16133e] p-3 text-center text-xs font-semibold text-[#fffafa] hover:bg-[#1e203a] transition-colors"
          >
            Custom Charts (.aff) →
          </NuxtLink>
          <NuxtLink
            to="/admin/store"
            class="rounded-xl bg-[#16133e] p-3 text-center text-xs font-semibold text-[#fffafa] hover:bg-[#1e203a] transition-colors"
          >
            Constants & Store →
          </NuxtLink>
        </div>
      </div>

      <!-- Recently Added Songs (1 col) -->
      <div class="rounded-3xl bg-[#1a1d32] p-6 border border-[#16133e] space-y-3">
        <h2 class="text-sm font-bold uppercase tracking-wider text-[#6f6e80]">Recently Released Songs</h2>
        <div class="space-y-2 max-h-80 overflow-y-auto pr-1">
          <div
            v-for="s in stats?.recentSongs"
            :key="s.id"
            class="flex items-center justify-between rounded-xl bg-[#0c0c22] p-2.5 text-xs border border-[#3f3c68]/20"
          >
            <div class="min-w-0 pr-2">
              <div class="truncate font-semibold text-[#fffafa]">{{ s.title }}</div>
              <div class="text-[11px] text-[#6f6e80] truncate">{{ s.artist }}</div>
            </div>
            <span class="font-mono text-[11px] text-[#9a99a8] shrink-0">{{ s.releasedAt }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { DIFFICULTY_COLOR, type DifficultyCode } from '~/utils/difficulty';

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
});

const { data: stats } = await useFetch('/api/admin/stats');

function getDiffColor(diff: string) {
  return DIFFICULTY_COLOR[diff as DifficultyCode] || ['text-gray-400', 'bg-gray-400'];
}

function getDiffName(diff: string) {
  switch (diff) {
    case 'PST': return 'Past';
    case 'PRS': return 'Present';
    case 'FTR': return 'Future';
    case 'BYD': return 'Beyond';
    case 'ETR': return 'Eternal';
    case 'INS': return 'Inscribed';
    default: return '';
  }
}
</script>

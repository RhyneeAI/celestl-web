<template>
  <div class="space-y-8">
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-[#fffafa] font-brand">Song Packs</h1>
      <p class="text-sm text-[#9a99a8]">Browse Arcaea songs organized by story acts, side stories, and collaborations.</p>
    </div>

    <!-- Section Groups -->
    <div v-for="(packs, sectionName) in sections" :key="sectionName" class="space-y-3">
      <div class="flex items-center gap-2 border-b border-[#16133e] pb-2">
        <span class="h-2 w-2 rounded-full bg-[#f768dd]"></span>
        <h2 class="text-sm font-bold uppercase tracking-wider text-[#9a99a8]">{{ sectionName }}</h2>
        <span class="text-xs text-[#6f6e80]">({{ packs.length }} packs)</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
        <div
          v-for="pack in packs"
          :key="pack.slug"
          class="rounded-2xl bg-[#1a1d32] p-4 border border-[#16133e] hover:border-[#3f3c68]/60 transition-all flex flex-col justify-between space-y-3"
        >
          <div class="flex items-start gap-3">
            <div
              class="h-12 w-12 rounded-xl shadow shrink-0 flex items-center justify-center font-bold text-xs text-white/80"
              :style="{ background: jacketGradient(pack.slug) }"
            >
              {{ pack.name.slice(0, 2).toUpperCase() }}
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="text-sm font-bold text-[#fffafa] leading-snug break-words">{{ pack.name }}</h3>
              <span class="text-xs text-[#9a99a8] block mt-0.5">{{ pack.songCount }} songs</span>
            </div>
          </div>

          <!-- Chapters / Appends -->
          <div v-if="pack.children && pack.children.length > 0" class="border-t border-[#3f3c68]/30 pt-2 space-y-1">
            <span class="text-[10px] uppercase font-bold text-[#6f6e80]">Appends:</span>
            <div class="flex flex-wrap gap-1">
              <span
                v-for="ch in pack.children"
                :key="ch.slug"
                class="rounded-lg bg-[#0c0c22] px-2 py-0.5 text-[11px] font-medium text-[#9a99a8]"
              >
                {{ ch.name }} ({{ ch.songCount }})
              </span>
            </div>
          </div>

          <NuxtLink
            :to="`/?pack=${pack.slug}`"
            class="text-xs font-semibold text-[#03a8e6] hover:text-[#f768dd] transition-colors mt-auto block text-right pt-1"
          >
            Browse Songs →
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { jacketGradient } from '~/utils/jacket';

const { data } = await useFetch('/api/packs');
const sections = computed(() => data.value?.sections || {});
</script>

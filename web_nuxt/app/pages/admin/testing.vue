<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-[#fffafa] font-brand">Testing Tools & OCR Vision</h1>
      <p class="text-sm text-[#9a99a8]">Diagnostic utilities for Arcaea rating engine verification and OCR Best 50 testing.</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Rating Formula Unit Verification -->
      <div class="rounded-3xl bg-[#1a1d32] p-6 border border-[#16133e] space-y-4">
        <h2 class="text-sm font-bold uppercase tracking-wider text-[#6f6e80]">1. Rating Engine Unit Verification</h2>
        <p class="text-xs text-[#9a99a8]">
          Verifies test cases against official Arcaea scoring rules (max(0, constant + modifier) + 0.2 clear bonus).
        </p>

        <div class="space-y-2">
          <div
            v-for="t in testCases"
            :key="t.name"
            class="flex items-center justify-between rounded-xl bg-[#0c0c22] p-3 text-xs border border-[#3f3c68]/20"
          >
            <div>
              <div class="font-semibold text-[#fffafa]">{{ t.name }}</div>
              <div class="font-mono text-[11px] text-[#6f6e80]">
                cc: {{ t.constant }} &bull; score: {{ t.score.toLocaleString() }} &bull; lamp: {{ t.lamp }}
              </div>
            </div>
            <div class="text-right">
              <span class="font-mono font-bold text-sm text-[#acff82]">{{ t.result.toFixed(3) }}</span>
              <span class="block text-[10px] text-[#9a99a8] font-mono">exp: {{ t.expected }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- OCR Vision Best 50 Testing -->
      <div class="rounded-3xl bg-[#1a1d32] p-6 border border-[#16133e] space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-bold uppercase tracking-wider text-[#6f6e80]">2. OCR Best 50 Vision Reader</h2>
          <span class="rounded-lg bg-[#3f3c68]/40 px-2.5 py-0.5 text-[10px] font-bold font-mono text-[#ffd76a]">
            FastAPI Vision
          </span>
        </div>
        <p class="text-xs text-[#9a99a8]">
          Upload an official Arcaea Best 50 screenshot (5×10 card grid) to parse player nickname, rank cards, and scores.
        </p>

        <!-- Dropzone Box -->
        <div class="rounded-2xl border-2 border-dashed border-[#3f3c68] p-8 text-center space-y-3 bg-[#0c0c22]/50 hover:border-[#f768dd] transition-colors cursor-pointer">
          <div class="mx-auto h-12 w-12 rounded-full bg-[#16133e] flex items-center justify-center text-lg text-[#f768dd]">
            📷
          </div>
          <div>
            <span class="text-sm font-semibold text-[#fffafa]">Click to upload or drag screenshot here</span>
            <p class="text-[11px] text-[#6f6e80] mt-1">PNG or JPG official Best 50 export image</p>
          </div>
        </div>

        <div class="rounded-xl bg-[#0c0c22] p-3 text-[11px] text-[#9a99a8] border border-[#3f3c68]/20 flex items-center justify-between">
          <span>Vision Service (FastAPI):</span>
          <span class="font-mono text-[#ffd76a]">http://127.0.0.1:8001 (Planned Fase 3)</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { playRating } from '~/utils/arcaea-rating';

definePageMeta({
  layout: 'admin'
});

const testCases = computed(() => [
  {
    name: 'Extradimensional (Game Proof)',
    constant: 11.3,
    score: 9900167,
    lamp: 'normal_clear',
    expected: '13.001',
    result: playRating(11.3, 9900167, 'normal_clear'),
  },
  {
    name: 'Pure Memory Cap (+2.0)',
    constant: 10.0,
    score: 10000000,
    lamp: 'pure_memory',
    expected: '12.200',
    result: playRating(10.0, 10000000, 'pure_memory'),
  },
  {
    name: 'Track Lost (No Bonus)',
    constant: 10.0,
    score: 9800000,
    lamp: 'lost',
    expected: '11.000',
    result: playRating(10.0, 9800000, 'lost'),
  },
  {
    name: 'Low Score Floor Clamp (min 0 + bonus)',
    constant: 1.0,
    score: 8000000,
    lamp: 'easy_clear',
    expected: '0.200',
    result: playRating(1.0, 8000000, 'easy_clear'),
  },
]);
</script>

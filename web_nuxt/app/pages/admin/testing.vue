<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-[#fffafa] font-brand">Testing Tools & OCR Vision</h1>
      <p class="text-sm text-[#9a99a8]">Diagnostic utilities for Arcaea rating engine verification and live OCR Best 50 testing.</p>
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
          <span class="rounded-lg bg-[#3f3c68]/40 px-2.5 py-0.5 text-[10px] font-bold font-mono text-[#acff82]">
            FastAPI Connected
          </span>
        </div>
        <p class="text-xs text-[#9a99a8]">
          Upload an official Arcaea Best 50 screenshot (5×10 card grid) to parse player nickname, rank cards, and scores.
        </p>

        <!-- Dropzone Box -->
        <input
          ref="fileInputRef"
          type="file"
          accept="image/*"
          class="hidden"
          @change="onFileSelected"
        />

        <div
          @click="fileInputRef?.click()"
          class="rounded-2xl border-2 border-dashed border-[#3f3c68] p-8 text-center space-y-3 bg-[#0c0c22]/50 hover:border-[#f768dd] transition-colors cursor-pointer"
        >
          <div class="mx-auto h-12 w-12 rounded-full bg-[#16133e] flex items-center justify-center text-lg text-[#f768dd]">
            📷
          </div>
          <div>
            <span class="text-sm font-semibold text-[#fffafa]">
              {{ isUploading ? 'Processing screenshot via OCR…' : 'Click to upload Best 50 screenshot' }}
            </span>
            <p class="text-[11px] text-[#6f6e80] mt-1">PNG or JPG official Best 50 export (5×10 grid)</p>
          </div>
        </div>

        <div v-if="ocrError" class="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300">
          {{ ocrError }}
        </div>

        <!-- OCR Results Summary -->
        <div v-if="ocrResult" class="space-y-3 pt-2">
          <div class="rounded-2xl bg-[#0c0c22] p-4 border border-[#3f3c68]/30 space-y-2">
            <div class="flex items-center justify-between border-b border-[#16133e] pb-2">
              <span class="text-xs text-[#9a99a8]">Detected Player:</span>
              <span class="font-bold text-sm text-[#ffd76a] font-brand">{{ ocrResult.nickname || 'Unknown' }}</span>
            </div>
            <div class="flex items-center justify-between border-b border-[#16133e] pb-2 text-xs">
              <span class="text-[#9a99a8]">Generated Date:</span>
              <span class="font-mono text-[#fffafa]">{{ ocrResult.generated_date || '—' }}</span>
            </div>
            <div class="flex items-center justify-between border-b border-[#16133e] pb-2 text-xs">
              <span class="text-[#9a99a8]">Profile Potential:</span>
              <span class="font-mono font-bold text-[#acff82]">{{ ocrResult.printed_potential }} {{ ocrResult.potential_stars || '' }}</span>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span class="text-[#9a99a8]">Extracted Cards:</span>
              <span class="font-mono text-[#f768dd] font-bold">{{ ocrResult.cards?.length || 0 }} cards (Avg Conf: {{ (ocrResult.average_confidence * 100).toFixed(1) }}%)</span>
            </div>
          </div>

          <!-- Top 5 Preview -->
          <div class="space-y-1.5 max-h-60 overflow-y-auto pr-1">
            <div
              v-for="card in ocrResult.cards?.slice(0, 10)"
              :key="card.rank"
              class="flex items-center justify-between rounded-xl bg-[#0c0c22] px-3 py-2 text-xs border border-[#16133e]"
            >
              <div class="flex items-center gap-2 truncate">
                <span class="font-mono font-bold text-[#6f6e80]">#{{ card.rank }}</span>
                <span class="font-semibold text-[#fffafa] truncate">{{ card.title_raw }}</span>
              </div>
              <div class="flex items-center gap-2 font-mono shrink-0">
                <span class="text-[#ffd76a] font-bold">{{ card.score_formatted }}</span>
                <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#16133e] text-[#acff82]">{{ card.grade }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="rounded-xl bg-[#0c0c22] p-3 text-[11px] text-[#9a99a8] border border-[#3f3c68]/20 flex items-center justify-between">
          <span>Vision Service (FastAPI):</span>
          <span class="font-mono text-[#acff82]">http://127.0.0.1:8001/ocr/best50</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { playRating } from '~/utils/arcaea-rating';

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
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

// Live OCR Upload state
const fileInputRef = ref<HTMLInputElement | null>(null);
const isUploading = ref(false);
const ocrError = ref('');
const ocrResult = ref<any | null>(null);

async function onFileSelected(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  isUploading.value = true;
  ocrError.value = '';
  ocrResult.value = null;

  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await $fetch('/api/ocr/best50', {
      method: 'POST',
      body: formData,
    });

    ocrResult.value = response;
  } catch (err: any) {
    ocrError.value = err?.data?.statusMessage || err.message || 'OCR processing failed';
  } finally {
    isUploading.value = false;
  }
}
</script>

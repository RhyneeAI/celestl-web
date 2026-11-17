<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-black font-brand tracking-tight text-[#fffafa] flex items-center gap-3">
          <span>Partners & Characters</span>
          <span class="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold bg-[#f768dd]/15 text-[#f768dd] border border-[#f768dd]/30">
            {{ charactersData?.total ?? 0 }} PARTNERS
          </span>
        </h1>
        <p class="text-xs sm:text-[13px] text-[#9a99a8] mt-1">
          Manage partner character level caps, awakened uncap states, stat progression curves, and active user assignments.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="refresh"
          :disabled="pending"
          class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1e203a] hover:bg-[#3f3c68] text-xs font-bold text-[#fffafa] border border-white/5 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
        >
          <svg class="h-3.5 w-3.5" :class="{ 'animate-spin': pending }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh</span>
        </button>
      </div>
    </div>

    <!-- Quick Stats Bar -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      <div class="rounded-2xl bg-[#1a1d32] p-4 border border-[#16133e] shadow-md">
        <div class="text-[11px] font-bold text-[#6f6e80] uppercase tracking-wider">Total Partners</div>
        <div class="text-2xl font-black font-brand text-white mt-1">{{ charactersData?.total ?? 0 }}</div>
      </div>
      <div class="rounded-2xl bg-[#1a1d32] p-4 border border-[#16133e] shadow-md">
        <div class="text-[11px] font-bold text-[#6f6e80] uppercase tracking-wider">Awakened / Uncapped</div>
        <div class="text-2xl font-black font-brand text-[#f768dd] mt-1">{{ charactersData?.uncappedCount ?? 0 }}</div>
      </div>
      <div class="rounded-2xl bg-[#1a1d32] p-4 border border-[#16133e] shadow-md">
        <div class="text-[11px] font-bold text-[#6f6e80] uppercase tracking-wider">Currently In Use</div>
        <div class="text-2xl font-black font-brand text-[#acff82] mt-1">{{ inUseCount }}</div>
      </div>
      <div class="rounded-2xl bg-[#1a1d32] p-4 border border-[#16133e] shadow-md">
        <div class="text-[11px] font-bold text-[#6f6e80] uppercase tracking-wider">Max Cap Lv.30</div>
        <div class="text-2xl font-black font-brand text-[#ffd76a] mt-1">{{ lv30Count }}</div>
      </div>
    </div>

    <!-- Filter & Search Toolbar -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl bg-[#1a1d32] p-3 border border-[#16133e] shadow-lg">
      <div class="relative flex-1">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search partner name or ID (e.g. Hikari, Tairitsu, 0, 19)…"
          class="w-full rounded-xl bg-[#0c0c22] px-4 py-2 text-xs text-white placeholder-[#6f6e80] border border-[#16133e] focus:border-[#f768dd] focus:outline-none transition-colors"
        />
        <button
          v-if="searchQuery"
          @click="searchQuery = ''"
          class="absolute right-3 top-2.5 text-xs text-[#6f6e80] hover:text-white"
        >
          ✕
        </button>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <!-- Filter Tabs -->
        <div class="flex items-center rounded-xl bg-[#0c0c22] p-1 border border-[#16133e]">
          <button
            v-for="f in filterTabs"
            :key="f.id"
            @click="activeFilter = f.id"
            :class="[
              'px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer',
              activeFilter === f.id
                ? 'bg-[#1a1d32] text-white shadow-sm'
                : 'text-[#6f6e80] hover:text-[#9a99a8]'
            ]"
          >
            {{ f.label }}
          </button>
        </div>

        <!-- Sort Select -->
        <select
          v-model="sortBy"
          class="rounded-xl bg-[#0c0c22] px-3 py-1.5 text-xs text-white border border-[#16133e] focus:border-[#f768dd] focus:outline-none cursor-pointer"
        >
          <option value="id_asc">Sort: ID (Asc)</option>
          <option value="id_desc">Sort: ID (Desc)</option>
          <option value="users_desc">Sort: Most Users</option>
          <option value="name">Sort: Name (A-Z)</option>
        </select>
      </div>
    </div>

    <!-- Loading / Error States -->
    <div v-if="pending" class="py-16 text-center text-xs text-[#9a99a8]">
      <svg class="h-6 w-6 animate-spin mx-auto text-[#f768dd] mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      <span>Loading partner roster…</span>
    </div>

    <div v-else-if="filteredCharacters.length === 0" class="py-16 text-center text-xs text-[#9a99a8] rounded-2xl bg-[#1a1d32] border border-[#16133e]">
      No partner character matching "{{ searchQuery }}".
    </div>

    <!-- Character Cards Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div
        v-for="c in filteredCharacters"
        :key="c.characterId"
        class="rounded-3xl bg-[#1a1d32] border border-[#16133e] shadow-xl p-4 flex flex-col justify-between space-y-3 hover:border-[#f768dd]/40 transition-all group"
      >
        <!-- Top Info Row -->
        <div class="flex items-start gap-3">
          <!-- Portrait Avatar Container -->
          <div class="relative shrink-0">
            <div
              class="size-16 rounded-2xl bg-[#0c0c22] border border-white/10 overflow-hidden shadow-inner flex items-center justify-center cursor-pointer group-hover:border-[#f768dd]/60 transition-colors"
              @click="toggleUncappedPreview(c.characterId)"
              :title="previewUncapped[c.characterId] ? 'Showing Awakened Icon (Click to toggle)' : 'Showing Normal Icon (Click to toggle)'"
            >
              <img
                :src="previewUncapped[c.characterId] ? c.iconUncapped : c.iconNormal"
                :alt="c.name"
                class="size-full object-cover"
                @error="onIconError($event, c)"
              />
            </div>
            <!-- Awakened Toggle Indicator -->
            <button
              type="button"
              @click.stop="toggleUncappedPreview(c.characterId)"
              :class="[
                'absolute -bottom-1.5 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-black font-mono shadow-md border cursor-pointer transition-transform hover:scale-110',
                previewUncapped[c.characterId]
                  ? 'bg-[#f768dd] text-[#0c0c22] border-[#f768dd]'
                  : 'bg-[#0c0c22] text-[#9a99a8] border-white/10'
              ]"
            >
              {{ previewUncapped[c.characterId] ? 'AWK' : 'NORM' }}
            </button>
          </div>

          <!-- Name & Core Tags -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-1">
              <span class="text-[10px] font-mono font-bold text-[#6f6e80]">
                #{{ c.characterId }}
              </span>
              <span
                v-if="c.activeUsersCount > 0"
                class="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-[#acff82]/15 text-[#acff82] border border-[#acff82]/30 flex items-center gap-1"
                title="Players currently equipped with this partner"
              >
                <span>👥 {{ c.activeUsersCount }}</span>
              </span>
            </div>

            <h3 class="text-sm font-bold font-brand text-white truncate mt-0.5" :title="c.displayName">
              {{ c.displayName }}
            </h3>
            <p class="text-[11px] text-[#6f6e80] font-mono truncate" :title="c.name">
              {{ c.name }}
            </p>

            <div class="flex items-center gap-1.5 mt-2 flex-wrap">
              <span
                class="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded"
                :class="c.maxLevel >= 30 ? 'bg-[#ffd76a]/20 text-[#ffd76a] border border-[#ffd76a]/30' : 'bg-white/5 text-[#9a99a8] border border-white/10'"
              >
                Lv.{{ c.maxLevel }}
              </span>

              <span
                v-if="c.isUncapped"
                class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#f768dd]/20 text-[#f768dd] border border-[#f768dd]/30"
              >
                Awakened
              </span>

              <span
                v-else
                class="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white/5 text-[#6f6e80] border border-white/5"
              >
                Standard
              </span>
            </div>
          </div>
        </div>

        <!-- Middle: Skill & Progression -->
        <div class="space-y-2 pt-2 border-t border-[#16133e] text-xs">
          <!-- Skill Badge -->
          <div class="flex items-center justify-between text-[11px]">
            <span class="text-[#6f6e80] font-medium">Skill:</span>
            <span class="font-mono text-[#9a99a8] truncate max-w-[170px]" :title="c.skillId">
              {{ c.skillId || 'None' }}
            </span>
          </div>

          <!-- Stats Matrix Preview -->
          <div class="rounded-xl bg-[#0c0c22]/70 p-2 border border-[#16133e] space-y-1 text-[10px] font-mono">
            <div class="grid grid-cols-4 text-[#6f6e80] font-bold text-center">
              <span class="text-left">Stat</span>
              <span>Lv.1</span>
              <span>Lv.20</span>
              <span :class="c.maxLevel >= 30 ? 'text-[#ffd76a]' : 'text-[#6f6e80]'">Lv.30</span>
            </div>
            <div class="grid grid-cols-4 text-center">
              <span class="text-left text-[#f768dd] font-semibold">Frag</span>
              <span class="text-[#9a99a8]">{{ c.stats.frag1 }}</span>
              <span class="text-white">{{ c.stats.frag20 }}</span>
              <span :class="c.maxLevel >= 30 ? 'text-[#ffd76a] font-bold' : 'text-[#6f6e80]'">{{ c.stats.frag30 }}</span>
            </div>
            <div class="grid grid-cols-4 text-center">
              <span class="text-left text-[#03a8e6] font-semibold">Step</span>
              <span class="text-[#9a99a8]">{{ c.stats.prog1 }}</span>
              <span class="text-white">{{ c.stats.prog20 }}</span>
              <span :class="c.maxLevel >= 30 ? 'text-[#ffd76a] font-bold' : 'text-[#6f6e80]'">{{ c.stats.prog30 }}</span>
            </div>
            <div class="grid grid-cols-4 text-center">
              <span class="text-left text-[#acff82] font-semibold">Over</span>
              <span class="text-[#9a99a8]">{{ c.stats.overdrive1 }}</span>
              <span class="text-white">{{ c.stats.overdrive20 }}</span>
              <span :class="c.maxLevel >= 30 ? 'text-[#ffd76a] font-bold' : 'text-[#6f6e80]'">{{ c.stats.overdrive30 }}</span>
            </div>
          </div>
        </div>

        <!-- Footer / Action Button -->
        <div class="pt-2 border-t border-[#16133e]">
          <button
            type="button"
            @click="openEditModal(c)"
            class="w-full py-1.5 px-3 rounded-xl bg-[#1e203a] hover:bg-[#3f3c68] text-xs font-bold text-white transition-colors cursor-pointer border border-white/5 flex items-center justify-center gap-1.5"
          >
            <svg class="h-3.5 w-3.5 text-[#f768dd]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Edit Stats & Cap</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Character Modal -->
    <div
      v-if="editingCharacter"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto"
      @click.self="editingCharacter = null"
    >
      <div class="w-full max-w-lg rounded-3xl bg-[#1a1d32] border border-[#16133e] p-6 shadow-2xl space-y-5 my-8">
        <!-- Modal Header -->
        <div class="flex items-start justify-between border-b border-[#16133e] pb-4">
          <div class="flex items-center gap-3">
            <div class="size-12 rounded-xl bg-[#0c0c22] border border-white/10 overflow-hidden shrink-0">
              <img :src="editingCharacter.iconNormal" :alt="editingCharacter.name" class="size-full object-cover" />
            </div>
            <div>
              <h3 class="text-base font-bold font-brand text-white">
                Edit Partner: {{ editingCharacter.displayName }}
              </h3>
              <p class="text-xs text-[#9a99a8] font-mono">
                ID {{ editingCharacter.characterId }} · {{ editingCharacter.name }}
              </p>
            </div>
          </div>
          <button
            @click="editingCharacter = null"
            class="rounded-lg p-1 text-[#6f6e80] hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <!-- Form Body -->
        <form @submit.prevent="submitEdit" class="space-y-4">
          <!-- Level Cap & Uncap Toggle -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-[#9a99a8] mb-1.5">Max Level Cap</label>
              <select
                v-model.number="editForm.maxLevel"
                class="w-full rounded-xl bg-[#0c0c22] px-3 py-2 text-xs text-white border border-[#16133e] focus:border-[#f768dd] focus:outline-none"
              >
                <option :value="20">Level 20 (Standard)</option>
                <option :value="30">Level 30 (Awakened)</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-[#9a99a8] mb-1.5">Awakened Uncap State</label>
              <label class="flex items-center gap-2 mt-2 cursor-pointer">
                <input
                  v-model="editForm.isUncapped"
                  type="checkbox"
                  class="size-4 rounded accent-[#f768dd] cursor-pointer"
                />
                <span class="text-xs font-bold" :class="editForm.isUncapped ? 'text-[#f768dd]' : 'text-[#6f6e80]'">
                  {{ editForm.isUncapped ? 'Awakened (Uncapped)' : 'Sealed (Standard)' }}
                </span>
              </label>
            </div>
          </div>

          <!-- Stats Matrix Inputs -->
          <div class="space-y-3 pt-2 border-t border-[#16133e]">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-white uppercase tracking-wider">Stat Progression Multipliers</span>
              <button
                type="button"
                @click="resetStatsToDefaults"
                class="text-[11px] text-[#6f6e80] hover:text-[#9a99a8] underline"
              >
                Revert Changes
              </button>
            </div>

            <!-- Level 1 Stats -->
            <div class="rounded-xl bg-[#0c0c22] p-3 border border-[#16133e] space-y-2">
              <span class="text-[11px] font-bold text-[#6f6e80] uppercase tracking-wider">Level 1 Multipliers</span>
              <div class="grid grid-cols-3 gap-2">
                <div>
                  <label class="block text-[10px] font-mono text-[#f768dd]">Frag</label>
                  <input
                    v-model.number="editForm.frag1"
                    type="number"
                    step="0.1"
                    class="w-full rounded-lg bg-[#1a1d32] px-2 py-1.5 text-xs text-white font-mono border border-white/5 focus:border-[#f768dd] focus:outline-none"
                  />
                </div>
                <div>
                  <label class="block text-[10px] font-mono text-[#03a8e6]">Step (Prog)</label>
                  <input
                    v-model.number="editForm.prog1"
                    type="number"
                    step="0.1"
                    class="w-full rounded-lg bg-[#1a1d32] px-2 py-1.5 text-xs text-white font-mono border border-white/5 focus:border-[#03a8e6] focus:outline-none"
                  />
                </div>
                <div>
                  <label class="block text-[10px] font-mono text-[#acff82]">Overdrive</label>
                  <input
                    v-model.number="editForm.overdrive1"
                    type="number"
                    step="0.1"
                    class="w-full rounded-lg bg-[#1a1d32] px-2 py-1.5 text-xs text-white font-mono border border-white/5 focus:border-[#acff82] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <!-- Level 20 Stats -->
            <div class="rounded-xl bg-[#0c0c22] p-3 border border-[#16133e] space-y-2">
              <span class="text-[11px] font-bold text-[#6f6e80] uppercase tracking-wider">Level 20 Multipliers</span>
              <div class="grid grid-cols-3 gap-2">
                <div>
                  <label class="block text-[10px] font-mono text-[#f768dd]">Frag</label>
                  <input
                    v-model.number="editForm.frag20"
                    type="number"
                    step="0.1"
                    class="w-full rounded-lg bg-[#1a1d32] px-2 py-1.5 text-xs text-white font-mono border border-white/5 focus:border-[#f768dd] focus:outline-none"
                  />
                </div>
                <div>
                  <label class="block text-[10px] font-mono text-[#03a8e6]">Step (Prog)</label>
                  <input
                    v-model.number="editForm.prog20"
                    type="number"
                    step="0.1"
                    class="w-full rounded-lg bg-[#1a1d32] px-2 py-1.5 text-xs text-white font-mono border border-white/5 focus:border-[#03a8e6] focus:outline-none"
                  />
                </div>
                <div>
                  <label class="block text-[10px] font-mono text-[#acff82]">Overdrive</label>
                  <input
                    v-model.number="editForm.overdrive20"
                    type="number"
                    step="0.1"
                    class="w-full rounded-lg bg-[#1a1d32] px-2 py-1.5 text-xs text-white font-mono border border-white/5 focus:border-[#acff82] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <!-- Level 30 Stats -->
            <div class="rounded-xl bg-[#0c0c22] p-3 border border-[#16133e] space-y-2">
              <span class="text-[11px] font-bold text-[#ffd76a] uppercase tracking-wider">Level 30 Multipliers</span>
              <div class="grid grid-cols-3 gap-2">
                <div>
                  <label class="block text-[10px] font-mono text-[#f768dd]">Frag</label>
                  <input
                    v-model.number="editForm.frag30"
                    type="number"
                    step="0.1"
                    class="w-full rounded-lg bg-[#1a1d32] px-2 py-1.5 text-xs text-white font-mono border border-white/5 focus:border-[#f768dd] focus:outline-none"
                  />
                </div>
                <div>
                  <label class="block text-[10px] font-mono text-[#03a8e6]">Step (Prog)</label>
                  <input
                    v-model.number="editForm.prog30"
                    type="number"
                    step="0.1"
                    class="w-full rounded-lg bg-[#1a1d32] px-2 py-1.5 text-xs text-white font-mono border border-white/5 focus:border-[#03a8e6] focus:outline-none"
                  />
                </div>
                <div>
                  <label class="block text-[10px] font-mono text-[#acff82]">Overdrive</label>
                  <input
                    v-model.number="editForm.overdrive30"
                    type="number"
                    step="0.1"
                    class="w-full rounded-lg bg-[#1a1d32] px-2 py-1.5 text-xs text-white font-mono border border-white/5 focus:border-[#acff82] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Notification Feedback -->
          <div v-if="saveMessage" class="p-3 rounded-xl bg-[#acff82]/15 border border-[#acff82]/30 text-xs text-[#acff82] font-semibold">
            {{ saveMessage }}
          </div>
          <div v-if="saveError" class="p-3 rounded-xl bg-[#e14763]/15 border border-[#e14763]/30 text-xs text-[#e14763] font-semibold">
            {{ saveError }}
          </div>

          <!-- Modal Actions -->
          <div class="flex items-center justify-end gap-2 pt-4 border-t border-[#16133e]">
            <button
              type="button"
              @click="editingCharacter = null"
              class="px-4 py-2 rounded-xl bg-[#1e203a] hover:bg-[#3f3c68] text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="px-5 py-2 rounded-xl bg-[#f768dd] hover:bg-[#d946ef] text-xs font-bold text-[#0c0c22] transition-colors cursor-pointer shadow-md disabled:opacity-50"
            >
              {{ saving ? 'Saving…' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import type { AdminCharacterItem } from '~~/server/api/admin/server/characters/index.get';

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
});

const { data: charactersData, pending, refresh } = await useFetch<{
  success: boolean;
  total: number;
  uncappedCount: number;
  characters: AdminCharacterItem[];
}>('/api/admin/server/characters');

const searchQuery = ref('');
const activeFilter = ref<'all' | 'uncapped' | 'in_use' | 'standard'>('all');
const sortBy = ref<'id_asc' | 'id_desc' | 'users_desc' | 'name'>('id_asc');

const filterTabs = [
  { id: 'all' as const, label: 'All' },
  { id: 'uncapped' as const, label: 'Awakened' },
  { id: 'in_use' as const, label: 'In Use' },
  { id: 'standard' as const, label: 'Standard' },
];

// Tracking portrait preview state: map of characterId -> boolean (true = preview awakened icon)
const previewUncapped = reactive<Record<number, boolean>>({});

function toggleUncappedPreview(characterId: number) {
  previewUncapped[characterId] = !previewUncapped[characterId];
}

function onIconError(e: Event, char: AdminCharacterItem) {
  const target = e.target as HTMLImageElement;
  // If awakened icon fails, fall back to normal icon or fallback avatar
  if (target.src.endsWith(`${char.characterId}u_icon.png`)) {
    target.src = char.iconNormal;
  } else {
    target.src = '/storage/characters/0_icon.png';
  }
}

// Quick stats
const inUseCount = computed(() => {
  if (!charactersData.value?.characters) return 0;
  return charactersData.value.characters.filter(c => c.activeUsersCount > 0).length;
});

const lv30Count = computed(() => {
  if (!charactersData.value?.characters) return 0;
  return charactersData.value.characters.filter(c => c.maxLevel >= 30).length;
});

// Filter & Sort
const filteredCharacters = computed(() => {
  let list = (charactersData.value?.characters || []).slice();

  // Search filter
  const q = searchQuery.value.trim().toLowerCase();
  if (q) {
    list = list.filter(c =>
      c.displayName.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      String(c.characterId).includes(q) ||
      c.skillId.toLowerCase().includes(q)
    );
  }

  // Active filter tab
  if (activeFilter.value === 'uncapped') {
    list = list.filter(c => c.isUncapped);
  } else if (activeFilter.value === 'in_use') {
    list = list.filter(c => c.activeUsersCount > 0);
  } else if (activeFilter.value === 'standard') {
    list = list.filter(c => !c.isUncapped);
  }

  // Sort
  if (sortBy.value === 'id_asc') {
    list.sort((a, b) => a.characterId - b.characterId);
  } else if (sortBy.value === 'id_desc') {
    list.sort((a, b) => b.characterId - a.characterId);
  } else if (sortBy.value === 'users_desc') {
    list.sort((a, b) => b.activeUsersCount - a.activeUsersCount || a.characterId - b.characterId);
  } else if (sortBy.value === 'name') {
    list.sort((a, b) => a.displayName.localeCompare(b.displayName));
  }

  return list;
});

// Edit Modal State
const editingCharacter = ref<AdminCharacterItem | null>(null);
const saving = ref(false);
const saveMessage = ref<string | null>(null);
const saveError = ref<string | null>(null);

const editForm = reactive({
  characterId: 0,
  maxLevel: 20,
  isUncapped: false,
  frag1: 0,
  prog1: 0,
  overdrive1: 0,
  frag20: 0,
  prog20: 0,
  overdrive20: 0,
  frag30: 0,
  prog30: 0,
  overdrive30: 0,
});

function openEditModal(c: AdminCharacterItem) {
  editingCharacter.value = c;
  saveMessage.value = null;
  saveError.value = null;

  editForm.characterId = c.characterId;
  editForm.maxLevel = c.maxLevel;
  editForm.isUncapped = c.isUncapped;
  editForm.frag1 = c.stats.frag1;
  editForm.prog1 = c.stats.prog1;
  editForm.overdrive1 = c.stats.overdrive1;
  editForm.frag20 = c.stats.frag20;
  editForm.prog20 = c.stats.prog20;
  editForm.overdrive20 = c.stats.overdrive20;
  editForm.frag30 = c.stats.frag30;
  editForm.prog30 = c.stats.prog30;
  editForm.overdrive30 = c.stats.overdrive30;
}

function resetStatsToDefaults() {
  if (!editingCharacter.value) return;
  const c = editingCharacter.value;
  editForm.maxLevel = c.maxLevel;
  editForm.isUncapped = c.isUncapped;
  editForm.frag1 = c.stats.frag1;
  editForm.prog1 = c.stats.prog1;
  editForm.overdrive1 = c.stats.overdrive1;
  editForm.frag20 = c.stats.frag20;
  editForm.prog20 = c.stats.prog20;
  editForm.overdrive20 = c.stats.overdrive20;
  editForm.frag30 = c.stats.frag30;
  editForm.prog30 = c.stats.prog30;
  editForm.overdrive30 = c.stats.overdrive30;
}

async function submitEdit() {
  saving.value = true;
  saveMessage.value = null;
  saveError.value = null;

  try {
    const res = await $fetch<{ success: boolean; message: string }>('/api/admin/server/characters/update', {
      method: 'POST',
      body: {
        characterId: editForm.characterId,
        maxLevel: editForm.maxLevel,
        isUncapped: editForm.isUncapped,
        frag1: editForm.frag1,
        prog1: editForm.prog1,
        overdrive1: editForm.overdrive1,
        frag20: editForm.frag20,
        prog20: editForm.prog20,
        overdrive20: editForm.overdrive20,
        frag30: editForm.frag30,
        prog30: editForm.prog30,
        overdrive30: editForm.overdrive30,
      },
    });

    saveMessage.value = res.message || 'Updated successfully!';
    await refresh();
    setTimeout(() => {
      editingCharacter.value = null;
    }, 900);
  } catch (err: any) {
    saveError.value = err?.data?.statusMessage || err?.message || 'Failed to save character updates';
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header & Statistics -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-black font-brand tracking-tight text-[#fffafa] flex items-center gap-3">
          <span>Players Management</span>
          <span class="text-xs px-2.5 py-0.5 rounded-full bg-[#f768dd]/15 text-[#f768dd] border border-[#f768dd]/30 font-mono">
            {{ players.length }} registered
          </span>
        </h1>
        <p class="text-xs sm:text-[13px] text-[#9a99a8] mt-1">
          Manage registered Arcaea accounts, memory balances, ban enforcement, and player score records.
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

    <!-- Quick Stat Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <div class="rounded-2xl bg-[#1a1d32] p-4 border border-[#16133e] shadow-lg">
        <span class="text-[11px] font-bold text-[#6f6e80] uppercase tracking-wider">Total Players</span>
        <div class="text-2xl font-black font-brand text-[#fffafa] mt-1">{{ totalCount }}</div>
        <span class="text-[11px] text-[#9a99a8]">All registered UIDs</span>
      </div>

      <div class="rounded-2xl bg-[#1a1d32] p-4 border border-[#16133e] shadow-lg">
        <span class="text-[11px] font-bold text-[#acff82] uppercase tracking-wider">Active Players</span>
        <div class="text-2xl font-black font-brand text-[#acff82] mt-1">{{ activeCount }}</div>
        <span class="text-[11px] text-[#9a99a8]">Account in good standing</span>
      </div>

      <div class="rounded-2xl bg-[#1a1d32] p-4 border border-[#16133e] shadow-lg">
        <span class="text-[11px] font-bold text-[#e14763] uppercase tracking-wider">Banned Accounts</span>
        <div class="text-2xl font-black font-brand text-[#e14763] mt-1">{{ bannedCount }}</div>
        <span class="text-[11px] text-[#9a99a8]">Locked or suspended</span>
      </div>

      <div class="rounded-2xl bg-[#1a1d32] p-4 border border-[#16133e] shadow-lg">
        <span class="text-[11px] font-bold text-[#ffd76a] uppercase tracking-wider">Average Server PTT</span>
        <div class="text-2xl font-black font-brand text-[#ffd76a] mt-1">{{ avgPtt }}</div>
        <span class="text-[11px] text-[#9a99a8]">Modern B50 Potential</span>
      </div>
    </div>

    <!-- Search & Filter Controls -->
    <div class="rounded-2xl bg-[#1a1d32] p-4 border border-[#16133e] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
      <!-- Search Box -->
      <div class="relative flex-1">
        <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6f6e80]">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by player name, user code, or UID…"
          class="w-full pl-9 pr-4 py-2 bg-[#0c0c22] border border-[#16133e] focus:border-[#f768dd] rounded-xl text-xs sm:text-[13px] text-[#fffafa] placeholder-[#6f6e80] focus:outline-none transition-colors"
        />
        <button
          v-if="searchQuery"
          type="button"
          @click="searchQuery = ''"
          class="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9a99a8] hover:text-white"
        >
          ✕
        </button>
      </div>

      <!-- Status Filter Tabs & Sorter -->
      <div class="flex flex-wrap items-center gap-2">
        <div class="flex items-center rounded-xl bg-[#0c0c22] p-1 border border-[#16133e]">
          <button
            v-for="st in [
              { key: 'all', label: `All (${totalCount})` },
              { key: 'active', label: `Active (${activeCount})` },
              { key: 'banned', label: `Banned (${bannedCount})` }
            ]"
            :key="st.key"
            type="button"
            @click="filterStatus = st.key as any"
            :class="[
              'px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer',
              filterStatus === st.key ? 'bg-[#1e203a] text-white shadow-sm' : 'text-[#9a99a8] hover:text-white'
            ]"
          >
            {{ st.label }}
          </button>
        </div>

        <select
          v-model="sortBy"
          class="bg-[#0c0c22] text-[#fffafa] border border-[#16133e] text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-[#f768dd]"
        >
          <option value="ptt">Sort by Potential (PTT)</option>
          <option value="memories">Sort by Memories</option>
          <option value="plays">Sort by Plays</option>
          <option value="joined">Sort by Join Date</option>
          <option value="name">Sort by Name</option>
        </select>
      </div>
    </div>

    <!-- Players Cards / Table -->
    <div v-if="filteredPlayers.length === 0" class="rounded-3xl bg-[#1a1d32] p-12 text-center border border-[#16133e]">
      <div class="h-10 w-10 mx-auto mb-3 rounded-2xl bg-[#0c0c22] border border-[#16133e] flex items-center justify-center text-[#6f6e80]">
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <h3 class="text-base font-bold text-[#fffafa] font-brand">No players found</h3>
      <p class="text-xs text-[#9a99a8] mt-1">Try adjusting your search query or filter status.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="p in filteredPlayers"
        :key="p.userId"
        class="rounded-3xl bg-[#1a1d32] p-4 sm:p-5 border border-[#16133e] shadow-xl hover:border-[#3f3c68]/60 transition-all flex flex-col justify-between space-y-4"
      >
        <!-- Top Row: Avatar & Basic Info -->
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-start gap-3 min-w-0">
            <!-- Avatar / Partner Diamond Frame -->
            <div class="relative size-12 shrink-0 rounded-2xl bg-[#0c0c22] border border-white/10 overflow-hidden flex items-center justify-center shadow-md">
              <span class="text-base font-black font-brand text-[#f768dd]">{{ p.name ? p.name.charAt(0).toUpperCase() : 'U' }}</span>
            </div>

            <!-- Name, User Code & UID -->
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <b class="text-[15px] font-bold text-[#fffafa] truncate font-brand">{{ p.name }}</b>
                <span
                  :class="[
                    'px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider',
                    p.isBanned
                      ? 'bg-[#e14763]/20 text-[#e14763] border border-[#e14763]/40'
                      : 'bg-[#acff82]/20 text-[#acff82] border border-[#acff82]/40'
                  ]"
                >
                  {{ p.isBanned ? 'BANNED' : 'ACTIVE' }}
                </span>
              </div>
              <div class="flex items-center gap-2 mt-0.5 text-xs text-[#9a99a8] font-mono">
                <span>Code: <b class="text-[#f768dd]">{{ p.userCode }}</b></span>
                <span>•</span>
                <span>UID: {{ p.userId }}</span>
              </div>
            </div>
          </div>

          <!-- PTT Rating Badge -->
          <div class="flex flex-col items-end shrink-0">
            <span class="text-[9.5px] font-bold uppercase text-[#6f6e80] tracking-wider">Potential</span>
            <div class="px-2.5 py-0.5 rounded-lg bg-[#0c0c22] border border-[#3f3c68]/40 shadow-inner font-mono font-black text-sm text-[#ffd76a]">
              {{ p.ratingPttFormatted }}
            </div>
          </div>
        </div>

        <!-- Middle Row: Metrics Grid -->
        <div class="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-2xl bg-[#0c0c22]/60 border border-[#16133e] text-center text-xs">
          <div>
            <span class="text-[10px] uppercase font-bold text-[#6f6e80]">Memories</span>
            <div class="text-[13px] font-mono font-black text-[#60a5fa] mt-0.5">
              {{ p.memories.toLocaleString() }}
            </div>
          </div>
          <div>
            <span class="text-[10px] uppercase font-bold text-[#6f6e80]">Saved Plays</span>
            <div class="text-[13px] font-mono font-black text-[#fffafa] mt-0.5">
              {{ p.playCount }}
            </div>
          </div>
          <div>
            <span class="text-[10px] uppercase font-bold text-[#6f6e80]">Joined</span>
            <div class="text-[11px] font-medium text-[#9a99a8] mt-0.5 truncate">
              {{ p.joinDate }}
            </div>
          </div>
        </div>

        <!-- Last Played Preview (if any) -->
        <div v-if="p.lastPlay" class="flex items-center justify-between text-xs text-[#9a99a8] bg-[#16133e]/40 px-3 py-1.5 rounded-xl border border-white/5">
          <span class="truncate">
            Last: <b class="text-white font-mono">{{ p.lastPlay.songId }}</b>
          </span>
          <span class="font-mono font-bold text-[#ffd76a] shrink-0 ml-2">
            {{ p.lastPlay.score.toLocaleString() }}
          </span>
        </div>

        <!-- Actions Toolbar -->
        <div class="pt-2 border-t border-[#16133e] flex flex-wrap items-center justify-between gap-1.5">
          <div class="flex items-center gap-1.5 flex-wrap">
            <!-- Quick Memories Modal Trigger -->
            <button
              type="button"
              @click="openMemoriesModal(p)"
              class="px-2.5 py-1 rounded-lg bg-[#1e203a] hover:bg-[#3f3c68] text-xs font-bold text-[#60a5fa] border border-[#3f3c68]/40 transition-colors cursor-pointer"
              title="Adjust memories balance"
            >
              Memories
            </button>

            <!-- Reset Password Trigger -->
            <button
              type="button"
              @click="openPasswordModal(p)"
              class="px-2.5 py-1 rounded-lg bg-[#1e203a] hover:bg-[#3f3c68] text-xs font-bold text-[#fffafa] border border-[#3f3c68]/40 transition-colors cursor-pointer"
              title="Reset player password"
            >
              Password
            </button>

            <!-- Ban / Unban Toggle -->
            <button
              type="button"
              @click="toggleBan(p)"
              :class="[
                'px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer',
                p.isBanned
                  ? 'bg-[#acff82]/15 text-[#acff82] border-[#acff82]/30 hover:bg-[#acff82]/25'
                  : 'bg-[#e14763]/15 text-[#e14763] border-[#e14763]/30 hover:bg-[#e14763]/25'
              ]"
            >
              {{ p.isBanned ? 'Unban' : 'Ban' }}
            </button>
          </div>

          <div class="flex items-center gap-1.5">
            <!-- Wipe Scores Trigger -->
            <button
              type="button"
              @click="openWipeModal(p)"
              class="p-1.5 rounded-lg bg-[#e14763]/10 hover:bg-[#e14763]/20 text-[#e14763] transition-colors cursor-pointer"
              title="Wipe player scores & reset PTT"
            >
              <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>

            <!-- Export Top 50 B50 Link -->
            <NuxtLink
              :to="`/admin/records?user=${p.userId}&export=b50`"
              class="px-2 py-1 rounded-lg bg-gradient-to-r from-[#9b51e0]/20 to-[#03a8e6]/20 hover:from-[#9b51e0]/40 hover:to-[#03a8e6]/40 text-xs font-black text-[#f768dd] border border-[#f768dd]/40 transition-all cursor-pointer flex items-center gap-1 shadow-sm"
              title="Generate & Export Top 50 B50 Image"
            >
              <span>B50 📸</span>
            </NuxtLink>

            <!-- View Score Records Link -->
            <NuxtLink
              :to="`/admin/records?user=${p.userId}`"
              class="px-2.5 py-1 rounded-lg bg-[#f768dd]/20 hover:bg-[#f768dd] hover:text-[#0c0c22] text-xs font-bold text-[#f768dd] border border-[#f768dd]/30 transition-all cursor-pointer flex items-center gap-1"
            >
              <span>Records</span>
              <span>→</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal 1: Adjust Memories -->
    <Teleport to="body">
      <div
        v-if="editingMemoriesPlayer"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-150"
        @click.self="editingMemoriesPlayer = null"
      >
        <div class="w-full max-w-sm rounded-3xl bg-[#1a1d32] p-6 border border-[#16133e] text-[#fffafa] shadow-2xl space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-bold font-brand">
              Adjust Memories
            </h3>
            <button
              type="button"
              @click="editingMemoriesPlayer = null"
              class="text-[#9a99a8] hover:text-white"
            >
              ✕
            </button>
          </div>

          <p class="text-xs text-[#9a99a8]">
            Update memories balance for player <b class="text-white">{{ editingMemoriesPlayer.name }}</b> (UID {{ editingMemoriesPlayer.userId }}).
          </p>

          <div class="p-3 rounded-2xl bg-[#0c0c22] border border-[#16133e] flex items-center justify-between text-xs">
            <span class="text-[#6f6e80]">Current Balance:</span>
            <span class="font-mono font-bold text-[#60a5fa]">{{ editingMemoriesPlayer.memories.toLocaleString() }} MEM</span>
          </div>

          <!-- Mode Selector -->
          <div class="flex rounded-xl bg-[#0c0c22] p-1 border border-[#16133e]">
            <button
              type="button"
              @click="memoriesMode = 'add'"
              :class="[
                'flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer',
                memoriesMode === 'add' ? 'bg-[#1e203a] text-[#fffafa]' : 'text-[#6f6e80]'
              ]"
            >
              + Add / Top-up
            </button>
            <button
              type="button"
              @click="memoriesMode = 'set'"
              :class="[
                'flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer',
                memoriesMode === 'set' ? 'bg-[#1e203a] text-[#fffafa]' : 'text-[#6f6e80]'
              ]"
            >
              Set Exact Balance
            </button>
          </div>

          <!-- Quick chips -->
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="amt in [100, 500, 1000, 5000]"
              :key="amt"
              type="button"
              @click="memoriesAmount = amt"
              class="px-2.5 py-1 rounded-lg bg-[#1e203a] hover:bg-[#3f3c68] text-xs font-mono font-bold text-[#60a5fa] border border-[#3f3c68]/40 transition-colors cursor-pointer"
            >
              +{{ amt.toLocaleString() }}
            </button>
          </div>

          <!-- Amount Input -->
          <div>
            <label class="block text-[11px] font-bold text-[#6f6e80] uppercase mb-1">Amount</label>
            <input
              v-model.number="memoriesAmount"
              type="number"
              min="0"
              class="w-full px-3 py-2 bg-[#0c0c22] border border-[#16133e] focus:border-[#f768dd] rounded-xl text-sm font-mono font-bold text-white focus:outline-none"
            />
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-[#16133e]">
            <button
              type="button"
              @click="editingMemoriesPlayer = null"
              class="px-4 py-2 rounded-xl bg-[#1e203a] text-xs font-bold text-[#9a99a8] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              :disabled="savingMemories"
              @click="submitMemories"
              class="px-4 py-2 rounded-xl bg-[#60a5fa] hover:bg-[#3b82f6] text-xs font-bold text-[#0c0c22] transition-colors cursor-pointer disabled:opacity-50"
            >
              {{ savingMemories ? 'Updating…' : 'Save Balance' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal 2: Reset Password -->
    <Teleport to="body">
      <div
        v-if="resettingPasswordPlayer"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-150"
        @click.self="resettingPasswordPlayer = null"
      >
        <div class="w-full max-w-sm rounded-3xl bg-[#1a1d32] p-6 border border-[#16133e] text-[#fffafa] shadow-2xl space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-bold font-brand">
              Reset Password
            </h3>
            <button
              type="button"
              @click="resettingPasswordPlayer = null"
              class="text-[#9a99a8] hover:text-white"
            >
              ✕
            </button>
          </div>

          <p class="text-xs text-[#9a99a8]">
            Set new password for <b class="text-white">{{ resettingPasswordPlayer.name }}</b>. If the account was locked or banned, this will also unlock it.
          </p>

          <div>
            <label class="block text-[11px] font-bold text-[#6f6e80] uppercase mb-1">New Password</label>
            <input
              v-model="newPassword"
              type="text"
              placeholder="Minimum 6 characters"
              class="w-full px-3 py-2 bg-[#0c0c22] border border-[#16133e] focus:border-[#f768dd] rounded-xl text-sm font-mono text-white focus:outline-none"
            />
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-[#16133e]">
            <button
              type="button"
              @click="resettingPasswordPlayer = null"
              class="px-4 py-2 rounded-xl bg-[#1e203a] text-xs font-bold text-[#9a99a8] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              :disabled="savingPassword || !newPassword || newPassword.length < 6"
              @click="submitPassword"
              class="px-4 py-2 rounded-xl bg-[#f768dd] hover:bg-[#d946ef] text-xs font-bold text-[#0c0c22] transition-colors cursor-pointer disabled:opacity-50"
            >
              {{ savingPassword ? 'Updating…' : 'Reset Password' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal 3: Wipe Scores Confirmation -->
    <Teleport to="body">
      <div
        v-if="wipingScoresPlayer"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm animate-in fade-in duration-150"
        @click.self="wipingScoresPlayer = null"
      >
        <div class="w-full max-w-sm rounded-3xl bg-[#1a1d32] p-6 border border-[#e14763]/40 text-[#fffafa] shadow-2xl space-y-4">
          <div class="flex items-center justify-between text-[#e14763]">
            <h3 class="text-base font-bold font-brand">
              Wipe All Scores
            </h3>
            <button
              type="button"
              @click="wipingScoresPlayer = null"
              class="text-[#9a99a8] hover:text-white"
            >
              ✕
            </button>
          </div>

          <p class="text-xs text-[#9a99a8]">
            Are you sure you want to permanently delete all play scores and reset Potential PTT to 0 for <b class="text-white">{{ wipingScoresPlayer.name }}</b>?
          </p>

          <div class="p-3 rounded-2xl bg-[#e14763]/10 border border-[#e14763]/30 text-xs text-[#e14763] leading-relaxed">
            <b>Danger:</b> This operation is destructive and cannot be undone. All entries in <code class="font-bold">best_score</code> and <code class="font-bold">recent30</code> will be purged.
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-[#16133e]">
            <button
              type="button"
              @click="wipingScoresPlayer = null"
              class="px-4 py-2 rounded-xl bg-[#1e203a] text-xs font-bold text-[#9a99a8] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              :disabled="savingWipe"
              @click="submitWipe"
              class="px-4 py-2 rounded-xl bg-[#e14763] hover:bg-[#be123c] text-xs font-bold text-white transition-colors cursor-pointer disabled:opacity-50"
            >
              {{ savingWipe ? 'Wiping…' : 'Yes, Wipe Scores' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
});

useHead({
  title: 'Admin · Players Management',
});

interface PlayerItem {
  userId: number;
  name: string;
  userCode: string;
  email: string;
  ratingPtt: number;
  ratingPttFormatted: string;
  memories: number;
  characterId: number;
  isBanned: boolean;
  banReason: string | null;
  joinDate: string;
  joinTimestamp: number;
  playCount: number;
  lastPlay: {
    songId: string;
    difficulty: number;
    score: number;
    clearType: number;
    timePlayed: number;
  } | null;
}

const { data, pending, refresh } = await useFetch<{
  success: boolean;
  total: number;
  activeCount: number;
  bannedCount: number;
  players: PlayerItem[];
}>('/api/admin/server/players');

const players = computed(() => data.value?.players || []);
const totalCount = computed(() => data.value?.total ?? players.value.length);
const activeCount = computed(() => data.value?.activeCount ?? players.value.filter(p => !p.isBanned).length);
const bannedCount = computed(() => data.value?.bannedCount ?? players.value.filter(p => p.isBanned).length);

const avgPtt = computed(() => {
  if (players.value.length === 0) return '0.00';
  const sum = players.value.reduce((acc, p) => acc + (p.ratingPtt || 0), 0);
  return (sum / players.value.length).toFixed(2);
});

// Search & Filter state
const searchQuery = ref('');
const filterStatus = ref<'all' | 'active' | 'banned'>('all');
const sortBy = ref<'ptt' | 'memories' | 'plays' | 'joined' | 'name'>('ptt');

const filteredPlayers = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  let list = players.value.filter((p) => {
    // Filter status
    if (filterStatus.value === 'active' && p.isBanned) return false;
    if (filterStatus.value === 'banned' && !p.isBanned) return false;

    // Search query
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.userCode.includes(q) ||
      String(p.userId).includes(q) ||
      (p.email && p.email.toLowerCase().includes(q))
    );
  });

  // Sort
  list = [...list].sort((a, b) => {
    if (sortBy.value === 'ptt') return b.ratingPtt - a.ratingPtt;
    if (sortBy.value === 'memories') return b.memories - a.memories;
    if (sortBy.value === 'plays') return b.playCount - a.playCount;
    if (sortBy.value === 'joined') return b.joinTimestamp - a.joinTimestamp;
    if (sortBy.value === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  return list;
});

// Modal 1: Adjust Memories
const editingMemoriesPlayer = ref<PlayerItem | null>(null);
const memoriesMode = ref<'add' | 'set'>('add');
const memoriesAmount = ref<number>(500);
const savingMemories = ref(false);

function openMemoriesModal(p: PlayerItem) {
  editingMemoriesPlayer.value = p;
  memoriesMode.value = 'add';
  memoriesAmount.value = 500;
}

async function submitMemories() {
  if (!editingMemoriesPlayer.value) return;
  savingMemories.value = true;
  try {
    await $fetch('/api/admin/server/players/update-memories', {
      method: 'POST',
      body: {
        userId: editingMemoriesPlayer.value.userId,
        amount: memoriesAmount.value,
        mode: memoriesMode.value,
      },
    });
    await refresh();
    editingMemoriesPlayer.value = null;
  } catch (err: any) {
    alert(err?.data?.statusMessage || 'Failed to update memories');
  } finally {
    savingMemories.value = false;
  }
}

// Modal 2: Reset Password
const resettingPasswordPlayer = ref<PlayerItem | null>(null);
const newPassword = ref('');
const savingPassword = ref(false);

function openPasswordModal(p: PlayerItem) {
  resettingPasswordPlayer.value = p;
  newPassword.value = '';
}

async function submitPassword() {
  if (!resettingPasswordPlayer.value || !newPassword.value) return;
  savingPassword.value = true;
  try {
    const res = await $fetch<{ message: string }>('/api/admin/server/players/reset-password', {
      method: 'POST',
      body: {
        userId: resettingPasswordPlayer.value.userId,
        newPassword: newPassword.value,
      },
    });
    alert(res.message);
    await refresh();
    resettingPasswordPlayer.value = null;
  } catch (err: any) {
    alert(err?.data?.statusMessage || 'Failed to reset password');
  } finally {
    savingPassword.value = false;
  }
}

// Ban / Unban Toggle
async function toggleBan(p: PlayerItem) {
  const confirmMsg = p.isBanned
    ? `Unban player ${p.name}? Temporary password will be set to "Arcaea123!".`
    : `Ban player ${p.name}? Their active sessions will be terminated.`;
  if (!confirm(confirmMsg)) return;

  try {
    const res = await $fetch<{ message: string }>('/api/admin/server/players/toggle-ban', {
      method: 'POST',
      body: {
        userId: p.userId,
        ban: !p.isBanned,
      },
    });
    alert(res.message);
    await refresh();
  } catch (err: any) {
    alert(err?.data?.statusMessage || 'Failed to update ban status');
  }
}

// Modal 3: Wipe Scores
const wipingScoresPlayer = ref<PlayerItem | null>(null);
const savingWipe = ref(false);

function openWipeModal(p: PlayerItem) {
  wipingScoresPlayer.value = p;
}

async function submitWipe() {
  if (!wipingScoresPlayer.value) return;
  savingWipe.value = true;
  try {
    const res = await $fetch<{ message: string }>('/api/admin/server/players/wipe-scores', {
      method: 'POST',
      body: {
        userId: wipingScoresPlayer.value.userId,
      },
    });
    alert(res.message);
    await refresh();
    wipingScoresPlayer.value = null;
  } catch (err: any) {
    alert(err?.data?.statusMessage || 'Failed to wipe scores');
  } finally {
    savingWipe.value = false;
  }
}
</script>

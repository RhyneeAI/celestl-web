<template>
  <div class="space-y-6">
    <!-- Header & Navigation -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-black font-brand tracking-tight text-[#fffafa] flex items-center gap-3">
          <span>Mail & Rewards</span>
          <span class="text-xs px-2.5 py-0.5 rounded-full bg-[#f768dd]/15 text-[#f768dd] border border-[#f768dd]/30 font-mono">
            Server Rewards
          </span>
        </h1>
        <p class="text-xs sm:text-[13px] text-[#9a99a8] mt-1">
          Distribute in-game inbox gifts (presents) to player mailboxes and generate promotional redeem codes.
        </p>
      </div>

      <!-- Action Controls & Tab Switcher -->
      <div class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          @click="syncAllNow"
          :disabled="isSyncing"
          class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1e203a] hover:bg-[#3f3c68] text-xs font-bold text-[#fffafa] border border-white/5 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
          title="Refresh presents and redeem codes"
        >
          <svg class="h-3.5 w-3.5" :class="{ 'animate-spin': isSyncing }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh</span>
        </button>

        <div class="flex items-center rounded-2xl bg-[#1a1d32] p-1.5 border border-[#16133e] shadow-lg">
        <button
          type="button"
          @click="activeTab = 'presents'"
          :class="[
            'px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2',
            activeTab === 'presents' ? 'bg-[#16133e] text-white shadow-inner border border-white/10' : 'text-[#9a99a8] hover:text-white'
          ]"
        >
          <span>In-game Mail (Presents)</span>
          <span class="px-1.5 py-0.2 rounded-md bg-[#f768dd]/20 text-[#f768dd] text-[10px] font-mono">
            {{ presents.length }}
          </span>
        </button>

        <button
          type="button"
          @click="activeTab = 'redeem'"
          :class="[
            'px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2',
            activeTab === 'redeem' ? 'bg-[#16133e] text-white shadow-inner border border-white/10' : 'text-[#9a99a8] hover:text-white'
          ]"
        >
          <span>Redeem Codes</span>
          <span class="px-1.5 py-0.2 rounded-md bg-[#60a5fa]/20 text-[#60a5fa] text-[10px] font-mono">
            {{ redeemCodes.length }}
          </span>
        </button>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- TAB 1: IN-GAME MAIL (PRESENTS) -->
    <!-- ========================================================================= -->
    <div v-if="activeTab === 'presents'" class="space-y-4">
      <!-- Toolbar -->
      <div class="flex items-center justify-between gap-3 bg-[#1a1d32] p-4 rounded-2xl border border-[#16133e] shadow-lg">
        <div class="text-xs text-[#9a99a8]">
          Players receive presents directly in their Arcaea inbox upon opening the game.
        </div>
        <button
          type="button"
          @click="openCreatePresentModal"
          class="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#f768dd] hover:bg-[#d946ef] text-xs font-bold text-[#0c0c22] transition-colors cursor-pointer shadow-md"
        >
          <span>Send Present</span>
        </button>
      </div>

      <!-- Presents List -->
      <div v-if="presents.length === 0" class="rounded-3xl bg-[#1a1d32] p-12 text-center border border-[#16133e]">
        <h3 class="text-base font-bold text-[#fffafa] font-brand">No active mail presents</h3>
        <p class="text-xs text-[#9a99a8] mt-1">Send your first in-game present or event compensation above.</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="p in presents"
          :key="p.presentId"
          class="rounded-3xl bg-[#1a1d32] p-5 border border-[#16133e] shadow-xl hover:border-[#3f3c68]/60 transition-all flex flex-col justify-between space-y-4"
        >
          <!-- Top Row: ID, Status & Delete -->
          <div class="flex items-start justify-between gap-2">
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-mono font-bold text-sm text-[#fffafa]">{{ p.presentId }}</span>
                <span
                  :class="[
                    'px-2 py-0.5 rounded-full text-[10px] font-mono font-bold',
                    p.isExpired
                      ? 'bg-[#e14763]/20 text-[#e14763] border border-[#e14763]/40'
                      : 'bg-[#acff82]/20 text-[#acff82] border border-[#acff82]/40'
                  ]"
                >
                  {{ p.isExpired ? 'EXPIRED' : 'ACTIVE' }}
                </span>
              </div>
              <p class="text-xs text-[#9a99a8] mt-1 leading-relaxed">
                {{ p.description }}
              </p>
            </div>

            <button
              type="button"
              @click="deletePresent(p.presentId)"
              class="p-1.5 rounded-lg bg-[#e14763]/10 hover:bg-[#e14763]/25 text-[#e14763] transition-colors cursor-pointer shrink-0"
              title="Delete present"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          <!-- Middle Row: Attached Rewards -->
          <div class="p-3 rounded-2xl bg-[#0c0c22]/70 border border-[#16133e] space-y-1.5">
            <span class="text-[10px] uppercase font-bold text-[#6f6e80] tracking-wider block">Attached Rewards</span>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="(it, i) in p.items"
                :key="i"
                class="px-2.5 py-1 rounded-lg bg-[#16133e] border border-white/10 text-xs font-mono font-bold text-[#ffd76a] flex items-center gap-1.5 shadow-sm"
              >
                <span class="px-1.5 py-0.2 rounded bg-black/40 text-[9.5px] uppercase font-mono text-[#9a99a8]">{{ it.type }}</span>
                <span>{{ it.amount.toLocaleString() }}x {{ it.itemId }}</span>
              </span>
            </div>
          </div>

          <!-- Bottom Row: Meta Info -->
          <div class="flex items-center justify-between text-xs text-[#9a99a8] pt-2 border-t border-[#16133e]">
            <span class="flex items-center gap-1.5">
              <span>Delivered:</span>
              <b class="text-white font-mono">{{ p.deliveredCount }} player(s)</b>
            </span>
            <span class="font-mono text-[11px]">
              Exp: {{ p.expireDate }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- TAB 2: REDEEM CODES -->
    <!-- ========================================================================= -->
    <div v-else class="space-y-4">
      <!-- Toolbar -->
      <div class="flex items-center justify-between gap-3 bg-[#1a1d32] p-4 rounded-2xl border border-[#16133e] shadow-lg">
        <div class="text-xs text-[#9a99a8]">
          Players redeem codes in game or on web to receive attached items.
        </div>
        <button
          type="button"
          @click="openCreateRedeemModal"
          class="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#60a5fa] hover:bg-[#3b82f6] text-xs font-bold text-[#0c0c22] transition-colors cursor-pointer shadow-md"
        >
          <span>Create Redeem Code</span>
        </button>
      </div>

      <!-- Redeem Codes List -->
      <div v-if="redeemCodes.length === 0" class="rounded-3xl bg-[#1a1d32] p-12 text-center border border-[#16133e]">
        <h3 class="text-base font-bold text-[#fffafa] font-brand">No redeem codes created</h3>
        <p class="text-xs text-[#9a99a8] mt-1">Generate your first promotional or giveaway code above.</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="rc in redeemCodes"
          :key="rc.code"
          class="rounded-3xl bg-[#1a1d32] p-5 border border-[#16133e] shadow-xl hover:border-[#3f3c68]/60 transition-all flex flex-col justify-between space-y-4"
        >
          <!-- Top Row: Code Badge with 1-Click Copy -->
          <div class="flex items-start justify-between gap-2">
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  @click="copyToClipboard(rc.code)"
                  class="group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0c0c22] hover:bg-[#16133e] border border-[#3f3c68]/50 text-white font-mono font-black text-sm tracking-widest transition-all cursor-pointer shadow-inner"
                  title="Click to copy code"
                >
                  <span class="text-[#f768dd]">{{ rc.code }}</span>
                  <span class="text-[10px] text-[#6f6e80] group-hover:text-white uppercase font-bold tracking-wider transition-colors">Copy</span>
                </button>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#60a5fa]/20 text-[#60a5fa] border border-[#60a5fa]/40">
                  {{ rc.typeLabel }}
                </span>
              </div>
            </div>

            <button
              type="button"
              @click="deleteRedeem(rc.code)"
              class="p-1.5 rounded-lg bg-[#e14763]/10 hover:bg-[#e14763]/25 text-[#e14763] transition-colors cursor-pointer shrink-0"
              title="Delete code"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          <!-- Middle Row: Attached Rewards -->
          <div class="p-3 rounded-2xl bg-[#0c0c22]/70 border border-[#16133e] space-y-1.5">
            <span class="text-[10px] uppercase font-bold text-[#6f6e80] tracking-wider block">Attached Rewards</span>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="(it, i) in rc.items"
                :key="i"
                class="px-2.5 py-1 rounded-lg bg-[#16133e] border border-white/10 text-xs font-mono font-bold text-[#ffd76a] flex items-center gap-1.5 shadow-sm"
              >
                <span class="px-1.5 py-0.2 rounded bg-black/40 text-[9.5px] uppercase font-mono text-[#9a99a8]">{{ it.type }}</span>
                <span>{{ it.amount.toLocaleString() }}x {{ it.itemId }}</span>
              </span>
            </div>
          </div>

          <!-- Bottom Row: Claims & Details -->
          <div class="flex items-center justify-between text-xs text-[#9a99a8] pt-2 border-t border-[#16133e]">
            <span class="flex items-center gap-1.5">
              <span>Claimed:</span>
              <b class="text-white font-mono">{{ rc.claimedCount }} player(s)</b>
            </span>

            <button
              v-if="rc.claimedCount > 0"
              type="button"
              @click="viewClaims(rc)"
              class="hover:text-[#60a5fa] font-bold text-[11px] underline cursor-pointer"
            >
              View Claims
            </button>
            <span v-else class="text-[11px] text-[#6f6e80]">
              Unclaimed
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal 1: Create Present -->
    <Teleport to="body">
      <div
        v-if="showCreatePresentModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-150"
        @click.self="showCreatePresentModal = false"
      >
        <div class="w-full max-w-lg rounded-3xl bg-[#1a1d32] p-6 border border-[#16133e] text-[#fffafa] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-bold font-brand">
              <span>Create In-Game Present</span>
            </h3>
            <button
              type="button"
              @click="showCreatePresentModal = false"
              class="text-[#9a99a8] hover:text-white"
            >
              ✕
            </button>
          </div>

          <p class="text-xs text-[#9a99a8]">
            This gift will appear in the player's inbox in the Arcaea client.
          </p>

          <!-- Description -->
          <div>
            <label class="block text-[11px] font-bold text-[#6f6e80] uppercase mb-1">Message / Description *</label>
            <input
              v-model="newPresent.description"
              type="text"
              placeholder="e.g. Server Maintenance Compensation"
              class="w-full px-3 py-2 bg-[#0c0c22] border border-[#16133e] focus:border-[#f768dd] rounded-xl text-xs sm:text-[13px] text-white focus:outline-none"
            />
          </div>

          <!-- Target Selector -->
          <div>
            <label class="block text-[11px] font-bold text-[#6f6e80] uppercase mb-1">Recipient *</label>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                @click="newPresent.target = 'all'"
                :class="[
                  'py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer',
                  newPresent.target === 'all'
                    ? 'bg-[#f768dd]/20 border-[#f768dd] text-[#f768dd]'
                    : 'bg-[#0c0c22] border-[#16133e] text-[#9a99a8]'
                ]"
              >
                All Registered Players
              </button>
              <button
                type="button"
                @click="newPresent.target = 'single'"
                :class="[
                  'py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer',
                  newPresent.target === 'single'
                    ? 'bg-[#f768dd]/20 border-[#f768dd] text-[#f768dd]'
                    : 'bg-[#0c0c22] border-[#16133e] text-[#9a99a8]'
                ]"
              >
                Specific Player
              </button>
            </div>
          </div>

          <!-- If single target: select player -->
          <div v-if="newPresent.target === 'single'">
            <label class="block text-[11px] font-bold text-[#6f6e80] uppercase mb-1">Select Player</label>
            <select
              v-model="newPresent.userId"
              class="w-full px-3 py-2 bg-[#0c0c22] border border-[#16133e] focus:border-[#f768dd] rounded-xl text-xs font-mono text-white focus:outline-none"
            >
              <option v-for="u in playerOptions" :key="u.userId" :value="u.userId">
                {{ u.name }} (Code: {{ u.userCode }})
              </option>
            </select>
          </div>

          <!-- Expiration Days -->
          <div>
            <label class="block text-[11px] font-bold text-[#6f6e80] uppercase mb-1">Expires After</label>
            <div class="flex gap-2">
              <button
                v-for="d in [7, 30, 90, 365]"
                :key="d"
                type="button"
                @click="newPresent.expireDays = d"
                :class="[
                  'flex-1 py-1.5 text-xs font-mono font-bold rounded-xl border transition-all cursor-pointer',
                  newPresent.expireDays === d
                    ? 'bg-[#1e203a] text-white border-white/20'
                    : 'bg-[#0c0c22] text-[#6f6e80] border-[#16133e]'
                ]"
              >
                {{ d }}d
              </button>
            </div>
          </div>

          <!-- Attached Items Selector -->
          <div class="space-y-2 pt-2 border-t border-[#16133e]">
            <div class="flex items-center justify-between">
              <label class="block text-[11px] font-bold text-[#6f6e80] uppercase">Attached Items</label>
              <!-- Quick presets -->
              <div class="flex gap-1">
                <button
                  type="button"
                  @click="addPresetItem('ticket', 'ticket', 100)"
                  class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#60a5fa]/20 text-[#60a5fa] hover:bg-[#60a5fa]/30"
                >
                  +100 Mem
                </button>
                <button
                  type="button"
                  @click="addPresetItem('ticket', 'ticket', 500)"
                  class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#60a5fa]/20 text-[#60a5fa] hover:bg-[#60a5fa]/30"
                >
                  +500 Mem
                </button>
                <button
                  type="button"
                  @click="addPresetItem('fragment', 'fragment', 2000)"
                  class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#ffd76a]/20 text-[#ffd76a] hover:bg-[#ffd76a]/30"
                >
                  +2000 Frag
                </button>
              </div>
            </div>

            <div v-for="(it, idx) in newPresent.items" :key="idx" class="flex items-center gap-2">
              <select
                v-model="it.type"
                @change="onItemTypeChange(it)"
                class="w-28 px-2 py-1.5 bg-[#0c0c22] border border-[#16133e] rounded-xl text-xs text-white"
              >
                <option value="ticket">ticket (Memories)</option>
                <option value="fragment">fragment</option>
                <option value="core">core</option>
                <option value="single">single (Song)</option>
                <option value="pack">pack</option>
              </select>

              <select
                v-if="it.type === 'single'"
                v-model="it.itemId"
                class="flex-1 min-w-0 px-3 py-1.5 bg-[#0c0c22] border border-[#16133e] rounded-xl text-xs font-mono text-white"
              >
                <option v-for="song in songOptions" :key="song.id" :value="song.id">
                  {{ song.title }} ({{ song.id }})
                </option>
              </select>

              <select
                v-else-if="it.type === 'pack'"
                v-model="it.itemId"
                class="flex-1 min-w-0 px-3 py-1.5 bg-[#0c0c22] border border-[#16133e] rounded-xl text-xs font-mono text-white"
              >
                <option v-for="pk in packOptions" :key="pk.id" :value="pk.id">
                  {{ pk.title }} ({{ pk.id }})
                </option>
              </select>

              <select
                v-else-if="it.type === 'core'"
                v-model="it.itemId"
                class="flex-1 min-w-0 px-3 py-1.5 bg-[#0c0c22] border border-[#16133e] rounded-xl text-xs font-mono text-white"
              >
                <option v-for="cr in coreOptions" :key="cr.id" :value="cr.id">
                  {{ cr.label }}
                </option>
              </select>

              <input
                v-else
                v-model="it.itemId"
                type="text"
                placeholder="Item ID"
                class="flex-1 min-w-0 px-3 py-1.5 bg-[#0c0c22] border border-[#16133e] rounded-xl text-xs font-mono text-white"
              />

              <input
                v-model.number="it.amount"
                type="number"
                min="1"
                class="w-20 px-2 py-1.5 bg-[#0c0c22] border border-[#16133e] rounded-xl text-xs font-mono text-white text-right"
              />

              <button
                type="button"
                @click="newPresent.items.splice(idx, 1)"
                class="p-1.5 text-[#e14763] hover:text-red-400 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <button
              type="button"
              @click="newPresent.items.push({ itemId: 'ticket', type: 'ticket', amount: 100 })"
              class="w-full py-1.5 rounded-xl border border-dashed border-[#3f3c68] text-xs font-bold text-[#9a99a8] hover:text-white transition-colors cursor-pointer"
            >
              + Add Custom Item
            </button>
          </div>

          <!-- Submit Buttons -->
          <div class="flex items-center justify-end gap-2 pt-3 border-t border-[#16133e]">
            <button
              type="button"
              @click="showCreatePresentModal = false"
              class="px-4 py-2 rounded-xl bg-[#1e203a] text-xs font-bold text-[#9a99a8] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              :disabled="savingPresent || !newPresent.description || newPresent.items.length === 0"
              @click="submitCreatePresent"
              class="px-4 py-2 rounded-xl bg-[#f768dd] hover:bg-[#d946ef] text-xs font-bold text-[#0c0c22] transition-colors cursor-pointer disabled:opacity-50"
            >
              {{ savingPresent ? 'Delivering…' : 'Send & Deliver' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal 2: Create Redeem Code -->
    <Teleport to="body">
      <div
        v-if="showCreateRedeemModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-150"
        @click.self="showCreateRedeemModal = false"
      >
        <div class="w-full max-w-lg rounded-3xl bg-[#1a1d32] p-6 border border-[#16133e] text-[#fffafa] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-bold font-brand">
              <span>Create Redeem Code</span>
            </h3>
            <button
              type="button"
              @click="showCreateRedeemModal = false"
              class="text-[#9a99a8] hover:text-white"
            >
              ✕
            </button>
          </div>

          <!-- Code input -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block text-[11px] font-bold text-[#6f6e80] uppercase">Code</label>
              <button
                type="button"
                @click="generateRandomCode"
                class="text-[11px] text-[#60a5fa] hover:underline font-bold cursor-pointer"
              >
                Generate Random Code
              </button>
            </div>
            <input
              v-model="newRedeem.code"
              type="text"
              minlength="10"
              placeholder="e.g. celestl2026 (Min. 10 chars, leave blank for random)"
              class="w-full px-3 py-2 bg-[#0c0c22] border border-[#16133e] focus:border-[#60a5fa] rounded-xl text-sm font-mono font-bold text-white lowercase focus:outline-none"
            />
            <p class="mt-1 text-[10px] text-[#6f6e80]">
              Minimum 10 characters, lowercase (enforced by the in-game client).
            </p>
          </div>

          <!-- Type Selector -->
          <div>
            <label class="block text-[11px] font-bold text-[#6f6e80] uppercase mb-1">Redeem Rules</label>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                @click="newRedeem.type = 0"
                :class="[
                  'py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer',
                  newRedeem.type === 0
                    ? 'bg-[#60a5fa]/20 border-[#60a5fa] text-[#60a5fa]'
                    : 'bg-[#0c0c22] border-[#16133e] text-[#9a99a8]'
                ]"
              >
                Single Use (Global 1-time)
              </button>
              <button
                type="button"
                @click="newRedeem.type = 1"
                :class="[
                  'py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer',
                  newRedeem.type === 1
                    ? 'bg-[#60a5fa]/20 border-[#60a5fa] text-[#60a5fa]'
                    : 'bg-[#0c0c22] border-[#16133e] text-[#9a99a8]'
                ]"
              >
                Reusable (1x per Player)
              </button>
            </div>
          </div>

          <!-- Attached Items -->
          <div class="space-y-2 pt-2 border-t border-[#16133e]">
            <div class="flex items-center justify-between">
              <label class="block text-[11px] font-bold text-[#6f6e80] uppercase">Attached Rewards</label>
              <div class="flex gap-1">
                <button
                  type="button"
                  @click="addPresetRedeemItem('ticket', 'ticket', 100)"
                  class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#60a5fa]/20 text-[#60a5fa]"
                >
                  +100 Mem
                </button>
                <button
                  type="button"
                  @click="addPresetRedeemItem('ticket', 'ticket', 500)"
                  class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#60a5fa]/20 text-[#60a5fa]"
                >
                  +500 Mem
                </button>
              </div>
            </div>

            <div v-for="(it, idx) in newRedeem.items" :key="idx" class="flex items-center gap-2">
              <select
                v-model="it.type"
                @change="onItemTypeChange(it)"
                class="w-28 px-2 py-1.5 bg-[#0c0c22] border border-[#16133e] rounded-xl text-xs text-white"
              >
                <option value="ticket">ticket (Memories)</option>
                <option value="fragment">fragment</option>
                <option value="core">core</option>
                <option value="single">single (Song)</option>
                <option value="pack">pack</option>
              </select>

              <select
                v-if="it.type === 'single'"
                v-model="it.itemId"
                class="flex-1 min-w-0 px-3 py-1.5 bg-[#0c0c22] border border-[#16133e] rounded-xl text-xs font-mono text-white"
              >
                <option v-for="song in songOptions" :key="song.id" :value="song.id">
                  {{ song.title }} ({{ song.id }})
                </option>
              </select>

              <select
                v-else-if="it.type === 'pack'"
                v-model="it.itemId"
                class="flex-1 min-w-0 px-3 py-1.5 bg-[#0c0c22] border border-[#16133e] rounded-xl text-xs font-mono text-white"
              >
                <option v-for="pk in packOptions" :key="pk.id" :value="pk.id">
                  {{ pk.title }} ({{ pk.id }})
                </option>
              </select>

              <select
                v-else-if="it.type === 'core'"
                v-model="it.itemId"
                class="flex-1 min-w-0 px-3 py-1.5 bg-[#0c0c22] border border-[#16133e] rounded-xl text-xs font-mono text-white"
              >
                <option v-for="cr in coreOptions" :key="cr.id" :value="cr.id">
                  {{ cr.label }}
                </option>
              </select>

              <input
                v-else
                v-model="it.itemId"
                type="text"
                placeholder="Item ID"
                class="flex-1 min-w-0 px-3 py-1.5 bg-[#0c0c22] border border-[#16133e] rounded-xl text-xs font-mono text-white"
              />

              <input
                v-model.number="it.amount"
                type="number"
                min="1"
                class="w-20 px-2 py-1.5 bg-[#0c0c22] border border-[#16133e] rounded-xl text-xs font-mono text-white text-right"
              />

              <button
                type="button"
                @click="newRedeem.items.splice(idx, 1)"
                class="p-1.5 text-[#e14763] hover:text-red-400 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <button
              type="button"
              @click="newRedeem.items.push({ itemId: 'ticket', type: 'ticket', amount: 100 })"
              class="w-full py-1.5 rounded-xl border border-dashed border-[#3f3c68] text-xs font-bold text-[#9a99a8] hover:text-white transition-colors cursor-pointer"
            >
              + Add Custom Item
            </button>
          </div>

          <!-- Submit Buttons -->
          <div class="flex items-center justify-end gap-2 pt-3 border-t border-[#16133e]">
            <button
              type="button"
              @click="showCreateRedeemModal = false"
              class="px-4 py-2 rounded-xl bg-[#1e203a] text-xs font-bold text-[#9a99a8] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              :disabled="savingRedeem || newRedeem.items.length === 0"
              @click="submitCreateRedeem"
              class="px-4 py-2 rounded-xl bg-[#60a5fa] hover:bg-[#3b82f6] text-xs font-bold text-[#0c0c22] transition-colors cursor-pointer disabled:opacity-50"
            >
              {{ savingRedeem ? 'Creating…' : 'Create Code' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal 3: View Claims Modal -->
    <Teleport to="body">
      <div
        v-if="viewingClaimsCode"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-150"
        @click.self="viewingClaimsCode = null"
      >
        <div class="w-full max-w-sm rounded-3xl bg-[#1a1d32] p-6 border border-[#16133e] text-[#fffafa] shadow-2xl space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-bold font-brand flex items-center gap-2">
              <span>Claims: {{ viewingClaimsCode.code }}</span>
            </h3>
            <button
              type="button"
              @click="viewingClaimsCode = null"
              class="text-[#9a99a8] hover:text-white"
            >
              ✕
            </button>
          </div>

          <p class="text-xs text-[#9a99a8]">
            Total {{ viewingClaimsCode.claimedUsers.length }} player(s) have redeemed this code.
          </p>

          <div class="max-h-60 overflow-y-auto space-y-1.5 p-2 rounded-2xl bg-[#0c0c22] border border-[#16133e]">
            <div
              v-for="u in viewingClaimsCode.claimedUsers"
              :key="u.userId"
              class="flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#16133e]/50 text-xs"
            >
              <b class="text-white">{{ u.name }}</b>
              <span class="font-mono text-[#9a99a8]">UID {{ u.userId }}</span>
            </div>
          </div>

          <div class="flex justify-end pt-2 border-t border-[#16133e]">
            <button
              type="button"
              @click="viewingClaimsCode = null"
              class="px-4 py-2 rounded-xl bg-[#1e203a] text-xs font-bold text-white hover:bg-[#3f3c68]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
});

useHead({
  title: 'Admin · Mail & Rewards',
});

const activeTab = ref<'presents' | 'redeem'>('presents');

// 1. Fetch Presents
const { data: presentsData, refresh: refreshPresents } = await useFetch<{
  success: boolean;
  total: number;
  activeCount: number;
  presents: Array<{
    presentId: string;
    description: string;
    expireTs: number;
    expireDate: string;
    isExpired: boolean;
    deliveredCount: number;
    items: Array<{ itemId: string; type: string; amount: number }>;
  }>;
}>('/api/admin/server/rewards/presents');

const presents = computed(() => presentsData.value?.presents || []);

// 2. Fetch Redeem Codes
const { data: redeemData, refresh: refreshRedeem } = await useFetch<{
  success: boolean;
  total: number;
  codes: Array<{
    code: string;
    type: number;
    typeLabel: string;
    items: Array<{ itemId: string; type: string; amount: number }>;
    claimedCount: number;
    claimedUsers: Array<{ userId: number; name: string }>;
  }>;
}>('/api/admin/server/rewards/redeem');

const redeemCodes = computed(() => redeemData.value?.codes || []);

// 3. Fetch Player list for recipient selector
const { data: playersData } = await useFetch<{
  players: Array<{ userId: number; name: string; userCode: string }>;
}>('/api/admin/server/players');

const playerOptions = computed(() => playersData.value?.players || []);

// 4. Fetch Song & Pack lists for single/pack reward selectors
const { data: songsData } = await useFetch<{
  songs: Array<{ id: string; title: string; set: string }>;
}>('/api/admin/server/songs');

const { data: storeData } = await useFetch<{
  items: Array<{ purchase_name: string; title: string; category: string; items?: Array<{ item_id: string; type: string }> }>;
}>('/api/admin/server/store');

const { data: coresData } = await useFetch<{
  cores: Array<{ id: string; label: string }>;
}>('/api/admin/server/rewards/cores');

const coreOptions = computed(() => coresData.value?.cores || []);

const songOptions = computed(() =>
  [...(songsData.value?.songs || [])].sort((a, b) => a.title.localeCompare(b.title))
);

const packOptions = computed(() => {
  const map = new Map<string, string>();
  for (const item of storeData.value?.items || []) {
    if (item.category === 'pack') {
      const packId = item.items?.find((x) => x.type === 'pack')?.item_id || item.purchase_name;
      if (packId && !map.has(packId)) {
        map.set(packId, item.title || packId);
      }
    }
  }
  for (const s of songOptions.value) {
    if (s.set && s.set !== 'single' && s.set !== 'base' && !map.has(s.set)) {
      map.set(s.set, s.set);
    }
  }
  return Array.from(map.entries())
    .map(([id, title]) => ({ id, title }))
    .sort((a, b) => a.title.localeCompare(b.title));
});

function onItemTypeChange(it: { type: string; itemId: string; amount: number }) {
  if (it.type === 'single') {
    if (!songOptions.value.some((s) => s.id === it.itemId)) {
      it.itemId = songOptions.value[0]?.id || '';
    }
    it.amount = 1;
  } else if (it.type === 'pack') {
    if (!packOptions.value.some((p) => p.id === it.itemId)) {
      it.itemId = packOptions.value[0]?.id || '';
    }
    it.amount = 1;
  } else if (it.type === 'ticket') {
    if (it.itemId !== 'ticket') it.itemId = 'ticket';
  } else if (it.type === 'fragment') {
    if (it.itemId !== 'fragment') it.itemId = 'fragment';
  } else if (it.type === 'core') {
    if (!coreOptions.value.some((c) => c.id === it.itemId)) {
      it.itemId = coreOptions.value.find((c) => c.id === 'core_generic')?.id || coreOptions.value[0]?.id || 'core_generic';
    }
  }
}


// Modal 1: Create Present
const showCreatePresentModal = ref(false);
const savingPresent = ref(false);
const newPresent = ref({
  description: '',
  expireDays: 30,
  target: 'all' as 'all' | 'single',
  userId: undefined as number | undefined,
  items: [
    { itemId: 'ticket', type: 'ticket', amount: 500 },
  ],
});

function openCreatePresentModal() {
  newPresent.value = {
    description: '',
    expireDays: 30,
    target: 'all',
    userId: playerOptions.value[0]?.userId,
    items: [{ itemId: 'ticket', type: 'ticket', amount: 500 }],
  };
  showCreatePresentModal.value = true;
}

function addPresetItem(type: string, itemId: string, amount: number) {
  newPresent.value.items.push({ type, itemId, amount });
}

async function submitCreatePresent() {
  savingPresent.value = true;
  try {
    await $fetch('/api/admin/server/rewards/presents/create', {
      method: 'POST',
      body: newPresent.value,
    });
    await refreshPresents();
    showCreatePresentModal.value = false;
  } catch (err: any) {
    alert(err?.data?.statusMessage || 'Failed to create present');
  } finally {
    savingPresent.value = false;
  }
}

async function deletePresent(presentId: string) {
  if (!confirm(`Delete present "${presentId}"?`)) return;
  try {
    await $fetch('/api/admin/server/rewards/presents/delete', {
      method: 'POST',
      body: { presentId },
    });
    await refreshPresents();
  } catch (err: any) {
    alert(err?.data?.statusMessage || 'Failed to delete present');
  }
}

// Modal 2: Create Redeem Code
const showCreateRedeemModal = ref(false);
const savingRedeem = ref(false);
const newRedeem = ref({
  code: '',
  type: 1, // 1x per player
  items: [
    { itemId: 'ticket', type: 'ticket', amount: 100 },
  ],
});

function openCreateRedeemModal() {
  newRedeem.value = {
    code: '',
    type: 1,
    items: [{ itemId: 'ticket', type: 'ticket', amount: 100 }],
  };
  showCreateRedeemModal.value = true;
}

function generateRandomCode() {
  const chars = 'abcdefghjklmnpqrstuvwxyz23456789';
  newRedeem.value.code = Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function addPresetRedeemItem(type: string, itemId: string, amount: number) {
  newRedeem.value.items.push({ type, itemId, amount });
}

async function submitCreateRedeem() {
  const trimmed = newRedeem.value.code.trim().toLowerCase();
  if (trimmed && trimmed.length < 10) {
    alert('Redeem code must be at least 10 characters (in-game client requirement).');
    return;
  }
  newRedeem.value.code = trimmed;
  savingRedeem.value = true;
  try {
    await $fetch('/api/admin/server/rewards/redeem/create', {
      method: 'POST',
      body: newRedeem.value,
    });
    await refreshRedeem();
    showCreateRedeemModal.value = false;
  } catch (err: any) {
    alert(err?.data?.statusMessage || 'Failed to create redeem code');
  } finally {
    savingRedeem.value = false;
  }
}

async function deleteRedeem(code: string) {
  if (!confirm(`Delete redeem code "${code}"?`)) return;
  try {
    await $fetch('/api/admin/server/rewards/redeem/delete', {
      method: 'POST',
      body: { code },
    });
    await refreshRedeem();
  } catch (err: any) {
    alert(err?.data?.statusMessage || 'Failed to delete redeem code');
  }
}

function copyToClipboard(code: string) {
  navigator.clipboard.writeText(code);
  alert(`Code "${code}" copied to clipboard!`);
}

// Modal 3: View Claims
const viewingClaimsCode = ref<any>(null);
function viewClaims(rc: any) {
  viewingClaimsCode.value = rc;
}

// Auto-polling when tab visible and no modal open
const isSyncing = ref(false);
let pollTimer: ReturnType<typeof setInterval> | null = null;

async function syncAllNow() {
  if (isSyncing.value) return;
  isSyncing.value = true;
  try {
    await Promise.all([refreshPresents(), refreshRedeem()]);
  } finally {
    isSyncing.value = false;
  }
}

onMounted(() => {
  pollTimer = setInterval(() => {
    if (
      document.hidden ||
      showCreatePresentModal.value ||
      showCreateRedeemModal.value
    ) {
      return;
    }
    syncAllNow();
  }, 12000);
});

onUnmounted(() => {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
});
</script>

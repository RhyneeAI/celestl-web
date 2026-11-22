<template>
  <div class="space-y-6">
    <!-- Header & Statistics -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-black font-brand tracking-tight text-[#fffafa] flex items-center gap-3">
          <span>Players Directory</span>
          <span class="text-xs px-2.5 py-0.5 rounded-full bg-[#f768dd]/15 text-[#f768dd] border border-[#f768dd]/30 font-mono">
            {{ players.length }} registered
          </span>
        </h1>
        <p class="text-xs sm:text-[13px] text-[#9a99a8] mt-1">
          Monitor live player potential, recent plays, clear records, and manage accounts.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="() => refresh()"
          :disabled="pending"
          class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1e203a] hover:bg-[#3f3c68] text-xs font-bold text-[#fffafa] border border-white/5 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
        >
          <!-- FontAwesome fa-arrows-rotate -->
          <svg class="size-3.5 shrink-0" :class="{ 'animate-spin': pending }" viewBox="0 0 512 512" fill="currentColor">
            <path d="M105.1 202.6c7.7-21.8 20.2-42.3 37.8-59.8c62.5-62.5 163.8-62.5 226.3 0L386.3 160 352 160c-17.7 0-32 14.3-32 32s14.3 32 32 32l112 0c17.7 0 32-14.3 32-32l0-112c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 35.2L414.4 68C336.3-10.1 209.7-10.1 131.6 68C109.6 90 93.9 115.8 84.4 143.5c-5.8 16.7 3.1 34.8 19.8 40.6s34.8-3.1 40.6-19.8zM406.9 309.4c-7.7 21.8-20.2 42.3-37.8 59.8c-62.5 62.5-163.8 62.5-226.3 0l-17.1-17.1L160 352c17.7 0 32-14.3 32-32s-14.3-32-32-32l-112 0c-17.7 0-32 14.3-32 32l0 112c0 17.7 14.3 32 32 32s32-14.3 32-32l0-35.2L65.6 444C143.7 522.1 270.3 522.1 348.4 444c22-22 37.7-47.8 47.2-75.5c5.8-16.7-3.1-34.8-19.8-40.6s-34.8 3.1-40.6 19.8z"/>
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
        <span class="text-[11px] text-[#9a99a8]">Registered accounts</span>
      </div>

      <div class="rounded-2xl bg-[#1a1d32] p-4 border border-[#16133e] shadow-lg">
        <span class="text-[11px] font-bold text-[#acff82] uppercase tracking-wider">Active Players</span>
        <div class="text-2xl font-black font-brand text-[#acff82] mt-1">{{ activeCount }}</div>
        <span class="text-[11px] text-[#9a99a8]">In good standing</span>
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
          <!-- FontAwesome fa-magnifying-glass -->
          <svg class="size-3.5" viewBox="0 0 512 512" fill="currentColor">
            <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0s208 93.1 208 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/>
          </svg>
        </span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by player name, user code, or UID…"
          class="w-full pl-9 pr-8 py-2 bg-[#0c0c22] border border-[#16133e] focus:border-[#f768dd] rounded-xl text-xs sm:text-[13px] text-[#fffafa] placeholder-[#6f6e80] focus:outline-none transition-colors"
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

      <!-- Controls: Status Pills & Sorter & PerPage -->
      <div class="flex flex-wrap items-center gap-2">
        <!-- Status Tabs -->
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
              'px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer',
              filterStatus === st.key ? 'bg-[#1e203a] text-white shadow-sm' : 'text-[#9a99a8] hover:text-white'
            ]"
          >
            {{ st.label }}
          </button>
        </div>

        <!-- Sorter Dropdown (Default UUID) -->
        <select
          v-model="sortBy"
          class="bg-[#0c0c22] text-[#fffafa] border border-[#16133e] text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-[#f768dd] cursor-pointer"
        >
          <option value="uuid_asc">Sort by UUID (Lowest First)</option>
          <option value="uuid_desc">Sort by UUID (Highest First)</option>
          <option value="rank">Sort by World Rank</option>
          <option value="ptt_desc">Sort by Potential (Highest First)</option>
          <option value="ptt_asc">Sort by Potential (Lowest First)</option>
          <option value="name_asc">Sort by Name (A → Z)</option>
          <option value="name_desc">Sort by Name (Z → A)</option>
        </select>

        <!-- Per Page Dropdown -->
        <select
          v-model.number="perPage"
          class="bg-[#0c0c22] text-[#9a99a8] border border-[#16133e] text-xs font-bold rounded-xl px-2.5 py-2 focus:outline-none focus:border-[#f768dd] cursor-pointer"
        >
          <option :value="6">6 / page</option>
          <option :value="10">10 / page</option>
          <option :value="20">20 / page</option>
          <option :value="1000">All</option>
        </select>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="paginatedPlayers.length === 0" class="rounded-3xl bg-[#1a1d32] p-12 text-center border border-[#16133e]">
      <div class="h-10 w-10 mx-auto mb-3 rounded-2xl bg-[#0c0c22] border border-[#16133e] flex items-center justify-center text-[#6f6e80]">
        <!-- FontAwesome fa-users-slash -->
        <svg class="size-5" viewBox="0 0 640 512" fill="currentColor">
          <path d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L516.4 378.1c32.7-3.4 60.5-17.7 77.9-40.3c15.2-19.8 21.7-44.5 21.7-70.1c0-26.6-8.2-51.2-24.9-70.9C572.7 175.1 547.2 160 512 160c-11.7 0-23 1.7-33.7 4.9C464.9 133.5 425.2 112 376 112c-35.3 0-66.8 11.1-91.8 30.1L38.8 5.1zM288 384c0-22.1 4.5-43.1 12.7-62.1L244 277.2C226.7 285.8 211.3 298.1 200 312.8c-17.5 22.8-24 50.8-24 79.2l0 24c0 17.7 14.3 32 32 32l160 0c6.7 0 13-2.1 18.2-5.7l-94.7-74.2c-2.3 0-4.6 0-3.5 0l0 15.7zm-96-224a96 96 0 1 1 192 0 96 96 0 1 1 -192 0z"/>
        </svg>
      </div>
      <h3 class="text-base font-bold text-[#fffafa] font-brand">No players found</h3>
      <p class="text-xs text-[#9a99a8] mt-1">Try adjusting your search query or filter status.</p>
    </div>

    <!-- Players Cards: 2-2-2 Grid Layout -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
      <div
        v-for="p in paginatedPlayers"
        :key="p.userId"
        class="rounded-3xl bg-[#14162e]/90 border border-[#2b2d4f] hover:border-[#f768dd]/40 transition-all duration-300 shadow-xl overflow-hidden flex flex-col justify-between p-5 space-y-4 relative group"
      >
        <!-- Background subtle accent light -->
        <div class="absolute -top-12 -right-12 w-32 h-32 bg-[#f768dd]/5 rounded-full blur-2xl pointer-events-none group-hover:bg-[#f768dd]/10 transition-colors" />

        <!-- 1. HEADER SECTION -->
        <div class="flex items-start justify-between gap-3 relative z-10">
          <div class="flex items-center gap-4 min-w-0">
            <!-- Arcaea Diamond Character Profile Avatar (Rhombus Frame) -->
            <div class="relative size-16 shrink-0 flex items-center justify-center">
              <div class="h-11 w-11 rotate-45 overflow-hidden rounded-xl bg-gradient-to-tr from-[#79287a] to-[#03a8e6] p-0.5 shadow-md shrink-0 border border-white/20 transition-transform group-hover:scale-105 duration-300">
                <div class="relative h-full w-full overflow-hidden rounded-lg bg-slate-900">
                  <img
                    :src="p.characterAvatar || '/storage/characters/0_icon.png'"
                    :alt="p.name"
                    class="absolute inset-[-25%] h-[150%] w-[150%] max-w-none -rotate-45 object-cover select-none"
                    @error="onImgFallback($event, p.name)"
                  />
                </div>
              </div>
            </div>

            <!-- Player Name + UUID + User Code -->
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-[17px] font-black font-brand text-[#fffafa] truncate leading-tight tracking-tight">
                  {{ p.name }}
                </h3>
                <small class="text-xs font-mono font-normal text-[#9a99a8]">#{{ p.userId }}</small>
                <span
                  :class="[
                    'px-2 py-0.5 rounded-full text-[9.5px] font-mono font-bold tracking-wider border',
                    p.isBanned
                      ? 'bg-[#e14763]/20 text-[#e14763] border-[#e14763]/40'
                      : 'bg-[#acff82]/20 text-[#acff82] border-[#acff82]/40'
                  ]"
                >
                  {{ p.isBanned ? 'BANNED' : 'ACTIVE' }}
                </span>
              </div>

              <div class="flex items-center gap-2 mt-1 text-xs text-[#9a99a8] font-mono">
                <span>Code: <b class="text-[#f768dd]">{{ p.userCode }}</b></span>
                <span>•</span>
                <span>{{ p.memories.toLocaleString() }} MEM</span>
              </div>
            </div>
          </div>

          <!-- Header Right: Potential & World Ranking -->
          <div class="flex flex-col items-end shrink-0 gap-1.5">
            <!-- Potential Badge -->
            <div class="flex items-center gap-1.5">
              <span class="text-[9px] font-bold uppercase text-[#6f6e80] tracking-wider">Potential</span>
              <div
                class="px-2.5 py-0.5 rounded-xl bg-[#0c0c22] border font-mono font-black text-xs sm:text-[13px] shadow-inner"
                :class="getPttBadgeClass(p.ratingPtt)"
              >
                {{ p.ratingPttFormatted }}
              </div>
            </div>

            <!-- World Ranking Badge -->
            <div class="flex items-center gap-1">
              <span
                v-if="p.worldRank"
                :class="[
                  'px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono border flex items-center gap-1.5 shadow-sm',
                  p.worldRank === 1 ? 'bg-[#ffd76a]/20 text-[#ffd76a] border-[#ffd76a]/50' :
                  p.worldRank === 2 ? 'bg-slate-300/20 text-slate-200 border-slate-300/40' :
                  p.worldRank === 3 ? 'bg-amber-600/20 text-amber-300 border-amber-600/40' :
                  'bg-[#1e203a] text-[#9a99a8] border-white/10'
                ]"
              >
                <!-- FontAwesome Crown/Trophy Icons -->
                <svg v-if="p.worldRank === 1" class="size-3 text-[#ffd76a]" viewBox="0 0 576 512" fill="currentColor">
                  <path d="M309 106c11.4-7 19-19.7 19-34c0-22.1-17.9-40-40-40s-40 17.9-40 40c0 14.3 7.6 27 19 34L209.7 220.6c-9.1 18.2-32.9 23.3-48.6 10.5L62.7 150.3c7.5-6.7 12.3-16.5 12.3-27.3c0-20.4-16.6-37-37-37S1 102.6 1 123c0 12.5 6.2 23.6 15.7 30.2L70.9 407.9c4.2 20.6 22.2 35.1 43.1 35.1l348 0c20.9 0 38.9-14.5 43.1-35.1l54.2-254.7c9.5-6.6 15.7-17.7 15.7-30.2c0-20.4-16.6-37-37-37s-37 16.6-37 37c0 10.8 4.8 20.6 12.3 27.3L414.9 231.1c-15.7 12.8-39.5 7.7-48.6-10.5L309 106z"/>
                </svg>
                <svg v-else-if="p.worldRank <= 3" class="size-3 text-amber-300" viewBox="0 0 576 512" fill="currentColor">
                  <path d="M400 0L176 0c-26.5 0-48.1 21.8-47.1 48.2c.2 5.3 .9 10.6 2.1 15.8L144 128l-48 0c-53 0-96 43-96 96c0 39.4 23.7 73.3 57.6 87.8c21.4 64.9 76.5 113.8 144.4 125.1c7 1.2 14.2 1.9 21.6 2.1L224 448l-32 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l192 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-32 0 0-9.1c7.4-.2 14.6-.9 21.6-2.1c67.9-11.3 123-60.2 144.4-125.1C552.3 297.3 576 263.4 576 224c0-53-43-96-96-96l-48 0 13-64c1.2-5.2 1.9-10.5 2.1-15.8C448.1 21.8 426.5 0 400 0zM96 224c0-17.7 14.3-32 32-32l32 0 0 64-32 0c-17.7 0-32-14.3-32-32zm384 32l-32 0 0-64 32 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"/>
                </svg>
                <span v-else class="text-[#6f6e80]">#</span>
                <span>Rank #{{ p.worldRank }}</span>
              </span>
              <span v-else class="text-[10px] font-mono text-[#6f6e80]">
                Unranked
              </span>
            </div>
          </div>
        </div>

        <!-- 2. BODY SECTION -->
        <div class="space-y-3 relative z-10">
          <!-- Recent Play Strip -->
          <div class="rounded-2xl bg-[#0c0c22]/80 border border-white/5 p-2.5 sm:p-3 flex items-center justify-between gap-2 text-xs">
            <div class="flex items-center gap-2 min-w-0">
              <span class="text-[10px] font-bold uppercase text-[#6f6e80] tracking-wider shrink-0">Recent:</span>
              <template v-if="p.recentPlay">
                <span
                  :class="[
                    'px-1.5 py-0.5 rounded text-[9.5px] font-black font-mono tracking-tight shrink-0',
                    getGradeBadgeClass(p.recentPlay.grade)
                  ]"
                >
                  {{ p.recentPlay.grade }}
                </span>
                <span class="font-bold text-[#fffafa] truncate" :title="p.recentPlay.songTitle">
                  {{ p.recentPlay.songTitle }}
                </span>
                <span class="text-[10px] font-mono font-bold text-[#f768dd] shrink-0">
                  [{{ p.recentPlay.difficultyCode }}]
                </span>
              </template>
              <template v-else>
                <span class="text-[#6f6e80] italic text-xs">No play records yet</span>
              </template>
            </div>

            <!-- Recent Play Date (xxDayAgo) -->
            <div v-if="p.recentPlay" class="text-[11px] font-mono font-medium text-[#9a99a8] shrink-0">
              {{ p.recentPlay.relativeTime }}
            </div>
          </div>

          <!-- Clear Stats Section with 6-difficulty tabs & fadeout->fadein transition -->
          <div class="rounded-2xl bg-[#0c0c22]/60 border border-white/5 p-3 space-y-2">
            <!-- Difficulty Selector Tabs -->
            <div class="flex items-center justify-between gap-1 flex-wrap border-b border-white/5 pb-2">
              <span class="text-[9.5px] font-bold uppercase text-[#6f6e80] tracking-wider">
                Clear Breakdown
              </span>

              <!-- 6 Filter Tabs: ALL, PST, PRS, FTR, BYD, ETR -->
              <div class="flex items-center gap-1">
                <button
                  v-for="d in [
                    { key: 'all', label: 'ALL' },
                    { key: 'pst', label: 'PST' },
                    { key: 'prs', label: 'PRS' },
                    { key: 'ftr', label: 'FTR' },
                    { key: 'byd', label: 'BYD' },
                    { key: 'etr', label: 'ETR' },
                  ]"
                  :key="d.key"
                  type="button"
                  @click="setCardDiff(p.userId, d.key)"
                  :class="[
                    'px-1.5 py-0.5 text-[9.5px] font-mono font-bold rounded-md transition-all cursor-pointer',
                    getCardDiff(p.userId) === d.key
                      ? getDiffActiveClass(d.key)
                      : 'text-[#6f6e80] hover:text-[#9a99a8]'
                  ]"
                >
                  {{ d.label }}
                </button>
              </div>
            </div>

            <!-- Numbers with smooth fadeout -> fadein transition -->
            <Transition name="stat-fade" mode="out-in">
              <div
                :key="getCardDiff(p.userId)"
                class="grid grid-cols-3 gap-2 text-center py-1"
              >
                <!-- Clear (C) -->
                <div class="rounded-xl bg-[#14162e]/50 p-2 border border-white/5">
                  <div class="text-[9px] uppercase font-bold text-[#60a5fa] tracking-wider">
                    Clear (C)
                  </div>
                  <div class="text-base sm:text-lg font-black font-mono text-[#60a5fa] mt-0.5">
                    {{ getDiffStats(p, getCardDiff(p.userId)).clear }}
                  </div>
                </div>

                <!-- Full Recall (FR) -->
                <div class="rounded-xl bg-[#14162e]/50 p-2 border border-white/5">
                  <div class="text-[9px] uppercase font-bold text-[#acff82] tracking-wider">
                    Full Recall (FR)
                  </div>
                  <div class="text-base sm:text-lg font-black font-mono text-[#acff82] mt-0.5">
                    {{ getDiffStats(p, getCardDiff(p.userId)).fr }}
                  </div>
                </div>

                <!-- Pure Memory (PM) -->
                <div class="rounded-xl bg-[#14162e]/50 p-2 border border-white/5">
                  <div class="text-[9px] uppercase font-bold text-[#ffd76a] tracking-wider">
                    Pure Memory (PM)
                  </div>
                  <div class="text-base sm:text-lg font-black font-mono text-[#ffd76a] mt-0.5">
                    {{ getDiffStats(p, getCardDiff(p.userId)).pm }}
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </div>

        <!-- 3. FOOTER ACTIONS TOOLBAR -->
        <div class="pt-3 border-t border-[#2b2d4f] flex flex-wrap items-center justify-between gap-1.5 relative z-10">
          <!-- Left Actions -->
          <div class="flex items-center gap-1.5 flex-wrap">
            <!-- Direct to B50 / Top Recent Plays -->
            <NuxtLink
              :to="`/admin/player-scores?userId=${p.userId}`"
              class="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-[#9b51e0]/20 to-[#03a8e6]/20 hover:from-[#9b51e0]/40 hover:to-[#03a8e6]/40 text-xs font-bold text-[#f768dd] border border-[#f768dd]/40 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              title="View Top Recent Plays & B50 recalculation"
            >
              <!-- FontAwesome Chart Column -->
              <svg class="size-3 shrink-0" viewBox="0 0 448 512" fill="currentColor">
                <path d="M160 80c0-26.5 21.5-48 48-48l32 0c26.5 0 48 21.5 48 48l0 352c0 26.5-21.5 48-48 48l-32 0c-26.5 0-48-21.5-48-48l0-352zM0 272c0-26.5 21.5-48 48-48l32 0c26.5 0 48 21.5 48 48l0 160c0 26.5-21.5 48-48 48l-32 0c-26.5 0-48-21.5-48-48L0 272zM368 96l32 0c26.5 0 48 21.5 48 48l0 288c0 26.5-21.5 48-48 48l-32 0c-26.5 0-48-21.5-48-48l0-288c0-26.5 21.5-48 48-48z"/>
              </svg>
              <span>B50 Scores</span>
            </NuxtLink>

            <!-- Adjust Memories -->
            <button
              type="button"
              @click="openMemoriesModal(p)"
              class="px-2.5 py-1.5 rounded-xl bg-[#1e203a] hover:bg-[#3f3c68] text-xs font-bold text-[#60a5fa] border border-[#3f3c68]/40 transition-colors cursor-pointer shadow-sm"
              title="Adjust memories balance"
            >
              Memories
            </button>

            <!-- Reset Password -->
            <button
              type="button"
              @click="openPasswordModal(p)"
              class="px-2.5 py-1.5 rounded-xl bg-[#1e203a] hover:bg-[#3f3c68] text-xs font-bold text-[#fffafa] border border-[#3f3c68]/40 transition-colors cursor-pointer shadow-sm"
              title="Change player password"
            >
              Password
            </button>

            <!-- Ban / Unban -->
            <button
              type="button"
              @click="toggleBan(p)"
              :class="[
                'px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer shadow-sm',
                p.isBanned
                  ? 'bg-[#acff82]/15 text-[#acff82] border-[#acff82]/30 hover:bg-[#acff82]/25'
                  : 'bg-[#e14763]/15 text-[#e14763] border-[#e14763]/30 hover:bg-[#e14763]/25'
              ]"
            >
              {{ p.isBanned ? 'Unban' : 'Ban' }}
            </button>
          </div>

          <!-- Right Action: Activity Log Modal Trigger -->
          <div>
            <button
              type="button"
              @click="openActivityModal(p)"
              class="px-2.5 py-1.5 rounded-xl bg-[#1e203a] hover:bg-[#3f3c68] text-xs font-bold text-[#ffd76a] border border-[#ffd76a]/30 hover:border-[#ffd76a]/60 transition-all cursor-pointer shadow-sm"
              title="View login sessions and activity history"
            >
              Activity Log
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination Controls -->
    <div v-if="totalPages > 1" class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
      <div class="text-xs text-[#9a99a8] font-mono">
        Showing {{ (currentPage - 1) * perPage + 1 }}–{{ Math.min(currentPage * perPage, filteredPlayers.length) }} of {{ filteredPlayers.length }} players
      </div>

      <div class="flex items-center gap-1.5">
        <button
          type="button"
          :disabled="currentPage === 1"
          @click="currentPage--"
          class="px-3 py-1.5 rounded-xl bg-[#1a1d32] hover:bg-[#1e203a] text-xs font-bold text-[#fffafa] border border-[#16133e] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
        >
          Previous
        </button>

        <button
          v-for="page in totalPages"
          :key="page"
          type="button"
          @click="currentPage = page"
          :class="[
            'px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border',
            currentPage === page
              ? 'bg-[#f768dd] text-[#0c0c22] border-[#f768dd] shadow-sm'
              : 'bg-[#1a1d32] text-[#9a99a8] hover:text-white border-[#16133e]'
          ]"
        >
          {{ page }}
        </button>

        <button
          type="button"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
          class="px-3 py-1.5 rounded-xl bg-[#1a1d32] hover:bg-[#1e203a] text-xs font-bold text-[#fffafa] border border-[#16133e] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>

    <!-- MODAL 1: Activity Log Modal -->
    <Teleport to="body">
      <div
        v-if="activityPlayer"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-md animate-in fade-in duration-150"
        @click.self="activityPlayer = null"
      >
        <div class="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-[#14162e] border border-[#2b2d4f] text-[#fffafa] shadow-2xl overflow-hidden">
          <!-- Header -->
          <div class="p-4 sm:p-5 border-b border-[#2b2d4f] flex items-center justify-between gap-3 bg-[#1a1d32]/80 shrink-0">
            <div class="flex items-center gap-3 min-w-0">
              <!-- Arcaea Diamond Character Profile Avatar -->
              <div class="relative size-13 shrink-0 flex items-center justify-center">
                <div class="h-9 w-9 rotate-45 overflow-hidden rounded-lg bg-gradient-to-tr from-[#79287a] to-[#03a8e6] p-0.5 shadow-md shrink-0 border border-white/20">
                  <div class="relative h-full w-full overflow-hidden rounded-md bg-slate-900">
                    <img
                      :src="activityPlayer.characterAvatar || '/storage/characters/0_icon.png'"
                      :alt="activityPlayer.name"
                      class="absolute inset-[-25%] h-[150%] w-[150%] max-w-none -rotate-45 object-cover select-none"
                    />
                  </div>
                </div>
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <h3 class="text-base font-bold font-brand text-white truncate">{{ activityPlayer.name }}</h3>
                  <span class="text-xs font-mono text-[#9a99a8]">#{{ activityPlayer.userId }}</span>
                </div>
                <div class="text-xs text-[#9a99a8] font-mono">
                  Code: <b class="text-[#f768dd]">{{ activityPlayer.userCode }}</b> • Joined: {{ activityPlayer.joinDate }}
                </div>
              </div>
            </div>

            <button
              type="button"
              @click="activityPlayer = null"
              class="text-[#9a99a8] hover:text-white p-1 rounded-lg"
            >
              ✕
            </button>
          </div>

          <!-- Tab Bar -->
          <div class="px-4 pt-3 flex items-center gap-2 border-b border-[#2b2d4f] shrink-0 bg-[#0c0c22]/40">
            <button
              type="button"
              @click="activityTab = 'logins'"
              :class="[
                'px-3 py-1.5 text-xs font-bold border-b-2 transition-all cursor-pointer',
                activityTab === 'logins'
                  ? 'border-[#f768dd] text-[#f768dd]'
                  : 'border-transparent text-[#9a99a8] hover:text-white'
              ]"
            >
              Login Sessions ({{ activityData?.logins?.length ?? 0 }})
            </button>
            <button
              type="button"
              @click="activityTab = 'plays'"
              :class="[
                'px-3 py-1.5 text-xs font-bold border-b-2 transition-all cursor-pointer',
                activityTab === 'plays'
                  ? 'border-[#f768dd] text-[#f768dd]'
                  : 'border-transparent text-[#9a99a8] hover:text-white'
              ]"
            >
              Recent Plays ({{ activityData?.recentPlays?.length ?? 0 }})
            </button>
          </div>

          <!-- Body Content -->
          <div class="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            <div v-if="loadingActivity" class="py-12 text-center text-xs text-[#9a99a8] space-y-2">
              <!-- FontAwesome fa-circle-notch -->
              <svg class="size-6 mx-auto animate-spin text-[#f768dd]" viewBox="0 0 512 512" fill="currentColor">
                <path d="M222.7 32.1c5 16.9-4.6 34.8-21.5 39.8C121.8 95.6 64 169.1 64 256c0 106 86 192 192 192s192-86 192-192c0-86.9-57.8-160.4-137.1-184.1c-16.9-5-26.6-22.9-21.5-39.8s22.9-26.6 39.8-21.5C434.9 42.1 512 139.6 512 256c0 141.4-114.6 256-256 256S0 397.4 0 256C0 139.6 77.1 42.1 182.9 10.6c16.9-5 34.8 4.6 39.8 21.5z"/>
              </svg>
              <div>Loading activity history from VPS…</div>
            </div>

            <!-- Tab 1: Logins -->
            <div v-else-if="activityTab === 'logins'" class="space-y-2">
              <div v-if="!activityData?.logins?.length" class="text-center py-8 text-xs text-[#6f6e80]">
                No recorded login sessions for this player.
              </div>
              <div
                v-for="(log, idx) in activityData?.logins"
                :key="idx"
                class="rounded-2xl bg-[#0c0c22] p-3 border border-white/5 flex items-center justify-between text-xs"
              >
                <div class="space-y-0.5">
                  <div class="font-mono font-bold text-[#fffafa] flex items-center gap-2">
                    <span>IP: {{ log.ipAddress }}</span>
                    <span v-if="idx === 0" class="text-[9.5px] px-1.5 py-0.2 rounded bg-[#acff82]/20 text-[#acff82] font-mono">
                      Current
                    </span>
                  </div>
                  <div class="text-[11px] text-[#6f6e80] font-mono">
                    Device: {{ log.device }}
                  </div>
                </div>

                <div class="text-right font-mono text-[11px] text-[#9a99a8]">
                  <div>{{ log.relativeTime }}</div>
                  <div class="text-[10px] text-[#6f6e80]">{{ log.formattedTime }}</div>
                </div>
              </div>
            </div>

            <!-- Tab 2: Plays -->
            <div v-else-if="activityTab === 'plays'" class="space-y-2">
              <div v-if="!activityData?.recentPlays?.length" class="text-center py-8 text-xs text-[#6f6e80]">
                No recent play records recorded yet.
              </div>
              <div
                v-for="(pl, idx) in activityData?.recentPlays"
                :key="idx"
                class="rounded-2xl bg-[#0c0c22] p-3 border border-white/5 flex items-center justify-between text-xs gap-3"
              >
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <span
                      :class="[
                        'px-1.5 py-0.5 rounded text-[9.5px] font-black font-mono shrink-0',
                        getGradeBadgeClass(pl.grade)
                      ]"
                    >
                      {{ pl.grade }}
                    </span>
                    <b class="text-white truncate font-brand">{{ pl.songTitle }}</b>
                    <span class="text-[10px] font-mono font-bold text-[#f768dd] shrink-0">
                      [{{ pl.difficultyCode }}]
                    </span>
                  </div>
                  <div class="text-[11px] text-[#9a99a8] font-mono mt-0.5 flex items-center gap-2">
                    <span>Score: <b class="text-[#ffd76a]">{{ pl.scoreFormatted }}</b></span>
                    <span>•</span>
                    <span :style="{ color: pl.lamp?.color || '#9a99a8' }">{{ pl.lamp?.label || 'Clear' }}</span>
                  </div>
                </div>

                <div class="text-right font-mono text-[11px] text-[#9a99a8] shrink-0">
                  <div>{{ pl.relativeTime }}</div>
                  <div class="text-[10px] text-[#6f6e80]">{{ pl.formattedTime }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- MODAL 2: Adjust Memories -->
    <Teleport to="body">
      <div
        v-if="editingMemoriesPlayer"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-150"
        @click.self="editingMemoriesPlayer = null"
      >
        <div class="w-full max-w-sm rounded-3xl bg-[#1a1d32] p-6 border border-[#16133e] text-[#fffafa] shadow-2xl space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-bold font-brand">Adjust Memories</h3>
            <button type="button" @click="editingMemoriesPlayer = null" class="text-[#9a99a8] hover:text-white">✕</button>
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
            <button type="button" @click="editingMemoriesPlayer = null" class="px-4 py-2 rounded-xl bg-[#1e203a] text-xs font-bold text-[#9a99a8] hover:text-white">
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

    <!-- MODAL 3: Reset Password -->
    <Teleport to="body">
      <div
        v-if="resettingPasswordPlayer"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-150"
        @click.self="resettingPasswordPlayer = null"
      >
        <div class="w-full max-w-sm rounded-3xl bg-[#1a1d32] p-6 border border-[#16133e] text-[#fffafa] shadow-2xl space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-bold font-brand">Reset Password</h3>
            <button type="button" @click="resettingPasswordPlayer = null" class="text-[#9a99a8] hover:text-white">✕</button>
          </div>

          <p class="text-xs text-[#9a99a8]">
            Set new password for <b class="text-white">{{ resettingPasswordPlayer.name }}</b>.
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
            <button type="button" @click="resettingPasswordPlayer = null" class="px-4 py-2 rounded-xl bg-[#1e203a] text-xs font-bold text-[#9a99a8] hover:text-white">
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
});

useHead({
  title: 'Admin · Players Directory',
});

export interface ClearStats {
  clear: number;
  fr: number;
  pm: number;
  total: number;
}

export interface PlayerClearsMap {
  all: ClearStats;
  pst: ClearStats;
  prs: ClearStats;
  ftr: ClearStats;
  byd: ClearStats;
  etr: ClearStats;
}

export interface PlayerItem {
  userId: number;
  name: string;
  userCode: string;
  email: string;
  ratingPtt: number;
  ratingPttFormatted: string;
  worldRank: number | null;
  memories: number;
  characterId: number;
  characterAvatar: string;
  isBanned: boolean;
  banReason: string | null;
  joinDate: string;
  joinTimestamp: number;
  playCount: number;
  clears: PlayerClearsMap;
  recentPlay: {
    songId: string;
    songTitle: string;
    difficulty: number;
    difficultyCode: string;
    score: number;
    scoreFormatted: string;
    grade: string;
    clearType: number;
    timePlayed: number;
    relativeTime: string;
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
// Default sort by UUID!
const sortBy = ref<'uuid_asc' | 'uuid_desc' | 'rank' | 'ptt_desc' | 'ptt_asc' | 'name_asc' | 'name_desc'>('uuid_asc');

// Pagination
const currentPage = ref(1);
const perPage = ref(6); // Default 6 (3 rows of 2 cards)

// Per-card selected difficulty tab (default 'all')
const cardDiffMap = ref<Record<number, string>>({});

function getCardDiff(userId: number): string {
  return cardDiffMap.value[userId] || 'all';
}

function setCardDiff(userId: number, diffKey: string) {
  cardDiffMap.value = { ...cardDiffMap.value, [userId]: diffKey };
}

function getDiffStats(player: PlayerItem, diffKey: string): ClearStats {
  const c = player.clears || {
    all: { clear: 0, fr: 0, pm: 0, total: 0 },
    pst: { clear: 0, fr: 0, pm: 0, total: 0 },
    prs: { clear: 0, fr: 0, pm: 0, total: 0 },
    ftr: { clear: 0, fr: 0, pm: 0, total: 0 },
    byd: { clear: 0, fr: 0, pm: 0, total: 0 },
    etr: { clear: 0, fr: 0, pm: 0, total: 0 },
  };
  return (c as any)[diffKey] || c.all;
}

function getDiffActiveClass(diffKey: string): string {
  switch (diffKey) {
    case 'pst': return 'bg-[#03a8e6]/20 text-[#03a8e6] border border-[#03a8e6]/40';
    case 'prs': return 'bg-[#acff82]/20 text-[#acff82] border border-[#acff82]/40';
    case 'ftr': return 'bg-[#9b51e0]/20 text-[#9b51e0] border border-[#9b51e0]/40';
    case 'byd': return 'bg-[#e14763]/20 text-[#e14763] border border-[#e14763]/40';
    case 'etr': return 'bg-[#f768dd]/20 text-[#f768dd] border border-[#f768dd]/40';
    default: return 'bg-[#fffafa]/15 text-white border border-white/20';
  }
}

function getGradeBadgeClass(grade: string): string {
  switch (grade) {
    case 'PM': return 'bg-[#ffd76a]/20 text-[#ffd76a] border border-[#ffd76a]/50';
    case 'EX+':
    case 'EX': return 'bg-[#f768dd]/20 text-[#f768dd] border border-[#f768dd]/40';
    case 'AA':
    case 'A': return 'bg-[#60a5fa]/20 text-[#60a5fa] border border-[#60a5fa]/40';
    default: return 'bg-[#9a99a8]/20 text-[#9a99a8] border border-[#9a99a8]/30';
  }
}

function getPttBadgeClass(ptt: number): string {
  if (ptt >= 11) return 'border-[#ffd76a]/60 text-[#ffd76a] shadow-[0_0_12px_rgba(255,215,106,0.25)]';
  if (ptt >= 10) return 'border-[#f768dd]/50 text-[#f768dd]';
  if (ptt >= 7) return 'border-[#60a5fa]/40 text-[#60a5fa]';
  return 'border-[#3f3c68]/40 text-[#ffd76a]';
}

function onImgFallback(e: Event, name: string) {
  const target = e.target as HTMLImageElement;
  target.src = '/storage/characters/0_icon.png';
}

const filteredPlayers = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  let list = players.value.filter((p) => {
    if (filterStatus.value === 'active' && p.isBanned) return false;
    if (filterStatus.value === 'banned' && !p.isBanned) return false;

    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.userCode.includes(q) ||
      String(p.userId).includes(q) ||
      (p.email && p.email.toLowerCase().includes(q))
    );
  });

  // Sorting
  list = [...list].sort((a, b) => {
    switch (sortBy.value) {
      case 'uuid_asc': return a.userId - b.userId;
      case 'uuid_desc': return b.userId - a.userId;
      case 'rank': {
        const rA = a.worldRank ?? 999999;
        const rB = b.worldRank ?? 999999;
        return rA - rB;
      }
      case 'ptt_desc': return b.ratingPtt - a.ratingPtt;
      case 'ptt_asc': return a.ratingPtt - b.ratingPtt;
      case 'name_asc': return a.name.localeCompare(b.name);
      case 'name_desc': return b.name.localeCompare(a.name);
      default: return a.userId - b.userId;
    }
  });

  return list;
});

const totalPages = computed(() => Math.ceil(filteredPlayers.value.length / perPage.value) || 1);

const paginatedPlayers = computed(() => {
  const start = (currentPage.value - 1) * perPage.value;
  return filteredPlayers.value.slice(start, start + perPage.value);
});

// Modal 1: Activity Log
const activityPlayer = ref<PlayerItem | null>(null);
const activityTab = ref<'logins' | 'plays'>('logins');
const loadingActivity = ref(false);
const activityData = ref<{
  user: any;
  logins: Array<{
    loginTime: number;
    formattedTime: string;
    relativeTime: string;
    ipAddress: string;
    device: string;
  }>;
  recentPlays: Array<{
    songId: string;
    songTitle: string;
    difficulty: number;
    difficultyCode: string;
    score: number;
    scoreFormatted: string;
    grade: string;
    clearType: number;
    lamp: { label: string; short: string; color: string };
    rating: number;
    timePlayed: number;
    formattedTime: string;
    relativeTime: string;
  }>;
} | null>(null);

async function openActivityModal(p: PlayerItem) {
  activityPlayer.value = p;
  activityTab.value = 'logins';
  activityData.value = null;
  loadingActivity.value = true;
  try {
    const res = await $fetch<any>('/api/admin/server/players/activity', {
      query: { userId: p.userId },
    });
    activityData.value = res;
  } catch (err: any) {
    alert(err?.data?.statusMessage || 'Failed to fetch player activity history');
  } finally {
    loadingActivity.value = false;
  }
}

// Modal 2: Adjust Memories
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

// Modal 3: Reset Password
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
</script>

<style scoped>
/* Smooth fadeout -> fadein animation for clear statistics */
.stat-fade-enter-active,
.stat-fade-leave-active {
  transition: opacity 0.18s cubic-bezier(0.4, 0, 0.2, 1), transform 0.18s cubic-bezier(0.4, 0, 0.2, 1);
}
.stat-fade-enter-from {
  opacity: 0;
  transform: translateY(3px);
}
.stat-fade-leave-to {
  opacity: 0;
  transform: translateY(-3px);
}
</style>

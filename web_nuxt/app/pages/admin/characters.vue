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
          High-resolution partner portraits, skill mechanics, stat progression curves (Frag, Step, Overdrive), and live user equip assignments.
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
          <svg class="size-3.5" :class="{ 'animate-spin': pending }" viewBox="0 0 512 512" fill="currentColor">
            <path d="M105.1 202.6c7.7-21.8 20.2-42.3 37.8-59.8c62.5-62.5 163.8-62.5 226.3 0L386.3 160 352 160c-17.7 0-32 14.3-32 32s14.3 32 32 32l112 0c17.7 0 32-14.3 32-32l0-112c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 35.2L414.4 68.6C336.3-.5 209.7-.5 131.6 68.6C107.5 92.7 89.9 121.5 78.8 153.2c-5.9 16.7 2.8 34.9 19.5 40.8s34.9-2.8 40.8-19.5zM406.9 309.4c-7.7 21.8-20.2 42.3-37.8 59.8c-62.5 62.5-163.8 62.5-226.3 0l-17.1-17.1L160 352c17.7 0 32-14.3 32-32s-14.3-32-32-32L48 288c-17.7 0-32 14.3-32 32l0 112c0 17.7 14.3 32 32 32s32-14.3 32-32l0-35.2L97.6 443.4c78.1 69.1 204.7 69.1 282.8 0c24.1-24.1 41.7-52.9 52.8-84.6c5.9-16.7-2.8-34.9-19.5-40.8s-34.9 2.8-40.8 19.5z"/>
          </svg>
          <span>Refresh</span>
        </button>
      </div>
    </div>

    <!-- Quick Stats Bar -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      <div class="rounded-2xl bg-[#1a1d32] p-4 border border-[#16133e] shadow-md relative overflow-hidden">
        <div class="absolute -right-2 -bottom-2 text-white/5 font-black text-6xl select-none font-mono">104</div>
        <div class="text-[11px] font-bold text-[#6f6e80] uppercase tracking-wider">Total Partners</div>
        <div class="text-2xl font-black font-brand text-white mt-1">{{ charactersData?.total ?? 0 }}</div>
        <div class="text-[10px] text-[#9a99a8] mt-1">Registered in Arcaea roster</div>
      </div>

      <div class="rounded-2xl bg-[#1a1d32] p-4 border border-[#16133e] shadow-md relative overflow-hidden">
        <div class="absolute -right-2 -bottom-2 text-[#f768dd]/5 font-black text-6xl select-none font-mono">28</div>
        <div class="text-[11px] font-bold text-[#6f6e80] uppercase tracking-wider">Awakened / Uncapped</div>
        <div class="text-2xl font-black font-brand text-[#f768dd] mt-1">{{ charactersData?.uncappedCount ?? 0 }}</div>
        <div class="text-[10px] text-[#f768dd]/80 mt-1">Has Awakened artwork</div>
      </div>

      <div class="rounded-2xl bg-[#1a1d32] p-4 border border-[#16133e] shadow-md relative overflow-hidden">
        <div class="absolute -right-2 -bottom-2 text-[#acff82]/5 font-black text-6xl select-none font-mono">USE</div>
        <div class="text-[11px] font-bold text-[#6f6e80] uppercase tracking-wider">Currently In Use</div>
        <div class="text-2xl font-black font-brand text-[#acff82] mt-1">{{ inUseCount }}</div>
        <div class="text-[10px] text-[#acff82]/80 mt-1">Equipped by active players</div>
      </div>

      <div class="rounded-2xl bg-[#1a1d32] p-4 border border-[#16133e] shadow-md relative overflow-hidden">
        <div class="absolute -right-2 -bottom-2 text-[#ffd76a]/5 font-black text-6xl select-none font-mono">30</div>
        <div class="text-[11px] font-bold text-[#6f6e80] uppercase tracking-wider">Max Cap Lv.30</div>
        <div class="text-2xl font-black font-brand text-[#ffd76a] mt-1">{{ lv30Count }}</div>
        <div class="text-[10px] text-[#ffd76a]/80 mt-1">Max tier level ceiling</div>
      </div>
    </div>

    <!-- Filter & Search Toolbar -->
    <div class="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 rounded-2xl bg-[#1a1d32] p-3 border border-[#16133e] shadow-lg">
      <div class="relative flex-1">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search partner name, ID, skill, or alias (e.g. Hikari, Tairitsu, Grievous, 0, 10, 光)…"
          class="w-full rounded-xl bg-[#0c0c22] px-4 py-2.5 text-xs text-white placeholder-[#6f6e80] border border-[#16133e] focus:border-[#f768dd] focus:outline-none transition-colors"
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
        <div class="flex items-center rounded-xl bg-[#0c0c22] p-1 border border-[#16133e] overflow-x-auto max-w-full">
          <button
            v-for="f in filterTabs"
            :key="f.id"
            @click="activeFilter = f.id"
            :class="[
              'px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer shrink-0',
              activeFilter === f.id
                ? 'bg-[#1a1d32] text-white shadow-sm'
                : 'text-[#6f6e80] hover:text-[#9a99a8]'
            ]"
          >
            {{ f.label }}
          </button>
        </div>

        <!-- Master Awakened View Switcher -->
        <button
          type="button"
          @click="toggleGlobalAwakenedView"
          :class="[
            'px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm',
            globalAwakenedView
              ? 'bg-[#f768dd]/20 text-[#f768dd] border-[#f768dd]/40 hover:bg-[#f768dd]/30'
              : 'bg-[#0c0c22] text-[#9a99a8] border-[#16133e] hover:text-white'
          ]"
          title="Toggle between Normal and Awakened portrait previews for all partners"
        >
          <!-- FontAwesome fa-wand-magic-sparkles -->
          <svg class="size-3.5 text-[#f768dd]" viewBox="0 0 512 512" fill="currentColor">
            <path d="M432.8 52.5C419 38.7 396.6 38.7 382.8 52.5L344 91.3l-28.7-28.7c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9L310.1 125l-71.5 71.5c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0L344 158.9l28.7 28.7c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9L377.9 125l38.8-38.8c13.8-13.8 13.8-36.2 0-50zM224 288c-17.7 0-32 14.3-32 32l0 128c0 17.7 14.3 32 32 32s32-14.3 32-32l0-128c0-17.7-14.3-32-32-32zm-64-64c0-17.7-14.3-32-32-32L32 192c-17.7 0-32 14.3-32 32s14.3 32 32 32l96 0c17.7 0 32-14.3 32-32zM320 384c-17.7 0-32 14.3-32 32s14.3 32 32 32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0z"/>
          </svg>
          <span>{{ globalAwakenedView ? 'Awakened Art' : 'Normal Art' }}</span>
        </button>

        <!-- Sort Select -->
        <select
          v-model="sortBy"
          class="rounded-xl bg-[#0c0c22] px-3 py-2 text-xs text-white border border-[#16133e] focus:border-[#f768dd] focus:outline-none cursor-pointer"
        >
          <option value="id_asc">Sort: ID (Asc)</option>
          <option value="id_desc">Sort: ID (Desc)</option>
          <option value="users_desc">Sort: Most Users</option>
          <option value="name">Sort: Name (A-Z)</option>
          <option value="step_desc">Sort: Highest Step (Lv.20)</option>
          <option value="frag_desc">Sort: Highest Frag (Lv.20)</option>
          <option value="over_desc">Sort: Highest Overdrive (Lv.20)</option>
        </select>
      </div>
    </div>

    <!-- Loading / Empty States -->
    <div v-if="pending" class="py-20 text-center text-xs text-[#9a99a8]">
      <svg class="h-7 w-7 animate-spin mx-auto text-[#f768dd] mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      <span>Loading partner portraits and skill database…</span>
    </div>

    <div v-else-if="filteredCharacters.length === 0" class="py-16 text-center text-xs text-[#9a99a8] rounded-2xl bg-[#1a1d32] border border-[#16133e]">
      No partner character matching "{{ searchQuery }}".
    </div>

    <!-- Character Cards Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      <div
        v-for="c in filteredCharacters"
        :key="c.characterId"
        class="rounded-3xl bg-[#151728]/95 border border-[#1f223f] shadow-2xl p-4 flex flex-col justify-between space-y-4 hover:border-[#f768dd]/50 hover:shadow-[0_8px_30px_rgba(247,104,221,0.12)] transition-all group"
      >
        <!-- Hero Portrait Section -->
        <div class="relative h-64 sm:h-72 w-full overflow-hidden rounded-2xl bg-gradient-to-b from-[#090a16] via-[#101222] to-[#151728] border border-white/5 flex items-center justify-center group-hover:border-white/10 transition-colors">
          <!-- Background Ambient Glow based on charType -->
          <div
            class="absolute inset-0 opacity-20 pointer-events-none blur-2xl"
            :style="{
              background: `radial-gradient(circle at 50% 35%, ${c.charTypeInfo.color} 0%, transparent 70%)`
            }"
          ></div>

          <!-- Character Portrait Art -->
          <img
            :src="getCardPortrait(c)"
            :alt="c.displayName"
            class="absolute inset-0 size-full object-contain object-top drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)] transition-transform duration-500 group-hover:scale-105 select-none"
            loading="lazy"
            @error="onPortraitError($event, c)"
          />

          <!-- Bottom Fade Gradient for text readability -->
          <div class="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#151728] via-[#151728]/80 to-transparent pointer-events-none"></div>

          <!-- Top-Left Badges (ID & Character Type) -->
          <div class="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
            <span class="px-2 py-0.5 rounded-lg font-mono font-black text-[11px] bg-[#0c0c22]/85 text-white/90 border border-white/10 shadow-md">
              #{{ c.characterId }}
            </span>
            <span
              class="px-2 py-0.5 rounded-lg font-bold text-[10px] uppercase tracking-wider shadow-md border"
              :class="[c.charTypeInfo.bgClass, c.charTypeInfo.textClass, c.charTypeInfo.borderClass]"
            >
              {{ c.charTypeInfo.label }}
            </span>
          </div>

          <!-- Top-Right Badges (Active Users & Max Level) -->
          <div class="absolute top-3 right-3 flex flex-col items-end gap-1.5 z-10">
            <span
              v-if="c.activeUsersCount > 0"
              class="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow-md"
              title="Equipped by players on server"
            >
              <!-- FontAwesome fa-users -->
              <svg class="size-3 text-emerald-400" viewBox="0 0 640 512" fill="currentColor">
                <path d="M144 0a80 80 0 1 1 0 160A80 80 0 1 1 144 0zM512 0a80 80 0 1 1 0 160A80 80 0 1 1 512 0zM0 298.7C0 239.8 47.8 192 106.7 192l74.7 0c58.9 0 106.7 47.8 106.7 106.7L288 320l0 128c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 298.7zM352 320l0-21.3c0-58.9 47.8-106.7 106.7-106.7l74.7 0c58.9 0 106.7 47.8 106.7 106.7l0 21.3 0 128c0 35.3-28.7 64-64 64l-160 0c-35.3 0-64-28.7-64-64l0-128z"/>
              </svg>
              <span>{{ c.activeUsersCount }} in use</span>
            </span>

            <span
              class="px-2 py-0.5 rounded-lg text-[10px] font-mono font-black shadow-md border"
              :class="c.maxLevel >= 30 ? 'bg-[#ffd76a]/20 text-[#ffd76a] border-[#ffd76a]/40' : 'bg-[#0c0c22]/85 text-[#9a99a8] border-white/10'"
            >
              Lv.{{ c.maxLevel }}
            </span>
          </div>

          <!-- Bottom Action Buttons inside Portrait (Artwork Lightbox & Normal/Awakened Toggle) -->
          <div class="absolute bottom-2.5 inset-x-3 flex items-center justify-between z-10">
            <!-- Normal / Awakened Toggle Button -->
            <button
              v-if="c.hasUncappedPortrait"
              type="button"
              @click.stop="toggleCharacterPortrait(c.characterId)"
              class="px-2.5 py-1 rounded-xl text-[10px] font-bold font-mono shadow-lg border cursor-pointer transition-transform hover:scale-105 flex items-center gap-1.5 backdrop-blur-md"
              :class="[
                isShowingAwakened(c.characterId)
                  ? 'bg-[#f768dd] text-[#0c0c22] border-[#f768dd] font-black'
                  : 'bg-[#0c0c22]/85 text-[#9a99a8] border-white/15 hover:text-white'
              ]"
              :title="isShowingAwakened(c.characterId) ? 'Click to show Normal Portrait' : 'Click to show Awakened Portrait'"
            >
              <!-- FontAwesome fa-wand-magic-sparkles -->
              <svg class="size-3" viewBox="0 0 512 512" fill="currentColor">
                <path d="M432.8 52.5C419 38.7 396.6 38.7 382.8 52.5L344 91.3l-28.7-28.7c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9L310.1 125l-71.5 71.5c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0L344 158.9l28.7 28.7c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9L377.9 125l38.8-38.8c13.8-13.8 13.8-36.2 0-50zM224 288c-17.7 0-32 14.3-32 32l0 128c0 17.7 14.3 32 32 32s32-14.3 32-32l0-128c0-17.7-14.3-32-32-32zm-64-64c0-17.7-14.3-32-32-32L32 192c-17.7 0-32 14.3-32 32s14.3 32 32 32l96 0c17.7 0 32-14.3 32-32zM320 384c-17.7 0-32 14.3-32 32s14.3 32 32 32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0z"/>
              </svg>
              <span>{{ isShowingAwakened(c.characterId) ? 'AWAKENED' : 'NORMAL' }}</span>
            </button>
            <div v-else></div>

            <!-- Full Artwork Lightbox View Button -->
            <button
              type="button"
              @click.stop="openArtworkModal(c)"
              class="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-[#0c0c22]/85 hover:bg-[#3f3c68] text-white border border-white/15 backdrop-blur-md shadow-lg transition-colors cursor-pointer flex items-center gap-1.5"
              title="View full-resolution uncropped artwork"
            >
              <!-- FontAwesome fa-eye -->
              <svg class="size-3.5 text-[#f768dd]" viewBox="0 0 576 512" fill="currentColor">
                <path d="M288 80c-65.2 0-118.8 29.6-159.9 67.7C89.6 183.5 63 226 49.4 256c13.6 30 40.2 72.5 78.6 108.3C169.2 402.4 222.8 432 288 432s118.8-29.6 159.9-67.7C486.4 328.5 513 286 526.6 256c-13.6-30-40.2-72.5-78.6-108.3C406.8 109.6 353.2 80 288 80zM95.4 112.6C142.5 68.8 207.2 32 288 32s145.5 36.8 192.6 80.6c46.8 43.5 78.1 95.4 93 131.1c3.3 7.9 3.3 16.7 0 24.6c-14.9 35.7-46.2 87.7-93 131.1C433.5 443.2 368.8 480 288 480s-145.5-36.8-192.6-80.6C48.6 356 17.3 304 2.5 268.3c-3.3-7.9-3.3-16.7 0-24.6C17.3 208 48.6 156 95.4 112.6zM288 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z"/>
              </svg>
              <span>Full Art</span>
            </button>
          </div>
        </div>

        <!-- Identity Section (Name & Subtitle) -->
        <div class="px-1">
          <div class="flex items-start justify-between gap-2">
            <div>
              <h2 class="text-base font-black font-brand text-white truncate" :title="c.displayName">
                {{ c.displayName }}
              </h2>
              <p class="text-[11px] text-[#7d7c8d] font-mono truncate" :title="c.name">
                {{ c.name }}
                <span v-if="c.searchStrings && c.searchStrings.length > 0" class="text-[#656379] ml-1">
                  · {{ c.searchStrings[0] }}
                </span>
              </p>
            </div>

            <!-- Awakened State Pill -->
            <span
              v-if="c.isUncapped"
              class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#f768dd]/15 text-[#f768dd] border border-[#f768dd]/30 shrink-0"
            >
              Awakened
            </span>
            <span
              v-else
              class="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/5 text-[#6f6e80] border border-white/5 shrink-0"
            >
              Standard
            </span>
          </div>

          <!-- Uncap Cores Required (if available) -->
          <div v-if="c.uncapCores && c.uncapCores.length > 0" class="flex flex-wrap items-center gap-1.5 mt-2">
            <span class="text-[10px] text-[#6f6e80] font-medium">Uncap Cores:</span>
            <span
              v-for="core in c.uncapCores"
              :key="core.coreType"
              class="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-950/40 text-purple-300 border border-purple-500/30"
            >
              {{ core.amount }}× {{ core.coreName }}
            </span>
          </div>
        </div>

        <!-- Skill Details Section -->
        <div class="rounded-2xl bg-[#0c0c22]/80 p-3 border border-[#1a1d3a] space-y-2">
          <!-- Primary Skill -->
          <div>
            <div class="flex items-center justify-between gap-1">
              <div class="flex items-center gap-1.5">
                <!-- FontAwesome fa-bolt -->
                <svg class="size-3 text-[#38bdf8]" viewBox="0 0 384 512" fill="currentColor">
                  <path d="M0 256L240 0l-48 192h192L144 512l48-192H0z"/>
                </svg>
                <span class="text-xs font-bold text-white truncate" :title="c.skillInfo.name">
                  {{ c.skillInfo.name }}
                </span>
              </div>
              <span
                class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-[#9a99a8] border border-white/5 shrink-0"
              >
                {{ c.skillUnlockLevel > 0 ? `Lv.${c.skillUnlockLevel}` : 'Default' }}
              </span>
            </div>
            <p class="text-[11px] text-[#a09fad] leading-relaxed mt-1">
              {{ c.skillInfo.description }}
            </p>
          </div>

          <!-- Awakened Skill (if available) -->
          <div v-if="c.skillIdUncap && c.skillIdUncap !== 'none'" class="pt-2 border-t border-white/5">
            <div class="flex items-center justify-between gap-1">
              <div class="flex items-center gap-1.5">
                <!-- FontAwesome fa-star -->
                <svg class="size-3 text-[#f768dd]" viewBox="0 0 576 512" fill="currentColor">
                  <path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.6 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"/>
                </svg>
                <span class="text-xs font-bold text-[#f768dd] truncate" :title="c.skillUncapInfo.name">
                  {{ c.skillUncapInfo.name }}
                </span>
              </div>
              <span class="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#f768dd]/15 text-[#f768dd] border border-[#f768dd]/30 shrink-0">
                Awakened Skill
              </span>
            </div>
            <p class="text-[11px] text-[#c9a7d8] leading-relaxed mt-1">
              {{ c.skillUncapInfo.description }}
            </p>
          </div>
        </div>

        <!-- Stats Matrix (Frag, Step, Overdrive) -->
        <div class="rounded-2xl bg-[#0c0c22]/80 p-3 border border-[#1a1d3a] space-y-1.5 text-xs font-mono">
          <div class="grid grid-cols-4 text-[10px] text-[#6f6e80] font-bold text-center pb-1 border-b border-white/5">
            <span class="text-left">Stat</span>
            <span>Lv.1</span>
            <span>Lv.20</span>
            <span :class="c.maxLevel >= 30 ? 'text-[#ffd76a] font-black' : 'text-[#6f6e80]'">Lv.30</span>
          </div>

          <!-- Frag Row -->
          <div class="grid grid-cols-4 items-center text-center">
            <div class="flex items-center gap-1 text-left">
              <span class="size-2 rounded-full bg-[#38bdf8]"></span>
              <span class="text-[#38bdf8] font-bold text-[11px]">Frag</span>
            </div>
            <span class="text-[#9a99a8]">{{ c.stats.frag1 }}</span>
            <span class="text-white font-semibold">{{ c.stats.frag20 }}</span>
            <span :class="c.maxLevel >= 30 ? 'text-[#ffd76a] font-bold' : 'text-[#6f6e80]'">{{ c.stats.frag30 }}</span>
          </div>

          <!-- Step (Prog) Row -->
          <div class="grid grid-cols-4 items-center text-center">
            <div class="flex items-center gap-1 text-left">
              <span class="size-2 rounded-full bg-[#f472b6]"></span>
              <span class="text-[#f472b6] font-bold text-[11px]">Step</span>
            </div>
            <span class="text-[#9a99a8]">{{ c.stats.prog1 }}</span>
            <span class="text-white font-semibold">{{ c.stats.prog20 }}</span>
            <span :class="c.maxLevel >= 30 ? 'text-[#ffd76a] font-bold' : 'text-[#6f6e80]'">{{ c.stats.prog30 }}</span>
          </div>

          <!-- Overdrive Row -->
          <div class="grid grid-cols-4 items-center text-center">
            <div class="flex items-center gap-1 text-left">
              <span class="size-2 rounded-full bg-[#4ade80]"></span>
              <span class="text-[#4ade80] font-bold text-[11px]">Over</span>
            </div>
            <span class="text-[#9a99a8]">{{ c.stats.overdrive1 }}</span>
            <span class="text-white font-semibold">{{ c.stats.overdrive20 }}</span>
            <span :class="c.maxLevel >= 30 ? 'text-[#ffd76a] font-bold' : 'text-[#6f6e80]'">{{ c.stats.overdrive30 }}</span>
          </div>
        </div>

        <!-- Footer / Action Buttons -->
        <div class="pt-2 border-t border-[#1a1d3a] flex items-center gap-2">
          <button
            type="button"
            @click="openEditModal(c)"
            class="flex-1 py-2 px-3 rounded-xl bg-[#1e203a] hover:bg-[#3f3c68] text-xs font-bold text-white transition-colors cursor-pointer border border-white/5 flex items-center justify-center gap-1.5 shadow-sm"
          >
            <!-- FontAwesome fa-pen-to-square -->
            <svg class="size-3.5 text-[#f768dd]" viewBox="0 0 512 512" fill="currentColor">
              <path d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160L0 416c0 53 43 96 96 96l256 0c53 0 96-43 96-96l0-96c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 96c0 17.7-14.3 32-32 32L96 448c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L96 64z"/>
            </svg>
            <span>Edit Stats & Cap</span>
          </button>

          <button
            type="button"
            @click="openArtworkModal(c)"
            class="p-2 rounded-xl bg-[#1e203a] hover:bg-[#3f3c68] text-white transition-colors cursor-pointer border border-white/5 shadow-sm"
            title="Open high-res portrait artwork"
          >
            <!-- FontAwesome fa-expand -->
            <svg class="size-3.5 text-[#9a99a8]" viewBox="0 0 448 512" fill="currentColor">
              <path d="M32 32C14.3 32 0 46.3 0 64l0 96c0 17.7 14.3 32 32 32s32-14.3 32-32l0-64 64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 32zM64 352c-17.7 0-32 14.3-32 32l0 96c0 17.7 14.3 32 32 32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-64 0 0-64c0-17.7-14.3-32-32-32zM320 32c-17.7 0-32 14.3-32 32s14.3 32 32 32l64 0 0 64c0 17.7 14.3 32 32 32s32-14.3 32-32l0-96c0-17.7-14.3-32-32-32l-96 0zM448 384c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 64-64 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l96 0c17.7 0 32-14.3 32-32l0-96z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Character Modal -->
    <div
      v-if="editingCharacter"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto"
      @click.self="editingCharacter = null"
    >
      <div class="w-full max-w-lg rounded-3xl bg-[#1a1d32] border border-[#202447] p-6 shadow-2xl space-y-5 my-8">
        <!-- Modal Header -->
        <div class="flex items-start justify-between border-b border-[#202447] pb-4">
          <div class="flex items-center gap-3">
            <!-- Arcaea Diamond Character Profile Avatar -->
            <div class="relative size-14 shrink-0 flex items-center justify-center">
              <div class="h-10 w-10 rotate-45 overflow-hidden rounded-xl bg-gradient-to-tr from-[#79287a] to-[#03a8e6] p-0.5 shadow-md shrink-0 border border-white/20">
                <div class="relative h-full w-full overflow-hidden rounded-lg bg-slate-900">
                  <img
                    :src="editingCharacter.iconNormal"
                    :alt="editingCharacter.name"
                    class="absolute inset-[-25%] h-[150%] w-[150%] max-w-none -rotate-45 object-cover select-none"
                  />
                </div>
              </div>
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
            class="rounded-lg p-1.5 text-[#6f6e80] hover:text-white transition-colors cursor-pointer"
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
                class="w-full rounded-xl bg-[#0c0c22] px-3 py-2 text-xs text-white border border-[#202447] focus:border-[#f768dd] focus:outline-none cursor-pointer"
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
          <div class="space-y-3 pt-2 border-t border-[#202447]">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-white uppercase tracking-wider">Stat Progression Multipliers</span>
              <button
                type="button"
                @click="resetStatsToDefaults"
                class="text-[11px] text-[#6f6e80] hover:text-[#9a99a8] underline cursor-pointer"
              >
                Revert Changes
              </button>
            </div>

            <!-- Level 1 Stats -->
            <div class="rounded-xl bg-[#0c0c22] p-3 border border-[#202447] space-y-2">
              <span class="text-[11px] font-bold text-[#6f6e80] uppercase tracking-wider">Level 1 Stats</span>
              <div class="grid grid-cols-3 gap-2">
                <div>
                  <label class="block text-[10px] font-mono text-[#38bdf8]">Frag</label>
                  <input
                    v-model.number="editForm.frag1"
                    type="number"
                    step="0.1"
                    class="w-full rounded-lg bg-[#1a1d32] px-2 py-1.5 text-xs text-white font-mono border border-white/5 focus:border-[#38bdf8] focus:outline-none"
                  />
                </div>
                <div>
                  <label class="block text-[10px] font-mono text-[#f472b6]">Step (Prog)</label>
                  <input
                    v-model.number="editForm.prog1"
                    type="number"
                    step="0.1"
                    class="w-full rounded-lg bg-[#1a1d32] px-2 py-1.5 text-xs text-white font-mono border border-white/5 focus:border-[#f472b6] focus:outline-none"
                  />
                </div>
                <div>
                  <label class="block text-[10px] font-mono text-[#4ade80]">Overdrive</label>
                  <input
                    v-model.number="editForm.overdrive1"
                    type="number"
                    step="0.1"
                    class="w-full rounded-lg bg-[#1a1d32] px-2 py-1.5 text-xs text-white font-mono border border-white/5 focus:border-[#4ade80] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <!-- Level 20 Stats -->
            <div class="rounded-xl bg-[#0c0c22] p-3 border border-[#202447] space-y-2">
              <span class="text-[11px] font-bold text-[#6f6e80] uppercase tracking-wider">Level 20 Stats</span>
              <div class="grid grid-cols-3 gap-2">
                <div>
                  <label class="block text-[10px] font-mono text-[#38bdf8]">Frag</label>
                  <input
                    v-model.number="editForm.frag20"
                    type="number"
                    step="0.1"
                    class="w-full rounded-lg bg-[#1a1d32] px-2 py-1.5 text-xs text-white font-mono border border-white/5 focus:border-[#38bdf8] focus:outline-none"
                  />
                </div>
                <div>
                  <label class="block text-[10px] font-mono text-[#f472b6]">Step (Prog)</label>
                  <input
                    v-model.number="editForm.prog20"
                    type="number"
                    step="0.1"
                    class="w-full rounded-lg bg-[#1a1d32] px-2 py-1.5 text-xs text-white font-mono border border-white/5 focus:border-[#f472b6] focus:outline-none"
                  />
                </div>
                <div>
                  <label class="block text-[10px] font-mono text-[#4ade80]">Overdrive</label>
                  <input
                    v-model.number="editForm.overdrive20"
                    type="number"
                    step="0.1"
                    class="w-full rounded-lg bg-[#1a1d32] px-2 py-1.5 text-xs text-white font-mono border border-white/5 focus:border-[#4ade80] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <!-- Level 30 Stats -->
            <div class="rounded-xl bg-[#0c0c22] p-3 border border-[#202447] space-y-2">
              <span class="text-[11px] font-bold text-[#ffd76a] uppercase tracking-wider">Level 30 Stats</span>
              <div class="grid grid-cols-3 gap-2">
                <div>
                  <label class="block text-[10px] font-mono text-[#38bdf8]">Frag</label>
                  <input
                    v-model.number="editForm.frag30"
                    type="number"
                    step="0.1"
                    class="w-full rounded-lg bg-[#1a1d32] px-2 py-1.5 text-xs text-white font-mono border border-white/5 focus:border-[#38bdf8] focus:outline-none"
                  />
                </div>
                <div>
                  <label class="block text-[10px] font-mono text-[#f472b6]">Step (Prog)</label>
                  <input
                    v-model.number="editForm.prog30"
                    type="number"
                    step="0.1"
                    class="w-full rounded-lg bg-[#1a1d32] px-2 py-1.5 text-xs text-white font-mono border border-white/5 focus:border-[#f472b6] focus:outline-none"
                  />
                </div>
                <div>
                  <label class="block text-[10px] font-mono text-[#4ade80]">Overdrive</label>
                  <input
                    v-model.number="editForm.overdrive30"
                    type="number"
                    step="0.1"
                    class="w-full rounded-lg bg-[#1a1d32] px-2 py-1.5 text-xs text-white font-mono border border-white/5 focus:border-[#4ade80] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Notification Feedback -->
          <div v-if="saveMessage" class="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-400 font-semibold">
            {{ saveMessage }}
          </div>
          <div v-if="saveError" class="p-3 rounded-xl bg-[#e14763]/15 border border-[#e14763]/30 text-xs text-[#e14763] font-semibold">
            {{ saveError }}
          </div>

          <!-- Modal Actions -->
          <div class="flex items-center justify-end gap-2 pt-4 border-t border-[#202447]">
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

    <!-- High-Resolution Artwork Lightbox Modal -->
    <div
      v-if="viewingArtwork"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto"
      @click.self="viewingArtwork = null"
    >
      <div class="w-full max-w-4xl rounded-3xl bg-[#131525] border border-[#24274c] p-6 shadow-2xl space-y-4 my-8">
        <!-- Modal Header -->
        <div class="flex items-center justify-between border-b border-[#24274c] pb-3">
          <div>
            <h3 class="text-lg font-black font-brand text-white flex items-center gap-2">
              <span>{{ viewingArtwork.displayName }}</span>
              <span class="text-xs font-mono text-[#9a99a8]">#{{ viewingArtwork.characterId }}</span>
            </h3>
            <p class="text-xs text-[#6f6e80] font-mono">
              High-Resolution Partner Portrait
            </p>
          </div>

          <div class="flex items-center gap-2">
            <!-- Normal / Awakened / Alt Artwork Switcher in Lightbox -->
            <div class="flex items-center rounded-xl bg-[#0c0c22] p-1 border border-[#24274c]">
              <button
                type="button"
                @click="lightboxVariant = 'normal'"
                :class="[
                  'px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer',
                  lightboxVariant === 'normal' ? 'bg-[#1a1d32] text-white shadow-sm' : 'text-[#6f6e80] hover:text-[#9a99a8]'
                ]"
              >
                Normal
              </button>
              <button
                v-if="viewingArtwork.hasUncappedPortrait"
                type="button"
                @click="lightboxVariant = 'uncapped'"
                :class="[
                  'px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer',
                  lightboxVariant === 'uncapped' ? 'bg-[#f768dd]/20 text-[#f768dd] shadow-sm' : 'text-[#6f6e80] hover:text-[#9a99a8]'
                ]"
              >
                Awakened
              </button>
              <button
                v-if="viewingArtwork.hasAltPortrait"
                type="button"
                @click="lightboxVariant = 'alt'"
                :class="[
                  'px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer',
                  lightboxVariant === 'alt' ? 'bg-amber-500/20 text-amber-300 shadow-sm' : 'text-[#6f6e80] hover:text-[#9a99a8]'
                ]"
              >
                Alt
              </button>
            </div>

            <button
              @click="viewingArtwork = null"
              class="rounded-xl p-2 text-[#6f6e80] hover:text-white transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Artwork Display Canvas -->
        <div class="relative w-full h-[65vh] rounded-2xl bg-gradient-to-b from-[#080914] via-[#0f1122] to-[#080914] border border-white/5 flex items-center justify-center overflow-hidden">
          <img
            :src="getLightboxImageSrc(viewingArtwork)"
            :alt="viewingArtwork.displayName"
            class="size-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)] select-none"
          />
        </div>

        <!-- Modal Footer Summary -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-[#9a99a8]">
          <div class="flex items-center gap-4">
            <div>
              <span class="text-[#6f6e80]">Skill:</span>
              <span class="text-white font-medium ml-1">{{ viewingArtwork.skillInfo.name }}</span>
            </div>
            <div>
              <span class="text-[#6f6e80]">Max Cap:</span>
              <span class="text-[#ffd76a] font-mono font-bold ml-1">Lv.{{ viewingArtwork.maxLevel }}</span>
            </div>
          </div>

          <a
            :href="getLightboxImageSrc(viewingArtwork)"
            target="_blank"
            class="text-[#f768dd] hover:underline flex items-center gap-1.5 font-semibold"
          >
            <span>Open Original Image</span>
            <!-- FontAwesome fa-arrow-up-right-from-square -->
            <svg class="size-3 text-[#f768dd]" viewBox="0 0 512 512" fill="currentColor">
              <path d="M320 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l82.7 0L201.4 265.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L448 109.3l0 82.7c0 17.7 14.3 32 32 32s32-14.3 32-32l0-160c0-17.7-14.3-32-32-32L320 0zM80 32C35.8 32 0 67.8 0 112L0 432c0 44.2 35.8 80 80 80l320 0c44.2 0 80-35.8 80-80l0-112c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 112c0 8.8-7.2 16-16 16L80 448c-8.8 0-16-7.2-16-16L64 112c0-8.8 7.2-16 16-16l112 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L80 32z"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import type { AdminCharacterItem } from '~~/server/api/admin/server/characters/index.get';

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
});

const { data: charactersData, pending, refresh } = await useFetch<{
  success: boolean;
  total: number;
  uncappedCount: number;
  dataSource?: 'vps' | 'local';
  characters: AdminCharacterItem[];
}>('/api/admin/server/characters');

const searchQuery = ref('');
const activeFilter = ref<'all' | 'conflict' | 'light' | 'special' | 'uncapped'>('all');
const sortBy = ref<'id_asc' | 'id_desc' | 'users_desc' | 'name' | 'step_desc' | 'frag_desc' | 'over_desc'>('id_asc');

const filterTabs = [
  { id: 'all' as const, label: 'All Partners' },
  { id: 'uncapped' as const, label: 'Awakened' },
  { id: 'conflict' as const, label: 'Conflict' },
  { id: 'light' as const, label: 'Light' },
  { id: 'special' as const, label: 'Special' },
];

// Per-character preview toggle: characterId -> boolean (true = show awakened)
const characterAwakenedToggle = reactive<Record<number, boolean>>({});

// Global preview switch
const globalAwakenedView = ref(false);

function toggleGlobalAwakenedView() {
  globalAwakenedView.value = !globalAwakenedView.value;
  if (!charactersData.value?.characters) return;
  for (const c of charactersData.value.characters) {
    if (c.hasUncappedPortrait) {
      characterAwakenedToggle[c.characterId] = globalAwakenedView.value;
    }
  }
}

function isShowingAwakened(characterId: number): boolean {
  if (typeof characterAwakenedToggle[characterId] === 'boolean') {
    return characterAwakenedToggle[characterId];
  }
  return globalAwakenedView.value;
}

function toggleCharacterPortrait(characterId: number) {
  characterAwakenedToggle[characterId] = !isShowingAwakened(characterId);
}

function getCardPortrait(c: AdminCharacterItem): string {
  if (isShowingAwakened(c.characterId) && c.hasUncappedPortrait) {
    return c.portraitUncapped;
  }
  return c.portraitNormal;
}

function onPortraitError(e: Event, char: AdminCharacterItem) {
  const target = e.target as HTMLImageElement;
  // If portrait fails to load, fallback to icon
  if (!target.src.endsWith('_icon.png')) {
    target.src = char.iconNormal;
  }
}

// Lightbox viewing modal
const viewingArtwork = ref<AdminCharacterItem | null>(null);
const lightboxVariant = ref<'normal' | 'uncapped' | 'alt'>('normal');

function openArtworkModal(c: AdminCharacterItem) {
  viewingArtwork.value = c;
  lightboxVariant.value = isShowingAwakened(c.characterId) && c.hasUncappedPortrait ? 'uncapped' : 'normal';
}

function getLightboxImageSrc(c: AdminCharacterItem): string {
  if (lightboxVariant.value === 'uncapped' && c.hasUncappedPortrait) {
    return c.portraitUncapped;
  }
  if (lightboxVariant.value === 'alt' && c.hasAltPortrait) {
    return c.portraitAlt;
  }
  return c.portraitNormal;
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
    list = list.filter(c => {
      const matchName = c.displayName.toLowerCase().includes(q) || c.name.toLowerCase().includes(q);
      const matchId = String(c.characterId) === q || `#${c.characterId}` === q;
      const matchSkill = c.skillId.toLowerCase().includes(q) || c.skillInfo.name.toLowerCase().includes(q);
      const matchAliases = (c.searchStrings || []).some(s => s.toLowerCase().includes(q));
      return matchName || matchId || matchSkill || matchAliases;
    });
  }

  // Active filter tab
  if (activeFilter.value === 'uncapped') {
    list = list.filter(c => c.isUncapped);
  } else if (activeFilter.value === 'conflict') {
    list = list.filter(c => c.charType === 0);
  } else if (activeFilter.value === 'light') {
    list = list.filter(c => c.charType === 1);
  } else if (activeFilter.value === 'special') {
    list = list.filter(c => c.charType >= 2);
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
  } else if (sortBy.value === 'step_desc') {
    list.sort((a, b) => b.stats.prog20 - a.stats.prog20 || a.characterId - b.characterId);
  } else if (sortBy.value === 'frag_desc') {
    list.sort((a, b) => b.stats.frag20 - a.stats.frag20 || a.characterId - b.characterId);
  } else if (sortBy.value === 'over_desc') {
    list.sort((a, b) => b.stats.overdrive20 - a.stats.overdrive20 || a.characterId - b.characterId);
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
    const res = await $fetch<{ success: boolean; message: string; vpsSynced?: boolean }>('/api/admin/server/characters/update', {
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

<template>
  <div>
    <!-- Split Layout: Master (Song List) & Detail (Song & Chart Info) -->
    <div class="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(400px,1fr)]">
      <!-- Left Panel: Custom songs List -->
      <section class="overflow-hidden rounded-2xl bg-[#1a1d32] border border-[#16133e] shadow-xl">
        <!-- Panel Head -->
        <div class="flex flex-wrap items-center gap-2.5 px-4 py-[13px] border-b border-[#16133e]">
          <h2 class="text-[15px] font-semibold text-[#fffafa] font-brand">Custom charts</h2>
          <span class="rounded-full bg-[#1e203a] px-[9px] py-[2px] text-[11px] font-bold text-[#9a99a8]">
            {{ filtered.length }} / {{ songs.length }} songs
          </span>
          <span class="ml-auto flex items-center gap-2">
            <!-- Recalculate Ratings Button (Modern B50) -->
            <button
              type="button"
              :disabled="recalculating"
              @click="recalculateAllRatings"
              class="flex items-center gap-1.5 rounded-lg bg-[#272a48] hover:bg-[#34375e] text-[#ffd76a] hover:text-[#fffafa] border border-[#ffd76a]/30 px-2.5 py-1.5 text-xs font-semibold transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title="Recalculate all chart constants, score ratings, and player PTT using modern B50 formula"
            >
              <svg
                v-if="recalculating"
                class="h-3.5 w-3.5 animate-spin text-[#ffd76a]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span v-else>⚡</span>
              <span>{{ recalculating ? 'Recalculating…' : 'Recalculate PTT (B50)' }}</span>
            </button>

            <!-- Sort By Select -->
            <select
              v-model="sortBy"
              class="rounded-lg bg-[#1e203a] px-2.5 py-1.5 text-xs font-semibold text-[#fffafa] border border-[#3f3c68]/40 focus:outline-none focus:ring-1 focus:ring-[#f768dd] cursor-pointer"
            >
              <option value="title">Title (A–Z)</option>
              <option value="pack">Pack / Set</option>
              <option value="date">Newest</option>
              <option value="bpm">BPM</option>
              <option value="cc">Highest constant</option>
            </select>
          </span>
        </div>

        <!-- Recalculate Notification Banner -->
        <transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-1"
        >
          <div
            v-if="recalcNotification"
            :class="[
              'mx-4 mt-2.5 flex items-center justify-between rounded-xl px-3.5 py-2 text-xs font-semibold border shadow-sm',
              recalcNotification.type === 'success'
                ? 'bg-[#acff82]/10 text-[#acff82] border-[#acff82]/30'
                : 'bg-[#e14763]/10 text-[#e14763] border-[#e14763]/30'
            ]"
          >
            <div class="flex items-center gap-2">
              <span>{{ recalcNotification.type === 'success' ? '✓' : '⚠' }}</span>
              <span>{{ recalcNotification.text }}</span>
            </div>
            <button
              type="button"
              @click="recalcNotification = null"
              class="ml-3 text-sm opacity-70 hover:opacity-100 cursor-pointer"
            >
              ×
            </button>
          </div>
        </transition>

        <!-- Filter Row -->
        <div class="flex flex-wrap items-center gap-1.5 px-4 pt-3 pb-3">
          <input
            v-model="query"
            type="search"
            placeholder="Search id, title, artist, set…"
            class="min-w-[160px] flex-1 rounded-lg bg-[#1e203a] px-3 py-1.5 text-[12.5px] text-[#fffafa] placeholder:text-[#6f6e80] border border-[#3f3c68]/30 focus:border-[#f768dd] focus:outline-none transition-colors"
          />
          <span
            v-if="packFilter"
            class="flex items-center gap-1.5 rounded-[9px] bg-[#16133e] px-3 py-1.5 text-[11.5px] font-bold text-[#acff82] border border-[#acff82]/30"
          >
            Set: {{ packFilter }}
            <button
              type="button"
              aria-label="Clear pack filter"
              @click="packFilter = null"
              class="font-bold hover:text-white transition-colors cursor-pointer"
            >
              ✕
            </button>
          </span>
        </div>

        <!-- Scrollable Song List -->
        <div class="flex h-[calc(100vh-175px)] flex-col overflow-y-auto">
          <!-- Empty State -->
          <div v-if="filtered.length === 0" class="p-9 text-center text-[#9a99a8]">
            <b class="mb-1 block text-[#fffafa] font-brand">No custom charts match</b>
            Change the search text or set filter.
          </div>

          <!-- Song Items -->
          <button
            v-for="song in filtered"
            :key="song.id"
            type="button"
            :aria-current="song.id === selectedId"
            @click="selectedId = song.id"
            :class="[
              'flex w-full items-center gap-3 border-t border-[#0c0c22] px-4 py-2.5 text-left first:border-t-0 hover:bg-[#1e203a] transition-colors cursor-pointer group',
              song.id === selectedId ? 'bg-[#16133e] border-l-2 border-l-[#f768dd]' : ''
            ]"
          >
            <!-- Jacket Thumbnail (38px) -->
            <div
              class="size-[38px] flex-none rounded-[10px] bg-cover bg-center shadow-sm border border-white/5 overflow-hidden"
              :style="{ background: artworkBackground(song.jacket, song.title) }"
            />

            <!-- Title & Artist -->
            <div class="min-w-0 flex-1">
              <b class="block overflow-hidden text-[14.5px] font-bold text-ellipsis whitespace-nowrap text-[#fffafa]">
                {{ song.title }}
              </b>
              <span class="block overflow-hidden text-[12px] text-ellipsis whitespace-nowrap text-[#9a99a8]">
                {{ song.artist }}
              </span>
            </div>

            <!-- Difficulties Levels & Quick JSON on Right -->
            <div class="flex flex-none items-center gap-1.5">
              <div class="flex items-center gap-1.5">
                <b
                  v-for="(d, i) in song.diffs"
                  :key="d.difficulty"
                  :title="d.constant ? `Constant: ${d.constant}` : '—'"
                  :class="[
                    'text-[11.5px] font-bold font-mono',
                    i > 0 ? 'border-l border-[#6f6e80]/40 pl-1.5' : '',
                    getDiffColor(d.difficulty)
                  ]"
                >
                  {{ d.level }}
                </b>
              </div>

              <!-- Quick Songlist JSON button on hover -->
              <button
                type="button"
                @click.stop="openSonglistModal(song)"
                class="size-6 rounded-lg bg-[#1e203a] hover:bg-[#ffd76a] text-[#ffd76a] hover:text-[#0c0c22] border border-white/5 flex items-center justify-center text-[10px] font-mono font-bold transition-all opacity-0 group-hover:opacity-100 shrink-0 ml-1"
                title="Lihat potongan songlist JSON"
              >
                { }
              </button>
            </div>
          </button>
        </div>
      </section>

      <!-- Right Panel: Selected Custom Song Details -->
      <section class="overflow-hidden rounded-2xl bg-[#1a1d32] border border-[#16133e] shadow-xl">
        <div v-if="!selected" class="p-10 text-center text-[13px] text-[#9a99a8]">
          No custom song selected
        </div>

        <div v-else class="p-[18px]">
          <!-- Aspect-video banner with click-to-zoom Lightbox -->
          <div class="relative mb-3.5">
            <button
              type="button"
              @click="lightboxBg = artworkBackground(currentBannerJacket, selected.title)"
              class="aspect-video w-full cursor-zoom-in rounded-2xl bg-cover bg-center shadow-lg border border-white/10 hover:brightness-105 transition-all overflow-hidden"
              :style="{ background: artworkBackground(currentBannerJacket, selected.title) }"
              title="Click to view full artwork"
            />
            <!-- If diff jacket preview is active, show badge indicator with reset button -->
            <div
              v-if="selectedDiffRc !== null"
              class="absolute top-2.5 right-2.5 flex items-center gap-1.5 rounded-lg bg-black/75 backdrop-blur-md px-2.5 py-1 text-xs font-mono font-bold text-white border border-white/20 shadow-md"
            >
              <span>Previewing {{ getDiffCode(selectedDiffRc) }} Jacket</span>
              <button
                type="button"
                @click.stop="selectedDiffRc = null"
                class="hover:text-[#f768dd] ml-1 text-xs cursor-pointer"
                title="Reset to default jacket"
              >
                ✕
              </button>
            </div>
          </div>

          <!-- Title, Artist & Badges -->
          <div class="mb-3.5 flex flex-col gap-0.5">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0 flex-1">
                <h1 class="text-2xl leading-[1.2] font-bold text-[#fffafa] font-brand">
                  {{ selected.title }}
                </h1>
                <span class="text-[13.5px] text-[#9a99a8]">
                  {{ selected.artist }}
                </span>
              </div>

              <!-- Action Buttons & Remote DL Status Pill -->
              <div class="flex items-center gap-2 shrink-0">
                <!-- View Songlist JSON Button -->
                <button
                  type="button"
                  @click="openSonglistModal(selected)"
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1e203a] hover:bg-[#3f3c68] text-xs font-bold text-[#ffd76a] border border-[#ffd76a]/30 hover:border-[#ffd76a]/60 transition-colors cursor-pointer shadow-sm"
                  title="Lihat potongan JSON songlist untuk lagu ini"
                >
                  <span class="font-mono text-sm leading-none font-black">{ }</span>
                  <span>Songlist JSON</span>
                </button>

                <!-- Remote DL Status Pill -->
                <span
                  :class="[
                    'px-2.5 py-1 rounded-full text-[11px] font-bold font-mono shrink-0 shadow-sm border',
                    selected.remoteDl
                      ? 'bg-[#acff82]/15 text-[#acff82] border-[#acff82]/30'
                      : 'bg-[#e14763]/15 text-[#e14763] border-[#e14763]/30'
                  ]"
                >
                  {{ selected.remoteDl ? 'remote_dl' : 'offline' }}
                </span>
              </div>
            </div>

            <!-- Metadata Grid -->
            <div class="mt-3 grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-2">
              <div
                v-for="[label, value] in metadataItems"
                :key="label"
                class="flex flex-col gap-0.5"
              >
                <span class="text-[10.5px] font-bold tracking-[0.08em] text-[#9a99a8] uppercase">
                  {{ label }}
                </span>
                <b class="text-[13px] font-semibold text-[#fffafa]">
                  {{ value ?? '—' }}
                </b>
              </div>
            </div>
          </div>

          <!-- Difficulty Charts Table with Constant Tuner -->
          <div class="overflow-x-auto rounded-xl border border-[#16133e] mt-4">
            <table class="w-full min-w-[540px] border-collapse text-[13.5px]">
              <thead>
                <tr>
                  <th
                    v-for="h in ['Diff', 'Level', 'Constant', 'Chart designer', 'Action']"
                    :key="h"
                    class="bg-[#1e203a] px-2.5 py-[7px] text-left text-[10.5px] tracking-[0.06em] text-[#6f6e80] uppercase font-bold"
                  >
                    {{ h }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="d in selected.diffs"
                  :key="d.difficulty"
                  @click="selectedDiffRc = selectedDiffRc === d.ratingClass ? null : d.ratingClass"
                  :class="[
                    'border-t border-[#0c0c22] hover:bg-[#1e203a]/50 transition-colors cursor-pointer',
                    selectedDiffRc === d.ratingClass ? 'bg-[#16133e] ring-1 ring-inset ring-[#f768dd]' : ''
                  ]"
                >
                  <td :class="['px-2.5 py-2 font-bold font-mono flex items-center gap-1.5', getDiffColor(d.difficulty)]">
                    <span>{{ d.difficulty }}</span>
                    <span
                      v-if="d.jacketOverride"
                      class="px-1.5 py-0.5 rounded text-[10px] font-sans font-bold bg-[#f768dd]/20 text-[#f768dd] border border-[#f768dd]/40"
                      title="Custom jacket override active"
                    >
                      Jacket
                    </span>
                  </td>
                  <td class="px-2.5 py-2 tabular-nums text-[#fffafa] font-bold">
                    {{ d.level }}
                  </td>
                  <td class="px-2.5 py-2 tabular-nums text-[#ffd76a] font-mono font-black">
                    {{ d.constant }}
                  </td>
                  <td class="px-2.5 py-2 text-xs text-[#9a99a8]">
                    {{ d.chart_designer || 'uncredited' }}
                  </td>
                  <td class="px-2.5 py-2 text-right">
                    <div class="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        @click.stop="openAffModal(selected, d.ratingClass)"
                        class="rounded-lg bg-[#1e203a] hover:bg-[#3f3c68] px-2.5 py-1 text-xs font-bold text-[#acff82] border border-[#3f3c68]/40 transition-colors cursor-pointer shadow-sm flex items-center gap-1"
                        title="View & Edit chart .aff file"
                      >
                        <span>📝</span>
                        <span>Chart (.aff)</span>
                      </button>
                      <button
                        type="button"
                        @click.stop="openEditModal(selected, d.ratingClass)"
                        class="rounded-lg bg-[#3f3c68]/50 hover:bg-[#f768dd] hover:text-[#0c0c22] px-2.5 py-1 text-xs font-bold text-[#fffafa] transition-colors cursor-pointer shadow-sm"
                      >
                        Edit Constant
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>

    <!-- Lightbox Modal (Click on Jacket Artwork) -->
    <Teleport to="body">
      <div
        v-if="lightboxBg"
        class="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-[#06060f]/85 p-8 backdrop-blur-[3px] animate-in fade-in duration-150"
        @click.self="lightboxBg = null"
      >
        <button
          type="button"
          aria-label="Close"
          @click="lightboxBg = null"
          class="fixed top-[22px] right-[26px] z-[51] flex size-[38px] items-center justify-center rounded-xl bg-[#1e203a] hover:bg-[#3f3c68] text-white transition-colors cursor-pointer"
        >
          ✕
        </button>
        <div
          class="aspect-square w-[min(74vw,560px)] rounded-[22px] bg-cover bg-center shadow-[0_24px_64px_-16px_rgba(0,0,0,.6)] border border-white/10 overflow-hidden"
          :style="{ background: lightboxBg }"
        />
      </div>
    </Teleport>

    <!-- Edit Constant Modal -->
    <Teleport to="body">
      <div
        v-if="editingSong"
        class="fixed inset-0 z-50 flex items-center justify-center bg-[#06060f]/85 p-5 backdrop-blur-[3px] animate-in fade-in duration-150"
        @click.self="editingSong = null"
      >
        <div class="max-h-[calc(100vh-40px)] w-full max-w-[440px] overflow-y-auto rounded-[24px] bg-[#1a1d32] px-6 py-[22px] border border-[#16133e] text-[#fffafa] shadow-2xl">
          <div class="mb-0.5 flex items-center gap-2.5">
            <h2 class="flex-1 text-[17px] font-bold font-brand">Tune Chart Constant</h2>
            <button
              type="button"
              aria-label="Close"
              @click="editingSong = null"
              class="flex size-6 flex-none items-center justify-center rounded-[7px] border border-[#3f3c68] bg-[#1e203a] text-sm hover:border-[#fffafa] text-[#9a99a8] hover:text-[#fffafa] transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
          <p class="mb-3.5 text-xs text-[#9a99a8]">
            Mengubah rating level & constant untuk chart song <span class="font-bold text-[#f768dd] font-mono">{{ editingSong.id }}</span>. Perubahan langsung disimpan ke server songlist.
          </p>

          <!-- Difficulty Tab Selector -->
          <div class="mb-4 flex flex-wrap gap-1.5">
            <button
              v-for="d in editingSong.difficulties"
              :key="d.ratingClass"
              type="button"
              @click="selectedRatingClass = d.ratingClass; syncDiffForm()"
              :class="[
                'px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border',
                selectedRatingClass === d.ratingClass
                  ? 'bg-white text-slate-900 border-white shadow-md'
                  : 'bg-[#1e203a] text-[#9a99a8] border-[#3f3c68]/30 hover:text-white'
              ]"
            >
              {{ getDiffCode(d.ratingClass) }}
            </button>
          </div>

          <!-- Edit Inputs -->
          <div class="space-y-3">
            <div>
              <label class="block text-[10.5px] font-bold tracking-[0.08em] text-[#9a99a8] uppercase mb-1">
                Base Rating (Display Level)
              </label>
              <input
                v-model.number="diffForm.rating"
                type="number"
                min="1"
                max="20"
                class="w-full rounded-xl bg-[#0c0c22] px-3 py-2 text-sm text-[#fffafa] border border-[#3f3c68]/40 focus:border-[#f768dd] focus:outline-none"
              />
            </div>

            <div class="flex items-center gap-2 pt-1">
              <input
                id="editPlus"
                v-model="diffForm.ratingPlus"
                type="checkbox"
                class="rounded border-[#3f3c68] bg-[#0c0c22] text-[#f768dd] focus:ring-0 cursor-pointer h-4 w-4"
              />
              <label for="editPlus" class="text-xs font-bold text-[#fffafa] cursor-pointer">
                Rating Plus ('+') e.g. 9+, 10+, 11+
              </label>
            </div>

            <div>
              <label class="block text-[10.5px] font-bold tracking-[0.08em] text-[#9a99a8] uppercase mb-1">
                Internal Chart Constant (e.g. 9.6, 10.8, 11.4)
              </label>
              <input
                v-model.number="diffForm.constant"
                type="number"
                step="0.1"
                min="1"
                max="25"
                class="w-full rounded-xl bg-[#0c0c22] px-3 py-2 text-sm text-[#ffd76a] font-mono font-bold border border-[#3f3c68]/40 focus:border-[#f768dd] focus:outline-none"
              />
            </div>

            <div class="rounded-xl bg-[#101222] p-2.5 border border-[#3f3c68]/30 text-xs text-[#acff82] flex items-center gap-1.5">
              <span>⚡</span>
              <span>Otomatis sinkron ke server VPS (celest-server) & trigger client Hot Reload.</span>
            </div>
          </div>

          <div v-if="saveError" class="mt-3 text-xs text-[#e14763] font-semibold">
            {{ saveError }}
          </div>

          <!-- Actions -->
          <div class="mt-5 flex items-center justify-end gap-2 border-t border-dashed border-[#0c0c22] pt-3.5">
            <button
              type="button"
              @click="editingSong = null"
              class="rounded-[11px] bg-[#1e203a] px-3.5 py-2 text-[12.5px] font-semibold text-[#9a99a8] hover:bg-[#0c0c22] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              :disabled="saving"
              @click="saveChartConstant"
              class="rounded-[11px] bg-[#f768dd] px-4 py-2 text-[12.5px] font-bold text-[#0c0c22] hover:bg-[#f768dd]/90 transition-colors cursor-pointer disabled:opacity-50"
            >
              {{ saving ? 'Saving…' : 'Save Constant' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Edit Chart .aff Modal -->
    <Teleport to="body">
      <div
        v-if="editingAffSong"
        class="fixed inset-0 z-50 flex items-center justify-center bg-[#06060f]/85 p-4 backdrop-blur-[3px] animate-in fade-in duration-150"
        @click.self="closeAffModal"
      >
        <div class="flex flex-col h-[90vh] max-h-[850px] w-full max-w-[840px] rounded-[24px] bg-[#1a1d32] border border-[#16133e] text-[#fffafa] shadow-2xl overflow-hidden">
          <!-- Modal Header -->
          <div class="flex items-center justify-between border-b border-[#0c0c22] px-6 py-4 bg-[#141628]">
            <div class="flex items-center gap-3">
              <span class="rounded-lg bg-[#0c0c22] px-2.5 py-1 text-xs font-mono font-bold text-[#f768dd] border border-[#3f3c68]/30">
                {{ getDiffCode(selectedAffRc) }} · {{ selectedAffRc }}.aff
              </span>
              <div>
                <h2 class="text-base font-bold font-brand text-[#fffafa]">
                  {{ editingAffSong.title }}
                </h2>
                <div class="flex items-center gap-2 text-xs text-[#9a99a8]">
                  <span>Song ID: <span class="font-mono text-[#ffd76a]">{{ editingAffSong.id }}</span></span>
                  <span>•</span>
                  <span v-if="affSource === 'vps'" class="text-[#acff82] flex items-center gap-1 font-semibold">
                    <span class="size-1.5 rounded-full bg-[#acff82] animate-pulse"></span>
                    Live VPS Server
                  </span>
                  <span v-else class="text-[#9a99a8]">Local Storage</span>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button
                type="button"
                @click="copyAffToClipboard"
                class="rounded-lg bg-[#1e203a] hover:bg-[#3f3c68] px-2.5 py-1 text-xs font-semibold text-[#fffafa] transition-colors cursor-pointer border border-[#3f3c68]/40"
                title="Copy AFF content"
              >
                {{ copied ? 'Copied!' : 'Copy' }}
              </button>
              <button
                type="button"
                @click="downloadAffFile"
                class="rounded-lg bg-[#1e203a] hover:bg-[#3f3c68] px-2.5 py-1 text-xs font-semibold text-[#fffafa] transition-colors cursor-pointer border border-[#3f3c68]/40"
                title="Download .aff file"
              >
                Download
              </button>
              <button
                type="button"
                aria-label="Close"
                @click="closeAffModal"
                class="flex size-7 items-center justify-center rounded-[8px] border border-[#3f3c68] bg-[#1e203a] text-sm hover:border-[#fffafa] text-[#9a99a8] hover:text-[#fffafa] transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>

          <!-- Difficulty switcher inside modal -->
          <div class="flex items-center gap-2 px-6 py-2.5 bg-[#101222] border-b border-[#0c0c22]">
            <span class="text-xs text-[#6f6e80] font-bold">DIFFICULTY:</span>
            <button
              v-for="d in editingAffSong.difficulties"
              :key="d.ratingClass"
              type="button"
              @click="switchAffRc(d.ratingClass)"
              :class="[
                'px-2.5 py-0.5 rounded-md text-xs font-mono font-bold transition-all cursor-pointer border',
                selectedAffRc === d.ratingClass
                  ? 'bg-white text-slate-900 border-white shadow-sm'
                  : 'bg-[#1e203a] text-[#9a99a8] border-[#3f3c68]/30 hover:text-white'
              ]"
            >
              {{ getDiffCode(d.ratingClass) }}
            </button>
            <div class="ml-auto text-xs text-[#9a99a8] font-mono">
              {{ affLineCount }} lines · {{ affNoteCount }} approx notes · {{ (affContent.length / 1024).toFixed(1) }} KB
            </div>
          </div>

          <!-- Editor Body -->
          <div class="flex-1 relative overflow-hidden p-4 bg-[#0a0a1a]">
            <div v-if="loadingAff" class="absolute inset-0 flex items-center justify-center bg-[#0a0a1a]/80 backdrop-blur-sm z-10">
              <span class="text-sm font-semibold text-[#f768dd] animate-pulse">Loading chart file from server…</span>
            </div>
            <textarea
              v-model="affContent"
              class="w-full h-full resize-none rounded-xl bg-[#080816] p-4 text-xs font-mono text-[#fffafa] border border-[#222442] focus:border-[#f768dd] focus:outline-none leading-relaxed"
              spellcheck="false"
              placeholder="AudioOffset:0&#10;-&#10;timing(0,180.00,4.00);&#10;..."
            ></textarea>
          </div>

          <!-- Modal Footer -->
          <div class="flex items-center justify-between border-t border-[#0c0c22] px-6 py-3.5 bg-[#141628]">
            <div class="flex items-center gap-2 text-xs">
              <span class="text-[#acff82] flex items-center gap-1 font-semibold">
                <span>⚡</span> Auto-sync ke VPS (celest-server) & client Hot Reload
              </span>
              <span v-if="affSaveSuccess" class="text-[#acff82] font-bold ml-2">✓ {{ affSaveSuccess }}</span>
              <span v-if="affSaveError" class="text-[#e14763] font-bold ml-2">✕ {{ affSaveError }}</span>
            </div>
            <div class="flex items-center gap-2">
              <button
                type="button"
                @click="closeAffModal"
                class="rounded-[11px] bg-[#1e203a] px-3.5 py-2 text-[12.5px] font-semibold text-[#9a99a8] hover:bg-[#0c0c22] transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                :disabled="savingAff || validatingAff || loadingAff"
                @click="runChartAudit()"
                class="rounded-[11px] bg-[#1e203a] hover:bg-[#282a4d] border border-[#3f3c68]/50 px-3.5 py-2 text-[12.5px] font-semibold text-[#fffafa] transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                title="Cek integritas chart terhadap Poin 3, 4, dan 5"
              >
                <span v-if="validatingAff" class="animate-spin text-xs">⟳</span>
                <span v-else>🔍</span>
                <span>{{ validatingAff ? 'Memeriksa Poin 3, 4, 5…' : 'Preview Test (Poin 3, 4, 5)' }}</span>
              </button>
              <button
                type="button"
                :disabled="savingAff || validatingAff || loadingAff"
                @click="handleSaveAndDeploy"
                class="rounded-[11px] bg-[#acff82] px-4 py-2 text-[12.5px] font-bold text-[#0c0c22] hover:bg-[#acff82]/90 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <span v-if="savingAff" class="animate-spin text-xs">⟳</span>
                <span>{{ savingAff ? 'Deploying to VPS…' : 'Save & Deploy to VPS' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Audit Result Popup (Poin 3, 4, 5) -->
    <Teleport to="body">
      <div
        v-if="showAuditModal && auditResult"
        class="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150"
      >
        <div class="w-full max-w-2xl rounded-2xl border border-[#222442] bg-[#101222] shadow-2xl flex flex-col max-h-[88vh] overflow-hidden">
          <!-- Header -->
          <div class="flex items-center justify-between border-b border-[#0c0c22] px-6 py-4 bg-[#141628]">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-lg">🛡️</span>
                <h3 class="text-base font-bold text-[#fffafa]">
                  Audit Integritas Chart (Poin 3, 4, 5)
                </h3>
              </div>
              <p class="text-xs text-[#9a99a8] mt-0.5">
                {{ editingAffSong?.title_localized?.en }} · <span class="font-mono font-bold">{{ getDiffCode(selectedAffRc) }}</span>
              </p>
            </div>
            <button
              type="button"
              @click="showAuditModal = false"
              class="flex size-7 items-center justify-center rounded-[8px] border border-[#3f3c68] bg-[#1e203a] text-sm text-[#9a99a8] hover:text-[#fffafa] hover:border-[#fffafa] transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          <!-- Overall Status Banner -->
          <div :class="[
            'px-6 py-3 border-b text-xs font-semibold flex items-center justify-between',
            auditResult.valid
              ? 'bg-[#152e20] text-[#acff82] border-[#224430]'
              : 'bg-[#381622] text-[#ff6880] border-[#552030]'
          ]">
            <div class="flex items-center gap-2">
              <span class="text-sm font-bold">{{ auditResult.valid ? '✓' : '⚠️' }}</span>
              <span>
                {{ auditResult.valid
                    ? (auditResult.has_warnings ? 'Lolos Audit dengan Catatan / Warnings' : 'Lolos Audit Poin 3, 4, 5 — Bersih dari Potensi Crash Native Engine')
                    : `Ditemukan ${auditResult.total_errors} Masalah Fatal yang Memicu Crash Native Engine!` }}
              </span>
            </div>
            <span class="font-mono text-[11px] opacity-80">
              {{ auditResult.total_errors }} error(s) · {{ auditResult.total_warnings }} warning(s)
            </span>
          </div>

          <!-- Body: Point Breakdown Cards -->
          <div class="p-6 overflow-y-auto space-y-4 flex-1">
            <!-- 3 Suite Status Cards -->
            <div class="grid grid-cols-3 gap-3">
              <!-- Point 3 -->
              <div class="rounded-xl border border-[#222442] bg-[#0c0d18] p-3 flex flex-col justify-between">
                <div class="text-[11px] font-bold text-[#9a99a8]">Poin 3: Aff Syntax</div>
                <div class="mt-2 text-xs font-mono font-bold" :class="{
                  'text-[#acff82]': auditResult.point3.status === 'PASSED',
                  'text-[#e14763]': auditResult.point3.status === 'FAILED',
                  'text-[#ffc83b]': auditResult.point3.status === 'WARNING',
                }">
                  [{{ auditResult.point3.status }}]
                </div>
                <div class="text-[10.5px] text-[#6f6e80] mt-1 leading-tight">
                  Lanes (-6..10), camera & floats
                </div>
              </div>

              <!-- Point 4 -->
              <div class="rounded-xl border border-[#222442] bg-[#0c0d18] p-3 flex flex-col justify-between">
                <div class="text-[11px] font-bold text-[#9a99a8]">Poin 4: Anti-Crash</div>
                <div class="mt-2 text-xs font-mono font-bold" :class="{
                  'text-[#acff82]': auditResult.point4.status === 'PASSED',
                  'text-[#e14763]': auditResult.point4.status === 'FAILED',
                  'text-[#ffc83b]': auditResult.point4.status === 'WARNING',
                }">
                  [{{ auditResult.point4.status }}]
                </div>
                <div class="text-[10.5px] text-[#6f6e80] mt-1 leading-tight">
                  Zero BPM, Extreme BPM, TG
                </div>
              </div>

              <!-- Point 5 -->
              <div class="rounded-xl border border-[#222442] bg-[#0c0d18] p-3 flex flex-col justify-between">
                <div class="text-[11px] font-bold text-[#9a99a8]">Poin 5: Duration</div>
                <div class="mt-2 text-xs font-mono font-bold" :class="{
                  'text-[#acff82]': auditResult.point5.status === 'PASSED',
                  'text-[#e14763]': auditResult.point5.status === 'FAILED',
                  'text-[#ffc83b]': auditResult.point5.status === 'WARNING',
                }">
                  [{{ auditResult.point5.status }}]
                </div>
                <div class="text-[10.5px] text-[#6f6e80] mt-1 leading-tight">
                  0ms Arcs & Holds (div by zero)
                </div>
              </div>
            </div>

            <!-- List of Errors -->
            <div v-if="auditResult.has_errors" class="space-y-2">
              <div class="text-xs font-bold text-[#ff6880] flex items-center gap-1.5 uppercase tracking-wider">
                <span>✕</span> Rincian Kesalahan Fatal (Penyebab Crash Native Arcaea):
              </div>
              <div class="rounded-xl border border-[#552030] bg-[#1a0a10] p-3 space-y-2 text-xs font-mono">
                <div
                  v-for="(err, i) in [
                    ...auditResult.point3.errors,
                    ...auditResult.point4.errors,
                    ...auditResult.point5.errors,
                  ]"
                  :key="i"
                  class="flex items-start gap-2 text-[#ff98aa]"
                >
                  <span class="rounded bg-[#552030] px-1.5 py-0.5 text-[10.5px] font-bold text-[#ff6880] shrink-0">
                    Line {{ err.line }}
                  </span>
                  <div>
                    <span class="font-bold text-white">{{ err.rule }}:</span> {{ err.message }}
                  </div>
                </div>
              </div>
            </div>

            <!-- List of Warnings -->
            <div v-if="auditResult.has_warnings" class="space-y-2">
              <div class="text-xs font-bold text-[#ffc83b] flex items-center gap-1.5 uppercase tracking-wider">
                <span>⚠️</span> Peringatan Format & Standar Lintasan:
              </div>
              <div class="rounded-xl border border-[#443818] bg-[#161408] p-3 space-y-2 text-xs font-mono">
                <div
                  v-for="(warn, i) in [
                    ...auditResult.point3.warnings,
                    ...auditResult.point4.warnings,
                    ...auditResult.point5.warnings,
                  ]"
                  :key="i"
                  class="flex items-start gap-2 text-[#ffe394]"
                >
                  <span class="rounded bg-[#443818] px-1.5 py-0.5 text-[10.5px] font-bold text-[#ffc83b] shrink-0">
                    Line {{ warn.line }}
                  </span>
                  <div>
                    <span class="font-bold text-white">{{ warn.rule }}:</span> {{ warn.message }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Auto-fix Available Box -->
            <div v-if="auditResult.is_fixable" class="rounded-xl border border-[#224430] bg-[#0c1f14] p-3.5 flex items-center justify-between">
              <div>
                <div class="text-xs font-bold text-[#acff82] flex items-center gap-1.5">
                  <span>⚡</span> Perbaikan Otomatis Tersedia ({{ auditResult.total_fixes }} fixes)
                </div>
                <div class="text-[11.5px] text-[#9a99a8] mt-0.5">
                  Dapat memperbaiki otomatis 0ms arc (+1ms), zero BPM, pembersihan scenecontrol anomali, & normalisasi koma timinggroup.
                </div>
              </div>
              <button
                type="button"
                @click="applyAutoFix"
                class="rounded-lg bg-[#acff82] px-3 py-1.5 text-xs font-bold text-[#0c0c22] hover:bg-[#acff82]/90 transition-colors cursor-pointer shrink-0 ml-3"
              >
                Terapkan Auto-Fix
              </button>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="flex items-center justify-between border-t border-[#0c0c22] px-6 py-3.5 bg-[#141628]">
            <div class="flex items-center gap-2">
              <button
                type="button"
                @click="showAuditModal = false"
                class="rounded-[11px] bg-[#1e203a] px-3.5 py-2 text-[12.5px] font-semibold text-[#9a99a8] hover:bg-[#0c0c22] transition-colors cursor-pointer"
              >
                Kembali ke Editor (Fix Manual)
              </button>
            </div>
            <div class="flex items-center gap-2">
              <button
                type="button"
                :disabled="savingAff"
                @click="executeSaveChart({ deployVps: false })"
                class="rounded-[11px] bg-[#3b4172] hover:bg-[#49518c] text-white px-3.5 py-2 text-[12.5px] font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                title="Simpan file .aff di server lokal saja tanpa deploy ke VPS"
              >
                <span>💾 Simpan Lokal Saja (Fix Sendiri)</span>
              </button>
              <button
                v-if="auditResult.valid"
                type="button"
                :disabled="savingAff"
                @click="executeSaveChart({ deployVps: true })"
                class="rounded-[11px] bg-[#acff82] hover:bg-[#acff82]/90 text-[#0c0c22] px-4 py-2 text-[12.5px] font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>🚀 Lanjutkan Deploy ke VPS</span>
              </button>
              <button
                v-else
                type="button"
                :disabled="savingAff"
                @click="executeSaveChart({ deployVps: true })"
                class="rounded-[11px] border border-[#e14763]/60 bg-[#2a1018] hover:bg-[#3d1522] text-[#ff8095] px-3.5 py-2 text-[12px] font-semibold transition-colors cursor-pointer"
                title="Abaikan peringatan dan paksa deploy ke VPS"
              >
                <span>Paksa Deploy VPS (Risiko Crash)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- View Songlist Entry JSON Modal -->
    <Teleport to="body">
      <div
        v-if="viewingSonglistSong"
        class="fixed inset-0 z-50 flex items-center justify-center bg-[#06060f]/85 p-4 backdrop-blur-[3px] animate-in fade-in duration-150"
        @click.self="viewingSonglistSong = null"
      >
        <div class="flex flex-col h-[85vh] max-h-[800px] w-full max-w-[760px] rounded-[24px] bg-[#1a1d32] border border-[#16133e] text-[#fffafa] shadow-2xl overflow-hidden">
          <!-- Modal Header -->
          <div class="flex items-center justify-between border-b border-[#0c0c22] px-6 py-4 bg-[#141628]">
            <div class="flex items-center gap-3">
              <div class="size-10 rounded-xl bg-[#0c0c22] border border-white/10 flex items-center justify-center font-mono font-black text-lg text-[#ffd76a] shadow-inner">
                { }
              </div>
              <div>
                <h2 class="text-base font-bold font-brand text-white flex items-center gap-2">
                  <span>Songlist Entry JSON</span>
                  <span class="font-mono text-xs px-2 py-0.5 rounded-md bg-[#ffd76a]/15 text-[#ffd76a] border border-[#ffd76a]/30">
                    {{ viewingSonglistSong.id }}
                  </span>
                </h2>
                <p class="text-xs text-[#9a99a8] font-mono">
                  {{ viewingSonglistSong.title }} · {{ viewingSonglistSong.artist }}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <!-- Copy JSON Button -->
              <button
                type="button"
                @click="copySonglistJson"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm border"
                :class="copiedJson ? 'bg-emerald-500 text-slate-900 border-emerald-400 font-black' : 'bg-[#1e203a] hover:bg-[#3f3c68] text-white border-white/10'"
              >
                <span v-if="copiedJson">✓ Copied!</span>
                <template v-else>
                  <svg class="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  <span>Copy JSON</span>
                </template>
              </button>

              <!-- Close Button -->
              <button
                type="button"
                aria-label="Close"
                @click="viewingSonglistSong = null"
                class="flex size-7 items-center justify-center rounded-xl border border-[#3f3c68] bg-[#1e203a] text-sm hover:border-[#fffafa] text-[#9a99a8] hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>

          <!-- File Source Bar -->
          <div class="flex items-center justify-between px-6 py-2 bg-[#0e101f] border-b border-[#0c0c22] text-[11px] font-mono text-[#6f6e80]">
            <span class="flex items-center gap-1.5">
              <span class="size-2 rounded-full bg-emerald-400" :class="{ 'animate-pulse': loadingSonglistEntry }"></span>
              <span>Source: ArcaeaServerFork/database/songs/songlist</span>
            </span>
            <span class="text-[#9a99a8]">{{ songlistJsonText.split('\n').length }} lines · {{ songlistJsonText.length }} chars</span>
          </div>

          <!-- Code Body -->
          <div class="flex-1 overflow-auto p-4 bg-[#0c0c22] relative">
            <div v-if="loadingSonglistEntry" class="absolute top-3 right-3 text-[11px] text-[#ffd76a] bg-black/60 px-2 py-0.5 rounded border border-[#ffd76a]/30 flex items-center gap-1.5">
              <span class="size-1.5 rounded-full bg-[#ffd76a] animate-ping"></span>
              <span>Fetching live from disk...</span>
            </div>
            <pre class="font-mono text-xs leading-relaxed text-[#acff82] select-all whitespace-pre"><code>{{ songlistJsonText }}</code></pre>
          </div>

          <!-- Modal Footer -->
          <div class="flex items-center justify-between px-6 py-3 bg-[#141628] border-t border-[#0c0c22] text-xs">
            <span class="text-[#6f6e80]">
              Potongan JSON resmi lagu ini di file database songlist server.
            </span>
            <button
              type="button"
              @click="viewingSonglistSong = null"
              class="px-4 py-1.5 rounded-xl bg-[#1e203a] hover:bg-[#3f3c68] text-xs font-semibold text-white transition-colors cursor-pointer"
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
import { ref, computed, reactive, watch, onMounted, onUnmounted } from 'vue';
import { artworkBackground } from '~/utils/jacket';
import { DIFFICULTY_COLOR, type DifficultyCode } from '~/utils/difficulty';
import type { ServerSongItem, ServerChartRow, ServerDifficulty } from '~/types/server-song';

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
});

useHead({
  title: 'Admin · Custom charts',
});

type SortBy = 'title' | 'pack' | 'date' | 'bpm' | 'cc';

const route = useRoute();
const query = ref<string>(route.query.q ? String(route.query.q) : '');
const sortBy = ref<SortBy>('title');
const packFilter = ref<string | null>(route.query.set ? String(route.query.set) : null);
const selectedId = ref<string | null>(null);
const selectedDiffRc = ref<number | null>(null);
const lightboxBg = ref<string | null>(null);

// Reset difficulty selection when changing selected song
watch(selectedId, () => {
  selectedDiffRc.value = null;
});

const { data, refresh } = await useFetch('/api/admin/server/songs');
const songs = computed<ServerSongItem[]>(() => (data.value?.songs || []) as ServerSongItem[]);

// Auto-select first song
watch(
  songs,
  (list) => {
    if (!selectedId.value && list.length > 0) {
      selectedId.value = list[0]!.id;
    }
  },
  { immediate: true }
);

function getDiffCode(rc: number): string {
  switch (rc) {
    case 0: return 'PST';
    case 1: return 'PRS';
    case 2: return 'FTR';
    case 3: return 'BYD';
    case 4: return 'ETR';
    case 5: return 'INS';
    default: return `RC${rc}`;
  }
}

function getDiffColor(diff: string) {
  const c = DIFFICULTY_COLOR[diff as DifficultyCode];
  return c ? c[0] : 'text-gray-400';
}

function maxConstant(song: ServerSongItem): number {
  return Math.max(
    0,
    ...(song.diffs || []).map((d: ServerChartRow) => (d.constant ? parseFloat(d.constant) : 0))
  );
}

function formatDate(timestamp: number): string {
  if (!timestamp) return '—';
  // Check if timestamp is in seconds vs milliseconds
  const ms = timestamp < 10000000000 ? timestamp * 1000 : timestamp;
  return new Date(ms).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  const rows = songs.value.filter(
    (s) =>
      (!packFilter.value || s.set === packFilter.value) &&
      (!q ||
        s.title.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        (s.set ?? '').toLowerCase().includes(q) ||
        (s.artist ?? '').toLowerCase().includes(q))
  );

  const sorters: Record<SortBy, (a: ServerSongItem, b: ServerSongItem) => number> = {
    title: (a, b) => a.title.localeCompare(b.title),
    pack: (a, b) => (a.set ?? '').localeCompare(b.set ?? '') || a.title.localeCompare(b.title),
    date: (a, b) => (b.date ?? 0) - (a.date ?? 0),
    bpm: (a, b) => (parseFloat(String(b.bpm) ?? '0') || 0) - (parseFloat(String(a.bpm) ?? '0') || 0),
    cc: (a, b) => maxConstant(b) - maxConstant(a),
  };

  return [...rows].sort(sorters[sortBy.value]);
});

const selected = computed(() => {
  return songs.value.find((s) => s.id === selectedId.value) || null;
});

const currentBannerJacket = computed(() => {
  if (!selected.value) return '';
  if (selectedDiffRc.value !== null) {
    return `/api/jacket/${selected.value.id}?diff=${selectedDiffRc.value}`;
  }
  return selected.value.jacket_full || selected.value.jacket;
});

const metadataItems = computed(() => {
  if (!selected.value) return [];
  const s = selected.value;
  return [
    ['Pack / Set', s.set],
    ['Side', s.side],
    ['BPM', String(s.bpm)],
    ['Background', s.bg],
    ['Released / Date', formatDate(s.date)],
    ['Version', s.version],
  ] as const;
});

// Edit Modal
const editingSong = ref<ServerSongItem | null>(null);
const selectedRatingClass = ref(2);
const saving = ref(false);
const saveError = ref('');

// AFF Editor State
const editingAffSong = ref<ServerSongItem | null>(null);
const selectedAffRc = ref<number>(2);
const affContent = ref<string>('');
const loadingAff = ref<boolean>(false);
const savingAff = ref<boolean>(false);
const affSaveSuccess = ref<string>('');
const affSaveError = ref<string>('');
const affSource = ref<'vps' | 'local'>('local');
const copied = ref<boolean>(false);

const affLineCount = computed(() => (affContent.value ? affContent.value.split('\n').length : 0));
const affNoteCount = computed(() => {
  if (!affContent.value) return 0;
  const taps = (affContent.value.match(/\(\d+,\s*[0-9-]+\);/g) || []).length;
  const arctaps = (affContent.value.match(/arctap\(/g) || []).length;
  const holds = (affContent.value.match(/hold\(/g) || []).length;
  const arcs = (affContent.value.match(/arc\(/g) || []).length;
  return taps + arctaps + holds + arcs;
});

async function openAffModal(song: ServerSongItem, rc: number) {
  editingAffSong.value = song;
  selectedAffRc.value = rc;
  affSaveSuccess.value = '';
  affSaveError.value = '';
  copied.value = false;
  await loadAff(song.id, rc);
}

async function switchAffRc(rc: number) {
  if (!editingAffSong.value || selectedAffRc.value === rc) return;
  selectedAffRc.value = rc;
  affSaveSuccess.value = '';
  affSaveError.value = '';
  copied.value = false;
  await loadAff(editingAffSong.value.id, rc);
}

async function loadAff(songId: string, rc: number) {
  loadingAff.value = true;
  affContent.value = '';
  try {
    const res: any = await $fetch(`/api/admin/server/charts/aff?song_id=${encodeURIComponent(songId)}&ratingClass=${rc}`);
    affContent.value = res.content || '';
    affSource.value = res.source || 'local';
  } catch (err: any) {
    affSaveError.value = err?.data?.statusMessage || err.message || 'Failed to load chart .aff';
  } finally {
    loadingAff.value = false;
  }
}

// Validation & Audit State (Poin 3, 4, 5)
const validatingAff = ref<boolean>(false);
const showAuditModal = ref<boolean>(false);
const auditResult = ref<any>(null);

async function runChartAudit(options: { autoDeployIfClean?: boolean } = {}) {
  if (!editingAffSong.value) return;
  validatingAff.value = true;
  affSaveError.value = '';
  affSaveSuccess.value = '';

  try {
    const res: any = await $fetch('/api/admin/server/charts/validate', {
      method: 'POST',
      body: {
        song_id: editingAffSong.value.id,
        ratingClass: selectedAffRc.value,
        content: affContent.value,
      },
    });

    auditResult.value = res;

    if (res.valid && !res.has_warnings) {
      if (options.autoDeployIfClean) {
        await executeSaveChart({ deployVps: true });
        return;
      } else {
        affSaveSuccess.value = '✓ Lolos Audit Poin 3, 4, 5 — Bersih (0 potensi crash)';
      }
    } else {
      // Show audit modal popup with errors/warnings
      showAuditModal.value = true;
    }
  } catch (err: any) {
    affSaveError.value = err?.data?.statusMessage || err.message || 'Gagal memvalidasi chart .aff';
  } finally {
    validatingAff.value = false;
  }
}

async function handleSaveAndDeploy() {
  // Test Poin 3, 4, 5 first before deploying to VPS
  await runChartAudit({ autoDeployIfClean: true });
}

async function executeSaveChart(options: { deployVps: boolean }) {
  if (!editingAffSong.value) return;
  savingAff.value = true;
  affSaveSuccess.value = '';
  affSaveError.value = '';

  try {
    const res: any = await $fetch('/api/admin/server/charts/aff', {
      method: 'POST',
      body: {
        song_id: editingAffSong.value.id,
        ratingClass: selectedAffRc.value,
        content: affContent.value,
        deploy_vps: options.deployVps,
      },
    });

    if (options.deployVps) {
      affSaveSuccess.value = res.synced_vps
        ? 'Saved & Deployed to VPS celest-server!'
        : 'Saved locally (VPS sync pending)';
    } else {
      affSaveSuccess.value = 'Disimpan lokal saja di server (bisa di-fix sendiri). VPS belum diubah.';
    }
    showAuditModal.value = false;
    await refresh();
  } catch (err: any) {
    affSaveError.value = err?.data?.statusMessage || err.message || 'Failed to save chart .aff';
  } finally {
    savingAff.value = false;
  }
}

function applyAutoFix() {
  if (auditResult.value?.fixed_content) {
    affContent.value = auditResult.value.fixed_content;
    // Re-run audit to reflect resolved state
    runChartAudit();
  }
}

async function saveChartAffFile() {
  await handleSaveAndDeploy();
}

function copyAffToClipboard() {
  if (!affContent.value) return;
  navigator.clipboard.writeText(affContent.value);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2000);
}

function downloadAffFile() {
  if (!editingAffSong.value) return;
  const blob = new Blob([affContent.value], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${editingAffSong.value.id}_${selectedAffRc.value}.aff`;
  a.click();
  URL.revokeObjectURL(url);
}

function closeAffModal() {
  editingAffSong.value = null;
  affContent.value = '';
  affSaveSuccess.value = '';
  affSaveError.value = '';
}

const diffForm = reactive({
  rating: 0,
  constant: 0,
  ratingPlus: false,
});

function openEditModal(song: ServerSongItem, rc?: number) {
  editingSong.value = song;
  saveError.value = '';
  const firstDiff = (song.difficulties || [])[0];
  selectedRatingClass.value = rc !== undefined ? rc : (firstDiff?.ratingClass ?? 2);
  syncDiffForm();
}

function syncDiffForm() {
  if (!editingSong.value) return;
  const target = (editingSong.value.difficulties || []).find((d: ServerDifficulty) => d.ratingClass === selectedRatingClass.value);
  if (target) {
    diffForm.rating = target.rating;
    diffForm.constant = target.constant || target.rating;
    diffForm.ratingPlus = Boolean(target.ratingPlus);
  }
}

async function saveChartConstant() {
  if (!editingSong.value) return;
  saving.value = true;
  saveError.value = '';

  try {
    await $fetch('/api/admin/server/charts/constant', {
      method: 'POST',
      body: {
        song_id: editingSong.value.id,
        ratingClass: selectedRatingClass.value,
        rating: diffForm.rating,
        ratingPlus: diffForm.ratingPlus,
        constant: diffForm.constant,
      },
    });

    editingSong.value = null;
    await refresh();
  } catch (err: any) {
    saveError.value = err?.data?.statusMessage || err.message || 'Failed to update constant';
  } finally {
    saving.value = false;
  }
}

// Global Recalculate Ratings (Modern B50)
const recalculating = ref(false);
const recalcNotification = ref<{ type: 'success' | 'error'; text: string } | null>(null);
let recalcTimer: ReturnType<typeof setTimeout> | null = null;

function showRecalcNotification(type: 'success' | 'error', text: string) {
  recalcNotification.value = { type, text };
  if (recalcTimer) clearTimeout(recalcTimer);
  recalcTimer = setTimeout(() => {
    recalcNotification.value = null;
  }, 6000);
}

async function recalculateAllRatings() {
  if (recalculating.value) return;
  recalculating.value = true;

  try {
    const res = await $fetch<{
      success: boolean;
      message: string;
      elapsed_ms: number;
      vps_synced?: boolean;
    }>('/api/admin/server/charts/recalculate', {
      method: 'POST',
    });

    showRecalcNotification(
      'success',
      `Berhasil menghitung ulang seluruh rating & player PTT (B50) dalam ${res.elapsed_ms}ms${res.vps_synced ? ' & tersinkron ke VPS' : ''}.`
    );
    await refresh();
  } catch (err: any) {
    showRecalcNotification(
      'error',
      err?.data?.statusMessage || err.message || 'Gagal menghitung ulang rating'
    );
  } finally {
    recalculating.value = false;
  }
}

// Songlist Entry Modal State
const viewingSonglistSong = ref<ServerSongItem | null>(null);
const songlistJsonText = ref<string>('');
const copiedJson = ref<boolean>(false);
const loadingSonglistEntry = ref<boolean>(false);
let copiedTimer: ReturnType<typeof setTimeout> | null = null;

async function openSonglistModal(song: ServerSongItem) {
  viewingSonglistSong.value = song;
  copiedJson.value = false;

  // Use preloaded rawJson if available
  if (song.rawJson) {
    songlistJsonText.value = JSON.stringify(song.rawJson, null, 2);
  } else {
    songlistJsonText.value = 'Loading songlist entry...';
  }

  // Fetch live entry from API to ensure it reflects any recent file updates
  loadingSonglistEntry.value = true;
  try {
    const res = await $fetch<{ success: boolean; formatted: string; entry: any }>(
      `/api/admin/server/charts/songlist-entry?song_id=${encodeURIComponent(song.id)}`
    );
    if (res.formatted) {
      songlistJsonText.value = res.formatted;
      song.rawJson = res.entry;
    }
  } catch (err: any) {
    if (!song.rawJson) {
      songlistJsonText.value = JSON.stringify({ error: err?.data?.statusMessage || err?.message || 'Failed to fetch entry' }, null, 2);
    }
  } finally {
    loadingSonglistEntry.value = false;
  }
}

async function copySonglistJson() {
  if (!songlistJsonText.value) return;
  try {
    await navigator.clipboard.writeText(songlistJsonText.value);
    copiedJson.value = true;
    if (copiedTimer) clearTimeout(copiedTimer);
    copiedTimer = setTimeout(() => {
      copiedJson.value = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy to clipboard', err);
  }
}

// Global Keyboard listener for Lightbox & Modal
function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    if (viewingSonglistSong.value) viewingSonglistSong.value = null;
    else if (showAuditModal.value) showAuditModal.value = false;
    else if (lightboxBg.value) lightboxBg.value = null;
    else if (editingAffSong.value) closeAffModal();
    else if (editingSong.value) editingSong.value = null;
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

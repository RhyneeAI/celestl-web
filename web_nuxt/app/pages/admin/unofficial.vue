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
              'flex w-full items-center gap-3 border-t border-[#0c0c22] px-4 py-2.5 text-left first:border-t-0 hover:bg-[#1e203a] transition-colors cursor-pointer',
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

            <!-- Difficulties Levels on Right -->
            <div class="flex flex-none items-center gap-1.5">
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
          <button
            type="button"
            @click="lightboxBg = artworkBackground(selected.jacket_full, selected.title)"
            class="mb-3.5 aspect-video w-full cursor-zoom-in rounded-2xl bg-cover bg-center shadow-lg border border-white/10 hover:brightness-105 transition-all overflow-hidden"
            :style="{ background: artworkBackground(selected.jacket_full, selected.title) }"
            title="Click to view full artwork"
          />

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
                  class="border-t border-[#0c0c22] hover:bg-[#1e203a]/50 transition-colors"
                >
                  <td :class="['px-2.5 py-2 font-bold font-mono', getDiffColor(d.difficulty)]">
                    {{ d.difficulty }}
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
                        @click="openAffModal(selected, d.ratingClass)"
                        class="rounded-lg bg-[#1e203a] hover:bg-[#3f3c68] px-2.5 py-1 text-xs font-bold text-[#acff82] border border-[#3f3c68]/40 transition-colors cursor-pointer shadow-sm flex items-center gap-1"
                        title="View & Edit chart .aff file"
                      >
                        <span>📝</span>
                        <span>Chart (.aff)</span>
                      </button>
                      <button
                        type="button"
                        @click="openEditModal(selected, d.ratingClass)"
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
                :disabled="savingAff || loadingAff"
                @click="saveChartAffFile"
                class="rounded-[11px] bg-[#acff82] px-4 py-2 text-[12.5px] font-bold text-[#0c0c22] hover:bg-[#acff82]/90 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <span>{{ savingAff ? 'Deploying to VPS…' : 'Save & Deploy to VPS' }}</span>
              </button>
            </div>
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
const lightboxBg = ref<string | null>(null);

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

async function saveChartAffFile() {
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
      },
    });

    affSaveSuccess.value = res.synced_vps
      ? 'Saved & Deployed to VPS celest-server!'
      : 'Saved locally (VPS sync pending)';
    await refresh();
  } catch (err: any) {
    affSaveError.value = err?.data?.statusMessage || err.message || 'Failed to save chart .aff';
  } finally {
    savingAff.value = false;
  }
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

// Global Keyboard listener for Lightbox & Modal
function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    if (lightboxBg.value) lightboxBg.value = null;
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

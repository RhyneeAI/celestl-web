<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-[#fffafa] font-brand">Private Server Scores & Leaderboard</h1>
        <p class="text-sm text-[#9a99a8]">
          Live player records from ArcaeaServerFork with ratings recalculated using Celestl engine (+0.2 clear bonus).
        </p>
      </div>

      <div class="flex items-center gap-3">
        <span class="text-xs text-[#9a99a8]">Total Records:</span>
        <span class="rounded-full bg-[#1a1d32] px-3 py-1 font-mono text-xs font-bold text-[#acff82] border border-[#16133e]">
          {{ allScores.length }}
        </span>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="rounded-3xl bg-[#1a1d32] p-5 border border-[#16133e] shadow-xl">
        <div class="text-xs text-[#9a99a8] uppercase tracking-wider font-semibold">Highest Recalculated Rating</div>
        <div class="mt-2 font-mono text-2xl font-black text-[#ffd76a]">
          {{ topScore ? Number(topScore.recalculatedRating).toFixed(3) : '0.000' }}
        </div>
        <div v-if="topScore" class="mt-1 text-xs text-[#6f6e80] truncate">
          {{ topScore.playerName }} · {{ topScore.songTitle }}
        </div>
      </div>

      <div class="rounded-3xl bg-[#1a1d32] p-5 border border-[#16133e] shadow-xl">
        <div class="text-xs text-[#9a99a8] uppercase tracking-wider font-semibold">Total Unique Players</div>
        <div class="mt-2 font-mono text-2xl font-black text-[#f768dd]">
          {{ uniquePlayersCount }}
        </div>
        <div class="mt-1 text-xs text-[#6f6e80]">
          Active on private server
        </div>
      </div>

      <div class="rounded-3xl bg-[#1a1d32] p-5 border border-[#16133e] shadow-xl">
        <div class="text-xs text-[#9a99a8] uppercase tracking-wider font-semibold">Pure Memory Plays</div>
        <div class="mt-2 font-mono text-2xl font-black text-[#03a8e6]">
          {{ pmCount }}
        </div>
        <div class="mt-1 text-xs text-[#6f6e80]">
          Score ≥ 10,000,000 (0 Far / 0 Lost)
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-col sm:flex-row gap-3">
      <input
        v-model="search"
        type="text"
        placeholder="Filter by player, player code, or song title..."
        class="w-full sm:max-w-md rounded-2xl bg-[#1a1d32] px-4 py-2.5 text-sm text-[#fffafa] placeholder-[#6f6e80] border border-[#3f3c68]/40 focus:border-[#f768dd] focus:outline-none transition-colors"
      />
      <select
        v-model="selectedDiff"
        class="rounded-2xl bg-[#1a1d32] px-4 py-2.5 text-sm text-[#fffafa] border border-[#3f3c68]/40 focus:border-[#f768dd] focus:outline-none"
      >
        <option value="">All Difficulties</option>
        <option value="PST">Past (PST)</option>
        <option value="PRS">Present (PRS)</option>
        <option value="FTR">Future (FTR)</option>
        <option value="BYD">Beyond (BYD)</option>
        <option value="ETR">Eternal (ETR)</option>
      </select>
    </div>

    <!-- Leaderboard Table -->
    <div class="rounded-3xl border border-[#16133e] bg-[#1a1d32] overflow-hidden shadow-2xl">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-[#0c0c22] border-b border-[#16133e] text-[#6f6e80] uppercase tracking-wider font-bold">
            <tr>
              <th class="py-3 px-4 w-12 text-center">#</th>
              <th class="py-3 px-4">Player</th>
              <th class="py-3 px-4">Song & Difficulty</th>
              <th class="py-3 px-4">Score & Grade</th>
              <th class="py-3 px-4">Lamp</th>
              <th class="py-3 px-4">Judges (P/F/L)</th>
              <th class="py-3 px-4 text-right">Recalculated Rating</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#16133e]/60">
            <tr
              v-for="(row, idx) in pagedScores"
              :key="row.userId + '-' + row.songId + '-' + row.ratingClass"
              class="hover:bg-[#1e203a] transition-colors"
            >
              <td class="py-3 px-4 text-center font-mono font-bold text-[#6f6e80]">
                {{ (page - 1) * perPage + idx + 1 }}
              </td>
              <td class="py-3 px-4">
                <div class="font-bold text-sm text-[#fffafa]">{{ row.playerName }}</div>
                <div class="font-mono text-[11px] text-[#9a99a8]">{{ row.playerCode || `ID ${row.userId}` }}</div>
              </td>
              <td class="py-3 px-4">
                <div class="font-semibold text-sm text-[#fffafa]">{{ row.songTitle }}</div>
                <div class="flex items-center gap-1.5 mt-0.5">
                  <span :class="['px-1.5 py-0.5 rounded text-[10px] font-bold font-mono', getDiffBg(row.ratingClass)]">
                    {{ row.difficulty }}
                  </span>
                  <span class="text-[11px] text-[#6f6e80] font-mono">c{{ Number(row.constant).toFixed(1) }}</span>
                </div>
              </td>
              <td class="py-3 px-4">
                <div class="font-mono font-extrabold text-sm text-[#ffd76a]">{{ row.scoreFormatted }}</div>
                <div class="mt-0.5">
                  <span class="px-1.5 py-0.2 rounded text-[10px] font-black bg-[#3f3c68]/40 text-[#fffafa]">
                    {{ row.grade }}
                  </span>
                </div>
              </td>
              <td class="py-3 px-4">
                <span
                  :class="[
                    'px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase tracking-wide',
                    getLampColor(row.lamp)
                  ]"
                >
                  {{ row.lamp.replace('_', ' ') }}
                </span>
              </td>
              <td class="py-3 px-4 font-mono text-[11px] text-[#9a99a8]">
                <span class="text-[#fffafa] font-bold">{{ row.pure }}</span> ({{ row.shinyPure }}) /
                <span class="text-[#ffd76a]">{{ row.far }}</span> /
                <span class="text-[#e14763]">{{ row.lost }}</span>
              </td>
              <td class="py-3 px-4 text-right">
                <div class="font-mono text-sm font-black text-[#acff82]">
                  {{ Number(row.recalculatedRating).toFixed(3) }}
                </div>
                <div v-if="row.lamp !== 'lost'" class="text-[10px] text-[#acff82]/80 font-mono">
                  +0.2 clear bonus
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between border-t border-[#16133e] px-4 py-3 text-xs text-[#9a99a8]">
        <span>Showing {{ pagedScores.length }} of {{ filteredScores.length }} scores</span>
        <div class="flex gap-1">
          <button
            type="button"
            :disabled="page <= 1"
            class="rounded-lg bg-[#0c0c22] px-3 py-1 font-semibold disabled:opacity-30 hover:bg-[#1e203a] transition-colors"
            @click="page--"
          >
            Previous
          </button>
          <span class="px-2 py-1 font-mono text-[#fffafa]">Page {{ page }} / {{ maxPage }}</span>
          <button
            type="button"
            :disabled="page >= maxPage"
            class="rounded-lg bg-[#0c0c22] px-3 py-1 font-semibold disabled:opacity-30 hover:bg-[#1e203a] transition-colors"
            @click="page++"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
});

const { data } = await useFetch('/api/admin/server/scores');
const allScores = computed(() => data.value?.scores || []);

const search = ref('');
const selectedDiff = ref('');
const page = ref(1);
const perPage = 25;

const topScore = computed(() => allScores.value[0] || null);

const uniquePlayersCount = computed(() => {
  const set = new Set<number>();
  for (const s of allScores.value) {
    set.add(s.userId);
  }
  return set.size;
});

const pmCount = computed(() => {
  return allScores.value.filter((s: any) => s.lamp === 'pure_memory').length;
});

const filteredScores = computed(() => {
  let list = allScores.value;
  if (selectedDiff.value) {
    list = list.filter((s: any) => s.difficulty === selectedDiff.value);
  }
  if (search.value.trim()) {
    const q = search.value.trim().toLowerCase();
    list = list.filter((s: any) =>
      s.playerName.toLowerCase().includes(q) ||
      s.playerCode.toLowerCase().includes(q) ||
      s.songTitle.toLowerCase().includes(q) ||
      s.songId.toLowerCase().includes(q)
    );
  }
  return list;
});

const maxPage = computed(() => Math.max(1, Math.ceil(filteredScores.value.length / perPage)));

const pagedScores = computed(() => {
  const start = (page.value - 1) * perPage;
  return filteredScores.value.slice(start, start + perPage);
});

function getDiffBg(rc: number) {
  switch (rc) {
    case 0: return 'bg-[#03a8e6] text-[#0c0c22]';
    case 1: return 'bg-[#acff82] text-[#0c0c22]';
    case 2: return 'bg-[#f768dd] text-[#0c0c22]';
    case 3: return 'bg-[#e14763] text-[#fffafa]';
    case 4: return 'bg-[#8975a8] text-[#fffafa]';
    case 5: return 'bg-[#7474dc] text-[#fffafa]';
    default: return 'bg-gray-500 text-white';
  }
}

function getLampColor(lamp: string) {
  switch (lamp) {
    case 'pure_memory':
      return 'bg-[#ffd76a]/20 text-[#ffd76a] border border-[#ffd76a]/40';
    case 'full_recall':
      return 'bg-[#03a8e6]/20 text-[#03a8e6] border border-[#03a8e6]/40';
    case 'normal_clear':
      return 'bg-[#acff82]/20 text-[#acff82] border border-[#acff82]/40';
    case 'easy_clear':
      return 'bg-[#8975a8]/20 text-[#8975a8] border border-[#8975a8]/40';
    case 'hard_clear':
      return 'bg-[#f768dd]/20 text-[#f768dd] border border-[#f768dd]/40';
    default:
      return 'bg-[#e14763]/20 text-[#e14763] border border-[#e14763]/40';
  }
}
</script>


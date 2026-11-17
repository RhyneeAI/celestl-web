<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-[#fffafa] font-brand">In-Game Store & Economy Manager</h1>
        <p class="text-sm text-[#9a99a8]">Inspect and modify item pricing (Memories) and promotional sales on ArcaeaServerFork.</p>
      </div>

      <div class="flex items-center gap-2">
        <span class="rounded-xl bg-[#16133e] px-3 py-1.5 text-xs font-mono text-[#ffd76a] border border-[#ffd76a]/30">
          {{ items.length }} Store Items Registered
        </span>
      </div>
    </div>

    <!-- Filter & Search -->
    <div class="relative">
      <input
        v-model="search"
        type="text"
        placeholder="Search purchase items by name or pack ID..."
        class="w-full rounded-2xl bg-[#1a1d32] px-4 py-2.5 text-sm text-[#fffafa] placeholder-[#6f6e80] border border-[#3f3c68]/40 focus:border-[#f768dd] focus:outline-none transition-colors"
      />
    </div>

    <!-- Table of Purchases -->
    <div class="rounded-3xl bg-[#1a1d32] border border-[#16133e] overflow-hidden shadow-xl">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-[#0c0c22] border-b border-[#16133e] text-[#6f6e80] uppercase tracking-wider font-bold">
            <tr>
              <th class="py-3 px-4">Purchase Name</th>
              <th class="py-3 px-4">Active Price</th>
              <th class="py-3 px-4">Original Price</th>
              <th class="py-3 px-4">Discount Status</th>
              <th class="py-3 px-4">Discount Reason</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#16133e]/60">
            <tr
              v-for="item in pagedItems"
              :key="item.purchase_name"
              class="hover:bg-[#1e203a] transition-colors"
            >
              <td class="py-3 px-4 font-mono font-bold text-[#fffafa]">{{ item.purchase_name }}</td>
              <td class="py-3 px-4">
                <span class="font-mono text-sm font-extrabold text-[#ffd76a]">
                  {{ item.price }} Memories
                </span>
              </td>
              <td class="py-3 px-4 font-mono text-[#9a99a8]">
                {{ item.orig_price }} Memories
              </td>
              <td class="py-3 px-4">
                <span
                  :class="[
                    'px-2 py-0.5 rounded-full text-[10px] font-bold font-mono',
                    item.price < item.orig_price ? 'bg-[#acff82]/20 text-[#acff82]' : 'bg-[#3f3c68]/30 text-[#9a99a8]'
                  ]"
                >
                  {{ item.price < item.orig_price ? 'ON SALE' : 'NORMAL' }}
                </span>
              </td>
              <td class="py-3 px-4 text-[#9a99a8] italic">
                {{ item.discount_reason || '—' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between border-t border-[#16133e] px-4 py-3 text-xs text-[#9a99a8]">
        <span>Showing {{ pagedItems.length }} of {{ filteredItems.length }} items</span>
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
  middleware: ['admin']
});

const { data } = await useFetch('/api/admin/server/store');
const items = computed(() => data.value?.items || []);

const search = ref('');
const page = ref(1);
const perPage = 25;

const filteredItems = computed(() => {
  if (!search.value.trim()) return items.value;
  const q = search.value.trim().toLowerCase();
  return items.value.filter((i: any) =>
    i.purchase_name.toLowerCase().includes(q)
  );
});

const maxPage = computed(() => Math.max(1, Math.ceil(filteredItems.value.length / perPage)));

const pagedItems = computed(() => {
  const start = (page.value - 1) * perPage;
  return filteredItems.value.slice(start, start + perPage);
});
</script>

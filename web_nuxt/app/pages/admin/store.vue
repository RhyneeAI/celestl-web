<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-[#fffafa] font-brand">Server Store & Memories Pricing</h1>
        <p class="text-sm text-[#9a99a8]">Inspect and modify pack/item prices, discount intervals, and active sales on the server.</p>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs text-[#9a99a8]">Total Store Items:</span>
        <span class="rounded-full bg-[#1a1d32] px-3 py-1 font-mono text-xs font-bold text-[#ffd76a] border border-[#16133e]">
          {{ items.length }}
        </span>
      </div>
    </div>

    <!-- Search filter -->
    <div class="flex flex-col sm:flex-row gap-3">
      <input
        v-model="search"
        type="text"
        placeholder="Filter by purchase name (e.g. pack_ephemeral)..."
        class="w-full sm:max-w-md rounded-2xl bg-[#1a1d32] px-4 py-2.5 text-sm text-[#fffafa] placeholder-[#6f6e80] border border-[#3f3c68]/40 focus:border-[#f768dd] focus:outline-none transition-colors"
      />
    </div>

    <!-- Store Table -->
    <div class="rounded-3xl border border-[#16133e] bg-[#1a1d32] overflow-hidden shadow-2xl">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-[#0c0c22] border-b border-[#16133e] text-[#6f6e80] uppercase tracking-wider font-bold">
            <tr>
              <th class="py-3 px-4">Purchase Name</th>
              <th class="py-3 px-4">Active Price</th>
              <th class="py-3 px-4">Original Price</th>
              <th class="py-3 px-4">Discount Status</th>
              <th class="py-3 px-4">Discount Reason</th>
              <th class="py-3 px-4 text-right">Actions</th>
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
              <td class="py-3 px-4 text-right">
                <button
                  @click="openEditModal(item)"
                  class="rounded-lg bg-[#3f3c68]/40 hover:bg-[#f768dd] hover:text-[#0c0c22] px-3 py-1 font-semibold text-[#fffafa] transition-colors"
                >
                  Edit
                </button>
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

    <!-- Edit Modal -->
    <div
      v-if="editingItem"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    >
      <div class="w-full max-w-md rounded-3xl bg-[#1a1d32] p-6 border border-[#3f3c68]/40 shadow-2xl space-y-4">
        <h2 class="text-lg font-bold text-[#fffafa] font-brand">Edit Store Pricing</h2>
        <div class="font-mono text-xs text-[#f768dd]">{{ editingItem.purchase_name }}</div>

        <div class="space-y-3 text-xs">
          <div>
            <label class="block text-[#9a99a8] mb-1 font-medium">Active Price (Memories)</label>
            <input
              v-model.number="editForm.price"
              type="number"
              min="0"
              class="w-full rounded-xl bg-[#0c0c22] px-3 py-2 text-sm text-[#ffd76a] font-mono border border-[#3f3c68]/40 focus:outline-none focus:border-[#f768dd]"
            />
          </div>
          <div>
            <label class="block text-[#9a99a8] mb-1 font-medium">Original Price (Memories)</label>
            <input
              v-model.number="editForm.orig_price"
              type="number"
              min="0"
              class="w-full rounded-xl bg-[#0c0c22] px-3 py-2 text-sm text-[#fffafa] font-mono border border-[#3f3c68]/40 focus:outline-none focus:border-[#f768dd]"
            />
          </div>
          <div>
            <label class="block text-[#9a99a8] mb-1 font-medium">Discount Reason</label>
            <input
              v-model="editForm.discount_reason"
              type="text"
              placeholder="e.g. Anniversary Special Sale"
              class="w-full rounded-xl bg-[#0c0c22] px-3 py-2 text-sm text-[#fffafa] border border-[#3f3c68]/40 focus:outline-none focus:border-[#f768dd]"
            />
          </div>
        </div>

        <div v-if="saveError" class="text-xs text-red-400">
          {{ saveError }}
        </div>

        <div class="flex justify-end gap-2 pt-2 border-t border-[#16133e]">
          <button
            @click="editingItem = null"
            class="rounded-xl bg-[#0c0c22] px-4 py-2 text-xs font-semibold text-[#9a99a8] hover:bg-[#1e203a]"
          >
            Cancel
          </button>
          <button
            @click="saveItemPrice"
            :disabled="saving"
            class="rounded-xl bg-[#f768dd] text-[#0c0c22] px-4 py-2 text-xs font-bold hover:opacity-90 disabled:opacity-50"
          >
            {{ saving ? 'Saving…' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';

definePageMeta({
  layout: 'admin',
  middleware: ['admin']
});

const { data, refresh } = await useFetch('/api/admin/server/store');
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

// Edit modal state
const editingItem = ref<any | null>(null);
const saving = ref(false);
const saveError = ref('');
const editForm = reactive({
  purchase_name: '',
  price: 0,
  orig_price: 0,
  discount_reason: '',
});

function openEditModal(item: any) {
  editingItem.value = item;
  saveError.value = '';
  editForm.purchase_name = item.purchase_name;
  editForm.price = item.price;
  editForm.orig_price = item.orig_price;
  editForm.discount_reason = item.discount_reason || '';
}

async function saveItemPrice() {
  saving.value = true;
  saveError.value = '';

  try {
    await $fetch('/api/admin/server/store/update', {
      method: 'POST',
      body: {
        purchase_name: editForm.purchase_name,
        price: editForm.price,
        orig_price: editForm.orig_price,
        discount_reason: editForm.discount_reason,
      },
    });

    editingItem.value = null;
    await refresh();
  } catch (err: any) {
    saveError.value = err?.data?.statusMessage || err.message || 'Failed to update price';
  } finally {
    saving.value = false;
  }
}
</script>

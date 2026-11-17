<template>
  <div class="space-y-6">
    <!-- Page Header & Counter Badges -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-[#fffafa] font-brand">Server Store & Memories Pricing</h1>
        <p class="text-sm text-[#9a99a8]">Inspect in-game shop items, packs, and song purchase listings with included purchase items.</p>
      </div>

      <!-- Quick KPI Chips -->
      <div class="flex flex-wrap items-center gap-2">
        <span class="rounded-xl bg-[#1a1d32] px-3 py-1.5 text-xs font-semibold text-[#9a99a8] border border-[#16133e] flex items-center gap-1.5">
          <span>Total:</span>
          <b class="text-[#ffd76a] font-mono">{{ counts.all }}</b>
        </span>
        <span class="rounded-xl bg-[#1a1d32] px-3 py-1.5 text-xs font-semibold text-[#9a99a8] border border-[#16133e] flex items-center gap-1.5">
          <span>📦 Packs:</span>
          <b class="text-[#a575ff] font-mono">{{ counts.packs }}</b>
        </span>
        <span class="rounded-xl bg-[#1a1d32] px-3 py-1.5 text-xs font-semibold text-[#9a99a8] border border-[#16133e] flex items-center gap-1.5">
          <span>🎵 Singles:</span>
          <b class="text-[#03a8e6] font-mono">{{ counts.singles }}</b>
        </span>
        <span v-if="counts.onSale > 0" class="rounded-xl bg-[#acff82]/10 px-3 py-1.5 text-xs font-semibold text-[#acff82] border border-[#acff82]/30 flex items-center gap-1.5">
          <span>🔥 On Sale:</span>
          <b class="font-mono">{{ counts.onSale }}</b>
        </span>
      </div>
    </div>

    <!-- Filter Tabs & Search / Sort Toolbar -->
    <div class="flex flex-col gap-3.5">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <!-- Category Tab Buttons -->
        <div class="flex flex-wrap items-center gap-1.5 rounded-2xl bg-[#1a1d32] p-1.5 border border-[#16133e]">
          <button
            v-for="tab in categoryTabs"
            :key="tab.id"
            type="button"
            @click="activeCategory = tab.id; page = 1"
            :class="[
              'rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5',
              activeCategory === tab.id
                ? 'bg-[#3f3c68] text-[#fffafa] shadow'
                : 'text-[#9a99a8] hover:text-[#fffafa] hover:bg-[#1e203a]'
            ]"
          >
            <span>{{ tab.label }}</span>
            <span
              :class="[
                'px-1.5 py-0.2 rounded-full text-[10.5px] font-mono font-bold',
                activeCategory === tab.id ? 'bg-[#0c0c22]/50 text-[#ffd76a]' : 'bg-[#16133e] text-[#6f6e80]'
              ]"
            >
              {{ tab.count }}
            </span>
          </button>
        </div>

        <!-- Sort Select -->
        <div class="flex items-center gap-2">
          <span class="text-xs text-[#6f6e80] font-semibold hidden sm:inline">Sort by:</span>
          <select
            v-model="sortBy"
            class="rounded-xl bg-[#1a1d32] px-3 py-2 text-xs font-semibold text-[#fffafa] border border-[#3f3c68]/40 focus:outline-none focus:ring-1 focus:ring-[#f768dd] cursor-pointer"
          >
            <option value="price_desc">Price (Highest First)</option>
            <option value="price_asc">Price (Lowest First)</option>
            <option value="title">Title (A–Z)</option>
            <option value="sku">SKU Name (A–Z)</option>
            <option value="discount">Highest Discount</option>
          </select>
        </div>
      </div>

      <!-- Search Input -->
      <div class="relative">
        <input
          v-model="search"
          type="search"
          placeholder="Search by title, artist, sku (purchase_name), or unlocked item…"
          class="w-full rounded-2xl bg-[#1a1d32] px-4 py-2.5 text-sm text-[#fffafa] placeholder-[#6f6e80] border border-[#3f3c68]/40 focus:border-[#f768dd] focus:outline-none transition-colors"
        />
        <button
          v-if="search"
          type="button"
          @click="search = ''; page = 1"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#9a99a8] hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="filteredItems.length === 0"
      class="rounded-3xl border border-[#16133e] bg-[#1a1d32] p-12 text-center text-[#9a99a8]"
    >
      <div class="text-3xl mb-2">🔍</div>
      <b class="text-base text-[#fffafa] font-brand block mb-1">No store items match your criteria</b>
      <p class="text-xs text-[#6f6e80]">Try searching with a different keyword or selecting another category tab.</p>
    </div>

    <!-- Modern Card Catalog Grid -->
    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      <div
        v-for="item in pagedItems"
        :key="item.purchase_name"
        class="group flex flex-col justify-between rounded-2xl bg-[#1a1d32] border border-[#16133e] hover:border-[#3f3c68]/80 transition-all shadow-xl overflow-hidden"
      >
        <!-- Card Artwork Banner with Floating Badges -->
        <div class="relative w-full aspect-[16/10] bg-[#101222] overflow-hidden flex items-center justify-center">
          <img
            v-if="item.jacket_url"
            :src="item.jacket_url"
            :alt="item.title"
            loading="lazy"
            :class="[
              'h-full w-full transition-transform duration-300 group-hover:scale-105',
              item.category === 'pack' ? 'object-cover object-top' : 'object-cover object-center'
            ]"
            @error="onImageError($event, item)"
          />
          <!-- Fallback Gradient Tile if Image Missing -->
          <div
            v-else
            class="h-full w-full flex items-center justify-center font-brand font-bold text-lg text-white/70"
            :style="{ background: fallbackGradient(item.purchase_name) }"
          >
            {{ item.title.slice(0, 3).toUpperCase() }}
          </div>

          <!-- Top-Left Category Badge -->
          <span
            :class="[
              'absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold shadow-md border backdrop-blur-md',
              item.category === 'pack'
                ? 'bg-[#7d5fff]/80 text-white border-[#7d5fff]'
                : 'bg-[#03a8e6]/80 text-white border-[#03a8e6]'
            ]"
          >
            {{ item.category === 'pack' ? '📦 Song Pack' : '🎵 Single Song' }}
          </span>

          <!-- Top-Right Sale Status Badge -->
          <span
            v-if="item.is_on_sale"
            class="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10.5px] font-extrabold font-mono bg-[#acff82] text-[#0c0c22] shadow-md"
          >
            🔥 -{{ item.discount_percent }}%
          </span>
        </div>

        <!-- Card Body Content -->
        <div class="p-3.5 flex-1 flex flex-col justify-between space-y-3">
          <div>
            <!-- Title & Artist -->
            <h3 class="text-sm font-bold text-[#fffafa] font-brand leading-snug line-clamp-1" :title="item.title">
              {{ item.title }}
            </h3>
            <div class="text-xs text-[#9a99a8] line-clamp-1 mt-0.5" :title="item.artist || item.purchase_name">
              {{ item.artist || (item.category === 'pack' ? 'Arcaea Song Pack' : 'Custom Song') }}
            </div>

            <!-- Monospace SKU Name -->
            <div class="mt-1 flex items-center gap-1 font-mono text-[10.5px] text-[#6f6e80]">
              <span>sku:</span>
              <span class="text-[#f768dd]">{{ item.purchase_name }}</span>
            </div>
          </div>

          <!-- Included Purchase Items (purchase_item detail) -->
          <div class="rounded-xl bg-[#0c0c22]/70 p-2.5 border border-[#16133e] space-y-1.5 text-xs">
            <span class="block text-[10px] uppercase font-bold tracking-wider text-[#6f6e80]">
              What's Included ({{ item.items.length }} {{ item.items.length === 1 ? 'item' : 'items' }}):
            </span>
            <div class="flex flex-col gap-1">
              <div
                v-for="sub in item.items"
                :key="sub.item_id + sub.type"
                class="flex items-center gap-1.5 text-[11px] leading-tight text-[#fffafa]"
              >
                <!-- Type Icon -->
                <span v-if="sub.type === 'pack'" class="text-[#a575ff]">📦</span>
                <span v-else-if="sub.type === 'character'" class="text-[#f768dd]">👤</span>
                <span v-else-if="sub.type === 'core'" class="text-[#ffd76a]">💎</span>
                <span v-else class="text-[#03a8e6]">🎵</span>

                <span class="truncate flex-1 font-medium" :title="sub.name">
                  {{ sub.name }}
                </span>

                <span v-if="sub.type === 'character'" class="text-[10px] text-[#f768dd] font-bold">
                  Partner
                </span>
                <span v-else-if="sub.type === 'core'" class="text-[10px] text-[#ffd76a] font-mono">
                  +{{ sub.amount }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Card Footer: Price & Edit Action -->
        <div class="flex items-center justify-between border-t border-[#16133e] px-3.5 py-2.5 bg-[#14172a]">
          <!-- Pricing -->
          <div class="flex flex-col">
            <div class="flex items-baseline gap-1.5">
              <span class="font-mono text-sm font-extrabold text-[#ffd76a]">
                {{ item.price }}
              </span>
              <span class="text-[10.5px] text-[#ffd76a]/80 font-bold">Memories</span>

              <!-- Strikethrough if discounted -->
              <span
                v-if="item.is_on_sale"
                class="font-mono text-xs text-[#6f6e80] line-through"
              >
                {{ item.orig_price }}
              </span>
            </div>
            <span v-if="item.discount_reason" class="text-[10px] text-[#acff82] italic line-clamp-1">
              {{ item.discount_reason }}
            </span>
          </div>

          <!-- Edit Button -->
          <button
            type="button"
            @click="openEditModal(item)"
            class="rounded-xl bg-[#3f3c68]/50 hover:bg-[#f768dd] hover:text-[#0c0c22] px-3 py-1.5 text-xs font-bold text-[#fffafa] transition-colors cursor-pointer"
          >
            Edit Price
          </button>
        </div>
      </div>
    </div>

    <!-- Pagination Controls -->
    <div
      v-if="filteredItems.length > 0"
      class="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl bg-[#1a1d32] border border-[#16133e] px-4 py-3 text-xs text-[#9a99a8]"
    >
      <span>
        Showing <b class="text-[#fffafa]">{{ (page - 1) * perPage + 1 }}</b>–<b class="text-[#fffafa]">{{ Math.min(page * perPage, filteredItems.length) }}</b> of <b class="text-[#fffafa]">{{ filteredItems.length }}</b> items
      </span>
      <div class="flex items-center gap-1.5">
        <button
          type="button"
          :disabled="page <= 1"
          class="rounded-xl bg-[#0c0c22] px-3 py-1.5 font-semibold text-[#fffafa] disabled:opacity-30 hover:bg-[#1e203a] transition-colors cursor-pointer disabled:cursor-not-allowed"
          @click="page--"
        >
          Previous
        </button>
        <span class="px-2.5 py-1 font-mono text-xs font-bold text-[#fffafa]">
          Page {{ page }} / {{ maxPage }}
        </span>
        <button
          type="button"
          :disabled="page >= maxPage"
          class="rounded-xl bg-[#0c0c22] px-3 py-1.5 font-semibold text-[#fffafa] disabled:opacity-30 hover:bg-[#1e203a] transition-colors cursor-pointer disabled:cursor-not-allowed"
          @click="page++"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Edit Store Pricing Modal -->
    <div
      v-if="editingItem"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
    >
      <div class="w-full max-w-md rounded-3xl bg-[#1a1d32] p-6 border border-[#3f3c68]/50 shadow-2xl space-y-4">
        <div class="flex items-start justify-between gap-2">
          <div>
            <h2 class="text-lg font-bold text-[#fffafa] font-brand">Edit Store Pricing</h2>
            <p class="text-xs text-[#9a99a8]">{{ editingItem.title }}</p>
          </div>
          <span class="font-mono text-xs text-[#f768dd] bg-[#16133e] px-2 py-0.5 rounded-lg border border-[#3f3c68]/40">
            {{ editingItem.purchase_name }}
          </span>
        </div>

        <!-- Included Items Summary in Modal -->
        <div class="rounded-xl bg-[#0c0c22] p-3 border border-[#16133e] space-y-1 text-xs">
          <span class="block text-[10.5px] uppercase font-bold text-[#6f6e80]">Included Items (purchase_item):</span>
          <div class="flex flex-wrap gap-1.5 pt-0.5">
            <span
              v-for="sub in editingItem.items"
              :key="sub.item_id + sub.type"
              class="rounded-lg bg-[#16133e] px-2 py-0.5 text-[11px] font-medium text-[#fffafa] border border-[#3f3c68]/40"
            >
              {{ sub.name }} ({{ sub.type }})
            </span>
          </div>
        </div>

        <!-- Edit Form -->
        <div class="space-y-3 text-xs">
          <div>
            <label class="block text-[#9a99a8] mb-1 font-semibold">Active Price (Memories)</label>
            <input
              v-model.number="editForm.price"
              type="number"
              min="0"
              class="w-full rounded-xl bg-[#0c0c22] px-3.5 py-2 text-sm text-[#ffd76a] font-mono font-bold border border-[#3f3c68]/40 focus:outline-none focus:border-[#f768dd]"
            />
          </div>

          <div>
            <label class="block text-[#9a99a8] mb-1 font-semibold">Original Price (Memories)</label>
            <input
              v-model.number="editForm.orig_price"
              type="number"
              min="0"
              class="w-full rounded-xl bg-[#0c0c22] px-3.5 py-2 text-sm text-[#fffafa] font-mono border border-[#3f3c68]/40 focus:outline-none focus:border-[#f768dd]"
            />
          </div>

          <div>
            <label class="block text-[#9a99a8] mb-1 font-semibold">Discount Reason (Optional)</label>
            <input
              v-model="editForm.discount_reason"
              type="text"
              placeholder="e.g. Anniversary Special Sale, anni5tix"
              class="w-full rounded-xl bg-[#0c0c22] px-3.5 py-2 text-sm text-[#fffafa] border border-[#3f3c68]/40 focus:outline-none focus:border-[#f768dd]"
            />
          </div>

          <div class="rounded-xl bg-[#101222] p-2.5 border border-[#3f3c68]/30 text-xs text-[#acff82] flex items-center gap-1.5">
            <span>⚡</span>
            <span>Otomatis disinkronkan ke database lokal & server VPS (celest-server).</span>
          </div>
        </div>

        <div v-if="saveError" class="text-xs text-[#e14763] font-semibold">
          {{ saveError }}
        </div>

        <!-- Modal Actions -->
        <div class="flex justify-end gap-2 pt-2 border-t border-[#16133e]">
          <button
            type="button"
            @click="editingItem = null"
            class="rounded-xl bg-[#0c0c22] px-4 py-2 text-xs font-semibold text-[#9a99a8] hover:bg-[#1e203a] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="saveItemPrice"
            :disabled="saving"
            class="rounded-xl bg-[#f768dd] text-[#0c0c22] px-4 py-2 text-xs font-bold hover:opacity-90 disabled:opacity-50 cursor-pointer"
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
  middleware: 'admin',
});

interface PurchaseDetailItem {
  item_id: string;
  type: string;
  amount: number;
  name: string;
}

interface StoreItemPayload {
  purchase_name: string;
  title: string;
  artist?: string;
  category: 'pack' | 'single' | 'other';
  price: number;
  orig_price: number;
  discount_from: number;
  discount_to: number;
  discount_reason: string | null;
  is_on_sale: boolean;
  discount_percent: number;
  jacket_url?: string;
  items: PurchaseDetailItem[];
}

const { data, refresh } = await useFetch<{
  items: StoreItemPayload[];
  total: number;
  counts: { all: number; packs: number; singles: number; onSale: number };
}>('/api/admin/server/store');

const items = computed(() => data.value?.items || []);
const counts = computed(() => data.value?.counts || { all: 0, packs: 0, singles: 0, onSale: 0 });

// Filters & Search
const activeCategory = ref<'all' | 'pack' | 'single' | 'on_sale'>('all');
const search = ref('');
const sortBy = ref<'price_desc' | 'price_asc' | 'title' | 'sku' | 'discount'>('price_desc');
const page = ref(1);
const perPage = 24;

const categoryTabs = computed(() => [
  { id: 'all' as const, label: 'All Items', count: counts.value.all },
  { id: 'pack' as const, label: '📦 Song Packs', count: counts.value.packs },
  { id: 'single' as const, label: '🎵 Single Songs', count: counts.value.singles },
  { id: 'on_sale' as const, label: '🔥 On Sale', count: counts.value.onSale },
]);

const filteredItems = computed(() => {
  let list = items.value;

  // Category filter
  if (activeCategory.value === 'pack') {
    list = list.filter((i) => i.category === 'pack');
  } else if (activeCategory.value === 'single') {
    list = list.filter((i) => i.category === 'single');
  } else if (activeCategory.value === 'on_sale') {
    list = list.filter((i) => i.is_on_sale);
  }

  // Search filter
  const q = search.value.trim().toLowerCase();
  if (q) {
    list = list.filter((i) => {
      const matchTitle = i.title.toLowerCase().includes(q);
      const matchSku = i.purchase_name.toLowerCase().includes(q);
      const matchArtist = (i.artist || '').toLowerCase().includes(q);
      const matchSub = i.items.some((sub) =>
        sub.name.toLowerCase().includes(q) || sub.item_id.toLowerCase().includes(q)
      );
      return matchTitle || matchSku || matchArtist || matchSub;
    });
  }

  // Sort
  const sorted = [...list];
  if (sortBy.value === 'price_desc') {
    sorted.sort((a, b) => b.price - a.price || a.title.localeCompare(b.title));
  } else if (sortBy.value === 'price_asc') {
    sorted.sort((a, b) => a.price - b.price || a.title.localeCompare(b.title));
  } else if (sortBy.value === 'title') {
    sorted.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy.value === 'sku') {
    sorted.sort((a, b) => a.purchase_name.localeCompare(b.purchase_name));
  } else if (sortBy.value === 'discount') {
    sorted.sort((a, b) => b.discount_percent - a.discount_percent || b.price - a.price);
  }

  return sorted;
});

const maxPage = computed(() => Math.max(1, Math.ceil(filteredItems.value.length / perPage)));

const pagedItems = computed(() => {
  const start = (page.value - 1) * perPage;
  return filteredItems.value.slice(start, start + perPage);
});

// Image fallback handling
function onImageError(event: Event, item: StoreItemPayload) {
  const target = event.target as HTMLImageElement;
  if (target) {
    target.style.display = 'none';
  }
}

function fallbackGradient(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h1 = Math.abs(hash % 360);
  const h2 = (h1 + 60) % 360;
  return `linear-gradient(135deg, hsl(${h1}, 70%, 35%), hsl(${h2}, 80%, 20%))`;
}

// Edit Modal state
const editingItem = ref<StoreItemPayload | null>(null);
const saving = ref(false);
const saveError = ref('');
const editForm = reactive({
  purchase_name: '',
  price: 0,
  orig_price: 0,
  discount_reason: '',
});

function openEditModal(item: StoreItemPayload) {
  editingItem.value = item;
  saveError.value = '';
  editForm.purchase_name = item.purchase_name;
  editForm.price = item.price;
  editForm.orig_price = item.orig_price;
  editForm.discount_reason = item.discount_reason || '';
}

async function saveItemPrice() {
  if (!editingItem.value) return;
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
    saveError.value = err?.data?.statusMessage || err.message || 'Failed to update store pricing';
  } finally {
    saving.value = false;
  }
}
</script>

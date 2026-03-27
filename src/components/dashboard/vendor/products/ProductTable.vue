<template>
  <div class="overflow-hidden rounded-[1.75rem] border border-slate-200/70 bg-white/90 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.18)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
    <Transition name="slide-down">
      <div
        v-if="selectedIds.length > 0"
        class="flex items-center justify-between gap-4 border-b border-white/10 bg-secondary px-4 py-4"
      >
        <span class="text-xs font-bold uppercase tracking-[0.2em] text-white/90">
          {{ t('common.items_selected', { count: selectedIds.length }) }}
        </span>
        <div class="flex gap-2">
          <button
            @click="emit('bulkDelete', selectedIds)"
            class="rounded-xl bg-rose-500/20 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-rose-100 transition hover:bg-rose-500/30"
          >
            {{ t('common.delete') }}
          </button>
          <button
            @click="selectedIds = []"
            class="rounded-xl bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition hover:bg-white/15"
          >
            {{ t('common.cancel') }}
          </button>
        </div>
      </div>
    </Transition>

    <div v-if="loading" class="space-y-4 p-4 md:p-6">
      <div
        v-for="index in 4"
        :key="index"
        class="animate-pulse rounded-[1.5rem] border border-slate-200/70 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-900/60"
      >
        <div class="flex items-start gap-4">
          <div class="h-16 w-16 rounded-2xl bg-slate-200 dark:bg-slate-800"></div>
          <div class="flex-1 space-y-3">
            <div class="h-4 w-40 rounded-full bg-slate-200 dark:bg-slate-800"></div>
            <div class="h-3 w-28 rounded-full bg-slate-200 dark:bg-slate-800"></div>
            <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div class="h-10 rounded-2xl bg-slate-200 dark:bg-slate-800"></div>
              <div class="h-10 rounded-2xl bg-slate-200 dark:bg-slate-800"></div>
              <div class="h-10 rounded-2xl bg-slate-200 dark:bg-slate-800"></div>
              <div class="h-10 rounded-2xl bg-slate-200 dark:bg-slate-800"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="products.length" class="font-plex">
      <div class="divide-y divide-slate-100 md:hidden dark:divide-slate-800">
        <article
          v-for="product in products"
          :key="product.id"
          class="space-y-4 p-4"
        >
          <div class="flex items-start gap-3">
            <label class="mt-2 shrink-0">
              <input
                v-model="selectedIds"
                :value="product.id"
                type="checkbox"
                class="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/30"
              />
            </label>

            <div class="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
              <img
                v-if="productImage(product)"
                :src="productImage(product)"
                :alt="productDisplayName(product)"
                class="h-full w-full object-cover"
                @error="markImageBroken(product)"
              />
              <div v-else class="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
                <div class="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200/70 bg-white/80 text-slate-500 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300">
                  <ImageIcon class="h-5 w-5" />
                </div>
              </div>
            </div>

            <div class="min-w-0 flex-1">
              <div class="flex items-start justify-between gap-3">
                <div class="space-y-1">
                  <h3 class="line-clamp-2 text-sm font-bold text-secondary dark:text-slate-100">
                    {{ productDisplayName(product) }}
                  </h3>
                  <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                    {{ getCategoryName(product.category_id) }}
                  </p>
                </div>
                <div :class="statusPill(productStatus(product)).container">
                  <span :class="statusPill(productStatus(product)).dot"></span>
                  {{ lifecycleLabel(productStatus(product)) }}
                </div>
              </div>

              <div
                v-if="productStatus(product) === 'REJECTED' && product.rejection_reason"
                class="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200"
              >
                {{ product.rejection_reason }}
              </div>
            </div>
          </div>

            <div class="grid grid-cols-2 gap-3">
            <div class="rounded-2xl bg-slate-50 px-3 py-3 dark:bg-slate-800/80">
              <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{{ tableLabel('price', t('products.price')) }}</p>
              <p class="mt-1 text-sm font-bold text-secondary dark:text-slate-100">
                {{ priceText(product) }}
              </p>
            </div>
            <div class="rounded-2xl bg-slate-50 px-3 py-3 dark:bg-slate-800/80">
              <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{{ t('products.moq') }}</p>
              <p class="mt-1 text-sm font-bold text-secondary dark:text-slate-100">
                {{ product.min_order_quantity || product.moq || 1 }}
              </p>
            </div>
            <div class="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-3 dark:bg-slate-800/80" :title="tableLabel('views', 'Views')">
              <Eye class="h-4 w-4 text-primary" />
              <p class="text-sm font-bold text-secondary dark:text-slate-100">
                {{ product.views_count || 0 }}
              </p>
            </div>
            <div class="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-3 dark:bg-slate-800/80" :title="tableLabel('inquiries', 'Inquiries')">
              <MessageCircle class="h-4 w-4 text-primary" />
              <p class="text-sm font-bold text-secondary dark:text-slate-100">
                {{ product.inquiries_count || 0 }}
              </p>
            </div>
            </div>

          <div class="rounded-2xl bg-slate-50 px-3 py-3 dark:bg-slate-800/80">
            <div class="flex items-center justify-between gap-3">
              <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{{ tableLabel('stock', locale === 'ar' ? 'المخزون' : 'Stock') }}</p>
              <span :class="stockBadge(product).container">
                {{ stockBadge(product).label }}
              </span>
            </div>
            <p class="mt-2 text-sm font-bold text-secondary dark:text-slate-100">
              {{ productStock(product) }}
            </p>
          </div>

          <div class="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/80 px-3 py-3 dark:border-slate-800 dark:bg-slate-900/60">
            <div class="flex items-center gap-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              <span
                v-if="product.quality_score"
                class="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
              >
                Q {{ product.quality_score }}%
              </span>
              <span
                v-if="product.is_edited"
                class="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
              >
                {{ lifecycleLabel('EDITED') }}
              </span>
            </div>

            <div class="flex items-center gap-1">
              <button
                @click="emit('viewHistory', product)"
                class="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-primary/10 hover:text-primary"
                :title="tableLabel('history', t('products.lifecycle.history'))"
              >
                <History class="h-4 w-4" />
              </button>
              <button
                @click="emit('edit', product)"
                class="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-secondary/10 hover:text-secondary dark:hover:text-white"
                :title="commonLabel('edit', 'Edit')"
              >
                <Pencil class="h-4 w-4" />
              </button>
              <button
                @click="emit('delete', product)"
                class="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-600"
                :title="t('common.delete')"
              >
                <Trash2 class="h-4 w-4" />
              </button>
            </div>
          </div>
        </article>
      </div>

      <div class="hidden overflow-x-auto md:block">
        <table class="w-full border-collapse text-left" :dir="locale === 'ar' ? 'rtl' : 'ltr'">
          <thead>
            <tr class="border-b border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/70">
              <th class="w-12 px-6 py-5 text-center">
                <input
                  :checked="allSelected"
                  type="checkbox"
                  class="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/30"
                  @change="toggleSelectAll"
                />
              </th>
              <th class="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{{ tableLabel('product_name', t('products.name')) }}</th>
              <th class="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{{ tableLabel('price', t('products.price')) }}</th>
              <th class="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{{ tableLabel('stock', locale === 'ar' ? 'المخزون' : 'Stock') }}</th>
              <th class="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{{ tableLabel('status', t('products.lifecycle.title')) }}</th>
              <th class="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{{ tableLabel('analytics', 'Analytics') }}</th>
              <th class="px-6 py-5 text-end text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{{ t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-secondary dark:divide-slate-800 dark:text-slate-100">
            <tr
              v-for="product in products"
              :key="product.id"
              class="group transition hover:bg-slate-50/80 dark:hover:bg-slate-900/50"
            >
              <td class="px-6 py-5 text-center">
                <input
                  v-model="selectedIds"
                  :value="product.id"
                  type="checkbox"
                  class="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/30"
                />
              </td>

              <td class="px-6 py-5">
                <div class="flex items-center gap-4">
                  <div class="h-16 w-16 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                    <img
                      v-if="productImage(product)"
                      :src="productImage(product)"
                      :alt="productDisplayName(product)"
                      class="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      @error="markImageBroken(product)"
                    />
                    <div v-else class="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
                      <div class="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200/70 bg-white/80 text-slate-500 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300">
                        <ImageIcon class="h-5 w-5" />
                      </div>
                    </div>
                  </div>

                  <div class="min-w-0 space-y-2">
                    <div class="space-y-1">
                      <p class="line-clamp-1 text-sm font-bold tracking-tight text-secondary transition group-hover:text-primary dark:text-slate-100">
                        {{ productDisplayName(product) }}
                      </p>
                      <div class="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-400">
                        <span class="uppercase tracking-[0.16em]">{{ getCategoryName(product.category_id) }}</span>
                        <span
                          v-if="product.quality_score"
                          class="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                        >
                          Q {{ product.quality_score }}%
                        </span>
                        <span class="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                          {{ t('products.moq') }}: {{ product.min_order_quantity || product.moq || 1 }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </td>

              <td class="px-6 py-5">
                <div class="space-y-2">
                  <p class="text-sm font-bold text-secondary dark:text-slate-100">
                    {{ priceText(product) }}
                  </p>
                  <div class="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                    <ShieldCheck class="h-3.5 w-3.5" />
                    {{ tableLabel('trade_shield', 'Trade Shield') }}
                  </div>
                </div>
              </td>

              <td class="px-6 py-5">
                <div class="space-y-2">
                  <p class="text-sm font-bold text-secondary dark:text-slate-100">
                    {{ productStock(product) }}
                  </p>
                  <div :class="stockBadge(product).container">
                    {{ stockBadge(product).label }}
                  </div>
                </div>
              </td>

              <td class="px-6 py-5">
                <div class="space-y-2">
                  <div :class="statusPill(productStatus(product)).container" :title="product.rejection_reason || ''">
                    <span :class="statusPill(productStatus(product)).dot"></span>
                    {{ lifecycleLabel(productStatus(product)) }}
                    <AlertCircle v-if="productStatus(product) === 'REJECTED'" class="h-3.5 w-3.5" />
                  </div>
                  <p
                    v-if="product.is_edited"
                    class="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-600 dark:text-amber-300"
                  >
                    {{ lifecycleLabel('EDITED') }}
                  </p>
                  <p
                    v-if="productStatus(product) === 'REJECTED' && product.rejection_reason"
                    class="max-w-[16rem] text-xs text-rose-600 dark:text-rose-300"
                  >
                    {{ product.rejection_reason }}
                  </p>
                </div>
              </td>

              <td class="px-6 py-5">
                <div class="grid min-w-[9rem] grid-cols-2 gap-2">
                  <div
                    class="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2 dark:bg-slate-800/80"
                    :title="tableLabel('views', 'Views')"
                  >
                    <Eye class="h-4 w-4 text-primary" />
                    <p class="text-sm font-bold text-secondary dark:text-slate-100">{{ product.views_count || 0 }}</p>
                  </div>
                  <div
                    class="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2 dark:bg-slate-800/80"
                    :title="tableLabel('inquiries', 'Inquiries')"
                  >
                    <MessageCircle class="h-4 w-4 text-primary" />
                    <p class="text-sm font-bold text-secondary dark:text-slate-100">{{ product.inquiries_count || 0 }}</p>
                  </div>
                </div>
              </td>

              <td class="px-6 py-5">
                <div class="flex items-center justify-end gap-1">
                  <button
                    @click="emit('viewHistory', product)"
                    class="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-primary/10 hover:text-primary"
                    :title="t('products.lifecycle.history')"
                  >
                    <History class="h-4 w-4" />
                  </button>
                  <button
                    @click="emit('edit', product)"
                    class="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-secondary/10 hover:text-secondary dark:hover:text-white"
                    :title="commonLabel('edit', 'Edit')"
                  >
                    <Pencil class="h-4 w-4" />
                  </button>
                  <button
                    @click="emit('delete', product)"
                    class="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-600"
                    :title="t('common.delete')"
                  >
                    <Trash2 class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else class="p-12 text-center">
      <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800">
        <Inbox class="h-8 w-8 text-slate-300 dark:text-slate-600" />
      </div>
      <p class="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
        {{ t('common.noData') }}
      </p>
    </div>

    <div class="flex items-center justify-between border-t border-slate-200/70 bg-slate-50/70 px-4 py-4 text-[11px] font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400 md:px-6">
      <p>
        {{ t('common.showing') }}
        <span class="font-bold text-secondary dark:text-slate-100">{{ products.length }}</span>
        {{ t('common.of') }}
        <span class="font-bold text-secondary dark:text-slate-100">{{ total }}</span>
      </p>
      <div class="flex gap-2">
        <button class="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 shadow-sm transition hover:border-primary dark:border-slate-700 dark:bg-slate-900" disabled>
          <ChevronLeft class="h-4 w-4" />
        </button>
        <button class="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 shadow-sm transition hover:border-primary dark:border-slate-700 dark:bg-slate-900" disabled>
          <ChevronRight class="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  History,
  Image as ImageIcon,
  Inbox,
  MessageCircle,
  Pencil,
  ShieldCheck,
  Trash2
} from 'lucide-vue-next';
import { formatEGPRange } from '@/utils/currency';

const { t, te, locale } = useI18n();

const props = defineProps({
  products: { type: Array, required: true },
  total: { type: Number, default: 0 },
  loading: { type: Boolean, default: false },
  categories: { type: Array, default: () => [] }
});

const emit = defineEmits(['edit', 'delete', 'toggleStatus', 'bulkDelete', 'viewHistory']);
const selectedIds = ref([]);
const brokenImages = ref(new Set());

const apiOrigin = (() => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
  return apiUrl.replace(/\/api\/v\d+\/?$/, '');
})();

const allSelected = computed(() => props.products.length > 0 && selectedIds.value.length === props.products.length);

const statusFallbacks = {
  APPROVED: locale.value === 'ar' ? 'معتمد' : 'Approved',
  PENDING: locale.value === 'ar' ? 'قيد المراجعة' : 'Pending Review',
  UPDATE_PENDING: locale.value === 'ar' ? 'قيد المراجعة' : 'Under Review',
  REJECTED: locale.value === 'ar' ? 'مرفوض' : 'Rejected',
  DRAFT: locale.value === 'ar' ? 'مسودة' : 'Draft',
  EDITED: locale.value === 'ar' ? 'معدل' : 'Edited',
  ACTIVE: locale.value === 'ar' ? 'نشط' : 'Active'
};

const tableFallbacks = {
  product_name: 'Product Name',
  price: 'Price',
  stock: 'Stock',
  status: 'Status',
  analytics: 'Analytics',
  views: 'Views',
  inquiries: 'Inquiries',
  trade_shield: 'Trade Shield',
  history: 'History'
};

const toggleSelectAll = (event) => {
  selectedIds.value = event.target.checked ? props.products.map((item) => item.id) : [];
};

const productStatus = (product) => {
  const status = (product?.lifecycle_status || product?.status || 'PENDING').toUpperCase();
  if (status === 'PENDING' && product?.is_edited) return 'UPDATE_PENDING';
  return status;
};

const lifecycleLabel = (status) => {
  const normalized = String(status || 'PENDING').toLowerCase();
  const key = `products.lifecycle.${normalized}`;
  return te(key) ? t(key) : (statusFallbacks[String(status || 'PENDING').toUpperCase()] || String(status));
};

const tableLabel = (key, fallback) => {
  const path = `products.table.${key}`;
  return te(path) ? t(path) : (tableFallbacks[key] || fallback);
};

const commonLabel = (key, fallback) => {
  const path = `common.${key}`;
  return te(path) ? t(path) : fallback;
};

const productDisplayName = (product) => (
  locale.value === 'ar'
    ? (product?.name_ar || product?.name_en || '-')
    : (product?.name_en || product?.name_ar || '-')
);

const resolveImageUrl = (src) => {
  if (!src) return '';
  if (/^(https?:)?\/\//i.test(src) || src.startsWith('data:') || src.startsWith('blob:')) return src;
  if (src.startsWith('/')) return `${apiOrigin}${src}`;
  return `${apiOrigin}/${src}`;
};

const imageKey = (product) => String(product?.id || product?.name_en || product?.name_ar || product?.image_url || '');

const rawImage = (product) => (
  product?.primary_image ||
  product?.primaryImage ||
  product?.product_image ||
  product?.main_image ||
  product?.mainImage ||
  product?.images?.find?.((item) => item?.is_main)?.image_url ||
  product?.images?.find?.((item) => item?.isMain)?.image_url ||
  product?.images?.[0]?.image_url ||
  product?.images?.[0] ||
  product?.image_url ||
  ''
);

const productImage = (product) => {
  if (brokenImages.value.has(imageKey(product))) return '';
  return resolveImageUrl(rawImage(product));
};

const markImageBroken = (product) => {
  brokenImages.value = new Set([...brokenImages.value, imageKey(product)]);
};

const getCategoryName = (id) => {
  const category = props.categories.find((item) => item.id === id);
  if (!category) return 'Uncategorized';
  return locale.value === 'ar'
    ? (category.name_ar || category.name_en)
    : (category.name_en || category.name_ar);
};

const priceText = (product) => {
  const from = Number(product?.price || 0);
  const to = Number(product?.discount_price || 0);
  return formatEGPRange(from, to, locale.value);
};

const productStock = (product) => Number(product?.quantity_available ?? product?.stock_quantity ?? 0);

const stockBadge = (product) => {
  const quantity = productStock(product);

  if (quantity <= 0) {
    return {
      container: 'inline-flex w-fit items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300',
      label: te('products.out_of_stock') ? t('products.out_of_stock') : (locale.value === 'ar' ? 'نفد المخزون' : 'Out of Stock')
    };
  }

  if (quantity < 10) {
    return {
      container: 'inline-flex w-fit items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-700 dark:border-orange-900/50 dark:bg-orange-950/40 dark:text-orange-300',
      label: te('products.low_stock') ? t('products.low_stock') : (locale.value === 'ar' ? 'مخزون منخفض' : 'Low Stock')
    };
  }

  return {
    container: 'inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300',
    label: te('products.in_stock') ? t('products.in_stock') : (locale.value === 'ar' ? 'متوفر' : 'In Stock')
  };
};

const statusPill = (status) => {
  switch (String(status).toUpperCase()) {
    case 'APPROVED':
    case 'ACTIVE':
      return {
        container: 'inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300',
        dot: 'h-2 w-2 rounded-full bg-emerald-500'
      };
    case 'UPDATE_PENDING':
      return {
        container: 'inline-flex w-fit items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-700 dark:border-orange-900/50 dark:bg-orange-950/40 dark:text-orange-300',
        dot: 'h-2 w-2 rounded-full bg-orange-500'
      };
    case 'REJECTED':
      return {
        container: 'inline-flex w-fit items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300',
        dot: 'h-2 w-2 rounded-full bg-rose-500'
      };
    case 'DRAFT':
      return {
        container: 'inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
        dot: 'h-2 w-2 rounded-full bg-slate-400'
      };
    default:
      return {
        container: 'inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300',
        dot: 'h-2 w-2 rounded-full bg-amber-500'
      };
  }
};
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
</style>

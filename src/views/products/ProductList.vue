<template>
  <div class="container-wide space-y-6 py-8 font-plex" :dir="locale === 'ar' ? 'rtl' : 'ltr'">
    <section class="rounded-[2rem] border border-slate-200/80 bg-white/95 p-4 shadow-[0_24px_60px_-44px_rgba(15,23,42,0.45)] backdrop-blur sm:p-6 dark:border-slate-800 dark:bg-slate-950/90">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div class="min-w-0 space-y-2">
          <p class="ui-kicker text-[hsl(var(--primary))]">{{ sectionLabel }}</p>
          <div class="flex flex-wrap items-center gap-3">
            <h1 class="text-2xl font-black text-[#1e293b] sm:text-3xl dark:text-white">{{ pageTitle }}</h1>
            <div
              v-if="hasActiveFilters"
              class="inline-flex items-center rounded-full bg-[hsl(var(--primary))/0.12] px-3 py-1 text-xs font-black text-[hsl(var(--primary))]"
            >
              {{ activeFiltersCountLabel }}
            </div>
          </div>
          <p class="max-w-2xl text-sm text-slate-500 dark:text-slate-400">{{ summaryLabel }}</p>
        </div>

        <div ref="filterMenuRef" class="relative self-start sm:self-auto">
          <button
            type="button"
            class="group inline-flex min-h-0 items-center gap-2 rounded-[1rem] border border-slate-200/90 bg-white px-2.5 py-2 text-start text-sm text-[#1e293b] shadow-[0_14px_32px_-28px_rgba(15,23,42,0.28)] transition hover:-translate-y-0.5 hover:border-[hsl(var(--primary))/0.28] hover:shadow-[0_20px_38px_-30px_rgba(15,23,42,0.36)] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            :aria-expanded="filtersMenuOpen"
            @click="toggleFiltersMenu"
          >
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.9rem] bg-[hsl(var(--primary))/0.12] text-[hsl(var(--primary))] transition group-hover:bg-[hsl(var(--primary))] group-hover:text-white">
              <Filter class="h-3.5 w-3.5" />
            </span>
            <span class="min-w-0 flex-1 pe-1">
              <span class="block text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                {{ filtersTitle }}
              </span>
              <span class="block truncate text-[13px] font-black text-[#1e293b] dark:text-slate-100">
                {{ filterTriggerLabel }}
              </span>
            </span>
            <span
              v-if="hasActiveFilters"
              class="inline-flex min-w-7 items-center justify-center rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-500 transition group-hover:bg-[hsl(var(--primary))/0.12] group-hover:text-[hsl(var(--primary))] dark:bg-slate-800 dark:text-slate-300"
            >
              {{ activeFiltersCount }}
            </span>
          </button>

          <Transition name="slide-down">
            <div
              v-if="filtersMenuOpen && !isMobileFilter"
              class="absolute end-0 top-full z-[70] mt-2 w-[min(88vw,21rem)]"
            >
              <div class="overflow-hidden rounded-[1.35rem] border border-slate-200/90 bg-white shadow-[0_26px_60px_-36px_rgba(15,23,42,0.38)] dark:border-slate-800 dark:bg-slate-950">
                <div class="flex max-h-[min(70vh,32rem)] flex-col">
                  <div class="shrink-0 border-b border-slate-200/80 bg-[linear-gradient(135deg,rgba(45,191,178,0.08),rgba(255,255,255,0.96)_58%)] px-4 py-3 dark:border-slate-800 dark:bg-[linear-gradient(135deg,rgba(45,191,178,0.10),rgba(2,6,23,0.95)_58%)]">
                  <div class="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p class="ui-kicker text-[hsl(var(--primary))]">{{ sectionLabel }}</p>
                      <h2 class="mt-1 text-base font-black text-[#1e293b] dark:text-white">{{ filtersTitle }}</h2>
                    </div>
                    <span class="rounded-full border border-white/70 bg-white/80 px-2.5 py-1 text-[10px] font-black text-slate-500 shadow-sm dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-300">
                      {{ activeFiltersCountLabel }}
                    </span>
                  </div>

                  <div class="flex flex-wrap gap-1.5">
                    <span class="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-slate-600 shadow-sm dark:bg-slate-900/80 dark:text-slate-200">
                      {{ selectedCategorySummary }}
                    </span>
                    <span class="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-slate-600 shadow-sm dark:bg-slate-900/80 dark:text-slate-200">
                      {{ selectedPriceSummary }}
                    </span>
                  </div>
                  </div>

                  <div class="space-y-4 overflow-y-auto p-4">
                    <div class="flex items-center justify-between">
                      <p class="text-[13px] font-bold text-slate-500 dark:text-slate-400">{{ filterHelperText }}</p>
                      <button
                        type="button"
                        class="text-xs font-bold text-[hsl(var(--primary))] transition hover:underline"
                        @click="clearFilters"
                      >
                        {{ clearLabel }}
                      </button>
                    </div>

                    <ResponsiveSelect
                      v-model="filters.parentCategory"
                      :label="categoryLabel"
                      :options="categoryOptions"
                      :placeholder="allCategoriesLabel"
                      :sheet-title="filtersTitle"
                      :sheet-kicker="categoryLabel"
                      searchable
                    />

                    <ResponsiveSelect
                      v-if="childCategoryOptions.length"
                      v-model="filters.childCategory"
                      :label="childCategoryLabel"
                      :options="childCategoryOptions"
                      :placeholder="allChildCategoriesLabel"
                      :sheet-title="filtersTitle"
                      :sheet-kicker="childCategoryLabel"
                      searchable
                    />

                    <div>
                      <label class="mb-3 block ui-kicker">
                        {{ priceRangeLabel }}
                      </label>
                      <div class="rounded-[1.1rem] border border-slate-200 bg-slate-50/70 p-2.5 dark:border-slate-800 dark:bg-slate-900/70">
                        <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                          <input
                            v-model.number="filters.minPrice"
                            type="number"
                            min="0"
                            class="w-full rounded-[0.9rem] border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[hsl(var(--primary))] focus:ring-4 focus:ring-[hsl(var(--primary))/0.12] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                            :placeholder="minLabel"
                          />
                          <span class="text-slate-400">-</span>
                          <input
                            v-model.number="filters.maxPrice"
                            type="number"
                            min="0"
                            class="w-full rounded-[0.9rem] border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[hsl(var(--primary))] focus:ring-4 focus:ring-[hsl(var(--primary))/0.12] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                            :placeholder="maxLabel"
                          />
                        </div>
                      </div>
                    </div>

                    <div class="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        class="inline-flex items-center justify-center rounded-[0.95rem] border border-slate-200 px-3 py-2.5 text-sm font-black text-slate-700 transition hover:border-[hsl(var(--primary))/0.28] hover:text-[hsl(var(--primary))] dark:border-slate-700 dark:text-slate-100"
                        @click="clearFilters"
                      >
                        {{ clearLabel }}
                      </button>
                      <button
                        type="button"
                        class="inline-flex items-center justify-center gap-2 rounded-[0.95rem] bg-[hsl(var(--primary))] px-3 py-2.5 text-sm font-black text-white shadow-[0_16px_40px_-24px_hsl(var(--primary))]"
                        @click="applyFilters"
                      >
                        {{ applyFiltersLabel }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </section>

    <main class="min-w-0">
      <div v-if="loading" :class="gridView ? 'grid items-start grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6' : 'space-y-4'">
        <div v-for="i in gridView ? 9 : 6" :key="i" class="skeleton rounded-[1.75rem]" :class="gridView ? 'h-96' : 'h-36'" />
      </div>

      <div v-else-if="products.length">
        <div v-if="gridView" class="grid items-start grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
          <ProductCard v-for="product in products" :key="product.id" :product="product" />
        </div>

        <div v-else class="space-y-4">
          <router-link
            v-for="product in products"
            :key="product.id"
            :to="buildProductPath(product)"
            class="ui-surface flex flex-col gap-4 p-4 transition hover:border-[hsl(var(--primary))]/30 hover:shadow-[0_24px_56px_-32px_rgba(15,23,42,0.36)] md:flex-row"
          >
            <div class="h-32 w-full overflow-hidden rounded-[1.35rem] bg-slate-100 dark:bg-slate-950 md:h-28 md:w-32">
              <AppImage
                v-if="resolveListImage(product)"
                :src="resolveListImage(product)"
                :alt="productDisplayName(product)"
                :width="128"
                :height="128"
                sizes="128px"
                :responsive-widths="[128, 256]"
                img-class="h-full w-full object-cover"
              />
              <div v-else class="flex h-full w-full items-center justify-center text-slate-400 dark:text-slate-500">
                <Package class="h-6 w-6" />
              </div>
            </div>

            <div class="min-w-0 flex-1">
              <div class="mb-2 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span class="rounded-full bg-[hsl(var(--primary))/0.12] px-3 py-1 font-bold text-[hsl(var(--primary))]">
                  {{ productCategory(product) }}
                </span>
                <span class="truncate">{{ productVendor(product) }}</span>
              </div>

              <h3 class="text-lg font-black text-[#1e293b] dark:text-white">
                {{ productDisplayName(product) }}
              </h3>

              <p
                v-if="product.model_number"
                class="mt-2 text-xs font-bold tracking-[0.08em] text-[hsl(var(--primary))]"
                dir="ltr"
              >
                {{ locale === 'ar' ? 'موديل:' : 'Model:' }} {{ product.model_number }}
              </p>

              <div class="mt-3 flex flex-wrap items-center gap-3 text-sm">
                <span class="font-black text-[hsl(var(--primary))]">{{ productPrice(product) }}</span>
                <span class="text-slate-500 dark:text-slate-400">{{ productMoq(product) }}</span>
              </div>
            </div>
          </router-link>
        </div>

        <div class="mt-8">
          <Pagination :currentPage="page" :totalPages="totalPages" @update:currentPage="changePage" />
        </div>
      </div>

      <EmptyState
        v-else
        :title="noProductsTitle"
        :description="noProductsDescription"
        :icon="Package"
      />
    </main>
  </div>

  <Teleport to="body">
    <Transition name="fade">
      <div v-if="filtersMenuOpen && isMobileFilter" class="fixed inset-0 z-[80] bg-slate-950/50 backdrop-blur-[3px]">
        <button
          type="button"
          class="absolute inset-0"
          aria-label="Close filters"
          @click="closeFiltersMenu"
        />

        <div class="absolute inset-x-0 bottom-0 mx-auto flex max-h-[calc(100dvh-0.75rem)] w-full max-w-md flex-col overflow-hidden rounded-t-[2rem] border border-border bg-card px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-24px_80px_-36px_rgba(15,23,42,0.5)] sm:px-6">
          <div class="mb-3 flex justify-center">
            <span class="h-1.5 w-14 rounded-full bg-slate-300/90 dark:bg-slate-700/90" />
          </div>

          <div class="mb-5 shrink-0 rounded-[1.5rem] bg-[linear-gradient(135deg,rgba(45,191,178,0.10),rgba(255,255,255,0.96)_58%)] p-4 dark:bg-[linear-gradient(135deg,rgba(45,191,178,0.12),rgba(2,6,23,0.95)_58%)]">
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="ui-kicker text-[hsl(var(--primary))]">{{ sectionLabel }}</p>
                <h2 class="mt-1 text-lg font-black text-[#1e293b] dark:text-white">{{ filtersTitle }}</h2>
              </div>

              <button
                type="button"
                class="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-muted/50 text-muted-foreground transition hover:border-primary/30 hover:text-primary"
                @click="closeFiltersMenu"
              >
                <X class="h-4 w-4" />
              </button>
            </div>

            <div class="mt-4 flex flex-wrap gap-2">
              <span class="rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm dark:bg-slate-900/80 dark:text-slate-200">
                {{ selectedCategorySummary }}
              </span>
              <span class="rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm dark:bg-slate-900/80 dark:text-slate-200">
                {{ selectedPriceSummary }}
              </span>
            </div>
          </div>

          <div class="custom-scrollbar space-y-5 overflow-y-auto pe-1">
            <ResponsiveSelect
              v-model="filters.parentCategory"
              :label="categoryLabel"
              :options="categoryOptions"
              :placeholder="allCategoriesLabel"
              :sheet-title="filtersTitle"
              :sheet-kicker="categoryLabel"
              searchable
            />

            <ResponsiveSelect
              v-if="childCategoryOptions.length"
              v-model="filters.childCategory"
              :label="childCategoryLabel"
              :options="childCategoryOptions"
              :placeholder="allChildCategoriesLabel"
              :sheet-title="filtersTitle"
              :sheet-kicker="childCategoryLabel"
              searchable
            />

            <div>
              <label class="mb-3 block ui-kicker">
                {{ priceRangeLabel }}
              </label>
              <div class="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/70">
                <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                  <input
                    v-model.number="filters.minPrice"
                    type="number"
                    min="0"
                    class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[hsl(var(--primary))] focus:ring-4 focus:ring-[hsl(var(--primary))/0.12] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    :placeholder="minLabel"
                  />
                  <span class="text-slate-400">-</span>
                  <input
                    v-model.number="filters.maxPrice"
                    type="number"
                    min="0"
                    class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[hsl(var(--primary))] focus:ring-4 focus:ring-[hsl(var(--primary))/0.12] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    :placeholder="maxLabel"
                  />
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <button
                type="button"
                class="inline-flex items-center justify-center rounded-[1.1rem] border border-slate-200 px-4 py-3 text-sm font-black text-slate-700 transition hover:border-[hsl(var(--primary))/0.28] hover:text-[hsl(var(--primary))] dark:border-slate-700 dark:text-slate-100"
                @click="clearFilters"
              >
                {{ clearLabel }}
              </button>

              <button
                type="button"
                class="inline-flex items-center justify-center rounded-[1.1rem] bg-[hsl(var(--primary))] px-4 py-3 text-sm font-black text-white shadow-[0_16px_40px_-24px_hsl(var(--primary))]"
                @click="applyFilters"
              >
                {{ applyFiltersLabel }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Filter, Package, X } from 'lucide-vue-next';
import api from '@/services/api';
import { useCategoryStore } from '@/stores/categoryStore';
import { getApiCollection, getApiData } from '@/utils/apiResponse';
import { formatEGPCurrency } from '@/utils/currency';
import { useSeo } from '@/composables/useSeo';
import { useMediaQuery } from '@/composables/useMediaQuery';
import AppImage from '@/components/ui/AppImage.vue';
import ProductCard from '@/components/ui/ProductCard.vue';
import Pagination from '@/components/ui/Pagination.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import ResponsiveSelect from '@/components/ui/ResponsiveSelect.vue';
import { buildProductPath } from '@/utils/routes';
import { whenBrowserIdle } from '@/utils/scheduling';

const { locale } = useI18n();
const route = useRoute();
const categoryStore = useCategoryStore();

const products = ref([]);
const loading = ref(true);
const page = ref(1);
const total = ref(0);
const limit = 12;
const gridView = ref(true);
const filtersMenuOpen = ref(false);
const filterMenuRef = ref(null);
const isMobileFilter = useMediaQuery('(max-width: 767px)');

const filters = reactive({
  parentCategory: '',
  childCategory: '',
  minPrice: '',
  maxPrice: ''
});

const apiOrigin = (() => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
  return apiUrl.replace(/\/api\/v\d+\/?$/, '');
})();

const resolveAssetUrl = (src) => {
  if (!src) return '';
  if (/^(https?:)?\/\//i.test(src) || src.startsWith('data:') || src.startsWith('blob:')) return src;
  if (src.startsWith('/')) return `${apiOrigin}${src}`;
  return `${apiOrigin}/${src}`;
};

const categories = computed(() => categoryStore.localizedCategories(locale.value));
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit)));
const rootCategories = computed(() => categories.value.filter((category) => category.parentId == null));
const selectedParentCategory = computed(() =>
  rootCategories.value.find((category) => String(category.id) === String(filters.parentCategory || '')) || null
);
const childCategories = computed(() =>
  categories.value.filter((category) => String(category.parentId ?? '') === String(filters.parentCategory || ''))
);
const effectiveCategoryId = computed(() => filters.childCategory || filters.parentCategory || '');
const hasActiveFilters = computed(() => !!effectiveCategoryId.value || !!filters.minPrice || !!filters.maxPrice);
const activeFiltersCount = computed(() =>
  [effectiveCategoryId.value, filters.minPrice, filters.maxPrice].filter((value) => value !== '' && value != null).length
);

const categoryOptions = computed(() => [
  {
    value: '',
    label: allCategoriesLabel.value,
    description: locale.value === 'ar' ? 'عرض كل المنتجات المعتمدة' : 'Show all approved products',
  },
  ...rootCategories.value.map((category) => ({
    value: String(category.id),
    label: category.name,
    description: category.slug ? `/${category.slug}` : '',
  })),
]);

const childCategoryOptions = computed(() => {
  if (!filters.parentCategory || childCategories.value.length === 0) {
    return [];
  }

  return [
    {
      value: '',
      label: allChildCategoriesLabel.value,
      description: locale.value === 'ar' ? 'عرض كل المنتجات داخل القسم الرئيسي المحدد' : 'Show all products in the selected main category',
    },
    ...childCategories.value.map((category) => ({
      value: String(category.id),
      label: category.name,
      description: category.slug ? `/${category.slug}` : '',
    })),
  ];
});

const selectedCategoryOption = computed(() =>
  [...categoryOptions.value, ...childCategoryOptions.value].find((option) => String(option.value ?? '') === String(effectiveCategoryId.value ?? '')) || null
);

const productDisplayName = (product) =>
  locale.value === 'ar'
    ? product.name_ar || product.name_en || product.title || product.name || 'Product'
    : product.name_en || product.name_ar || product.title || product.name || 'Product';

const productVendor = (product) =>
  product.vendor?.company_name || product.vendor?.name || product.company_name || (locale.value === 'ar' ? 'مورد' : 'Supplier');

const productCategory = (product) =>
  product.category_name || (locale.value === 'ar' ? 'فئة' : 'Category');

const productPrice = (product) => {
  const values = [
    product.price_min,
    product.price,
    product.discount_price,
    product.price_max,
  ]
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value > 0);

  if (!values.length) return formatEGPCurrency(0, locale.value);

  const min = Math.min(...values);
  const max = Math.max(...values);

  return max > min
    ? `${formatEGPCurrency(min, locale.value)} ~ ${formatEGPCurrency(max, locale.value)}`
    : formatEGPCurrency(min, locale.value);
};

const productMoq = (product) => {
  const moq = product.moq || product.min_order_quantity || 1;
  return locale.value === 'ar' ? `الحد الأدنى ${moq} قطعة` : `MOQ ${moq} pcs`;
};

const resolveListImage = (product) =>
  resolveAssetUrl(
    product.product_image ||
      product.main_image ||
      product.images?.find?.((item) => item?.is_main)?.image_url ||
      product.images?.[0]?.image_url ||
      product.images?.[0] ||
      product.image_url ||
      ''
  );

const fetchProducts = async () => {
  loading.value = true;
  try {
    const params = {
      page: page.value,
      limit,
      ...(effectiveCategoryId.value && { category: effectiveCategoryId.value }),
      ...(filters.minPrice && { minPrice: filters.minPrice }),
      ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
      ...((route.query.q || route.query.search) && { search: route.query.q || route.query.search }),
    };

    const response = await api.get('/products', { params });
    const payload = getApiData(response) || {};
    products.value = getApiCollection(response, ['products', 'items']);
    total.value = payload?.pagination?.totalItems || payload?.meta?.total || payload?.total || products.value.length;
  } catch {
    products.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

const closeFiltersMenu = () => {
  filtersMenuOpen.value = false;
};

const toggleFiltersMenu = () => {
  filtersMenuOpen.value = !filtersMenuOpen.value;
};

const applyFilters = () => {
  page.value = 1;
  closeFiltersMenu();
  fetchProducts();
};

const changePage = (nextPage) => {
  page.value = nextPage;
  fetchProducts();
};

const clearFilters = () => {
  filters.parentCategory = '';
  filters.childCategory = '';
  filters.minPrice = '';
  filters.maxPrice = '';
  page.value = 1;
  closeFiltersMenu();
  fetchProducts();
};

const syncCategoryFiltersFromQuery = (categoryId) => {
  const normalizedId = String(categoryId || '').trim();

  if (!normalizedId) {
    filters.parentCategory = '';
    filters.childCategory = '';
    return;
  }

  const matchedCategory = categories.value.find((category) => String(category.id) === normalizedId);

  if (!matchedCategory) {
    filters.parentCategory = normalizedId;
    filters.childCategory = '';
    return;
  }

  if (matchedCategory.parentId != null) {
    filters.parentCategory = String(matchedCategory.parentId);
    filters.childCategory = String(matchedCategory.id);
    return;
  }

  filters.parentCategory = String(matchedCategory.id);
  filters.childCategory = '';
};

const handleOutsideClick = (event) => {
  if (!filtersMenuOpen.value || isMobileFilter.value) return;
  if (!filterMenuRef.value?.contains(event.target)) {
    closeFiltersMenu();
  }
};

const handleEscape = (event) => {
  if (event.key === 'Escape') {
    closeFiltersMenu();
  }
};

const sectionLabel = computed(() => (locale.value === 'ar' ? 'سوق المورد' : 'Elmowared marketplace'));
const pageTitle = computed(() => (locale.value === 'ar' ? 'المنتجات' : 'Products'));
const filtersTitle = computed(() => (locale.value === 'ar' ? 'الفلاتر' : 'Filters'));
const filterTriggerLabel = computed(() =>
  locale.value === 'ar'
    ? hasActiveFilters.value
      ? 'تخصيص النتائج'
      : 'كل المنتجات'
    : hasActiveFilters.value
      ? 'Refine results'
      : 'All products'
);
const clearLabel = computed(() => (locale.value === 'ar' ? 'مسح' : 'Clear'));
const categoryLabel = computed(() => (locale.value === 'ar' ? 'الفئة' : 'Category'));
const allCategoriesLabel = computed(() => (locale.value === 'ar' ? 'كل الفئات' : 'All categories'));
const childCategoryLabel = computed(() => (locale.value === 'ar' ? 'القسم الفرعي' : 'Subcategory'));
const allChildCategoriesLabel = computed(() => (locale.value === 'ar' ? 'كل الأقسام الفرعية' : 'All subcategories'));
const priceRangeLabel = computed(() => (locale.value === 'ar' ? 'نطاق السعر' : 'Price range'));
const minLabel = computed(() => (locale.value === 'ar' ? 'الأدنى' : 'Min'));
const maxLabel = computed(() => (locale.value === 'ar' ? 'الأعلى' : 'Max'));
const applyFiltersLabel = computed(() => (locale.value === 'ar' ? 'تطبيق الفلاتر' : 'Apply filters'));
const filterHelperText = computed(() =>
  locale.value === 'ar' ? 'اختَر الفئة والسعر المناسبين لعرض نتائج أدق.' : 'Choose category and price range for sharper results.'
);
const selectedCategorySummary = computed(() =>
  locale.value === 'ar'
    ? `الفئة: ${selectedParentCategory.value?.label || selectedCategoryOption.value?.label || allCategoriesLabel.value}${filters.childCategory && selectedCategoryOption.value ? ` / ${selectedCategoryOption.value.label}` : ''}`
    : `Category: ${selectedParentCategory.value?.label || selectedCategoryOption.value?.label || allCategoriesLabel.value}${filters.childCategory && selectedCategoryOption.value ? ` / ${selectedCategoryOption.value.label}` : ''}`
);
const selectedPriceSummary = computed(() => {
  const min = filters.minPrice || '';
  const max = filters.maxPrice || '';

  if (!min && !max) {
    return locale.value === 'ar' ? 'السعر: أي نطاق' : 'Price: any range';
  }

  if (min && max) {
    return locale.value === 'ar' ? `السعر: من ${min} إلى ${max}` : `Price: ${min} to ${max}`;
  }

  if (min) {
    return locale.value === 'ar' ? `السعر: يبدأ من ${min}` : `Price: from ${min}`;
  }

  return locale.value === 'ar' ? `السعر: حتى ${max}` : `Price: up to ${max}`;
});
const summaryLabel = computed(() =>
  locale.value === 'ar' ? `تم العثور على ${total.value} منتجًا جاهزًا للاستكشاف` : `${total.value} products ready to explore`
);
const activeFiltersCountLabel = computed(() =>
  locale.value === 'ar'
    ? activeFiltersCount.value
      ? `${activeFiltersCount.value} فلتر مفعّل`
      : 'بدون فلاتر'
    : activeFiltersCount.value
      ? `${activeFiltersCount.value} active filters`
      : 'No active filters'
);
const noProductsTitle = computed(() => (locale.value === 'ar' ? 'لا توجد منتجات مطابقة' : 'No products found'));
const noProductsDescription = computed(() =>
  locale.value === 'ar'
    ? 'جرّب تعديل الفئة أو نطاق السعر للعثور على نتائج أخرى.'
    : 'Try adjusting the category or price range to discover more results.'
);
const seoDescription = computed(() =>
  locale.value === 'ar'
    ? 'استكشف المنتجات المعتمدة وقم بتصفية النتائج حسب الفئة ونطاق السعر.'
    : 'Discover approved products and filter results by category and price range.'
);

useSeo(() => ({
  title: locale.value === 'ar' ? 'المنتجات | Elmowared' : 'Products | Elmowared',
  description: seoDescription.value,
  canonical: '/products',
  ogType: 'website',
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: pageTitle.value,
      description: seoDescription.value,
      url: `${window.location.origin}/products`
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: locale.value === 'ar' ? 'الرئيسية' : 'Home',
          item: `${window.location.origin}/`
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: pageTitle.value,
          item: `${window.location.origin}/products`
        }
      ]
    }
  ]
}));

watch(
  () => route.query,
  () => {
    page.value = 1;
    syncCategoryFiltersFromQuery(route.query.category || '');
    closeFiltersMenu();
    fetchProducts();
  }
);

watch(
  () => filters.parentCategory,
  (nextValue, previousValue) => {
    if (nextValue === previousValue) return;

    const selectedChildStillValid = childCategories.value.some(
      (category) => String(category.id) === String(filters.childCategory || '')
    );

    if (!selectedChildStillValid) {
      filters.childCategory = '';
    }
  }
);

onMounted(async () => {
  document.addEventListener('mousedown', handleOutsideClick);
  document.addEventListener('keydown', handleEscape);

  await categoryStore.fetchCategories({ mode: 'cached' });
  syncCategoryFiltersFromQuery(route.query.category || '');

  whenBrowserIdle(() => {
    categoryStore.fetchCategories({ mode: 'revalidate' });
  }, 120);

  fetchProducts();
});

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleOutsideClick);
  document.removeEventListener('keydown', handleEscape);
});
</script>

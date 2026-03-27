<template>
  <div class="container-wide space-y-8 py-8 font-plex" :dir="locale === 'ar' ? 'rtl' : 'ltr'">
    <section class="ui-surface-soft relative overflow-hidden p-6 sm:p-8">
      <div class="absolute inset-y-0 end-0 hidden w-1/3 bg-[radial-gradient(circle_at_top_right,_rgba(6,182,212,0.18),_transparent_48%),linear-gradient(135deg,rgba(30,41,59,0.08),transparent_65%)] lg:block" />
      <div class="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
        <div class="max-w-3xl space-y-4">
          <p class="ui-kicker-primary">
            {{ heroEyebrow }}
          </p>
          <h1 class="text-3xl font-black tracking-tight text-[#1e293b] dark:text-white sm:text-4xl">
            {{ heroTitle }}
          </h1>
          <p class="max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
            {{ heroDescription }}
          </p>
        </div>

        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div class="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/60">
            <p class="ui-kicker">{{ resultsLabel }}</p>
            <p class="mt-2 text-2xl font-black text-[#1e293b] dark:text-white">{{ total }}</p>
          </div>
          <div class="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/60">
            <p class="ui-kicker">{{ approvalLabel }}</p>
            <p class="mt-2 text-sm font-black text-emerald-600 dark:text-emerald-300">{{ approvedOnlyLabel }}</p>
          </div>
          <div class="col-span-2 rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/60 sm:col-span-1">
            <p class="ui-kicker">{{ modelLabel }}</p>
            <p class="mt-2 text-sm font-black text-[#1e293b] dark:text-white">{{ modelValueLabel }}</p>
          </div>
        </div>
      </div>
    </section>

    <div class="flex flex-col gap-6 lg:flex-row">
      <aside class="w-full shrink-0 lg:w-72">
        <div class="ui-surface sticky top-20 p-5">
          <div class="mb-6 flex items-center justify-between">
            <h2 class="text-lg font-black text-[#1e293b] dark:text-white">{{ filtersTitle }}</h2>
            <button
              type="button"
              class="text-xs font-bold text-[hsl(var(--primary))] transition hover:underline"
              @click="clearFilters"
            >
              {{ clearLabel }}
            </button>
          </div>

          <div class="space-y-6">
            <div>
              <label class="mb-3 block ui-kicker">
                {{ categoryLabel }}
              </label>
              <div class="max-h-60 space-y-2 overflow-y-auto custom-scrollbar pe-1">
                <label class="flex items-center gap-3 rounded-2xl border border-transparent px-3 py-2 transition hover:border-[hsl(var(--primary))]/20 hover:bg-[hsl(var(--primary))/0.06]">
                  <input v-model="filters.category" type="radio" value="" class="h-4 w-4 accent-[hsl(var(--primary))]" />
                  <span class="text-sm font-medium text-slate-700 dark:text-slate-200">{{ allCategoriesLabel }}</span>
                </label>
                <label
                  v-for="category in categories"
                  :key="category.id"
                  class="flex items-center gap-3 rounded-2xl border border-transparent px-3 py-2 transition hover:border-[hsl(var(--primary))]/20 hover:bg-[hsl(var(--primary))/0.06]"
                >
                  <input v-model="filters.category" type="radio" :value="category.id" class="h-4 w-4 accent-[hsl(var(--primary))]" />
                  <span class="text-sm font-medium text-slate-700 dark:text-slate-200">{{ category.name }}</span>
                </label>
              </div>
            </div>

            <div>
              <label class="mb-3 block ui-kicker">
                {{ priceRangeLabel }}
              </label>
              <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                <input
                  v-model.number="filters.minPrice"
                  type="number"
                  min="0"
                  class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[hsl(var(--primary))] focus:ring-4 focus:ring-[hsl(var(--primary))/0.12] dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                  :placeholder="minLabel"
                />
                <span class="text-slate-400">-</span>
                <input
                  v-model.number="filters.maxPrice"
                  type="number"
                  min="0"
                  class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[hsl(var(--primary))] focus:ring-4 focus:ring-[hsl(var(--primary))/0.12] dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                  :placeholder="maxLabel"
                />
              </div>
            </div>

            <button
              type="button"
              class="inline-flex w-full items-center justify-center gap-2 rounded-[1.2rem] bg-[hsl(var(--primary))] px-4 py-3 text-sm font-black text-white shadow-[0_16px_40px_-24px_hsl(var(--primary))]"
              @click="applyFilters"
            >
              {{ applyFiltersLabel }}
            </button>
          </div>
        </div>
      </aside>

      <main class="min-w-0 flex-1">
        <div class="ui-surface mb-5 p-4">
          <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 class="text-2xl font-black text-[#1e293b] dark:text-white">
                {{ gridHeading }}
              </h2>
              <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {{ loading ? loadingLabel : summaryLabel }}
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <select
                v-model="sort"
                class="min-w-[170px] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-[hsl(var(--primary))] focus:ring-4 focus:ring-[hsl(var(--primary))/0.12] dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                @change="fetchProducts"
              >
                <option value="">{{ defaultSortLabel }}</option>
                <option value="price_asc">{{ sortPriceAscLabel }}</option>
                <option value="price_desc">{{ sortPriceDescLabel }}</option>
                <option value="newest">{{ sortNewestLabel }}</option>
              </select>

              <div class="inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-950">
                <button
                  type="button"
                  class="flex h-11 w-11 items-center justify-center rounded-[1rem] transition"
                  :class="gridView ? 'bg-[hsl(var(--primary))] text-white shadow-sm' : 'text-slate-500 dark:text-slate-300'"
                  @click="gridView = true"
                >
                  <LayoutGrid class="h-4 w-4" />
                </button>
                <button
                  type="button"
                  class="flex h-11 w-11 items-center justify-center rounded-[1rem] transition"
                  :class="!gridView ? 'bg-[hsl(var(--primary))] text-white shadow-sm' : 'text-slate-500 dark:text-slate-300'"
                  @click="gridView = false"
                >
                  <List class="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="loading" :class="gridView ? 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3' : 'space-y-4'">
          <div v-for="i in gridView ? 9 : 6" :key="i" class="skeleton rounded-[1.75rem]" :class="gridView ? 'h-96' : 'h-36'" />
        </div>

        <div v-else-if="products.length">
          <div v-if="gridView" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { LayoutGrid, List, Package } from 'lucide-vue-next';
import api from '@/services/api';
import { useCategoryStore } from '@/stores/categoryStore';
import { getApiCollection, getApiData } from '@/utils/apiResponse';
import { formatEGPCurrency } from '@/utils/currency';
import { useSeo } from '@/composables/useSeo';
import AppImage from '@/components/ui/AppImage.vue';
import ProductCard from '@/components/ui/ProductCard.vue';
import Pagination from '@/components/ui/Pagination.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
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
const sort = ref('');
const gridView = ref(true);

const filters = reactive({
  category: route.query.category || '',
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

const productDisplayName = (product) =>
  locale.value === 'ar'
    ? product.name_ar || product.name_en || product.title || product.name || 'Product'
    : product.name_en || product.name_ar || product.title || product.name || 'Product';

const productVendor = (product) =>
  product.vendor?.company_name || product.vendor?.name || product.company_name || (locale.value === 'ar' ? 'مورد' : 'Supplier');

const productCategory = (product) =>
  product.category_name || (locale.value === 'ar' ? 'فئة' : 'Category');

const productPrice = (product) =>
  formatEGPCurrency(product.discount_price || product.price_min || product.price || 0, locale.value);

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
      ...(filters.category && { category: filters.category }),
      ...(filters.minPrice && { minPrice: filters.minPrice }),
      ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
      ...((route.query.q || route.query.search) && { search: route.query.q || route.query.search }),
      ...(route.query.filter === 'discounted' && { filter: 'discounted' }),
      ...(sort.value && {
        sortBy:
          sort.value === 'price_asc'
            ? 'price_low'
            : sort.value === 'price_desc'
              ? 'price_high'
              : sort.value
      })
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

const applyFilters = () => {
  page.value = 1;
  fetchProducts();
};

const changePage = (nextPage) => {
  page.value = nextPage;
  fetchProducts();
};

const clearFilters = () => {
  filters.category = '';
  filters.minPrice = '';
  filters.maxPrice = '';
  page.value = 1;
  fetchProducts();
};

const heroEyebrow = computed(() =>
  route.query.filter === 'discounted'
    ? locale.value === 'ar'
      ? 'عروض ومصادر معتمدة'
      : 'Approved sourcing offers'
    : locale.value === 'ar'
      ? 'سوق المورد العام'
      : 'Public sourcing marketplace'
);

const heroTitle = computed(() =>
  locale.value === 'ar'
    ? 'منتجات معتمدة وجاهزة للتواصل والتفاوض'
    : 'Approved products ready for sourcing and negotiation'
);

const heroDescription = computed(() =>
  locale.value === 'ar'
    ? 'استكشف المنتجات المنشورة بعد المراجعة فقط، وقارن السعر والحد الأدنى والمورد المناسب، ثم ابدأ الاستفسار السياقي مباشرة.'
    : 'Discover moderation-approved products only, compare pricing and MOQ, then launch a contextual inquiry directly with the right supplier.'
);

const resultsLabel = computed(() => (locale.value === 'ar' ? 'النتائج' : 'Results'));
const approvalLabel = computed(() => (locale.value === 'ar' ? 'الحالة' : 'Status'));
const approvedOnlyLabel = computed(() => (locale.value === 'ar' ? 'معتمد فقط' : 'Approved only'));
const modelLabel = computed(() => (locale.value === 'ar' ? 'النموذج' : 'Model'));
const modelValueLabel = computed(() => (locale.value === 'ar' ? 'استفسار + تفاوض' : 'Inquiry + negotiation'));
const filtersTitle = computed(() => (locale.value === 'ar' ? 'الفلاتر' : 'Filters'));
const clearLabel = computed(() => (locale.value === 'ar' ? 'مسح' : 'Clear'));
const categoryLabel = computed(() => (locale.value === 'ar' ? 'الفئة' : 'Category'));
const allCategoriesLabel = computed(() => (locale.value === 'ar' ? 'كل الفئات' : 'All categories'));
const priceRangeLabel = computed(() => (locale.value === 'ar' ? 'نطاق السعر' : 'Price range'));
const minLabel = computed(() => (locale.value === 'ar' ? 'الأدنى' : 'Min'));
const maxLabel = computed(() => (locale.value === 'ar' ? 'الأعلى' : 'Max'));
const applyFiltersLabel = computed(() => (locale.value === 'ar' ? 'تطبيق الفلاتر' : 'Apply filters'));
const gridHeading = computed(() => (locale.value === 'ar' ? 'شبكة المنتجات المعتمدة' : 'Approved product grid'));
const loadingLabel = computed(() => (locale.value === 'ar' ? 'جاري التحميل...' : 'Loading...'));
const summaryLabel = computed(() =>
  locale.value === 'ar' ? `تم العثور على ${total.value} منتجًا جاهزًا للاستكشاف` : `${total.value} products ready to explore`
);
const defaultSortLabel = computed(() => (locale.value === 'ar' ? 'الترتيب الافتراضي' : 'Default sorting'));
const sortPriceAscLabel = computed(() => (locale.value === 'ar' ? 'السعر: من الأقل' : 'Price: low to high'));
const sortPriceDescLabel = computed(() => (locale.value === 'ar' ? 'السعر: من الأعلى' : 'Price: high to low'));
const sortNewestLabel = computed(() => (locale.value === 'ar' ? 'الأحدث' : 'Newest'));
const noProductsTitle = computed(() => (locale.value === 'ar' ? 'لا توجد منتجات مطابقة' : 'No products found'));
const noProductsDescription = computed(() =>
  locale.value === 'ar'
    ? 'جرّب تعديل الفئة أو نطاق السعر للعثور على نتائج أخرى.'
    : 'Try adjusting the category or price range to discover more results.'
);

useSeo(() => ({
  title: locale.value === 'ar' ? 'المنتجات | Elmowared' : 'Products | Elmowared',
  description: heroDescription.value,
  canonical: '/products',
  ogType: 'website',
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: heroTitle.value,
      description: heroDescription.value,
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
          name: locale.value === 'ar' ? 'المنتجات' : 'Products',
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
    filters.category = route.query.category || '';
    fetchProducts();
  }
);

onMounted(() => {
  whenBrowserIdle(() => {
    categoryStore.fetchCategories();
  }, 120);
  fetchProducts();
});
</script>

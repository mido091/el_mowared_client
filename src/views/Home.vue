<template>
  <div class="min-h-screen bg-background pb-20">
    <section class="relative min-h-[520px] overflow-hidden bg-[#0A1020] pt-10 pb-16 lg:min-h-[580px] lg:pb-24">
      <!-- Unified dark premium background -->
      <div class="pointer-events-none absolute inset-0 bg-hero-mesh opacity-60 mix-blend-screen"></div>
      
      <!-- Smooth ambient glows to add depth without sharp dividers -->
      <div class="pointer-events-none absolute -top-40 -end-40 h-[600px] w-[600px] rounded-full bg-teal-500/10 blur-[120px]"></div>
      <div class="pointer-events-none absolute -bottom-40 -start-40 h-[600px] w-[600px] rounded-full bg-navy-500/20 blur-[120px]"></div>

      <div class="container-wide relative z-10">
        <div class="grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
          <div class="mx-auto max-w-2xl space-y-8 text-center lg:mx-0 lg:text-start">
            <div class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 shadow-glow-teal backdrop-blur-md">
              <span class="h-2 w-2 rounded-full bg-primary animate-pulse"></span>
              <span class="ui-kicker-on-dark">{{ t('home.hero_badge') }}</span>
            </div>

            <div class="space-y-4">
              <h1 class="mb-4 text-2xl font-black leading-[1.6] tracking-tight text-white md:text-3xl md:leading-[1.4] lg:text-[2.85rem]">
                {{ t('home.hero_title_1') }}
                <span class="mx-2 bg-teal-gradient bg-clip-text text-transparent">
                  {{ t('home.hero_title_2') }}
                </span>
              </h1>
              <p class="mx-auto max-w-lg text-base font-medium leading-relaxed text-white/80 lg:mx-0 md:text-lg">
                {{ t('home.heroSubtitle') }}
              </p>
            </div>

            <div class="relative group mt-8 w-full max-w-3xl mx-auto lg:mx-0">
              <div class="absolute -inset-1 rounded-3xl bg-teal-gradient opacity-25 blur transition duration-500 group-hover:opacity-40"></div>
              <div class="relative flex flex-col items-stretch gap-2 rounded-2xl border border-white/20 bg-white/10 p-2 shadow-2xl backdrop-blur-xl dark:bg-black/40 sm:flex-row sm:items-center">
                <select
                  v-model="selectedCategory"
                  class="hidden min-w-[140px] cursor-pointer appearance-none border-e border-white/20 bg-transparent px-4 py-3 text-sm font-bold text-white outline-none sm:block"
                >
                  <option :value="null" class="bg-white text-black">{{ t('common.allCats') }}</option>
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id" class="bg-white text-black">
                    {{ cat.name }}
                  </option>
                </select>
                <input
                  v-model="heroSearch"
                  @keydown.enter="doSearch"
                  :placeholder="t('common.searchPlaceholder')"
                  class="w-full min-w-0 flex-1 bg-transparent px-4 py-3 text-sm font-medium text-white outline-none placeholder:text-white/60 md:text-base"
                />
                <button @click="doSearch" class="btn-primary flex shrink-0 items-center justify-center rounded-xl px-8 py-3 font-bold transition-transform active:scale-95">
                  <Search class="me-2 h-5 w-5" />
                  <span>{{ t('common.search') }}</span>
                </button>
              </div>
            </div>

            <div class="flex flex-wrap items-center justify-center gap-3 pt-4 lg:justify-start">
              <span class="ui-kicker-on-dark text-white/55">{{ t('home.popular') }}:</span>
              <button
                v-for="term in popularSearches"
                :key="term.key"
                @click="applyPopularSearch(term)"
                class="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-white/70 transition-all hover:border-secondary/50 hover:bg-secondary/20 hover:text-white"
              >
                {{ term.label }}
              </button>
            </div>
          </div>

          <div class="hidden justify-center lg:flex">
            <div class="relative z-10 w-full max-w-[36rem]">
              <div class="absolute inset-x-12 bottom-6 top-16 rounded-full bg-gradient-to-t from-teal-500/25 to-blue-500/12 blur-3xl"></div>
              <div class="relative overflow-hidden rounded-[2.5rem] border border-white/15 bg-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.38)]">
                <AppImage
                  :src="heroImage"
                  :alt="t('home.hero_title_1')"
                  :width="600"
                  :height="450"
                  fetchpriority="high"
                  loading="eager"
                  sizes="(min-width: 1280px) 600px, (min-width: 1024px) 50vw, 100vw"
                  img-class="h-[450px] w-full object-cover"
                  :optimize="false"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-[#0B1E3C]/70 via-transparent to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="container-wide relative z-20 -mt-12 mb-16">
      <div class="animate-scale-in rounded-3xl border border-slate-200/90 bg-white p-6 shadow-[0_22px_54px_-30px_rgba(15,23,42,0.32)] lg:p-8">
        <div class="grid grid-cols-2 gap-8 divide-x divide-border/50 rtl:divide-x-reverse lg:grid-cols-4">
            <div
              v-for="(stat, idx) in stats"
              :key="stat.label"
              class="flex flex-col items-center justify-center px-4 text-center"
              :class="{ 'border-l-0': idx === 0 }"
            >
              <div class="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600 ring-1 ring-teal-500/15">
                <component :is="stat.icon" class="h-6 w-6" />
              </div>
              <p class="mb-1 text-3xl font-black tracking-tight text-slate-900">{{ stat.value }}</p>
              <p class="text-sm font-semibold text-slate-500">{{ stat.label }}</p>
            </div>
          </div>
        </div>
      </div>

    <div class="container-wide space-y-24">
      <section>
        <div class="mb-8 flex items-end justify-between">
          <div>
            <div class="mb-2 flex items-center gap-3">
              <span class="h-1 w-8 rounded-full bg-teal-500"></span>
              <span class="ui-kicker-primary">{{ t('common.categories') }}</span>
            </div>
            <h2 class="text-3xl font-black tracking-tight text-foreground lg:text-4xl">{{ t('home.browseCategories') }}</h2>
          </div>
          <router-link to="/products" class="group flex items-center gap-2 text-sm font-bold text-primary transition-all hover:text-secondary">
            {{ t('common.view_all') }}
            <ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
          </router-link>
        </div>

        <div v-if="categoriesLoading" class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
          <div v-for="i in 7" :key="`category-skeleton-${i}`" class="skeleton h-40 rounded-2xl" />
        </div>
        <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          <router-link
            v-for="cat in rootCategories"
            :key="cat.id"
            :to="`/products?category=${cat.id}`"
            class="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-500/50 hover:shadow-premium-hover"
          >
            <div class="absolute inset-0 bg-gradient-to-b from-teal-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            <div class="relative z-10 flex items-start gap-4">
              <div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-teal-500/5 text-teal-600 ring-8 ring-teal-500/5 transition-all duration-300 group-hover:bg-teal-500 group-hover:text-white dark:text-teal-400 dark:group-hover:text-white">
                <component :is="getIcon(cat.icon)" class="h-7 w-7" />
              </div>
              <div class="min-w-0 flex-1 text-start">
                <span class="block text-sm font-bold text-foreground transition-colors group-hover:text-teal-600 dark:group-hover:text-teal-400">
                  {{ cat.label }}
                </span>
                <div class="mt-3 flex flex-wrap gap-1.5">
                  <span
                    v-for="child in getChildren(cat.id).slice(0, 3)"
                    :key="child.id"
                    class="rounded-full bg-teal-500/5 px-2 py-1 text-[10px] font-bold text-muted-foreground"
                  >
                    {{ child.label }}
                  </span>
                </div>
              </div>
            </div>
          </router-link>
        </div>
      </section>

      <section ref="featuredSectionRef">
        <div class="mb-10 flex items-end justify-between">
          <div>
            <div class="mb-2 flex items-center gap-3">
              <span class="h-1 w-8 rounded-full bg-accent"></span>
              <span class="ui-kicker-primary text-accent">{{ t('home.trending') }}</span>
            </div>
            <h2 class="text-3xl font-black tracking-tight text-foreground lg:text-4xl">{{ t('home.featuredProducts') }}</h2>
          </div>
          <router-link to="/products" class="hidden border-2 border-border/60 btn-outline font-bold sm:flex">
            {{ t('home.view_all') }}
          </router-link>
        </div>

        <div v-if="loadingProducts" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div v-for="i in 8" :key="`product-skeleton-${i}`" class="card overflow-hidden">
            <div class="skeleton aspect-square" />
            <div class="space-y-3 p-5">
              <div class="skeleton h-4 w-3/4 rounded" />
              <div class="skeleton h-6 w-full rounded" />
              <div class="skeleton h-5 w-1/2 rounded" />
            </div>
          </div>
        </div>

        <div v-else-if="products.length" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <LazyProductCard v-for="p in products" :key="p.id" :product="p" class="h-full transform transition duration-300 hover:-translate-y-1" />
        </div>
        <LazyEmptyState v-else :title="t('products.noProducts')" :icon="Package" />
      </section>

      <section class="group relative w-full overflow-hidden rounded-[2.5rem] border border-border/20 bg-[#0F172A] shadow-2xl">
        <div class="absolute inset-0 bg-auth-gradient opacity-80 mix-blend-multiply"></div>
        <div class="absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-teal-500/30 blur-[100px] transition-transform duration-1000 ease-out group-hover:scale-110"></div>

        <div class="relative z-10 flex flex-col items-center justify-between gap-12 px-8 py-16 lg:flex-row lg:px-20 lg:py-24">
          <div class="max-w-2xl text-center lg:text-start">
            <div class="mb-6 inline-flex items-center gap-2">
              <span class="w-fit rounded-full border border-primary/30 bg-primary/20 px-3 py-1 text-xs font-bold text-primary">
                {{ t('home.enterprise_sourcing') }}
              </span>
            </div>
            <h2 class="mb-6 text-3xl font-black leading-snug text-white md:text-4xl lg:text-5xl">
              {{ t('home.rfqCtaTitle') }}
            </h2>
            <p class="text-base font-medium leading-relaxed text-white/70 md:text-lg">
              {{ t('home.rfqCtaDesc') }}
            </p>
          </div>

          <div class="flex w-full shrink-0 flex-col gap-4 sm:flex-row lg:w-auto">
            <router-link to="/rfq/post" class="btn-primary btn-lg flex w-full items-center justify-center text-base shadow-glow-teal transition-transform hover:scale-105 sm:w-auto">
              <FileText class="me-2 h-5 w-5" />
              <span>{{ t('rfq.postRfq') }}</span>
            </router-link>
            <router-link to="/rfq" class="btn btn-lg flex w-full items-center justify-center border border-white/20 bg-white/5 text-base font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/10 sm:w-auto">
              <span>{{ t('rfq.browseRfqs') }}</span>
            </router-link>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useIntersectionObserver } from '@vueuse/core';
import {
  Search, ArrowRight, Camera, Cpu, Activity, Radio, Database, Lock, Flame,
  Package, FileText, Users, UserCheck, Globe, LayoutGrid,
  Wifi, Monitor, Box, ShieldCheck
} from 'lucide-vue-next';
import api from '@/services/api';
import { getApiCollection, getApiData } from '@/utils/apiResponse';
import { useCategoryStore } from '@/stores/categoryStore';
import { useSettingsStore } from '@/stores/settings';
import { useMarketplaceRealtimeStore } from '@/stores/marketplaceRealtimeStore';
import AppImage from '@/components/ui/AppImage.vue';
import { useSeo } from '@/composables/useSeo';
import { useCategoryHierarchy } from '@/composables/useCategoryHierarchy';
import { whenBrowserIdle } from '@/utils/scheduling';
import heroImage from '@/assets/images/hero_b2b.png';

const LazyProductCard = defineAsyncComponent(() => import('@/components/ui/ProductCard.vue'));
const LazyEmptyState = defineAsyncComponent(() => import('@/components/ui/EmptyState.vue'));

const { t, locale } = useI18n();
const router = useRouter();
const categoryStore = useCategoryStore();
const settingsStore = useSettingsStore();
const marketplaceRealtimeStore = useMarketplaceRealtimeStore();

const heroSearch = ref('');
const selectedCategory = ref(null);
const products = ref([]);
const loadingProducts = ref(true);
const categoriesLoading = ref(true);
const featuredSectionRef = ref(null);
const hasLoadedFeatured = ref(false);
const marketplaceSummary = ref({
  total_vendors: 0,
  total_products: 0,
  total_completed_orders: 0,
  total_countries: 0,
  total_users: 0
});

useSeo(() => ({
  title: locale.value === 'ar'
    ? 'Elmowared | بوابة التوريد الذكية'
    : 'Elmowared | Smart B2B Marketplace',
  description: locale.value === 'ar'
    ? 'بوابة التوريد الذكية للوصول إلى شبكة معتمدة من المصانع والموزعين ومقارنة أفضل العروض في منصة واحدة.'
    : 'Smart B2B sourcing marketplace to connect buyers with trusted suppliers, compare offers, and discover products across MENA.',
  image: heroImage,
  canonical: `${window.location.origin}/`,
  preloadImages: [heroImage],
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Elmowared',
      url: window.location.origin,
      logo: settingsStore.logo || `${window.location.origin}/favicon.svg`,
      description: locale.value === 'ar'
        ? 'منصة B2B ذكية للمشتريات والتوريد.'
        : 'A smart B2B marketplace for procurement and sourcing.'
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Elmowared',
      url: window.location.origin,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${window.location.origin}/products?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    }
  ]
}));


const doSearch = () => {
  const query = {};
  if (heroSearch.value.trim()) query.q = heroSearch.value.trim();
  if (selectedCategory.value) query.category = selectedCategory.value;

  if (Object.keys(query).length > 0) {
    router.push({ path: '/products', query });
  }
};

const applyPopularSearch = (term) => {
  if (!term) return;

  if (term.type === 'category' && term.categoryId) {
    selectedCategory.value = term.categoryId;
    heroSearch.value = '';
    router.push({ path: '/products', query: { category: term.categoryId } });
    return;
  }

  heroSearch.value = term.label;
  selectedCategory.value = null;
  router.push({ path: '/products', query: { q: term.label } });
};

const formatMetric = (value) => {
  const numeric = Number(value || 0);
  if (numeric >= 1000) return `${Math.round(numeric / 100) / 10}K+`;
  return `${numeric}+`;
};

const stats = computed(() => [
  { icon: Users, value: formatMetric(marketplaceSummary.value.total_vendors), label: t('home.statVendors') },
  { icon: Package, value: formatMetric(marketplaceSummary.value.total_products), label: t('home.statProducts') },
  { icon: UserCheck, value: formatMetric(marketplaceSummary.value.total_users), label: t('home.statUsers') },
  { icon: Globe, value: '15+', label: t('home.statRegions') }
]);

const popularSearches = computed(() => {
  const categoryTerms = rootCategories.value
    .filter((category) => category?.id && category?.name)
    .slice(0, 4)
    .map((category) => ({
      key: `category-${category.id}`,
      label: category.label,
      type: 'category',
      categoryId: category.id
    }));

  if (categoryTerms.length >= 4) return categoryTerms;

  const productTerms = products.value
    .filter((product) => product?.id)
    .map((product) => ({
      key: `product-${product.id}`,
      label: locale.value === 'ar'
        ? (product.name_ar || product.name_en || product.name || '')
        : (product.name_en || product.name_ar || product.name || ''),
      type: 'search'
    }))
    .filter((term) => term.label && !categoryTerms.some((category) => category.label === term.label))
    .slice(0, Math.max(0, 4 - categoryTerms.length));

  return [...categoryTerms, ...productTerms];
});

const iconMap = {
  camera: Camera,
  cpu: Cpu,
  activity: Activity,
  radio: Radio,
  database: Database,
  shieldcheck: ShieldCheck,
  flame: Flame,
  lock: Lock,
  wifi: Wifi,
  monitor: Monitor,
  box: Box,
  default: LayoutGrid
};

const getIcon = (name) => {
  if (!name) return iconMap.default;
  const key = name.toLowerCase().replace(/\s+/g, '');
  return iconMap[key] || iconMap.default;
};

const categories = computed(() => categoryStore.localizedCategories(locale.value));
const { rootCategories, getChildren } = useCategoryHierarchy(categories, locale);

const loadFeaturedProducts = async () => {
  if (hasLoadedFeatured.value) return;
  hasLoadedFeatured.value = true;

  try {
    const res = await api.get('/products', { params: { limit: 8 } });
    products.value = getApiCollection(res, ['products', 'items']);
  } catch (err) {
    console.error('Featured products load failed:', err);
    products.value = [];
  } finally {
    loadingProducts.value = false;
  }
};

const loadCategories = async () => {
  try {
    await categoryStore.fetchCategories({ mode: 'revalidate' });
  } catch (err) {
    console.error('Category load failed:', err);
  } finally {
    categoriesLoading.value = false;
  }
};

const loadMarketplaceSummary = async () => {
  try {
    const res = await api.get('/products/summary/public');
    marketplaceSummary.value = getApiData(res) || marketplaceSummary.value;
  } catch (err) {
    console.error('Marketplace summary load failed:', err);
  }
};

useIntersectionObserver(
  featuredSectionRef,
  ([entry]) => {
    if (entry?.isIntersecting) {
      loadFeaturedProducts();
    }
  },
  { rootMargin: '200px 0px' }
);

onMounted(() => {
  const schedule = () => {
    loadMarketplaceSummary();
    loadCategories();
  };
  whenBrowserIdle(schedule, 150);
});

watch(
  () => marketplaceRealtimeStore.productRevision,
  (revision, previousRevision) => {
    if (!revision || revision === previousRevision) return;
    if (hasLoadedFeatured.value) {
      loadFeaturedProducts();
    }
  }
);

watch(
  () => marketplaceRealtimeStore.summaryRevision,
  (revision, previousRevision) => {
    if (!revision || revision === previousRevision) return;
    loadMarketplaceSummary();
  }
);
</script>


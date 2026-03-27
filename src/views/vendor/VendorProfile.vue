<template>
  <div
    v-if="vendor"
    class="bg-gradient-to-b from-white via-slate-50/70 to-white py-8 text-slate-900 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 dark:text-slate-100"
    :dir="locale === 'ar' ? 'rtl' : 'ltr'"
  >
    <div class="container-wide font-plex">
      <section class="ui-surface-soft relative overflow-hidden">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.14),transparent_26%),radial-gradient(circle_at_82%_18%,rgba(6,182,212,0.28),transparent_30%),linear-gradient(135deg,#0f172a_0%,#16233b_42%,#0f766e_130%)]" />
        <div class="absolute -start-16 top-20 h-52 w-52 rounded-full bg-white/8 blur-3xl" />
        <div class="absolute end-0 top-0 h-64 w-64 rounded-full bg-[hsl(var(--primary))/0.18] blur-3xl" />

        <div class="relative p-6 md:p-8">
          <div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-stretch">
            <div class="space-y-6">
              <div class="flex flex-col gap-5 md:flex-row md:items-center">
                <div class="flex h-28 w-28 items-center justify-center overflow-hidden rounded-[2rem] border border-white/20 bg-white/95 text-3xl font-black text-[#1e293b] shadow-2xl">
                  <AppImage
                    v-if="vendorLogo"
                    :src="vendorLogo"
                    :alt="vendorName"
                    :width="112"
                    :height="112"
                    fetchpriority="high"
                    sizes="112px"
                    img-class="h-full w-full object-cover"
                  />
                  <span v-else>{{ vendorInitial }}</span>
                </div>

                <div class="min-w-0 flex-1">
                  <div class="mb-3 flex flex-wrap items-center gap-2">
                    <span class="inline-flex items-center gap-2 rounded-full bg-white/14 px-3 py-1 text-xs font-bold text-white backdrop-blur">
                      <span class="h-2 w-2 rounded-full bg-[hsl(var(--primary))]" />
                      {{ trustedSupplierLabel }}
                    </span>
                    <span
                      v-if="isVerified"
                      class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 shadow-sm"
                    >
                      <BadgeCheck class="h-3.5 w-3.5" />
                      {{ verifiedLabel }}
                    </span>
                  </div>

                  <h1 class="text-3xl font-black text-white md:text-[2.75rem]">
                    {{ vendorName }}
                  </h1>
                  <p class="mt-3 max-w-3xl text-sm leading-7 text-slate-200 md:text-base">
                    {{ vendorAbout || noAboutLabel }}
                  </p>
                </div>
              </div>

              <div class="grid gap-3 sm:grid-cols-3">
                <div class="rounded-[1.4rem] border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <p class="ui-kicker-on-dark">{{ productsLabel }}</p>
                  <p class="mt-2 text-2xl font-black text-white">{{ publicProductsCount }}</p>
                </div>
                <div class="rounded-[1.4rem] border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <p class="ui-kicker-on-dark">{{ reviewsLabel }}</p>
                  <p class="mt-2 text-2xl font-black text-white">{{ vendorReviewCount }}</p>
                </div>
                <div class="rounded-[1.4rem] border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <p class="ui-kicker-on-dark">{{ ratingLabel }}</p>
                  <div class="mt-2 flex items-center gap-2 text-2xl font-black text-white">
                    <Star class="h-5 w-5 fill-amber-400 text-amber-400" />
                    {{ averageRatingLabel }}
                  </div>
                </div>
              </div>

              <div class="flex flex-wrap gap-3 text-xs text-white/90">
                <span class="rounded-full border border-white/15 bg-white/10 px-3 py-2 backdrop-blur">
                  {{ memberSinceLabel }}
                </span>
                <span class="rounded-full border border-white/15 bg-white/10 px-3 py-2 backdrop-blur">
                  {{ locationLabel }}
                </span>
                <span class="rounded-full border border-white/15 bg-white/10 px-3 py-2 backdrop-blur">
                  {{ productsCountLabel }}
                </span>
              </div>
            </div>

            <aside class="rounded-[1.75rem] border border-white/15 bg-white/10 p-5 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.35)] backdrop-blur-xl">
              <div class="mb-5 space-y-3">
                <p class="ui-kicker-on-dark">
                  {{ supplierSnapshotLabel }}
                </p>
                <div class="grid grid-cols-2 gap-3">
                  <div class="rounded-2xl bg-white/10 p-4">
                    <p class="ui-kicker-on-dark mb-1">
                      {{ ratingLabel }}
                    </p>
                    <div class="flex items-center gap-1 text-lg font-black text-white">
                      <Star class="h-4 w-4 fill-amber-400 text-amber-400" />
                      {{ averageRatingLabel }}
                    </div>
                  </div>
                  <div class="rounded-2xl bg-white/10 p-4">
                    <p class="ui-kicker-on-dark mb-1">
                      {{ reviewsLabel }}
                    </p>
                    <p class="text-lg font-black text-white">
                      {{ vendorReviewCount }}
                    </p>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div class="rounded-2xl bg-white/10 p-4">
                    <p class="ui-kicker-on-dark mb-1">
                      {{ responseRateLabel }}
                    </p>
                    <p class="text-lg font-black text-white">
                      {{ responseRateValue }}
                    </p>
                  </div>
                  <div class="rounded-2xl bg-white/10 p-4">
                    <p class="ui-kicker-on-dark mb-1">
                      {{ completedDealsLabel }}
                    </p>
                    <p class="text-lg font-black text-white">
                      {{ vendorCompletedDeals }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="mb-5 space-y-3">
                <div class="rounded-2xl bg-white/10 p-4 text-sm text-slate-100">
                  <p class="ui-kicker-on-dark">{{ categoriesLabel }}</p>
                  <div class="mt-3 flex flex-wrap gap-2">
                    <span
                      v-for="category in categories.slice(0, 4)"
                      :key="category.id || category.name_en || category.name_ar"
                      class="rounded-full bg-white/12 px-3 py-1 text-xs font-bold text-white"
                    >
                      {{ localizeField(category, 'name', 'Category') }}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                class="inline-flex w-full items-center justify-center gap-2 rounded-[1.2rem] bg-[hsl(var(--primary))] px-4 py-3 text-sm font-black text-white shadow-[0_16px_40px_-24px_hsl(var(--primary))]"
                :disabled="chatStore.sending"
                @click="contactVendor"
              >
                <Loader2 v-if="chatStore.sending" class="h-4 w-4 animate-spin" />
                <MessageSquare v-else class="h-4 w-4" />
                {{ contactSupplierLabel }}
              </button>
            </aside>
          </div>
        </div>
      </section>

      <section class="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div class="space-y-6">
          <div class="ui-surface p-4">
            <div class="flex flex-wrap gap-2">
              <button
                v-for="tab in tabs"
                :key="tab.key"
                type="button"
                class="rounded-full px-4 py-2 text-sm font-bold transition"
                :class="activeTab === tab.key ? 'bg-[hsl(var(--primary))] text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:text-[hsl(var(--primary))] dark:bg-slate-800 dark:text-slate-300'"
                @click="activeTab = tab.key"
              >
                {{ tab.label }}
              </button>
            </div>
          </div>

          <div
            v-if="activeTab === 'products'"
            class="ui-surface p-6"
          >
            <div class="mb-5 flex items-center justify-between gap-4">
              <div>
                <p class="ui-kicker-primary">
                  {{ storefrontLabel }}
                </p>
                <h2 class="text-2xl font-black text-[#1e293b] dark:text-white">
                  {{ approvedProductsLabel }}
                </h2>
              </div>
            </div>

            <div v-if="loadingProducts" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <div v-for="i in 6" :key="i" class="skeleton h-80 rounded-[1.5rem]" />
            </div>
            <div v-else-if="products.length" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <ProductCard v-for="item in products" :key="item.id" :product="item" />
            </div>
            <div
              v-else
              class="rounded-[1.4rem] border border-dashed border-slate-300 bg-slate-50/80 p-10 text-center text-sm font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-400"
            >
              {{ noProductsLabel }}
            </div>
          </div>

          <ReviewSection
            v-else-if="activeTab === 'reviews'"
            type="vendor"
            :target-id="Number(route.params.id)"
          />

          <div
            v-else
            class="ui-surface p-6"
          >
            <div class="mb-5">
              <p class="ui-kicker-primary">
                {{ aboutLabel }}
              </p>
              <h2 class="text-2xl font-black text-[#1e293b] dark:text-white">
                {{ aboutHeadingLabel }}
              </h2>
            </div>
            <p class="whitespace-pre-wrap text-sm leading-8 text-slate-600 dark:text-slate-300">
              {{ vendorAbout || noAboutLabel }}
            </p>
          </div>
        </div>

        <aside class="space-y-6">
          <div class="ui-surface p-6">
            <div class="mb-4 flex items-center gap-3">
              <div class="h-10 w-1.5 rounded-full bg-[hsl(var(--primary))]" />
              <div>
                <p class="ui-kicker-primary">
                  {{ trustSignalsLabel }}
                </p>
                <h3 class="text-xl font-black text-[#1e293b] dark:text-white">
                  {{ supplierSnapshotLabel }}
                </h3>
              </div>
            </div>
            <div class="space-y-3">
              <div class="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/70">
                <p class="ui-kicker">{{ categoriesLabel }}</p>
                <div class="mt-3 flex flex-wrap gap-2">
                  <span
                    v-for="category in categories"
                    :key="category.id || category.name_en || category.name_ar"
                    class="rounded-full bg-[hsl(var(--primary))/0.12] px-3 py-1 text-xs font-bold text-[hsl(var(--primary))]"
                  >
                    {{ localizeField(category, 'name', 'Category') }}
                  </span>
                </div>
              </div>

              <div class="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/70">
                <p class="ui-kicker">{{ contactChannelsLabel }}</p>
                <div class="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <p>{{ vendor.email || fallbackDash }}</p>
                  <p>{{ vendor.phone || fallbackDash }}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </div>
  </div>

  <div v-else-if="loading" class="container-wide space-y-6 py-8">
    <div class="skeleton h-72 rounded-[2rem]" />
    <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div class="space-y-4">
        <div class="skeleton h-20 rounded-[1.5rem]" />
        <div class="skeleton h-[28rem] rounded-[1.75rem]" />
      </div>
      <div class="skeleton h-80 rounded-[1.75rem]" />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { BadgeCheck, Loader2, MessageSquare, Star } from 'lucide-vue-next';
import api from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import { useChatStore } from '@/stores/chat';
import { useNotificationStore } from '@/stores/notificationStore';
import { getApiCollection, getApiData } from '@/utils/apiResponse';
import { useSeo } from '@/composables/useSeo';
import AppImage from '@/components/ui/AppImage.vue';
import ProductCard from '@/components/ui/ProductCard.vue';
import ReviewSection from '@/components/reviews/ReviewSection.vue';

const { locale } = useI18n();
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const chatStore = useChatStore();
const notificationStore = useNotificationStore();

const vendor = ref(null);
const vendorMetrics = ref(null);
const products = ref([]);
const loading = ref(true);
const loadingProducts = ref(true);
const activeTab = ref('products');

const apiOrigin = (() => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
  return apiUrl.replace(/\/api\/v\d+\/?$/, '');
})();

const localizeField = (entity, field, fallback = '') => {
  if (!entity) return fallback;
  const preferred = locale.value === 'ar' ? entity[`${field}_ar`] : entity[`${field}_en`];
  const alternate = locale.value === 'ar' ? entity[`${field}_en`] : entity[`${field}_ar`];
  return preferred || alternate || entity[field] || fallback;
};

const resolveAssetUrl = (src) => {
  if (!src) return '';
  if (/^(https?:)?\/\//i.test(src) || src.startsWith('data:') || src.startsWith('blob:')) return src;
  if (src.startsWith('/')) return `${apiOrigin}${src}`;
  return `${apiOrigin}/${src}`;
};

const loadVendorPage = async () => {
  loading.value = true;
  loadingProducts.value = true;
  try {
    const vendorId = route.params.id;
    const [vendorResponse, productsResponse, metricsResponse] = await Promise.allSettled([
      api.get(`/vendors/${vendorId}`),
      api.get(`/products/vendor/${vendorId}`),
      api.get(`/vendors/${vendorId}/metrics`)
    ]);

    if (vendorResponse.status === 'fulfilled') {
      const vendorData = getApiData(vendorResponse.value);
      vendor.value = vendorData?.vendor || vendorData;
    }

    if (productsResponse.status === 'fulfilled') {
      products.value = getApiCollection(productsResponse.value, ['items', 'products']);
      if (!vendor.value && products.value[0]?.vendor) {
        vendor.value = products.value[0].vendor;
      }
    }

    if (metricsResponse.status === 'fulfilled') {
      vendorMetrics.value = getApiData(metricsResponse.value) || null;
    } else {
      vendorMetrics.value = null;
    }

  } finally {
    loading.value = false;
    loadingProducts.value = false;
  }
};

const vendorName = computed(() => localizeField(vendor.value, 'company_name', 'Vendor'));
const vendorLogo = computed(() => resolveAssetUrl(vendor.value?.logo || vendor.value?.profile_image_url || ''));
const vendorInitial = computed(() => vendorName.value.charAt(0).toUpperCase() || 'V');
const vendorAbout = computed(() => localizeField(vendor.value, 'bio', ''));
const isVerified = computed(() => {
  const status = `${vendor.value?.verification_status || ''}`.toUpperCase();
  return status === 'APPROVED' || Boolean(vendor.value?.is_verified);
});
const categories = computed(() => Array.isArray(vendor.value?.categories) ? vendor.value.categories : []);
const publicProductsCount = computed(() => {
  const metricsCount = Number(vendorMetrics.value?.total_products || 0);
  return metricsCount > 0 ? metricsCount : products.value.length;
});
const averageRatingValue = computed(() => {
  const value = Number(vendorMetrics.value?.rating ?? vendor.value?.avg_rating ?? 0);
  return value > 0 ? value.toFixed(1) : null;
});
const vendorReviewCount = computed(() => Number(vendorMetrics.value?.review_count ?? vendor.value?.review_count ?? 0));
const vendorResponseRate = computed(() => Number(vendorMetrics.value?.response_rate || 0));
const vendorCompletedDeals = computed(() => Number(vendorMetrics.value?.completed_deals || 0));

const ensureAuth = () => {
  if (authStore.isAuthenticated) return true;
  router.push('/login');
  return false;
};
const contactVendor = async () => {
  if (!ensureAuth()) return;
  try {
    const defaultMessage = locale.value === 'ar'
      ? `مرحبًا، أود التعرف على منتجات ${vendorName.value} وخيارات التوريد المتاحة.`
      : `Hello, I would like to learn more about ${vendorName.value} and your available sourcing options.`;

    const result = await chatStore.startChat(vendor.value?.id, null, defaultMessage, 'INQUIRY', {
      vendor_name: vendorName.value,
      vendor_logo: vendorLogo.value,
      vendor_url: `/vendor/${vendor.value?.id}`
    });
    const conversation = result?.conversation || result;

    router.push(`/chat?id=${conversation.id}`);
  } catch {
    notificationStore.error(locale.value === 'ar' ? 'تعذر بدء المحادثة الآن.' : 'Unable to start chat right now.');
  }
};

const trustedSupplierLabel = computed(() => (locale.value === 'ar' ? 'مساحة مورد احترافية' : 'Professional supplier space'));
const verifiedLabel = computed(() => (locale.value === 'ar' ? 'موثّق' : 'Verified'));
const noAboutLabel = computed(() => (locale.value === 'ar' ? 'لا توجد نبذة تفصيلية متاحة حاليًا.' : 'No detailed company profile is available right now.'));
const memberSinceLabel = computed(() => {
  const year = vendor.value?.created_at ? new Date(vendor.value.created_at).getFullYear() : null;
  return locale.value === 'ar' ? `عضو منذ ${year || 'غير متاح'}` : `Member since ${year || 'N/A'}`;
});
const locationLabel = computed(() => locale.value === 'ar'
  ? `الموقع: ${vendor.value?.location || 'غير متاح'}`
  : `Location: ${vendor.value?.location || 'N/A'}`);
const productsCountLabel = computed(() => locale.value === 'ar'
  ? `${publicProductsCount.value} منتج`
  : `${publicProductsCount.value} products`);
const productsLabel = computed(() => (locale.value === 'ar' ? 'المنتجات' : 'Products'));
const ratingLabel = computed(() => (locale.value === 'ar' ? 'التقييم' : 'Rating'));
const averageRatingLabel = computed(() => averageRatingValue.value || (locale.value === 'ar' ? 'جديد' : 'New'));
const reviewsLabel = computed(() => (locale.value === 'ar' ? 'المراجعات' : 'Reviews'));
const responseRateLabel = computed(() => (locale.value === 'ar' ? 'معدل الرد' : 'Response rate'));
const responseRateValue = computed(() => `${Math.round(vendorResponseRate.value || 0)}%`);
const completedDealsLabel = computed(() => (locale.value === 'ar' ? 'الصفقات المكتملة' : 'Completed deals'));
const contactSupplierLabel = computed(() => (locale.value === 'ar' ? 'تواصل مع المورد' : 'Contact Supplier'));
const storefrontLabel = computed(() => (locale.value === 'ar' ? 'واجهة المتجر' : 'Storefront'));
const approvedProductsLabel = computed(() => (locale.value === 'ar' ? 'المنتجات المعتمدة' : 'Approved products'));
const noProductsLabel = computed(() => (locale.value === 'ar' ? 'لا توجد منتجات معتمدة منشورة حاليًا.' : 'No approved products are published yet.'));
const aboutLabel = computed(() => (locale.value === 'ar' ? 'عن المورد' : 'About the supplier'));
const aboutHeadingLabel = computed(() => (locale.value === 'ar' ? 'نبذة الشركة' : 'Company overview'));
const trustSignalsLabel = computed(() => (locale.value === 'ar' ? 'إشارات الثقة' : 'Trust signals'));
const supplierSnapshotLabel = computed(() => (locale.value === 'ar' ? 'لمحة سريعة' : 'Supplier snapshot'));
const categoriesLabel = computed(() => (locale.value === 'ar' ? 'الفئات' : 'Categories'));
const contactChannelsLabel = computed(() => (locale.value === 'ar' ? 'قنوات التواصل' : 'Contact channels'));
const fallbackDash = computed(() => (locale.value === 'ar' ? 'غير متاح' : 'N/A'));

const tabs = computed(() => ([
  { key: 'products', label: locale.value === 'ar' ? 'المنتجات' : 'Products' },
  { key: 'reviews', label: locale.value === 'ar' ? 'المراجعات' : 'Reviews' },
  { key: 'about', label: locale.value === 'ar' ? 'نبذة' : 'About' }
]));

useSeo(() => ({
  title: `${vendorName.value} | Elmowared`,
  description: vendorAbout.value || (locale.value === 'ar' ? 'ملف المورد ومنتجاته ومراجعاته على منصة المورد.' : 'Supplier profile, products, and reviews on Elmowared.'),
  image: vendorLogo.value,
  canonical: `${window.location.origin}/vendor/${route.params.id}`,
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      name: vendorName.value,
      url: `${window.location.origin}/vendor/${route.params.id}`,
      description: vendorAbout.value || undefined
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: vendorName.value,
      url: `${window.location.origin}/vendor/${route.params.id}`,
      logo: vendorLogo.value || undefined,
      description: vendorAbout.value || undefined
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
          name: vendorName.value,
          item: `${window.location.origin}/vendor/${route.params.id}`
        }
      ]
    }
  ]
}));

watch(() => route.params.id, loadVendorPage);
onMounted(loadVendorPage);
</script>

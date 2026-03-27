<template>
  <div class="space-y-8">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div>
        <h1 class="text-3xl font-black text-foreground">{{ title }}</h1>
        <p class="mt-2 text-sm text-muted-foreground">{{ subtitle }}</p>
      </div>
      <button @click="fetchData" class="btn-outline btn-sm" :disabled="loading">
        <RefreshCw class="w-4 h-4 me-2" :class="{ 'animate-spin': loading }" />
        {{ refreshLabel }}
      </button>
    </div>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div class="rounded-[1.6rem] border border-border/60 bg-card p-5">
        <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{{ responseRateLabel }}</p>
        <p class="mt-3 text-3xl font-black text-foreground">{{ Math.round(stats.responseRate || 0) }}%</p>
      </div>
      <div class="rounded-[1.6rem] border border-border/60 bg-card p-5">
        <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{{ avgResponseTimeLabel }}</p>
        <p class="mt-3 text-3xl font-black text-foreground">{{ stats.averageResponseTimeLabel || noDataLabel }}</p>
      </div>
      <div class="rounded-[1.6rem] border border-border/60 bg-card p-5">
        <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{{ completedDealsLabel }}</p>
        <p class="mt-3 text-3xl font-black text-foreground">{{ stats.completedDeals || 0 }}</p>
      </div>
      <div class="rounded-[1.6rem] border border-border/60 bg-card p-5">
        <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{{ activeProductsLabel }}</p>
        <p class="mt-3 text-3xl font-black text-foreground">{{ stats.activeProducts || 0 }}</p>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <div class="rounded-[1.8rem] border border-border/60 bg-card p-6">
        <h2 class="text-xl font-black text-foreground">{{ headlineMetricsTitle }}</h2>
        <div class="mt-6 space-y-4">
          <div class="rounded-2xl border border-border/50 bg-muted/10 p-4">
            <div class="flex items-center justify-between text-sm">
              <span class="font-medium text-muted-foreground">{{ ratingLabel }}</span>
              <span class="font-black text-foreground">{{ Number(stats.rating || 0).toFixed(1) }}</span>
            </div>
            <div class="mt-3 h-2 rounded-full bg-muted/40 overflow-hidden">
              <div class="h-full rounded-full bg-primary" :style="{ width: `${Math.min(100, (Number(stats.rating || 0) / 5) * 100)}%` }" />
            </div>
          </div>

          <div class="rounded-2xl border border-border/50 bg-muted/10 p-4">
            <div class="flex items-center justify-between text-sm">
              <span class="font-medium text-muted-foreground">{{ trustScoreLabel }}</span>
              <span class="font-black text-foreground">{{ Math.round(stats.trustScore || 0) }}</span>
            </div>
            <div class="mt-3 h-2 rounded-full bg-muted/40 overflow-hidden">
              <div class="h-full rounded-full bg-secondary" :style="{ width: `${Math.min(100, Number(stats.trustScore || 0))}%` }" />
            </div>
          </div>

          <div class="rounded-2xl border border-border/50 bg-muted/10 p-4">
            <div class="flex items-center justify-between text-sm">
              <span class="font-medium text-muted-foreground">{{ reviewCountLabel }}</span>
              <span class="font-black text-foreground">{{ stats.reviewCount || 0 }}</span>
            </div>
            <div class="mt-3 h-2 rounded-full bg-muted/40 overflow-hidden">
              <div class="h-full rounded-full bg-emerald-500" :style="{ width: `${Math.min(100, (stats.reviewCount || 0) * 10)}%` }" />
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-[1.8rem] border border-border/60 bg-card p-6">
        <h2 class="text-xl font-black text-foreground">{{ badgesTitle }}</h2>
        <div v-if="stats.trustBadges?.length" class="mt-6 grid grid-cols-1 gap-3">
          <div v-for="badge in stats.trustBadges" :key="badge" class="rounded-2xl border border-border/50 bg-muted/10 px-4 py-3">
            <p class="text-sm font-black text-foreground">{{ formatBadge(badge) }}</p>
          </div>
        </div>
        <div v-else class="mt-6 rounded-2xl border border-dashed border-border/60 bg-muted/10 p-5 text-sm text-muted-foreground">
          {{ noBadgesLabel }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { RefreshCw } from 'lucide-vue-next';
import api from '@/services/api';

const { locale } = useI18n();
const loading = ref(false);

const stats = reactive({
  responseRate: 0,
  averageResponseTimeLabel: 'No data yet',
  completedDeals: 0,
  activeProducts: 0,
  rating: 0,
  reviewCount: 0,
  trustScore: 0,
  trustBadges: []
});

const title = computed(() => (locale.value === 'ar' ? 'رؤى السوق' : 'Market insights'));
const subtitle = computed(() => (locale.value === 'ar'
  ? 'المؤشرات هنا مبنية على الأداء الحقيقي للمورد داخل المنصة.'
  : 'These insights are built from the vendor real performance inside the marketplace.'));
const refreshLabel = computed(() => (locale.value === 'ar' ? 'تحديث' : 'Refresh'));
const responseRateLabel = computed(() => (locale.value === 'ar' ? 'معدل الاستجابة' : 'Response rate'));
const avgResponseTimeLabel = computed(() => (locale.value === 'ar' ? 'متوسط زمن الاستجابة' : 'Average response time'));
const completedDealsLabel = computed(() => (locale.value === 'ar' ? 'الصفقات المكتملة' : 'Completed deals'));
const activeProductsLabel = computed(() => (locale.value === 'ar' ? 'المنتجات النشطة' : 'Active products'));
const headlineMetricsTitle = computed(() => (locale.value === 'ar' ? 'مقاييس الأداء' : 'Performance metrics'));
const trustScoreLabel = computed(() => (locale.value === 'ar' ? 'مؤشر الثقة' : 'Trust score'));
const ratingLabel = computed(() => (locale.value === 'ar' ? 'التقييم' : 'Rating'));
const reviewCountLabel = computed(() => (locale.value === 'ar' ? 'عدد المراجعات' : 'Review count'));
const badgesTitle = computed(() => (locale.value === 'ar' ? 'شارات الأداء' : 'Performance badges'));
const noBadgesLabel = computed(() => (locale.value === 'ar' ? 'لا توجد شارات أداء حتى الآن.' : 'No performance badges yet.'));
const noDataLabel = computed(() => (locale.value === 'ar' ? 'لا توجد بيانات بعد' : 'No data yet'));

const fetchData = async () => {
  loading.value = true;
  try {
    const response = await api.get('/vendor/stats');
    const payload = response?.data || response || {};
    stats.responseRate = Number(payload.response_rate || 0);
    stats.averageResponseTimeLabel = payload.average_response_time_label || noDataLabel.value;
    stats.completedDeals = Number(payload.completed_orders || payload.completed_deals || 0);
    stats.activeProducts = Number(payload.active_products || 0);
    stats.rating = Number(payload.rating || 0);
    stats.reviewCount = Number(payload.review_count || 0);
    stats.trustScore = Number(payload.trust_score || 0);
    stats.trustBadges = Array.isArray(payload.trust_badges) ? payload.trust_badges : [];
  } finally {
    loading.value = false;
  }
};

const formatBadge = (badge) => {
  const map = {
    TOP_RATED: locale.value === 'ar' ? 'أعلى تقييم' : 'Top Rated',
    RESPONSIVE: locale.value === 'ar' ? 'استجابة قوية' : 'Responsive',
    ACTIVE_DEALER: locale.value === 'ar' ? 'صفقات نشطة' : 'Active Dealer',
    FAST_RESPONSE: locale.value === 'ar' ? 'رد سريع' : 'Fast Response'
  };
  return map[badge] || badge;
};

onMounted(fetchData);
</script>

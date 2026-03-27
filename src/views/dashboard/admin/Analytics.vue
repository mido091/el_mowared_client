<template>
  <div class="space-y-8">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div>
        <h1 class="text-3xl font-black text-foreground">{{ title }}</h1>
        <p class="mt-2 text-sm text-muted-foreground">{{ subtitle }}</p>
      </div>
      <button class="btn-outline btn-sm" :disabled="loading" @click="fetchData">
        <RefreshCw class="w-4 h-4 me-2" :class="{ 'animate-spin': loading }" />
        {{ refreshLabel }}
      </button>
    </div>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div class="rounded-[1.6rem] border border-border/60 bg-card p-5">
        <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{{ rfqVolumeLabel }}</p>
        <p class="mt-3 text-3xl font-black text-foreground">{{ stats.rfq_volume || 0 }}</p>
      </div>
      <div class="rounded-[1.6rem] border border-border/60 bg-card p-5">
        <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{{ activeLeadsLabel }}</p>
        <p class="mt-3 text-3xl font-black text-foreground">{{ stats.active_leads || 0 }}</p>
      </div>
      <div class="rounded-[1.6rem] border border-border/60 bg-card p-5">
        <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{{ totalRevenueLabel }}</p>
        <p class="mt-3 text-3xl font-black text-foreground">{{ formatCurrency(stats.total_revenue) }}</p>
      </div>
      <div class="rounded-[1.6rem] border border-border/60 bg-card p-5">
        <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{{ lostToExpiryLabel }}</p>
        <p class="mt-3 text-3xl font-black text-foreground">{{ stats.lost_to_expiry || 0 }}</p>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div class="rounded-[1.8rem] border border-border/60 bg-card p-6">
        <h2 class="text-xl font-black text-foreground">{{ funnelTitle }}</h2>
        <div class="mt-6 space-y-4">
          <div v-for="stage in funnelRows" :key="stage.key" class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span class="font-medium text-muted-foreground">{{ stage.label }}</span>
              <span class="font-black text-foreground">{{ stage.value }}</span>
            </div>
            <div class="h-2 rounded-full bg-muted/40 overflow-hidden">
              <div class="h-full rounded-full bg-primary" :style="{ width: `${stage.percent}%` }" />
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-[1.8rem] border border-border/60 bg-card p-6">
        <h2 class="text-xl font-black text-foreground">{{ vendorPerformanceTitle }}</h2>
        <div class="mt-6 space-y-4">
          <div class="rounded-2xl border border-border/50 bg-muted/10 p-4">
            <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{{ avgResponseTimeLabel }}</p>
            <p class="mt-2 text-lg font-black text-foreground">{{ formatResponseTime(stats.vendor_performance?.avg_response_time_seconds) }}</p>
          </div>
          <div class="rounded-2xl border border-border/50 bg-muted/10 p-4">
            <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{{ acceptanceRateLabel }}</p>
            <p class="mt-2 text-lg font-black text-foreground">{{ formatPercent(stats.vendor_performance?.avg_acceptance_rate) }}</p>
          </div>
          <div class="rounded-2xl border border-border/50 bg-muted/10 p-4">
            <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{{ ghostingRatioLabel }}</p>
            <p class="mt-2 text-lg font-black text-foreground">{{ formatPercent(stats.vendor_performance?.avg_ghosting_ratio) }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="rounded-[1.8rem] border border-border/60 bg-card overflow-hidden">
      <div class="border-b border-border/60 px-6 py-4">
        <h2 class="text-xl font-black text-foreground">{{ leaderboardTitle }}</h2>
      </div>
      <div v-if="leaderboard.length" class="overflow-x-auto">
        <table class="w-full min-w-[720px]">
          <thead class="bg-muted/20">
            <tr class="text-right">
              <th class="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{{ rankLabel }}</th>
              <th class="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{{ vendorLabel }}</th>
              <th class="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{{ dealsLabel }}</th>
              <th class="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{{ winRateLabel }}</th>
              <th class="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{{ scoreLabel }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(vendor, index) in leaderboard" :key="vendor.id || index" class="border-t border-border/50">
              <td class="px-4 py-4 font-black text-foreground">#{{ index + 1 }}</td>
              <td class="px-4 py-4 font-bold text-foreground">{{ vendor.name }}</td>
              <td class="px-4 py-4 text-sm text-foreground">{{ vendor.deals }}</td>
              <td class="px-4 py-4 text-sm text-foreground">{{ formatPercent(vendor.winRate) }}</td>
              <td class="px-4 py-4 text-sm font-black text-primary">{{ Math.round(vendor.score || 0) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="p-8 text-center text-sm text-muted-foreground">{{ noLeaderboardLabel }}</div>
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
  rfq_volume: 0,
  active_leads: 0,
  total_revenue: 0,
  lost_to_expiry: 0,
  funnel: {
    created: 0,
    broadcasted: 0,
    offered: 0,
    converted: 0
  },
  vendor_performance: {
    avg_response_time_seconds: 0,
    avg_acceptance_rate: 0,
    avg_ghosting_ratio: 0
  },
  leaderboard: []
});

const title = computed(() => (locale.value === 'ar' ? 'التحليلات' : 'Analytics'));
const subtitle = computed(() => (locale.value === 'ar'
  ? 'كل المؤشرات هنا محسوبة من بيانات النظام الفعلية.'
  : 'Every metric here is calculated from live system data.'));
const refreshLabel = computed(() => (locale.value === 'ar' ? 'تحديث' : 'Refresh'));
const rfqVolumeLabel = computed(() => (locale.value === 'ar' ? 'إجمالي RFQs' : 'RFQ volume'));
const activeLeadsLabel = computed(() => (locale.value === 'ar' ? 'الفرص النشطة' : 'Active leads'));
const totalRevenueLabel = computed(() => (locale.value === 'ar' ? 'إجمالي الإيراد' : 'Total revenue'));
const lostToExpiryLabel = computed(() => (locale.value === 'ar' ? 'المفقود بالانتهاء' : 'Lost to expiry'));
const funnelTitle = computed(() => (locale.value === 'ar' ? 'مسار RFQ' : 'RFQ funnel'));
const vendorPerformanceTitle = computed(() => (locale.value === 'ar' ? 'أداء الموردين' : 'Vendor performance'));
const avgResponseTimeLabel = computed(() => (locale.value === 'ar' ? 'متوسط زمن الرد' : 'Average response time'));
const acceptanceRateLabel = computed(() => (locale.value === 'ar' ? 'معدل القبول' : 'Acceptance rate'));
const ghostingRatioLabel = computed(() => (locale.value === 'ar' ? 'نسبة التجاهل' : 'Ghosting ratio'));
const leaderboardTitle = computed(() => (locale.value === 'ar' ? 'أفضل الموردين' : 'Top vendors'));
const rankLabel = computed(() => (locale.value === 'ar' ? 'الترتيب' : 'Rank'));
const vendorLabel = computed(() => (locale.value === 'ar' ? 'المورد' : 'Vendor'));
const dealsLabel = computed(() => (locale.value === 'ar' ? 'الصفقات' : 'Deals'));
const winRateLabel = computed(() => (locale.value === 'ar' ? 'معدل الفوز' : 'Win rate'));
const scoreLabel = computed(() => (locale.value === 'ar' ? 'النتيجة' : 'Score'));
const noLeaderboardLabel = computed(() => (locale.value === 'ar' ? 'لا توجد بيانات كافية للترتيب بعد.' : 'Not enough data for the leaderboard yet.'));

const funnelRows = computed(() => {
  const created = Number(stats.funnel?.created || 0);
  const rows = [
    { key: 'created', label: locale.value === 'ar' ? 'تم الإنشاء' : 'Created', value: created },
    { key: 'broadcasted', label: locale.value === 'ar' ? 'تم البث' : 'Broadcasted', value: Number(stats.funnel?.broadcasted || 0) },
    { key: 'offered', label: locale.value === 'ar' ? 'تم تقديم عروض' : 'Offered', value: Number(stats.funnel?.offered || 0) },
    { key: 'converted', label: locale.value === 'ar' ? 'تم التحويل' : 'Converted', value: Number(stats.funnel?.converted || 0) }
  ];

  return rows.map((row) => ({
    ...row,
    percent: created > 0 ? Math.min(100, Math.round((row.value / created) * 100)) : 0
  }));
});

const leaderboard = computed(() => Array.isArray(stats.leaderboard) ? stats.leaderboard : []);

const fetchData = async () => {
  loading.value = true;
  try {
    const response = await api.get('/admin/stats');
    const payload = response?.data || response || {};
    Object.assign(stats, {
      rfq_volume: Number(payload.rfq_volume || 0),
      active_leads: Number(payload.active_leads || 0),
      total_revenue: Number(payload.total_revenue || 0),
      lost_to_expiry: Number(payload.lost_to_expiry || 0),
      funnel: payload.funnel || { created: 0, broadcasted: 0, offered: 0, converted: 0 },
      vendor_performance: payload.vendor_performance || {
        avg_response_time_seconds: 0,
        avg_acceptance_rate: 0,
        avg_ghosting_ratio: 0
      },
      leaderboard: Array.isArray(payload.leaderboard) ? payload.leaderboard : []
    });
  } finally {
    loading.value = false;
  }
};

const formatPercent = (value) => `${Math.round(Number(value || 0))}%`;
const formatCurrency = (value) => new Intl.NumberFormat(locale.value === 'ar' ? 'ar-EG' : 'en-US', {
  style: 'currency',
  currency: 'EGP',
  maximumFractionDigits: 0
}).format(Number(value || 0));

const formatResponseTime = (seconds) => {
  const numeric = Number(seconds || 0);
  if (!numeric) return locale.value === 'ar' ? 'لا توجد بيانات بعد' : 'No data yet';
  if (numeric < 60) return `${Math.round(numeric)} ${locale.value === 'ar' ? 'ثانية' : 'sec'}`;
  if (numeric < 3600) return `${Math.round(numeric / 60)} ${locale.value === 'ar' ? 'دقيقة' : 'min'}`;
  if (numeric < 86400) return `${(numeric / 3600).toFixed(1)} ${locale.value === 'ar' ? 'ساعة' : 'hrs'}`;
  return `${(numeric / 86400).toFixed(1)} ${locale.value === 'ar' ? 'يوم' : 'days'}`;
};

onMounted(fetchData);
</script>

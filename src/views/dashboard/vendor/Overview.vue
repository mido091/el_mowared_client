<template>
  <div class="max-w-full overflow-x-hidden space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-10">
    <header class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
      <div>
        <p class="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">{{ roleLabel }}</p>
        <h1 class="mt-2 text-2xl md:text-3xl font-black text-foreground">{{ welcomeTitle }}</h1>
        <p class="mt-2 text-sm text-muted-foreground">{{ subtitle }}</p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <router-link to="/dashboard/vendor/products" class="btn-primary btn-sm shadow-lg shadow-primary/20">
          <PlusCircle class="w-3.5 h-3.5 me-2" />
          {{ addProductLabel }}
        </router-link>
      </div>
    </header>

    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
      <DashStat
        :label="activeProductsLabel"
        :value="dashboardStore.stats.activeProducts"
        :icon="Package"
        iconBg="bg-primary/5"
        iconColor="text-primary"
        class="cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5"
        @click="router.push('/dashboard/vendor/products')"
      />
      <DashStat
        :label="newRfqsLabel"
        :value="dashboardStore.stats.newRfqs"
        :icon="FileQuestion"
        iconBg="bg-secondary/5"
        iconColor="text-secondary"
        class="cursor-pointer hover:border-secondary/50 transition-all hover:shadow-lg hover:shadow-secondary/5"
        @click="router.push('/dashboard/vendor/leads')"
      />
      <DashStat
        :label="unreadMessagesLabel"
        :value="dashboardStore.stats.unreadMessages"
        :icon="MessageSquare"
        iconBg="bg-amber-500/5"
        iconColor="text-amber-600"
        class="cursor-pointer hover:border-amber-500/50 transition-all hover:shadow-lg hover:shadow-amber-500/5"
        @click="router.push('/chat')"
      />
      <DashStat
        :label="pendingOrdersLabel"
        :value="dashboardStore.stats.pendingOrders"
        :icon="ShoppingBag"
        iconBg="bg-indigo-500/5"
        iconColor="text-indigo-600"
        class="cursor-pointer hover:border-indigo-500/50 transition-all hover:shadow-lg hover:shadow-indigo-500/5"
        @click="router.push('/dashboard/vendor/orders')"
      />
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8 items-start">
      <div class="xl:col-span-8 flex flex-col gap-6">
        <DashCard :title="performanceTitle">
          <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div class="rounded-2xl border border-border/50 bg-muted/10 p-4">
              <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{{ ratingLabel }}</p>
              <p class="mt-2 text-2xl font-black text-foreground">{{ formatDecimal(dashboardStore.stats.rating) }}</p>
              <p class="mt-1 text-xs text-muted-foreground">{{ reviewCountText }}</p>
            </div>
            <div class="rounded-2xl border border-border/50 bg-muted/10 p-4">
              <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{{ responseRateLabel }}</p>
              <p class="mt-2 text-2xl font-black text-foreground">{{ formatPercent(dashboardStore.stats.responseRate) }}</p>
              <p class="mt-1 text-xs text-muted-foreground">{{ avgResponseTimeText }}</p>
            </div>
            <div class="rounded-2xl border border-border/50 bg-muted/10 p-4">
              <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{{ completedOrdersLabel }}</p>
              <p class="mt-2 text-2xl font-black text-foreground">{{ dashboardStore.stats.completedOrders || 0 }}</p>
              <p class="mt-1 text-xs text-muted-foreground">{{ trustScoreText }}</p>
            </div>
            <div class="rounded-2xl border border-border/50 bg-muted/10 p-4">
              <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{{ totalUnreadLabel }}</p>
              <p class="mt-2 text-2xl font-black text-foreground">{{ dashboardStore.stats.unreadMessages || 0 }}</p>
              <p class="mt-1 text-xs text-muted-foreground">{{ pendingOrdersText }}</p>
            </div>
          </div>
        </DashCard>

        <DashCard :title="activityTitle" noPadding>
          <div class="divide-y divide-border/30">
            <div v-if="dashboardStore.loading" class="p-6 space-y-4">
              <div v-for="i in 3" :key="i" class="h-16 bg-muted/20 animate-pulse rounded-xl"></div>
            </div>

            <template v-else-if="leadsStore.leads?.length">
              <div
                v-for="lead in leadsStore.leads.slice(0, 4)"
                :key="lead.id"
                class="flex items-center gap-4 p-5 hover:bg-muted/30 transition-all group cursor-pointer"
                @click="router.push('/dashboard/vendor/leads')"
              >
                <div class="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all group-hover:scale-110 shadow-sm">
                  <FileText class="w-5 h-5" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-[13px] font-bold text-foreground leading-tight truncate">
                    {{ locale === 'ar' ? 'طلب عرض جديد' : 'New RFQ lead' }}: "{{ lead.product_name || lead.title }}"
                  </p>
                  <div class="mt-1.5 flex flex-wrap items-center gap-3 text-[10px] font-bold text-muted-foreground">
                    <span class="inline-flex items-center gap-1">
                      <Clock class="w-3 h-3" />
                      {{ lead.deadline ? formatDate(lead.deadline) : activeLabel }}
                    </span>
                    <span class="rounded-full bg-secondary/5 px-2 py-0.5 text-secondary">
                      {{ lead.status || liveLeadLabel }}
                    </span>
                  </div>
                </div>
                <ChevronRight class="w-4 h-4 text-primary rtl:rotate-180" />
              </div>
            </template>

            <div v-else class="py-16 text-center">
              <TrendingUp class="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
              <p class="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-50">{{ noRecentActivityLabel }}</p>
            </div>
          </div>
        </DashCard>
      </div>

      <aside class="xl:col-span-4 flex flex-col gap-6">
        <TrustScore
          :score="dashboardStore.stats.trustScore"
          :metrics="trustMetrics"
          :badges="dashboardStore.stats.trustBadges"
        />

        <DashCard :title="snapshotTitle">
          <div class="space-y-3">
            <div class="flex items-center justify-between rounded-xl border border-border/50 bg-muted/10 px-4 py-3">
              <span class="text-sm font-medium text-muted-foreground">{{ responseRateLabel }}</span>
              <span class="text-sm font-black text-foreground">{{ formatPercent(dashboardStore.stats.responseRate) }}</span>
            </div>
            <div class="flex items-center justify-between rounded-xl border border-border/50 bg-muted/10 px-4 py-3">
              <span class="text-sm font-medium text-muted-foreground">{{ avgResponseTimeShortLabel }}</span>
              <span class="text-sm font-black text-foreground">{{ dashboardStore.stats.averageResponseTimeLabel || noDataLabel }}</span>
            </div>
            <div class="flex items-center justify-between rounded-xl border border-border/50 bg-muted/10 px-4 py-3">
              <span class="text-sm font-medium text-muted-foreground">{{ reviewsLabel }}</span>
              <span class="text-sm font-black text-foreground">{{ dashboardStore.stats.reviewCount || 0 }}</span>
            </div>
          </div>
        </DashCard>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import {
  Package, ShoppingBag, FileText, PlusCircle,
  TrendingUp, Clock, FileQuestion, ChevronRight, MessageSquare
} from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { useVendorDashboardStore } from '@/stores/vendorDashboardStore';
import { useLeadsStore } from '@/stores/leadsStore';
import DashStat from '@/components/dashboard/DashStat.vue';
import DashCard from '@/components/dashboard/DashCard.vue';
import TrustScore from '@/components/dashboard/vendor/TrustScore.vue';

const { locale } = useI18n();
const router = useRouter();
const authStore = useAuthStore();
const dashboardStore = useVendorDashboardStore();
const leadsStore = useLeadsStore();

const roleLabel = computed(() => (locale.value === 'ar' ? 'مورد' : 'Vendor'));
const welcomeTitle = computed(() => locale.value === 'ar'
  ? `أهلًا ${authStore.user?.first_name || ''}`.trim()
  : `Welcome ${authStore.user?.first_name || 'Partner'}`);
const subtitle = computed(() => (locale.value === 'ar'
  ? 'كل الأرقام الظاهرة هنا محسوبة من نشاطك الحقيقي داخل المنصة.'
  : 'Every number here is calculated from your real marketplace activity.'));
const addProductLabel = computed(() => (locale.value === 'ar' ? 'إضافة منتج' : 'Add product'));
const activeProductsLabel = computed(() => (locale.value === 'ar' ? 'المنتجات النشطة' : 'Active products'));
const newRfqsLabel = computed(() => (locale.value === 'ar' ? 'طلبات RFQ الجديدة' : 'New RFQs'));
const unreadMessagesLabel = computed(() => (locale.value === 'ar' ? 'الرسائل غير المقروءة' : 'Unread messages'));
const pendingOrdersLabel = computed(() => (locale.value === 'ar' ? 'الطلبات المعلقة' : 'Pending orders'));
const completedOrdersLabel = computed(() => (locale.value === 'ar' ? 'الطلبات المكتملة' : 'Completed orders'));
const totalUnreadLabel = computed(() => (locale.value === 'ar' ? 'إجمالي الرسائل غير المقروءة' : 'Unread messages total'));
const ratingLabel = computed(() => (locale.value === 'ar' ? 'التقييم' : 'Rating'));
const reviewsLabel = computed(() => (locale.value === 'ar' ? 'عدد المراجعات' : 'Reviews'));
const reviewCountText = computed(() => locale.value === 'ar'
  ? `${dashboardStore.stats.reviewCount || 0} مراجعة معتمدة`
  : `${dashboardStore.stats.reviewCount || 0} approved reviews`);
const responseRateLabel = computed(() => (locale.value === 'ar' ? 'معدل الاستجابة' : 'Response rate'));
const avgResponseTimeLabel = computed(() => (locale.value === 'ar' ? 'متوسط زمن الاستجابة' : 'Average response time'));
const avgResponseTimeShortLabel = computed(() => (locale.value === 'ar' ? 'زمن الاستجابة' : 'Response time'));
const avgResponseTimeText = computed(() => `${avgResponseTimeLabel.value}: ${dashboardStore.stats.averageResponseTimeLabel || noDataLabel.value}`);
const trustScoreText = computed(() => locale.value === 'ar'
  ? `مؤشر الثقة ${Math.round(dashboardStore.stats.trustScore || 0)}`
  : `Trust score ${Math.round(dashboardStore.stats.trustScore || 0)}`);
const pendingOrdersText = computed(() => locale.value === 'ar'
  ? `${dashboardStore.stats.pendingOrders || 0} طلب بحاجة إلى متابعة`
  : `${dashboardStore.stats.pendingOrders || 0} orders need follow-up`);
const performanceTitle = computed(() => (locale.value === 'ar' ? 'ملخص الأداء الحقيقي' : 'Live performance summary'));
const activityTitle = computed(() => (locale.value === 'ar' ? 'مركز الفرص المباشرة' : 'Live opportunities'));
const noRecentActivityLabel = computed(() => (locale.value === 'ar' ? 'لا توجد فرص حديثة' : 'No recent activity'));
const activeLabel = computed(() => (locale.value === 'ar' ? 'نشط' : 'Active'));
const liveLeadLabel = computed(() => (locale.value === 'ar' ? 'فرصة مباشرة' : 'Live lead'));
const snapshotTitle = computed(() => (locale.value === 'ar' ? 'لقطة سريعة' : 'Quick snapshot'));
const noDataLabel = computed(() => (locale.value === 'ar' ? 'لا توجد بيانات بعد' : 'No data yet'));

const trustMetrics = computed(() => {
  const labels = locale.value === 'ar'
    ? {
        rating: 'التقييم',
        responseRate: 'معدل الاستجابة',
        completedDeals: 'الصفقات المكتملة',
        responseSpeed: 'سرعة الرد'
      }
    : {
        rating: 'Rating',
        responseRate: 'Response Rate',
        completedDeals: 'Completed Deals',
        responseSpeed: 'Response Speed'
      };

  return [
    {
      key: 'rating',
      label: labels.rating,
      value: dashboardStore.stats.trustBreakdown?.[0]?.value || 0
    },
    {
      key: 'response_rate',
      label: labels.responseRate,
      value: dashboardStore.stats.trustBreakdown?.[1]?.value || 0
    },
    {
      key: 'completed_deals',
      label: labels.completedDeals,
      value: dashboardStore.stats.trustBreakdown?.[2]?.value || 0
    },
    {
      key: 'response_speed',
      label: labels.responseSpeed,
      value: dashboardStore.stats.trustBreakdown?.[3]?.value || 0
    }
  ];
});

const formatDate = (value) => {
  const date = new Date(value);
  return date.toLocaleDateString(locale.value === 'ar' ? 'ar-EG' : 'en-US');
};

const formatPercent = (value) => `${Math.round(Number(value || 0))}%`;
const formatDecimal = (value) => Number(value || 0).toFixed(1);

onMounted(() => {
  dashboardStore.fetchOverviewData();
  leadsStore.fetchLeads();
});
</script>

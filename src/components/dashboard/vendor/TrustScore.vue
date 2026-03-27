<template>
  <DashCard :title="title" noPadding class="overflow-hidden">
    <div class="p-5 md:p-6 space-y-6">
      <div class="flex flex-col sm:flex-row items-center gap-6">
        <div class="relative w-32 h-32 shrink-0">
          <svg class="w-full h-full -rotate-90" viewBox="0 0 128 128">
            <circle cx="64" cy="64" r="56" stroke="currentColor" stroke-width="8" fill="transparent" class="text-muted/20" />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="url(#trustGradient)"
              stroke-width="10"
              fill="transparent"
              stroke-dasharray="352"
              :stroke-dashoffset="352 - (352 * safeScore) / 100"
              stroke-linecap="round"
              class="transition-all duration-700"
            />
            <defs>
              <linearGradient id="trustGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:hsl(var(--primary));stop-opacity:1" />
                <stop offset="100%" style="stop-color:hsl(var(--secondary));stop-opacity:1" />
              </linearGradient>
            </defs>
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <span class="text-3xl font-black text-foreground">{{ Math.round(safeScore) }}</span>
            <span class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{{ scoreLabel }}</span>
          </div>
        </div>

        <div class="flex-1 w-full space-y-4">
          <div v-for="metric in displayMetrics" :key="metric.key" class="space-y-2">
            <div class="flex items-center justify-between text-[11px] font-bold">
              <span class="text-muted-foreground">{{ metric.label }}</span>
              <span class="text-foreground">{{ metric.display }}</span>
            </div>
            <div class="h-2 rounded-full bg-muted/40 overflow-hidden">
              <div class="h-full rounded-full bg-primary transition-all duration-700" :style="{ width: metric.value + '%' }" />
            </div>
          </div>
        </div>
      </div>

      <div v-if="displayBadges.length" class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border/50">
        <div
          v-for="badge in displayBadges"
          :key="badge.key"
          class="rounded-xl border border-border/50 bg-muted/10 p-3 text-center"
        >
          <div class="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg" :class="badge.bgClass">
            <component :is="badge.icon" class="w-4 h-4" :class="badge.iconClass" />
          </div>
          <p class="text-[10px] font-bold uppercase tracking-wider text-foreground">{{ badge.label }}</p>
        </div>
      </div>

      <div v-else class="rounded-xl border border-dashed border-border/60 bg-muted/10 p-4 text-center text-xs font-medium text-muted-foreground">
        {{ emptyBadgesLabel }}
      </div>
    </div>
  </DashCard>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Award, BadgeCheck, PackageCheck, ShieldCheck, Zap } from 'lucide-vue-next';
import DashCard from '@/components/dashboard/DashCard.vue';

const { locale } = useI18n();

const props = defineProps({
  score: { type: Number, default: 0 },
  metrics: {
    type: Array,
    default: () => []
  },
  badges: {
    type: Array,
    default: () => []
  }
});

const safeScore = computed(() => {
  const numeric = Number(props.score || 0);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(100, numeric));
});

const title = computed(() => (locale.value === 'ar' ? 'مؤشر الثقة' : 'Trust Index'));
const scoreLabel = computed(() => (locale.value === 'ar' ? 'نقطة' : 'Score'));
const emptyBadgesLabel = computed(() => (locale.value === 'ar' ? 'لا توجد شارات أداء بعد.' : 'No performance badges yet.'));

const displayMetrics = computed(() => props.metrics.map((metric) => ({
  ...metric,
  value: Math.max(0, Math.min(100, Number(metric.value || 0))),
  display: typeof metric.display === 'string' ? metric.display : `${Math.round(Number(metric.value || 0))}%`
})));

const badgeMap = {
  TOP_RATED: {
    icon: Award,
    labelAr: 'أعلى تقييم',
    labelEn: 'Top Rated',
    bgClass: 'bg-amber-100 dark:bg-amber-500/10',
    iconClass: 'text-amber-500'
  },
  RESPONSIVE: {
    icon: Zap,
    labelAr: 'استجابة قوية',
    labelEn: 'Responsive',
    bgClass: 'bg-sky-100 dark:bg-sky-500/10',
    iconClass: 'text-sky-500'
  },
  ACTIVE_DEALER: {
    icon: PackageCheck,
    labelAr: 'صفقات نشطة',
    labelEn: 'Active Dealer',
    bgClass: 'bg-emerald-100 dark:bg-emerald-500/10',
    iconClass: 'text-emerald-500'
  },
  FAST_RESPONSE: {
    icon: ShieldCheck,
    labelAr: 'رد سريع',
    labelEn: 'Fast Response',
    bgClass: 'bg-primary/10',
    iconClass: 'text-primary'
  }
};

const displayBadges = computed(() => props.badges
  .map((badgeKey) => {
    const meta = badgeMap[badgeKey];
    if (!meta) return null;
    return {
      key: badgeKey,
      icon: meta.icon,
      label: locale.value === 'ar' ? meta.labelAr : meta.labelEn,
      bgClass: meta.bgClass,
      iconClass: meta.iconClass
    };
  })
  .filter(Boolean));
</script>

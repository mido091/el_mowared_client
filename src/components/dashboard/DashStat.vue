<template>
  <DashCard class="relative overflow-hidden">
    <div class="flex items-center justify-between mb-2">
      <div v-if="icon" :class="['p-2 rounded-lg bg-opacity-10', iconBg || 'bg-primary']">
        <component :is="icon" :class="['w-5 h-5', iconColor || 'text-primary']" />
      </div>
      <div v-if="showTrend" :class="['flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full', trend >= 0 ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400']">
        <component :is="trend >= 0 ? TrendingUp : TrendingDown" class="w-3 h-3" />
        {{ Math.abs(trend) }}%
      </div>
    </div>
    
    <div>
      <p class="text-2xl sm:text-3xl font-black text-foreground tracking-tight leading-none">{{ value }}</p>
      <p class="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest mt-2 truncate" :title="label">{{ label }}</p>
    </div>

    <!-- Mini Sparkline (SVG) -->
    <div v-if="showTrend" class="absolute bottom-0 inset-x-0 h-1 mt-4 opacity-50">
      <svg class="w-full h-full" viewBox="0 0 100 10" preserveAspectRatio="none">
        <path 
          :d="sparklineData" 
          fill="none" 
          :stroke="trend >= 0 ? '#22C55E' : '#EF4444'" 
          stroke-width="2"
          class="drop-shadow-sm"
        />
      </svg>
    </div>
  </DashCard>
</template>

<script setup>
import { computed } from 'vue';
import { TrendingUp, TrendingDown } from 'lucide-vue-next';
import DashCard from './DashCard.vue';

const props = defineProps({
  label: String,
  value: [String, Number],
  icon: [Object, Function, String],
  iconColor: String,
  iconBg: String,
  trend: Number, // Percentage change
});

const showTrend = computed(() => typeof props.trend === 'number' && Number.isFinite(props.trend));

const sparklineData = computed(() => {
  if (!showTrend.value) return '';
  const points = props.trend >= 0 
    ? [8, 7, 9, 6, 8, 5, 4, 3, 2, 1] // Upward motion (y coord is from top)
    : [2, 3, 2, 5, 4, 6, 7, 8, 9, 9]; // Downward motion
  return `M ${points.map((y, i) => `${i * 11.1} ${y}`).join(' L ')}`;
});
</script>

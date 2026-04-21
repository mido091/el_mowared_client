<template>
  <div class="space-y-6">
    <div class="relative ps-8 space-y-8 before:absolute before:inset-y-0 before:start-[15px] before:w-0.5 before:bg-border before:content-['']">
      <div 
        v-for="(event, index) in events" 
        :key="index"
        class="relative animate-in fade-in slide-in-from-leading-2 duration-500"
        :style="{ animationDelay: `${index * 150}ms` }"
      >
        <!-- Icon -->
        <span 
          :class="[
            'absolute -start-10 mt-1 w-8 h-8 rounded-xl border-4 border-card flex items-center justify-center transition-all shadow-sm',
            event.completed ? 'bg-primary text-primary-foreground shadow-primary/20' : 'bg-muted text-muted-foreground'
          ]"
        >
          <component :is="event.icon" class="w-3.5 h-3.5" />
        </span>

        <!-- Content -->
        <div class="space-y-1">
          <div class="flex items-center justify-between gap-4">
            <h4 :class="['text-sm font-bold', event.completed ? 'text-foreground' : 'text-muted-foreground']">
              {{ event.title }}
            </h4>
            <span v-if="event.date" class="text-[10px] font-black text-muted-foreground uppercase tracking-widest tabular-nums">
              {{ formatDate(event.date) }}
            </span>
          </div>
          <p class="text-xs text-muted-foreground leading-relaxed">
            {{ event.description }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * @file PurchaseTimeline.vue
 * @description Presentational component displaying the chronological fulfillment
 * status of a purchase order (Order Lifecycle).
 *
 * It maps the order's DB status enum (PENDING, PROCESSING, SHIPPED, COMPLETED)
 * to a visual vertical stepper, reading timestamps to mark events as completed.
 */

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  CheckCircle2, Package, Truck,
  CreditCard, Clock, MessageSquare
} from 'lucide-vue-next';

const props = defineProps({
  order: { type: Object, required: true }
});

const { t } = useI18n();

const events = computed(() => {
  const o = props.order;
  const history = [
    { 
      title: t('orders.timeline.placed'), 
      description: t('orders.timeline.placedDesc'), 
      icon: Clock, 
      completed: true, 
      date: o.created_at 
    },
    { 
      title: t('orders.timeline.paid'), 
      description: t('orders.timeline.paidDesc'), 
      icon: CreditCard, 
      completed: !!o.paid_at, 
      date: o.paid_at 
    },
    { 
      title: t('orders.timeline.processed'), 
      description: t('orders.timeline.processedDesc'), 
      icon: Package, 
      completed: ['SHIPPED', 'COMPLETED'].includes(o.status), 
      date: o.processed_at 
    },
    { 
      title: t('orders.timeline.shipped'), 
      description: t('orders.timeline.shippedDesc'), 
      icon: Truck, 
      completed: o.status === 'SHIPPED', 
      date: o.shipped_at 
    },
    { 
      title: t('orders.timeline.delivered'), 
      description: t('orders.timeline.deliveredDesc'), 
      icon: CheckCircle2, 
      completed: o.status === 'COMPLETED', 
      date: o.delivered_at 
    }
  ];
  return history;
});

const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  }).format(new Date(date));
};
</script>

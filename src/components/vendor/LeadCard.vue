<template>
  <div class="bg-white dark:bg-card border dark:border-border rounded-xl shadow-sm hover:shadow-md transition-all p-5 flex flex-col gap-4 relative overflow-hidden group">
    
    <!-- Urgency / Status Bar (Top Edge) -->
    <div 
      class="absolute top-0 left-0 right-0 h-1"
      :class="{
        'bg-primary': rfq.status === 'BROADCASTED' || rfq.status === 'OPEN',
        'bg-yellow-500': rfq.status === 'NEGOTIATING' || rfq.status === 'OFFERED',
        'bg-green-500': rfq.status === 'ACCEPTED' || rfq.status === 'COMPLETED',
        'bg-red-500': rfq.status === 'REJECTED' || rfq.status === 'EXPIRED' || rfq.status === 'CANCELED'
      }"
    ></div>

    <!-- Header Section -->
    <div class="flex justify-between items-start gap-4">
      <div>
        <h3 class="text-lg font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {{ rfq.title }}
        </h3>
        <p class="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
          <span v-if="rfq.privacy_type === 'PRIVATE'" class="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 text-xs font-bold border border-indigo-200 dark:border-indigo-800">Private Lead</span>
          <span v-else class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700">Public Lead</span>
          <span v-if="rfq.lead_priority === 'HIGH'" class="px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs font-bold">🔥 High Priority</span>
        </p>
      </div>
      
      <!-- Price & Quantity -->
      <div class="text-right">
        <p class="font-black text-xl text-primary">{{ formatCurrency(rfq.target_price) || 'N/A' }}</p>
        <p class="text-xs font-medium text-muted-foreground">Qty: {{ rfq.quantity }}</p>
      </div>
    </div>

    <div class="space-y-2">
      <div
        v-for="item in previewItems"
        :key="`${item.order}-${item.label}`"
        class="rounded-xl border border-border/60 bg-muted/20 p-3"
      >
        <p class="text-[10px] font-black uppercase tracking-[0.16em] text-primary">What do you need</p>
        <p class="mt-1 text-sm font-bold text-foreground">{{ item.label }}</p>
        <p class="mt-2 line-clamp-2 text-sm text-foreground/80">{{ item.details }}</p>
      </div>
    </div>

    <!-- Metrics Grid -->
    <div class="grid grid-cols-2 gap-3 mt-auto pt-4 border-t dark:border-border">
      
      <!-- Countdown Timer -->
      <div class="flex flex-col gap-1">
        <span class="text-xs font-bold text-muted-foreground tracking-wider uppercase">Time Remaining</span>
        <div class="flex items-center gap-1.5" :class="isExpiringSoon ? 'text-red-500' : 'text-foreground'">
          <ClockIcon class="w-4 h-4" />
          <span class="text-sm font-semibold tabular-nums">{{ timeRemainingText }}</span>
        </div>
      </div>

      <!-- Competitors / Responders -->
      <div class="flex flex-col gap-1">
        <span class="text-xs font-bold text-muted-foreground tracking-wider uppercase">Competition</span>
        <div class="flex items-center gap-1.5 text-foreground">
          <UsersIcon class="w-4 h-4 text-secondary" />
          <span class="text-sm font-semibold">{{ rfq.current_responders }} / {{ rfq.max_responders }} Responded</span>
        </div>
        <!-- Progress Bar -->
        <div class="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
          <div 
             class="h-full bg-secondary transition-all" 
             :style="{ width: `${(rfq.current_responders / rfq.max_responders) * 100}%` }"
             :class="{'bg-red-500': rfq.current_responders >= rfq.max_responders}"
          ></div>
        </div>
      </div>

    </div>

    <!-- Actions -->
    <div class="flex items-center justify-end gap-3 mt-2">
      <button 
        class="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
        @click="$emit('decline', rfq.id)"
      >
        Dismiss
      </button>
      <button 
        class="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        @click="$emit('offer', rfq)"
        :disabled="rfq.current_responders >= rfq.max_responders || isExpired || submitting"
      >
        <span v-if="submitting" class="flex items-center gap-2">
          <Loader2Icon class="w-4 h-4 animate-spin" /> Submitting...
        </span>
        <span v-else-if="isExpired">Expired</span>
        <span v-else-if="rfq.current_responders >= rfq.max_responders">Max Reached</span>
        <span v-else>Submit Offer</span>
      </button>
    </div>

  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { ClockIcon, UsersIcon, Loader2Icon } from 'lucide-vue-next';
import { formatEGPCurrency } from '@/utils/currency';
import { normalizeRfqItems } from '@/utils/rfqItems';

const props = defineProps({
  rfq: {
    type: Object,
    required: true
  },
  submitting: {
    type: Boolean,
    default: false
  }
});

defineEmits(['offer', 'decline']);

const formatCurrency = (val) => (val ? formatEGPCurrency(val, 'en') : null);
const previewItems = computed(() => normalizeRfqItems(props.rfq).slice(0, 2));

// Reactivity for Countdown Timer
const now = ref(new Date());
let timerInterval;

onMounted(() => {
  timerInterval = setInterval(() => {
    now.value = new Date();
  }, 1000); // update every second natively
});

onUnmounted(() => clearInterval(timerInterval));

const expirationDate = computed(() => {
  if (!props.rfq.expiration_time) return null;
  // Parse SQL Datetime to JS Date safely
  return new Date(props.rfq.expiration_time);
});

const isExpired = computed(() => {
  if (!expirationDate.value) return false;
  return now.value >= expirationDate.value || props.rfq.status === 'EXPIRED';
});

const isExpiringSoon = computed(() => {
  if (!expirationDate.value || isExpired.value) return false;
  const diffHours = (expirationDate.value - now.value) / (1000 * 60 * 60);
  return diffHours <= 2; // red if under 2 hours
});

const timeRemainingText = computed(() => {
  if (!expirationDate.value) return 'No Expiry';
  if (isExpired.value) return 'Expired';
  
  const diffMs = expirationDate.value - now.value;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diffMs % (1000 * 60)) / 1000);

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h remaining`;
  }
  
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
});
</script>

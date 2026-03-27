<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
    
    <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-black text-primary">Leads Center</h1>
        <p class="text-muted-foreground mt-1 font-medium">Browse active RFQs matched to your profile and submit competitive offers.</p>
      </div>

    </div>

    <!-- Tabs Navigation -->
    <div class="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide border-b dark:border-border">
      <button 
        v-for="tab in tabs" :key="tab.id"
        @click="rfqStore.setTab(tab.id)"
        class="whitespace-nowrap px-5 py-2.5 rounded-t-xl font-bold text-sm transition-all relative border-b-2"
        :class="rfqStore.activeTab === tab.id 
          ? 'text-primary border-primary bg-primary/5' 
          : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-slate-50 dark:hover:bg-slate-800'"
      >
        {{ tab.label }}
        <span v-if="tab.count > 0" class="ml-2 bg-secondary text-white text-[10px] px-2 py-0.5 rounded-full inline-flex items-center justify-center">
          {{ tab.count }}
        </span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="rfqStore.loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 6" :key="i" class="h-64 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl border dark:border-border"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="rfqStore.error" class="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 p-6 rounded-xl border border-red-200 dark:border-red-900 flex flex-col items-center justify-center text-center">
      <AlertTriangleIcon class="w-12 h-12 mb-3 opacity-50" />
      <h3 class="text-lg font-bold">Failed to load leads</h3>
      <p class="text-sm mt-1">{{ resolveLocalizedText(rfqStore.error, locale) }}</p>
      <button @click="rfqStore.fetchFeed()" class="mt-4 px-6 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg font-bold hover:bg-red-200 transition-colors">
        Try Again
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="currentLeads.length === 0" class="py-20 flex flex-col items-center justify-center text-center border-2 border-dashed dark:border-border rounded-2xl bg-slate-50/50 dark:bg-card/50">
      <InboxIcon class="w-16 h-16 text-muted-foreground/30 mb-4" />
      <h3 class="text-xl font-black text-foreground">No leads found</h3>
      <p class="text-muted-foreground mt-2 max-w-sm">We couldn't find any leads matching the "{{ tabs.find(t=>t.id === rfqStore.activeTab)?.label }}" criteria. Ensure your categories are up to date.</p>
    </div>

    <!-- Leads Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <LeadCard 
        v-for="lead in currentLeads" 
        :key="lead.id" 
        :rfq="lead"
        :submitting="submittingLeadId === lead.id"
        @offer="openOfferModal(lead)"
        @decline="handleDecline"
      />
    </div>

  </div>

  <!-- Optional Offer Modal implementation for later -->
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRfqStore } from '@/stores/rfqStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { AlertTriangleIcon, InboxIcon } from 'lucide-vue-next';
import LeadCard from '@/components/vendor/LeadCard.vue';
import { normalizeError } from '@/utils/errorHandler';
import { resolveLocalizedText } from '@/utils/localizedText';

const rfqStore = useRfqStore();
const notificationStore = useNotificationStore();
const { locale } = useI18n();
const submittingLeadId = ref(null);

onMounted(() => {
  rfqStore.fetchFeed();
});

const tabs = computed(() => [
  { id: 'active', label: 'New & Open', count: rfqStore.newLeads.length },
  { id: 'negotiations', label: 'Active Negotiations', count: rfqStore.activeNegotiations.length },
  { id: 'won', label: 'Won Deals', count: rfqStore.wonLeads.length },
  { id: 'lost', label: 'Lost', count: rfqStore.lostLeads.length },
  { id: 'expired', label: 'Expired', count: rfqStore.expiredLeads.length },
]);

const currentLeads = computed(() => {
  switch (rfqStore.activeTab) {
    case 'active': return rfqStore.newLeads;
    case 'negotiations': return rfqStore.activeNegotiations;
    case 'won': return rfqStore.wonLeads;
    case 'lost': return rfqStore.lostLeads;
    case 'expired': return rfqStore.expiredLeads;
    default: return rfqStore.newLeads;
  }
});

const openOfferModal = async (lead) => {
  // Logic to open modal and input price. For now, auto-submit native placeholder payload for testing edge cases
  submittingLeadId.value = lead.id;
  try {
    await rfqStore.submitOffer(lead.id, {
      offered_price: 1500,
      delivery_time: '2 Weeks'
    });
    notificationStore.success('Offer submitted successfully! Transitioned to pending review.');
  } catch (err) {
    notificationStore.error(normalizeError(err).message);
  } finally {
    submittingLeadId.value = null;
  }
};

const handleDecline = (id) => {
  notificationStore.info(`Lead ${id} dismissed from view.`);
};
</script>

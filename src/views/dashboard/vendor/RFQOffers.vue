<template>
  <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
      <div>
        <h1 class="text-3xl font-black text-foreground uppercase tracking-tighter">{{ t('rfq.offer_management') }}</h1>
        <p class="text-muted-foreground font-medium uppercase text-[10px] tracking-[0.2em] mt-1 italic">{{ t('orders.management_subtitle') }}</p>
      </div>
      <div class="flex bg-muted/30 p-1 rounded-2xl border border-border/50">
        <button 
          v-for="tab in ['browse', 'my_offers']" 
          :key="tab"
          @click="activeTab = tab"
          :class="[
            'px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
            activeTab === tab ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
          ]"
        >
          {{ tab === 'browse' ? t('rfq.browse_open_rfqs') : t('rfq.offers') }}
        </button>
      </div>
    </div>

    <!-- Tab 1: Browse Open RFQs -->
    <div v-if="activeTab === 'browse'" class="space-y-6">
       <!-- Category Filter (Subtle) -->
       <div class="flex flex-wrap items-center gap-3">
          <button 
            @click="categoryFilter = null"
            :class="['px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all', !categoryFilter ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-card border-border/50 text-muted-foreground']"
          >
            {{ t('common.all') }}
          </button>
          <button 
            v-for="cat in allowedCategories" 
            :key="cat.id"
            @click="categoryFilter = cat.id"
            :class="['px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all', categoryFilter === cat.id ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-card border-border/50 text-muted-foreground']"
          >
            {{ locale === 'ar' ? cat.name_ar : cat.name_en }}
          </button>
       </div>

       <!-- RFQ Grid -->
       <div v-if="loading" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div v-for="i in 4" :key="i" class="h-48 rounded-[2rem] bg-muted/20 animate-pulse border border-border/50"></div>
       </div>
       <div v-else-if="filteredRfqs.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div v-for="rfq in filteredRfqs" :key="rfq.id" class="group relative bg-card/40 backdrop-blur-sm border border-border/50 rounded-[2rem] p-8 hover:border-primary/30 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-primary/5">
             <div class="flex items-start justify-between mb-6">
                <div class="space-y-1">
                   <span class="text-[9px] font-black uppercase tracking-[0.2em] text-primary/60 px-2 py-0.5 bg-primary/5 rounded-md border border-primary/10">
                     {{ locale === 'ar' ? rfq.category_name_ar : rfq.category_name_en }}
                   </span>
                   <h3 class="text-xl font-black text-foreground group-hover:text-primary transition-colors leading-tight">{{ rfq.title }}</h3>
                </div>
                <div class="text-right">
                   <p class="text-[9px] font-black uppercase text-muted-foreground tracking-widest">{{ t('common.joinedAt').replace('At', '') }}</p>
                   <p class="font-bold text-xs">{{ formatDate(rfq.created_at) }}</p>
                </div>
             </div>
             
             <p class="text-xs text-muted-foreground font-medium line-clamp-2 mb-8 leading-relaxed">{{ rfq.description }}</p>
             
             <div class="grid grid-cols-3 gap-4 mb-8">
                <div class="p-3 rounded-2xl bg-muted/20 border border-border/30">
                   <p class="text-[8px] font-black uppercase text-muted-foreground tracking-wider mb-1">{{ t('rfq.quantity') }}</p>
                   <p class="font-black text-foreground">{{ rfq.quantity }} <span class="text-[8px] opacity-40 uppercase">{{ t('products.pieces') }}</span></p>
                </div>
                <div class="p-3 rounded-2xl bg-muted/20 border border-border/30">
                   <p class="text-[8px] font-black uppercase text-muted-foreground tracking-wider mb-1">{{ t('rfq.form.target_price') }}</p>
                   <p class="font-black text-foreground">{{ rfq.target_price ? formatCurrency(rfq.target_price) : 'N/A' }}</p>
                </div>
                <div class="p-3 rounded-2xl bg-primary/5 border border-primary/10">
                   <p class="text-[8px] font-black uppercase text-primary/60 tracking-wider mb-1">{{ t('rfq.offers') }}</p>
                   <p class="font-black text-primary">{{ rfq.offer_count || 0 }}</p>
                </div>
             </div>

             <button @click="openQuoteModal(rfq)" class="w-full h-12 rounded-2xl bg-foreground text-background font-black uppercase tracking-widest text-[10px] hover:bg-primary hover:text-white transition-all transform active:scale-95 flex items-center justify-center group/btn">
                {{ t('rfq.compare_offers').replace('Compare', 'Submit') }}
                <ArrowRight class="w-3.5 h-3.5 ml-2 rtl:rotate-180 group-hover/btn:translate-x-1 transition-transform" />
             </button>
          </div>
       </div>
       <EmptyState v-else :title="t('rfq.no_offers_yet')" :subtitle="t('rfq.no_rfqs_yet')" icon="PackageSearch" />
    </div>

    <!-- Tab 2: My Quotations -->
    <div v-else class="space-y-6">
       <DataTable 
         :items="myOffers" 
         :columns="quoteColumns" 
         :loading="loading"
         :has-filters="false"
         class="bg-card border border-border/50 rounded-[2.5rem] overflow-hidden shadow-sm pt-4"
       >
         <template #cell-rfq_title="{ item }">
           <div class="flex flex-col py-2">
             <span class="font-bold text-foreground line-clamp-1 italic text-sm">{{ item.rfq_title }}</span>
             <span class="text-[9px] text-muted-foreground font-black uppercase tracking-widest mt-1">{{ locale === 'ar' ? item.category_name_ar : item.category_name_en }}</span>
           </div>
         </template>

         <template #cell-offered_price="{ item }">
           <span class="font-black text-primary leading-none">${{ item.offered_price }}</span>
         </template>

         <template #cell-delivery="{ item }">
           <span class="text-[10px] font-bold text-foreground uppercase">{{ item.delivery_time }}</span>
         </template>

         <template #cell-status="{ item }">
           <div :class="[
             'inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest',
             item.status === 'ACCEPTED' ? 'bg-green-500/10 text-green-600 border border-green-500/10 font-bold' : 
             item.status === 'REJECTED' ? 'bg-red-500/10 text-red-600 border border-red-500/10' :
             'bg-amber-500/10 text-amber-600 border border-amber-500/10'
           ]">
             <component :is="item.status === 'ACCEPTED' ? CheckCircle : item.status === 'REJECTED' ? XCircle : Clock" class="w-3 h-3 mr-1.5" />
             {{ t('rfq.status_' + item.status.toLowerCase(), item.status) }}
           </div>
         </template>

         <template #cell-date="{ item }">
           <span class="text-[10px] font-black uppercase font-mono">{{ formatDate(item.created_at) }}</span>
         </template>
       </DataTable>
    </div>

    <!-- Quoting Modal -->
    <BaseModal v-model="showQuoteModal" :title="'Quoting: ' + selectedRfq?.title" size="lg">
       <form @submit.prevent="submitQuote" class="space-y-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
             <BaseInput 
               :label="t('rfq.offered_price') + ' ($)'" 
               v-model.number="quoteForm.offeredPrice" 
               type="number" 
               required 
               :placeholder="t('rfq.form.target_price') + ': ' + (selectedRfq?.target_price || '0')"
             />
             <BaseInput 
               :label="t('orders.status_shipped').replace('Shipped', 'Lead Time')" 
               v-model="quoteForm.deliveryTime" 
               required 
               placeholder="How long until shipping?"
             />
          </div>

          <div class="form-group">
            <label class="form-label uppercase text-[9px] font-black tracking-[0.2em] text-muted-foreground mb-2 block">Technical Notes & Capabilities</label>
            <textarea 
               v-model="quoteForm.notes" 
               rows="5" 
               class="form-input !rounded-2xl p-4 text-sm font-medium leading-relaxed bg-muted/20 border-border/50 focus:bg-background transition-all"
               placeholder="Detail your MOQ, shipping terms, and material quality..."
            ></textarea>
          </div>

          <div class="p-6 bg-primary/5 border border-primary/10 rounded-2xl flex items-start gap-4">
             <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Gavel class="w-5 h-5 text-primary" />
             </div>
             <div>
                <h4 class="text-sm font-black uppercase tracking-widest text-primary mb-1">Contractual Commitment</h4>
                <p class="text-[10px] text-muted-foreground leading-relaxed">By submitting this quote, you agree to fulfill the order at the specified terms if selected by the buyer.</p>
             </div>
          </div>

          <div class="flex justify-end items-center gap-4 pt-4 border-t border-border/50">
            <BaseButton variant="ghost" @click="showQuoteModal = false" class="text-[10px] font-black uppercase tracking-widest">{{ t('common.cancel') }}</BaseButton>
            <button type="submit" :disabled="submitting" class="btn-primary min-w-[200px] h-12 shadow-lg shadow-primary/20 !rounded-2xl flex items-center justify-center transition-all group">
              <template v-if="submitting">
                 <Loader2 class="w-5 h-5 animate-spin" />
              </template>
              <template v-else>
                 <Send class="w-4 h-4 mr-2 rtl:rotate-180 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                 <span class="font-black uppercase tracking-widest text-xs">{{ t('rfq.compare_offers').replace('Compare', 'Dispatch') }}</span>
              </template>
            </button>
          </div>
       </form>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { 
  ArrowRight, ArrowUpRight, Clock, CheckCircle, XCircle, Gavel, Send, Loader2, Activity, Filter 
} from 'lucide-vue-next';
import api from '@/services/api';
import { formatEGPCurrency } from '@/utils/currency';
import { useUiStore } from '@/stores/ui';
import { useCategoryStore } from '@/stores/categoryStore';
import { useRfqStore } from '@/stores/rfqStore';
import DataTable from '@/components/ui/DataTable.vue';
import BaseModal from '@/components/ui/BaseModal.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import EmptyState from '@/components/ui/EmptyState.vue';

const { t, locale } = useI18n();
const uiStore = useUiStore();
const categoryStore = useCategoryStore();
const rfqStore = useRfqStore();
const { loading: rfqLoading } = storeToRefs(rfqStore);

const activeTab = ref('browse');
const loading = ref(true);
const submitting = ref(false);
const showQuoteModal = ref(false);
const selectedRfq = ref(null);

const myOffers = ref([]);
const vendorCategoryIds = ref([]);
const categoryFilter = ref(null);

const quoteForm = reactive({
  offeredPrice: 0,
  deliveryTime: '',
  notes: ''
});

const quoteColumns = [
  { key: 'rfq_title', label: t('rfq.requirement') },
  { key: 'offered_price', label: t('rfq.offered_price') },
  { key: 'delivery', label: t('orders.status_shipped').replace('Shipped', 'Lead Time') },
  { key: 'status', label: t('common.status') },
  { key: 'date', label: t('common.joinedAt').replace('At', '') }
];

const allowedCategories = computed(() => {
  if (!categoryStore.categories || vendorCategoryIds.value.length === 0) return [];
  return categoryStore.categories.filter(c => vendorCategoryIds.value.includes(c.id));
});

const filteredRfqs = computed(() => {
  const source = rfqStore.allLeads || [];
  if (!categoryFilter.value) return source;
  return source.filter(r => r.category_id === categoryFilter.value);
});

const formatCurrency = (val) => formatEGPCurrency(val, locale.value);

const formatDate = (d) => new Date(d).toLocaleDateString(locale.value === 'ar' ? 'ar-EG' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' });

const fetchData = async () => {
  loading.value = true;
  try {
    if (activeTab.value === 'browse') {
       await rfqStore.fetchFeed({ mode: 'revalidate' });
    } else {
       const res = await api.get('/rfq/my-offers');
       myOffers.value = Array.isArray(res) ? res : (res?.data ?? []);
    }
  } catch (err) {
    uiStore.showToast('Data sync failed', 'error');
  } finally {
    loading.value = false;
  }
};

const openQuoteModal = (rfq) => {
  selectedRfq.value = rfq;
  quoteForm.offeredPrice = rfq.target_price || 0;
  quoteForm.deliveryTime = '';
  quoteForm.notes = '';
  showQuoteModal.value = true;
};

const submitQuote = async () => {
  submitting.value = true;
  try {
    await api.post(`/rfq/${selectedRfq.value.id}/offers`, quoteForm);
    uiStore.showToast('Quotation dispatched to buyer', 'success');
    showQuoteModal.value = false;
    fetchData();
  } catch (err) {
    uiStore.showToast('Negotiation failed', 'error');
  } finally {
    submitting.value = false;
  }
};

watch(activeTab, fetchData);

watch(rfqLoading, (value) => {
  if (activeTab.value === 'browse') {
    loading.value = value;
  }
});

onMounted(async () => {
  try {
    await categoryStore.fetchCategories({ mode: 'revalidate' });
    const profileRes = await api.get('/vendor/me');
    // api.js interceptor already unwraps response.data
    const vendorData = profileRes?.vendor || profileRes;
    if (vendorData?.categories) {
      vendorCategoryIds.value = vendorData.categories.map(c => c.id || c);
    }
    await fetchData();
  } catch (err) {
    console.error('RFQ Init Error:', err);
  }
});
</script>

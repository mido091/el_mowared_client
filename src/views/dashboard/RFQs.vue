<template>
  <div class="space-y-8 uppercase tracking-tight">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-black text-foreground">{{ authStore.isVendor ? t('rfq.offer_management') : t('rfq.my_rfqs') }}</h1>
      <router-link v-if="!authStore.isVendor" to="/rfq/post" class="btn btn-secondary h-10 px-5 text-xs text-white rounded-xl font-black">
        <FilePlus class="w-4 h-4 me-2" /> {{ t('rfq.new_rfq') }}
      </router-link>
    </div>

    <!-- Vendor View: Offers -->
    <template v-if="authStore.isVendor">
      <div v-if="loading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="h-24 bg-card rounded-2xl border border-border animate-pulse"></div>
      </div>
      <div v-else-if="items.length > 0" class="space-y-4">
        <div v-for="offer in items" :key="offer.id" class="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <span class="text-[9px] font-black text-secondary bg-secondary/10 px-2 py-0.5 rounded">{{ t(`orders.status_${offer.status.toLowerCase()}`) }}</span>
                <span class="text-[10px] text-muted-foreground font-bold">{{ new Date(offer.created_at).toLocaleDateString() }}</span>
              </div>
              <h3 class="text-base font-black text-foreground">{{ t('rfq.offer_for', { title: offer.rfq?.title || '...' }) }}</h3>
              <p class="text-xs text-muted-foreground font-medium normal-case max-w-xl line-clamp-2">
                {{ t('rfq.my_notes', { notes: offer.notes || t('rfq.no_notes') }) }}
              </p>
            </div>
            <div class="text-end shrink-0 bg-muted/20 p-4 rounded-xl border border-border min-w-[150px]">
              <p class="text-[10px] font-black tracking-widest text-muted-foreground mb-1">{{ t('rfq.offered_price') }}</p>
              <p class="text-xl font-black text-secondary">{{ formatCurrency(offer.price) }} <span class="text-[10px] text-foreground">{{ t('rfq.per_unit') }}</span></p>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-20 bg-card rounded-3xl border-2 border-dashed border-border p-8">
        <FileText class="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
        <p class="text-xs font-black text-muted-foreground">{{ t('rfq.no_offers_yet') }}</p>
        <router-link to="/rfq" class="text-xs text-secondary hover:underline mt-2 block">{{ t('rfq.browse_open_rfqs') }}</router-link>
      </div>
    </template>

    <!-- Buyer View: My RFQs -->
    <template v-else>
      <div v-if="loading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="h-24 bg-card rounded-2xl border border-border animate-pulse"></div>
      </div>
      <div v-else-if="items.length > 0" class="space-y-4">
        <div v-for="rfq in items" :key="rfq.id" class="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <span class="text-[9px] font-black" :class="rfq.status === 'open' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500 bg-slate-100 px-2 py-0.5 rounded'">
                  {{ t(`rfq.status_${rfq.status.toLowerCase()}`) }}
                </span>
              </div>
              <h3 class="text-base font-black text-foreground">{{ rfq.title }}</h3>
              <p class="text-xs text-muted-foreground font-bold">Qty: {{ rfq.quantity }} {{ rfq.unit }} • Target: {{ formatCurrency(rfq.budget) }}</p>
            </div>
            <div class="flex items-center gap-4 shrink-0">
              <div class="text-center">
                <p class="text-xl font-black text-foreground">{{ rfq.offers?.length || 0 }}</p>
                <p class="text-[9px] font-black text-muted-foreground">{{ t('rfq.offers_count') }}</p>
              </div>
              <button class="btn border border-border text-xs h-10 px-5 rounded-xl font-bold hover:border-secondary hover:text-secondary transition-colors"
                @click="showToast(t('dashboard.main.compare_soon'), 'info')">
                {{ t('rfq.compare_offers') }}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-20 bg-card rounded-3xl border-2 border-dashed border-border p-8">
        <FilePlus class="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
        <p class="text-xs font-black text-muted-foreground">{{ t('rfq.no_rfqs_yet') }}</p>
      </div>
    </template>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/composables/useToast';
import api from '@/services/api';
import { formatEGPCurrency } from '@/utils/currency';
import { FilePlus, FileText } from 'lucide-vue-next';

const { t, locale } = useI18n();
const authStore = useAuthStore();
const { showToast } = useToast();

const items = ref([]);
const loading = ref(false);

const formatCurrency = (val) => formatEGPCurrency(val, locale.value);


const fetchData = async () => {
  loading.value = true;
  try {
    if (authStore.isVendor) {
      // Fetch vendor's submitted offers
      const res = await api.get('/rfq/offers/me');
      items.value = res?.offers || res || [];
    } else {
      // Fetch buyer's posted RFQs
      const res = await api.get('/rfq/me');
      items.value = res?.rfqs || res || [];
    }
  } catch (err) {
    items.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);
</script>

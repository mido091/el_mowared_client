<template>
  <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="px-2 border-s-4 border-primary">
        <h1 class="text-3xl font-black text-foreground uppercase tracking-tighter">{{ t('admin.payments', 'Payment Audit') }}</h1>
        <p class="text-muted-foreground font-semibold text-[11px] tracking-wide mt-1">{{ t('admin.payment_subtitle') }}</p>
      </div>
    </div>

    <!-- Financial Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <DashCard>
        <div class="flex items-start justify-between">
          <div class="space-y-2">
            <h3 class="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">{{ t('admin.total_escrow_volume') }}</h3>
            <div class="text-3xl font-black text-primary">${{ metrics.totalVolume.toLocaleString() }}</div>
          </div>
          <div class="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <DollarSign class="w-5 h-5" />
          </div>
        </div>
      </DashCard>

      <DashCard>
        <div class="flex items-start justify-between">
          <div class="space-y-2">
            <h3 class="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">{{ t('admin.pending_settlements') }}</h3>
            <div class="text-3xl font-black text-amber-500">{{ metrics.pendingWait }}</div>
          </div>
          <div class="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
            <Clock class="w-5 h-5" />
          </div>
        </div>
      </DashCard>

      <DashCard>
        <div class="flex items-start justify-between">
          <div class="space-y-2">
            <h3 class="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">{{ t('admin.processed_funds') }}</h3>
            <div class="text-3xl font-black text-green-500">{{ metrics.processedTotal }}</div>
          </div>
          <div class="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500">
            <CheckCircle class="w-5 h-5" />
          </div>
        </div>
      </DashCard>
    </div>

    <!-- Payments Table -->
    <DataTable :columns="columns" :items="payments" :loading="loading" :has-filters="true">
      <template #cell-order_no="{ item }">
        <div class="flex flex-col">
          <span class="font-mono font-black text-primary text-xs">#{{ (item.order_id || item.id).toString().slice(-8).toUpperCase() }}</span>
          <span class="text-[9px] text-muted-foreground uppercase font-bold mt-0.5">{{ formatDate(item.created_at) }}</span>
        </div>
      </template>
      
      <template #cell-buyer="{ item }">
        <div class="flex items-center gap-3">
           <div class="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center text-[10px] font-black text-muted-foreground">
             {{ (item.buyer?.full_name || item.user?.full_name || 'U').charAt(0) }}
           </div>
           <div class="flex flex-col">
             <span class="font-bold text-foreground text-sm leading-tight">{{ item.buyer?.full_name || item.user?.full_name }}</span>
             <span class="text-[9px] text-muted-foreground uppercase tracking-wider font-bold">{{ item.buyer?.email || item.user?.email }}</span>
           </div>
        </div>
      </template>

      <template #cell-amount="{ item }">
        <div class="flex flex-col">
          <span class="font-black text-foreground">${{ item.amount || item.deposit_amount }}</span>
          <span class="text-[9px] text-muted-foreground uppercase font-black tracking-widest">{{ item.payment_method || 'INSTAPAY' }}</span>
        </div>
      </template>

      <template #cell-receipt="{ item }">
         <button v-if="item.receipt_url || item.transaction_image" @click="previewReceipt(item)" class="w-16 h-10 rounded-xl border border-border overflow-hidden block group relative ring-1 ring-border/50 hover:ring-primary/50 transition-all shadow-sm">
           <img :src="item.receipt_url || item.transaction_image" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
           <div class="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
             <Eye class="w-4 h-4 text-white drop-shadow-md" />
           </div>
         </button>
         <div v-else class="flex flex-col items-center opacity-30">
            <AlertCircle class="w-5 h-5 text-muted-foreground" />
            <span class="text-[8px] font-black uppercase mt-1">{{ t('admin.no_receipt') }}</span>
         </div>
      </template>

      <template #cell-status="{ item }">
         <div :class="[
           'inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest',
           item.admin_status === 'VERIFIED' ? 'bg-green-500/10 text-green-600 border border-green-500/20' : 
           item.admin_status === 'REJECTED' ? 'bg-red-500/10 text-red-600 border border-red-500/20' :
           'bg-amber-500/10 text-amber-600 border border-amber-500/20'
         ]">
           {{ t('admin.' + (item.admin_status?.toLowerCase() || 'pending')) }}
         </div>
      </template>

      <template #cell-actions="{ item }">
         <div v-if="item.admin_status === 'PENDING' || !item.admin_status" class="flex gap-2 justify-end">
            <button @click="verifyPayment(item.id, 'VERIFIED')" class="btn-success btn-xs !rounded-xl flex items-center shadow-sm hover:shadow-md transition-all">
              <Check class="w-3.5 h-3.5 me-1" />
              <span class="text-[10px] font-black uppercase tracking-widest">{{ t('common.approve') }}</span>
            </button>
            <button @click="verifyPayment(item.id, 'REJECTED')" class="btn-ghost text-destructive hover:bg-destructive/5 btn-xs !rounded-xl flex items-center transition-all">
              <X class="w-3.5 h-3.5 me-1" />
              <span class="text-[10px] font-black uppercase tracking-widest">{{ t('common.reject') }}</span>
            </button>
         </div>
      </template>
    </DataTable>

    <!-- Receipt Preview Modal -->
    <div v-if="previewOpen" class="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-background/90 backdrop-blur-md" @click="previewOpen = false"></div>
      <div class="relative max-w-4xl w-full bg-card border border-border rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
         <div class="p-4 border-b border-border flex items-center justify-between bg-muted/30">
            <h3 class="text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <Image class="w-4 h-4 text-primary" />
              {{ t('admin.receipt_review_title') }}
            </h3>
            <button @click="previewOpen = false" class="p-2 hover:bg-muted rounded-xl transition-colors">
              <X class="w-5 h-5" />
            </button>
         </div>
         <div class="p-2 overflow-hidden bg-black/5 flex items-center justify-center min-h-[400px]">
           <img :src="selectedReceipt" class="max-w-full max-h-[70vh] object-contain shadow-2xl rounded-lg" />
         </div>
         <div class="p-6 flex justify-center gap-4 bg-muted/30 border-t border-border">
            <button @click="verifyPayment(selectedItem.id, 'REJECTED')" class="btn-outline border-destructive/20 text-destructive hover:bg-destructive hover:text-white px-8 h-12">
               <span class="font-black uppercase tracking-widest text-xs">{{ t('admin.reject_receipt') }}</span>
            </button>
            <button @click="verifyPayment(selectedItem.id, 'VERIFIED')" class="btn-primary px-12 h-12 shadow-lg shadow-primary/20">
               <Check class="w-5 h-5 me-2" />
               <span class="font-black uppercase tracking-widest text-xs">{{ t('admin.verify_confirm') }}</span>
            </button>
         </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Check, X, Eye, Image, AlertCircle, DollarSign, Clock, CheckCircle } from 'lucide-vue-next';
import api from '@/services/api';
import { useUiStore } from '@/stores/ui';
import DataTable from '@/components/ui/DataTable.vue';
import DashCard from '@/components/dashboard/DashCard.vue';

const { t, locale } = useI18n();
const uiStore = useUiStore();
const loading = ref(true);
const payments = ref([]);

const previewOpen = ref(false);
const selectedReceipt = ref(null);
const selectedItem = ref(null);

const metrics = computed(() => {
  let totalVolume = 0;
  let pendingWait = 0;
  let processedTotal = 0;

  payments.value.forEach(p => {
    const amt = parseFloat(p.amount || p.deposit_amount || 0);
    // Include all non-cancelled into volume
    if (p.admin_status !== 'CANCELLED' && p.admin_status !== 'REJECTED') {
      totalVolume += amt;
    }
    
    if (p.admin_status === 'PENDING') {
      pendingWait++;
    } else if (p.admin_status === 'VERIFIED' || p.admin_status === 'PROCESSING' || p.admin_status === 'SHIPPED' || p.admin_status === 'COMPLETED') {
      processedTotal++;
    }
  });

  return { totalVolume, pendingWait, processedTotal };
});

const columns = [
  { key: 'order_no', label: t('dashboard.orders') },
  { key: 'buyer', label: t('admin.buyer') },
  { key: 'amount', label: t('dashboard.stats.revenue') },
  { key: 'receipt', label: t('admin.receipt') },
  { key: 'status', label: t('common.status') },
  { key: 'actions', label: '', class: 'w-48 text-end' }
];

const formatDate = (d) => new Date(d).toLocaleDateString(locale.value === 'ar' ? 'ar-EG' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' });

const fetchPayments = async () => {
  loading.value = true;
  try {
    const res = await api.get('/admin/payments');
    const list = Array.isArray(res) ? res : (res?.data ?? []);
    payments.value = list.map(p => ({
      ...p,
      admin_status: p.verification_status || p.admin_status
    }));
  } catch (err) { 
    console.error('Payments error:', err); 
  } finally { 
    loading.value = false; 
  }
};

const previewReceipt = (item) => {
  selectedReceipt.value = item.receipt_url || item.transaction_image;
  selectedItem.value = item;
  previewOpen.value = true;
};

const verifyPayment = async (id, status) => {
  try {
    // Note: id here is usually the order_id or payment record id. 
    // In our backend, OrderController.confirmPayment(req.params.id) expects Order ID.
    const p = payments.value.find(pay => pay.id === id);
    const orderId = p.order_id || p.id;

    await api.patch(`/orders/${orderId}/confirm-payment`, { 
      status, 
      note: status === 'REJECTED' ? t('admin.payments.reject_note') : t('admin.payments.verify_note') 
    });

    uiStore.showToast(
      status === 'VERIFIED' ? t('admin.paymentConfirmed') : t('admin.paymentRejected'), 
      status === 'VERIFIED' ? 'success' : 'warning'
    );
    
    previewOpen.value = false;
    fetchPayments();
  } catch (err) { 
    uiStore.showToast(t('errors.action_failed'), 'error'); 
  }
};

onMounted(fetchPayments);
</script>

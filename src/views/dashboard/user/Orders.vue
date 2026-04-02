<template>
  <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-foreground">{{ t('orders.management') }}</h1>
        <p class="text-muted-foreground font-medium uppercase text-[10px] tracking-widest mt-1">{{ t('orders.management_subtitle') }}</p>
      </div>
    </div>

    <!-- Status Tabs -->
    <div class="flex gap-1 bg-muted p-1 rounded-xl w-fit overflow-x-auto max-w-full custom-scrollbar">
      <button 
        v-for="status in statuses" :key="status" 
        @click="activeStatus = status"
        :class="[
          'px-5 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap',
          activeStatus === status ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
        ]"
      >
        {{ status === 'ALL' ? t('orders.all_orders') : t('orders.status_' + status.toLowerCase()) }}
      </button>
    </div>

    <!-- Orders Table -->
    <DataTable :columns="columns" :items="orders" :loading="loading" :has-filters="false">
      <template #cell-order_no="{ item }">
        <span class="font-mono font-bold text-primary">#{{ item.id.slice(-6).toUpperCase() }}</span>
      </template>
      <template #cell-vendor="{ item }">
        <div class="flex items-center gap-3">
           <div class="w-8 h-8 rounded-xl bg-secondary/10 flex items-center justify-center text-[10px] font-black text-secondary border border-secondary/10">
             {{ item.vendor?.company_name?.charAt(0) || 'V' }}
           </div>
           <div>
             <p class="font-bold text-foreground">{{ item.vendor?.company_name }}</p>
             <p class="text-[10px] text-muted-foreground uppercase font-black mt-0.5 tracking-wider">{{ item.vendor?.category }}</p>
           </div>
        </div>
      </template>
      <template #cell-amount="{ item }">
        <div>
          <p class="font-black text-foreground tabular-nums">{{ formatCurrency(item.amount) }}</p>
          <p class="text-[10px] text-muted-foreground font-bold tabular-nums">{{ t('cart.deposit') }}: {{ formatCurrency(item.deposit_amount) }}</p>
        </div>
      </template>
      <template #cell-status="{ item }">
        <span :class="['badge-sm', getStatusBadge(item.status)]">{{ t('orders.status_' + item.status.toLowerCase()) }}</span>
      </template>
      <template #cell-date="{ item }">
        <span class="text-xs text-muted-foreground font-medium tabular-nums">{{ new Date(item.date || item.created_at).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US') }}</span>
      </template>
      <template #cell-actions="{ item }">
        <div class="flex gap-2 justify-end">
          <button @click="openReceiptModal(item)" v-if="item.status === 'PENDING' && !item.receipt_url" class="btn-icon bg-amber-500/10 text-amber-600 hover:bg-amber-500 hover:text-white h-8 w-8 !rounded-lg flex items-center justify-center">
            <Upload class="w-3.5 h-3.5" />
          </button>
          <button @click="openDetails(item)" class="btn-ghost btn-icon h-8 w-8 !rounded-lg flex items-center justify-center">
            <Eye class="w-3.5 h-3.5" />
          </button>
        </div>
      </template>
    </DataTable>

    <!-- Upload Receipt Modal -->
    <BaseModal v-if="uploadingOrder" @close="uploadingOrder = null" :title="t('orders.upload_transfer_receipt')" size="md">
      <div class="space-y-6 py-4">
        <div class="p-4 bg-muted/30 rounded-2xl border border-border/50 text-center">
           <p class="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">{{ t('cart.deposit') }}</p>
           <p class="text-3xl font-black text-foreground">{{ formatCurrency(uploadingOrder.deposit_amount) }}</p>
        </div>
        
        <div class="form-group">
          <label class="form-label uppercase text-[10px] tracking-widest font-black">{{ t('orders.support_files') }}</label>
          <div 
            @dragover.prevent @drop.prevent="handleDrop"
            class="h-48 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-primary transition-colors cursor-pointer group bg-muted/10 relative overflow-hidden"
          >
            <template v-if="!receiptPreview">
              <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <CloudUpload class="w-6 h-6" />
              </div>
              <p class="text-sm font-bold text-foreground">{{ t('orders.click_to_select') }}</p>
              <input type="file" @change="handleFile" class="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
            </template>
            <template v-else>
               <img :src="receiptPreview" class="w-full h-full object-cover" />
               <button @click="receiptPreview = null" class="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-lg hover:bg-black/70">
                 <X class="w-4 h-4" />
               </button>
            </template>
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <button @click="submitReceipt" :disabled="!receiptFile || uploading" class="btn-primary w-full h-12 font-black uppercase tracking-widest text-xs">
            <Loader2 v-if="uploading" class="w-4 h-4 animate-spin" />
            <span v-else>{{ t('orders.submit_for_verification') }}</span>
          </button>
          <button @click="uploadingOrder = null" class="btn-ghost text-xs font-bold">{{ t('common.cancel') }}</button>
        </div>
      </div>
    </BaseModal>

    <!-- Details Modal (Simplified) -->
    <BaseModal v-if="selectedOrder" @close="selectedOrder = null" :title="t('dashboard.main.order_hash') + selectedOrder.id.slice(-6).toUpperCase()" size="lg">
       <div class="py-4 space-y-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div class="space-y-4">
                <h4 class="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">{{ t('rfq.requirement') }}</h4>
                <div v-for="item in selectedOrder.items" :key="item.id" class="flex gap-4 p-3 rounded-xl bg-muted/20 border border-border/30">
                   <div class="w-12 h-12 rounded-lg bg-muted overflow-hidden border border-border">
                      <img v-if="item.product?.image_url" :src="item.product.image_url" class="w-full h-full object-cover" />
                      <Package v-else class="w-full h-full p-3 text-muted-foreground/30" />
                   </div>
                   <div class="flex-1">
                      <p class="text-xs font-bold text-foreground truncate max-w-[150px]">{{ item.product?.name }}</p>
                      <p class="text-[10px] text-muted-foreground font-medium">{{ t('rfq.quantity') }}: {{ item.quantity }} × {{ formatCurrency(item.price) }}</p>
                   </div>
                   <div class="text-end font-black text-sm">{{ formatCurrency(item.quantity * item.price) }}</div>
                </div>
             </div>
             <div class="space-y-4 p-6 bg-muted/10 rounded-2xl border border-border">
                <div class="flex justify-between items-center text-sm"><span class="text-muted-foreground">{{ t('rfq.form.deadline') }}</span><span class="font-bold">{{ new Date(selectedOrder.created_at).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US') }}</span></div>
                <div class="flex justify-between items-center text-sm"><span class="text-muted-foreground">{{ t('common.status') }}</span><span :class="['badge-sm', getStatusBadge(selectedOrder.status)]">{{ t('orders.status_' + selectedOrder.status.toLowerCase()) }}</span></div>
                <div class="flex justify-between items-center pt-4 border-t border-border font-black text-lg"><span>{{ t('orders.total_amount') }}</span><span>{{ formatCurrency(selectedOrder.amount) }}</span></div>
                <p class="text-[10px] text-center text-muted-foreground font-medium mt-4">{{ t('orders.orders_lifecycle') }}</p>
             </div>
          </div>
       </div>
    </BaseModal>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { 
  ShoppingBag, Upload, Eye, Package, 
  CloudUpload, X, Loader2 
} from 'lucide-vue-next';
import api from '@/services/api';
import { formatEGPCurrency } from '@/utils/currency';
import { useUiStore } from '@/stores/ui';
import { useUserOrdersStore } from '@/stores/userOrdersStore';
import DashCard from '@/components/dashboard/DashCard.vue';
import DataTable from '@/components/ui/DataTable.vue';
import BaseModal from '@/components/ui/BaseModal.vue';

const { t, locale } = useI18n();
const uiStore = useUiStore();
const ordersStore = useUserOrdersStore();

const uploading = ref(false);
const uploadingOrder = ref(null);
const receiptFile = ref(null);
const receiptPreview = ref(null);
const selectedOrder = ref(null);

const loading = computed(() => ordersStore.loading);
const orders = computed(() => ordersStore.orders);
const activeStatus = computed({
  get: () => ordersStore.activeStatus,
  set: (value) => ordersStore.setStatus(value),
});

const statuses = ['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'COMPLETED'];

const formatCurrency = (val) => formatEGPCurrency(val, locale.value);

const columns = [
  { key: 'order_no', label: t('orders.orderNo') },
  { key: 'vendor', label: t('orders.vendor') },
  { key: 'amount', label: t('orders.amount') },
  { key: 'status', label: t('common.status') },
  { key: 'date', label: t('common.joinedAt') },
  { key: 'actions', label: '', class: 'w-20 text-end' }
];

const getStatusBadge = (status) => {
  const map = { PENDING: 'badge-warning', PROCESSING: 'badge-primary', SHIPPED: 'badge-secondary', COMPLETED: 'badge-success', CANCELLED: 'badge-danger' };
  return map[status] || 'badge-muted';
};

const fetchOrders = async () => {
  try {
    await ordersStore.fetchOrders();
  } catch (err) {
    uiStore.showToast('Failed to fetch orders', 'error');
  }
};

const openReceiptModal = (o) => {
  uploadingOrder.value = o;
  receiptFile.value = null;
  receiptPreview.value = null;
};

const openDetails = (o) => selectedOrder.value = o;

const handleFile = (e) => {
  const f = e.target.files[0];
  if (f) {
    receiptFile.value = f;
    receiptPreview.value = URL.createObjectURL(f);
  }
};

const handleDrop = (e) => {
  const f = e.dataTransfer.files[0];
  if (f) {
    receiptFile.value = f;
    receiptPreview.value = URL.createObjectURL(f);
  }
};

const submitReceipt = async () => {
  if (!receiptFile.value) return;
  uploading.value = true;
  try {
    const fd = new FormData();
    fd.append('receipt', receiptFile.value);
    await api.post(`/orders/${uploadingOrder.value.id}/receipt`, fd);
    uiStore.showToast(t('orders.receiptUploaded'), 'success');
    uploadingOrder.value = null;
    fetchOrders();
  } catch (err) {
    uiStore.showToast('Upload failed', 'error');
  } finally {
    uploading.value = false;
  }
};

watch(
  [() => ordersStore.activeStatus, () => ordersStore.page],
  fetchOrders
);
onMounted(fetchOrders);
</script>

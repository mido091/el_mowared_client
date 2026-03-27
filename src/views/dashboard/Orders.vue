<template>
  <div class="space-y-8 uppercase tracking-tight pb-20">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-foreground uppercase tracking-tight">{{ t('orders.management') }}</h1>
        <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{{ t('orders.management_subtitle') }}</p>
      </div>
      <div class="flex items-center gap-2">
        <select v-model="filterStatus" @change="fetchOrders"
          class="h-10 px-4 rounded-xl bg-card border border-border text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-secondary">
          <option value="">{{ t('orders.all_orders') }}</option>
          <option value="pending">{{ t('orders.status_pending') }}</option>
          <option value="processing">{{ t('orders.status_processing') }}</option>
          <option value="shipped">{{ t('orders.status_shipped') }}</option>
          <option value="completed">{{ t('orders.status_completed') }}</option>
        </select>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div v-for="stat in orderStats" :key="stat.label" class="bg-card rounded-2xl border border-border p-4 shadow-sm">
        <p class="text-[9px] font-black tracking-widest text-muted-foreground">{{ t(`dashboard.stats.${stat.label}`) }}</p>
        <p class="text-2xl font-black text-foreground mt-1">{{ stat.value }}</p>
      </div>
    </div>

    <!-- Orders List -->
    <div v-if="loading" class="space-y-4">
      <div v-for="i in 4" :key="i" class="h-32 bg-card rounded-2xl border border-border animate-pulse"></div>
    </div>

    <div v-else-if="orders.length > 0" class="space-y-4">
      <div v-for="order in orders" :key="order.id" class="bg-card rounded-2xl border border-border p-6 shadow-sm overflow-hidden relative">
        <!-- Status Indicator Strip -->
        <div class="absolute start-0 top-0 bottom-0 w-1.5" :class="statusColor(order.status).bg"></div>

        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 ps-2">
          <!-- Order Info -->
          <div class="space-y-3 flex-grow">
            <div class="flex items-center gap-3">
              <span class="text-xs font-black text-foreground">{{ t('dashboard.main.order_hash') }}{{ order.id }}</span>
              <span class="text-[9px] font-black px-2 py-0.5 rounded" :class="statusColor(order.status).pill">
                {{ t(`orders.status_${order.status.toLowerCase()}`) }}
              </span>
            </div>
            <p class="text-[10px] font-bold text-muted-foreground">{{ new Date(order.created_at).toLocaleString() }}</p>

            <div class="flex items-center gap-4 pt-2">
              <div class="flex -space-x-2">
                <div v-for="(item, idx) in order.items?.slice(0, 3)" :key="item.id"
                  class="w-8 h-8 rounded-lg border-2 border-card bg-muted/20 overflow-hidden relative z-[3] -ms-2 first:ms-0 shadow-sm"
                  :style="{ zIndex: 10 - idx }">
                  <img :src="item.product?.image || defaultImg" class="w-full h-full object-cover" />
                </div>
                <div v-if="(order.items?.length || 0) > 3" class="w-8 h-8 rounded-lg border-2 border-card bg-muted/30 text-[9px] font-black text-muted-foreground flex items-center justify-center relative z-0">
                  +{{ (order.items?.length || 0) - 3 }}
                </div>
              </div>
              <span class="text-xs font-bold text-foreground">{{ t('orders.items_count', { n: order.items?.length || 0 }) }}</span>
            </div>
          </div>

          <!-- Total & Actions -->
          <div class="flex flex-col md:items-end justify-between gap-4 shrink-0 border-t md:border-t-0 md:border-s border-border pt-4 md:pt-0 md:ps-6">
            <div class="text-start md:text-end">
              <p class="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">{{ t('orders.total_amount') }}</p>
              <p class="text-xl font-black text-secondary">{{ formatCurrency(order.total_amount) }}</p>
            </div>

            <!-- Upload Receipt Action -->
            <button v-if="order.status === 'pending'" @click="openReceiptModal(order)"
              class="btn bg-primary text-white hover:bg-primary/90 h-9 px-4 rounded-xl text-[10px] font-black shadow-lg flex items-center gap-2">
              <UploadCloud class="w-3.5 h-3.5 text-secondary" /> {{ t('orders.upload_transfer_receipt') }}
            </button>

            <!-- View Details Action -->
            <button v-else class="btn border border-border text-foreground hover:border-secondary hover:text-secondary h-9 px-4 rounded-xl text-[10px] font-black transition-colors">
              {{ t('orders.view_details') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-24 bg-card rounded-3xl border-2 border-dashed border-border p-8 px-4">
      <Package class="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
      <h3 class="text-lg font-black text-foreground mb-2">{{ t('orders.no_orders') }}</h3>
      <p class="text-xs font-medium text-muted-foreground normal-case max-w-sm mx-auto mb-6">
        {{ t('orders.orders_lifecycle') }}
      </p>
      <router-link to="/products" class="btn btn-secondary h-11 px-8 rounded-xl text-xs font-black text-white shadow-lg shadow-secondary/20">
        {{ t('orders.browse_marketplace') }}
      </router-link>
    </div>

    <!-- Upload Receipt Modal -->
    <transition name="modal">
      <div v-if="selectedOrder" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4" @click.self="selectedOrder = null">
        <div class="bg-card rounded-3xl border border-border shadow-2xl p-8 w-full max-w-md space-y-6">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-black text-foreground">{{ t('orders.upload_transfer_receipt') }}</h3>
            <button @click="selectedOrder = null" class="text-muted-foreground hover:text-foreground"><X class="w-5 h-5" /></button>
          </div>
          <p class="text-xs text-muted-foreground normal-case leading-relaxed">
            {{ t('orders.upload_receipt_desc', { id: selectedOrder.id }) }}
          </p>
          <div class="space-y-4 text-center">
            <div
              @click="$refs.fileInput.click()"
              class="border-2 border-dashed border-border rounded-2xl p-8 cursor-pointer hover:border-secondary transition-colors group relative"
            >
              <input type="file" ref="fileInput" class="hidden" accept="image/*,.pdf" @change="handleFileChange" />
              <div v-if="!receiptFile" class="space-y-3 pointer-events-none">
                <UploadCloud class="w-8 h-8 text-muted-foreground mx-auto group-hover:text-secondary transition-colors" />
                <p class="text-xs font-bold text-foreground">{{ t('orders.click_to_select') }}</p>
                <p class="text-[10px] text-muted-foreground normal-case">{{ t('orders.support_files') }}</p>
              </div>
              <div v-else class="space-y-3 pointer-events-none">
                <FileCheck class="w-8 h-8 text-secondary mx-auto" />
                <p class="text-xs font-black text-secondary">{{ receiptFile.name }}</p>
                <p class="text-[10px] font-bold text-muted-foreground hover:underline">{{ t('orders.click_to_change') }}</p>
              </div>
            </div>

            <button @click="submitReceipt" :disabled="!receiptFile || uploading"
              class="w-full btn btn-secondary h-11 rounded-xl text-xs font-black text-white shadow-lg disabled:opacity-50 flex items-center justify-center">
              <span v-if="uploading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              <span v-else>{{ t('orders.submit_for_verification') }}</span>
            </button>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/composables/useToast';
import api from '@/services/api';
import { formatEGPCurrency } from '@/utils/currency';
import { Package, UploadCloud, Target, X, FileCheck } from 'lucide-vue-next';

const { t, locale } = useI18n();
const authStore = useAuthStore();
const { showToast } = useToast();

const orders = ref([]);
const loading = ref(false);
const filterStatus = ref('');
const defaultImg = 'https://res.cloudinary.com/demo/image/upload/v1/default_pi1ur8.webp';

// Modal state
const selectedOrder = ref(null);
const fileInput = ref(null);
const receiptFile = ref(null);
const uploading = ref(false);

const formatCurrency = (val) => formatEGPCurrency(val, locale.value);

const orderStats = computed(() => {
  const all = orders.value.length;
  const pending = orders.value.filter(o => o.status === 'pending').length;
  const processing = orders.value.filter(o => o.status === 'processing').length;
  const currMonth = orders.value.filter(o => {
    const d = new Date(o.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  return [
    { label: 'total_orders', value: all },
    { label: 'awaiting_payment', value: pending },
    { label: 'in_progress', value: processing },
    { label: 'this_month', value: currMonth }
  ];
});


const statusColor = (status) => {
  const map = {
    'pending': { bg: 'bg-amber-500', pill: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
    'processing': { bg: 'bg-blue-500', pill: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
    'shipped': { bg: 'bg-indigo-500', pill: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' },
    'completed': { bg: 'bg-emerald-500', pill: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
    'cancelled': { bg: 'bg-red-500', pill: 'bg-red-500/10 text-red-600 dark:text-red-400' },
  };
  return map[status?.toLowerCase()] || { bg: 'bg-slate-500', pill: 'bg-slate-500/10 text-slate-600' };
};

const fetchOrders = async () => {
  loading.value = true;
  try {
    const res = await api.get('/orders', { params: filterStatus.value ? { status: filterStatus.value } : {} });
    orders.value = res?.orders || res || [];
  } catch (err) {
    orders.value = [];
  } finally {
    loading.value = false;
  }
};

const openReceiptModal = (order) => {
  selectedOrder.value = order;
  receiptFile.value = null;
};

const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file && file.size <= 5 * 1024 * 1024) { // 5MB limit
    receiptFile.value = file;
  } else if (file) {
    showToast('File too large. Max 5MB.', 'warning');
    e.target.value = '';
  }
};

const submitReceipt = async () => {
  if (!receiptFile.value) return;
  uploading.value = true;
  try {
    const formData = new FormData();
    formData.append('receipt', receiptFile.value);
    
    // API Call to upload receipt
    await api.post(`/orders/${selectedOrder.value.id}/receipt`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    showToast('Receipt uploaded successfully. Awaiting admin verification.', 'success');
    selectedOrder.value = null;
    fetchOrders(); // Refresh status
  } catch (err) {
    showToast('Failed to upload receipt.', 'error');
  } finally {
    uploading.value = false;
  }
};

onMounted(fetchOrders);
</script>

<style scoped>
.modal-enter-active { transition: all 0.25s ease-out; }
.modal-leave-active { transition: all 0.2s ease-in; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from > div { transform: scale(0.95); }
.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
</style>

<template>
  <div class="space-y-8 animate-in fade-in duration-500">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-foreground uppercase tracking-tight">{{ t('dashboard.welcomeBack') }}, {{ authStore.userName }}!</h1>
        <p class="text-muted-foreground font-medium mt-1">{{ t('dashboard.userSubtitle') }}</p>
      </div>
      <div class="flex gap-2">
        <router-link to="/rfq/post" class="btn-primary">
          <Plus class="w-4 h-4" /> {{ t('rfq.postRfq') }}
        </router-link>
        <router-link to="/products" class="btn-outline">
          <ShoppingBag class="w-4 h-4" /> {{ t('nav.products') }}
        </router-link>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <DashStat 
        :label="t('common.orders')" 
        :value="stats.orders_count" 
        :icon="ShoppingBag" 
        iconBg="bg-primary/10" 
        iconColor="text-primary"
      />
      <DashStat 
        :label="t('rfq.myRfqs')" 
        :value="stats.rfqs_count" 
        :icon="FileText" 
        iconBg="bg-secondary/10" 
        iconColor="text-secondary"
      />
      <DashStat 
        :label="t('chat.title')" 
        :value="stats.unread_messages" 
        :icon="MessageSquare" 
        iconBg="bg-amber-500/10" 
        iconColor="text-amber-600"
      />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Recent Orders (2/3) -->
      <div class="lg:col-span-2 space-y-6">
        <h3 class="text-lg font-black text-foreground flex items-center gap-2">
          <ShoppingBag class="w-5 h-5 text-primary" />
          {{ t('dashboard.recentOrders') }}
        </h3>
        <DataTable 
          :items="recentOrders" 
          :columns="columns" 
          :loading="loading"
          :pageSize="5"
        >
          <template #cell-order_no="{ item }">
            <span class="font-mono font-bold text-primary">#{{ shortOrderId(item.id) }}</span>
          </template>
          
          <template #cell-vendor="{ item }">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-xl bg-primary/5 flex items-center justify-center text-[10px] font-black text-primary border border-primary/10">
                {{ item.vendor?.company_name?.charAt(0) || t('common.vendor_initial', 'V') }}
              </div>
              <div>
                <p class="font-bold text-foreground truncate max-w-[120px]">{{ item.vendor?.company_name }}</p>
                <p class="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{{ item.vendor?.category ? t('categories.' + item.vendor.category) : t('categories.general', 'General') }}</p>
              </div>
            </div>
          </template>

          <template #cell-amount="{ item }">
            <span class="font-black text-foreground">{{ formatCurrency(item.amount) }}</span>
          </template>

          <template #cell-status="{ item }">
            <BaseBadge :variant="getStatusVariant(item.status)">
              {{ t('orders.status_' + item.status.toLowerCase()) }}
            </BaseBadge>
          </template>

          <template #cell-actions>
            <BaseButton variant="ghost" size="sm" to="/dashboard/user/orders" v-icon>
              <ArrowRight class="w-3.5 h-3.5" />
            </BaseButton>
          </template>
        </DataTable>
      </div>

      <!-- Purchase Timeline / RFQ Progress (1/3) -->
      <div class="space-y-6">
        <h3 class="text-lg font-black text-foreground flex items-center gap-2">
          <TrendingUp class="w-5 h-5 text-secondary" />
          {{ t('dashboard.activeTracking') }}
        </h3>
        <div class="card p-6">
          <div v-if="latestOrder" class="space-y-6">
             <div class="flex items-center justify-between pb-4 border-b border-border">
               <span class="text-xs font-bold uppercase tracking-widest text-muted-foreground">{{ t('user.orders.tracking_title') }}</span>
               <span class="text-xs font-mono font-black text-primary">#{{ shortOrderId(latestOrder.id) }}</span>
             </div>
             <PurchaseTimeline :order="latestOrder" />
          </div>
          <div v-else class="py-12 text-center space-y-4">
             <div class="w-16 h-16 rounded-3xl bg-muted mx-auto flex items-center justify-center text-muted-foreground/40">
               <Package class="w-8 h-8" />
             </div>
             <p class="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{{ t('user.orders.no_shipments') }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { 
  ShoppingBag, FileText, MessageSquare, Plus, 
  ArrowRight, ChevronRight, Package, TrendingUp
} from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import api from '@/services/api';
import { formatEGPCurrency } from '@/utils/currency';
import DashStat from '@/components/dashboard/DashStat.vue';
import DataTable from '@/components/ui/DataTable.vue';
import BaseBadge from '@/components/ui/BaseBadge.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import PurchaseTimeline from '@/components/dashboard/PurchaseTimeline.vue';

const { t, locale } = useI18n();
const authStore = useAuthStore();
const loading = ref(true);
const stats = ref({ orders_count: 0, rfqs_count: 0, unread_messages: 0, active_rfqs: [] });
const recentOrders = ref([]);
const shortOrderId = (id) => String(id ?? '').slice(-6).toUpperCase();

const columns = [
  { key: 'order_no', label: t('orders.orderNo') },
  { key: 'vendor', label: t('orders.vendor') },
  { key: 'amount', label: t('orders.amount') },
  { key: 'status', label: t('common.status') },
  { key: 'actions', label: '', class: 'w-10 text-end' }
];

const formatCurrency = (val) => formatEGPCurrency(val, locale.value);

const latestOrder = computed(() => recentOrders.value[0]);

const getStatusVariant = (status) => {
  const map = { PENDING: 'warning', PROCESSING: 'primary', SHIPPED: 'secondary', COMPLETED: 'success', CANCELLED: 'destructive' };
  return map[status] || 'default';
};

const vIcon = {
  mounted(el) {
    el.classList.add('aspect-square', 'p-0', 'w-8', 'h-8');
  }
};

onMounted(async () => {
  loading.value = true;
  try {
    const [statRes, orderRes] = await Promise.all([
      api.get('/user/stats'), 
      api.get('/user/orders?limit=5')
    ]);
    // api.js interceptor already unwraps response.data — use directly
    stats.value = statRes?.data || statRes || { orders_count: 0, rfqs_count: 0, unread_messages: 0 };
    recentOrders.value = Array.isArray(orderRes) ? orderRes : (orderRes?.data ?? []);
  } catch (err) {
    console.error('User Dash Error:', err);
  } finally {
    loading.value = false;
  }
});
</script>

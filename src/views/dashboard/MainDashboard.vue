<template>
  <div class="space-y-8 uppercase tracking-tight pb-10 mt-4">
    <!-- Welcome Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div class="space-y-1">
        <h1 class="text-3xl font-black text-foreground tracking-tight">
          {{ t('dashboard.main.welcome', { name: authStore.userName }) }}
        </h1>
        <p class="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          {{ t('dashboard.main.dashboard_active', { role: authStore.user?.role }) }}
        </p>
      </div>
      <div class="flex items-center gap-3">
        <router-link v-if="!authStore.isVendor" to="/rfq/post" class="btn btn-secondary h-11 px-6 rounded-xl text-xs font-black shadow-lg shadow-secondary/20">
          <PlusCircle class="w-4 h-4 me-2" /> {{ t('dashboard.main.post_rfq_short') }}
        </router-link>
        <router-link to="/products" class="btn border border-border bg-card hover:border-secondary hover:text-secondary h-11 px-6 rounded-xl text-xs font-black transition-all">
          <LayoutGrid class="w-4 h-4 me-2" /> {{ t('dashboard.main.browse') }}
        </router-link>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <div
        v-for="stat in statsCards"
        :key="stat.label"
        class="bg-card rounded-[1.75rem] border border-border p-5 shadow-sm"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="space-y-2">
            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              {{ t(stat.label) }}
            </p>
            <p class="text-2xl font-black text-foreground">
              {{ stat.value }}
            </p>
            <p class="text-[9px] font-bold mt-1" :class="stat.trend > 0 ? 'text-emerald-500' : 'text-slate-400'">
              {{ stat.trend > 0 ? '+' : '' }}{{ stat.trend }}% {{ t('dashboard.stats.vs_last_month') }}
            </p>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/10 flex items-center justify-center">
            <component :is="stat.icon" class="w-5 h-5 text-primary" />
          </div>
        </div>
      </div>
    </div>

    <!-- Two Column Layout: Main Feed & Sidebar -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- Main Feed -->
      <div class="lg:col-span-8 space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-black text-foreground flex items-center gap-2">
            <Activity class="w-5 h-5 text-secondary" /> {{ t('dashboard.main.recent_activity') }}
          </h2>
          <router-link to="/dashboard/user/orders" class="text-[10px] font-black text-secondary uppercase tracking-widest hover:underline">{{ t('dashboard.main.view_all') }}</router-link>
        </div>

        <div class="bg-card rounded-[2rem] border border-border overflow-hidden shadow-sm">
          <div v-if="loadingOrders" class="p-8 space-y-4">
            <div v-for="i in 3" :key="i" class="h-16 bg-muted/20 rounded-xl animate-pulse"></div>
          </div>
          <div v-else-if="recentOrders.length > 0" class="divide-y divide-border">
            <div v-for="order in recentOrders" :key="order.id" class="p-6 hover:bg-muted/10 transition-colors flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10">
                  <Package class="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p class="text-sm font-black text-foreground uppercase">{{ t('dashboard.main.order_hash') }}{{ order.id }}</p>
                  <p class="text-[10px] font-bold text-muted-foreground">{{ new Date(order.created_at).toLocaleDateString() }}</p>
                </div>
              </div>
              <div class="text-end">
                <span class="text-[9px] font-black px-2 py-1 rounded bg-muted/30 text-muted-foreground mb-1 inline-block">{{ t(`orders.status_${order.status.toLowerCase()}`, order.status.toUpperCase()) }}</span>
                <p class="text-sm font-black text-secondary">{{ formatCurrency(order.total_price || order.amount) }}</p>
              </div>
            </div>
          </div>
          <div v-else class="p-12 text-center text-muted-foreground">
            <Box class="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p class="text-xs font-black">{{ t('dashboard.main.no_recent_orders') }}</p>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="lg:col-span-4 space-y-6">
        <h2 class="text-xl font-black text-foreground flex items-center gap-2">
          <ShieldCheck class="w-5 h-5 text-emerald-500" /> {{ t('dashboard.main.security_center') }}
        </h2>
        
        <div class="bg-card rounded-[2rem] border border-border p-6 shadow-sm space-y-1">
          <div class="flex items-center gap-4 border-b border-border pb-6 mb-6">
            <div class="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
              <CheckCircle2 class="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p class="text-xs font-black text-foreground uppercase tracking-tight">{{ t('dashboard.main.account_verified') }}</p>
              <p class="text-[9px] text-muted-foreground normal-case font-medium leading-tight mt-1">{{ t('dashboard.main.full_access_desc') }}</p>
            </div>
          </div>
          
          <div class="space-y-4">
            <div class="flex items-center justify-between text-xs font-bold">
              <span class="text-muted-foreground">{{ t('dashboard.main.email_security') }}</span>
              <span class="text-emerald-500">{{ t('dashboard.main.enabled') }}</span>
            </div>
            <div class="flex items-center justify-between text-xs font-bold">
              <span class="text-muted-foreground">{{ t('dashboard.main.two_factor') }}</span>
              <span class="text-amber-500">{{ t('dashboard.main.suggested') }}</span>
            </div>
            <div class="flex items-center justify-between text-xs font-bold">
              <span class="text-muted-foreground">{{ t('dashboard.main.escrow_wallet_active') }}</span>
              <span class="text-emerald-500">{{ t('dashboard.main.enabled') }}</span>
            </div>
          </div>
          
          <button class="w-full mt-6 btn bg-muted/30 text-foreground hover:bg-muted/50 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors">
            {{ t('dashboard.main.security_settings') }}
          </button>
        </div>
        
        <!-- Quick Action banner -->
        <div v-if="authStore.isVendor" class="bg-primary rounded-[2rem] border border-primary p-6 relative overflow-hidden shadow-premium">
          <div class="absolute -right-10 -bottom-10 w-32 h-32 bg-secondary/20 rounded-full blur-2xl"></div>
          <div class="relative z-10 text-white">
            <h3 class="text-sm font-black uppercase mb-1">{{ t('dashboard.main.find_new_clients') }}</h3>
            <p class="text-[10px] font-medium normal-case text-white/70 mb-4">{{ t('dashboard.main.find_new_clients_desc') }}</p>
            <router-link to="/rfq" class="inline-flex w-full items-center justify-center btn btn-secondary h-10 rounded-xl text-[10px] font-black shadow-lg">
              {{ t('dashboard.main.explore_rfqs') }}
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';
import api from '@/services/api';
import { formatEGPCurrency } from '@/utils/currency';
import { getApiCollection } from '@/utils/apiResponse';
import { 
  FilePlus, Activity, Package, ShieldCheck, LayoutGrid,
  CheckCircle2, Box, TrendingUp, DollarSign, Users, ShoppingCart,
  AlertTriangle
} from 'lucide-vue-next';

const { t, locale } = useI18n();
const authStore = useAuthStore();
const recentOrders = ref([]);
const loadingOrders = ref(false);

const statsData = ref({
  orders: 0,
  revenue: 0,
  rfqs: 0,
  active: 0
});

const formatCurrency = (val) => formatEGPCurrency(val, locale.value);

const statsCards = computed(() => {
  const v = authStore.isVendor;
  return [
    { label: v ? 'dashboard.stats.total_sales' : 'dashboard.stats.total_orders', value: statsData.value.orders, trend: 12, icon: ShoppingCart, loading: loadingOrders.value },
    { label: v ? 'dashboard.stats.revenue' : 'dashboard.stats.total_spent', value: formatCurrency(statsData.value.revenue), trend: 8, icon: DollarSign, loading: loadingOrders.value },
    { label: v ? 'dashboard.stats.offers_made' : 'dashboard.stats.posted_rfqs', value: statsData.value.rfqs, trend: -2, icon: FilePlus, loading: loadingOrders.value },
    { label: 'dashboard.stats.active_disputes', value: statsData.value.active, trend: 0, icon: AlertTriangle, loading: loadingOrders.value },
  ];
});

const fetchDashboardData = async () => {
  loadingOrders.value = true;
  try {
    // Fetch recent orders
    const oRes = await api.get('/orders?limit=4');
    const orders = getApiCollection(oRes);
    recentOrders.value = orders.slice(0, 4);
    
    // Simulate stats calculations from orders
    const all = orders;
    statsData.value.orders = all.length;
    statsData.value.revenue = all.reduce((sum, o) => sum + Number(o.total_price || o.amount || 0), 0);
    
    // Fetch RFQs for count
    const rRes = await api.get(authStore.isVendor ? '/rfq/feed' : '/rfq');
    const rfqs = getApiCollection(rRes, ['rfqs', 'items']);
    statsData.value.rfqs = rfqs.length;
    
  } catch (err) {
    console.error('Failed to fetch dashboard data', err);
  } finally {
    loadingOrders.value = false;
  }
};

onMounted(fetchDashboardData);
</script>

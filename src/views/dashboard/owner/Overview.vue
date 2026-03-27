<template>
  <div class="space-y-8 animate-in fade-in duration-500">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-black text-foreground uppercase tracking-tighter">{{ t('dashboard.owner.title', 'Platform Control') }}</h1>
        <p class="text-muted-foreground font-medium mt-1">{{ t('dashboard.owner.subtitle', 'Superuser Analytics & Enterprise Governance') }}</p>
      </div>
      <div class="flex items-center gap-3">
        <router-link to="/dashboard/admin/products" class="btn-outline btn-sm">
          <Package class="w-4 h-4 me-2" />
          {{ t('admin.products.title', 'Product Moderation') }}
        </router-link>
        <router-link to="/dashboard/admin/vendors" class="btn-outline btn-sm">
          <ShieldCheck class="w-4 h-4 me-2" />
          {{ t('admin.vendors', 'Vendors') }}
        </router-link>
        <router-link to="/dashboard/owner/logs" class="btn-outline btn-sm">
          <FileText class="w-4 h-4 me-2" />
          {{ t('dashboard.owner.viewLogs', 'System Logs') }}
        </router-link>
        <router-link to="/dashboard/owner/users" class="btn-primary btn-sm">
          <Users class="w-4 h-4 me-2" />
          {{ t('admin.manageUsers', 'Manage Users') }}
        </router-link>
      </div>
    </div>

    <!-- Global Stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <DashStat :label="t('admin.totalRevenue')" :value="formatCurrency(stats.total_revenue)" :icon="BarChart3" iconBg="bg-primary/10" iconColor="text-primary" />
      <DashStat :label="t('admin.activeVendors')" :value="stats.vendors_count" :icon="ShieldCheck" iconBg="bg-secondary/10" iconColor="text-secondary" />
      <DashStat :label="t('admin.totalOrders')" :value="stats.orders_count" :icon="ShoppingBag" iconBg="bg-teal-500/10" iconColor="text-teal-600" />
      <DashStat :label="t('admin.totalUsers')" :value="stats.users_count" :icon="Users" iconBg="bg-indigo-500/10" iconColor="text-indigo-600" />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Growth Analytics Placeholder (2/3) -->
      <DashCard :title="t('dashboard.owner.platformGrowth', 'Platform Growth History')" class="lg:col-span-2">
        <div class="h-64 flex flex-col items-center justify-center p-8 bg-muted/20 border border-dashed border-border rounded-2xl">
           <TrendingUp class="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
           <p class="text-sm text-muted-foreground font-bold uppercase tracking-widest">{{ t('dashboard.owner.growth_coming_soon') }}</p>
           <p class="text-[10px] text-muted-foreground mt-2 italic">{{ t('dashboard.owner.growth_desc') }}</p>
        </div>
      </DashCard>

      <!-- Critical Alerts (1/3) -->
      <DashCard :title="t('admin.criticalAlerts', 'Critical Alerts')">
        <div class="space-y-4">
          <div v-for="alert in alerts" :key="alert.id" class="p-3 rounded-xl border border-destructive/20 bg-destructive/5 flex items-start gap-3 mb-2">
            <AlertCircle class="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <div>
              <p class="text-xs font-bold text-foreground">{{ t(alert.titleKey) }}</p>
              <p class="text-[10px] text-muted-foreground mt-0.5">{{ t(alert.descKey, alert.params) }}</p>
            </div>
          </div>
          <div v-if="!alerts.length" class="py-4 text-center text-[10px] text-muted-foreground font-bold italic">{{ t('admin.noCriticalAlerts', 'No critical system alerts') }}</div>
        </div>
      </DashCard>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { 
  BarChart3, ShieldCheck, ShoppingBag, Users, 
  CreditCard, FileText, TrendingUp, AlertCircle, Package
} from 'lucide-vue-next';
import api from '@/services/api';
import { getApiCollection, getApiData } from '@/utils/apiResponse';
import { formatEGPCurrency } from '@/utils/currency';
import DashStat from '@/components/dashboard/DashStat.vue';
import DashCard from '@/components/dashboard/DashCard.vue';

const { t, locale } = useI18n();
const loading = ref(true);
const stats = ref({ total_revenue: 0, vendors_count: 0, orders_count: 0, users_count: 0 });
const alerts = ref([]);

const formatCurrency = (val) => formatEGPCurrency(val, locale.value);

const fetchData = async () => {
  loading.value = true;
  try {
    const [statRes, alertRes] = await Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/alerts')
    ]);
    stats.value = getApiData(statRes) || {};
    alerts.value = getApiCollection(alertRes, ['alerts', 'items']);
  } catch (err) { console.error('Owner Error:', err); }
  finally { loading.value = false; }
};

onMounted(fetchData);
</script>

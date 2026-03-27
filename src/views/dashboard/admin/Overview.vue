<template>
  <div class="space-y-8 animate-in fade-in duration-500">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-black text-foreground uppercase tracking-tighter">{{ t('dashboard.admin.title', 'Operational Hub') }}</h1>
        <p class="text-muted-foreground font-medium mt-1">{{ t('dashboard.admin.subtitle', 'Moderation Queue & Active Verifications') }}</p>
      </div>
      <div class="flex items-center gap-3">
        <router-link to="/dashboard/admin/vendors" class="btn-outline btn-sm">
          <ShieldCheck class="w-4 h-4 me-2" />
          {{ t('admin.allVendors', 'Vendor Onboarding') }}
        </router-link>
        <router-link to="/dashboard/admin/products" class="btn-primary btn-sm">
          <FileText class="w-4 h-4 me-2" />
          {{ t('admin.products.title', 'Product Moderation') }}
        </router-link>
      </div>
    </div>

    <!-- Operational Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="card p-6 border-l-4 border-l-amber-500 bg-amber-500/5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-1">{{ t('dashboard.pending_vendors') }}</p>
            <p class="text-2xl font-black text-foreground">{{ pendingVendors.length }}</p>
          </div>
          <UserPlus class="w-8 h-8 text-amber-500/40" />
        </div>
      </div>
      <div class="card p-6 border-l-4 border-l-blue-500 bg-blue-500/5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">{{ t('dashboard.verify_payments') }}</p>
            <p class="text-2xl font-black text-foreground">{{ stats.pending_payments || 0 }}</p>
          </div>
          <CreditCard class="w-8 h-8 text-blue-500/40" />
        </div>
      </div>
      <div class="card p-6 border-l-4 border-l-teal-500 bg-teal-500/5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-[10px] font-black uppercase tracking-widest text-teal-600 mb-1">{{ t('dashboard.open_rfqs') }}</p>
            <p class="text-2xl font-black text-foreground">{{ stats.open_rfqs || 0 }}</p>
          </div>
          <FileText class="w-8 h-8 text-teal-500/40" />
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Vendor Verification Queue (2/3) -->
      <DashCard :title="t('admin.verificationQueue', 'Vendor Verification Queue')" class="lg:col-span-2">
        <DataTable :columns="columns" :items="pendingVendors" :loading="loading" :has-filters="false">
          <template #cell-company_name="{ item }">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-muted flex items-center justify-center font-bold text-xs uppercase">{{ item.company_name?.charAt(0) }}</div>
              <div>
                <p class="font-bold text-foreground">{{ item.company_name }}</p>
                <p class="text-[10px] text-muted-foreground uppercase tracking-wider">{{ item.email }}</p>
              </div>
            </div>
          </template>
          <template #cell-actions="{ item }">
            <div class="flex gap-2 justify-end">
              <button @click="verifyVendor(item.id)" class="btn-success btn-xs !rounded-lg flex items-center">
                <Check class="w-3 h-3 me-1"/> {{ t('common.approve', 'Approve') }}
              </button>
              <button @click="rejectVendor(item.id)" class="btn-ghost btn-xs text-destructive hover:bg-destructive/5 !rounded-lg flex items-center">
                <X class="w-3 h-3 me-1"/> {{ t('common.reject', 'Reject') }}
              </button>
            </div>
          </template>
        </DataTable>
        <div v-if="!pendingVendors.length && !loading" class="py-12 flex flex-col items-center justify-center text-center opacity-50">
           <ShieldCheck class="w-12 h-12 mb-4" />
           <p class="text-sm font-bold uppercase tracking-widest">{{ t('dashboard.all_verified') }}</p>
           <p class="text-xs italic">{{ t('dashboard.all_processed') }}</p>
        </div>
      </DashCard>

      <!-- Payment Audit Teaser (1/3) -->
      <DashCard :title="t('admin.recentAudit', 'Recent Activity')">
        <div class="space-y-4">
           <div v-for="log in adminLogs" :key="log.id" class="p-3 rounded-xl border border-border/50 bg-muted/20 flex items-start gap-3">
             <div class="w-2 h-2 rounded-full bg-primary/40 mt-1.5 shrink-0"></div>
             <div>
                <p class="text-xs font-bold text-foreground">{{ log.action }}</p>
                <p class="text-[10px] text-muted-foreground mt-0.5">{{ log.details }}</p>
                <p class="text-[9px] text-muted-foreground italic mt-1">{{ formatDate(log.created_at) }}</p>
             </div>
           </div>
           <div v-if="!adminLogs.length" class="py-8 text-center text-xs text-muted-foreground font-bold italic">{{ t('dashboard.no_admin_actions') }}</div>
           <router-link to="/dashboard/admin/payments" class="btn btn-ghost w-full btn-xs">{{ t('common.view_all', 'View All Activity') }}</router-link>
        </div>
      </DashCard>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { 
  ShieldCheck, Check, X, CreditCard, UserPlus, FileText
} from 'lucide-vue-next';
import api from '@/services/api';
import { useUiStore } from '@/stores/ui';
import { useNotificationStore } from '@/stores/notificationStore';
import DashCard from '@/components/dashboard/DashCard.vue';
import DataTable from '@/components/ui/DataTable.vue';

const { t } = useI18n();
const uiStore = useUiStore();
const notificationStore = useNotificationStore();
const loading = ref(true);
const stats = ref({ pending_payments: 0, open_rfqs: 0 });
const pendingVendors = ref([]);
const adminLogs = ref([]);

const columns = [
  { key: 'company_name', label: t('vendor.companyName', 'Vendor Detail') },
  { key: 'actions', label: '', class: 'w-40 text-end' }
];

const formatDate = (d) => new Date(d).toLocaleDateString();

const verifyVendor = async (id) => {
  try {
    await api.put(`/admin/vendors/${id}/verify`);
    uiStore.showToast(t('admin.vendorApproved', 'Vendor approved successfully'), 'success');
    fetchData();
  } catch (err) { uiStore.showToast(t('admin.approval_failed'), 'error'); }
};

const rejectVendor = async (id) => {
  if (!(await notificationStore.confirm(
    t('admin.confirm.reject_vendor'),
    t('common.confirm')
  ))) return;
  try {
    await api.put(`/admin/vendors/${id}/reject`);
    uiStore.showToast(t('admin.vendorRejectedToast'), 'warning');
    fetchData();
  } catch (err) { uiStore.showToast(t('admin.rejection_failed'), 'error'); }
};

const fetchData = async () => {
  loading.value = true;
  try {
    const [statRes, vendorRes] = await Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/vendors?status=PENDING')
    ]);
    // api.js interceptor already unwraps response.data — use directly
    stats.value = statRes || { pending_payments: 0, open_rfqs: 0 };
    const vendorData = Array.isArray(vendorRes) ? vendorRes : (vendorRes?.data ?? []);
    pendingVendors.value = vendorData;
    // Admin logs placeholder
    adminLogs.value = []; 
  } catch (err) { console.error('Admin Error:', err); }
  finally { loading.value = false; }
};

onMounted(fetchData);
</script>

<template>
  <div class="min-w-0 space-y-6 overflow-x-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-black text-foreground uppercase tracking-tighter">{{ t('admin.vendors', 'Vendor Network') }}</h1>
        <p class="text-muted-foreground font-medium uppercase text-[10px] tracking-[0.2em] mt-1 italic">{{ t('admin.vendor_subtitle') }}</p>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="flex max-w-full gap-1 overflow-x-auto bg-muted/50 p-1 rounded-2xl border border-border/50 backdrop-blur-sm">
      <button 
        v-for="status in ['ALL', 'PENDING', 'APPROVED', 'REJECTED']" :key="status" 
        @click="activeStatus = status"
        :class="[
          'px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300',
          activeStatus === status ? 'bg-card text-primary shadow-lg shadow-black/5 ring-1 ring-border' : 'text-muted-foreground hover:text-foreground'
        ]"
      >
        {{ t('admin.' + status.toLowerCase(), status) }}
      </button>
    </div>

    <!-- Vendors Table -->
    <DataTable :columns="columns" :items="vendors" :loading="loading" :has-filters="false">
      <template #cell-company_name="{ item }">
        <div class="flex items-center gap-4 cursor-pointer group py-1" @click="openVendor(item)">
           <div class="w-12 h-12 rounded-2xl bg-muted overflow-hidden border border-border group-hover:border-primary/50 transition-all duration-300 shadow-inner flex items-center justify-center">
             <img v-if="item.logo || item.user?.profile_image_url || item.profile_image_url" :src="item.logo || item.user?.profile_image_url || item.profile_image_url" class="w-full h-full object-cover" />
             <Package v-else class="w-6 h-6 text-muted-foreground/20" />
           </div>
           <div class="space-y-0.5">
             <p class="font-bold text-foreground group-hover:text-primary transition-colors leading-tight text-sm">
               {{ item.company_name_en || item.company_name_ar }}
             </p>
             <div class="flex items-center gap-2">
               <p class="text-[9px] text-muted-foreground font-black tracking-widest uppercase">{{ item.email || t('admin.no_email') }}</p>
               <span v-if="item.location" class="w-1 h-1 rounded-full bg-border"></span>
               <p v-if="item.location" class="text-[9px] text-muted-foreground font-medium uppercase truncate max-w-[120px]">{{ item.location }}</p>
             </div>
           </div>
        </div>
      </template>
      <template #cell-status="{ item }">
        <div :class="[
          'inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest',
          vendorStatusBadgeClass(item)
        ]">
          <span class="w-1.5 h-1.5 rounded-full me-2" :class="vendorStatusDotClass(item)"></span>
          {{ vendorStatusLabel(item) }}
        </div>
      </template>
      <template #cell-actions="{ item }">
         <div class="flex flex-wrap gap-2 justify-end">
            <button @click="openVendor(item)" class="btn-ghost btn-xs !rounded-xl flex items-center justify-center hover:bg-primary/5 hover:text-primary transition-all group">
              <Eye class="w-3.5 h-3.5 me-1.5 opacity-50 group-hover:opacity-100" /> 
              <span class="text-[10px] font-black uppercase tracking-widest">{{ t('common.review') }}</span>
            </button>
            <button v-if="item.verification_status === 'PENDING' && item.record_state !== 'DELETED'" @click="toggleVerify(item.id, true)" class="btn-success btn-xs !rounded-xl flex items-center justify-center shadow-sm hover:shadow-md transition-all">
              <Check class="w-3.5 h-3.5 me-1.5" /> 
              <span class="text-[10px] font-black uppercase tracking-widest">{{ t('common.approve') }}</span>
            </button>
            <button @click="confirmDeleteVendor(item)" class="btn-ghost btn-xs !rounded-xl flex items-center justify-center text-destructive hover:bg-destructive/5 transition-all">
              <Trash2 class="w-3.5 h-3.5 me-1.5" />
              <span class="text-[10px] font-black uppercase tracking-widest">{{ item.record_state === 'DELETED' ? (locale === 'ar' ? 'حذف نهائي' : 'Purge') : t('common.delete', 'Delete') }}</span>
            </button>
         </div>
      </template>
    </DataTable>

    <!-- Detail Modal -->
    <VendorDetailModal 
      :is-open="modalOpen" 
      :vendor="selectedVendor" 
      @close="modalOpen = false" 
      @verify="vId => toggleVerify(vId, true)"
      @reject="vId => toggleVerify(vId, false)"
      @delete="confirmDeleteVendorById"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { Check, X, Package, Eye, Trash2 } from 'lucide-vue-next';
import api from '@/services/api';
import { useUiStore } from '@/stores/ui';
import { useNotificationStore } from '@/stores/notificationStore';
import { normalizeError } from '@/utils/errorHandler';
import { useAdminVendorsStore } from '@/stores/adminVendorsStore';
import DataTable from '@/components/ui/DataTable.vue';
import VendorDetailModal from '@/components/dashboard/VendorDetailModal.vue';

const { t, locale } = useI18n();
const uiStore = useUiStore();
const notificationStore = useNotificationStore();
const vendorsStore = useAdminVendorsStore();
const { vendors, loading } = storeToRefs(vendorsStore);
const activeStatus = ref('ALL');

const modalOpen = ref(false);
const selectedVendor = ref({});

const columns = [
  { key: 'company_name', label: t('vendor.companyName') },
  { key: 'status', label: t('common.status') },
  { key: 'actions', label: '', class: 'w-48 text-end' }
];

const recordStateLabel = (item) => {
  switch (`${item.record_state || ''}`.toUpperCase()) {
    case 'DELETED':
      return t('common.deleted', 'Deleted');
    case 'INACTIVE':
      return locale.value === 'ar' ? 'موقوف' : 'Inactive';
    default:
      return t(`admin.${String(item.verification_status || 'PENDING').toLowerCase()}`, item.verification_status || 'PENDING');
  }
};

const vendorStatusLabel = (item) => {
  switch (`${item.record_state || ''}`.toUpperCase()) {
    case 'DELETED':
      return t('common.deleted', 'Deleted');
    case 'INACTIVE':
      return locale.value === 'ar' ? 'موقوف' : 'Inactive';
    default:
      return t(`admin.${String(item.verification_status || 'PENDING').toLowerCase()}`, item.verification_status || 'PENDING');
  }
};

const vendorStatusBadgeClass = (item) => {
  switch (`${item.record_state || ''}`.toUpperCase()) {
    case 'DELETED':
      return 'bg-slate-500/10 text-slate-600 border border-slate-500/20';
    case 'INACTIVE':
      return 'bg-amber-500/10 text-amber-600 border border-amber-500/20';
    default:
      switch (`${item.verification_status || ''}`.toUpperCase()) {
        case 'APPROVED':
          return 'bg-green-500/10 text-green-600 border border-green-500/20';
        case 'REJECTED':
          return 'bg-red-500/10 text-red-600 border border-red-500/20';
        default:
          return 'bg-amber-500/10 text-amber-600 border border-amber-500/20';
      }
  }
};

const vendorStatusDotClass = (item) => {
  switch (`${item.record_state || ''}`.toUpperCase()) {
    case 'DELETED':
      return 'bg-slate-500';
    case 'INACTIVE':
      return 'bg-amber-600';
    default:
      switch (`${item.verification_status || ''}`.toUpperCase()) {
        case 'APPROVED':
          return 'bg-green-600';
        case 'REJECTED':
          return 'bg-red-600';
        default:
          return 'bg-amber-600';
      }
  }
};

const fetchVendors = async () => {
  try {
    await vendorsStore.fetchVendors({
      status: activeStatus.value,
      mode: 'revalidate',
    });
  } catch (err) { 
    uiStore.showToast(t('errors.fetch_failed'), 'error'); 
  }
};

const openVendor = async (vendor) => {
  selectedVendor.value = { ...vendor };
  modalOpen.value = true;
  
  // Fetch full details (includes categories) using profile ID
  try {
    const vId = vendor.vendor_id || vendor.id;
    const res = await api.get(`/vendors/${vId}`);
    // Extract vendor from JSEND response format (res.data.vendor)
    const vendorData = res?.data?.vendor || res?.vendor || res;
    selectedVendor.value = { ...selectedVendor.value, ...vendorData };
  } catch (err) { 
    console.error('Failed to fetch full vendor details:', err); 
  }
};

const toggleVerify = async (id, verify) => {
  try {
    if (verify) {
      await vendorsStore.verifyVendor(id);
    } else {
      await vendorsStore.rejectVendor(id);
    }
    uiStore.showToast(
      verify ? t('admin.vendorApproved') : t('admin.vendorRejected'), 
      verify ? 'success' : 'warning'
    );
    modalOpen.value = false;
  } catch (err) { 
    uiStore.showToast(t('errors.action_failed'), 'error'); 
  }
};

const deleteVendor = async (vendorId) => {
  await vendorsStore.deleteVendor(vendorId);
  if ((selectedVendor.value?.vendor_id || selectedVendor.value?.id) === vendorId) {
    selectedVendor.value = {};
    modalOpen.value = false;
  }
};

const confirmDeleteVendorById = async (vendorId) => {
  const vendor = vendors.value.find((item) => (item.vendor_id || item.id) === vendorId) || selectedVendor.value;
  await confirmDeleteVendor(vendor);
};

const confirmDeleteVendor = async (vendor) => {
  const vendorId = vendor?.vendor_id || vendor?.id;
  if (!vendorId) return;
  const isDeletedRecord = `${vendor?.record_state || ''}`.toUpperCase() === 'DELETED';

  const confirmed = await notificationStore.confirm(
    isDeletedRecord
      ? (locale.value === 'ar'
        ? 'هذا المورد محذوف بالفعل. هل تريد حذفه نهائيًا من النظام؟'
        : 'This vendor is already deleted. Do you want to purge it permanently from the system?')
      : t('admin.confirmDeleteVendor', 'This will permanently delete the vendor and all related data.'),
    'common.confirm'
  );

  if (!confirmed) return;

  try {
    await deleteVendor(vendorId);
    uiStore.showToast(
      isDeletedRecord
        ? (locale.value === 'ar' ? 'تم حذف المورد نهائيًا من النظام.' : 'Vendor purged permanently from the system.')
        : t('admin.vendorDeleted', 'Vendor deleted successfully'),
      'success'
    );
  } catch (err) {
    uiStore.showToast(normalizeError(err).message, 'error');
  }
};

watch(activeStatus, fetchVendors);
onMounted(fetchVendors);
</script>

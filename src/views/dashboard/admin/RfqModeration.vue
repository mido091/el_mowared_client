<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-black text-foreground">{{ t('rfqModeration.title') }}</h1>
        <p class="text-sm font-medium text-muted-foreground mt-1">
          {{ pendingCount }} {{ t('rfqModeration.pendingReview') }}
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
      <button
        v-for="card in statCards"
        :key="card.key"
        type="button"
        class="card p-6 flex items-center justify-between text-start border transition-all"
        :class="activeFilter === card.key ? card.activeClass : 'hover:border-primary/20 hover:shadow-md'"
        @click="activeFilter = card.key"
      >
        <div>
          <p class="text-sm font-bold uppercase tracking-wider mb-1" :class="activeFilter === card.key ? 'text-foreground' : 'text-muted-foreground'">
            {{ card.label }}
          </p>
          <p class="text-3xl font-black" :class="card.valueClass">{{ card.value }}</p>
        </div>
        <div class="w-12 h-12 rounded-2xl flex items-center justify-center" :class="card.iconWrapClass">
          <component :is="card.icon" class="w-6 h-6" :class="card.iconClass" />
        </div>
      </button>
    </div>

    <div class="card mt-6">
      <div class="p-6 border-b border-border flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-lg font-bold">{{ queueTitle }}</h2>
          <p class="text-sm text-muted-foreground mt-1">{{ filteredRfqs.length }} {{ t('common.results') }}</p>
        </div>
        <button
          v-if="activeFilter !== 'pending'"
          type="button"
          class="btn-outline h-10 px-4 text-xs font-black"
          @click="activeFilter = 'pending'"
        >
          {{ resetFilterLabel }}
        </button>
      </div>

      <div v-if="loading" class="p-6 space-y-4">
        <div v-for="i in 3" :key="i" class="h-16 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl"></div>
      </div>

      <div v-else-if="filteredRfqs.length === 0" class="p-12 text-center flex flex-col items-center">
        <div class="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <CheckCircleIcon class="w-8 h-8 text-emerald-500" />
        </div>
        <h3 class="text-lg font-bold text-foreground">{{ emptyStateTitle }}</h3>
        <p class="text-muted-foreground text-sm mt-1">{{ emptyStateDesc }}</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-border bg-slate-50/50 dark:bg-slate-900/50 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <th class="p-4">{{ t('rfqModeration.columns.rfqDetails') }}</th>
              <th class="p-4">{{ t('rfqModeration.columns.privacy') }}</th>
              <th class="p-4">{{ t('rfqModeration.columns.submittedBy') }}</th>
              <th class="p-4 text-center">{{ t('rfqModeration.columns.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr
              v-for="rfq in filteredRfqs"
              :key="rfq.id"
              class="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group"
            >
              <td class="p-4">
                <p class="font-bold text-foreground text-sm leading-tight mb-1">{{ rfq.title }}</p>
                <div class="flex items-center gap-2 mt-1 flex-wrap">
                  <span class="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded font-semibold">
                    {{ rfq.category_name || 'Category #' + rfq.category_id }}
                  </span>
                  <span class="text-[10px] font-bold text-secondary">{{ rfq.quantity }} {{ t('rfqModeration.units') }}</span>
                  <span class="text-[10px] font-black px-2 py-0.5 rounded-full" :class="statusBadgeClass(rfq.status)">
                    {{ rfq.status }}
                  </span>
                </div>
              </td>
              <td class="p-4">
                <span class="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-black tracking-widest uppercase border" :class="rfq.privacy_type === 'PRIVATE' ? 'bg-secondary/10 text-secondary border-secondary/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'">
                  <LockIcon v-if="rfq.privacy_type === 'PRIVATE'" class="w-3 h-3" />
                  <GlobeIcon v-else class="w-3 h-3" />
                  {{ rfq.privacy_type }}
                </span>
              </td>
              <td class="p-4">
                <p class="text-xs font-bold text-foreground">{{ rfq.user_name || 'User #' + rfq.user_id }}</p>
                <p class="text-[10px] text-muted-foreground">{{ formatDate(rfq.created_at) }}</p>
              </td>
              <td class="p-4">
                <div class="flex flex-wrap items-center justify-center gap-2">
                  <button
                    @click="openDetails(rfq.id)"
                    class="w-8 h-8 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center p-0 transition-colors ring-0"
                    :title="t('rfqModeration.reviewSubmission')"
                  >
                    <EyeIcon class="w-4 h-4" />
                  </button>
                  <button
                    v-if="canBroadcast(rfq)"
                    @click="broadcastRfq(rfq.id)"
                    :disabled="actionLoading"
                    class="btn-primary py-1.5 px-3 text-[11px] h-8 font-bold gap-1 active:scale-95 transition-transform"
                  >
                    <RadioIcon class="w-3.5 h-3.5" /> {{ t('rfqModeration.broadcast') }}
                  </button>
                  <button
                    v-if="canReject(rfq)"
                    @click="rejectRfq(rfq.id)"
                    :disabled="actionLoading"
                    class="inline-flex items-center gap-1 rounded-lg bg-red-500/10 px-3 py-1.5 text-[11px] font-bold text-red-600 transition hover:bg-red-500/15 disabled:opacity-60"
                  >
                    <BanIcon class="w-3.5 h-3.5" /> {{ rejectLabel }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div
      v-if="detailsOpen"
      class="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      @click.self="closeDetails"
    >
      <div class="w-full max-w-5xl max-h-[88vh] overflow-hidden rounded-3xl border border-border bg-card shadow-2xl flex flex-col">
        <div class="flex items-center justify-between border-b border-border px-6 py-5 shrink-0">
          <div>
            <p class="text-xs font-black uppercase tracking-[0.25em] text-primary">{{ t('rfqModeration.reviewSubmission') }}</p>
            <h3 class="mt-1 text-2xl font-black text-foreground">{{ selectedRfq?.title || 'RFQ' }}</h3>
          </div>
          <button class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700" @click="closeDetails">
            <XIcon class="h-5 w-5" />
          </button>
        </div>

        <div class="overflow-y-auto px-6 py-5">
          <div v-if="detailLoading" class="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div class="h-64 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800" />
            <div class="space-y-4">
              <div class="h-24 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
              <div class="h-24 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
              <div class="h-24 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
            </div>
          </div>

          <div v-else-if="selectedRfq" class="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div class="space-y-6">
              <div class="overflow-hidden rounded-3xl border border-border bg-slate-50 dark:bg-slate-900">
                <img
                  v-if="selectedRfq.image_url"
                  :src="selectedRfq.image_url"
                  :alt="selectedRfq.title"
                  class="h-64 w-full object-cover"
                />
                <div v-else class="flex h-64 items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 dark:from-slate-800 dark:to-slate-900 dark:text-slate-500">
                  <ImageOffIcon class="h-14 w-14" />
                </div>
              </div>

              <div class="rounded-3xl border border-border bg-white p-5 shadow-sm dark:bg-slate-950">
                <h4 class="text-lg font-black text-foreground">{{ detailsLabel }}</h4>
                <RfqItemsList class="mt-4" :items="selectedRfqItems" :item-label="whatNeededLabel" :details-label="productDetailsLabel" />
                <p v-if="!selectedRfqItems.length" class="mt-3 whitespace-pre-line text-sm leading-7 text-muted-foreground">
                  {{ noDescriptionLabel }}
                </p>
              </div>
            </div>

            <div class="space-y-4">
              <div class="rounded-3xl border border-border bg-white p-5 shadow-sm dark:bg-slate-950">
                <h4 class="text-lg font-black text-foreground">{{ submittedByLabel }}</h4>
                <div class="mt-4 flex items-center gap-3">
                  <img
                    v-if="selectedRfq.user_avatar"
                    :src="selectedRfq.user_avatar"
                    :alt="selectedRfq.user_name || 'User'"
                    class="h-12 w-12 rounded-2xl object-cover"
                  />
                  <div v-else class="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 font-black text-primary">
                    {{ initials(selectedRfq.user_name) }}
                  </div>
                  <div>
                    <p class="font-bold text-foreground">{{ selectedRfq.user_name || `User #${selectedRfq.user_id}` }}</p>
                    <p class="text-xs text-muted-foreground">{{ formatDate(selectedRfq.created_at) }}</p>
                  </div>
                </div>
              </div>

              <div class="rounded-3xl border border-border bg-white p-5 shadow-sm dark:bg-slate-950">
                <h4 class="text-lg font-black text-foreground">{{ rfqCardLabel }}</h4>
                <div class="mt-4 grid gap-3 sm:grid-cols-2">
                  <div class="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                    <p class="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">{{ categoryLabel }}</p>
                    <p class="mt-2 font-bold text-foreground">{{ selectedCategoryName }}</p>
                  </div>
                  <div class="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                    <p class="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">{{ quantityLabel }}</p>
                    <p class="mt-2 font-bold text-foreground">{{ selectedRfq.quantity }} {{ unitsLabel }}</p>
                  </div>
                  <div class="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                    <p class="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">{{ targetPriceLabel }}</p>
                    <p class="mt-2 font-bold text-foreground">{{ formatPrice(selectedRfq.target_price) }}</p>
                  </div>
                  <div class="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                    <p class="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">{{ expirationLabel }}</p>
                    <p class="mt-2 font-bold text-foreground">{{ formatDate(selectedRfq.expiration_time) }}</p>
                  </div>
                  <div class="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                    <p class="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">{{ priorityLabel }}</p>
                    <p class="mt-2 font-bold text-foreground">{{ selectedRfq.lead_priority || '-' }}</p>
                  </div>
                  <div class="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                    <p class="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">{{ statusLabel }}</p>
                    <p class="mt-2 font-bold text-foreground">{{ selectedRfq.status }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="selectedRfq" class="border-t border-border px-6 py-4 flex flex-wrap justify-end gap-3 shrink-0">
          <button class="btn-outline px-5 font-bold" @click="closeDetails">{{ closeLabel }}</button>
          <button
            v-if="canReject(selectedRfq)"
            @click="rejectRfq(selectedRfq.id)"
            :disabled="actionLoading"
            class="inline-flex items-center gap-2 rounded-xl bg-red-500/10 px-5 py-3 text-sm font-bold text-red-600 transition hover:bg-red-500/15 disabled:opacity-60"
          >
            <BanIcon class="h-4 w-4" /> {{ rejectLabel }}
          </button>
          <button
            v-if="canBroadcast(selectedRfq)"
            @click="broadcastRfq(selectedRfq.id)"
            :disabled="actionLoading"
            class="btn-primary px-5 font-bold"
          >
            <RadioIcon class="h-4 w-4" /> {{ t('rfqModeration.broadcast') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import api from '@/services/api';
import {
  ShieldAlertIcon,
  RadioIcon,
  LayersIcon,
  CheckCircleIcon,
  LockIcon,
  GlobeIcon,
  EyeIcon,
  XIcon,
  ImageOffIcon,
  BanIcon
} from 'lucide-vue-next';
import { useNotificationStore } from '@/stores/notificationStore';
import { useRfqStore } from '@/stores/rfqStore';
import { normalizeError } from '@/utils/errorHandler';
import { getApiData } from '@/utils/apiResponse';
import { formatEGPCurrency } from '@/utils/currency';
import { normalizeRfqItems } from '@/utils/rfqItems';
import RfqItemsList from '@/components/rfq/RfqItemsList.vue';

const { t } = useI18n();
const notificationStore = useNotificationStore();
const rfqStore = useRfqStore();
const { adminRfqs, loading } = storeToRefs(rfqStore);

const actionLoading = ref(false);
const detailsOpen = ref(false);
const detailLoading = ref(false);
const selectedRfq = ref(null);
const activeFilter = ref('pending');

const copy = computed(() =>
  document?.documentElement?.dir === 'rtl'
    ? {
        queuePending: 'الطلبات قيد الاعتماد',
        queueAll: 'جميع الطلبات',
        queueBroadcasted: 'الطلبات التي تم بثها اليوم',
        resetFilter: 'عرض القيد فقط',
        noPending: 'لا توجد طلبات بانتظار المراجعة',
        noPendingDesc: 'لا توجد طلبات جديدة تحتاج إلى تدخل الآن.',
        noAll: 'لا توجد طلبات RFQ',
        noAllDesc: 'لم يتم العثور على أي طلبات داخل النظام حتى الآن.',
        noBroadcasted: 'لا توجد طلبات تم بثها اليوم',
        noBroadcastedDesc: 'جرّب العودة لاحقًا أو غيّر الفلتر.',
        category: 'الفئة',
        quantity: 'الكمية',
        targetPrice: 'السعر المستهدف',
        expiration: 'تاريخ الانتهاء',
        priority: 'الأولوية',
        status: 'الحالة',
        close: 'إغلاق',
        noDescription: 'لا يوجد وصف تفصيلي.',
        details: 'تفاصيل الطلب',
        whatNeeded: 'ماذا تحتاج',
        productDetails: 'تفاصيل المنتج',
        submittedBy: 'مقدم الطلب',
        rfqCard: 'بطاقة طلبات العروض',
        reject: 'رفض الطلب'
      }
    : {
        queuePending: 'Pending Approval Requests',
        queueAll: 'All RFQs',
        queueBroadcasted: 'Broadcasted Today',
        resetFilter: 'Back to Pending',
        noPending: 'No RFQs waiting for review',
        noPendingDesc: 'There are no new RFQs requiring moderation right now.',
        noAll: 'No RFQs available',
        noAllDesc: 'No RFQs were found in the system yet.',
        noBroadcasted: 'No RFQs broadcasted today',
        noBroadcastedDesc: 'Try again later or switch the quick filter.',
        category: 'Category',
        quantity: 'Quantity',
        targetPrice: 'Target Price',
        expiration: 'Expiration Date',
        priority: 'Priority',
        status: 'Status',
        close: 'Close',
        noDescription: 'No detailed description.',
        details: 'RFQ Details',
        whatNeeded: 'What do you need',
        productDetails: 'Product details',
        submittedBy: 'Submitted By',
        rfqCard: 'RFQ Card',
        reject: 'Reject RFQ'
      }
);

const pendingStatuses = ['PENDING', 'DRAFT'];
const broadcastedStatuses = ['BROADCASTED', 'OPEN'];

const totalCount = computed(() => adminRfqs.value.length);
const pendingCount = computed(() => adminRfqs.value.filter((r) => pendingStatuses.includes(r.status)).length);
const broadcastedCount = computed(() => adminRfqs.value.filter((r) => broadcastedStatuses.includes(r.status)).length);

const filteredRfqs = computed(() => {
  if (activeFilter.value === 'all') return adminRfqs.value;
  if (activeFilter.value === 'broadcasted') {
    return adminRfqs.value.filter((r) => broadcastedStatuses.includes(r.status));
  }
  return adminRfqs.value.filter((r) => pendingStatuses.includes(r.status));
});

const queueTitle = computed(() => {
  if (activeFilter.value === 'all') return copy.value.queueAll;
  if (activeFilter.value === 'broadcasted') return copy.value.queueBroadcasted;
  return copy.value.queuePending;
});

const emptyStateTitle = computed(() => {
  if (activeFilter.value === 'all') return copy.value.noAll;
  if (activeFilter.value === 'broadcasted') return copy.value.noBroadcasted;
  return copy.value.noPending;
});

const emptyStateDesc = computed(() => {
  if (activeFilter.value === 'all') return copy.value.noAllDesc;
  if (activeFilter.value === 'broadcasted') return copy.value.noBroadcastedDesc;
  return copy.value.noPendingDesc;
});

const statCards = computed(() => [
  {
    key: 'all',
    label: t('rfqModeration.totalRfqs'),
    value: totalCount.value,
    valueClass: 'text-foreground',
    icon: LayersIcon,
    iconWrapClass: 'bg-primary/10',
    iconClass: 'text-primary',
    activeClass: 'border-primary/30 bg-primary/5 shadow-md shadow-primary/10'
  },
  {
    key: 'pending',
    label: t('rfqModeration.pendingApproval'),
    value: pendingCount.value,
    valueClass: 'text-secondary',
    icon: ShieldAlertIcon,
    iconWrapClass: 'bg-secondary/20',
    iconClass: 'text-secondary',
    activeClass: 'border-secondary/30 bg-secondary/5 shadow-md shadow-secondary/10'
  },
  {
    key: 'broadcasted',
    label: t('rfqModeration.broadcastedToday'),
    value: broadcastedCount.value,
    valueClass: 'text-emerald-600',
    icon: RadioIcon,
    iconWrapClass: 'bg-emerald-100',
    iconClass: 'text-emerald-600',
    activeClass: 'border-emerald-300 bg-emerald-50 shadow-md shadow-emerald-100'
  }
]);

const categoryLabel = computed(() => copy.value.category);
const quantityLabel = computed(() => copy.value.quantity);
const targetPriceLabel = computed(() => copy.value.targetPrice);
const expirationLabel = computed(() => copy.value.expiration);
const priorityLabel = computed(() => copy.value.priority);
const statusLabel = computed(() => copy.value.status);
const unitsLabel = computed(() => t('rfqModeration.units'));
const closeLabel = computed(() => copy.value.close);
const noDescriptionLabel = computed(() => copy.value.noDescription);
const detailsLabel = computed(() => copy.value.details);
const whatNeededLabel = computed(() => copy.value.whatNeeded);
const productDetailsLabel = computed(() => copy.value.productDetails);
const submittedByLabel = computed(() => copy.value.submittedBy);
const rfqCardLabel = computed(() => copy.value.rfqCard);
const rejectLabel = computed(() => copy.value.reject);
const resetFilterLabel = computed(() => copy.value.resetFilter);
const selectedRfqItems = computed(() => normalizeRfqItems(selectedRfq.value));

const selectedCategoryName = computed(() => {
  if (!selectedRfq.value) return '-';
  return selectedRfq.value.category_name_ar || selectedRfq.value.category_name_en || selectedRfq.value.category_name || `Category #${selectedRfq.value.category_id}`;
});

const fetchData = async () => {
  try {
    await rfqStore.fetchAdminRfqs({ mode: 'revalidate' });
  } catch (error) {
    console.error('Failed fetching moderation list', error);
  }
};

const openDetails = async (id) => {
  detailsOpen.value = true;
  detailLoading.value = true;
  try {
    const res = await api.get(`/rfq/${id}`);
    selectedRfq.value = getApiData(res);
  } catch (error) {
    notificationStore.error(normalizeError(error).message || 'Failed to load RFQ details.');
    detailsOpen.value = false;
  } finally {
    detailLoading.value = false;
  }
};

const closeDetails = () => {
  detailsOpen.value = false;
  selectedRfq.value = null;
};

const canBroadcast = (rfq) => rfq?.status === 'PENDING';
const canReject = (rfq) => rfq?.status === 'PENDING';

const broadcastRfq = async (id) => {
  actionLoading.value = true;
  try {
    await api.post(`/rfq/${id}/broadcast`);
    notificationStore.success(t('rfqModeration.broadcastSuccess'));
    if (selectedRfq.value?.id === id) closeDetails();
    await fetchData();
  } catch (err) {
    notificationStore.error(normalizeError(err).message || t('rfqModeration.broadcastFail'));
  } finally {
    actionLoading.value = false;
  }
};

const rejectRfq = async (id) => {
  actionLoading.value = true;
  try {
    await api.post(`/rfq/${id}/reject`);
    notificationStore.success(rejectLabel.value);
    if (selectedRfq.value?.id === id) closeDetails();
    await fetchData();
  } catch (err) {
    notificationStore.error(normalizeError(err).message || rejectLabel.value);
  } finally {
    actionLoading.value = false;
  }
};

onMounted(fetchData);

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

const formatPrice = (value) => {
  if (value == null || value === '') return '-';
  return formatEGPCurrency(value);
};

const initials = (name = '') => (name || 'U').trim().charAt(0).toUpperCase();

const statusBadgeClass = (status) => {
  const map = {
    PENDING: 'bg-amber-100 text-amber-700',
    DRAFT: 'bg-slate-100 text-slate-600',
    BROADCASTED: 'bg-emerald-100 text-emerald-700',
    OPEN: 'bg-emerald-100 text-emerald-700',
    REJECTED: 'bg-red-100 text-red-600',
    COMPLETED: 'bg-primary/10 text-primary'
  };
  return map[status] || 'bg-slate-100 text-slate-600';
};
</script>

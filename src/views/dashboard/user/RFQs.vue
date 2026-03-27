<template>
  <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-foreground uppercase tracking-tight">{{ t('rfq.my_rfqs') }}</h1>
        <p class="text-muted-foreground font-medium uppercase text-[10px] tracking-widest mt-1">{{ t('orders.management_subtitle') }}</p>
      </div>
      <router-link to="/rfq/post" class="btn-primary shadow-lg shadow-primary/20">
        <Plus class="w-4 h-4" /> {{ t('rfq.postRfq') }}
      </router-link>
    </div>

    <!-- RFQs List -->
    <DataTable :columns="columns" :items="rfqs" :loading="loading" :has-filters="true">
      <template #cell-title="{ item }">
        <router-link :to="'/rfq/' + item.id" class="group">
          <p class="font-bold text-foreground group-hover:text-primary transition-colors">{{ item.title }}</p>
          <p class="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">{{ item.category_id ? t('categories.' + item.category_id) : '' }}</p>
        </router-link>
      </template>
      <template #cell-offers_count="{ item }">
        <div class="flex items-center gap-2">
          <div :class="['w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs', item.offers_count > 0 ? 'bg-secondary/10 text-secondary border border-secondary/10' : 'bg-muted text-muted-foreground/50']">
            {{ item.offers_count || 0 }}
          </div>
          <span class="text-xs font-bold text-muted-foreground">{{ t('rfq.offers') }}</span>
        </div>
      </template>
      <template #cell-status="{ item }">
        <span :class="['badge-sm flex items-center gap-1.5 w-fit', getStatusBadge(item.status)]">
           <div :class="['w-1.5 h-1.5 rounded-full', getStatusDot(item.status)]"></div>
           {{ t('rfq.status_' + item.status.toLowerCase(), item.status) }}
        </span>
      </template>
      <template #cell-deadline="{ item }">
        <span class="text-xs text-muted-foreground font-medium tabular-nums">{{ item.expiration_time ? new Date(item.expiration_time).toLocaleDateString() : '—' }}</span>
      </template>
      <template #cell-actions="{ item }">
        <div class="flex justify-end">
          <router-link :to="'/rfq/' + item.id" class="btn-ghost btn-icon h-8 w-8 !rounded-lg flex items-center justify-center">
            <ArrowUpRight class="w-4 h-4" />
          </router-link>
        </div>
      </template>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Plus, ArrowUpRight } from 'lucide-vue-next';
import api from '@/services/api';
import DashCard from '@/components/dashboard/DashCard.vue';
import DataTable from '@/components/ui/DataTable.vue';

const { t } = useI18n();
const loading = ref(true);
const rfqs = ref([]);

const columns = [
  { key: 'title', label: t('rfq.requirement') },
  { key: 'offers_count', label: t('rfq.offers') },
  { key: 'status', label: t('common.status') },
  { key: 'deadline', label: t('rfq.form.deadline') },
  { key: 'actions', label: '', class: 'w-10 text-end' }
];

const getStatusBadge = (s) => {
  if (s === 'OPEN') return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
  if (s === 'CLOSED') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
  return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
};

const getStatusDot = (s) => {
  if (s === 'OPEN') return 'bg-green-500';
  if (s === 'CLOSED') return 'bg-red-500';
  return 'bg-amber-500 hover:bg-amber-600';
};

onMounted(async () => {
  loading.value = true;
  try {
    // Backend: GET /rfq returns RFQs filtered to the authenticated user's own RFQs
    const res = await api.get('/rfq');
    // api.js interceptor already unwraps response.data
    rfqs.value = Array.isArray(res) ? res : (res?.data ?? []);
  } catch (err) {
    console.error('RFQ Error:', err);
  } finally {
    loading.value = false;
  }
});
</script>

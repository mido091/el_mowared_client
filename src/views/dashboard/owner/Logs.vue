<template>
  <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-black text-foreground">{{ t('dashboard.owner.logs') }}</h1>
      <BaseButton variant="outline" size="sm" @click="fetchLogs" :loading="loading">
        <RefreshCw class="w-4 h-4 me-2" />
        {{ t('common.refresh') }}
      </BaseButton>
    </div>

    <!-- Error State -->
    <PageError v-if="error" :description="error" :show-retry="true" @retry="fetchLogs" />

    <template v-else>
      <!-- Logs Table -->
      <div class="card overflow-hidden">
        <DataTable
          :loading="loading"
          :items="logs"
          :columns="[
            { key: 'created_at', label: t('admin.timestamp'), sortable: true },
            { key: 'action',    label: t('admin.action_taken'),    sortable: true },
            { key: 'admin',     label: t('admin.moderator') },
            { key: 'details',   label: t('admin.context') },
          ]"
        >
          <!-- ✅ Use cell-* slots (DataTable spec) -->
          <template #cell-created_at="{ item }">
            <span class="tabular-nums text-muted-foreground text-xs">{{ formatTime(item.created_at) }}</span>
          </template>
          <template #cell-action="{ item }">
            <span class="font-bold text-foreground font-mono text-xs">{{ item.action }}</span>
          </template>
          <template #cell-admin="{ item }">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-black shrink-0">
                {{ initials(item.admin?.full_name || 'S') }}
              </div>
              <span class="text-sm font-bold text-foreground">{{ item.admin?.full_name || t('common.system') }}</span>
            </div>
          </template>
          <template #cell-details="{ item }">
            <span class="italic text-muted-foreground truncate block max-w-xs text-xs">{{ item.details }}</span>
          </template>
        </DataTable>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { normalizeError } from '@/utils/errorHandler';
import { RefreshCw } from 'lucide-vue-next';
import api from '@/services/api';
import { getApiCollection } from '@/utils/apiResponse';
import DataTable  from '@/components/ui/DataTable.vue';
import PageError  from '@/components/ui/PageError.vue';
import BaseButton from '@/components/ui/BaseButton.vue';

const { t } = useI18n();
const loading = ref(false);
const error   = ref(null);
const logs    = ref([]);

const fetchLogs = async () => {
  loading.value = true;
  error.value = null;
  try {
    const res = await api.get('/admin/logs');
    logs.value = getApiCollection(res, ['logs', 'items']);
  } catch (err) {
    error.value = normalizeError(err).message;
  } finally {
    loading.value = false;
  }
};

const formatTime = (date) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(new Date(date));

const initials = (name = '') =>
  name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

onMounted(fetchLogs);
</script>

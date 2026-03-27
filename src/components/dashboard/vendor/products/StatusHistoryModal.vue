<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" @click.self="close">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b border-slate-100">
            <div>
              <h3 class="text-xl font-bold text-[#1e293b]">{{ t('products.lifecycle.history') }}</h3>
              <p v-if="productName" class="text-xs text-slate-400 mt-0.5">{{ productName }}</p>
            </div>
            <button @click="close" class="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400">
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Timeline -->
          <div class="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
            <div v-if="loading" class="space-y-4">
              <div v-for="i in 3" :key="i" class="flex gap-3">
                <div class="skeleton w-8 h-8 rounded-full shrink-0"></div>
                <div class="flex-1 space-y-2">
                  <div class="skeleton h-4 w-1/3 rounded"></div>
                  <div class="skeleton h-3 w-2/3 rounded"></div>
                </div>
              </div>
            </div>

            <div v-else-if="history.length" class="relative">
              <!-- Vertical line -->
              <div class="absolute left-4 top-4 bottom-4 w-px bg-slate-100"></div>
              
              <div v-for="(entry, i) in history" :key="entry.id" class="relative flex gap-4 pb-6 last:pb-0">
                <!-- Status dot -->
                <div :class="['relative z-10 flex items-center justify-center w-8 h-8 rounded-full shrink-0 border-2 bg-white', getDotStyle(entry.new_status)]">
                  <component :is="getStatusIcon(entry.new_status)" class="w-3.5 h-3.5" />
                </div>

                <!-- Content -->
                <div class="flex-1 bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <div class="flex items-start justify-between gap-2">
                    <div>
                      <div class="flex items-center gap-2">
                        <span :class="['inline-flex h-5 px-2 rounded-md text-[9px] font-bold uppercase tracking-widest', getBadgeStyle(entry.new_status)]">
                          {{ t('products.lifecycle.' + (entry.new_status || 'PENDING').toLowerCase()) }}
                        </span>
                        <span v-if="entry.old_status" class="text-[9px] text-slate-400">
                          ← {{ t('products.lifecycle.' + entry.old_status.toLowerCase()) }}
                        </span>
                      </div>
                      <p v-if="entry.note" class="text-xs text-slate-500 mt-1.5 leading-relaxed">{{ entry.note }}</p>
                    </div>
                    <p class="text-[9px] text-slate-400 font-medium whitespace-nowrap shrink-0">
                      {{ formatDate(entry.created_at) }}
                    </p>
                  </div>
                  <p v-if="entry.reviewer_name" class="text-[9px] text-slate-400 mt-2 flex items-center gap-1">
                    <UserCircle2 class="w-3 h-3" /> {{ entry.reviewer_name }}
                  </p>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-12 text-slate-400">
              <History class="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p class="text-sm font-medium">{{ t('products.lifecycle.no_history') }}</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { X, History, CheckCircle2, XCircle, Clock, FileEdit, UserCircle2 } from 'lucide-vue-next';
import api from '@/services/api';
import { getApiCollection } from '@/utils/apiResponse';

const { t } = useI18n();

const props = defineProps({
  modelValue: Boolean,
  productId: { type: [Number, String], default: null },
  productName: { type: String, default: '' }
});
const emit = defineEmits(['update:modelValue']);

const history = ref([]);
const loading = ref(false);

watch(() => props.modelValue, async (val) => {
  if (val && props.productId) {
    loading.value = true;
    try {
      const res = await api.get(`/products/${props.productId}/history`);
      history.value = getApiCollection(res, ['history', 'items']);
    } catch (e) {
      history.value = [];
    } finally {
      loading.value = false;
    }
  }
});

const close = () => emit('update:modelValue', false);

const getDotStyle = (status) => {
  switch (status) {
    case 'APPROVED': return 'border-emerald-300 text-emerald-600';
    case 'REJECTED': return 'border-rose-300 text-rose-600';
    case 'PENDING':  return 'border-amber-300 text-amber-600';
    case 'DELETED':  return 'border-slate-300 text-slate-600';
    default:         return 'border-slate-200 text-slate-400';
  }
};

const getBadgeStyle = (status) => {
  switch (status) {
    case 'APPROVED': return 'bg-emerald-50 text-emerald-700';
    case 'REJECTED': return 'bg-rose-50 text-rose-700';
    case 'PENDING':  return 'bg-amber-50 text-amber-700';
    default:         return 'bg-slate-100 text-slate-600';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'APPROVED': return CheckCircle2;
    case 'REJECTED': return XCircle;
    case 'PENDING':  return Clock;
    default:         return FileEdit;
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
.skeleton { background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); background-size: 200%; animation: shimmer 1.5s infinite; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
</style>

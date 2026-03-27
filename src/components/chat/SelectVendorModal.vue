<template>
  <BaseModal
    v-model="modelValueInternal"
    :title="t('chat.new_chat')"
    size="md"
  >
    <div class="space-y-4">
      <!-- Search Vendors -->
      <div class="relative">
        <Search class="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-slate-400" />
        <input 
          v-model="search"
          type="text" 
          :placeholder="t('chat.search_vendors')" 
          class="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-2.5 ps-9 pe-4 text-sm focus:ring-2 focus:ring-teal-500 text-slate-700 dark:text-slate-200"
        />
      </div>

      <!-- Vendor List -->
      <div class="max-h-[400px] overflow-y-auto custom-scrollbar space-y-2">
        <div v-if="loading" class="space-y-3 p-2">
           <div v-for="i in 4" :key="i" class="flex gap-3">
             <SkeletonLoader type="avatar" size="md" />
             <div class="flex-1 space-y-2 py-1">
               <SkeletonLoader type="text" width="60%" />
               <SkeletonLoader type="text" width="30%" />
             </div>
           </div>
        </div>

        <template v-else>
          <button
            v-for="vendor in filteredVendors"
            :key="vendor.id"
            @click="selectVendor(vendor)"
            class="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700 group text-start"
          >
            <div class="shrink-0">
              <img v-if="vendor.logo" :src="vendor.logo" class="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
              <div v-else class="w-10 h-10 rounded-full bg-navy-50 dark:bg-navy-900 flex items-center justify-center font-bold text-navy-600 dark:text-navy-300 text-sm">
                {{ (vendor.company_name_en || 'V').charAt(0).toUpperCase() }}
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-teal-600 transition-colors">
                {{ locale === 'ar' ? vendor.company_name_ar : vendor.company_name_en }}
              </p>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {{ vendor.location || t('common.verified_merchant') }}
              </p>
            </div>
            <ChevronRight class="w-4 h-4 text-slate-300 group-hover:text-teal-500 transition-all rtl:rotate-180" />
          </button>
          
          <div v-if="!filteredVendors.length" class="text-center py-8 text-slate-500 text-sm">
            {{ t('common.no_results') }}
          </div>
        </template>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Search, ChevronRight } from 'lucide-vue-next';
import BaseModal from '../ui/BaseModal.vue';
import SkeletonLoader from '../ui/SkeletonLoader.vue';
import api from '@/services/api';
import { getApiCollection } from '@/utils/apiResponse';

const props = defineProps({
  modelValue: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue', 'select']);

const { t, locale } = useI18n();
const search = ref('');
const loading = ref(false);
const vendors = ref([]);

const modelValueInternal = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const fetchVendors = async () => {
  loading.value = true;
  try {
    const res = await api.get('/vendors');
    vendors.value = getApiCollection(res, ['vendors', 'items']);
  } catch (err) {
    console.error('Failed to fetch vendors', err);
  } finally {
    loading.value = false;
  }
};

const filteredVendors = computed(() => {
  if (!search.value.trim()) return vendors.value;
  const q = search.value.toLowerCase();
  return vendors.value.filter(v => 
    (v.company_name_en || '').toLowerCase().includes(q) || 
    (v.company_name_ar || '').toLowerCase().includes(q)
  );
});

const selectVendor = (vendor) => {
  emit('select', vendor);
  modelValueInternal.value = false;
};

onMounted(fetchVendors);
</script>

<template>
  <div class="space-y-4">
    <!-- Header/Filters -->
    <div v-if="hasFilters" class="flex flex-col md:flex-row gap-4 items-center justify-between pb-2">
      <div class="flex-1 w-full max-w-sm relative">
        <Search class="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input 
          v-model="search" 
          :placeholder="t('common.searchPlaceholder')" 
          class="form-input ps-9 h-10 text-sm w-full" 
        />
      </div>
      <div class="flex items-center gap-2">
        <slot name="actions" />
      </div>
    </div>

    <!-- Table -->
    <div class="card overflow-visible shadow-sm">
      <div :class="['w-full transition-all duration-300', allowOverflow ? 'overflow-visible' : 'overflow-x-auto']">
        <table class="w-full text-sm text-start">
          <thead class="bg-muted/50 border-b border-border [&>tr>th:first-child]:rounded-tl-xl [&>tr>th:last-child]:rounded-tr-xl">
            <tr>
              <th 
                v-for="col in columns" 
                :key="col.key"
                class="px-6 py-4 font-black text-start whitespace-nowrap"
                :class="[col.sortable ? 'cursor-pointer hover:bg-muted transition-colors' : '']"
                @click="col.sortable && toggleSort(col.key)"
              >
                <div class="flex items-center gap-2">
                  {{ col.label }}
                  <template v-if="col.sortable">
                    <ChevronUp v-if="sortKey === col.key && sortOrder === 'asc'" class="w-3 h-3 text-secondary" />
                    <ChevronDown v-else-if="sortKey === col.key && sortOrder === 'desc'" class="w-3 h-3 text-secondary" />
                    <ChevronsUpDown v-else class="w-3 h-3 text-muted-foreground/30" />
                  </template>
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <template v-if="loading">
              <tr v-for="i in 5" :key="i">
                <td v-for="col in columns" :key="col.key" class="px-6 py-4">
                  <div class="h-4 bg-muted animate-pulse rounded w-2/3" />
                </td>
              </tr>
            </template>
            <template v-else-if="processedItems.length === 0">
              <tr>
                <td :colspan="columns.length" class="py-20 text-center">
                  <div class="opacity-50 space-y-2">
                    <Archive class="w-10 h-10 mx-auto" />
                    <p class="text-muted-foreground">{{ t('common.noData') }}</p>
                  </div>
                </td>
              </tr>
            </template>
            <template v-else>
              <tr v-for="item in processedItems" :key="item.id" class="hover:bg-muted/30 transition-colors group">
                <td v-for="col in columns" :key="col.key" class="px-6 py-4">
                  <slot :name="`cell-${col.key}`" :item="item">
                    {{ item[col.key] }}
                  </slot>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="px-6 py-4 border-t border-border bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-b-xl">
        <p class="text-[10px] text-muted-foreground font-black uppercase tracking-widest order-2 sm:order-1">
          {{ t('common.showing') }} {{ startRange }} - {{ endRange }} {{ t('common.of') }} {{ totalCount || items.length }}
        </p>
        
        <div class="flex items-center gap-1 order-1 sm:order-2">
          <!-- Previous -->
          <BaseButton 
            variant="outline" 
            size="sm" 
            v-icon 
            :disabled="page === 1" 
            @click="page--"
            class="hover:bg-primary/10 hover:text-primary transition-all border-border/50"
          >
            <ChevronLeft class="w-4 h-4 rtl:rotate-180" />
          </BaseButton>

          <!-- Page Numbers -->
          <div class="flex items-center gap-1">
            <template v-for="p in visiblePages" :key="p">
              <span v-if="p === '...'" class="px-2 text-muted-foreground">...</span>
              <BaseButton
                v-else
                :variant="page === p ? 'primary' : 'outline'"
                size="sm"
                @click="page = p"
                class="min-w-[32px] h-8 p-0 text-[10px] font-black tracking-tighter transition-all"
                :class="page === p ? 'shadow-lg shadow-primary/20' : 'border-border/50 hover:bg-muted font-medium'"
              >
                {{ p }}
              </BaseButton>
            </template>
          </div>

          <!-- Next -->
          <BaseButton 
            variant="outline" 
            size="sm" 
            v-icon 
            :disabled="page >= totalPages" 
            @click="page++"
            class="hover:bg-primary/10 hover:text-primary transition-all border-border/50"
          >
            <ChevronRight class="w-4 h-4 rtl:rotate-180" />
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Search, ChevronDown, ChevronUp, ChevronsUpDown, Archive, ChevronLeft, ChevronRight } from 'lucide-vue-next';
import BaseButton from './BaseButton.vue';

const props = defineProps({
  items:      { type: Array, default: () => [] },
  columns:    { type: Array, required: true },
  loading:    { type: Boolean, default: false },
  pageSize:   { type: Number, default: 10 },
  hasFilters: { type: Boolean, default: true },
  // Optional: pass server-side total when items are a single page from the backend
  totalCount:    { type: Number,  default: null },
  allowOverflow: { type: Boolean, default: false },
});

const { t } = useI18n();

const search    = ref('');
const page      = ref(1);
const sortKey   = ref('');
const sortOrder = ref('asc'); // asc | desc

const toggleSort = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
};

const processedItems = computed(() => {
  let result = [...props.items];

  // Search
  if (search.value) {
    const q = search.value.toLowerCase();
    result = result.filter(item => 
      Object.values(item).some(val => String(val).toLowerCase().includes(q))
    );
  }

  // Sort
  if (sortKey.value) {
    result.sort((a, b) => {
      const valA = a[sortKey.value];
      const valB = b[sortKey.value];
      if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Paginate
  const start = (page.value - 1) * props.pageSize;
  return result.slice(start, start + props.pageSize);
});

const totalPages = computed(() => props.totalCount ? Math.ceil(props.totalCount / props.pageSize) : Math.ceil(props.items.length / props.pageSize));
const startRange = computed(() => (page.value - 1) * props.pageSize + 1);
const endRange   = computed(() => props.totalCount ? Math.min(page.value * props.pageSize, props.totalCount) : Math.min(page.value * props.pageSize, props.items.length));

const visiblePages = computed(() => {
  const total = totalPages.value;
  const current = page.value;
  const pages = [];
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push('...');
    
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    
    for (let i = start; i <= end; i++) pages.push(i);
    
    if (current < total - 2) pages.push('...');
    pages.push(total);
  }
  return pages;
});

// Custom directive for icon-only buttons
const vIcon = {
  mounted(el) {
    el.classList.add('aspect-square', 'p-0', 'w-8', 'h-8');
  }
};
</script>

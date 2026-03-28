<template>
  <div class="space-y-4">
    <!-- Header/Filters -->
    <div v-if="hasFilters" class="list-toolbar rounded-[1.75rem]">
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div class="relative w-full max-w-xl flex-1">
        <Search class="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input 
          v-model="search" 
          :placeholder="t('common.searchPlaceholder')" 
            class="form-input h-12 w-full ps-9 text-sm"
        />
      </div>

        <div class="flex flex-wrap items-center gap-2">
          <slot name="actions" />
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="list-shell overflow-visible">
      <div
        v-if="responsive && isMobile"
        class="space-y-3 p-3 sm:p-4"
      >
        <template v-if="loading">
          <div
            v-for="i in 4"
            :key="i"
            class="list-card space-y-4"
          >
            <div class="h-5 w-1/2 rounded-xl bg-muted animate-pulse" />
            <div class="grid gap-3 sm:grid-cols-2">
              <div
                v-for="j in 3"
                :key="j"
                class="rounded-2xl border border-border/70 p-3"
              >
                <div class="h-3 w-1/3 rounded-lg bg-muted animate-pulse" />
                <div class="mt-3 h-4 w-3/4 rounded-lg bg-muted animate-pulse" />
              </div>
            </div>
          </div>
        </template>

        <template v-else-if="processedItems.length === 0">
          <div class="list-card py-14 text-center">
            <div class="opacity-60 space-y-3">
              <Archive class="mx-auto h-10 w-10 text-muted-foreground" />
              <p class="text-sm font-semibold text-muted-foreground">{{ t('common.noData') }}</p>
            </div>
          </div>
        </template>

        <template v-else>
          <article
            v-for="item in processedItems"
            :key="item.id"
            class="list-card group"
          >
            <div class="flex items-start gap-4">
              <div class="min-w-0 flex-1">
                <p
                  v-if="mobileTitleColumn?.label"
                  class="ui-kicker"
                >
                  {{ mobileTitleColumn.label }}
                </p>
                <div class="mt-2 text-base font-black leading-6 text-foreground">
                  <slot :name="`cell-${mobileTitleColumn?.key}`" :item="item">
                    {{ item[mobileTitleColumn?.key] }}
                  </slot>
                </div>
              </div>

              <div
                v-if="mobileActionsColumn"
                class="shrink-0"
              >
                <slot :name="`cell-${mobileActionsColumn.key}`" :item="item">
                  {{ item[mobileActionsColumn.key] }}
                </slot>
              </div>
            </div>

            <div
              v-if="mobileDetailColumns.length"
              class="mt-4 grid gap-3"
              :class="mobileDetailColumns.length > 1 ? 'sm:grid-cols-2' : ''"
            >
              <div
                v-for="col in mobileDetailColumns"
                :key="col.key"
                class="rounded-2xl border border-border/70 bg-background/70 p-3"
              >
                <p
                  v-if="col.label"
                  class="text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground"
                >
                  {{ col.label }}
                </p>
                <div class="mt-2 text-sm font-semibold text-foreground">
                  <slot :name="`cell-${col.key}`" :item="item">
                    {{ item[col.key] }}
                  </slot>
                </div>
              </div>
            </div>
          </article>
        </template>
      </div>

      <div
        v-else
        :class="[
          'w-full transition-all duration-300',
          allowOverflow ? 'overflow-visible' : 'overflow-x-auto'
        ]"
      >
        <table class="w-full text-sm text-start">
          <thead class="bg-gradient-to-r from-slate-50 via-slate-50 to-slate-100/70 border-b border-border [&>tr>th:first-child]:rounded-tl-[1.5rem] [&>tr>th:last-child]:rounded-tr-[1.5rem] dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
            <tr>
              <th 
                v-for="col in columns" 
                :key="col.key"
                class="px-6 py-4 text-start whitespace-nowrap text-[11px] font-black uppercase tracking-[0.16em] text-muted-foreground"
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
          <tbody class="divide-y divide-border/80">
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
              <tr v-for="item in processedItems" :key="item.id" class="group transition-colors hover:bg-primary/5">
                <td v-for="col in columns" :key="col.key" class="px-6 py-4 align-top">
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
      <div v-if="totalPages > 1" class="flex flex-col items-center justify-between gap-4 border-t border-border bg-muted/20 px-4 py-4 sm:flex-row sm:px-6">
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
import { useMediaQuery } from '@/composables/useMediaQuery';

const props = defineProps({
  items:      { type: Array, default: () => [] },
  columns:    { type: Array, required: true },
  loading:    { type: Boolean, default: false },
  pageSize:   { type: Number, default: 10 },
  hasFilters: { type: Boolean, default: true },
  // Optional: pass server-side total when items are a single page from the backend
  totalCount:    { type: Number,  default: null },
  allowOverflow: { type: Boolean, default: false },
  responsive:    { type: Boolean, default: true },
  mobileBreakpoint: {
    type: String,
    default: '(max-width: 767px)',
  },
  mobileTitleKey: {
    type: String,
    default: '',
  },
  mobileActionsKey: {
    type: String,
    default: 'actions',
  },
});

const { t } = useI18n();
const isMobile = useMediaQuery(props.mobileBreakpoint);

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

const mobileTitleColumn = computed(() => {
  if (!props.columns.length) return null;

  if (props.mobileTitleKey) {
    const matched = props.columns.find((column) => column.key === props.mobileTitleKey);
    if (matched) return matched;
  }

  return props.columns.find((column) => column.key !== props.mobileActionsKey) || props.columns[0];
});

const mobileActionsColumn = computed(() =>
  props.columns.find((column) => column.key === props.mobileActionsKey) || null
);

const mobileDetailColumns = computed(() =>
  props.columns.filter((column) => {
    if (column.key === mobileActionsColumn.value?.key) return false;
    if (column.key === mobileTitleColumn.value?.key) return false;
    return true;
  })
);

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

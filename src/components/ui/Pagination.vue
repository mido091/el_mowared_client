<template>
  <div v-if="totalPages > 1" class="flex items-center justify-center gap-1">
    <!-- Prev -->
    <button
      @click="go(currentPage - 1)"
      :disabled="currentPage <= 1"
      class="w-9 h-9 flex items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:pointer-events-none transition-all"
    >
      <ChevronLeft class="w-4 h-4 rtl:rotate-180" />
    </button>

    <!-- Pages -->
    <template v-for="page in visiblePages" :key="page">
      <span v-if="page === '...'" class="w-9 h-9 flex items-center justify-center text-muted-foreground text-sm">…</span>
      <button
        v-else
        @click="go(page)"
        :class="[
          'w-9 h-9 flex items-center justify-center rounded-xl text-sm font-semibold transition-all',
          page === currentPage
            ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
            : 'border border-border text-foreground hover:bg-muted',
        ]"
      >{{ page }}</button>
    </template>

    <!-- Next -->
    <button
      @click="go(currentPage + 1)"
      :disabled="currentPage >= totalPages"
      class="w-9 h-9 flex items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:pointer-events-none transition-all"
    >
      <ChevronRight class="w-4 h-4 rtl:rotate-180" />
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';

const props = defineProps({
  currentPage: { type: Number, required: true },
  totalPages:  { type: Number, required: true },
});
const emit = defineEmits(['update:currentPage']);

const go = (page) => {
  if (page >= 1 && page <= props.totalPages) emit('update:currentPage', page);
};

const visiblePages = computed(() => {
  const { currentPage: cp, totalPages: tp } = props;
  if (tp <= 7) return Array.from({ length: tp }, (_, i) => i + 1);
  const pages = [1];
  if (cp > 3) pages.push('...');
  for (let i = Math.max(2, cp - 1); i <= Math.min(tp - 1, cp + 1); i++) pages.push(i);
  if (cp < tp - 2) pages.push('...');
  pages.push(tp);
  return pages;
});
</script>

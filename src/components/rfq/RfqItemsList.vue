<template>
  <div class="space-y-3">
    <div
      v-for="item in items"
      :key="`${item.order}-${item.label}`"
      class="rounded-2xl border border-border bg-white/80 p-4 shadow-sm dark:bg-slate-950"
    >
      <div class="flex items-center justify-between gap-3">
        <p class="text-[11px] font-black uppercase tracking-[0.18em] text-primary">
          {{ itemLabel }}
        </p>
        <span class="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-black text-primary">
          #{{ item.order }}
        </span>
      </div>

      <p class="mt-2 text-base font-black text-foreground">
        {{ item.label }}
      </p>

      <p class="mt-3 text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">
        {{ detailsLabel }}
      </p>
      <p class="mt-2 text-sm leading-7 text-muted-foreground" :class="compact ? 'line-clamp-3' : 'whitespace-pre-line'">
        {{ item.details }}
      </p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  itemLabel: {
    type: String,
    default: 'What do you need'
  },
  detailsLabel: {
    type: String,
    default: 'Product details'
  },
  compact: {
    type: Boolean,
    default: false
  }
});
</script>

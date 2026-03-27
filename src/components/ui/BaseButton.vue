<template>
  <button
    v-bind="$attrs"
    :class="[baseClass, variantClass, sizeClass, { 'opacity-60 pointer-events-none': disabled || loading }]"
    :disabled="disabled || loading"
    :type="type"
    :aria-busy="loading"
    :aria-disabled="disabled || loading"
  >
    <span v-if="loading" class="flex items-center gap-2" aria-live="polite">
      <svg class="animate-spin w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" aria-hidden="true">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
      <slot name="loading">Loading...</slot>
    </span>
    <slot v-else />
  </button>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  variant: { type: String, default: 'primary' },
  size:    { type: String, default: 'md' },
  loading: { type: Boolean, default: false },
  disabled:{ type: Boolean, default: false },
  type:    { type: String, default: 'button' },
});

const baseClass = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 select-none cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none';

const variantClass = computed(() => ({
  primary:   'bg-primary text-primary-foreground hover:opacity-90 shadow-md shadow-primary/20',
  secondary: 'bg-secondary text-secondary-foreground hover:opacity-90 shadow-md shadow-secondary/20',
  accent:    'bg-accent text-accent-foreground hover:opacity-90',
  outline:   'border border-border bg-transparent text-foreground hover:bg-muted',
  ghost:     'bg-transparent hover:bg-muted text-foreground',
  danger:    'bg-destructive text-destructive-foreground hover:opacity-90',
  'outline-secondary': 'border border-secondary text-secondary bg-transparent hover:bg-secondary/10',
}[props.variant] || 'bg-primary text-primary-foreground hover:opacity-90'));

const sizeClass = computed(() => ({
  xs: 'px-3 py-1.5 text-xs rounded-lg',
  sm: 'px-4 py-2 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3 text-base',
  xl: 'px-9 py-4 text-base',
  icon: 'p-2.5 !w-10 !h-10 rounded-xl',
}[props.size] || 'px-5 py-2.5 text-sm'));
</script>

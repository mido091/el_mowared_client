<template>
  <span :class="['badge', variantClass, className]" role="status">
    <slot />
  </span>
</template>

<script setup>
import { computed } from 'vue';
const props = defineProps({
  variant:   { type: String, default: 'muted' },
  className: { type: String, default: '' },
});
const variantClass = computed(() => ({
  primary:   'badge-primary',
  secondary: 'badge-secondary',
  accent:    'badge-accent',
  success:   'badge-success',
  danger:    'badge-danger',
  warning:   'badge-warning',
  muted:     'badge-muted',
}[props.variant] || 'badge-muted'));
</script>

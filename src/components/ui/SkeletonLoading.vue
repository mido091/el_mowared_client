<template>
  <div :class="['animate-pulse bg-muted/20 rounded-2xl', customClass]">
    <slot v-if="loading"></slot>
  </div>
</template>

<script setup>
defineProps({
  loading: { type: Boolean, default: true },
  customClass: { type: String, default: 'h-4 w-full' }
});
</script>

<style scoped>
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .5; }
}
</style>

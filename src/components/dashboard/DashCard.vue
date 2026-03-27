<template>
  <div :class="[
    'dash-card group relative bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-300',
    noPadding ? '' : 'p-6'
  ]">
    <div v-if="$slots.header || title" :class="['flex items-center justify-between mb-4', noPadding ? 'p-6 pb-0' : '']">
      <h3 v-if="title" class="text-sm font-bold text-foreground/80 uppercase tracking-wider">{{ title }}</h3>
      <slot name="header" />
    </div>
    <div :class="[noPadding ? '' : 'space-y-4']">
      <slot />
    </div>
    <div v-if="$slots.footer" :class="['mt-6 pt-4 border-t border-border', noPadding ? 'mx-6 mb-6' : '']">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  noPadding: Boolean
});
</script>

<style scoped>
.dash-card {
  backdrop-filter: blur(8px);
}
</style>

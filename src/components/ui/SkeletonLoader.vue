<template>
  <div :class="['rounded-xl', className]">
    <div v-for="i in lines" :key="i" :class="['skeleton h-4 rounded-lg', i === 1 ? 'w-3/4' : i === lines ? 'w-1/2' : 'w-full', i !== lines ? 'mb-3' : '']" />
  </div>
</template>

<script setup>
defineProps({
  lines:     { type: Number, default: 3 },
  className: { type: String, default: '' },
});
</script>

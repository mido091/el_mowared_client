<template>
  <div class="flex items-center gap-0.5">
    <button
      v-for="i in 5"
      :key="i"
      :class="['transition-transform hover:scale-110', interactive ? 'cursor-pointer' : 'cursor-default']"
      @click="interactive && $emit('update:modelValue', i)"
    >
      <Star
        :class="[
          'w-4 h-4',
          i <= Math.round(modelValue) ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-muted-foreground/40',
        ]"
      />
    </button>
    <span v-if="showCount && count" class="text-xs text-muted-foreground ms-1">({{ count }})</span>
  </div>
</template>

<script setup>
import { Star } from 'lucide-vue-next';
defineProps({
  modelValue:  { type: Number, default: 0 },
  count:       { type: Number, default: null },
  showCount:   { type: Boolean, default: true },
  interactive: { type: Boolean, default: false },
});
defineEmits(['update:modelValue']);
</script>

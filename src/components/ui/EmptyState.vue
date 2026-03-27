<template>
  <div :class="['flex flex-col items-center justify-center py-16 px-6 text-center', className]">
    <div class="w-20 h-20 rounded-2xl bg-muted/60 flex items-center justify-center mb-5">
      <component :is="icon || PackageOpen" class="w-10 h-10 text-muted-foreground/50" />
    </div>
    <h3 class="text-lg font-bold text-foreground mb-2">{{ title }}</h3>
    <p v-if="description" class="text-sm text-muted-foreground max-w-xs leading-relaxed mb-6">{{ description }}</p>
    <slot />
  </div>
</template>

<script setup>
import { PackageOpen } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
defineProps({
  title:       { type: String, default: () => 'Nothing here yet' },
  description: { type: String, default: '' },
  icon:        { type: [Object, Function], default: null },
  className:   { type: String, default: '' },
});
</script>


<template>
  <span
    :class="[
      'inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded-full',
      type === 'verified'
        ? 'bg-secondary/15 text-secondary'
        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    ]"
  >
    <ShieldCheck v-if="type === 'verified'" class="w-3 h-3" />
    <Star v-else class="w-3 h-3 fill-current" />
    {{ type === 'verified' ? t('products.verified') : t('vendor.premium') }}
  </span>
</template>

<script setup>
import { ShieldCheck, Star } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
defineProps({
  type: { type: String, default: 'verified' }, // 'verified' | 'premium'
});
</script>

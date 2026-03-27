<template>
  <img
    v-if="resolvedSrc"
    :src="resolvedSrc"
    :srcset="resolvedSrcSet || undefined"
    :sizes="sizes || undefined"
    :alt="alt"
    :width="width || undefined"
    :height="height || undefined"
    :loading="computedLoading"
    :decoding="decoding"
    :fetchpriority="fetchpriority || undefined"
    :class="imgClass"
    @error="onError"
  />
  <div
    v-else
    :class="fallbackClass"
    aria-hidden="true"
  >
    <slot name="fallback" />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { buildSrcSet, optimizeImageUrl } from '@/utils/image';

const props = defineProps({
  src: { type: String, default: '' },
  alt: { type: String, default: '' },
  width: { type: [Number, String], default: null },
  height: { type: [Number, String], default: null },
  sizes: { type: String, default: '' },
  loading: { type: String, default: 'lazy' },
  decoding: { type: String, default: 'async' },
  fetchpriority: { type: String, default: '' },
  imgClass: { type: String, default: '' },
  fallbackClass: {
    type: String,
    default: 'flex h-full w-full items-center justify-center bg-slate-100 dark:bg-slate-800'
  },
  responsiveWidths: {
    type: Array,
    default: () => []
  },
  optimize: { type: Boolean, default: true }
});

const broken = ref(false);

watch(
  () => props.src,
  () => {
    broken.value = false;
  }
);

const resolvedSrc = computed(() => {
  if (broken.value || !props.src) return '';
  if (!props.optimize) return props.src;

  return optimizeImageUrl(props.src, {
    width: props.width ? Number(props.width) : undefined,
    height: props.height ? Number(props.height) : undefined
  });
});

const resolvedSrcSet = computed(() => {
  if (broken.value || !props.src || !props.optimize) return '';
  return buildSrcSet(props.src, props.responsiveWidths);
});

const computedLoading = computed(() => props.fetchpriority === 'high' ? 'eager' : props.loading);

const onError = () => {
  broken.value = true;
};
</script>

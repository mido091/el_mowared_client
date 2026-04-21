<template>
  <teleport to="body">
    <transition name="modal">
      <div
        v-if="modelValue"
        class="layer-modal fixed inset-0 flex items-end justify-center overflow-y-auto p-2 sm:items-center sm:p-4 lg:p-6"
        @click.self="$emit('update:modelValue', false)"
      >
        <div :class="['absolute inset-0 bg-slate-900/40 transition-opacity animate-in fade-in duration-300', overlayClass]" />
        <transition name="modal-content">
          <div
            v-if="modelValue"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="title ? `${id}-title` : undefined"
            :class="[
              'relative my-0 flex max-h-[calc(100vh-1rem)] w-full flex-col overflow-hidden rounded-[1.5rem] border border-white/10 bg-card shadow-luxury sm:my-6 sm:max-h-[calc(100vh-3rem)] sm:rounded-[2rem] lg:my-8 lg:max-h-[calc(100vh-4rem)]',
              sizeClass,
            ]"
          >
            <!-- Premium Gradient Overlay -->
            <div class="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none"></div>

            <!-- Header -->
            <div v-if="title || $slots.header" class="flex flex-wrap items-start justify-between gap-3 border-b border-white/5 px-4 py-4 relative sm:px-6 sm:py-5 lg:px-8">
              <slot name="header">
                <h3 :id="`${id}-title`" class="min-w-0 flex-1 text-lg font-black text-foreground tracking-tight uppercase sm:text-xl">{{ title }}</h3>
              </slot>
              <button
                v-if="closable"
                @click="$emit('update:modelValue', false)"
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all group"
                aria-label="Close modal"
              >
                <X class="w-5 h-5 group-hover:scale-110 transition-transform" aria-hidden="true" />
              </button>
            </div>
            <!-- Body -->
            <div :class="['relative overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 lg:p-8', bodyClass]">
              <slot />
            </div>
            <!-- Footer -->
            <div v-if="$slots.footer" class="flex flex-col-reverse gap-3 border-t border-white/5 bg-muted/30 px-4 py-4 relative sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:px-6 sm:py-5 lg:px-8">
              <slot name="footer" />
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { computed, onUnmounted, watch } from 'vue';
import { X } from 'lucide-vue-next';

const props = defineProps({
  id:         { type: String, default: () => `modal-${Math.random().toString(36).slice(2, 8)}` },
  modelValue: { type: Boolean, default: false },
  title:      { type: String, default: '' },
  size:       { type: String, default: 'md' },
  closable:   { type: Boolean, default: true },
  bodyClass:  { type: String, default: '' },
  overlayClass: { type: String, default: '' },
});
defineEmits(['update:modelValue']);

const sizeClass = computed(() => ({
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-6xl',
}[props.size] || 'max-w-lg'));

watch(
  () => props.modelValue,
  (open) => {
    document.body.style.overflow = open ? 'hidden' : '';
  },
  { immediate: true }
);

onUnmounted(() => {
  document.body.style.overflow = '';
});
</script>

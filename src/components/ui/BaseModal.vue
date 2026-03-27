<template>
  <teleport to="body">
    <transition name="modal">
      <div
        v-if="modelValue"
        class="layer-modal fixed inset-0 flex items-start justify-center overflow-y-auto p-4 sm:items-center sm:p-6"
        @click.self="$emit('update:modelValue', false)"
      >
        <div :class="['app-backdrop absolute transition-opacity animate-in fade-in duration-300', overlayClass]" />
        <transition name="modal-content">
          <div
            v-if="modelValue"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="title ? `${id}-title` : undefined"
            :class="[
              'relative my-4 flex max-h-[calc(100vh-2rem)] w-full flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-card shadow-luxury sm:my-8 sm:max-h-[calc(100vh-4rem)]',
              sizeClass,
            ]"
          >
            <!-- Premium Gradient Overlay -->
            <div class="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none"></div>

            <!-- Header -->
            <div v-if="title || $slots.header" class="flex items-center justify-between px-8 py-5 border-b border-white/5 relative">
              <slot name="header">
                <h3 :id="`${id}-title`" class="text-xl font-black text-foreground tracking-tight uppercase">{{ title }}</h3>
              </slot>
              <button
                v-if="closable"
                @click="$emit('update:modelValue', false)"
                class="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-all group"
                aria-label="Close modal"
              >
                <X class="w-5 h-5 group-hover:scale-110 transition-transform" aria-hidden="true" />
              </button>
            </div>
            <!-- Body -->
            <div :class="['relative overflow-y-auto p-8', bodyClass]">
              <slot />
            </div>
            <!-- Footer -->
            <div v-if="$slots.footer" class="px-8 py-5 bg-muted/30 border-t border-white/5 flex items-center justify-end gap-3 relative">
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

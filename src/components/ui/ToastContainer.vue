<template>
  <teleport to="body">
    <div 
      class="layer-toast fixed top-6 flex flex-col gap-3 pointer-events-none w-full max-w-sm"
      :class="isRTL ? 'left-6' : 'right-6'"
    >
      <transition-group 
        name="toast" 
        tag="div" 
        class="flex flex-col gap-3 items-end"
      >
        <BaseToast
          v-for="toast in store.toasts"
          :key="toast.id"
          v-bind="toast"
          @close="store.removeToast(toast.id)"
        />
      </transition-group>
    </div>
  </teleport>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useNotificationStore } from '@/stores/notificationStore';
import BaseToast from './BaseToast.vue';

const store = useNotificationStore();
const { locale } = useI18n();

const isRTL = computed(() => locale.value === 'ar');
</script>

<style>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(30px) scale(0.9);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(30px) scale(0.9);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>

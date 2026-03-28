<template>
  <teleport to="body">
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="store.activeDialog"
        class="layer-modal fixed inset-0 z-[220] flex items-center justify-center p-4 sm:p-6"
        role="dialog"
        aria-modal="true"
      >
        <!-- Backdrop -->
        <div 
          class="app-backdrop transition-opacity" 
          @click="handleCancel"
        ></div>

        <!-- Dialog Window -->
        <div
          class="relative w-full max-w-sm overflow-hidden rounded-[2rem] border border-white/10 bg-card/90 shadow-2xl backdrop-blur-2xl transition-all"
          @click.stop
        >
          <!-- Premium Gradient Overlay -->
          <div class="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none"></div>

          <!-- Progress Bar (for loading state) -->
          <div 
            v-if="store.activeDialog.loading"
            class="absolute top-0 inset-x-0 h-1 bg-secondary/20"
          >
            <div class="h-full bg-secondary animate-progress"></div>
          </div>

          <div class="p-8 relative">
            <div class="flex flex-col items-center text-center gap-6">
              <!-- Icon -->
              <div 
                class="flex h-20 w-20 shrink-0 items-center justify-center rounded-[2rem] border-2 shadow-inner"
                :class="iconClasses"
              >
                <component :is="iconComponent" class="h-10 w-10" />
              </div>

              <!-- Content -->
              <div class="space-y-2">
                <h3 class="text-2xl font-black text-foreground tracking-tight leading-tight">
                  {{ resolvedTitle }}
                </h3>
                <p class="text-muted-foreground text-sm font-medium leading-relaxed max-w-[280px] mx-auto">
                  {{ resolvedMessage }}
                </p>

                <!-- Prompt Input -->
                <div v-if="store.activeDialog.type === 'prompt'" class="mt-6">
                  <input
                    v-model="store.activeDialog.inputValue"
                    type="text"
                    :placeholder="$t(store.activeDialog.placeholder)"
                    class="w-full rounded-2xl border border-border bg-background/50 px-5 py-3 text-foreground placeholder:text-muted-foreground focus:border-secondary focus:outline-none focus:ring-4 focus:ring-secondary/10 transition-all font-sans text-center"
                    @keyup.enter="handleConfirm"
                    ref="inputRef"
                  />
                </div>
              </div>
            </div>

            <!-- Special Variants (e.g. Identity Confirmation) -->
            <div v-if="store.activeDialog.variant === 'identity'" class="mt-6 p-4 rounded-2xl bg-secondary/5 border border-secondary/10 flex gap-3 text-start">
              <ShieldCheck class="w-5 h-5 text-secondary shrink-0" />
              <p class="text-[11px] text-secondary font-bold uppercase tracking-wider">{{ $t('auth.secureNote') }}</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="grid grid-cols-1 gap-2 p-6 pt-0 relative">
            <button
              type="button"
              class="flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-sm font-black uppercase tracking-widest transition-all active:scale-[0.98] shadow-luxury"
              :class="confirmBtnClasses"
              @click="handleConfirm"
              :disabled="store.activeDialog.loading"
            >
              <Loader2 v-if="store.activeDialog.loading" class="w-4 h-4 animate-spin" />
              {{ $te(store.activeDialog.confirmText) ? $t(store.activeDialog.confirmText) : store.activeDialog.confirmText }}
            </button>
            <button
              v-if="store.activeDialog.showCancel"
              type="button"
              class="w-full rounded-2xl px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
              @click="handleCancel"
              :disabled="store.activeDialog.loading"
            >
              {{ $te(store.activeDialog.cancelText) ? $t(store.activeDialog.cancelText) : store.activeDialog.cancelText }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useNotificationStore } from '@/stores/notificationStore';
import { 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  HelpCircle,
  ShieldCheck,
  Loader2 
} from 'lucide-vue-next';
import { resolveLocalizedText } from '@/utils/localizedText';

const store = useNotificationStore();
const inputRef = ref(null);
const { locale } = useI18n();

const resolvedTitle = computed(() => resolveLocalizedText(store.activeDialog?.title, locale.value));
const resolvedMessage = computed(() => resolveLocalizedText(store.activeDialog?.message, locale.value));

const iconComponent = computed(() => {
  const type = store.activeDialog?.type;
  if (type === 'success') return CheckCircle2;
  if (type === 'error') return AlertCircle;
  if (type === 'warning') return AlertTriangle;
  if (type === 'confirm') return HelpCircle;
  if (type === 'prompt') return ShieldCheck;
  return Info;
});

const iconClasses = computed(() => {
  const type = store.activeDialog?.type;
  if (type === 'success') return 'bg-secondary/10 border-secondary/20 text-secondary shadow-lg shadow-secondary/10';
  if (type === 'error') return 'bg-destructive/10 border-destructive/20 text-destructive shadow-lg shadow-destructive/10';
  if (type === 'warning') return 'bg-amber-500/10 border-amber-500/20 text-amber-500 shadow-lg shadow-amber-500/10';
  return 'bg-primary/10 border-primary/20 text-primary shadow-lg shadow-primary/10';
});

const confirmBtnClasses = computed(() => {
  const type = store.activeDialog?.type;
  if (type === 'error') return 'bg-destructive text-destructive-foreground hover:opacity-90 shadow-xl shadow-destructive/20';
  return 'bg-secondary text-secondary-foreground hover:opacity-90 shadow-xl shadow-secondary/20';
});

const handleConfirm = async () => {
  if (store.activeDialog.onConfirm) {
    store.activeDialog.loading = true;
    try {
      const result = await store.activeDialog.onConfirm(store.activeDialog.inputValue);
      if (result !== false) store.closeDialog(true);
    } catch (err) {
      console.error('Dialog confirm error:', err);
    } finally {
      if (store.activeDialog) store.activeDialog.loading = false;
    }
  } else {
    store.closeDialog(true);
  }
};

const handleCancel = () => {
  if (store.activeDialog?.onCancel) {
    store.activeDialog.onCancel();
  }
  store.closeDialog(false);
};

// Accessibility: Body scroll lock
watch(() => store.activeDialog, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden';
    // Focus prompt input
    if (val.type === 'prompt') {
      setTimeout(() => inputRef.value?.focus(), 100);
    }
  } else {
    document.body.style.overflow = '';
  }
});

// Accessibility: ESC to close
const onKeydown = (e) => {
  if (e.key === 'Escape' && store.activeDialog && !store.activeDialog.loading) {
    handleCancel();
  }
};

onMounted(() => window.addEventListener('keydown', onKeydown));
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown);
  document.body.style.overflow = '';
});
</script>

<style scoped>
@keyframes progress {
  0% { transform: translateX(-100%); }
  50% { transform: translateX(0); }
  100% { transform: translateX(100%); }
}
.animate-progress {
  animation: progress 2s infinite ease-in-out;
}
</style>

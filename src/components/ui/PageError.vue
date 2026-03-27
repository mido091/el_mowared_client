<template>
  <div class="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500">
    <!-- Icon Circle -->
    <div class="w-24 h-24 rounded-[2rem] bg-destructive/10 flex items-center justify-center mb-8 relative">
      <div class="absolute inset-0 bg-destructive/5 blur-2xl rounded-full scale-150 animate-pulse" />
      <AlertTriangle class="w-12 h-12 text-destructive relative z-10" />
    </div>

    <!-- Content -->
    <h1 class="text-4xl font-black text-foreground mb-4 tracking-tighter">
      {{ resolvedTitle }}
    </h1>
    <p class="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed mb-10">
      {{ resolvedDescription }}
    </p>

    <!-- Actions -->
    <div class="flex flex-col sm:flex-row items-center gap-4">
      <BaseButton v-if="showRetry" size="lg" @click="emit('retry')" class="min-w-[160px]">
        {{ t('common.refresh') }}
      </BaseButton>
      <BaseButton size="lg" @click="router.back()" variant="outline" class="min-w-[160px]">
        <ArrowLeft class="w-4 h-4 me-2" />
        {{ t('common.goBack') }}
      </BaseButton>
      <BaseButton size="lg" to="/" class="min-w-[160px]">
        <Home class="w-4 h-4 me-2" />
        {{ t('common.home') }}
      </BaseButton>
    </div>

    <!-- Extra Help -->
    <div class="mt-16 pt-8 border-t border-border w-full max-w-xs opacity-50">
      <p class="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Need immediate help?</p>
      <router-link to="/chat/support" class="text-xs font-bold hover:text-primary transition-colors flex items-center justify-center gap-2">
        <MessageSquare class="w-3.5 h-3.5" />
        {{ t('common.contactSupport') }}
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { AlertTriangle, Home, ArrowLeft, MessageSquare } from 'lucide-vue-next';
import BaseButton from '@/components/ui/BaseButton.vue';
import { resolveLocalizedText } from '@/utils/localizedText';

const props = defineProps({
  title:       { type: [String, Object], default: '' },
  description: { type: [String, Object], default: '' },
  showRetry:   { type: Boolean, default: false },
});
const emit = defineEmits(['retry']);

const router = useRouter();
const { t, locale } = useI18n();

const resolvedTitle = computed(() =>
  resolveLocalizedText(props.title, locale.value, t('common.errorOccurred'))
);

const resolvedDescription = computed(() =>
  resolveLocalizedText(props.description, locale.value, t('common.errorDescription'))
);
</script>

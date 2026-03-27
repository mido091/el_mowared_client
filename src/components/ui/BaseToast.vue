<template>
  <div
    class="pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-2xl shadow-2xl border min-w-80 max-w-md backdrop-blur-md transition-all group relative overflow-hidden"
    :class="containerClasses"
  >
    <!-- Background Gradient Subtlety -->
    <div 
      class="absolute inset-x-0 bottom-0 h-0.5"
      :class="progressClasses"
    ></div>

    <component :is="iconComponent" class="w-5 h-5 shrink-0 mt-0.5" />
    
    <div class="flex-1 min-w-0">
      <p class="text-sm font-semibold leading-snug">{{ resolvedMessage }}</p>
    </div>

    <button
      @click="$emit('close')"
      class="shrink-0 opacity-40 hover:opacity-100 transition-opacity p-1 -m-1"
    >
      <X class="w-4 h-4" />
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';
import { resolveLocalizedText } from '@/utils/localizedText';

const props = defineProps({
  message: {
    type: [String, Object],
    default: ''
  },
  type: {
    type: String,
    default: 'info'
  }
});

defineEmits(['close']);
const { locale } = useI18n();

const resolvedMessage = computed(() => resolveLocalizedText(props.message, locale.value));

const iconComponent = computed(() => {
  if (props.type === 'success') return CheckCircle2;
  if (props.type === 'error') return AlertCircle;
  if (props.type === 'warning') return AlertTriangle;
  return Info;
});

const containerClasses = computed(() => ({
  success: 'bg-slate-900/90 border-teal-500/20 text-teal-50 shadow-teal-900/20',
  error:   'bg-slate-900/90 border-red-500/20 text-red-50 shadow-red-900/20',
  warning: 'bg-slate-900/90 border-amber-500/20 text-amber-50 shadow-amber-900/20',
  info:    'bg-slate-900/90 border-blue-500/20 text-blue-50 shadow-blue-900/20',
}[props.type] || 'bg-slate-900/90 border-slate-700/50 text-slate-100'));

const progressClasses = computed(() => ({
  success: 'bg-teal-500',
  error:   'bg-red-500',
  warning: 'bg-amber-500',
  info:    'bg-blue-500',
}[props.type] || 'bg-slate-500'));
</script>

<style scoped>
/* Individual toast entry/exit transitions are handled by TransitionGroup in container */
</style>

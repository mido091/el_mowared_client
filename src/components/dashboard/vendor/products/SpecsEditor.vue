<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between px-1">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/5 shadow-sm">
          <Cpu class="w-5 h-5" />
        </div>
        <div>
          <h4 class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{{ t('products.technicalSpecs') }}</h4>
          <p class="text-sm font-black text-secondary uppercase tracking-widest">{{ t('common.general') }} (AR / EN)</p>
        </div>
      </div>
      <button 
        type="button" 
        @click="addSpec" 
        class="h-10 px-5 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:opacity-95 transition-all flex items-center gap-2 shadow-glow-teal active:scale-95"
      >
        <Plus class="w-4 h-4" />
        {{ t('common.add') }}
      </button>
    </div>
    
    <!-- Specs List (Bilingual Grid) -->
    <div class="space-y-6 px-1 pb-2">
      <TransitionGroup name="list">
        <div v-for="(spec, index) in localSpecs" :key="spec.id" class="group/spec relative p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 hover:border-primary/20 hover:bg-white transition-all shadow-sm">
          <!-- Spec Row Header -->
          <div class="flex items-center justify-between mb-8 pb-4 border-b border-slate-100/30">
            <div class="flex items-center gap-3">
              <div class="w-1.5 h-6 bg-primary/20 rounded-full"></div>
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{{ t('products.techSpecs') }} #{{ index + 1 }}</span>
            </div>
            <!-- Remove Button -->
            <button 
              type="button" 
              @click="removeSpec(index)" 
              class="w-9 h-9 rounded-2xl flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all active:scale-95 group/del"
              :title="t('common.delete')"
            >
              <XIcon class="w-4 h-4 group-hover/del:scale-110 transition-transform" />
            </button>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <!-- Key Column (AR / EN) -->
            <div class="space-y-4">
               <div class="flex items-center gap-2 mb-1">
                 <div class="w-1 h-4 bg-primary rounded-full"></div>
                 <span class="text-[10px] font-black text-secondary uppercase tracking-widest">{{ t('products.specKeyPlaceholder') }}</span>
               </div>
               <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div class="relative group/input">
                    <span :class="['absolute top-1/2 -translate-y-1/2 text-[8px] font-black text-slate-300 pointer-events-none', locale === 'ar' ? 'left-3' : 'right-3']">AR</span>
                    <input 
                      v-model="spec.key_ar" 
                      @input="updateParent"
                      dir="rtl"
                      :placeholder="t('products.specKeyPlaceholder')"
                      class="w-full bg-white border border-slate-100/50 rounded-[1.25rem] px-5 h-12 text-[11px] font-bold outline-none text-secondary focus:border-primary/30 transition-all shadow-sm pe-12" 
                    />
                 </div>
                 <div class="relative group/input">
                    <span :class="['absolute top-1/2 -translate-y-1/2 text-[8px] font-black text-slate-300 pointer-events-none', locale === 'ar' ? 'right-3' : 'left-3']">EN</span>
                    <input 
                      v-model="spec.key_en" 
                      @input="updateParent"
                      dir="ltr"
                      placeholder="Name (Key)"
                      class="w-full bg-white border border-slate-100/50 rounded-[1.25rem] px-5 h-12 text-[11px] font-bold outline-none text-secondary focus:border-primary/30 transition-all shadow-sm ps-12" 
                    />
                 </div>
               </div>
            </div>

            <!-- Value Column (AR / EN) -->
            <div class="space-y-4">
               <div class="flex items-center gap-2 mb-1">
                 <div class="w-1 h-4 bg-emerald-500 rounded-full"></div>
                 <span class="text-[10px] font-black text-secondary uppercase tracking-widest">{{ t('products.specValuePlaceholder') }}</span>
               </div>
               <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div class="relative group/input">
                    <span :class="['absolute top-1/2 -translate-y-1/2 text-[8px] font-black text-slate-300 pointer-events-none', locale === 'ar' ? 'left-3' : 'right-3']">AR</span>
                    <input 
                      v-model="spec.value_ar" 
                      @input="updateParent"
                      dir="rtl"
                      :placeholder="t('products.specValuePlaceholder')"
                      class="w-full bg-white border border-slate-100/50 rounded-[1.25rem] px-5 h-12 text-[11px] font-medium outline-none text-slate-600 focus:border-emerald-500/30 transition-all shadow-sm pe-12" 
                    />
                 </div>
                 <div class="relative group/input">
                    <span :class="['absolute top-1/2 -translate-y-1/2 text-[8px] font-black text-slate-300 pointer-events-none', locale === 'ar' ? 'right-3' : 'left-3']">EN</span>
                    <input 
                      v-model="spec.value_en" 
                      @input="updateParent"
                      dir="ltr"
                      placeholder="Value"
                      class="w-full bg-white border border-slate-100/50 rounded-[1.25rem] px-5 h-12 text-[11px] font-medium outline-none text-slate-600 focus:border-emerald-500/30 transition-all shadow-sm ps-12" 
                    />
                 </div>
               </div>
            </div>
          </div>
        </div>
      </TransitionGroup>

      <!-- Empty State -->
      <div v-if="localSpecs.length === 0" class="py-16 text-center space-y-6 border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/20 group/empty hover:bg-slate-50/50 transition-all">
        <div class="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto text-slate-200 shadow-luxury border border-slate-100 group-hover/empty:scale-110 group-hover/empty:text-primary transition-all">
          <Layers class="w-8 h-8" />
        </div>
        <div>
          <p class="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">
            {{ t('products.no_specs') }}
          </p>
          <p class="text-[8px] font-black text-slate-300 uppercase tracking-widest">ADD TECHNICAL DETAILS IN BOTH LANGUAGES</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Plus, X as XIcon, Cpu, Layers } from 'lucide-vue-next';

const { t, locale } = useI18n();

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => ([])
  }
});

const emit = defineEmits(['update:modelValue']);

// Store as array internally
const localSpecs = ref([]);

const syncFromParent = () => {
  const specs = props.modelValue || [];
  // Only sync if lengths differ to avoid focus loss during typing
  if (specs.length !== localSpecs.value.length) {
    localSpecs.value = specs.map(spec => ({
      id: Math.random().toString(36).substr(2, 9),
      key_ar: spec.key_ar || '',
      key_en: spec.key_en || '',
      value_ar: spec.value_ar || '',
      value_en: spec.value_en || ''
    }));
  }
};

// Initial sync
onMounted(syncFromParent);

// Watch for external changes (like model clear or product switch)
watch(() => props.modelValue, (newVal) => {
  if (!newVal || newVal.length === 0) {
    localSpecs.value = [];
  } else if (newVal.length !== localSpecs.value.length) {
    syncFromParent();
  }
}, { deep: true });

const updateParent = () => {
  const result = localSpecs.value.map(spec => ({
    key_ar: spec.key_ar,
    key_en: spec.key_en,
    value_ar: spec.value_ar,
    value_en: spec.value_en
  }));
  
  emit('update:modelValue', result);
};

const addSpec = () => {
  localSpecs.value.push({ 
    id: Math.random().toString(36).substr(2, 9), 
    key_ar: '', 
    key_en: '', 
    value_ar: '', 
    value_en: '' 
  });
};

const removeSpec = (index) => {
  localSpecs.value.splice(index, 1);
  updateParent();
};
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: hsl(var(--border));
  border-radius: 20px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--muted-foreground));
}

@keyframes shadow-glow-teal {
  0%, 100% { box-shadow: 0 0 15px -5px rgba(44, 177, 161, 0.2); }
  50% { box-shadow: 0 0 30px 0px rgba(44, 177, 161, 0.4); }
}
.shadow-glow-teal { animation: shadow-glow-teal 3s infinite; }
</style>

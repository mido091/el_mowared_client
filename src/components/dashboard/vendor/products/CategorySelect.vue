<template>
  <div class="relative w-full font-plex" ref="containerRef">
    <!-- Trigger -->
    <div 
      @click="isOpen = !isOpen"
      :class="[
        'w-full h-16 bg-slate-50/50 border rounded-[1.25rem] px-6 flex items-center justify-between cursor-pointer transition-all duration-300 group',
        isOpen ? 'border-primary bg-white ring-4 ring-primary/5 shadow-premium' : 'border-slate-100 hover:border-primary/50'
      ]"
    >
      <div class="flex items-center gap-4 min-w-0">
        <div :class="['w-8 h-8 rounded-xl flex items-center justify-center transition-all', isOpen ? 'bg-primary text-white scale-110' : 'bg-slate-100 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary']">
          <Layers class="w-4 h-4" />
        </div>
        <div class="flex flex-col min-w-0">
          <span v-if="selectedCategory" class="text-xs font-black uppercase tracking-widest text-secondary truncate">
            {{ locale === 'ar' ? selectedCategory.name_ar : selectedCategory.name_en }}
          </span>
          <span v-else class="text-xs font-bold text-slate-300 uppercase tracking-widest">
            {{ placeholder || t('products.selectCategory') }}
          </span>
        </div>
      </div>
      <ChevronDown :class="['w-4 h-4 text-slate-300 transition-transform duration-500', isOpen ? 'rotate-180 text-primary' : '']" />
    </div>

    <!-- Dropdown Panel -->
    <Transition name="dropdown">
      <div v-if="isOpen" class="absolute top-[110%] left-0 right-0 z-[100] bg-white/95 backdrop-blur-2xl border border-slate-100 rounded-[2rem] shadow-luxury overflow-hidden origin-top">
        <!-- Search Header -->
        <div class="p-4 border-b border-slate-50 relative">
          <Search :class="['absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300', locale === 'ar' ? 'right-8' : 'left-8']" />
          <input 
            v-model="searchQuery"
            :placeholder="t('common.search')"
            :dir="locale === 'ar' ? 'rtl' : 'ltr'"
            class="w-full h-12 bg-slate-50 border-none rounded-2xl text-xs font-bold text-secondary placeholder:text-slate-300 focus:ring-0 px-12"
            @click.stop
          />
        </div>

        <!-- List -->
        <div class="max-h-[300px] overflow-y-auto p-2 custom-scrollbar">
          <div v-if="filteredCategories.length === 0" class="p-10 text-center space-y-3">
             <div class="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-200">
               <Search class="w-6 h-6" />
             </div>
             <p class="text-[10px] font-black text-slate-300 uppercase tracking-widest">{{ t('common.noResults') }}</p>
          </div>
          
          <div 
            v-for="cat in filteredCategories" 
            :key="cat.id"
            @click="selectCategory(cat)"
            :class="[
              'group/item flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all mb-1 last:mb-0',
              modelValue == cat.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-50 text-slate-500'
            ]"
          >
            <div class="flex items-center gap-4">
              <div :class="['w-2 h-2 rounded-full transition-all', modelValue == cat.id ? 'bg-white scale-125' : 'bg-slate-200 group-hover/item:bg-primary']"></div>
              <span class="text-xs font-black uppercase tracking-widest whitespace-nowrap">
                {{ locale === 'ar' ? cat.name_ar : cat.name_en }}
              </span>
            </div>
            <Check v-if="modelValue == cat.id" class="w-4 h-4 text-white animate-in zoom-in" />
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import { Layers, ChevronDown, Search, Check } from 'lucide-vue-next';

const { t, locale } = useI18n();

const props = defineProps({
  modelValue: [String, Number],
  categories: { type: Array, default: () => [] },
  placeholder: String
});

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);
const searchQuery = ref('');
const containerRef = ref(null);

const filteredCategories = computed(() => {
  if (!searchQuery.value) return props.categories;
  const q = searchQuery.value.toLowerCase();
  return props.categories.filter(c => 
    c.name_ar?.toLowerCase().includes(q) || 
    c.name_en?.toLowerCase().includes(q)
  );
});

const selectedCategory = computed(() => {
  return props.categories.find(c => c.id == props.modelValue);
});

const selectCategory = (cat) => {
  emit('update:modelValue', cat.id);
  isOpen.value = false;
  searchQuery.value = '';
};

const handleClickOutside = (e) => {
  if (containerRef.value && !containerRef.value.contains(e.target)) {
    isOpen.value = false;
  }
};

onMounted(() => window.addEventListener('click', handleClickOutside));
onBeforeUnmount(() => window.removeEventListener('click', handleClickOutside));
</script>

<style scoped>
.font-plex { font-family: 'IBM Plex Sans Arabic', 'Inter', sans-serif; }

.dropdown-enter-active { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.dropdown-leave-active { transition: all 0.3s cubic-bezier(0.7, 0, 0.84, 0); }
.dropdown-enter-from { opacity: 0; transform: translateY(-10px) scale(0.98); }
.dropdown-leave-to { opacity: 0; transform: translateY(-5px) scale(0.99); }

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }

.shadow-premium { box-shadow: 0 20px 50px -15px rgba(0, 0, 0, 0.05); }
.shadow-luxury { box-shadow: 0 40px 100px -20px rgba(0, 0, 100, 0.1); }
</style>

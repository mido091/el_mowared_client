<template>
  <div class="relative w-full" ref="containerRef">
    <label v-if="label" class="form-label mb-1.5 block">{{ label }}</label>
    
    <!-- Trigger / Tag Container -->
    <div
      @click="isOpen = !isOpen"
      class="min-h-[46px] w-full flex flex-wrap items-center gap-2 px-3 py-1.5 bg-background border border-input rounded-xl cursor-pointer hover:border-ring transition-all duration-200"
      :class="{ 'ring-2 ring-ring border-ring': isOpen, 'border-destructive': error }"
    >
      <!-- Selected Tags -->
      <transition-group name="tag-list">
        <div
          v-for="id in modelValue"
          :key="id"
          @click.stop
          class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-secondary/10 text-secondary rounded-lg text-xs font-bold border border-secondary/20 transition-all hover:bg-secondary/20"
        >
          <span>{{ getCategoryName(id) }}</span>
          <button 
            type="button"
            @click.stop="removeCategory(id)"
            class="p-0.5 hover:bg-secondary/20 rounded-md transition-colors"
          >
            <X class="w-3 h-3" />
          </button>
        </div>
      </transition-group>

      <!-- Placeholder / Prompt -->
      <span v-if="modelValue.length === 0" class="text-sm text-muted-foreground ps-1">
        {{ placeholder || t('auth.selectCategory') }}
      </span>

      <!-- Dropdown Arrow -->
      <div class="ms-auto ps-2 text-muted-foreground/60">
        <ChevronDown 
          class="w-4 h-4 transition-transform duration-300"
          :class="{ 'rotate-180 text-secondary': isOpen }"
        />
      </div>
    </div>

    <!-- Error Message -->
    <p v-if="error" class="text-xs text-destructive font-medium mt-1">{{ error }}</p>

    <!-- Dropdown Menu -->
    <transition name="dropdown-pop">
      <div
        v-if="isOpen"
        class="absolute top-full left-0 right-0 mt-2 bg-card border border-border/60 rounded-2xl shadow-luxury z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        <!-- Search Input -->
        <div class="p-3 border-b border-border/40 bg-muted/20">
          <div class="relative">
            <Search class="absolute start-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              v-model="searchQuery"
              ref="searchInputRef"
              type="text"
              :placeholder="t('common.search')"
              class="w-full ps-9 pe-4 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              @click.stop
            />
          </div>
        </div>

        <!-- Options List -->
        <div class="max-h-[240px] overflow-y-auto custom-scrollbar p-1">
          <template v-if="filteredCategories.length > 0">
            <div
              v-for="cat in filteredCategories"
              :key="cat.id"
              @click.stop="toggleCategory(cat.id)"
              class="group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer hover:bg-muted/60 transition-all"
              :class="{ 'bg-secondary/5': isSelected(cat.id) }"
            >
              <div class="flex items-center gap-3">
                <div 
                  class="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:text-secondary transition-colors"
                  :class="{ 'bg-secondary/10 text-secondary': isSelected(cat.id) }"
                >
                  <component :is="getIcon(cat.icon)" class="w-4 h-4" />
                </div>
                <span 
                  class="text-sm font-semibold transition-colors"
                  :class="isSelected(cat.id) ? 'text-secondary font-bold' : 'text-foreground'"
                >
                  {{ cat.name }}
                </span>
              </div>
              <div 
                v-if="isSelected(cat.id)"
                class="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-white"
              >
                <Check class="w-3 h-3 stroke-[3px]" />
              </div>
            </div>
          </template>
          <div v-else class="py-12 text-center text-muted-foreground">
            <p class="text-sm">{{ t('common.noResults') }}</p>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { 
  X, ChevronDown, Check, Search, 
  LayoutGrid, ShoppingBag, Settings, PenTool,
  Zap, Shield, Globe, Cpu, Database, Camera, Smartphone
} from 'lucide-vue-next';
import { useCategoryStore } from '@/stores/categoryStore';

const { t, locale } = useI18n();
const categoryStore = useCategoryStore();

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  label: String,
  placeholder: String,
  error: String
});

const emit = defineEmits(['update:modelValue', 'change']);

const isOpen = ref(false);
const searchQuery = ref('');
const containerRef = ref(null);
const searchInputRef = ref(null);

// Built-in icon mapper
const iconMap = {
  'cctv': Camera,
  'networking': Globe,
  'data_centers': Database,
  'electronics': Cpu,
  'tools': PenTool,
  'security': Shield,
  'it': LayoutGrid,
  'default': ShoppingBag
};

const getIcon = (name) => iconMap[name] || iconMap.default;

const categories = computed(() => categoryStore.localizedCategories(locale.value));

const filteredCategories = computed(() => {
  if (!searchQuery.value) return categories.value;
  const q = searchQuery.value.toLowerCase();
  return categories.value.filter(c => 
    c.name.toLowerCase().includes(q) || 
    c.slug.toLowerCase().includes(q)
  );
});

const isSelected = (id) => props.modelValue.includes(id);

const toggleCategory = (id) => {
  const newValue = [...props.modelValue];
  const index = newValue.indexOf(id);
  if (index === -1) {
    newValue.push(id);
  } else {
    newValue.splice(index, 1);
  }
  emit('update:modelValue', newValue);
  emit('change', newValue);
};

const removeCategory = (id) => {
  const newValue = props.modelValue.filter(v => v !== id);
  emit('update:modelValue', newValue);
  emit('change', newValue);
};

const getCategoryName = (id) => {
  const cat = categories.value.find(c => c.id === id);
  return cat ? cat.name : 'Unknown';
};

const handleClickOutside = (e) => {
  if (containerRef.value && !containerRef.value.contains(e.target)) {
    isOpen.value = false;
  }
};

watch(isOpen, (val) => {
  if (val) {
    searchQuery.value = '';
    setTimeout(() => searchInputRef.value?.focus(), 100);
  }
});

onMounted(() => {
  window.addEventListener('click', handleClickOutside);
  categoryStore.fetchCategories({ mode: 'revalidate' });
});

onBeforeUnmount(() => window.removeEventListener('click', handleClickOutside));
</script>

<style scoped>
.tag-list-move,
.tag-list-enter-active,
.tag-list-leave-active {
  transition: all 0.2s ease;
}
.tag-list-enter-from,
.tag-list-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(4px);
}

.dropdown-pop-enter-active {
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.dropdown-pop-leave-active {
  transition: all 0.1s ease-in;
}
.dropdown-pop-enter-from {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}
.dropdown-pop-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: hsl(var(--border));
  border-radius: 99px;
}

/* RTL Typography Fix */
:lang(ar) .form-label,
:lang(ar) span {
  font-family: 'IBM Plex Sans Arabic', 'Cairo', sans-serif;
}
</style>

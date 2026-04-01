<template>
  <div
    class="absolute top-full start-0 end-0 bg-card shadow-2xl border-b border-border z-50 animate-in slide-in-from-top-2 duration-300"
    v-click-outside="() => $emit('close')"
  >
    <div class="container-wide py-8">
      <div v-if="categoryStore.loading" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div v-for="i in 12" :key="i" class="h-24 bg-muted animate-pulse rounded-2xl"></div>
      </div>
      
      <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        <router-link
          v-for="cat in rootCategories"
          :key="cat.id"
          :to="`/products?category=${cat.id}`"
          @click="$emit('close')"
          class="group rounded-2xl border border-transparent p-4 transition-all hover:border-primary/20 hover:bg-primary/5"
        >
          <div class="flex items-start gap-3">
            <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-muted/40 transition-all group-hover:scale-110 group-hover:bg-primary/10">
              <component :is="getIcon(cat.icon)" class="h-7 w-7 text-muted-foreground transition-colors group-hover:text-primary" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-sm font-black text-foreground transition-colors group-hover:text-primary">
                {{ cat.label }}
              </div>
              <div class="mt-2 flex flex-wrap gap-1.5">
                <span
                  v-for="child in getChildren(cat.id).slice(0, 3)"
                  :key="child.id"
                  class="rounded-full bg-muted px-2 py-1 text-[10px] font-bold text-muted-foreground"
                >
                  {{ child.label }}
                </span>
                <span
                  v-if="getChildren(cat.id).length > 3"
                  class="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary"
                >
                  +{{ getChildren(cat.id).length - 3 }}
                </span>
              </div>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { 
  Camera, Cpu, Activity, Radio, Database, ShieldCheck, 
  Flame, Lock, Wifi, Monitor, Box, Zap, LayoutGrid 
} from 'lucide-vue-next';
import { useCategoryStore } from '@/stores/categoryStore';
import { useCategoryHierarchy } from '@/composables/useCategoryHierarchy';

const { t, locale } = useI18n();
const categoryStore = useCategoryStore();
const categories = computed(() => categoryStore.localizedCategories(locale.value));
const { rootCategories, getChildren } = useCategoryHierarchy(categories, locale);

defineEmits(['close']);
const props = defineProps({
  excludeEl: { type: Object, default: null }
});

const iconMap = {
  camera: Camera, cpu: Cpu, activity: Activity, radio: Radio, 
  database: Database, shieldcheck: ShieldCheck, 
  flame: Flame, lock: Lock, wifi: Wifi, monitor: Monitor, box: Box, zap: Zap,
  default: LayoutGrid
};

const getIcon = (name) => {
  if (!name) return iconMap.default;
  const key = name.toLowerCase().replace(/\s+/g, '');
  return iconMap[key] || iconMap.default;
};

onMounted(() => {
  categoryStore.fetchCategories({ mode: 'revalidate' });
});

const vClickOutside = {
  mounted(el, binding) {
    el._clickOutside = (e) => { 
      if (props.excludeEl && props.excludeEl.contains(e.target)) return;
      if (!el.contains(e.target)) binding.value(e); 
    };
    setTimeout(() => document.addEventListener('click', el._clickOutside, true), 100);
  },
  unmounted(el) {
    document.removeEventListener('click', el._clickOutside, true);
  },
};
</script>

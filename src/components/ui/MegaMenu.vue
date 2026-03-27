<template>
  <div
    class="absolute top-full start-0 end-0 bg-card shadow-2xl border-b border-border z-50 animate-in slide-in-from-top-2 duration-300"
    v-click-outside="() => $emit('close')"
  >
    <div class="container-wide py-8">
      <div v-if="categoryStore.loading" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div v-for="i in 12" :key="i" class="h-24 bg-muted animate-pulse rounded-2xl"></div>
      </div>
      
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3">
        <router-link
          v-for="cat in categoryStore.localizedCategories(locale)"
          :key="cat.id"
          :to="`/products?category=${cat.id}`"
          @click="$emit('close')"
          class="group flex flex-col items-center gap-3 p-4 rounded-2xl hover:bg-primary/5 hover:border-primary/20 border border-transparent transition-all text-center"
        >
          <div class="w-14 h-14 rounded-2xl bg-muted/40 group-hover:bg-primary/10 flex items-center justify-center transition-all group-hover:scale-110">
            <component :is="getIcon(cat.icon)" class="w-7 h-7 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <span class="text-[11px] font-black uppercase tracking-tight text-foreground group-hover:text-primary transition-colors leading-tight">
            {{ cat.name }}
          </span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { 
  Camera, Cpu, Activity, Radio, Database, ShieldCheck, 
  Flame, Lock, Wifi, Monitor, Box, Zap, LayoutGrid 
} from 'lucide-vue-next';
import { useCategoryStore } from '@/stores/categoryStore';

const { t, locale } = useI18n();
const categoryStore = useCategoryStore();

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
  categoryStore.fetchCategories();
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

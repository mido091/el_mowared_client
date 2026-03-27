<template>
  <nav v-if="breadcrumbs.length > 0" class="py-3 px-4 md:px-0" aria-label="Breadcrumb">
    <ol class="flex items-center space-x-2 rtl:space-x-reverse text-xs text-muted-foreground">
      <li>
        <router-link to="/" class="hover:text-primary transition-colors flex items-center">
          <Home class="w-3.5 h-3.5" />
          <span class="sr-only">{{ t('common.home') }}</span>
        </router-link>
      </li>
      
      <li v-for="(crumb, index) in breadcrumbs" :key="crumb.path" class="flex items-center space-x-2 rtl:space-x-reverse">
        <ChevronRight class="w-3 h-3 pointer-events-none" />
        <router-link 
          v-if="index !== breadcrumbs.length - 1"
          :to="crumb.path" 
          class="hover:text-primary transition-colors font-medium"
        >
          {{ crumb.label }}
        </router-link>
        <span v-else class="text-foreground font-bold truncate max-w-[150px] sm:max-w-xs">
          {{ crumb.label }}
        </span>
      </li>
    </ol>
  </nav>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Home, ChevronRight } from 'lucide-vue-next';

const route = useRoute();
const { t } = useI18n();

const breadcrumbs = computed(() => {
  const pathArray = route.path.split('/').filter(p => p);
  const crumbs = [];
  
  let currentPath = '';
  pathArray.forEach((part, index) => {
    currentPath += `/${part}`;
    
    // We can use meta for custom labels, or fallback to the part name
    let label = route.matched[index + 1]?.meta?.breadcrumb || part;
    
    // Internationalize if possible
    if (label.includes('.')) {
      label = t(label);
    } else {
      label = label.charAt(0).toUpperCase() + label.slice(1).replace(/-/g, ' ');
    }

    crumbs.push({
      label,
      path: currentPath
    });
  });

  return crumbs;
});
</script>

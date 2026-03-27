<template>
  <div class="min-h-screen flex items-center justify-center p-6">
    <div class="text-center max-w-sm">
      <p class="text-8xl font-black text-primary/20 dark:text-foreground/10 mb-4">404</p>
      <h1 class="text-2xl font-black text-foreground mb-3">{{ t('errors.notFound') }}</h1>
      <p class="text-muted-foreground mb-8">{{ t('errors.notFoundDesc') }}</p>
      <div class="flex flex-col gap-3">
        <router-link to="/" class="btn-primary font-bold"><Home class="w-4 h-4" /> {{ t('nav.home') }}</router-link>
        <router-link to="/products" class="btn-outline font-bold">{{ t('nav.products') }}</router-link>
      </div>
    </div>
  </div>
</template>
<script setup>
import { Home } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>

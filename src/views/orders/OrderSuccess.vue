<template>
  <div class="container-narrow py-16 text-center">
    <div class="card p-10 max-w-md mx-auto">
      <div class="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 class="w-10 h-10 text-green-600 dark:text-green-400" />
      </div>
      <h1 class="text-2xl font-black text-foreground mb-3">{{ t('checkout.successTitle') }}</h1>
      <p class="text-muted-foreground mb-8 leading-relaxed">{{ t('checkout.successDesc') }}</p>
      <div class="flex flex-col gap-3">
        <router-link to="/dashboard/user/orders" class="btn-primary w-full font-bold">{{ t('common.orders') }}</router-link>
        <router-link to="/products" class="btn-outline w-full font-bold">{{ t('home.source_now') }}</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { CheckCircle2 } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>

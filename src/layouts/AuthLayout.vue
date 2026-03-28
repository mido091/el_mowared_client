<template>
  <div class="min-h-screen flex bg-primary dark:bg-background">
    <!-- Left Panel -->
    <div class="hidden lg:flex w-[45%] xl:w-1/2 relative flex-col items-center justify-center overflow-hidden bg-auth-gradient">
      <!-- Decorative circles -->
      <div class="absolute inset-0">
        <div class="absolute top-1/4 -start-16 w-64 h-64 border-2 border-white/5 rounded-full" />
        <div class="absolute bottom-1/4 -end-16 w-96 h-96 border border-white/5 rounded-full" />
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-secondary/20 blur-3xl rounded-full" />
      </div>
      <!-- Content -->
      <div class="relative z-10 text-center px-12 max-w-md">
        <router-link to="/" class="absolute -top-12 -start-4 text-white/70 hover:text-white flex items-center gap-2 transition-colors text-sm font-semibold">
          <ArrowLeft class="w-4 h-4 rtl:rotate-180" />
          {{ t('nav.home') }}
        </router-link>
        <div class="mb-8 flex justify-center">
          <router-link v-if="settingsStore.activeLogo" to="/" class="block transition-transform hover:scale-105 duration-500">
            <img :src="settingsStore.activeLogo" :alt="settingsStore.siteName" class="h-20 sm:h-24 w-auto object-contain rounded-lg" />
          </router-link>
          <div v-else class="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/20 transition-transform hover:scale-105 duration-500">
             <span class="text-white font-black text-3xl">{{ settingsStore.siteName.substring(0,2).toUpperCase() }}</span>
          </div>
        </div>
        <h1 class="text-4xl font-black text-white uppercase tracking-tight mb-4 leading-tight">
          {{ settingsStore.siteName }}
        </h1>
        <p class="text-primary-foreground/60 text-sm leading-relaxed whitespace-pre-line">
          {{ locale === 'ar' ? (settingsStore.siteDescriptionAr || t('auth.panelDesc')) : (settingsStore.siteDescriptionEn || t('auth.panelDesc')) }}
        </p>
        <!-- Stats -->
        <div class="grid grid-cols-3 gap-4 mt-10">
          <div v-for="stat in stats" :key="stat.label" class="text-center">
            <p class="text-2xl font-black text-secondary">{{ stat.value }}</p>
            <p class="text-[10px] font-semibold text-primary-foreground/50 uppercase tracking-wider">{{ stat.label }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Right: Form -->
    <div class="flex-1 flex flex-col items-center justify-center p-6 bg-background overflow-y-auto custom-scrollbar">
      <div class="w-full max-w-md">
        <!-- Mobile logo and return to home -->
        <div class="lg:hidden flex items-center justify-between mb-8">
          <router-link to="/" class="flex items-center gap-3">
            <div v-if="settingsStore.activeLogo" class="h-10 transition-transform hover:scale-105 duration-300">
              <img :src="settingsStore.activeLogo" :alt="settingsStore.siteName" class="h-full w-auto object-contain rounded-md" />
            </div>
            <div v-else class="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
              <span class="text-primary font-black">{{ settingsStore.siteName.substring(0,2).toUpperCase() }}</span>
            </div>
            <span class="font-black text-xl text-primary dark:text-foreground tracking-tighter uppercase leading-none">{{ settingsStore.siteName }}</span>
          </router-link>
          <router-link to="/" class="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
            <ArrowLeft class="w-4 h-4 rtl:rotate-180" />
            <span class="hidden sm:inline">{{ t('nav.home') }}</span>
          </router-link>
        </div>
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { useSettingsStore } from '@/stores/settings';
import { ArrowLeft } from 'lucide-vue-next';

const { t, locale } = useI18n();
const settingsStore = useSettingsStore();

const stats = [
  { value: '500+', label: 'Vendors' },
  { value: '10K+', label: 'Products' },
  { value: '50K+', label: 'Buyers' },
];
</script>

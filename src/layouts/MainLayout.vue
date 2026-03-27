<template>
  <div class="min-h-screen flex flex-col bg-background">
    <Header />
    <div class="container-wide">
      <Breadcrumbs />
    </div>
    <main class="flex-grow">
      <slot />
    </main>
    <Footer />
    <ComparisonBar />
  </div>
</template>

<script setup>
import { defineAsyncComponent } from 'vue';
import Header from '@/components/ui/Header.vue';
import Breadcrumbs from '@/components/ui/Breadcrumbs.vue';
const Footer = defineAsyncComponent(() => import('@/components/ui/Footer.vue'));
const ComparisonBar = defineAsyncComponent(() => import('@/components/ui/ComparisonBar.vue'));
</script>

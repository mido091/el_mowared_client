<template>
  <div :dir="currentDir" :class="[isRTL ? 'font-arabic' : 'font-sans', 'overflow-x-clip min-h-screen']">
    <component :is="layout">
      <router-view />
    </component>
    <NotificationProvider />
    <GlobalChatWidget v-if="showGlobalChatWidget" />
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent, onMounted, onUnmounted, ref, watch, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useUiStore } from '@/stores/ui';
import { useAuthStore } from '@/stores/auth';
import { useSettingsStore } from '@/stores/settings';
import { useNotificationStore } from '@/stores/notificationStore';
import { useChatStore } from '@/stores/chat';
import NotificationProvider from '@/components/ui/NotificationProvider.vue';

import MainLayout from '@/layouts/MainLayout.vue';
import AuthLayout from '@/layouts/AuthLayout.vue';
import DashboardLayout from '@/layouts/DashboardLayout.vue';

import { useTitle, useFavicon } from '@vueuse/core';
import { whenBrowserIdle } from '@/utils/scheduling';

const route    = useRoute();
const { locale, t } = useI18n();
const uiStore  = useUiStore();
const authStore = useAuthStore();
const settingsStore = useSettingsStore();
const notificationStore = useNotificationStore();
const chatStore = useChatStore();
const GlobalChatWidget = defineAsyncComponent(() => import('@/components/chat/GlobalChatWidget.vue'));
const globalWidgetReady = ref(false);
let cleanupRealtimeInit = null;
let cleanupSettingsInit = null;
const handleAppLogout = () => {
  notificationStore.disconnect();
};

// Dynamic branding
const title   = useTitle();
const favicon = useFavicon();

watchEffect(() => {
  // SEO: Tab Title (e.g., Home | Elmowared)
  const routeTitle = route.meta.breadcrumb ? t(route.meta.breadcrumb) : (route.name || 'Dashboard');
  title.value = `${routeTitle} | ${settingsStore.siteName}`;
  
  // SEO: Dynamic Favicon
  if (settingsStore.favicon) {
    favicon.value = settingsStore.favicon;
  }
});

const layouts = {
  MainLayout,
  AuthLayout,
  DashboardLayout,
};

const layout = computed(() => {
  const name = route.meta.layout || 'MainLayout';
  return layouts[name] || layouts.MainLayout;
});

const showGlobalChatWidget = computed(() => {
  const role = `${authStore.user?.role || ''}`.toLowerCase();
  return globalWidgetReady.value
    && authStore.isAuthenticated
    && !['admin', 'owner'].includes(role)
    && !route.path.includes('/chat');
});

const isRTL     = computed(() => locale.value === 'ar');
const currentDir = computed(() => isRTL.value ? 'rtl' : 'ltr');

watchEffect(() => {
  document.documentElement.dir  = currentDir.value;
  document.documentElement.lang = locale.value;
  // Persist locale
  localStorage.setItem('locale', locale.value);
});

// Apply dark mode on mount
onMounted(() => {
  if (uiStore.isDark) document.documentElement.classList.add('dark');

  window.addEventListener('app:logout', handleAppLogout);

  // Restore auth session if token exists
  if (authStore.token && !authStore.user) {
    authStore.fetchMe();
  }

  cleanupSettingsInit = whenBrowserIdle(() => {
    settingsStore.fetch();
  }, 150);
});

watch(
  () => authStore.isAuthenticated,
  (isAuthenticated) => {
    cleanupRealtimeInit?.();
    cleanupRealtimeInit = null;

    if (!isAuthenticated) {
      globalWidgetReady.value = false;
      return;
    }

    const initRealtime = () => {
      notificationStore.init();
      chatStore.initListeners();
      globalWidgetReady.value = true;
    };

    if (route.name === 'Chat' || route.path.includes('/chat')) {
      initRealtime();
      return;
    }

    cleanupRealtimeInit = whenBrowserIdle(initRealtime, 250);
  },
  { immediate: true }
);

watch(
  () => route.path,
  (path) => {
    if (!authStore.isAuthenticated) return;
    if (!path.includes('/chat')) return;

    cleanupRealtimeInit?.();
    cleanupRealtimeInit = null;
    notificationStore.init();
    chatStore.initListeners();
    globalWidgetReady.value = true;
  }
);

onUnmounted(() => {
  cleanupRealtimeInit?.();
  cleanupSettingsInit?.();
  window.removeEventListener('app:logout', handleAppLogout);
});
</script>

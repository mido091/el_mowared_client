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
/**
 * App.vue is the runtime shell for the whole SPA.
 * It is responsible for:
 * - selecting the active layout from route metadata
 * - applying locale/RTL state to the document
 * - bootstrapping global settings, notifications, chat listeners, and realtime sync
 * - rendering cross-app UI such as toasts and the floating chat widget
 */
import { computed, defineAsyncComponent, onMounted, onUnmounted, ref, watch, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useUiStore } from '@/stores/ui';
import { useAuthStore } from '@/stores/auth';
import { useSettingsStore } from '@/stores/settings';
import { useNotificationStore } from '@/stores/notificationStore';
import { useChatStore } from '@/stores/chat';
import { useMarketplaceRealtimeStore } from '@/stores/marketplaceRealtimeStore';
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
const marketplaceRealtimeStore = useMarketplaceRealtimeStore();
const GlobalChatWidget = defineAsyncComponent(() => import('@/components/chat/GlobalChatWidget.vue'));
const globalWidgetReady = ref(false);
let cleanupRealtimeInit = null;
let cleanupSettingsInit = null;
const handleAppLogout = () => {
  // Disconnect long-lived channels immediately so stale sessions stop receiving events.
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

// The floating chat widget is intentionally hidden on admin/owner pages and the dedicated chat screen
// to avoid duplicating the main messaging experience.
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
  marketplaceRealtimeStore.init();

  // Restore auth session if token exists
  if (authStore.token && !authStore.user) {
    authStore.fetchMe();
  }

  cleanupSettingsInit = whenBrowserIdle(() => {
    // Branding/settings are non-blocking, so they are loaded lazily after first paint.
    settingsStore.fetch();
  }, 150);
});

watch(
  () => [authStore.isAuthenticated, authStore.user?.id],
  ([isAuthenticated, userId]) => {
    cleanupRealtimeInit?.();
    cleanupRealtimeInit = null;

    if (!isAuthenticated || !userId) {
      globalWidgetReady.value = false;
      return;
    }

    const initRealtime = () => {
      // These listeners stay close to the authenticated session lifecycle, not route components,
      // so they can survive navigation changes and keep notification state centralized.
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
    if (!authStore.isAuthenticated || !authStore.user?.id) return;
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

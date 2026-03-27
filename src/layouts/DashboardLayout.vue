<template>
  <div class="flex h-screen overflow-hidden bg-background font-sans transition-colors duration-300">
    <!-- Sidebar Backdrop (Mobile Only) -->
    <Transition name="fade">
      <div v-if="sidebarOpen && isMobile" 
        class="app-backdrop layer-backdrop lg:hidden"
        @click="sidebarOpen = false">
      </div>
    </Transition>

    <!-- Sidebar -->
    <aside 
      :class="[
        'layer-mobile-nav fixed lg:static inset-y-0 start-0 flex flex-col bg-card border-e border-border transition-all duration-300 ease-spring',
        isMobile 
          ? (sidebarOpen ? 'translate-x-0 w-64' : (locale === 'ar' ? 'translate-x-full w-64' : '-translate-x-full w-64')) 
          : (collapsed ? 'w-20 translate-x-0' : 'w-64 translate-x-0')
      ]"
    >
      <!-- Brand Sidebar Header -->
      <div class="h-16 flex items-center justify-between px-6 border-b border-border/50 shrink-0 relative">
        <router-link to="/" class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shrink-0 shadow-lg shadow-primary/20 overflow-hidden">
            <img v-if="settingsStore.logo" :src="settingsStore.logo" class="w-full h-full object-contain bg-white" alt="Site Logo" />
            <Package v-else class="w-5 h-5" />
          </div>
          <span v-if="isMobile || !collapsed" class="text-lg font-black tracking-tighter text-foreground uppercase">
            {{ t('common.siteName', 'Mowared') }}<span class="text-secondary">.</span>
          </span>
        </router-link>
        <button v-if="isMobile" @click="sidebarOpen = false" class="p-2 -mx-2 text-muted-foreground hover:bg-muted rounded-xl transition-colors">
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto custom-scrollbar py-4 px-3 space-y-1">
        <template v-for="group in navGroups" :key="group.title">
          <p v-if="(isMobile || !collapsed) && group.title" class="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">
            {{ t(group.title) }}
          </p>
          <router-link 
            v-for="item in group.items" 
            :key="item.name" 
            :to="item.to"
            v-slot="{ isActive }"
          >
            <div 
              :class="[
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group',
                isActive ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              ]"
              :title="collapsed ? t(item.label) : ''"
            >
              <component :is="item.icon" :class="['w-5 h-5 shrink-0 transition-transform group-hover:scale-110', isActive ? '' : 'text-muted-foreground/70']" />
              <span v-if="isMobile || !collapsed" class="truncate">{{ item.labelText || t(item.label) }}</span>
            </div>
          </router-link>
          <div v-if="isMobile || !collapsed" class="my-4 border-t border-border/30 mx-3"></div>
        </template>
      </nav>

      <!-- Sidebar Footer (Empty or for secondary info) -->
      <div v-if="isMobile || !collapsed" class="p-4 border-t border-border/50 shrink-0">
        <p class="text-[10px] text-muted-foreground font-bold uppercase text-center opacity-50">
          {{ t('common.siteName') }} &copy; 2026
        </p>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0 h-screen">
      <!-- Topbar -->
      <header class="layer-header h-16 flex items-center justify-between px-4 sm:px-8 border-b border-border/50 bg-card/80 backdrop-blur-md sticky top-0 shrink-0">
        <div class="flex items-center gap-4">
          <button @click="isMobile ? (sidebarOpen = !sidebarOpen) : (collapsed = !collapsed)" class="p-2 rounded-lg hover:bg-muted text-foreground transition-colors">
            <Menu v-if="isMobile || !collapsed" class="w-5 h-5" />
            <ChevronRight v-else :class="['w-5 h-5 transition-transform', locale === 'ar' ? 'rotate-180' : '']" />
          </button>
          
          <!-- Breadcrumbs -->
          <nav class="hidden sm:flex items-center gap-2 text-xs font-semibold tracking-wide">
            <router-link to="/dashboard" class="text-muted-foreground hover:text-primary transition-colors uppercase">{{ t('dashboard.title') }}</router-link>
            <ChevronRight class="w-3 h-3 text-muted-foreground/50 rtl:rotate-180" />
            <span class="text-primary font-black uppercase">{{ route.meta.breadcrumbText?.[locale] || t(route.meta.breadcrumb || `nav.${currentRouteName.toLowerCase()}`, currentRouteName) }}</span>
          </nav>
        </div>

        <div class="flex items-center gap-2 sm:gap-4">
          <!-- Activity Toggle -->
          <button @click="openActivityDrawer" class="p-2 rounded-lg hover:bg-muted text-foreground/70 transition-colors hidden md:flex" :title="t('dashboard.activity_feed')">
            <TrendingUp class="w-5 h-5" />
          </button>

          <!-- Language Toggle -->
          <button @click="toggleLang" class="p-2 rounded-lg hover:bg-muted text-foreground/70 transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest" :title="t('common.language')">
            <Languages class="w-5 h-5 md:w-4 md:h-4 text-secondary" />
            <span class="hidden lg:inline">{{ locale === 'ar' ? 'EN' : 'AR' }}</span>
          </button>

          <!-- Theme Toggle -->
          <button @click="uiStore.toggleDark" class="p-2 rounded-lg hover:bg-muted text-foreground/70 transition-colors" :title="t('common.theme')">
            <Sun v-if="uiStore.isDark" class="w-5 h-5 md:w-4 md:h-4 text-amber-500 transition-all hover:rotate-45" />
            <Moon v-else class="w-5 h-5 md:w-4 md:h-4 text-primary transition-all hover:-rotate-12" />
          </button>

          <!-- Notification Widget -->
          <button @click="toggleNotifications" class="p-2 rounded-lg hover:bg-muted relative text-foreground/70 transition-colors">
            <Bell class="w-5 h-5 md:w-4 md:h-4" />
            <span 
              v-if="notificationStore.unreadCount > 0"
              class="absolute top-1.5 right-1.5 min-w-[0.9rem] h-[0.9rem] bg-secondary text-white rounded-full border-2 border-card text-[8px] font-black flex items-center justify-center translate-x-1/4 -translate-y-1/4"
            >
              {{ notificationStore.unreadCount > 99 ? '99+' : notificationStore.unreadCount }}
            </span>
          </button>

          <!-- Separator -->
          <div class="w-px h-6 bg-border mx-1"></div>

          <!-- User Menu -->
          <div class="relative">
              <div class="flex items-center gap-3 group cursor-pointer" @click="toggleUserMenu">
              <div class="hidden lg:block text-end">
                <p class="text-sm font-bold text-foreground leading-none">{{ authStore.userName }}</p>
                  <p class="text-[10px] text-muted-foreground font-bold uppercase mt-1">{{ t('roles.' + (authStore.user?.role || 'user')) }}</p>
              </div>
              <div class="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary border border-primary/10 group-hover:scale-105 transition-transform overflow-hidden shadow-inner">
                 <img v-if="authStore.user?.avatar" :src="authStore.user.avatar" class="w-full h-full object-cover" />
                 <span v-else>{{ (authStore.userName || t('common.user_initial', 'U')).charAt(0) }}</span>
              </div>
            </div>

            <!-- User Menu Dropdown -->
            <Transition name="fade">
              <div v-if="userMenuOpen" 
                class="layer-dropdown absolute end-0 mt-4 w-56 bg-card border border-border shadow-2xl rounded-2xl overflow-hidden"
              >
                <div class="p-4 border-b border-border/50 lg:hidden">
                  <p class="text-sm font-bold text-foreground">{{ authStore.userName }}</p>
                  <p class="text-[10px] text-muted-foreground uppercase">{{ t('roles.' + (authStore.user?.role || 'user')) }}</p>
                </div>
                <div class="p-2">
                  <router-link to="/dashboard/profile" @click="userMenuOpen = false" class="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                    <UserCircle class="w-4 h-4" />
                    {{ t('profile.title') }}
                  </router-link>
                  <button @click="authStore.logout()" class="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors mt-1">
                    <X class="w-4 h-4" />
                    {{ t('common.logout') || 'Logout' }}
                  </button>
                </div>
              </div>
            </Transition>
            <div v-if="userMenuOpen" @click="userMenuOpen = false" class="fixed inset-0 layer-header bg-transparent"></div>
          </div>
        </div>
      </header>

      <!-- Content Area -->
      <main class="flex-1 overflow-y-auto custom-scrollbar bg-background/50">
        <div class="p-4 sm:p-8 max-w-7xl mx-auto">
          <router-view v-slot="{ Component }">
            <transition name="page" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </main>
    </div>

    <!-- Notification Panel (bell click) -->
    <Transition name="drawer">
      <div v-if="notifOpen" class="app-drawer-panel layer-drawer fixed inset-y-0 end-0 w-80 flex flex-col max-w-[min(20rem,100vw)]">
        <div class="h-16 flex items-center justify-between px-6 border-b border-border">
          <h3 class="font-bold text-foreground uppercase tracking-wider text-sm">{{ t('common.notifications') }}</h3>
          <div class="flex items-center gap-2">
            <button v-if="notificationStore.unreadCount > 0" @click="notificationStore.markAllAsRead()" class="text-[10px] font-black text-secondary hover:text-secondary/70 uppercase tracking-widest transition-colors">
              {{ t('common.markAllRead', 'Mark all read') }}
            </button>
            <button @click="notifOpen = false" class="p-2 hover:bg-muted rounded-lg transition-colors">
              <ChevronRight :class="['w-4 h-4', locale === 'ar' ? '' : 'rotate-180']" />
            </button>
          </div>
        </div>
        <div class="flex-1 overflow-y-auto p-4 space-y-3">
          <div v-if="!notificationStore.notifications.length" class="flex flex-col items-center justify-center h-48 gap-3 text-muted-foreground">
            <Bell class="w-10 h-10 opacity-20" />
            <p class="text-sm font-bold uppercase tracking-widest opacity-40">{{ t('common.noNotifications', 'All caught up!') }}</p>
          </div>
          <div
            v-for="n in notificationStore.notifications.slice(0, 30)"
            :key="n.id"
            @click="notificationStore.markAsRead(n.id)"
            class="flex gap-3 p-3 rounded-xl transition-colors cursor-pointer group"
            :class="n.read ? 'opacity-60 hover:bg-muted/50' : 'bg-primary/5 hover:bg-primary/10'"
          >
            <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors"
              :class="n.read ? 'bg-muted' : 'bg-primary/10'"
            >
              <Bell class="w-4 h-4" :class="n.read ? 'text-muted-foreground' : 'text-primary'" />
            </div>
            <div class="flex-1 min-w-0 space-y-1">
              <p class="text-xs font-semibold text-foreground truncate">{{ n.message }}</p>
              <p class="text-[10px] text-muted-foreground">{{ new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}</p>
            </div>
            <div v-if="!n.read" class="w-2 h-2 rounded-full bg-secondary shrink-0 mt-2"></div>
          </div>
        </div>
      </div>
    </Transition>
    <div v-if="notifOpen" @click="notifOpen = false" class="app-backdrop layer-backdrop"></div>

    <!-- Activity Feed Drawer -->
    <Transition name="drawer">
      <div v-if="activityOpen" class="app-drawer-panel layer-drawer fixed inset-y-0 end-0 w-80 flex flex-col max-w-[min(20rem,100vw)]">
        <div class="h-16 flex items-center justify-between px-6 border-b border-border">
          <h3 class="font-bold text-foreground uppercase tracking-wider text-sm">{{ t('dashboard.activity_feed') }}</h3>
          <button @click="activityOpen = false" class="p-2 hover:bg-muted rounded-lg transition-colors">
            <ChevronRight :class="['w-4 h-4', locale === 'ar' ? '' : 'rotate-180']" />
          </button>
        </div>
        <div class="flex-1 overflow-y-auto p-6 space-y-4">
          <div v-if="!notificationStore.notifications.length" class="flex flex-col items-center justify-center h-48 gap-3 text-muted-foreground">
            <TrendingUp class="w-10 h-10 opacity-20" />
            <p class="text-xs font-bold uppercase tracking-widest opacity-40">{{ t('dashboard.no_activity', 'No recent activity') }}</p>
          </div>
          <div
            v-for="n in notificationStore.notifications.slice(0, 10)"
            :key="n.id"
            class="flex gap-4 group"
          >
            <div class="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
              <Bell class="w-4 h-4 text-muted-foreground group-hover:text-primary" />
            </div>
            <div class="space-y-1">
              <p class="text-sm text-foreground font-medium">{{ n.message }}</p>
              <p class="text-xs text-muted-foreground">{{ new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
    <div v-if="activityOpen" @click="activityOpen = false" class="app-backdrop layer-backdrop"></div>
    
    <!-- Admin Floating Chats -->
    <AdminChatPopups v-if="['admin', 'owner'].includes(authStore.user?.role?.toLowerCase())" />
  </div>
</template>


<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { 
  Package, LayoutDashboard, ShoppingBag, FileText, 
  MessageSquare, Users, ShieldCheck, Settings,
  Wallet, Menu, Bell, Sun, Moon, Languages,
  ChevronRight, UserCircle, TrendingUp,
  Sparkles, Layers, Radio, X, FileQuestion, Zap, BarChart3, LayoutGrid, Star
} from 'lucide-vue-next';
import { usePermission }       from '@/composables/usePermission';
import { useAuthStore }        from '@/stores/auth';
import { useUiStore }          from '@/stores/ui';
import { useNotificationStore } from '@/stores/notificationStore';
import { useSettingsStore }     from '@/stores/settings';
import AdminChatPopups          from '@/components/chat/AdminChatPopups.vue';

const notificationStore = useNotificationStore();
const settingsStore = useSettingsStore();

const { t, locale } = useI18n();
const route = useRoute();
const authStore = useAuthStore();
const uiStore = useUiStore();
const { can, is, userRole } = usePermission();

const notifOpen = ref(false);
const collapsed = ref(false);
const sidebarOpen = ref(false);
const activityOpen = ref(false);
const userMenuOpen = ref(false);
const isMobile = ref(false);

const toggleUserMenu = () => {
  notifOpen.value = false;
  activityOpen.value = false;
  userMenuOpen.value = !userMenuOpen.value;
};

const toggleNotifications = () => {
  userMenuOpen.value = false;
  activityOpen.value = false;
  notifOpen.value = !notifOpen.value;
};

const openActivityDrawer = () => {
  userMenuOpen.value = false;
  notifOpen.value = false;
  activityOpen.value = true;
};

const currentRouteName = computed(() => {
  const name = route.name?.toString() || '';
  // Split camelCase and filter out generic dashboard prefixes
  const parts = name.split(/(?=[A-Z])/);
  const relevant = parts.filter(p => !['Dashboard', 'User', 'Vendor', 'Admin', 'Owner'].includes(p));
  return relevant.join('') || 'Dashboard';
});

const navGroups = computed(() => {
  const groups = [];

  // 1. Management Group (Owner/Admin)
  if (is('owner') || is('admin')) {
    groups.push({
      title: 'admin.management',
      items: [
        { name: 'overview', label: 'dashboard.overview', icon: LayoutDashboard, to: is('owner') ? '/dashboard/owner' : '/dashboard/admin' },
        can('moderate_products') && { name: 'products', label: 'admin.products.title', icon: Package, to: '/dashboard/admin/products' },
        can('verify_vendors') && { name: 'vendors', label: 'admin.vendors', icon: ShieldCheck, to: '/dashboard/admin/vendors' },
        can('moderate_rfqs') && { name: 'rfq_moderation', label: 'admin.rfq_moderation', icon: Radio, to: '/dashboard/admin/rfq-moderation' },
        (is('owner') || is('admin')) && {
          name: 'reviews',
          label: 'admin.reviews',
          labelText: locale.value === 'ar' ? 'مراجعة التقييمات' : 'Reviews Moderation',
          icon: Star,
          to: '/dashboard/admin/reviews'
        },
        (is('owner') || is('admin')) && { name: 'categories', label: 'admin.categories', icon: LayoutGrid, to: '/dashboard/admin/categories' },
        is('owner') && { name: 'contact_messages', label: 'admin.contactMessages', icon: MessageSquare, to: '/dashboard/admin/contact-messages' },
        is('owner') && { name: 'users', label: 'admin.users', icon: Users, to: '/dashboard/owner/users' },
        is('owner') && { name: 'branding', label: 'settings.branding_title', icon: Sparkles, to: '/dashboard/owner/settings' },
        is('owner') && { name: 'logs', label: 'dashboard.owner.logs', icon: FileText, to: '/dashboard/owner/logs' },
      ].filter(Boolean)
    });
  }

  // 2. Business Group (Vendor)
  if (is('mowared')) {
    groups.push({
      title: 'vendor.management',
      items: [
        { name: 'overview', label: 'dashboard.overview', icon: LayoutDashboard, to: '/dashboard/vendor' },
        { name: 'products', label: 'vendor.products', icon: Package, to: '/dashboard/vendor/products' },
        { name: 'leads', label: 'rfq.leads_center', icon: FileQuestion, to: '/dashboard/vendor/leads' },
      ]
    });

    groups.push({
      title: 'vendor.inventory',
      items: [
        { name: 'quick_replies', label: 'vendor.quick_replies', icon: Zap, to: '/dashboard/vendor/quick-replies' },
      ]
    });

    groups.push({
      title: 'vendor.finances',
      items: [
        { name: 'wallet', label: 'vendor.sales_review', icon: Wallet, to: '/dashboard/vendor/wallet' },
      ]
    });
  }

  // 3. Account Group (Vendor)
  if (is('mowared')) {
    groups.push({
      title: 'common.account',
      items: [
        { name: 'verification', label: 'vendor.verification', icon: ShieldCheck, to: '/dashboard/vendor/verification' },
        { name: 'industries', label: 'vendor.sections', icon: Settings, to: '/dashboard/vendor/industries' },
      ]
    });
  }

  // 5. App Group (Chat & Profile)
  groups.push({
    title: 'common.application',
    items: [
      { name: 'chat',     label: 'chat.title',         icon: MessageSquare,   to: '/chat' },
      { name: 'profile',  label: 'profile.title',      icon: UserCircle,      to: '/dashboard/profile' }
    ]
  });

  return groups;
});

const toggleTheme = () => uiStore.toggleDark();

const toggleLang = () => {
  const newLang = locale.value === 'ar' ? 'en' : 'ar';
  locale.value = newLang;
  localStorage.setItem('locale', newLang);
  // Optional: Update HTML dir for RTL/LTR immediate effect if needed
  document.documentElement.setAttribute('dir', newLang === 'ar' ? 'rtl' : 'ltr');
  document.documentElement.setAttribute('lang', newLang);
};

const checkMobile = () => {
  isMobile.value = window.innerWidth < 1024;
  if (!isMobile.value) {
    sidebarOpen.value = false;
  }
};

watch(sidebarOpen, (open) => {
  if (open) {
    userMenuOpen.value = false;
    notifOpen.value = false;
    activityOpen.value = false;
  }
});

watch(notifOpen, (open) => {
  if (open) {
    userMenuOpen.value = false;
    activityOpen.value = false;
  }
});

watch(activityOpen, (open) => {
  if (open) {
    userMenuOpen.value = false;
    notifOpen.value = false;
  }
});

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});
</script>

<style scoped>
.ease-spring {
  transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: hsl(var(--border) / 0.5);
  border-radius: 20px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--muted-foreground) / 0.5);
}
</style>

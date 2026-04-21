<template>
  <div class="relative">
    <!-- Trigger Button -->
    <div 
      class="flex items-center gap-3 group cursor-pointer" 
      @click="isOpen = !isOpen"
      v-click-outside="() => isOpen = false"
    >
      <div class="hidden lg:block text-end">
        <p class="text-sm font-bold text-foreground leading-none">{{ authStore.userName }}</p>
        <p class="text-[10px] text-muted-foreground font-bold uppercase mt-1">
          {{ t('roles.' + (authStore.user?.role?.toLowerCase() || 'user')) }}
        </p>
      </div>
      <div class="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary border border-primary/10 group-hover:scale-105 transition-transform overflow-hidden shadow-inner">
         <img v-if="authStore.user?.avatar" :src="authStore.user.avatar" class="w-full h-full object-cover" />
         <span v-else>{{ (authStore.userName || 'U').charAt(0) }}</span>
      </div>
      <ChevronDown class="w-4 h-4 text-muted-foreground transition-transform duration-200" :class="{ 'rotate-180': isOpen }" />
    </div>

    <!-- Dropdown Menu -->
    <Transition name="scale-fade">
      <div v-if="isOpen" class="absolute top-full end-0 mt-2 w-56 bg-card border border-border rounded-2xl shadow-2xl py-2 z-50 overflow-hidden">
        <div class="px-4 py-3 border-b border-border mb-1 bg-muted/30">
          <p class="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-0.5">{{ t('common.account') }}</p>
          <p class="text-xs font-bold text-foreground truncate">{{ authStore.user?.email }}</p>
        </div>

        <!-- Role-based Links -->
        <router-link 
          :to="profileRoute" 
          @click="isOpen = false" 
          class="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors font-medium"
        >
          <UserCircle class="w-4 h-4 text-muted-foreground" />
          {{ profileLabel }}
        </router-link>

        <router-link 
          v-if="!isBuyer" 
          :to="dashboardRoute" 
          @click="isOpen = false" 
          class="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors font-medium"
        >
          <LayoutDashboard class="w-4 h-4 text-muted-foreground" />
          {{ t('dashboard.dashboard_label') }}
        </router-link>

        <router-link 
          to="/chat" 
          @click="isOpen = false" 
          class="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors font-medium"
        >
          <MessageSquare class="w-4 h-4 text-muted-foreground" />
          {{ t('chat.title') }}
        </router-link>

        <div class="h-px bg-border my-1"></div>

        <button 
          @click="handleLogout" 
          class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/5 transition-colors font-bold"
        >
          <LogOut class="w-4 h-4" />
          {{ t('auth.sign_out') }}
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { UserCircle, LayoutDashboard, MessageSquare, LogOut, ChevronDown } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { useUiStore } from '@/stores/ui';

const { t } = useI18n();
const authStore = useAuthStore();
const uiStore = useUiStore();
const router = useRouter();
const isOpen = ref(false);

const isBuyer = computed(() => authStore.user?.role?.toLowerCase() === 'user');

const profileLabel = computed(() => {
  return isBuyer.value ? t('profile.my_profile', 'My Profile') : t('profile.title');
});

const profileRoute = computed(() => {
  return isBuyer.value ? '/profile' : '/dashboard/profile';
});

const dashboardRoute = computed(() => {
  const role = authStore.user?.role?.toLowerCase();
  if (role === 'mowared') return '/dashboard/vendor';
  if (role === 'owner')   return '/dashboard/owner';
  if (role === 'admin')   return '/dashboard/admin';
  return '/dashboard';
});

const handleLogout = () => {
  isOpen.value = false;
  authStore.logout();
  router.push('/login');
  uiStore.showToast(t('auth.logout_success'), 'success');
};

// Simple directive for click-outside
const vClickOutside = {
  mounted(el, binding) {
    el._clickOutside = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event);
      }
    };
    document.addEventListener('click', el._clickOutside);
  },
  unmounted(el) {
    document.removeEventListener('click', el._clickOutside);
  }
};
</script>

<style scoped>
.scale-fade-enter-active, .scale-fade-leave-active {
  transition: all 0.2s ease-out;
}
.scale-fade-leave-active { pointer-events: none; }
.scale-fade-enter-from, .scale-fade-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}
</style>

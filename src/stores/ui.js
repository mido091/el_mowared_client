import { defineStore } from 'pinia';
import { useNotificationStore } from './notificationStore';

let toastId = 0;

export const useUiStore = defineStore('ui', {
  state: () => ({
    isCartOpen: false,
    isMobileMenuOpen: false,
    isSidebarOpen: localStorage.getItem('sidebarOpen') !== 'false',
    isDark: localStorage.getItem('darkMode') === 'true',
    globalLoading: false,
  }),

  actions: {
    init() {
      // Mirror system theme if no preference
      if (localStorage.getItem('darkMode') === null) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.setDark(prefersDark);
      } else {
        this.setDark(this.isDark);
      }
    },

    showToast(message, type = 'info', duration = 4000) {
      const notificationStore = useNotificationStore();
      notificationStore.addToast(message, type, duration);
    },

    setDark(val) {
      this.isDark = val;
      localStorage.setItem('darkMode', String(val));
      document.documentElement.classList.toggle('dark', val);
    },

    toggleDark() {
      this.setDark(!this.isDark);
    },

    setSidebar(val) {
      this.isSidebarOpen = val;
      localStorage.setItem('sidebarOpen', String(val));
    },

    toggleSidebar() {
      this.setSidebar(!this.isSidebarOpen);
    },

    setGlobalLoading(val) {
      this.globalLoading = val;
    },

    openCart()  { this.isCartOpen = true; },
    closeCart() { this.isCartOpen = false; },
    toggleCart(){ this.isCartOpen = !this.isCartOpen; },
  },
});

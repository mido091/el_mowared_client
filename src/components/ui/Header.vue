<template>
  <header class="layer-header sticky top-0 w-full bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
    <!-- Top Bar -->
    <div class="hidden md:block bg-secondary text-secondary-foreground/80 text-[11px] py-1.5">
      <div class="container-wide flex items-center justify-between">
        <span>{{ settingsStore.siteName }} — {{ t('common.b2b_marketplace') }}</span>
        <div class="flex items-center gap-4">
          <button @click="toggleLang" class="hover:text-primary transition-colors font-semibold">
            {{ locale === 'ar' ? 'English' : 'عربي' }}
          </button>
          <button @click="uiStore.toggleDark()" class="hover:text-primary transition-colors">
            <Moon v-if="!uiStore.isDark" class="w-3.5 h-3.5" />
            <Sun  v-else                 class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Main Nav -->
    <div class="container-wide flex items-center h-16 gap-4">
      <!-- Logo -->
      <router-link to="/" class="flex items-center gap-2 shrink-0 me-4 group">
        <div v-if="!settingsStore.activeLogo" class="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 shadow-sm group-hover:bg-primary/20 transition-all">
          <span class="text-primary font-black text-xs tracking-tighter">{{ settingsStore.siteName.substring(0,2).toUpperCase() }}</span>
        </div>
        <AppImage
          v-else
          :src="settingsStore.activeLogo"
          :alt="settingsStore.siteName"
          :width="120"
          :height="40"
          loading="eager"
          decoding="async"
          sizes="120px"
          img-class="h-10 w-auto object-contain transition-transform group-hover:scale-105"
        />
        
        <span class="hidden sm:block font-black text-xl text-primary dark:text-foreground tracking-tighter uppercase">
          {{ settingsStore.siteName }}
        </span>
      </router-link>

      <!-- Search -->
      <div ref="desktopSearchRef" class="flex-1 max-w-xl relative hidden md:flex">
        <div class="relative w-full">
          <Search class="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            v-model="searchQuery"
            @focus="handleSearchFocus"
            @keydown.enter="doSearch"
            :placeholder="t('common.searchPlaceholder')"
            class="form-input ps-10 pe-4 h-10 text-sm"
          />

          <transition name="search-pop">
            <div
              v-if="showDesktopSuggestions"
              class="layer-dropdown absolute inset-x-0 top-full mt-3 overflow-hidden rounded-[1.75rem] border border-border/70 bg-card/95 shadow-2xl backdrop-blur"
            >
              <div v-if="isSearching" class="space-y-3 p-4">
                <div v-for="i in 3" :key="`desktop-skeleton-${i}`" class="h-16 animate-pulse rounded-2xl bg-muted/40"></div>
              </div>

              <div v-else-if="hasSuggestions" class="max-h-[28rem] overflow-y-auto p-3 custom-scrollbar">
                <section v-if="productSuggestions.length" class="space-y-2">
                  <p class="px-3 pt-2 ui-kicker">{{ labels.products }}</p>
                  <button
                    v-for="product in productSuggestions"
                    :key="`desktop-product-${product.id}`"
                    type="button"
                    @click="goToProduct(product)"
                    class="flex w-full items-center gap-4 rounded-[1.35rem] px-3 py-3 text-start transition-colors hover:bg-muted/40"
                  >
                    <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-primary/5">
                      <LayoutGrid class="h-5 w-5 text-primary" />
                    </div>
                    <div class="min-w-0 flex-1">
                      <p class="truncate text-sm font-black text-foreground">{{ getProductName(product) }}</p>
                      <p class="mt-1 truncate text-xs text-muted-foreground">{{ labels.productResult }}</p>
                    </div>
                  </button>
                </section>

                <section v-if="vendorSuggestions.length" class="space-y-2" :class="productSuggestions.length ? 'mt-3 border-t border-border/60 pt-3' : ''">
                  <p class="px-3 pt-2 ui-kicker">{{ labels.vendors }}</p>
                  <button
                    v-for="vendor in vendorSuggestions"
                    :key="`desktop-vendor-${vendor.id}`"
                    type="button"
                    @click="goToVendor(vendor.id)"
                    class="flex w-full items-center gap-4 rounded-[1.35rem] px-3 py-3 text-start transition-colors hover:bg-muted/40"
                  >
                    <div class="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-secondary/15 bg-secondary/5">
                      <AppImage
                        v-if="vendor.logo"
                        :src="vendor.logo"
                        :alt="getVendorName(vendor)"
                        :width="48"
                        :height="48"
                        sizes="48px"
                        img-class="h-full w-full object-cover"
                      />
                      <span v-else class="text-sm font-black text-secondary">{{ getVendorName(vendor).charAt(0) }}</span>
                    </div>
                    <div class="min-w-0 flex-1">
                      <p class="truncate text-sm font-black text-foreground">{{ getVendorName(vendor) }}</p>
                      <p class="mt-1 truncate text-xs text-muted-foreground">{{ labels.vendorResult }}</p>
                    </div>
                  </button>
                </section>
              </div>

              <div v-else class="px-4 py-8 text-center">
                <Search class="mx-auto h-8 w-8 text-muted-foreground/40" />
                <p class="mt-3 text-sm font-bold text-foreground">{{ labels.noResultsTitle }}</p>
                <p class="mt-1 text-xs text-muted-foreground">{{ labels.noResultsSubtitle }}</p>
              </div>
            </div>
          </transition>
        </div>
      </div>

      <!-- Right Actions -->
      <div class="flex items-center gap-1 ms-auto">
        <!-- Mobile lang -->
        <button @click="toggleLang" class="btn-ghost btn-icon md:hidden">
          <Languages class="w-5 h-5" />
        </button>

        <!-- Dark mode mobile -->
        <button @click="uiStore.toggleDark()" class="btn-ghost btn-icon md:hidden">
          <Moon v-if="!uiStore.isDark" class="w-5 h-5" />
          <Sun  v-else                 class="w-5 h-5" />
        </button>

        <!-- Compare -->
        <router-link
          v-if="comparisonStore.count > 0"
          to="/compare"
          class="btn-ghost btn-icon relative"
          :title="t('products.compare')"
        >
          <BarChart2 class="w-5 h-5" />
          <span class="absolute -top-0.5 -end-0.5 w-4 h-4 bg-destructive text-white text-[9px] font-black rounded-full flex items-center justify-center">
            {{ comparisonStore.count }}
          </span>
        </router-link>

        <!-- Messages -->
        <router-link v-if="authStore.isAuthenticated" to="/chat" class="btn-ghost btn-icon relative" :title="t('chat.title')">
          <MessageSquare class="w-5 h-5" />
          <span
            v-if="chatStore.unreadCount > 0"
            class="absolute top-1 end-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-card animate-pulse"
          />
        </router-link>

        <!-- Auth Buttons / User Menu -->
        <template v-if="!authStore.isAuthenticated">
          <router-link to="/login" class="btn-outline btn-sm hidden sm:inline-flex">
            {{ t('auth.login') }}
          </router-link>
          <router-link to="/register" class="btn-secondary btn-sm hidden sm:inline-flex">
            {{ t('auth.register') }}
          </router-link>
        </template>

        <template v-else>
          <UserDropdown />
        </template>

        <!-- Mobile menu -->
        <button @click="toggleMobileMenu" class="btn-ghost btn-icon md:hidden">
          <Menu class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Category Nav Bar -->
    <div class="hidden md:flex border-t border-border bg-card">
      <div class="container-wide flex items-center gap-0">
        <button
          ref="megaButton"
          @click="toggleMegaMenu"
          class="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-foreground hover:bg-muted/60 transition-all border-e border-border h-full"
        >
          <LayoutGrid class="w-4 h-4 text-secondary" />
          {{ t('home.my_markets') }}
          <ChevronDown :class="['w-3.5 h-3.5 text-muted-foreground transition-transform', megaOpen ? 'rotate-180' : '']" />
        </button>

        <nav class="flex items-center gap-0 overflow-x-auto custom-scrollbar flex-1">
          <router-link
            v-for="item in navLinks"
            :key="item.to"
            :to="item.to"
            :class="[
              'px-4 py-3 text-sm font-medium transition-all whitespace-nowrap border-b-2',
              isNavItemActive(item.to) 
                ? 'text-secondary border-secondary' 
                : 'text-muted-foreground border-transparent hover:text-secondary hover:bg-muted/40'
            ]"
          >
            {{ item.label }}
          </router-link>
        </nav>
      </div>
    </div>

    <!-- Mega Menu -->
    <transition name="slide-down">
      <MegaMenu 
        v-if="megaOpen" 
        :exclude-el="megaButton"
        @close="megaOpen = false" 
      />
    </transition>

    <div
      v-if="mobileMenuOpen"
      class="app-backdrop layer-backdrop top-16 md:hidden"
      @click="mobileMenuOpen = false"
    ></div>

    <!-- Mobile Nav -->
    <transition name="slide-down">
      <div v-if="mobileMenuOpen" class="layer-mobile-nav relative md:hidden bg-card border-t border-border px-4 py-4 space-y-2 shadow-lg">
        <div ref="mobileSearchRef" class="relative mb-4">
          <Search class="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            v-model="searchQuery"
            @focus="handleSearchFocus"
            @keydown.enter="doSearch"
            :placeholder="t('common.searchPlaceholder')"
            class="form-input ps-9 h-10 text-sm"
          />

          <transition name="search-pop">
            <div
              v-if="showMobileSuggestions"
              class="layer-dropdown absolute inset-x-0 top-full mt-3 overflow-hidden rounded-[1.5rem] border border-border/70 bg-card/95 shadow-2xl backdrop-blur"
            >
              <div v-if="isSearching" class="space-y-3 p-4">
                <div v-for="i in 2" :key="`mobile-skeleton-${i}`" class="h-14 animate-pulse rounded-2xl bg-muted/40"></div>
              </div>

              <div v-else-if="hasSuggestions" class="max-h-80 overflow-y-auto p-3 custom-scrollbar">
                <button
                  v-for="item in combinedSuggestions"
                  :key="`${item.type}-${item.id}`"
                  type="button"
                  @click="item.type === 'product' ? goToProduct(item) : goToVendor(item.id)"
                  class="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-start transition-colors hover:bg-muted/40"
                >
                  <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border" :class="item.type === 'product' ? 'border-primary/15 bg-primary/5' : 'border-secondary/15 bg-secondary/5'">
                    <LayoutGrid v-if="item.type === 'product'" class="h-4 w-4 text-primary" />
                    <AppImage
                      v-else-if="item.logo"
                      :src="item.logo"
                      :alt="getVendorName(item)"
                      :width="40"
                      :height="40"
                      sizes="40px"
                      img-class="h-full w-full rounded-2xl object-cover"
                    />
                    <span v-else class="text-sm font-black text-secondary">{{ getVendorName(item).charAt(0) }}</span>
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-black text-foreground">{{ item.type === 'product' ? getProductName(item) : getVendorName(item) }}</p>
                    <p class="mt-1 text-xs text-muted-foreground">{{ item.type === 'product' ? labels.productResult : labels.vendorResult }}</p>
                  </div>
                </button>
              </div>

              <div v-else class="px-4 py-6 text-center">
                <p class="text-sm font-bold text-foreground">{{ labels.noResultsTitle }}</p>
                <p class="mt-1 text-xs text-muted-foreground">{{ labels.noResultsSubtitle }}</p>
              </div>
            </div>
          </transition>
        </div>
        <template v-if="!authStore.isAuthenticated">
          <router-link to="/login"    @click="mobileMenuOpen=false" class="btn-outline w-full btn text-center">{{ t('auth.login') }}</router-link>
          <router-link to="/register" @click="mobileMenuOpen=false" class="btn-secondary w-full btn text-center">{{ t('auth.register') }}</router-link>
        </template>
        <template v-else>
          <router-link v-if="authStore.user?.role !== 'user'" :to="dashboardRoute" @click="mobileMenuOpen=false" class="btn-outline w-full btn text-center">{{ t('dashboard.dashboard_label') }}</router-link>
          <button @click="logout" class="btn-danger w-full btn text-center">{{ t('auth.sign_out') }}</button>
        </template>
      </div>
    </transition>
  </header>
</template>

<script setup>
import { ref, computed, defineAsyncComponent, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n       } from 'vue-i18n';
import {
  Search, BarChart2, Menu, ChevronDown,
  Moon, Sun, Languages, LayoutGrid,
  MessageSquare
} from 'lucide-vue-next';
import { useAuthStore       } from '@/stores/auth';
import { useUiStore         } from '@/stores/ui';
import { useComparisonStore } from '@/stores/comparison';
import { useSettingsStore   } from '@/stores/settings';
import { useChatStore       } from '@/stores/chat';
import api from '@/services/api';
import { getApiCollection, getApiData } from '@/utils/apiResponse';
import AppImage from '@/components/ui/AppImage.vue';
import UserDropdown from './UserDropdown.vue';
import { buildProductPath } from '@/utils/routes';

const MegaMenu = defineAsyncComponent(() => import('@/components/ui/MegaMenu.vue'));

const { t, locale } = useI18n();
const router = useRouter();
const route  = useRoute();
const authStore       = useAuthStore();
const uiStore         = useUiStore();
const comparisonStore = useComparisonStore();
const settingsStore   = useSettingsStore();
const chatStore       = useChatStore();

const searchQuery   = ref('');
const megaOpen      = ref(false);
const megaButton    = ref(null);
const mobileMenuOpen = ref(false);
const desktopSearchRef = ref(null);
const mobileSearchRef = ref(null);
const productSuggestions = ref([]);
const vendorSuggestions = ref([]);
const isSearching = ref(false);
const searchOpen = ref(false);
let searchTimer = null;

const navLinks = computed(() => [
  { to: '/products',          label: t('nav.products') },
  { to: '/products?filter=discounted', label: t('nav.current_offers') },
]);

const labels = computed(() => ({
  products: locale.value === 'ar' ? 'المنتجات' : 'Products',
  vendors: locale.value === 'ar' ? 'التجار' : 'Vendors',
  productResult: locale.value === 'ar' ? 'نتيجة من المنتجات' : 'Product result',
  vendorResult: locale.value === 'ar' ? 'نتيجة من التجار' : 'Vendor result',
  noResultsTitle: locale.value === 'ar' ? 'لا توجد نتائج مطابقة' : 'No matching results',
  noResultsSubtitle: locale.value === 'ar'
    ? 'جرّب كتابة اسم منتج أو تاجر بشكل مختلف.'
    : 'Try searching with a different product or vendor name.'
}));

const normalizedQuery = computed(() => normalizeSearchText(searchQuery.value));
const showDesktopSuggestions = computed(() => searchOpen.value && normalizedQuery.value.length >= 1);
const showMobileSuggestions = computed(() => mobileMenuOpen.value && searchOpen.value && normalizedQuery.value.length >= 1);
const hasSuggestions = computed(() => productSuggestions.value.length > 0 || vendorSuggestions.value.length > 0);
const combinedSuggestions = computed(() => ([
  ...productSuggestions.value.map((item) => ({ ...item, type: 'product' })),
  ...vendorSuggestions.value.map((item) => ({ ...item, type: 'vendor' }))
].slice(0, 8)));

const dashboardRoute = computed(() => {
  const role = authStore.user?.role;
  if (role === 'mowared')  return '/dashboard/vendor';
  if (role === 'owner')    return '/dashboard/owner';
  if (role === 'admin')    return '/dashboard/admin';
  if (role === 'marketer') return '/dashboard/marketer';
  return '/'; // Default to home for regular users (no dashboard)
});

const toggleLang = () => {
  const newLang = locale.value === 'ar' ? 'en' : 'ar';
  locale.value = newLang;
  localStorage.setItem('locale', newLang);
  document.documentElement.setAttribute('dir', newLang === 'ar' ? 'rtl' : 'ltr');
  document.documentElement.setAttribute('lang', newLang);
};

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
  if (mobileMenuOpen.value) {
    megaOpen.value = false;
    closeSearchSuggestions();
  }
};

const toggleMegaMenu = () => {
  megaOpen.value = !megaOpen.value;
  if (megaOpen.value) {
    mobileMenuOpen.value = false;
    closeSearchSuggestions();
  }
};

const normalizeSearchText = (value) => `${value || ''}`
  .trim()
  .toLowerCase()
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '');

const getProductName = (product) =>
  locale.value === 'ar'
    ? (product.name_ar || product.name_en || product.name || `#${product.id}`)
    : (product.name_en || product.name_ar || product.name || `#${product.id}`);

const getVendorName = (vendor) =>
  locale.value === 'ar'
    ? (vendor.company_name_ar || vendor.company_name_en || vendor.companyNameAr || vendor.companyNameEn || `#${vendor.id}`)
    : (vendor.company_name_en || vendor.company_name_ar || vendor.companyNameEn || vendor.companyNameAr || `#${vendor.id}`);

const fetchSearchSuggestions = async () => {
  const query = normalizedQuery.value;
  if (!query) {
    productSuggestions.value = [];
    vendorSuggestions.value = [];
    isSearching.value = false;
    return;
  }

  isSearching.value = true;
  try {
    const [productsResponse, vendorsResponse] = await Promise.all([
      api.get('/products', { params: { search: searchQuery.value.trim(), limit: 4 } }),
      api.get('/vendors', { params: { search: searchQuery.value.trim(), limit: 4 } })
    ]);

    const products = getApiCollection(productsResponse, ['products', 'items']);
    const vendorsData = getApiData(vendorsResponse);
    const vendors = vendorsData?.vendors || [];

    productSuggestions.value = products.slice(0, 4);
    vendorSuggestions.value = vendors.slice(0, 4);
  } catch (error) {
    productSuggestions.value = [];
    vendorSuggestions.value = [];
  } finally {
    isSearching.value = false;
  }
};

const scheduleSearch = () => {
  if (searchTimer) clearTimeout(searchTimer);
  const query = normalizedQuery.value;
  if (!query) {
    productSuggestions.value = [];
    vendorSuggestions.value = [];
    isSearching.value = false;
    return;
  }
  searchTimer = setTimeout(fetchSearchSuggestions, 250);
};

const handleSearchFocus = () => {
  if (normalizedQuery.value) {
    searchOpen.value = true;
  }
};

const closeSearchSuggestions = () => {
  searchOpen.value = false;
};

const doSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ path: '/products', query: { q: searchQuery.value.trim() } });
    mobileMenuOpen.value = false;
    closeSearchSuggestions();
  }
};

const logout = () => {
  mobileMenuOpen.value = false;
  authStore.logout();
};

const goToProduct = (product) => {
  closeSearchSuggestions();
  mobileMenuOpen.value = false;
  router.push(buildProductPath(product));
};

const goToVendor = (vendorId) => {
  closeSearchSuggestions();
  mobileMenuOpen.value = false;
  router.push(`/vendor/${vendorId}`);
};

const isNavItemActive = (to) => {
  if (to === '/products') {
    // Base products link is active only if there's no category query
    return route.path === '/products' && !route.query.category;
  }
  // For other links (like categories or RFQ), match full path or specific query
  return route.fullPath === to || (route.path === to && Object.keys(route.query).length === 0);
};

const handleOutsideSearch = (event) => {
  const desktopInside = desktopSearchRef.value?.contains(event.target);
  const mobileInside = mobileSearchRef.value?.contains(event.target);
  if (!desktopInside && !mobileInside) {
    closeSearchSuggestions();
  }
};

watch(searchQuery, () => {
  if (!normalizedQuery.value) {
    closeSearchSuggestions();
  } else {
    searchOpen.value = true;
  }
  scheduleSearch();
});

watch(mobileMenuOpen, (open) => {
  if (open) {
    megaOpen.value = false;
  }
});

watch(megaOpen, (open) => {
  if (open) {
    mobileMenuOpen.value = false;
  }
});

onMounted(() => {
  document.addEventListener('click', handleOutsideSearch, true);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutsideSearch, true);
  if (searchTimer) clearTimeout(searchTimer);
});
</script>

<style scoped>
.search-pop-enter-active {
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.search-pop-leave-active {
  transition: all 0.12s ease-in;
}

.search-pop-enter-from,
.search-pop-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}
</style>

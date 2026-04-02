<template>
  <header class="layer-header sticky top-0 w-full border-b border-border bg-card/95 shadow-sm backdrop-blur-md">
    <div class="hidden bg-secondary py-1.5 text-[11px] text-secondary-foreground/80 md:block">
      <div class="container-wide flex items-center justify-between">
        <span>{{ settingsStore.siteName }} - {{ t('common.b2b_marketplace') }}</span>
        <div class="flex items-center gap-4">
          <button @click="toggleLang" class="font-semibold transition-colors hover:text-primary">
            {{ locale === 'ar' ? 'English' : 'العربية' }}
          </button>
          <button @click="uiStore.toggleDark()" class="transition-colors hover:text-primary">
            <Moon v-if="!uiStore.isDark" class="h-3.5 w-3.5" />
            <Sun v-else class="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>

    <div class="container-wide flex h-16 items-center justify-between gap-3 md:hidden">
      <button @click="toggleMobileMenu" class="btn-ghost btn-icon shrink-0" aria-label="Menu">
        <Menu class="h-5 w-5" />
      </button>

      <router-link to="/" class="group flex min-w-0 flex-1 items-center justify-center px-2">
        <div
          v-if="!settingsStore.activeLogo"
          class="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 shadow-sm"
        >
          <span class="text-xs font-black tracking-tighter text-primary">
            {{ settingsStore.siteName.substring(0, 2).toUpperCase() }}
          </span>
        </div>
        <AppImage
          v-else
          :src="settingsStore.activeLogo"
          :alt="settingsStore.siteName"
          :width="110"
          :height="36"
          loading="eager"
          decoding="async"
          sizes="110px"
          img-class="h-9 w-auto max-w-[120px] object-contain transition-transform group-hover:scale-105"
        />
      </router-link>

      <div class="flex shrink-0 items-center gap-1">
        <router-link
          v-if="authStore.isAuthenticated"
          to="/chat"
          class="btn-ghost btn-icon relative"
          :title="t('chat.title')"
        >
          <MessageSquare class="h-5 w-5" />
          <span
            v-if="chatStore.unreadCount > 0"
            class="absolute top-1 end-1 h-2.5 w-2.5 animate-pulse rounded-full bg-red-500 ring-2 ring-card"
          />
        </router-link>

        <router-link
          v-if="authStore.isAuthenticated"
          :to="mobileProfileRoute"
          class="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/30 shadow-sm transition hover:border-primary/30 hover:bg-muted"
          :title="t('profile.title')"
        >
          <AppImage
            v-if="authStore.user?.avatar"
            :src="authStore.user.avatar"
            :alt="authStore.userName"
            :width="40"
            :height="40"
            sizes="40px"
            img-class="h-full w-full object-cover"
          />
          <span v-else class="text-sm font-black text-primary">
            {{ (authStore.userName || 'U').charAt(0) }}
          </span>
        </router-link>
      </div>
    </div>

    <div class="container-wide hidden h-16 items-center gap-2 md:flex md:gap-4">
      <router-link to="/" class="group me-2 flex shrink-0 items-center gap-2 md:me-4">
        <div
          v-if="!settingsStore.activeLogo"
          class="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 shadow-sm transition-all group-hover:bg-primary/20"
        >
          <span class="text-xs font-black tracking-tighter text-primary">
            {{ settingsStore.siteName.substring(0, 2).toUpperCase() }}
          </span>
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
        <span class="hidden text-xl font-black uppercase tracking-tighter text-primary dark:text-foreground sm:block">
          {{ settingsStore.siteName }}
        </span>
      </router-link>

      <div ref="desktopSearchRef" class="relative hidden max-w-xl flex-1 md:flex">
        <div class="relative w-full">
          <Search class="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            v-model="searchQuery"
            @focus="handleSearchFocus"
            @keydown.enter="doSearch"
            :placeholder="t('common.searchPlaceholder')"
            class="form-input h-10 pe-24 ps-10 text-sm"
          />
          <button
            type="button"
            @click="doSearch"
            class="absolute end-1.5 top-1/2 inline-flex h-7 -translate-y-1/2 items-center justify-center rounded-lg bg-[hsl(var(--primary))] px-3 text-xs font-black text-white shadow-[0_10px_24px_-16px_hsl(var(--primary))] transition hover:opacity-95"
          >
            {{ locale === 'ar' ? 'ابحث' : 'Search' }}
          </button>

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
                  <p class="ui-kicker px-3 pt-2">{{ labels.products }}</p>
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
                      <p
                        v-if="product.model_number"
                        class="mt-1 truncate text-[11px] font-bold text-primary"
                        dir="ltr"
                      >
                        {{ locale === 'ar' ? 'موديل:' : 'Model:' }} {{ product.model_number }}
                      </p>
                    </div>
                  </button>
                </section>

                <section
                  v-if="vendorSuggestions.length"
                  class="space-y-2"
                  :class="productSuggestions.length ? 'mt-3 border-t border-border/60 pt-3' : ''"
                >
                  <p class="ui-kicker px-3 pt-2">{{ labels.vendors }}</p>
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

      <div class="ms-auto flex items-center gap-0.5 sm:gap-1">
        <router-link
          v-if="comparisonStore.count > 0"
          to="/compare"
          class="btn-ghost btn-icon relative"
          :title="t('products.compare')"
        >
          <BarChart2 class="h-5 w-5" />
          <span class="absolute -top-0.5 -end-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-black text-white">
            {{ comparisonStore.count }}
          </span>
        </router-link>

        <router-link
          v-if="authStore.isAuthenticated"
          to="/chat"
          class="btn-ghost btn-icon relative"
          :title="t('chat.title')"
        >
          <MessageSquare class="h-5 w-5" />
          <span
            v-if="chatStore.unreadCount > 0"
            class="absolute top-1 end-1 h-2.5 w-2.5 animate-pulse rounded-full bg-red-500 ring-2 ring-card"
          />
        </router-link>

        <template v-if="!authStore.isAuthenticated">
          <router-link to="/login" class="btn-outline btn-sm hidden sm:inline-flex">
            {{ t('auth.login') }}
          </router-link>
          <router-link to="/register" class="btn-secondary btn-sm hidden sm:inline-flex">
            {{ t('auth.register') }}
          </router-link>
        </template>

        <template v-else>
          <div class="hidden md:block">
            <UserDropdown />
          </div>
        </template>

        <router-link
          to="/rfq/post"
          class="hidden items-center justify-center rounded-[1.1rem] bg-[hsl(var(--primary))] px-4 py-2 text-sm font-black text-white shadow-[0_16px_40px_-24px_hsl(var(--primary))] transition hover:translate-y-[-1px] hover:shadow-[0_20px_48px_-24px_hsl(var(--primary))] md:inline-flex"
        >
          {{ t('rfq.postRfq') }}
        </router-link>
      </div>
    </div>

    <div class="hidden border-t border-border bg-card md:flex">
      <div class="container-wide flex items-center gap-0">
        <button
          ref="megaButton"
          @click="toggleMegaMenu"
          class="flex h-full items-center gap-2 border-e border-border px-5 py-3 text-sm font-semibold text-foreground transition-all hover:bg-muted/60"
        >
          <LayoutGrid class="h-4 w-4 text-secondary" />
          {{ t('home.my_markets') }}
          <ChevronDown :class="['h-3.5 w-3.5 text-muted-foreground transition-transform', megaOpen ? 'rotate-180' : '']" />
        </button>

        <nav class="custom-scrollbar flex flex-1 items-center gap-0 overflow-x-auto">
          <router-link
            v-for="item in navLinks"
            :key="item.to"
            :to="item.to"
            :class="[
              'whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-all',
              isNavItemActive(item.to)
                ? 'border-secondary text-secondary'
                : 'border-transparent text-muted-foreground hover:bg-muted/40 hover:text-secondary'
            ]"
          >
            {{ item.label }}
          </router-link>
        </nav>
      </div>
    </div>

    <transition name="slide-down">
      <MegaMenu
        v-if="megaOpen"
        :exclude-el="megaButton"
        @close="megaOpen = false"
      />
    </transition>

    <div
      v-if="mobileMenuOpen"
      class="app-backdrop layer-backdrop top-[7.5rem] md:hidden"
      @click="mobileMenuOpen = false"
    ></div>

    <transition name="slide-down">
      <div
        v-if="mobileMenuOpen"
        class="layer-mobile-nav relative border-t border-border bg-card px-4 py-4 shadow-lg md:hidden"
      >
        <div class="space-y-4">
          <div
            v-if="authStore.isAuthenticated"
            class="flex items-center gap-3 rounded-[1.35rem] border border-border bg-muted/30 p-3"
          >
            <div class="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-primary/15 bg-primary/10 shadow-inner">
              <AppImage
                v-if="authStore.user?.avatar"
                :src="authStore.user.avatar"
                :alt="authStore.userName"
                :width="48"
                :height="48"
                sizes="48px"
                img-class="h-full w-full object-cover"
              />
              <span v-else class="text-base font-black text-primary">
                {{ (authStore.userName || 'U').charAt(0) }}
              </span>
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-black text-foreground">{{ authStore.userName }}</p>
              <p class="truncate text-[11px] font-medium text-muted-foreground">{{ authStore.user?.email }}</p>
            </div>
            <router-link
              :to="mobileProfileRoute"
              @click="mobileMenuOpen = false"
              class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition hover:border-primary/30 hover:text-primary"
              :title="t('profile.title')"
            >
              <UserCircle2 class="h-4 w-4" />
            </router-link>
          </div>

          <router-link
            to="/rfq/post"
            @click="mobileMenuOpen = false"
            class="inline-flex w-full items-center justify-center rounded-[1.1rem] bg-[hsl(var(--primary))] px-4 py-3 text-sm font-black text-white shadow-[0_16px_40px_-24px_hsl(var(--primary))]"
          >
            {{ t('rfq.postRfq') }}
          </router-link>

          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              @click="toggleLang"
              class="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-border bg-muted/40 px-4 text-sm font-bold text-foreground transition hover:bg-muted"
            >
              <Languages class="h-4 w-4" />
              <span>{{ locale === 'ar' ? 'English' : 'العربية' }}</span>
            </button>
            <button
              type="button"
              @click="uiStore.toggleDark()"
              class="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-border bg-muted/40 px-4 text-sm font-bold text-foreground transition hover:bg-muted"
            >
              <Moon v-if="!uiStore.isDark" class="h-4 w-4" />
              <Sun v-else class="h-4 w-4" />
              <span>{{ uiStore.isDark ? t('common.light', 'Light') : t('common.dark', 'Dark') }}</span>
            </button>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <router-link
              to="/products"
              @click="mobileMenuOpen = false"
              class="inline-flex h-11 items-center justify-center rounded-2xl border border-border bg-muted/40 px-4 text-sm font-bold text-foreground transition hover:bg-muted"
            >
              {{ t('nav.products') }}
            </router-link>
            <router-link
              to="/products?filter=discounted"
              @click="mobileMenuOpen = false"
              class="inline-flex h-11 items-center justify-center rounded-2xl border border-border bg-muted/40 px-4 text-sm font-bold text-foreground transition hover:bg-muted"
            >
              {{ t('nav.current_offers') }}
            </router-link>
          </div>

          <div v-if="authStore.isAuthenticated" class="grid grid-cols-2 gap-2">
            <router-link
              :to="mobileProfileRoute"
              @click="mobileMenuOpen = false"
              class="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-border bg-muted/40 px-4 text-sm font-bold text-foreground transition hover:bg-muted"
            >
              <UserCircle2 class="h-4 w-4" />
              <span>{{ t('profile.title') }}</span>
            </router-link>
            <router-link
              v-if="authStore.user?.role !== 'user'"
              :to="dashboardRoute"
              @click="mobileMenuOpen = false"
              class="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-border bg-muted/40 px-4 text-sm font-bold text-foreground transition hover:bg-muted"
            >
              <LayoutDashboard class="h-4 w-4" />
              <span>{{ t('dashboard.dashboard_label') }}</span>
            </router-link>
          </div>

          <template v-if="!authStore.isAuthenticated">
            <div class="grid grid-cols-1 gap-2">
              <router-link to="/login" @click="mobileMenuOpen = false" class="btn-outline btn w-full text-center">
                {{ t('auth.login') }}
              </router-link>
              <router-link to="/register" @click="mobileMenuOpen = false" class="btn-secondary btn w-full text-center">
                {{ t('auth.register') }}
              </router-link>
            </div>
          </template>
          <template v-else>
            <button
              @click="logout"
              class="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 text-sm font-bold text-destructive transition hover:bg-destructive/10"
            >
              <LogOut class="h-4 w-4" />
              <span>{{ t('auth.sign_out') }}</span>
            </button>
          </template>
        </div>
      </div>
    </transition>

    <div v-if="!mobileMenuOpen" class="border-t border-border bg-card md:hidden">
      <div class="container-wide pb-3 pt-3">
        <div ref="mobileSearchRef" class="relative">
          <Search class="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            v-model="searchQuery"
            @focus="handleSearchFocus"
            @keydown.enter="doSearch"
            :placeholder="t('common.searchPlaceholder')"
            class="form-input h-11 pe-14 ps-9 text-sm"
          />
          <button
            type="button"
            @click="doSearch"
            class="absolute end-1.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg bg-[hsl(var(--primary))] text-white shadow-[0_10px_24px_-16px_hsl(var(--primary))] transition hover:opacity-95"
            :aria-label="locale === 'ar' ? 'ابحث' : 'Search'"
          >
            <Search class="h-4 w-4" />
          </button>

          <transition name="search-pop">
            <div
              v-if="showMobileSuggestions"
              class="layer-dropdown absolute inset-x-0 top-full z-[205] mt-3 overflow-hidden rounded-[1.5rem] border border-border/70 bg-card/95 shadow-2xl backdrop-blur"
            >
              <div v-if="isSearching" class="space-y-3 p-4">
                <div v-for="i in 2" :key="`mobile-skeleton-${i}`" class="h-14 animate-pulse rounded-2xl bg-muted/40"></div>
              </div>

              <div v-else-if="hasSuggestions" class="custom-scrollbar max-h-80 overflow-y-auto p-3">
                <button
                  v-for="item in combinedSuggestions"
                  :key="`${item.type}-${item.id}`"
                  type="button"
                  @click="item.type === 'product' ? goToProduct(item) : goToVendor(item.id)"
                  class="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-start transition-colors hover:bg-muted/40"
                >
                  <div
                    class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border"
                    :class="item.type === 'product' ? 'border-primary/15 bg-primary/5' : 'border-secondary/15 bg-secondary/5'"
                  >
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
                    <p
                      v-if="item.type === 'product' && item.model_number"
                      class="mt-1 truncate text-[11px] font-bold text-primary"
                      dir="ltr"
                    >
                      {{ locale === 'ar' ? 'موديل:' : 'Model:' }} {{ item.model_number }}
                    </p>
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
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, defineAsyncComponent, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import {
  Search, BarChart2, Menu, ChevronDown,
  Moon, Sun, Languages, LayoutGrid,
  MessageSquare, UserCircle2, LayoutDashboard, LogOut
} from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { useUiStore } from '@/stores/ui';
import { useComparisonStore } from '@/stores/comparison';
import { useSettingsStore } from '@/stores/settings';
import { useChatStore } from '@/stores/chat';
import { useMarketplaceRealtimeStore } from '@/stores/marketplaceRealtimeStore';
import api from '@/services/api';
import { getApiCollection, getApiData } from '@/utils/apiResponse';
import AppImage from '@/components/ui/AppImage.vue';
import UserDropdown from './UserDropdown.vue';
import { buildProductPath } from '@/utils/routes';

const MegaMenu = defineAsyncComponent(() => import('@/components/ui/MegaMenu.vue'));

const { t, locale } = useI18n();
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const uiStore = useUiStore();
const comparisonStore = useComparisonStore();
const settingsStore = useSettingsStore();
const chatStore = useChatStore();
const marketplaceRealtimeStore = useMarketplaceRealtimeStore();

const searchQuery = ref('');
const megaOpen = ref(false);
const megaButton = ref(null);
const mobileMenuOpen = ref(false);
const desktopSearchRef = ref(null);
const mobileSearchRef = ref(null);
const productSuggestions = ref([]);
const vendorSuggestions = ref([]);
const isSearching = ref(false);
const searchOpen = ref(false);
let searchTimer = null;

const navLinks = computed(() => [
  { to: '/products', label: t('nav.products') }
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
const showMobileSuggestions = computed(() => searchOpen.value && normalizedQuery.value.length >= 1);
const hasSuggestions = computed(() => productSuggestions.value.length > 0 || vendorSuggestions.value.length > 0);
const combinedSuggestions = computed(() => ([
  ...productSuggestions.value.map((item) => ({ ...item, type: 'product' })),
  ...vendorSuggestions.value.map((item) => ({ ...item, type: 'vendor' }))
].slice(0, 8)));

const dashboardRoute = computed(() => {
  const role = authStore.user?.role;
  if (role === 'mowared') return '/dashboard/vendor';
  if (role === 'owner') return '/dashboard/owner';
  if (role === 'admin') return '/dashboard/admin';
  if (role === 'marketer') return '/dashboard/marketer';
  return '/';
});

const mobileProfileRoute = computed(() => (
  `${authStore.user?.role || ''}`.toLowerCase() === 'user' ? '/profile' : '/dashboard/profile'
));

const toggleLang = () => {
  const newLang = locale.value === 'ar' ? 'en' : 'ar';
  locale.value = newLang;
  localStorage.setItem('locale', newLang);
  document.documentElement.setAttribute('dir', newLang === 'ar' ? 'rtl' : 'ltr');
  document.documentElement.setAttribute('lang', newLang);
  closeSearchSuggestions();
};

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
  if (mobileMenuOpen.value) {
    megaOpen.value = false;
  }
  closeSearchSuggestions();
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
  const query = searchQuery.value.trim();
  router.push(query ? { path: '/products', query: { q: query } } : { path: '/products' });
  mobileMenuOpen.value = false;
  closeSearchSuggestions();
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
    return route.path === '/products' && !route.query.category;
  }
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

watch(
  () => marketplaceRealtimeStore.productRevision,
  (revision, previousRevision) => {
    if (!revision || revision === previousRevision || !searchOpen.value || !normalizedQuery.value) return;
    scheduleSearch();
  }
);

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

<template>
  <!-- Cart Drawer -->
  <teleport to="body">
    <div v-if="uiStore.isCartOpen" class="fixed inset-0 z-[300]" @click.self="uiStore.closeCart()">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="uiStore.closeCart()" />
      <transition name="drawer">
        <div class="absolute top-0 end-0 h-full w-full max-w-md bg-card shadow-2xl flex flex-col">
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-5 border-b border-border">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <ShoppingCart class="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 class="text-base font-bold text-foreground">{{ t('cart.title') }}</h2>
                <p class="text-xs text-muted-foreground">{{ cartStore.totalItems }} {{ t('cart.items') }}</p>
              </div>
            </div>
            <button @click="uiStore.closeCart()" class="w-9 h-9 rounded-xl hover:bg-muted flex items-center justify-center text-muted-foreground transition-all">
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Items -->
          <div class="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
            <div v-if="cartStore.loading" class="space-y-4">
              <div v-for="i in 3" :key="i" class="flex gap-4">
                <div class="skeleton w-20 h-20 rounded-xl" />
                <div class="flex-1 space-y-2 pt-1">
                  <div class="skeleton h-4 w-full rounded-lg" />
                  <div class="skeleton h-3 w-1/2 rounded-lg" />
                  <div class="skeleton h-4 w-1/4 rounded-lg" />
                </div>
              </div>
            </div>

            <EmptyState
              v-else-if="!cartStore.items.length"
              :title="t('cart.empty')"
              :description="t('cart.empty_desc')"
              :icon="ShoppingCart"
            >
              <router-link to="/products" @click="uiStore.closeCart()" class="btn-secondary btn-sm mt-2">
                {{ t('home.source_now') }}
              </router-link>
            </EmptyState>

            <div
              v-else
              v-for="item in cartStore.items"
              :key="item.product_id"
              class="flex gap-4 p-3 rounded-xl bg-muted/30 border border-border/50"
            >
              <img
                :src="item.image_url || 'https://via.placeholder.com/80?text=?'"
                :alt="item.name || item.title"
                class="w-20 h-20 rounded-xl object-cover flex-shrink-0 border border-border"
              />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-foreground truncate mb-1">{{ item.name || item.title }}</p>
                <p class="text-xs text-muted-foreground mb-2">{{ item.vendor_name }}</p>
                <div class="flex items-center justify-between">
                  <p class="text-sm font-black text-primary dark:text-secondary">
                    {{ formatCurrency(item.price * item.quantity) }}
                  </p>
                  <div class="flex items-center gap-1">
                    <span class="text-xs text-muted-foreground">×{{ item.quantity }}</span>
                    <button
                      @click="cartStore.removeFromCart(item.product_id)"
                      class="w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-all ms-2"
                    >
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div v-if="cartStore.items.length" class="p-6 border-t border-border space-y-4 bg-card">
            <div class="space-y-2">
              <div class="flex items-center justify-between text-sm">
                <span class="text-muted-foreground">{{ t('cart.subtotal') }}</span>
                <span class="font-bold">{{ formatCurrency(cartStore.subtotal) }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-muted-foreground">{{ t('cart.deposit') }} (10%)</span>
                <span class="font-bold text-secondary">{{ formatCurrency(cartStore.deposit) }}</span>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <router-link to="/cart" @click="uiStore.closeCart()" class="btn-outline btn text-center text-sm px-2">
                {{ t('cart.view_cart') }}
              </router-link>
              <router-link to="/checkout" @click="uiStore.closeCart()" class="btn-primary btn text-center text-sm px-2">
                {{ t('cart.checkout') }}
              </router-link>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </teleport>
</template>

<script setup>
import { onMounted } from 'vue';
import { ShoppingCart, X, Trash2 } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';
import { useCartStore } from '@/stores/cart';
import { useUiStore } from '@/stores/ui';
import { useAuthStore } from '@/stores/auth';
import EmptyState from '@/components/ui/EmptyState.vue';
import { formatEGPCurrency } from '@/utils/currency';

const { t, locale } = useI18n();
const cartStore = useCartStore();
const uiStore   = useUiStore();
const authStore = useAuthStore();

const formatCurrency = (val) => formatEGPCurrency(val, locale.value);

onMounted(() => {
  if (authStore.isAuthenticated) cartStore.fetchCart();
});
</script>

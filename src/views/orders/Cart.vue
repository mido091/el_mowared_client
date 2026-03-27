<template>
  <div class="container-narrow py-8">
    <h1 class="text-2xl font-black text-foreground mb-6">{{ t('cart.title') }}</h1>

    <div v-if="cartStore.loading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="card flex gap-4 p-4 skeleton h-24" />
    </div>

    <EmptyState
      v-else-if="!cartStore.items.length"
      :title="t('cart.empty')"
      :description="t('cart.emptyDesc')"
      :icon="ShoppingCart"
    >
      <router-link to="/products" class="btn-secondary btn-sm mt-2">{{ t('home.source_now') }}</router-link>
    </EmptyState>

    <div v-else class="grid lg:grid-cols-3 gap-6">
      <!-- Items -->
      <div class="lg:col-span-2 space-y-6">
        
        <!-- Grouped by Vendor -->
        <div v-for="(group, vendorId) in itemsByVendor" :key="vendorId" class="bg-white dark:bg-card border dark:border-border rounded-xl shadow-sm overflow-hidden">
          
          <div class="px-5 py-3 border-b dark:border-border bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
            <h3 class="font-bold text-foreground flex items-center gap-2">
              <span class="text-lg">📦</span> {{ group.name }}
            </h3>
            <span class="text-sm font-black text-primary">${{ group.subtotal.toFixed(2) }}</span>
          </div>

          <div class="p-5 space-y-5">
            <div v-for="item in group.items" :key="item.product_id" class="flex gap-4">
              <img :src="item.main_image || item.image_url || 'https://via.placeholder.com/80'" :alt="item.name || item.title_en" class="w-20 h-20 rounded-xl object-cover border border-border shrink-0" />
              <div class="flex-1 min-w-0 flex justify-between">
                <div>
                  <p class="font-bold text-foreground mb-1 truncate text-lg">{{ item.name || item.title_en || item.title_ar }}</p>
                  <p class="text-sm font-black text-primary">${{ item.price }} <span class="text-xs text-muted-foreground font-normal ml-1">× {{ item.quantity }}</span></p>
                </div>
                <button @click="cartStore.removeFromCart(item.id)" class="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-all">
                  <Trash2 class="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

        </div>

        <button @click="cartStore.clearCart()" class="text-sm text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1.5 font-medium ml-1">
          <Trash2 class="w-4 h-4" /> {{ t('cart.clearCart') }}
        </button>
      </div>

      <!-- Summary -->
      <div class="card p-5 h-fit sticky top-20">
        <h3 class="font-bold text-foreground mb-4">{{ t('cart.orderSummary') }}</h3>
        <div class="space-y-3 text-sm mb-5">
          <div class="flex justify-between">
            <span class="text-muted-foreground">{{ t('cart.subtotal') }}</span>
            <span class="font-bold">${{ cartStore.subtotal.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between text-secondary">
            <span>{{ t('cart.deposit') }} (10%)</span>
            <span class="font-bold">${{ cartStore.deposit.toFixed(2) }}</span>
          </div>
          <div class="border-t border-border pt-3 flex justify-between">
            <span class="font-bold text-foreground">{{ t('cart.total') }}</span>
            <span class="font-black text-primary dark:text-secondary">${{ cartStore.subtotal.toFixed(2) }}</span>
          </div>
        </div>
        <div class="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs mb-4">
          {{ t('cart.depositNote') }}
        </div>
        <button @click="requestQuotations" :disabled="submitting || cartStore.items.length === 0" class="btn-primary w-full font-bold flex justify-center items-center gap-2 disabled:opacity-50">
          <span v-if="submitting">Processing...</span>
          <span v-else>Request Quotations (Split Cart)</span>
          <ArrowRight v-if="!submitting" class="w-4 h-4 rtl:rotate-180" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ShoppingCart, Trash2, ArrowRight } from 'lucide-vue-next';
import { useCartStore } from '@/stores/cart';
import { useNotificationStore } from '@/stores/notificationStore';
import { normalizeError } from '@/utils/errorHandler';
import api from '@/services/api';
import EmptyState from '@/components/ui/EmptyState.vue';

const { t } = useI18n();
const router = useRouter();
const cartStore = useCartStore();
const notificationStore = useNotificationStore();
const submitting = ref(false);

const itemsByVendor = computed(() => {
  return cartStore.items.reduce((acc, item) => {
    const vid = item.vendor_id || 'unknown';
    if (!acc[vid]) acc[vid] = { name: item.vendor_name || `Vendor #${vid}`, items: [], subtotal: 0 };
    acc[vid].items.push(item);
    acc[vid].subtotal += (item.price * item.quantity);
    return acc;
  }, {});
});

const requestQuotations = async () => {
  submitting.value = true;
  try {
    await api.post('/cart/checkout');
    await cartStore.fetchCart();
    notificationStore.success(
      t('cart.quoteRequestSuccess') || 'Quotations requested successfully! Separate chat threads have been created with each vendor.'
    );
    router.push('/chat');
  } catch (err) {
    notificationStore.error(
      normalizeError(err).message || {
        en: 'Failed to request quotations.',
        ar: 'تعذر إرسال طلبات التسعير.'
      }
    );
  } finally {
    submitting.value = false;
  }
};

onMounted(() => cartStore.fetchCart());
</script>

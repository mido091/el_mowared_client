<template>
  <div class="container-narrow py-8">
    <h1 class="text-2xl font-black text-foreground mb-6">{{ t('checkout.title') }}</h1>

    <div v-if="!cartStore.items.length">
      <EmptyState :title="t('cart.empty')" :icon="ShoppingCart">
        <router-link to="/products" class="btn-secondary btn-sm mt-2">{{ t('home.source_now') }}</router-link>
      </EmptyState>
    </div>

    <div v-else class="grid lg:grid-cols-2 gap-8">
      <!-- Order Summary -->
      <div>
        <div class="card p-5 mb-5">
          <h3 class="font-bold text-foreground mb-4">{{ t('cart.orderSummary') }}</h3>
          <div class="space-y-2 mb-4">
            <div v-for="item in cartStore.items" :key="item.product_id" class="flex items-center gap-3 text-sm">
              <img :src="item.image_url || item.main_image" class="w-10 h-10 rounded-lg object-cover border border-border shrink-0" />
              <span class="flex-1 text-foreground font-medium truncate">{{ item.name }} ×{{ item.quantity }}</span>
              <span class="font-bold shrink-0">${{ (item.price * item.quantity).toFixed(2) }}</span>
            </div>
          </div>
          <div class="border-t border-border pt-4 space-y-2 text-sm">
            <div class="flex justify-between"><span>{{ t('cart.subtotal') }}</span><span class="font-bold">${{ cartStore.subtotal.toFixed(2) }}</span></div>
            <div class="flex justify-between text-secondary"><span>{{ t('cart.deposit') }} (10%)</span><span class="font-black text-xl">${{ cartStore.deposit.toFixed(2) }}</span></div>
          </div>
        </div>

        <!-- Bank info -->
        <div class="card p-5" v-if="settingsStore.bankName">
          <h3 class="font-bold text-foreground mb-3">{{ t('checkout.bankDetails') }}</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between"><span class="text-muted-foreground">{{ t('checkout.bank') }}</span><span class="font-bold">{{ settingsStore.bankName }}</span></div>
            <div class="flex justify-between"><span class="text-muted-foreground">{{ t('checkout.account') }}</span><span class="font-bold font-mono" dir="ltr">{{ settingsStore.accountNumber }}</span></div>
            <div class="flex justify-between"><span class="text-muted-foreground">{{ t('checkout.amount') }}</span><span class="font-black text-secondary">${{ cartStore.deposit.toFixed(2) }}</span></div>
          </div>
        </div>
      </div>

      <!-- Receipt Upload + Submit -->
      <div class="card p-5 space-y-5">
        <h3 class="font-bold text-foreground">{{ t('checkout.uploadReceipt') }}</h3>
        <p class="text-sm text-muted-foreground">{{ t('checkout.uploadNote') }}</p>

        <!-- File Drop Zone -->
        <div
          @dragover.prevent="isDragging = true"
          @dragleave="isDragging = false"
          @drop.prevent="handleDrop"
          :class="[
            'border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all',
            isDragging ? 'border-secondary bg-secondary/5' : 'border-border hover:border-secondary/50 hover:bg-muted/30',
          ]"
          @click="$refs.fileInput.click()"
        >
          <input ref="fileInput" type="file" class="hidden" accept="image/*,.pdf" @change="handleFile" />
          <div v-if="!preview" class="flex flex-col items-center gap-3">
            <Upload class="w-10 h-10 text-muted-foreground/50" />
            <p class="text-sm font-semibold text-foreground">{{ t('checkout.dropOrClick') }}</p>
            <p class="text-xs text-muted-foreground">JPG, PNG, PDF — max 5MB</p>
          </div>
          <div v-else class="relative">
            <img :src="preview" class="max-h-48 mx-auto rounded-xl object-contain" />
            <button @click.stop="preview=null;receiptFile=null" class="absolute top-1 end-1 w-7 h-7 bg-red-500 text-white rounded-lg flex items-center justify-center">
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Submit Button -->
        <button
          @click="handleCheckout"
          :disabled="!receiptFile || submitting"
          class="btn-primary w-full h-12 font-bold text-base"
        >
          <svg v-if="submitting" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          {{ submitting ? t('common.submitting') : t('checkout.placeOrder') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Upload, X, ShoppingCart } from 'lucide-vue-next';
import api from '@/services/api';
import { useCartStore }     from '@/stores/cart';
import { useSettingsStore } from '@/stores/settings';
import { useNotificationStore } from '@/stores/notificationStore';
import { normalizeError } from '@/utils/errorHandler';
import EmptyState from '@/components/ui/EmptyState.vue';
import { getApiData } from '@/utils/apiResponse';

const { t }  = useI18n();
const router = useRouter();
const cartStore     = useCartStore();
const settingsStore = useSettingsStore();
const notificationStore = useNotificationStore();

const receiptFile = ref(null);
const preview     = ref(null);
const isDragging  = ref(false);
const submitting  = ref(false);

const handleFile = (e) => {
  const f = e.target.files?.[0];
  if (!f) return;
  receiptFile.value = f;
  if (f.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (ev) => { preview.value = ev.target.result; };
    reader.readAsDataURL(f);
  } else {
    preview.value = null;
  }
};

const handleDrop = (e) => {
  isDragging.value = false;
  const f = e.dataTransfer.files?.[0];
  if (f) { const fakeEvt = { target: { files: [f] } }; handleFile(fakeEvt); }
};

const handleCheckout = async () => {
  submitting.value = true;
  try {
    // Step 1: Create orders with mandatory payment method for B2B contract
    const orderRes = await api.post('/orders/checkout', {
      paymentMethod: 'INSTAPAY'
    });
    
    const orderIds = getApiData(orderRes)?.orderIds || [];

    // Step 2: Upload receipt for each order in the split
    if (receiptFile.value && orderIds.length) {
      for (const orderId of orderIds) {
        const fd = new FormData();
        fd.append('receipt', receiptFile.value);
        await api.post(`/orders/${orderId}/receipt`, fd, { 
          headers: { 'Content-Type': 'multipart/form-data' } 
        });
      }
    }
    
    await cartStore.clearCart();
    notificationStore.success(t('checkout.success'));
    router.push('/order-success');
  } catch (err) {
    notificationStore.error(normalizeError(err).message || t('common.error_occurred'));
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  cartStore.fetchCart();
  settingsStore.fetch();
});
</script>

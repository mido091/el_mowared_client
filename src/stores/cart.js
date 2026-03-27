import { defineStore } from 'pinia';
import api from '@/services/api';
import { useUiStore } from '@/stores/ui';
import { getApiCollection } from '@/utils/apiResponse';
import { normalizeError } from '@/utils/errorHandler';

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    loading: false,
    success: false,
    error: null,
  }),

  getters: {
    totalItems: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal:   (state) => state.items.reduce((sum, item) => sum + (parseFloat(item.price || 0) * item.quantity), 0),
    deposit:    (state) => state.items.reduce((sum, item) => sum + (parseFloat(item.price || 0) * item.quantity * 0.1), 0),
  },

  actions: {
    async fetchCart() {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.get('/cart');
        this.items = getApiCollection(res);
        this.success = true;
      } catch (err) {
        this.error = normalizeError(err).message;
      } finally {
        this.loading = false;
      }
    },

    async addToCart(productId, quantity = 1) {
      const ui = useUiStore();
      try {
        const res = await api.post('/cart', { productId, quantity });
        const items = getApiCollection(res);
        if (items.length) this.items = items;
        ui.showToast({ en: 'Added to cart.', ar: 'تمت إضافة المنتج إلى السلة.' }, 'success');
      } catch (e) {
        ui.showToast(normalizeError(e).message, 'error');
      }
    },

    async updateQuantity(productId, quantity) {
      try {
        const res = await api.put(`/cart/${productId}`, { quantity });
        const items = getApiCollection(res);
        if (items.length || quantity === 0) this.items = items;
      } catch (err) {
        this.error = normalizeError(err).message;
        console.error('Update quantity failed', err);
      }
    },

    async removeFromCart(productId) {
      try {
        const res = await api.delete(`/cart/${productId}`);
        const items = getApiCollection(res);
        this.items = items;
      } catch (e) {
        this.error = normalizeError(e).message;
        this.items = this.items.filter(i => i.product_id !== productId);
      }
    },

    async clearCart() {
      try {
        // Backend router.delete('/') in cartRoutes.js
        await api.delete('/cart'); 
        this.items = [];
        this.success = true;
      } catch (e) {
        this.error = normalizeError(e).message;
        console.error('clearCart', e);
      }
    }
  },
});

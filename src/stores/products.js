import { defineStore } from 'pinia';
import api from '@/services/api';
import { useCache } from '@/composables/useCache';
import { getApiCollection } from '@/utils/apiResponse';
import { normalizeError } from '@/utils/errorHandler';

export const useProductsStore = defineStore('products', {
  state: () => ({
    products: [],
    recentProducts: [],
    featuredProducts: [],
    loading: false,
    error: null,
    success: false,
  }),

  actions: {
    async fetchProducts(params = {}) {
      const { getItem, setItem } = useCache();
      const cached = getItem('products', params);

      if (cached) {
        this.products = cached.data;
        if (!cached.isStale) return;
      }

      this.loading = true;
      this.error = null;
      try {
        const res = await api.get('/products', { params });
        const data = getApiCollection(res);
        this.products = data;
        this.success = true;
        setItem('products', data, params);
      } catch (err) {
        this.error = normalizeError(err).message;
      } finally {
        this.loading = false;
      }
    },

    async fetchFeatured(params = {}) {
      const { getItem, setItem } = useCache();
      const cached = getItem('featured-products');

      if (cached) {
        this.featuredProducts = cached.data;
        if (!cached.isStale) return;
      }

      try {
        const res = await api.get('/products', { params: { limit: 8, ...params } });
        const data = getApiCollection(res);
        this.featuredProducts = data;
        setItem('featured-products', data);
      } catch (err) {
        this.error = normalizeError(err).message;
      }
    }
  }
});

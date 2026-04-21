import { defineStore } from 'pinia';
import api from '@/services/api';
import { useCache } from '@/composables/useCache';
import { getApiCollection } from '@/utils/apiResponse';
import { normalizeError } from '@/utils/errorHandler';
import { createDomainSync } from '@/utils/domainSync';

const productSync = createDomainSync('products');

// The product store mixes API fetching with lightweight cache invalidation so
// marketplace pages stay responsive while still reacting to realtime product changes.
export const useProductsStore = defineStore('products', {
  state: () => ({
    products: [],
    recentProducts: [],
    featuredProducts: [],
    loading: false,
    error: null,
    success: false,
    syncReady: false,
    revision: 0,
    lastParams: {},
  }),

  actions: {
    ensureSync() {
      if (this.syncReady || typeof window === 'undefined') return;

      productSync.ensure();
      productSync.subscribe((payload = {}) => {
        // Revisions prevent an older event from overwriting fresher local state after rapid updates.
        const incomingRevision = Number(payload.revision || 0);
        if (incomingRevision && incomingRevision <= Number(this.revision || 0)) return;
        this.revision = incomingRevision;
        const { invalidate } = useCache();
        invalidate('products');
        invalidate('featured-products');
        if (this.success || this.products.length || Object.keys(this.lastParams || {}).length) {
          this.fetchProducts(this.lastParams).catch(() => {});
          this.fetchFeatured().catch(() => {});
        }
      });

      this.syncReady = true;
    },

    async fetchProducts(params = {}) {
      this.ensureSync();
      this.lastParams = { ...params };
      const { getItem, setItem } = useCache();
      const cached = getItem('products', params);

      if (cached) {
        this.products = cached.data;
        // Return immediately for fresh cache entries but still background-refresh stale ones.
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
      this.ensureSync();
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

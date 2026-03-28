import { defineStore } from 'pinia';
import api from '@/services/api';
import { getApiData, getApiEnvelope } from '@/utils/apiResponse';
import { normalizeError } from '@/utils/errorHandler';
import { useCache } from '@/composables/useCache';
import { createDomainSync } from '@/utils/domainSync';

const PRODUCT_STALE_MS = 1000 * 60 * 5;
const productSync = createDomainSync('products');

let activeFetchPromise = null;
let activeFetchKey = '';

export const useVendorProductsStore = defineStore('vendorProducts', {
  state: () => ({
    products: [],
    loading: false,
    error: null,
    fieldErrors: {},
    success: false,
    pagination: {
      total: 0,
      page: 1,
      limit: 10
    },
    lastFetched: null,
    lastQueryKey: '',
    revision: 0,
    syncReady: false,
    filters: {
      search: '',
      lifecycleStatus: '',
      category: ''
    }
  }),

  actions: {
    extractPayload(response) {
      return getApiData(response);
    },

    extractProduct(response) {
      const payload = this.extractPayload(response);
      return payload?.product || payload?.item || payload || null;
    },

    replaceProductInList(productId, nextProduct) {
      const index = this.products.findIndex((item) => item.id === productId);
      if (index === -1) return;

      this.products.splice(index, 1, {
        ...this.products[index],
        ...nextProduct
      });
    },

    ensureSync() {
      if (this.syncReady || typeof window === 'undefined') return;

      productSync.ensure();
      productSync.subscribe((payload = {}) => {
        const incomingRevision = Number(payload.revision || 0);
        if (incomingRevision && incomingRevision <= Number(this.revision || 0)) return;
        this.revision = incomingRevision;
        this.lastFetched = null;
        this.fetchVendorProducts({ mode: 'fresh', silent: true }).catch(() => {});
      });

      const syncFromRevision = () => {
        const storedRevision = productSync.getStoredRevision();
        if (storedRevision > Number(this.revision || 0)) {
          this.revision = storedRevision;
          this.lastFetched = null;
          this.fetchVendorProducts({ mode: 'fresh', silent: true }).catch(() => {});
        }
      };

      window.addEventListener('focus', syncFromRevision);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') syncFromRevision();
      });

      this.syncReady = true;
      syncFromRevision();
    },

    invalidateProducts(reason = 'updated') {
      this.lastFetched = null;
      this.revision = productSync.publish(reason);
    },

    async fetchVendorProducts(options = {}) {
      this.ensureSync();
      const mode = options.mode || 'cached';
      const silent = Boolean(options.silent);
      const fetchKey = JSON.stringify({
        mode,
        page: this.pagination.page,
        limit: this.pagination.limit,
        search: this.filters.search,
        lifecycleStatus: this.filters.lifecycleStatus,
        category: this.filters.category,
      });
      const dataKey = JSON.stringify({
        page: this.pagination.page,
        limit: this.pagination.limit,
        search: this.filters.search,
        lifecycleStatus: this.filters.lifecycleStatus,
        category: this.filters.category,
      });
      const hasData = this.products.length > 0 && this.lastQueryKey === dataKey;
      const isFreshEnough =
        hasData &&
        this.lastFetched &&
        this.lastQueryKey === dataKey &&
        Date.now() - this.lastFetched < PRODUCT_STALE_MS;

      if (mode === 'cached' && isFreshEnough) return this.products;
      if (mode === 'revalidate' && hasData) {
        this.fetchVendorProducts({ mode: 'fresh', silent: true }).catch(() => {});
        return this.products;
      }

      if (activeFetchPromise && activeFetchKey === fetchKey) return activeFetchPromise;

      if (!silent) this.loading = true;
      this.error = null;
      this.fieldErrors = {};

      activeFetchPromise = (async () => {
        try {
          activeFetchKey = fetchKey;
          const params = {
            page: this.pagination.page,
            limit: this.pagination.limit
          };

          if (this.filters.search) params.search = this.filters.search;
          if (this.filters.lifecycleStatus) params.lifecycleStatus = this.filters.lifecycleStatus;
          if (this.filters.category) params.category = this.filters.category;
          if (mode === 'fresh' || (mode === 'revalidate' && !hasData)) {
            params.fresh = 1;
            params._ = Date.now();
          }

          const response = await api.get('/products/vendor/catalog/mine', { params, errorMode: 'silent' });
          const resData = this.extractPayload(response) || {};

          this.products = resData.items || resData.products || [];
          this.pagination.total = resData.pagination?.totalItems || resData.total || this.products.length;
          this.lastFetched = Date.now();
          this.lastQueryKey = dataKey;
          this.revision = Math.max(this.revision || 0, this.lastFetched);
          this.success = true;
          return this.products;
        } catch (err) {
          const normalized = normalizeError(err);
          this.error = normalized.message;
          this.fieldErrors = normalized.fields;
          console.error(err);
        } finally {
          if (!silent) this.loading = false;
          activeFetchPromise = null;
          activeFetchKey = '';
        }
      })();

      return activeFetchPromise;
    },

    async createProduct(productData, optimisticProduct = null) {
      this.loading = true;
      this.error = null;
      this.fieldErrors = {};

      const tempId = `temp-${Date.now()}`;
      const previousProducts = [...this.products];
      const previousTotal = this.pagination.total;

      if (optimisticProduct) {
        this.products.unshift({
          ...optimisticProduct,
          id: tempId,
          optimistic: true
        });
        this.pagination.total += 1;
      }

      try {
        const { clearCache } = useCache();
        const response = await api.post('/products', productData, { errorMode: 'inline' });
        const createdProduct = this.extractProduct(response);
        clearCache();

        if (createdProduct) {
          const tempIndex = this.products.findIndex((item) => item.id === tempId);
          if (tempIndex !== -1) {
            this.products.splice(tempIndex, 1, createdProduct);
          } else {
            this.products.unshift(createdProduct);
          }
        } else {
          await this.fetchVendorProducts();
        }

        if (this.pagination.page === 1) {
          await this.fetchVendorProducts();
        }
        this.invalidateProducts('created');

        return response;
      } catch (err) {
        this.products = previousProducts;
        this.pagination.total = previousTotal;
        const normalized = normalizeError(err);
        this.error = normalized.message;
        this.fieldErrors = normalized.fields;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updateProduct(id, productData, optimisticProduct = null) {
      this.loading = true;
      this.error = null;
      this.fieldErrors = {};

      const index = this.products.findIndex((item) => item.id === id);
      const previousProduct = index !== -1 ? { ...this.products[index] } : null;

      if (index !== -1 && optimisticProduct) {
        this.products.splice(index, 1, {
          ...this.products[index],
          ...optimisticProduct,
          optimistic: true
        });
      }

      try {
        const { clearCache } = useCache();
        const response = await api.put(`/products/${id}`, productData, { errorMode: 'inline' });
        const updatedProduct = this.extractProduct(response);
        clearCache();

        if (updatedProduct) {
          this.replaceProductInList(id, { ...updatedProduct, optimistic: false });
        } else if (optimisticProduct) {
          this.replaceProductInList(id, { ...optimisticProduct, optimistic: false });
        } else {
          await this.fetchVendorProducts();
        }

        await this.fetchVendorProducts();
        this.invalidateProducts('updated');

        return response;
      } catch (err) {
        if (index !== -1 && previousProduct) {
          this.products.splice(index, 1, previousProduct);
        }
        const normalized = normalizeError(err);
        this.error = normalized.message;
        this.fieldErrors = normalized.fields;
        console.error('[vendorProductsStore.updateProduct] API error', {
          status: normalized.status,
          message: normalized.message,
          data: err?.response?.data,
          requestPayload: getApiEnvelope(productData)
        });
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async deleteProduct(id) {
      this.loading = true;
      this.error = null;
      this.fieldErrors = {};

      const previousProducts = [...this.products];
      const previousTotal = this.pagination.total;
      this.products = this.products.filter((item) => item.id !== id);
      this.pagination.total = Math.max(0, this.pagination.total - 1);

      try {
        const { clearCache } = useCache();
        await api.delete(`/products/${id}`);
        clearCache();
        await this.fetchVendorProducts();
        this.invalidateProducts('deleted');
      } catch (err) {
        this.products = previousProducts;
        this.pagination.total = previousTotal;
        const normalized = normalizeError(err);
        this.error = normalized.message;
        this.fieldErrors = normalized.fields;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async bulkDelete(ids) {
      this.loading = true;
      try {
        const { clearCache } = useCache();
        await api.post('/products/bulk-delete', { ids });
        clearCache();
        await this.fetchVendorProducts();
        this.invalidateProducts('bulk-deleted');
      } catch (err) {
        const normalized = normalizeError(err);
        this.error = normalized.message;
        this.fieldErrors = normalized.fields;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fetchProductHistory(productId) {
      try {
        const response = await api.get(`/products/${productId}/history`);
        return this.extractPayload(response) || [];
      } catch (err) {
        console.error('Failed to fetch product history:', err);
        return [];
      }
    },

    async toggleStatus() {
      throw new Error('Lifecycle status is managed by moderation, not inline toggles.');
    },

    setPage(page) {
      this.pagination.page = page;
      this.fetchVendorProducts();
    },

    setFilter(key, value) {
      this.filters[key] = value;
      this.pagination.page = 1;
      this.fetchVendorProducts();
    },

    reset() {
      this.products = [];
      this.loading = false;
      this.error = null;
      this.success = false;
      this.pagination = { total: 0, page: 1, limit: 10 };
      this.lastFetched = null;
      this.lastQueryKey = '';
      this.filters = { search: '', lifecycleStatus: '', category: '' };
    }
  }
});

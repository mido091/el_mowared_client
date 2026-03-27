import { defineStore } from 'pinia';
import api from '@/services/api';
import { getApiData, getApiEnvelope } from '@/utils/apiResponse';
import { normalizeError } from '@/utils/errorHandler';

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

    async fetchVendorProducts() {
      this.loading = true;
      this.error = null;
      this.fieldErrors = {};

      try {
        const params = {
          page: this.pagination.page,
          limit: this.pagination.limit
        };

        if (this.filters.search) params.search = this.filters.search;
        if (this.filters.lifecycleStatus) params.lifecycleStatus = this.filters.lifecycleStatus;
        if (this.filters.category) params.category = this.filters.category;

        const response = await api.get('/products/vendor/catalog/mine', { params, errorMode: 'silent' });
        const resData = this.extractPayload(response) || {};

        this.products = resData.items || resData.products || [];
        this.pagination.total = resData.pagination?.totalItems || resData.total || this.products.length;
        this.success = true;
      } catch (err) {
        const normalized = normalizeError(err);
        this.error = normalized.message;
        this.fieldErrors = normalized.fields;
        console.error(err);
      } finally {
        this.loading = false;
      }
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
        const response = await api.post('/products', productData, { errorMode: 'inline' });
        const createdProduct = this.extractProduct(response);

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
        const response = await api.put(`/products/${id}`, productData, { errorMode: 'inline' });
        const updatedProduct = this.extractProduct(response);

        if (updatedProduct) {
          this.replaceProductInList(id, { ...updatedProduct, optimistic: false });
        } else if (optimisticProduct) {
          this.replaceProductInList(id, { ...optimisticProduct, optimistic: false });
        } else {
          await this.fetchVendorProducts();
        }

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
        await api.delete(`/products/${id}`);
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
        await api.post('/products/bulk-delete', { ids });
        await this.fetchVendorProducts();
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
      this.filters = { search: '', lifecycleStatus: '', category: '' };
    }
  }
});

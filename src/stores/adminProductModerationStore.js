import { defineStore } from 'pinia';
import api from '@/services/api';
import { getApiData } from '@/utils/apiResponse';
import { normalizeError } from '@/utils/errorHandler';

export const useAdminProductModerationStore = defineStore('adminProductModeration', {
  state: () => ({
    products: [],
    summaryProducts: [],
    loading: false,
    detailLoading: false,
    error: null,
    activeTab: 'PENDING',
    total: 0,
    productDetails: {},
  }),

  getters: {
    statusCounts: (state) => {
      const counts = {
        pending: 0,
        approved: 0,
        rejected: 0,
      };

      state.summaryProducts.forEach((product) => {
        const normalized = `${product.lifecycle_status || product.status || ''}`.toUpperCase();
        if (normalized === 'APPROVED') counts.approved += 1;
        else if (normalized === 'REJECTED') counts.rejected += 1;
        else if (normalized === 'PENDING' || normalized === 'UPDATE_PENDING') counts.pending += 1;
      });

      return counts;
    },

    groupedByVendor: (state) => {
      const groups = new Map();

      state.products.forEach((product) => {
        const vendorKey = `${product.vendor_id || 'vendor'}-${product.company_name_en || product.company_name_ar || 'unknown'}`;
        if (!groups.has(vendorKey)) {
          groups.set(vendorKey, {
            key: vendorKey,
            vendorId: product.vendor_id,
            vendorNameAr: product.company_name_ar || product.company_name_en || 'Vendor',
            vendorNameEn: product.company_name_en || product.company_name_ar || 'Vendor',
            vendorLogo: product.vendor_logo || null,
            products: [],
          });
        }

        groups.get(vendorKey).products.push(product);
      });

      return Array.from(groups.values()).map((group) => ({
        ...group,
        pendingCount: group.products.filter((product) => ['PENDING', 'UPDATE_PENDING'].includes((product.lifecycle_status || product.status || '').toUpperCase())).length,
      }));
    },
  },

  actions: {
    async fetchSummary() {
      try {
        const response = await api.get('/admin/products', {
          params: { limit: 500, page: 1 }
        });
        const data = getApiData(response) || {};
        this.summaryProducts = data.items || data.products || [];
      } catch (error) {
        console.error('Failed to fetch moderation summary', error);
      }
    },

    async fetchProducts(tab = this.activeTab) {
      this.loading = true;
      this.error = null;
      this.activeTab = tab;

      try {
        const params = { limit: 100, page: 1 };
        let endpoint = '/admin/products';

        if (tab === 'PENDING') {
          endpoint = '/admin/products/pending';
        } else {
          params.lifecycleStatus = tab;
        }

        const response = await api.get(endpoint, { params });
        const data = getApiData(response) || {};
        this.products = data.items || data.products || [];
        this.total = data.pagination?.totalItems || data.total || this.products.length;
      } catch (error) {
        this.error = normalizeError(error).message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchProductDetail(productId) {
      if (this.productDetails[productId]) {
        return this.productDetails[productId];
      }

      this.detailLoading = true;
      try {
        const response = await api.get(`/admin/products/${productId}`);
        const data = getApiData(response);
        this.productDetails[productId] = data;
        return data;
      } finally {
        this.detailLoading = false;
      }
    },

    async reviewProduct({ productId, status, rejection_reason }) {
      const previousProducts = [...this.products];
      const previousSummary = [...this.summaryProducts];
      const normalizedStatus = `${status}`.toUpperCase();

      this.products = this.products
        .map((product) => (
          product.id === productId
            ? { ...product, status: normalizedStatus, lifecycle_status: normalizedStatus, rejection_reason: rejection_reason || null }
            : product
        ))
        .filter((product) => this.activeTab !== 'PENDING' || product.id !== productId);

      this.summaryProducts = this.summaryProducts.map((product) => (
        product.id === productId
          ? { ...product, status: normalizedStatus, lifecycle_status: normalizedStatus, rejection_reason: rejection_reason || null }
          : product
      ));

      if (this.activeTab === 'PENDING') {
        this.total = Math.max(0, this.total - 1);
      }

      try {
        const payload = { status };
        if (rejection_reason) {
          payload.rejection_reason = rejection_reason;
        }

        const response = await api.put(`/admin/products/${productId}/status`, payload);
        const updated = getApiData(response);

        this.productDetails[productId] = updated;

        if (this.activeTab !== 'PENDING') {
          this.products = this.products.map((product) => (
            product.id === productId
              ? { ...product, ...updated }
              : product
          ));
        }

        return updated;
      } catch (error) {
        this.products = previousProducts;
        this.summaryProducts = previousSummary;
        this.total = previousProducts.length;
        throw error;
      }
    },
  },
});

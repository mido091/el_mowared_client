import { defineStore } from 'pinia';
import api from '@/services/api';
import { getApiData } from '@/utils/apiResponse';
import { normalizeError } from '@/utils/errorHandler';
import { useCache } from '@/composables/useCache';
import { createDomainSync } from '@/utils/domainSync';

const PRODUCT_STALE_MS = 1000 * 60 * 5;
const productSync = createDomainSync('products');

let activeProductsFetch = null;
let activeSummaryFetch = null;
let activeProductsFetchKey = '';

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
    lastFetched: null,
    summaryLastFetched: null,
    revision: 0,
    syncReady: false,
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
    ensureSync() {
      if (this.syncReady || typeof window === 'undefined') return;

      productSync.ensure();
      productSync.subscribe((payload = {}) => {
        const incomingRevision = Number(payload.revision || 0);
        if (incomingRevision && incomingRevision <= Number(this.revision || 0)) return;
        this.revision = incomingRevision;
        this.lastFetched = null;
        this.summaryLastFetched = null;
        Promise.allSettled([
          this.fetchProducts(this.activeTab, { mode: 'fresh', silent: true }),
          this.fetchSummary({ mode: 'fresh' }),
        ]);
      });

      const syncFromRevision = () => {
        const storedRevision = productSync.getStoredRevision();
        if (storedRevision > Number(this.revision || 0)) {
          this.revision = storedRevision;
          this.lastFetched = null;
          this.summaryLastFetched = null;
          Promise.allSettled([
            this.fetchProducts(this.activeTab, { mode: 'fresh', silent: true }),
            this.fetchSummary({ mode: 'fresh' }),
          ]);
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
      this.summaryLastFetched = null;
      this.revision = productSync.publish(reason);
    },

    async fetchSummary(options = {}) {
      this.ensureSync();
      const mode = options.mode || 'cached';
      const hasData = this.summaryProducts.length > 0;
      const isFreshEnough = hasData && this.summaryLastFetched && Date.now() - this.summaryLastFetched < PRODUCT_STALE_MS;

      if (mode === 'cached' && isFreshEnough) return this.summaryProducts;
      if (mode === 'revalidate' && hasData) {
        this.fetchSummary({ mode: 'fresh' }).catch(() => {});
        return this.summaryProducts;
      }

      if (activeSummaryFetch) return activeSummaryFetch;

      activeSummaryFetch = (async () => {
      try {
        const response = await api.get('/admin/products', {
          params: {
            limit: 500,
            page: 1,
            ...((mode === 'fresh' || (mode === 'revalidate' && !hasData)) ? { fresh: 1, _: Date.now() } : {}),
          }
        });
        const data = getApiData(response) || {};
        this.summaryProducts = data.items || data.products || [];
        this.summaryLastFetched = Date.now();
        this.revision = Math.max(this.revision || 0, this.summaryLastFetched);
        return this.summaryProducts;
      } catch (error) {
        console.error('Failed to fetch moderation summary', error);
        throw error;
      } finally {
        activeSummaryFetch = null;
      }
      })();

      return activeSummaryFetch;
    },

    async fetchProducts(tab = this.activeTab, options = {}) {
      this.ensureSync();
      const mode = options.mode || 'cached';
      const silent = Boolean(options.silent);
      const hasData = this.products.length > 0 && tab === this.activeTab;
      const isFreshEnough = hasData && this.lastFetched && Date.now() - this.lastFetched < PRODUCT_STALE_MS && tab === this.activeTab;

      if (mode === 'cached' && isFreshEnough) return this.products;
      if (mode === 'revalidate' && hasData) {
        this.fetchProducts(tab, { mode: 'fresh', silent: true }).catch(() => {});
        return this.products;
      }

      if (!silent) this.loading = true;
      this.error = null;
      this.activeTab = tab;

      const fetchKey = JSON.stringify({ tab, mode });
      if (activeProductsFetch && activeProductsFetchKey === fetchKey) return activeProductsFetch;

      activeProductsFetch = (async () => {
        try {
          activeProductsFetchKey = fetchKey;
          const params = { limit: 100, page: 1 };
          let endpoint = '/admin/products';

          if (tab === 'PENDING') {
            endpoint = '/admin/products/pending';
          } else {
            params.lifecycleStatus = tab;
          }
          if (mode === 'fresh' || (mode === 'revalidate' && !hasData)) {
            params.fresh = 1;
            params._ = Date.now();
          }

          const response = await api.get(endpoint, { params });
          const data = getApiData(response) || {};
          this.products = data.items || data.products || [];
          this.total = data.pagination?.totalItems || data.total || this.products.length;
          this.lastFetched = Date.now();
          this.revision = Math.max(this.revision || 0, this.lastFetched);
          return this.products;
        } catch (error) {
          this.error = normalizeError(error).message;
          throw error;
        } finally {
          if (!silent) this.loading = false;
          activeProductsFetch = null;
          activeProductsFetchKey = '';
        }
      })();

      return activeProductsFetch;
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
      const { clearCache } = useCache();
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
        clearCache();

        this.productDetails[productId] = updated;

        if (this.activeTab !== 'PENDING') {
          this.products = this.products.map((product) => (
            product.id === productId
              ? { ...product, ...updated }
              : product
          ));
        }

        await this.fetchSummary();
        if (this.activeTab === 'PENDING') {
          await this.fetchProducts(this.activeTab);
        }
        this.invalidateProducts(`review-${normalizedStatus.toLowerCase()}`);

        return updated;
      } catch (error) {
        this.products = previousProducts;
        this.summaryProducts = previousSummary;
        this.total = previousProducts.length;
        throw error;
      }
    },

    async deleteRejectedProduct(productId) {
      const previousProducts = [...this.products];
      const previousSummary = [...this.summaryProducts];
      const previousDetails = { ...this.productDetails };

      this.products = this.products.filter((product) => Number(product.id) !== Number(productId));
      this.summaryProducts = this.summaryProducts.filter((product) => Number(product.id) !== Number(productId));
      delete this.productDetails[productId];

      try {
        await api.delete(`/admin/products/${productId}`);
        this.invalidateProducts('admin-delete-product');
      } catch (error) {
        this.products = previousProducts;
        this.summaryProducts = previousSummary;
        this.productDetails = previousDetails;
        throw error;
      }
    },
  },
});

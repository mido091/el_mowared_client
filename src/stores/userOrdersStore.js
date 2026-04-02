import { defineStore } from 'pinia';
import api from '@/services/api';
import { getApiCollection, getApiData } from '@/utils/apiResponse';
import { normalizeError } from '@/utils/errorHandler';

export const useUserOrdersStore = defineStore('userOrders', {
  state: () => ({
    orders: [],
    loading: false,
    error: null,
    activeStatus: 'ALL',
    page: 1,
    totalPages: 1,
  }),

  actions: {
    async fetchOrders(options = {}) {
      const { silent = false, fresh = false } = options;
      if (!silent) this.loading = true;
      this.error = null;

      try {
        const response = await api.get('/orders', {
          params: {
            status: this.activeStatus !== 'ALL' ? this.activeStatus : undefined,
            page: this.page,
            ...(fresh ? { fresh: 1, _: Date.now() } : {}),
          },
          errorMode: 'silent',
        });

        this.orders = getApiCollection(response, ['orders', 'items']);
        const payload = getApiData(response) || {};
        this.totalPages = Number(payload?.pagination?.total_pages || payload?.pagination?.totalPages || 1);
        return this.orders;
      } catch (error) {
        this.error = normalizeError(error).message;
        throw error;
      } finally {
        if (!silent) this.loading = false;
      }
    },

    setStatus(status) {
      this.activeStatus = status;
      this.page = 1;
    },

    setPage(page) {
      this.page = page;
    },
  },
});

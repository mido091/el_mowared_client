import { defineStore } from 'pinia';
import api from '@/services/api';
import { getApiCollection, getApiData } from '@/utils/apiResponse';
import { normalizeError } from '@/utils/errorHandler';

export const useVendorOrdersStore = defineStore('vendorOrders', {
  state: () => ({
    orders: [],
    loading: false,
    error: null,
    success: false,
    pagination: {
      total: 0,
      page: 1,
      limit: 10
    },
    filters: {
      status: '',
      search: ''
    }
  }),

  actions: {
    async fetchVendorOrders() {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.get('/orders', {
          params: {
            page: this.pagination.page,
            limit: this.pagination.limit,
            ...this.filters
          }
        });
        const resData = getApiData(response) || {};
        this.orders = getApiCollection(response, ['orders', 'items']);
        this.pagination.total = resData.total || this.orders.length;
        this.success = true;
      } catch (err) {
        this.error = normalizeError(err).message;
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

    async updateOrderStatus(orderId, status) {
      this.loading = true;
      try {
        await api.patch(`/orders/${orderId}/status`, { status });
        await this.fetchVendorOrders();
      } catch (err) {
        this.error = normalizeError(err).message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async uploadReceipt(orderId, formData) {
      this.loading = true;
      try {
        await api.post(`/orders/${orderId}/receipt`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        await this.fetchVendorOrders();
      } catch (err) {
        this.error = normalizeError(err).message;
        throw err;
      } finally {
        this.loading = false;
      }
    }
  }
});

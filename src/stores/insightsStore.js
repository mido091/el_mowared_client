import { defineStore } from 'pinia';
import api from '@/services/api';
import { getApiCollection, getApiData } from '@/utils/apiResponse';

export const useInsightsStore = defineStore('insights', {
  state: () => ({
    stockAlerts: [],
    marketTrends: null,
    loading: false,
    error: null
  }),

  actions: {
    async fetchStockAlerts() {
      this.loading = true;
      try {
        const res = await api.get('/vendor/sales-review');
        const data = getApiData(res) || {};
        this.stockAlerts = Array.isArray(data.lowStock) ? data.lowStock : [];
      } catch (err) {
        console.error('Failed to fetch stock alerts', err);
        this.stockAlerts = [];
      } finally {
        this.loading = false;
      }
    },

    async fetchMarketInsights() {
      this.loading = true;
      try {
        const res = await api.get('/vendor/stats');
        this.marketTrends = getApiData(res) || {};
      } catch (err) {
        console.error('Failed to fetch market insights', err);
        this.marketTrends = null;
      } finally {
        this.loading = false;
      }
    }
  }
});

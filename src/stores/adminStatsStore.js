import { defineStore } from 'pinia';
import api from '@/services/api';
import { normalizeError } from '@/utils/errorHandler';

export const useAdminStatsStore = defineStore('adminStats', {
  state: () => ({
    stats: {
      pending_payments: 0,
      open_rfqs: 0,
      rfq_volume: 0,
      active_leads: 0,
      total_revenue: 0,
      lost_to_expiry: 0,
      funnel: {
        created: 0,
        broadcasted: 0,
        offered: 0,
        converted: 0,
      },
      vendor_performance: {
        avg_response_time_seconds: 0,
        avg_acceptance_rate: 0,
        avg_ghosting_ratio: 0,
      },
      leaderboard: [],
    },
    loading: false,
    error: null,
    lastFetched: 0,
  }),

  actions: {
    async fetchStats(options = {}) {
      const { silent = false, fresh = false } = options;

      if (!silent) this.loading = true;
      this.error = null;

      try {
        const response = await api.get('/admin/stats', {
          params: fresh ? { fresh: 1, _: Date.now() } : undefined,
          errorMode: 'silent',
        });
        const payload = response?.data || response || {};
        this.stats = {
          pending_payments: Number(payload.pending_payments || 0),
          open_rfqs: Number(payload.open_rfqs || 0),
          rfq_volume: Number(payload.rfq_volume || 0),
          active_leads: Number(payload.active_leads || 0),
          total_revenue: Number(payload.total_revenue || 0),
          lost_to_expiry: Number(payload.lost_to_expiry || 0),
          funnel: payload.funnel || { created: 0, broadcasted: 0, offered: 0, converted: 0 },
          vendor_performance: payload.vendor_performance || {
            avg_response_time_seconds: 0,
            avg_acceptance_rate: 0,
            avg_ghosting_ratio: 0,
          },
          leaderboard: Array.isArray(payload.leaderboard) ? payload.leaderboard : [],
        };
        this.lastFetched = Date.now();
        return this.stats;
      } catch (error) {
        this.error = normalizeError(error).message;
        throw error;
      } finally {
        if (!silent) this.loading = false;
      }
    },
  },
});

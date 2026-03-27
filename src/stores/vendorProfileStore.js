import { defineStore } from 'pinia';
import api from '@/services/api';

export const useVendorProfileStore = defineStore('vendorProfile', {
  state: () => ({
    company: null,
    verification: {
      status: 'unverified',
      score: 0,
      activeProducts: 0,
      reviewCount: 0,
      rating: 0,
      responseRate: 0,
      averageResponseTimeLabel: 'No data yet',
      completedDeals: 0
    },
    loading: false,
    error: null,
    success: false
  }),

  actions: {
    async fetchProfile() {
      this.loading = true;
      try {
        const [profileRes, statsRes] = await Promise.all([
          api.get('/vendor/me'),
          api.get('/vendor/stats').catch(() => null)
        ]);

        this.company = profileRes?.data?.vendor || profileRes?.vendor || profileRes?.data || profileRes;

        const stats = statsRes?.data || statsRes || {};
        this.verification = {
          status: String(this.company?.verification_status || this.company?.status || 'pending').toLowerCase(),
          score: Number(stats.trust_score || 0),
          activeProducts: Number(stats.active_products || 0),
          reviewCount: Number(stats.review_count || 0),
          rating: Number(stats.rating || 0),
          responseRate: Number(stats.response_rate || 0),
          averageResponseTimeLabel: stats.average_response_time_label || 'No data yet',
          completedDeals: Number(stats.completed_orders || stats.completed_deals || 0)
        };
      } catch (err) {
        this.error = 'Failed to load company profile';
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

    async updateProfile(data) {
      try {
        const res = await api.patch('/vendor/me', data);
        this.company = res?.data?.vendor || res?.vendor || res?.data || res;
        return res;
      } catch (err) {
        throw err;
      }
    },

    async uploadVerificationDoc(formData) {
      try {
        throw new Error('Verification document upload endpoint is not available yet.');
      } catch (err) {
        throw err;
      }
    }
  }
});

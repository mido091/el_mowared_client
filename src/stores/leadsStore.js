import { defineStore } from 'pinia';
import api from '@/services/api';

export const useLeadsStore = defineStore('leads', {
  state: () => ({
    leads: [],
    myOffers: [],
    loading: false,
    error: null,
    filters: {
      category: '',
      region: '',
      search: '',
      status: 'open'
    },
    pagination: {
      total: 0,
      page: 1,
      limit: 12
    }
  }),

  actions: {
    async fetchLeads() {
      this.loading = true;
      this.error = null;
      try {
        const params = {
          page: this.pagination.page,
          limit: this.pagination.limit
        };

        const search = `${this.filters.search || ''}`.trim();
        if (search) {
          params.search = search;
        }

        const category = `${this.filters.category || ''}`.trim();
        if (category) {
          params.category = category;
        }

        const region = `${this.filters.region || ''}`.trim();
        if (region) {
          params.region = region;
        }

        const status = `${this.filters.status || ''}`.trim();
        if (status) {
          params.status = status;
        }

        const response = await api.get('/rfq/feed', {
          params
        });
        const wrapped = response?.data || response || [];
        const rawLeads = Array.isArray(wrapped) ? wrapped : (wrapped.data || []);
        this.leads = rawLeads.map(lead => ({
          ...lead,
          deadline: lead.deadline || lead.expiration_time || null,
          product_name: lead.product_name || lead.title,
          user: lead.user || {}
        }));
        this.pagination.total = this.leads.length;
      } catch (err) {
        this.error = err?.normalized?.message || err?.userMessage || {
          en: 'Failed to fetch leads.',
          ar: 'تعذر تحميل الفرص.'
        };
      } finally {
        this.loading = false;
      }
    },

    async fetchMyOffers() {
      try {
        this.myOffers = [];
      } catch (err) {
        console.error('Failed to fetch your offers', err);
      }
    },

    async submitOffer(rfqId, offerData) {
      try {
        const res = await api.post(`/rfq/${rfqId}/offer`, offerData);
        await this.fetchMyOffers();
        return res;
      } catch (err) {
        throw err;
      }
    }
  }
});

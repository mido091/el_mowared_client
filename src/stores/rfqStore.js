import { defineStore } from 'pinia';
import api from '@/services/api';
import { getApiCollection, getApiData } from '@/utils/apiResponse';
import { normalizeError } from '@/utils/errorHandler';

export const useRfqStore = defineStore('rfq', {
  state: () => ({
    rfqs: [],
    feed: {},
    feedOrder: [],
    activeTab: 'active',
    loading: false,
    submitting: false,
    success: false,
    error: null,
    fieldErrors: {}
  }),

  getters: {
    allLeads: (state) => state.feedOrder.map((id) => state.feed[id]).filter(Boolean),
    availableOpportunities: (state) => state.feedOrder
      .map((id) => state.feed[id])
      .filter((r) => r && !Number(r.vendor_has_offer || 0) && !Number(r.vendor_has_chat || 0) && !Number(r.vendor_has_declined || 0)),
    acceptedOpportunities: (state) => state.feedOrder
      .map((id) => state.feed[id])
      .filter((r) => r && (Number(r.vendor_has_offer || 0) || Number(r.vendor_has_chat || 0))),
    newLeads: (state) => state.feedOrder.map((id) => state.feed[id]).filter((r) => r && (r.status === 'BROADCASTED' || r.status === 'OPEN')),
    activeNegotiations: (state) => state.feedOrder.map((id) => state.feed[id]).filter((r) => r && (r.status === 'NEGOTIATING' || r.status === 'OFFERED')),
    lostLeads: (state) => state.feedOrder.map((id) => state.feed[id]).filter((r) => r && (r.status === 'REJECTED' || r.status === 'CANCELED')),
    expiredLeads: (state) => state.feedOrder.map((id) => state.feed[id]).filter((r) => r && r.status === 'EXPIRED'),
    wonLeads: (state) => state.feedOrder.map((id) => state.feed[id]).filter((r) => r && (r.status === 'COMPLETED' || r.status === 'ACCEPTED'))
  },

  actions: {
    async createRfq(payload) {
      this.submitting = true;
      this.error = null;
      this.fieldErrors = {};
      try {
        const res = await api.post('/rfq', payload, { errorMode: 'inline' });
        const data = getApiData(res);
        this.success = true;
        return data;
      } catch (err) {
        const normalized = normalizeError(err);
        this.error = normalized.message;
        this.fieldErrors = normalized.fields;
        throw err;
      } finally {
        this.submitting = false;
      }
    },

    async acceptOffer(offerId, marketerId = null) {
      this.submitting = true;
      this.error = null;
      this.fieldErrors = {};
      try {
        const payload = marketerId ? { marketerId } : {};
        const res = await api.patch(`/rfq/offers/${offerId}/accept`, payload, { errorMode: 'inline' });
        return getApiData(res);
      } catch (err) {
        const normalized = normalizeError(err);
        this.error = normalized.message;
        this.fieldErrors = normalized.fields;
        throw err;
      } finally {
        this.submitting = false;
      }
    },

    async deleteRfq(id) {
      this.submitting = true;
      this.error = null;
      this.fieldErrors = {};
      try {
        const response = await api.delete(`/rfq/${id}`, { errorMode: 'inline' });
        this.rfqs = this.rfqs.filter((item) => Number(item.id) !== Number(id));
        return getApiData(response);
      } catch (err) {
        const normalized = normalizeError(err);
        this.error = normalized.message;
        this.fieldErrors = normalized.fields;
        throw err;
      } finally {
        this.submitting = false;
      }
    },

    async requestQuote(payload) {
      this.submitting = true;
      this.error = null;
      this.fieldErrors = {};
      try {
        const res = await api.post('/quotes/request', payload, { errorMode: 'inline' });
        return getApiData(res);
      } catch (err) {
        const normalized = normalizeError(err);
        this.error = normalized.message;
        this.fieldErrors = normalized.fields;
        throw err;
      } finally {
        this.submitting = false;
      }
    },

    async respondToQuote(quoteId, data) {
      this.submitting = true;
      this.error = null;
      this.fieldErrors = {};
      try {
        const res = await api.post(`/quotes/${quoteId}/respond`, data, { errorMode: 'inline' });
        return getApiData(res);
      } catch (err) {
        const normalized = normalizeError(err);
        this.error = normalized.message;
        this.fieldErrors = normalized.fields;
        throw err;
      } finally {
        this.submitting = false;
      }
    },

    async fetchFeed() {
      this.loading = true;
      this.error = null;
      this.fieldErrors = {};
      try {
        const response = await api.get('/rfq/feed', { errorMode: 'silent' });
        const dataArray = getApiCollection(response, ['items', 'rfqs']);
        const normalize = dataArray.reduce((acc, item) => {
          acc[item.id] = { ...this.feed[item.id], ...item };
          return acc;
        }, {});

        this.feed = { ...this.feed, ...normalize };
        this.feedOrder = dataArray.map((item) => item.id);
        this.success = true;
      } catch (err) {
        const normalized = normalizeError(err);
        this.error = normalized.message;
        this.fieldErrors = normalized.fields;
      } finally {
        this.loading = false;
      }
    },

    async fetchPublicRfqs() {
      this.loading = true;
      this.error = null;
      this.fieldErrors = {};
      try {
        const res = await api.get('/rfq', { errorMode: 'silent' });
        this.rfqs = getApiCollection(res, ['rfqs', 'items']);
      } catch (err) {
        const normalized = normalizeError(err);
        this.error = normalized.message;
        this.fieldErrors = normalized.fields;
        this.rfqs = [];
      } finally {
        this.loading = false;
      }
    },

    async submitOffer(id, payload) {
      this.submitting = true;
      this.error = null;
      this.fieldErrors = {};
      try {
        const response = await api.post(`/rfq/${id}/offer`, payload, { errorMode: 'inline' });

        if (this.feed[id]) {
          this.feed[id].status = 'OFFERED';
          this.feed[id].current_responders = (this.feed[id].current_responders || 0) + 1;
          this.feed[id].vendor_has_offer = 1;
          this.feed[id].vendor_has_declined = 0;
        }

        return getApiData(response);
      } catch (err) {
        const normalized = normalizeError(err);
        this.error = normalized.message;
        this.fieldErrors = normalized.fields;
        throw err;
      } finally {
        this.submitting = false;
      }
    },

    async declineRfq(id) {
      this.submitting = true;
      this.error = null;
      this.fieldErrors = {};
      try {
        const response = await api.patch(`/rfq/${id}/decline`, null, { errorMode: 'inline' });
        if (this.feed[id]) {
          this.feed[id] = {
            ...this.feed[id],
            vendor_has_declined: 1
          };
        }

        return getApiData(response);
      } catch (err) {
        const normalized = normalizeError(err);
        this.error = normalized.message;
        this.fieldErrors = normalized.fields;
        throw err;
      } finally {
        this.submitting = false;
      }
    },

    setTab(tabName) {
      this.activeTab = tabName;
    }
  }
});

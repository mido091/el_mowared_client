import { defineStore } from 'pinia';
import api from '@/services/api';
import { getApiCollection, getApiData } from '@/utils/apiResponse';
import { normalizeError } from '@/utils/errorHandler';
import { createDomainSync } from '@/utils/domainSync';

const rfqSync = createDomainSync('rfqs');
const STALE_MS = 30 * 1000;

const isFreshEnough = (timestamp) => Number(timestamp || 0) > 0 && (Date.now() - Number(timestamp)) < STALE_MS;

export const useRfqStore = defineStore('rfq', {
  state: () => ({
    rfqs: [],
    adminRfqs: [],
    feed: {},
    feedOrder: [],
    activeTab: 'active',
    loading: false,
    submitting: false,
    success: false,
    error: null,
    fieldErrors: {},
    lastFetchedPublic: 0,
    lastFetchedAdmin: 0,
    lastFetchedFeed: 0,
    revision: 0,
    syncReady: false
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
    ensureSync() {
      if (this.syncReady || typeof window === 'undefined') {
        return;
      }

      this.revision = Math.max(this.revision || 0, rfqSync.getStoredRevision());
      rfqSync.ensure();
      rfqSync.subscribe(async () => {
        this.revision = Math.max(this.revision || 0, rfqSync.getStoredRevision());

        if (this.lastFetchedPublic) {
          await this.fetchPublicRfqs({ mode: 'fresh', silent: true });
        }

        if (this.lastFetchedAdmin) {
          await this.fetchAdminRfqs({ mode: 'fresh', silent: true });
        }

        if (this.lastFetchedFeed) {
          await this.fetchFeed({ mode: 'fresh', silent: true });
        }
      });

      const syncFreshData = async () => {
        const latestRevision = rfqSync.getStoredRevision();
        if (latestRevision <= (this.revision || 0)) return;

        this.revision = latestRevision;

        if (this.lastFetchedPublic) {
          await this.fetchPublicRfqs({ mode: 'fresh', silent: true });
        }

        if (this.lastFetchedAdmin) {
          await this.fetchAdminRfqs({ mode: 'fresh', silent: true });
        }

        if (this.lastFetchedFeed) {
          await this.fetchFeed({ mode: 'fresh', silent: true });
        }
      };

      window.addEventListener('focus', syncFreshData);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          syncFreshData();
        }
      });

      this.syncReady = true;
    },

    invalidateRfqs(reason = 'mutation') {
      this.revision = Date.now();
      rfqSync.publish(reason);
    },

    async createRfq(payload) {
      this.ensureSync();
      this.submitting = true;
      this.error = null;
      this.fieldErrors = {};
      try {
        const res = await api.post('/rfq', payload, { errorMode: 'inline' });
        const data = getApiData(res);
        this.success = true;
        this.invalidateRfqs('create-rfq');
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
      this.ensureSync();
      this.submitting = true;
      this.error = null;
      this.fieldErrors = {};
      try {
        const payload = marketerId ? { marketerId } : {};
        const res = await api.patch(`/rfq/offers/${offerId}/accept`, payload, { errorMode: 'inline' });
        this.invalidateRfqs('accept-offer');
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
      this.ensureSync();
      this.submitting = true;
      this.error = null;
      this.fieldErrors = {};
      try {
        const response = await api.delete(`/rfq/${id}`, { errorMode: 'inline' });
        this.rfqs = this.rfqs.filter((item) => Number(item.id) !== Number(id));
        this.adminRfqs = this.adminRfqs.filter((item) => Number(item.id) !== Number(id));
        this.feedOrder = this.feedOrder.filter((itemId) => Number(itemId) !== Number(id));
        if (this.feed[id]) {
          const nextFeed = { ...this.feed };
          delete nextFeed[id];
          this.feed = nextFeed;
        }
        this.invalidateRfqs('delete-rfq');
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

    async completeRfq(id) {
      this.ensureSync();
      this.submitting = true;
      this.error = null;
      this.fieldErrors = {};
      try {
        const response = await api.patch(`/rfq/${id}/complete`, {}, { errorMode: 'inline' });
        this.rfqs = this.rfqs.map((item) =>
          Number(item.id) === Number(id) ? { ...item, status: 'COMPLETED' } : item
        );
        if (this.feed[id]) {
          this.feed = {
            ...this.feed,
            [id]: { ...this.feed[id], status: 'COMPLETED' }
          };
        }
        this.invalidateRfqs('complete-rfq');
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
      this.ensureSync();
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
      this.ensureSync();
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

    async fetchFeed(options = {}) {
      this.ensureSync();
      const { mode = 'cached', silent = false } = options;
      const hasData = Object.keys(this.feed).length > 0;
      if (mode === 'cached' && hasData && isFreshEnough(this.lastFetchedFeed)) {
        return this.allLeads;
      }

      if (mode === 'revalidate' && hasData) {
        if (!isFreshEnough(this.lastFetchedFeed)) {
          this.fetchFeed({ mode: 'fresh', silent: true }).catch(() => {});
        }
        return this.allLeads;
      }

      if (!silent) {
        this.loading = true;
      }
      this.error = null;
      this.fieldErrors = {};
      try {
        const response = await api.get('/rfq/feed', {
          errorMode: 'silent',
          params: mode === 'fresh' || (mode === 'revalidate' && !hasData)
            ? { fresh: 1, _: Date.now() }
            : undefined,
        });
        const dataArray = getApiCollection(response, ['items', 'rfqs']);
        const normalize = dataArray.reduce((acc, item) => {
          acc[item.id] = { ...this.feed[item.id], ...item };
          return acc;
        }, {});

        this.feed = { ...this.feed, ...normalize };
        this.feedOrder = dataArray.map((item) => item.id);
        this.success = true;
        this.lastFetchedFeed = Date.now();
        return this.allLeads;
      } catch (err) {
        const normalized = normalizeError(err);
        this.error = normalized.message;
        this.fieldErrors = normalized.fields;
        if (mode === 'fresh') {
          throw err;
        }
      } finally {
        if (!silent) {
          this.loading = false;
        }
      }
    },

    async fetchPublicRfqs(options = {}) {
      this.ensureSync();
      const { mode = 'cached', silent = false } = options;
      const hasData = this.rfqs.length > 0;
      if (mode === 'cached' && hasData && isFreshEnough(this.lastFetchedPublic)) {
        return this.rfqs;
      }

      if (mode === 'revalidate' && hasData) {
        if (!isFreshEnough(this.lastFetchedPublic)) {
          this.fetchPublicRfqs({ mode: 'fresh', silent: true }).catch(() => {});
        }
        return this.rfqs;
      }

      if (!silent) {
        this.loading = true;
      }
      this.error = null;
      this.fieldErrors = {};
      try {
        const res = await api.get('/rfq', {
          errorMode: 'silent',
          params: mode === 'fresh' || (mode === 'revalidate' && !hasData)
            ? { fresh: 1, _: Date.now() }
            : undefined,
        });
        this.rfqs = getApiCollection(res, ['rfqs', 'items']);
        this.lastFetchedPublic = Date.now();
        return this.rfqs;
      } catch (err) {
        const normalized = normalizeError(err);
        this.error = normalized.message;
        this.fieldErrors = normalized.fields;
        this.rfqs = [];
        if (mode === 'fresh') {
          throw err;
        }
      } finally {
        if (!silent) {
          this.loading = false;
        }
      }
    },

    async fetchAdminRfqs(options = {}) {
      this.ensureSync();
      const { mode = 'cached', silent = false } = options;
      const hasData = this.adminRfqs.length > 0;
      if (mode === 'cached' && hasData && isFreshEnough(this.lastFetchedAdmin)) {
        return this.adminRfqs;
      }

      if (mode === 'revalidate' && hasData) {
        if (!isFreshEnough(this.lastFetchedAdmin)) {
          this.fetchAdminRfqs({ mode: 'fresh', silent: true }).catch(() => {});
        }
        return this.adminRfqs;
      }

      if (!silent) {
        this.loading = true;
      }
      this.error = null;
      this.fieldErrors = {};
      try {
        const res = await api.get('/rfq', {
          errorMode: 'silent',
          params: mode === 'fresh' || (mode === 'revalidate' && !hasData)
            ? { fresh: 1, _: Date.now() }
            : undefined,
        });
        this.adminRfqs = getApiCollection(res, ['rfqs', 'items']);
        this.lastFetchedAdmin = Date.now();
        return this.adminRfqs;
      } catch (err) {
        const normalized = normalizeError(err);
        this.error = normalized.message;
        this.fieldErrors = normalized.fields;
        this.adminRfqs = [];
        if (mode === 'fresh') {
          throw err;
        }
      } finally {
        if (!silent) {
          this.loading = false;
        }
      }
    },

    async submitOffer(id, payload) {
      this.ensureSync();
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

        this.invalidateRfqs('submit-offer');
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
      this.ensureSync();
      this.submitting = true;
      this.error = null;
      this.fieldErrors = {};
      try {
        const response = await api.patch(`/rfq/${id}/decline`, {}, { errorMode: 'silent' });
        if (this.feed[id]) {
          this.feed[id] = {
            ...this.feed[id],
            vendor_has_declined: 1
          };
        }

        this.invalidateRfqs('decline-rfq');
        return getApiData(response);
      } catch (err) {
        const normalized = normalizeError(err);
        this.error = normalized.message;
        this.fieldErrors = normalized.fields;
        if ([400, 404].includes(Number(normalized.status || 0))) {
          await this.fetchFeed({ mode: 'fresh', silent: true }).catch(() => {});
        }
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

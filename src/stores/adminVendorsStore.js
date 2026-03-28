import { defineStore } from 'pinia';
import api from '@/services/api';
import { getApiCollection } from '@/utils/apiResponse';
import { normalizeError } from '@/utils/errorHandler';
import { createDomainSync } from '@/utils/domainSync';
import { useCache } from '@/composables/useCache';

const VENDOR_STALE_MS = 1000 * 60 * 5;
const vendorSync = createDomainSync('vendors');

let activeFetchPromise = null;
let activeFetchKey = '';

const normalizeVendor = (vendor) => ({
  ...vendor,
  id: Number(vendor.id),
  user_id: vendor.user_id == null ? null : Number(vendor.user_id),
  is_active: vendor.is_active == null ? null : Boolean(Number(vendor.is_active)),
  record_state:
    vendor.record_state ||
    (vendor.deleted_at || vendor.user_deleted_at
      ? 'DELETED'
      : (vendor.is_active === 0 || vendor.is_active === false ? 'INACTIVE' : (vendor.verification_status || 'PENDING'))),
});

export const useAdminVendorsStore = defineStore('adminVendors', {
  state: () => ({
    vendors: [],
    loading: false,
    error: null,
    lastFetched: null,
    lastStatusFetched: null,
    revision: 0,
    syncReady: false,
    activeStatus: 'ALL',
  }),

  actions: {
    ensureSync() {
      if (this.syncReady || typeof window === 'undefined') return;

      vendorSync.ensure();
      vendorSync.subscribe((payload = {}) => {
        const incomingRevision = Number(payload.revision || 0);
        if (incomingRevision && incomingRevision <= Number(this.revision || 0)) return;
        this.revision = incomingRevision;
        this.lastFetched = null;
        this.fetchVendors({ status: this.activeStatus, mode: 'fresh', silent: true }).catch(() => {});
      });

      const syncFromRevision = () => {
        const storedRevision = vendorSync.getStoredRevision();
        if (storedRevision > Number(this.revision || 0)) {
          this.revision = storedRevision;
          this.lastFetched = null;
          this.fetchVendors({ status: this.activeStatus, mode: 'fresh', silent: true }).catch(() => {});
        }
      };

      window.addEventListener('focus', syncFromRevision);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') syncFromRevision();
      });

      this.syncReady = true;
      syncFromRevision();
    },

    async fetchVendors(options = {}) {
      this.ensureSync();
      const mode = options.mode || 'cached';
      const status = options.status || this.activeStatus || 'ALL';
      this.activeStatus = status;
      const hasData = this.vendors.length > 0 && this.lastStatusFetched === status;
      const isFreshEnough =
        hasData &&
        this.lastFetched &&
        this.lastStatusFetched === status &&
        Date.now() - this.lastFetched < VENDOR_STALE_MS;

      if (mode === 'cached' && isFreshEnough) return this.vendors;
      if (mode === 'revalidate' && hasData) {
        this.refreshVendors({ status, fresh: true, silent: true }).catch(() => {});
        return this.vendors;
      }

      return this.refreshVendors({
        status,
        fresh: mode === 'fresh' || (mode === 'revalidate' && !hasData),
        silent: Boolean(options.silent),
      });
    },

    async refreshVendors({ status = 'ALL', fresh = false, silent = false } = {}) {
      const fetchKey = JSON.stringify({ status, fresh });
      if (activeFetchPromise && activeFetchKey === fetchKey) return activeFetchPromise;

      activeFetchPromise = (async () => {
        activeFetchKey = fetchKey;
        if (!silent) this.loading = true;

        try {
          const response = await api.get('/admin/vendors', {
            params: {
              status: status === 'ALL' ? undefined : status,
              ...(fresh ? { fresh: 1, _: Date.now() } : {}),
            },
          });
          this.vendors = getApiCollection(response, ['vendors', 'items']).map(normalizeVendor);
          this.lastFetched = Date.now();
          this.lastStatusFetched = status;
          this.revision = Math.max(this.revision || 0, this.lastFetched);
          this.error = null;
          return this.vendors;
        } catch (error) {
          this.error = normalizeError(error).message;
          throw error;
        } finally {
          if (!silent) this.loading = false;
          activeFetchPromise = null;
          activeFetchKey = '';
        }
      })();

      return activeFetchPromise;
    },

    invalidateVendors(reason = 'updated') {
      this.lastFetched = null;
      this.revision = vendorSync.publish(reason);
    },

    async verifyVendor(vendorId) {
      const { clearCache } = useCache();
      const response = await api.put(`/admin/vendors/${vendorId}/verify`);
      clearCache();
      await this.fetchVendors({ status: this.activeStatus, mode: 'fresh' });
      this.invalidateVendors('verified');
      return response;
    },

    async rejectVendor(vendorId) {
      const { clearCache } = useCache();
      const response = await api.put(`/admin/vendors/${vendorId}/reject`);
      clearCache();
      await this.fetchVendors({ status: this.activeStatus, mode: 'fresh' });
      this.invalidateVendors('rejected');
      return response;
    },

    async deleteVendor(vendorId) {
      const { clearCache } = useCache();
      const response = await api.delete(`/admin/vendors/${vendorId}`);
      clearCache();
      await this.fetchVendors({ status: this.activeStatus, mode: 'fresh' });
      this.invalidateVendors('deleted');
      return response;
    },
  },
});

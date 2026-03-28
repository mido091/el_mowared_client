import { defineStore } from 'pinia';
import api from '@/services/api';
import { getApiCollection } from '@/utils/apiResponse';
import { normalizeError } from '@/utils/errorHandler';
import { createDomainSync } from '@/utils/domainSync';
import { useCache } from '@/composables/useCache';

const USER_STALE_MS = 1000 * 60 * 5;
const userSync = createDomainSync('users');

let activeFetchPromise = null;

const normalizeUser = (user) => ({
  ...user,
  id: Number(user.id),
  vendor_profile_id: user.vendor_profile_id == null ? null : Number(user.vendor_profile_id),
  is_active: Boolean(Number(user.is_active ?? user.isActive ?? 0)),
  record_state: user.record_state || (user.deleted_at ? 'DELETED' : (Boolean(Number(user.is_active ?? 0)) ? 'ACTIVE' : 'INACTIVE')),
});

export const useAdminUsersStore = defineStore('adminUsers', {
  state: () => ({
    users: [],
    loading: false,
    error: null,
    lastFetched: null,
    revision: 0,
    syncReady: false,
    _unsubscribe: null,
  }),

  getters: {
    normalizedUsers: (state) => state.users,
  },

  actions: {
    ensureSync() {
      if (this.syncReady || typeof window === 'undefined') return;

      userSync.ensure();
      this._unsubscribe = userSync.subscribe((payload = {}) => {
        const incomingRevision = Number(payload.revision || 0);
        if (incomingRevision && incomingRevision <= Number(this.revision || 0)) return;
        this.revision = incomingRevision;
        this.lastFetched = null;
        this.fetchUsers({ mode: 'fresh', silent: true }).catch(() => {});
      });

      const handleFocusSync = () => {
        const storedRevision = userSync.getStoredRevision();
        if (storedRevision > Number(this.revision || 0)) {
          this.revision = storedRevision;
          this.lastFetched = null;
          this.fetchUsers({ mode: 'fresh', silent: true }).catch(() => {});
        }
      };

      window.addEventListener('focus', handleFocusSync);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          handleFocusSync();
        }
      });

      this.syncReady = true;
      handleFocusSync();
    },

    async fetchUsers(options = {}) {
      this.ensureSync();
      const mode = options.mode || 'cached';
      const hasData = this.users.length > 0;
      const isFreshEnough = hasData && this.lastFetched && Date.now() - this.lastFetched < USER_STALE_MS;

      if (mode === 'cached' && isFreshEnough) {
        return this.users;
      }

      if (mode === 'revalidate' && hasData) {
        this.refreshUsers({ silent: true, fresh: true }).catch(() => {});
        return this.users;
      }

      return this.refreshUsers({
        silent: Boolean(options.silent),
        fresh: mode === 'fresh' || (mode === 'revalidate' && !hasData),
      });
    },

    async refreshUsers({ silent = false, fresh = false } = {}) {
      if (activeFetchPromise) return activeFetchPromise;

      activeFetchPromise = (async () => {
        if (!silent) this.loading = true;

        try {
          const response = await api.get('/admin/users', {
            params: fresh ? { fresh: 1, _: Date.now() } : undefined,
          });
          this.users = getApiCollection(response, ['users', 'items']).map(normalizeUser);
          this.lastFetched = Date.now();
          this.revision = Math.max(this.revision || 0, this.lastFetched);
          this.error = null;
          return this.users;
        } catch (error) {
          this.error = normalizeError(error).message;
          throw error;
        } finally {
          if (!silent) this.loading = false;
          activeFetchPromise = null;
        }
      })();

      return activeFetchPromise;
    },

    invalidateUsers(reason = 'updated') {
      this.lastFetched = null;
      this.revision = userSync.publish(reason);
    },

    async updateRole(userId, role) {
      const { clearCache } = useCache();
      const response = await api.patch(`/admin/users/${userId}/role`, { role });
      clearCache();
      await this.fetchUsers({ mode: 'fresh' });
      this.invalidateUsers('role-updated');
      return response;
    },

    async toggleStatus(userId, isActive) {
      const { clearCache } = useCache();
      const response = await api.patch(`/admin/users/${userId}/status`, { isActive });
      clearCache();
      await this.fetchUsers({ mode: 'fresh' });
      this.invalidateUsers('status-updated');
      return response;
    },

    async deleteUser(userId) {
      const { clearCache } = useCache();
      const response = await api.delete(`/admin/users/${userId}`);
      clearCache();
      await this.fetchUsers({ mode: 'fresh' });
      this.invalidateUsers('deleted');
      return response;
    },

    async createUser(payload) {
      const { clearCache } = useCache();
      const response = await api.post('/admin/users', payload);
      clearCache();
      await this.fetchUsers({ mode: 'fresh' });
      this.invalidateUsers('created');
      return response;
    },

    async updateUser(userId, payload) {
      const response = await api.patch(`/admin/users/${userId}`, payload);
      await this.fetchUsers({ mode: 'fresh' });
      this.invalidateUsers('updated');
      return response;
    },
  },
});

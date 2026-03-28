import { defineStore } from 'pinia';
import api from '@/services/api';
import { getApiCollection } from '@/utils/apiResponse';
import { normalizeError } from '@/utils/errorHandler';
import { useCache } from '@/composables/useCache';

const CATEGORY_SYNC_CHANNEL = 'categories';
const CATEGORY_SYNC_STORAGE_KEY = 'elmowared:categories:sync';
const CATEGORY_REVISION_KEY = 'elmowared:categories:revision';
const CATEGORY_STALE_MS = 1000 * 60 * 5;

let syncChannel = null;
let syncInitialized = false;
let activeFetchPromise = null;

const normalizeCategory = (category) => {
  if (!category || typeof category !== 'object') return null;

  return {
    id: Number(category.id),
    name_ar: category.name_ar || category.nameAr || '',
    name_en: category.name_en || category.nameEn || '',
    slug: category.slug || '',
    icon: category.icon || 'default',
    deleted_at: category.deleted_at || null,
    record_state: category.record_state || (category.deleted_at ? 'DELETED' : 'ACTIVE'),
    created_at: category.created_at || null,
    updated_at: category.updated_at || null,
    parent_id:
      category.parent_id === undefined || category.parent_id === null || category.parentId === null
        ? null
        : Number(category.parent_id ?? category.parentId),
  };
};

const normalizeCategories = (categories = []) =>
  categories
    .map((category) => normalizeCategory(category))
    .filter(Boolean);

const localizeCategoryName = (category, locale = 'en') => {
  if (!category) return '';
  return locale === 'ar'
    ? category.name_ar || category.name_en || ''
    : category.name_en || category.name_ar || '';
};

export const useCategoryStore = defineStore('category', {
  state: () => ({
    categories: [],
    loading: false,
    error: null,
    lastFetched: null,
    revision: 0,
    syncReady: false,
  }),

  getters: {
    getCategoryById: (state) => (id) => state.categories.find((category) => category.id === id),

    localizedCategoryName: () => (category, locale = 'en') => localizeCategoryName(category, locale),

    localizedCategories: (state) => (locale) =>
      state.categories.map((category) => ({
        id: category.id,
        name: localizeCategoryName(category, locale),
        name_ar: category.name_ar,
        name_en: category.name_en,
        slug: category.slug,
        icon: category.icon,
        deleted_at: category.deleted_at,
        record_state: category.record_state,
        created_at: category.created_at,
        updated_at: category.updated_at,
        parentId: category.parent_id,
        parent_id: category.parent_id,
      })),

    adminCategories: (state) =>
      state.categories.map((category) => ({
        ...category,
        nameAr: category.name_ar,
        nameEn: category.name_en,
      })),
  },

  actions: {
    ensureSync() {
      if (this.syncReady || typeof window === 'undefined') return;

      if (!syncInitialized) {
        syncInitialized = true;

        if (typeof BroadcastChannel !== 'undefined') {
          syncChannel = new BroadcastChannel(CATEGORY_SYNC_CHANNEL);
        }
      }

      if (syncChannel) {
        syncChannel.onmessage = (event) => {
          if (event?.data?.type === 'categories:invalidate') {
            this.handleExternalInvalidation(event.data);
          }
        };
      }

      window.addEventListener('storage', (event) => {
        if (event.key === CATEGORY_REVISION_KEY && event.newValue) {
          this.syncFromRevisionValue(event.newValue);
          return;
        }

        if (event.key !== CATEGORY_SYNC_STORAGE_KEY || !event.newValue) return;

        try {
          const payload = JSON.parse(event.newValue);
          if (payload?.type === 'categories:invalidate') {
            this.handleExternalInvalidation(payload);
          }
        } catch {
          // Ignore malformed sync payloads.
        }
      });

      window.addEventListener('focus', () => {
        this.syncFromStoredRevision();
      });

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.syncFromStoredRevision();
        }
      });

      this.syncReady = true;
      this.syncFromStoredRevision();
    },

    broadcastInvalidation(reason = 'updated') {
      if (typeof window === 'undefined') return;

      const payload = {
        type: 'categories:invalidate',
        reason,
        revision: Date.now(),
      };

      syncChannel?.postMessage(payload);
      window.localStorage.setItem(CATEGORY_REVISION_KEY, String(payload.revision));
      window.localStorage.setItem(CATEGORY_SYNC_STORAGE_KEY, JSON.stringify(payload));
      window.localStorage.removeItem(CATEGORY_SYNC_STORAGE_KEY);
    },

    syncFromRevisionValue(value) {
      const remoteRevision = Number(value || 0);
      if (!remoteRevision || remoteRevision <= Number(this.revision || 0)) return;

      this.handleExternalInvalidation({
        type: 'categories:invalidate',
        reason: 'revision-sync',
        revision: remoteRevision,
      });
    },

    syncFromStoredRevision() {
      if (typeof window === 'undefined') return;
      this.syncFromRevisionValue(window.localStorage.getItem(CATEGORY_REVISION_KEY));
    },

    handleExternalInvalidation(payload = {}) {
      this.revision = Math.max(this.revision || 0, Number(payload.revision || 0));
      this.lastFetched = null;

      this.fetchCategories({ mode: 'fresh', silent: true }).catch(() => {
        // Keep stale data visible if refresh fails.
      });
    },

    async fetchCategories(forceOrOptions = false, options = {}) {
      this.ensureSync();

      const parsedOptions =
        typeof forceOrOptions === 'object' && forceOrOptions !== null
          ? forceOrOptions
          : { ...options, mode: forceOrOptions ? 'fresh' : (options.mode || 'cached') };

      const mode = parsedOptions.mode || 'cached';
      const freshRequested = Boolean(parsedOptions.fresh) || mode === 'fresh';
      const silent = Boolean(parsedOptions.silent);
      const hasData = this.categories.length > 0;
      const isFreshEnough =
        hasData &&
        this.lastFetched &&
        Date.now() - this.lastFetched < CATEGORY_STALE_MS;

      if (mode === 'cached' && this.categories.length > 0 && isFreshEnough) {
        return this.categories;
      }

      if (mode === 'revalidate' && hasData) {
        this.refreshCategories({ silent: true }).catch(() => {});
        return this.categories;
      }

      return this.refreshCategories({
        silent,
        fresh: freshRequested || (mode === 'revalidate' && !hasData),
        scope: parsedOptions.scope,
      });
    },

    async refreshCategories({ silent = false, fresh = false, scope = null } = {}) {
      if (activeFetchPromise) {
        return activeFetchPromise;
      }

      activeFetchPromise = (async () => {
        if (!silent) {
          this.loading = true;
        }

        try {
          const params = fresh
            ? { fresh: 1, _: Date.now(), ...(scope ? { scope } : {}) }
            : undefined;

          const res = await api.get('/categories', { params });
          this.categories = normalizeCategories(getApiCollection(res, ['categories', 'items']));
          this.lastFetched = Date.now();
          this.revision = this.lastFetched;
          this.error = null;
          return this.categories;
        } catch (err) {
          this.error = normalizeError(err).message;
          console.error('Category fetch error:', err);
          throw err;
        } finally {
          if (!silent) {
            this.loading = false;
          }
          activeFetchPromise = null;
        }
      })();

      return activeFetchPromise;
    },

    async createCategory(categoryData) {
      this.loading = true;
      try {
        const { clearCache } = useCache();
        const res = await api.post('/categories', categoryData);
        clearCache();
        await this.fetchCategories({ mode: 'fresh', scope: 'admin' });
        this.invalidateCategories('created');
        return res;
      } catch (err) {
        this.error = normalizeError(err).message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updateCategory(id, categoryData) {
      this.loading = true;
      try {
        const { clearCache } = useCache();
        const res = await api.put(`/categories/${id}`, categoryData);
        clearCache();
        await this.fetchCategories({ mode: 'fresh', scope: 'admin' });
        this.invalidateCategories('updated');
        return res;
      } catch (err) {
        this.error = normalizeError(err).message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async deleteCategory(id) {
      this.loading = true;
      try {
        const { clearCache } = useCache();
        await api.delete(`/categories/${id}`);
        clearCache();
        await this.fetchCategories({ mode: 'fresh', scope: 'admin' });
        this.invalidateCategories('deleted');
      } catch (err) {
        this.error = normalizeError(err).message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    invalidateCategories(reason = 'updated') {
      this.lastFetched = null;
      this.broadcastInvalidation(reason);
    }
  }
});

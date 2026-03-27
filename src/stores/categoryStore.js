import { defineStore } from 'pinia';
import api from '@/services/api';
import { getApiCollection } from '@/utils/apiResponse';
import { normalizeError } from '@/utils/errorHandler';

export const useCategoryStore = defineStore('category', {
  state: () => ({
    categories: [],
    loading: false,
    error: null,
    lastFetched: null
  }),

  getters: {
    getCategoryById: (state) => (id) => state.categories.find((category) => category.id === id),

    localizedCategories: (state) => (locale) =>
      state.categories.map((category) => ({
        id: category.id,
        name: category.name || (locale === 'ar' ? (category.name_ar || category.nameAr) : (category.name_en || category.nameEn)),
        slug: category.slug,
        icon: category.icon,
        parentId: category.parent_id
      })),

    adminCategories: (state) =>
      state.categories.map((category) => ({
        ...category,
        nameAr: category.name_ar || category.nameAr,
        nameEn: category.name_en || category.nameEn
      }))
  },

  actions: {
    async fetchCategories(force = false) {
      if (this.categories.length > 0 && !force) return;

      this.loading = true;
      try {
        const res = await api.get('/categories');
        this.categories = getApiCollection(res, ['categories', 'items']);
        this.lastFetched = Date.now();
        this.error = null;
      } catch (err) {
        this.error = normalizeError(err).message;
        console.error('Category fetch error:', err);
      } finally {
        this.loading = false;
      }
    },

    async createCategory(categoryData) {
      this.loading = true;
      try {
        const res = await api.post('/categories', categoryData);
        await this.fetchCategories(true);
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
        const res = await api.put(`/categories/${id}`, categoryData);
        await this.fetchCategories(true);
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
        await api.delete(`/categories/${id}`);
        await this.fetchCategories(true);
      } catch (err) {
        this.error = normalizeError(err).message;
        throw err;
      } finally {
        this.loading = false;
      }
    }
  }
});

import { defineStore } from 'pinia';
import api from '@/services/api';
import { useCache } from '@/composables/useCache';
import { getApiCollection } from '@/utils/apiResponse';

export const useCategoriesStore = defineStore('categories', {
  state: () => ({
    categories: [],
    loading: false,
  }),

  actions: {
    async fetchCategories() {
      const { getItem, setItem } = useCache();
      const cached = getItem('categories');

      if (cached) {
        this.categories = cached.data;
        if (!cached.isStale) return;
      }

      this.loading = true;
      try {
        const res = await api.get('/categories');
        const data = getApiCollection(res, ['categories', 'items']);
        this.categories = data;
        setItem('categories', data);
      } finally {
        this.loading = false;
      }
    }
  }
});

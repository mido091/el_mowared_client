import { defineStore } from 'pinia';

const MAX_COMPARE = 4;

export const useComparisonStore = defineStore('comparison', {
  state: () => ({
    products: JSON.parse(sessionStorage.getItem('compareProducts') || '[]'),
  }),

  getters: {
    count: (state) => state.products.length,
    isFull: (state) => state.products.length >= MAX_COMPARE,
    ids: (state) => state.products.map(p => p.id),
  },

  actions: {
    toggle(product) {
      const exists = this.products.findIndex(p => p.id === product.id);
      if (exists !== -1) {
        this.products.splice(exists, 1);
      } else if (this.products.length < MAX_COMPARE) {
        this.products.push(product);
      }
      sessionStorage.setItem('compareProducts', JSON.stringify(this.products));
    },
    isInList(id) {
      return this.products.some(p => p.id === id);
    },
    clear() {
      this.products = [];
      sessionStorage.removeItem('compareProducts');
    },
    remove(id) {
      this.products = this.products.filter(p => p.id !== id);
      sessionStorage.setItem('compareProducts', JSON.stringify(this.products));
    },
  },
});

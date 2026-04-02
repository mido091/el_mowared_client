import { defineStore } from 'pinia';
import socketService from '@/services/socket.service';

export const useMarketplaceRealtimeStore = defineStore('marketplaceRealtime', {
  state: () => ({
    initialized: false,
    marketplaceRevision: 0,
    productRevision: 0,
    summaryRevision: 0,
  }),

  actions: {
    bumpProductRevision(payload = {}) {
      const revision = Number(payload.revision || Date.now());
      this.marketplaceRevision = Math.max(this.marketplaceRevision || 0, revision);
      this.productRevision = Math.max(this.productRevision || 0, revision);
    },

    bumpSummaryRevision(payload = {}) {
      const revision = Number(payload.revision || Date.now());
      this.marketplaceRevision = Math.max(this.marketplaceRevision || 0, revision);
      this.summaryRevision = Math.max(this.summaryRevision || 0, revision);
    },

    init() {
      if (this.initialized) return;

      socketService.connect();

      const onProductChange = (payload) => {
        this.bumpProductRevision(payload);
      };

      const onMetricsChange = (payload) => {
        if (`${payload?.scope || ''}`.toLowerCase() === 'marketplace') {
          this.bumpSummaryRevision(payload);
          if (payload?.entity === 'product') {
            this.bumpProductRevision(payload);
          }
        }
      };

      socketService.on('product.created', onProductChange);
      socketService.on('product.updated', onProductChange);
      socketService.on('product.reviewed', onProductChange);
      socketService.on('product.deleted', onProductChange);
      socketService.on('dashboard.metrics.changed', onMetricsChange);

      this.initialized = true;
    },
  },
});

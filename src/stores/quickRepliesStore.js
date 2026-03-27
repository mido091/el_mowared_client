import { defineStore } from 'pinia';
import api from '@/services/api';
import { getApiCollection, getApiData } from '@/utils/apiResponse';

export const useQuickRepliesStore = defineStore('quickReplies', {
  state: () => ({
    replies: [],
    loading: false,
    categories: ['Pricing', 'Shipping', 'Technical', 'General']
  }),

  actions: {
    async fetchReplies() {
      this.loading = true;
      try {
        const res = await api.get('/quick-replies');
        this.replies = getApiCollection(res, ['replies']);
        
        // Seed if empty (Mock/Feature Flag logic)
        if (this.replies.length === 0) {
          this.replies = [
            { id: 1, title: 'MOQ Inquiry', content: 'Our minimum order quantity for this item is 500 units. Would you like a custom quote for a smaller batch?', category: 'General' },
            { id: 2, title: 'Shipping Time', content: 'Standard lead time is 15-20 business days after payment confirmation. Shipping to your region usually takes 7-10 days.', category: 'Shipping' },
            { id: 3, title: 'Custom Specs', content: 'We can definitely customize the specifications to meet your project requirements. Please share the technical blueprints.', category: 'Technical' }
          ];
        }
      } catch (err) {
        console.error('Failed to fetch quick replies', err);
      } finally {
        this.loading = false;
      }
    },

    async addReply(reply) {
      try {
        const res = await api.post('/quick-replies', reply);
        await this.fetchReplies();
        return getApiData(res);
      } catch (err) {
        // Fallback for mock state
        const newReply = { ...reply, id: Date.now() };
        this.replies.push(newReply);
        return newReply;
      }
    },

    async deleteReply(id) {
      try {
        await api.delete(`/quick-replies/${id}`);
        this.replies = this.replies.filter((reply) => Number(reply.id) !== Number(id));
        return true;
      } catch (err) {
        console.error('Failed to delete quick reply', err);
        this.replies = this.replies.filter((reply) => Number(reply.id) !== Number(id));
        return false;
      }
    }
  }
});

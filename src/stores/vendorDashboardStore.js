import { defineStore } from 'pinia';
import api from '@/services/api';

export const useVendorDashboardStore = defineStore('vendorDashboard', {
  state: () => ({
    stats: {
      activeProducts: 0,
      newRfqs: 0,
      unreadMessages: 0,
      pendingOrders: 0,
      completedOrders: 0,
      trustScore: 0,
      responseRate: 0,
      averageResponseTimeLabel: 'No data yet',
      rating: 0,
      reviewCount: 0,
      trustBadges: [],
      trustBreakdown: [],
    },
    trends: null,
    urgentNotifications: [],
    recentActivity: [],
    loading: false,
    error: null,
    success: false,
  }),

  actions: {
    async fetchOverviewData() {
      this.loading = true;
      this.error = null;
      try {
        const [statRes, orderRes] = await Promise.all([
          api.get('/vendor/stats').catch(() => null),
          api.get('/vendor/orders?limit=5').catch(() => [])
        ]);

        if (statRes) {
          const statsPayload = statRes?.data || statRes;
          this.stats = {
            activeProducts: statsPayload.active_products || 0,
            newRfqs: statsPayload.new_rfqs || 0,
            unreadMessages: statsPayload.unread_messages || 0,
            pendingOrders: statsPayload.pending_orders || 0,
            completedOrders: statsPayload.completed_orders || 0,
            trustScore: statsPayload.trust_score || 0,
            responseRate: statsPayload.response_rate || 0,
            averageResponseTimeLabel: statsPayload.average_response_time_label || 'No data yet',
            rating: statsPayload.rating || 0,
            reviewCount: statsPayload.review_count || 0,
            trustBadges: statsPayload.trust_badges || [],
            trustBreakdown: [
              {
                key: 'rating',
                label: 'Rating',
                value: statsPayload.trust_breakdown?.rating || 0
              },
              {
                key: 'response_rate',
                label: 'Response Rate',
                value: statsPayload.trust_breakdown?.response_rate || 0
              },
              {
                key: 'completed_deals',
                label: 'Completed Deals',
                value: statsPayload.trust_breakdown?.completed_deals || 0
              },
              {
                key: 'response_speed',
                label: 'Response Speed',
                value: statsPayload.trust_breakdown?.response_speed || 0
              }
            ],
          };

          this.trends = {
            responseRate: statsPayload.response_rate || 0,
            avgReplyTime: statsPayload.average_response_time_label || 'No data yet'
          };
        }

        this.urgentNotifications = [];
        this.recentActivity = Array.isArray(orderRes?.data || orderRes)
          ? (orderRes?.data || orderRes)
          : [];

      } catch (err) {
        console.error('Error fetching vendor dashboard data:', err);
        this.error = 'Failed to sync business metrics';
      } finally {
        this.loading = false;
      }
    }
  }
});

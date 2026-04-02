import { defineStore } from 'pinia';
import api from '@/services/api';
import socketService from '@/services/socket.service';
import { useAuthStore } from './auth';
import { useRfqStore } from './rfqStore';
import { useVendorProductsStore } from './vendorProductsStore';
import { useAdminProductModerationStore } from './adminProductModerationStore';
import { useVendorOrdersStore } from './vendorOrdersStore';
import { useVendorDashboardStore } from './vendorDashboardStore';
import { useInsightsStore } from './insightsStore';
import { useAdminStatsStore } from './adminStatsStore';
import { useLeadsStore } from './leadsStore';
import { useUserOrdersStore } from './userOrdersStore';
import { getApiCollection, getApiData } from '@/utils/apiResponse';

let toastId = 0;
let dialogId = 0;

const currentLocale = () => localStorage.getItem('locale') || document.documentElement.lang || 'en';
const localize = (ar, en) => (currentLocale().startsWith('ar') ? ar : en);

const normalizeIncomingNotification = (notification = {}) => ({
  id: notification.id || Date.now() + Math.random(),
  read: Boolean(notification.is_read ?? notification.read ?? false),
  timestamp: notification.created_at || notification.timestamp || new Date().toISOString(),
  titleAr: notification.titleAr || notification.title_ar || '',
  titleEn: notification.titleEn || notification.title_en || '',
  contentAr: notification.contentAr || notification.content_ar || '',
  contentEn: notification.contentEn || notification.content_en || '',
  message: notification.message
    || notification.content
    || notification.contentEn
    || notification.content_en
    || notification.contentAr
    || notification.content_ar
    || notification.title
    || notification.titleEn
    || notification.title_en
    || notification.titleAr
    || notification.title_ar
    || '',
  type: notification.type || 'info',
  link: notification.link || '',
  notificationType: notification.notificationType || notification.type || '',
});

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    notifications: [],
    unreadCount: 0,
    connected: false,
    initialized: false,
    toasts: [],
    activeDialog: null,
  }),

  actions: {
    addToast(message, type = 'info', duration = 4000) {
      const id = ++toastId;
      this.toasts.push({ id, message, type });
      setTimeout(() => this.removeToast(id), duration);
      return id;
    },

    removeToast(id) {
      this.toasts = this.toasts.filter((toast) => toast.id !== id);
    },

    openDialog(options) {
      const id = ++dialogId;
      return new Promise((resolve) => {
        this.activeDialog = {
          id,
          title: options.title || '',
          message: options.message || '',
          type: options.type || 'info',
          confirmText: options.confirmText || 'common.confirm',
          cancelText: options.cancelText || 'common.cancel',
          onConfirm: options.onConfirm || null,
          onCancel: options.onCancel || null,
          showCancel: options.showCancel !== false,
          placeholder: options.placeholder || '',
          inputValue: '',
          loading: false,
          resolve,
          ...options,
        };
      });
    },

    closeDialog(confirmed = false) {
      if (this.activeDialog?.resolve) {
        this.activeDialog.resolve(
          confirmed === true
            ? (this.activeDialog.type === 'prompt' ? this.activeDialog.inputValue : true)
            : false
        );
      }
      this.activeDialog = null;
    },

    success(message) {
      return this.addToast(message, 'success');
    },

    error(message, title = '', useDialog = false) {
      if (useDialog) {
        return this.openDialog({
          title: title || 'Error',
          message,
          type: 'error',
          showCancel: false,
        });
      }
      return this.addToast(message, 'error');
    },

    warn(message) {
      return this.addToast(message, 'warning');
    },

    info(message) {
      return this.addToast(message, 'info');
    },

    confirm(message, title = 'common.confirm', onConfirm = null) {
      return this.openDialog({
        title,
        message,
        type: 'confirm',
        onConfirm,
      });
    },

    paymentSuccess() {
      return this.openDialog({
        title: 'admin.paymentConfirmed',
        message: 'orders.receiptUploaded',
        type: 'success',
        confirmText: 'common.ok',
        showCancel: false,
        variant: 'payment',
      });
    },

    apiError(retryCallback) {
      return this.openDialog({
        title: 'errors.genericTitle',
        message: 'errors.loadFailed',
        type: 'error',
        confirmText: 'common.refresh',
        onConfirm: retryCallback,
        variant: 'error',
      });
    },

    identityConfirm() {
      return this.openDialog({
        title: 'profile.security',
        message: 'auth.secureNote',
        type: 'prompt',
        placeholder: 'auth.passwordPlaceholder',
        variant: 'identity',
      });
    },

    async fetchNotifications(limit = 30) {
      const auth = useAuthStore();
      if (!auth.isAuthenticated) return [];

      try {
        const response = await api.get('/notifications', {
          params: { page: 1, limit },
          errorMode: 'silent',
          redirectOn401: false,
        });
        const payload = getApiData(response) || {};
        const notifications = getApiCollection(response, ['notifications']).map(normalizeIncomingNotification);
        this.notifications = notifications;
        this.unreadCount = Number(payload.unreadCount || notifications.filter((item) => !item.read).length || 0);
        return notifications;
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn('[notifications] fetch failed', error);
        }
        return [];
      }
    },

    async refreshRfqViews() {
      const rfqStore = useRfqStore();
      rfqStore.ensureSync();

      const jobs = [];
      if (rfqStore.lastFetchedFeed) jobs.push(rfqStore.fetchFeed({ mode: 'fresh', silent: true }));
      if (rfqStore.lastFetchedPublic) jobs.push(rfqStore.fetchPublicRfqs({ mode: 'fresh', silent: true }));
      if (rfqStore.lastFetchedAdmin) jobs.push(rfqStore.fetchAdminRfqs({ mode: 'fresh', silent: true }));

      if (!jobs.length) {
        jobs.push(rfqStore.fetchFeed({ mode: 'fresh', silent: true }));
      }

      await Promise.allSettled(jobs);
    },

    async refreshProductViews(eventName) {
      const auth = useAuthStore();
      const jobs = [];

      if (eventName === 'product_status_changed' && auth.isVendor) {
        const vendorProductsStore = useVendorProductsStore();
        vendorProductsStore.ensureSync();
        jobs.push(vendorProductsStore.fetchVendorProducts({ mode: 'fresh', silent: true }));
      }

      if (eventName === 'product_moderation_updated' && auth.isAdmin) {
        const adminProductModerationStore = useAdminProductModerationStore();
        adminProductModerationStore.ensureSync();
        jobs.push(adminProductModerationStore.fetchProducts(adminProductModerationStore.activeTab, { mode: 'fresh', silent: true }));
        jobs.push(adminProductModerationStore.fetchSummary({ mode: 'fresh' }));
      }

      if (jobs.length) {
        await Promise.allSettled(jobs);
      }
    },

    async refreshOrderViews() {
      const auth = useAuthStore();
      const jobs = [];

      if (auth.isVendor) {
        const vendorOrdersStore = useVendorOrdersStore();
        jobs.push(vendorOrdersStore.fetchVendorOrders());
      }

      if (`${auth.user?.role || ''}`.toLowerCase() === 'user') {
        const userOrdersStore = useUserOrdersStore();
        jobs.push(userOrdersStore.fetchOrders({ silent: true, fresh: true }));
      }

      if (jobs.length) {
        await Promise.allSettled(jobs);
      }
    },

    async refreshDashboardViews(payload = {}) {
      const auth = useAuthStore();
      const scope = `${payload?.scope || ''}`.toLowerCase();
      const jobs = [];

      if (auth.isVendor && (!scope || scope === 'vendor')) {
        const vendorDashboardStore = useVendorDashboardStore();
        const insightsStore = useInsightsStore();
        const leadsStore = useLeadsStore();
        jobs.push(vendorDashboardStore.fetchOverviewData());
        jobs.push(insightsStore.fetchMarketInsights());
        jobs.push(insightsStore.fetchStockAlerts());
        jobs.push(leadsStore.fetchLeads());
      }

      if (auth.isAdmin && (!scope || scope === 'admin')) {
        const adminStatsStore = useAdminStatsStore();
        jobs.push(adminStatsStore.fetchStats({ silent: true, fresh: true }));
      }

      if (jobs.length) {
        await Promise.allSettled(jobs);
      }
    },

    async handleRealtimeNotification(payload = {}, options = {}) {
      const normalized = normalizeIncomingNotification(payload);
      this.addNotification(normalized);

      if (options.toast !== false && normalized.message) {
        this.addToast(normalized.message, normalized.type || 'info');
      }
    },

    init() {
      const auth = useAuthStore();
      if (!auth.isAuthenticated || this.initialized) return;

      this.fetchNotifications().catch(() => {});

      const connected = socketService.connect(auth.token);
      if (!connected) {
        this.connected = false;
        this.initialized = false;
        return;
      }

      this.connected = true;
      this.initialized = true;

      socketService.on('notification', async (payload) => {
        if (payload?.notificationType === 'SUPPORT_REPLY') return;
        await this.handleRealtimeNotification(payload);
      });

      socketService.on('notification.created', async (payload) => {
        if (payload?.notificationType === 'SUPPORT_REPLY') return;
        await this.handleRealtimeNotification(payload, { toast: false });
      });

      socketService.on('new_rfq', async (data) => {
        const msg = data?.message || data?.messageEn || localize('يوجد طلب عروض جديد مناسب لك', 'New RFQ matching your categories!');
        await this.handleRealtimeNotification({
          ...data,
          message: msg,
          type: 'success',
          link: data?.link || '/dashboard/vendor/leads',
        });
        await this.refreshRfqViews();
      });

      socketService.on('rfq_feed_updated', async () => {
        await this.refreshRfqViews();
      });

      socketService.on('rfq.feed.changed', async () => {
        await this.refreshRfqViews();
      });

      socketService.on('rfq_updated', async () => {
        await this.refreshRfqViews();
      });

      socketService.on('rfq.updated', async () => {
        await this.refreshRfqViews();
      });

      socketService.on('rfq.created', async () => {
        await this.refreshRfqViews();
        await this.refreshDashboardViews({ scope: 'vendor' });
      });

      socketService.on('product_status_changed', async (data) => {
        if (data?.message || data?.messageEn || data?.messageAr) {
          await this.handleRealtimeNotification({
            ...data,
            message: data?.message || data?.messageEn || data?.messageAr,
            type: data?.type || 'info',
          });
        }
        await this.refreshProductViews('product_status_changed');
      });

      socketService.on('product_moderation_updated', async (data) => {
        if (data?.message || data?.messageEn || data?.messageAr) {
          await this.handleRealtimeNotification({
            ...data,
            message: data?.message || data?.messageEn || data?.messageAr,
            type: data?.type || 'info',
          });
        }
        await this.refreshProductViews('product_moderation_updated');
      });

      socketService.on('product.created', async () => {
        await this.refreshProductViews('product_moderation_updated');
        await this.refreshDashboardViews({ scope: 'admin' });
      });

      socketService.on('product.updated', async () => {
        await this.refreshProductViews('product_moderation_updated');
        await this.refreshDashboardViews({ scope: 'admin' });
      });

      socketService.on('product.reviewed', async (data) => {
        await this.refreshProductViews('product_status_changed');
        await this.refreshProductViews('product_moderation_updated');
        await this.refreshDashboardViews({ scope: data?.scope || '' });
      });

      socketService.on('product.deleted', async () => {
        await this.refreshProductViews('product_status_changed');
        await this.refreshProductViews('product_moderation_updated');
      });

      socketService.on('new_message', (data) => {
        const senderId = Number(data?.senderId || data?.message?.sender_id || data?.message?.senderId);
        if (senderId && Number(senderId) === Number(auth.user?.id)) return;
        const senderName = data?.senderName || data?.message?.sender_name || data?.message?.senderName || localize('مستخدم', 'someone');
        const msg = localize(`لديك رسالة جديدة من ${senderName}`, `New message from ${senderName}`);
        this.addNotification({ message: msg, type: 'info', link: '/chat' });
        this.addToast(msg, 'info');
      });

      socketService.on('support_assigned', (data) => {
        const role = `${auth.user?.role || ''}`.toLowerCase();
        if (!['admin', 'owner'].includes(role)) return;
        if (data?.adminId) return;

        const msg = localize('يوجد طلب دعم جديد بانتظار الاستلام', 'New support request waiting');
        this.addNotification({ message: msg, type: 'info', link: `/chat?id=${data?.conversationId || ''}` });
        this.addToast(msg, 'info');
      });

      socketService.on('order_update', (data) => {
        const msg = data?.message || localize(
          `تم تحديث حالة الطلب رقم ${data?.orderId || ''}`,
          `Order #${data?.orderId || ''} status updated to ${data?.status || 'updated'}`
        );
        this.addNotification({ message: msg, type: 'info', link: '/dashboard/user/orders' });
        this.addToast(msg, 'info');
      });

      socketService.on('order.updated', async (data) => {
        await this.refreshOrderViews();
        await this.refreshDashboardViews({ scope: 'vendor' });

        if (data?.orderId) {
          this.addNotification({
            message: localize(
              `Order ${data.orderId} updated`,
              `Order #${data.orderId} updated`
            ),
            type: 'info',
            link: '/dashboard/user/orders',
          });
        }
      });

      socketService.on('dashboard.metrics.changed', async (payload) => {
        await this.refreshDashboardViews(payload);
      });

      socketService.on('quote.created', async () => {
        await this.refreshRfqViews();
      });
    },

    addNotification(notification) {
      const normalized = normalizeIncomingNotification(notification);
      const existingIndex = this.notifications.findIndex((item) => String(item.id) === String(normalized.id));

      if (existingIndex !== -1) {
        this.notifications.splice(existingIndex, 1, {
          ...this.notifications[existingIndex],
          ...normalized,
        });
      } else {
        this.notifications.unshift(normalized);
      }

      if (!normalized.read) {
        const unreadSet = new Set(
          this.notifications
            .filter((item) => !item.read)
            .map((item) => String(item.id))
        );
        this.unreadCount = unreadSet.size;
      }
    },

    async markAsRead(id) {
      const notification = this.notifications.find((item) => String(item.id) === String(id));
      if (!notification || notification.read) return;

      notification.read = true;
      this.unreadCount = Math.max(0, this.unreadCount - 1);

      if (/^\d+$/.test(String(id))) {
        try {
          await api.patch(`/notifications/${id}/read`, null, {
            errorMode: 'silent',
            redirectOn401: false,
          });
        } catch (error) {
          if (import.meta.env.DEV) {
            console.warn('[notifications] markAsRead failed', error);
          }
        }
      }
    },

    markAllAsRead() {
      this.notifications.forEach((notification) => {
        notification.read = true;
      });
      this.unreadCount = 0;
      api.patch('/notifications/read-all', null, {
        errorMode: 'silent',
        redirectOn401: false,
      }).catch(() => {});
    },

    disconnect() {
      socketService.off('notification');
      socketService.off('notification.created');
      socketService.off('new_rfq');
      socketService.off('rfq.created');
      socketService.off('rfq.feed.changed');
      socketService.off('rfq_feed_updated');
      socketService.off('rfq_updated');
      socketService.off('rfq.updated');
      socketService.off('product.created');
      socketService.off('product.updated');
      socketService.off('product.reviewed');
      socketService.off('product.deleted');
      socketService.off('product_status_changed');
      socketService.off('product_moderation_updated');
      socketService.off('new_message');
      socketService.off('support_assigned');
      socketService.off('order_update');
      socketService.off('order.updated');
      socketService.off('dashboard.metrics.changed');
      socketService.off('quote.created');
      socketService.disconnect();
      this.connected = false;
      this.initialized = false;
    },
  },
});

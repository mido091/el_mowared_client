import { defineStore } from 'pinia';
import { useAuthStore } from './auth';
import socketService from '@/services/socket.service';

let toastId = 0;
let dialogId = 0;

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    notifications: [],
    unreadCount: 0,
    connected: false,
    initialized: false,
    toasts: [],
    activeDialog: null
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
          ...options
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
          showCancel: false
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
        onConfirm
      });
    },

    paymentSuccess() {
      return this.openDialog({
        title: 'admin.paymentConfirmed',
        message: 'orders.receiptUploaded',
        type: 'success',
        confirmText: 'common.ok',
        showCancel: false,
        variant: 'payment'
      });
    },

    apiError(retryCallback) {
      return this.openDialog({
        title: 'errors.genericTitle',
        message: 'errors.loadFailed',
        type: 'error',
        confirmText: 'common.refresh',
        onConfirm: retryCallback,
        variant: 'error'
      });
    },

    identityConfirm() {
      return this.openDialog({
        title: 'profile.security',
        message: 'auth.secureNote',
        type: 'prompt',
        placeholder: 'auth.passwordPlaceholder',
        variant: 'identity'
      });
    },

    init() {
      const auth = useAuthStore();
      if (!auth.isAuthenticated || this.initialized) return;

      const connected = socketService.connect(auth.token);
      if (!connected) {
        this.connected = false;
        this.initialized = false;
        return;
      }

      this.connected = true;
      this.initialized = true;

      const currentLocale = () => localStorage.getItem('locale') || document.documentElement.lang || 'en';
      const localize = (ar, en) => (currentLocale().startsWith('ar') ? ar : en);

      socketService.on('notification', (payload) => {
        if (payload?.notificationType === 'SUPPORT_REPLY') return;
        const message = payload?.messageAr || payload?.message || payload?.titleAr || payload?.titleEn || '';
        this.addNotification({ ...payload, message });
        if (message) this.addToast(message, payload?.type || 'info');
      });

      socketService.on('new_rfq', (data) => {
        const msg = data?.message || localize('يوجد طلب عروض جديد مناسب لك', 'New RFQ matching your categories!');
        this.addNotification({ message: msg, type: 'success', link: '/dashboard/vendor/leads' });
        this.addToast(msg, 'success');
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
    },

    addNotification(notification) {
      this.notifications.unshift({
        id: Date.now() + Math.random(),
        read: false,
        timestamp: new Date().toISOString(),
        ...notification
      });
      this.unreadCount += 1;
    },

    markAsRead(id) {
      const notification = this.notifications.find((item) => item.id === id);
      if (notification && !notification.read) {
        notification.read = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      }
    },

    markAllAsRead() {
      this.notifications.forEach((notification) => {
        notification.read = true;
      });
      this.unreadCount = 0;
    },

    disconnect() {
      socketService.off('notification');
      socketService.off('new_rfq');
      socketService.off('new_message');
      socketService.off('support_assigned');
      socketService.off('order_update');
      socketService.disconnect();
      this.connected = false;
      this.initialized = false;
    }
  }
});

import { useNotificationStore } from '@/stores/notificationStore';

export function useToast() {
  const store = useNotificationStore();

  const showToast = (message, type = 'info', duration = 4000) => {
    store.addToast(message, type, duration);
  };

  return {
    showToast,
    success: (msg, d) => showToast(msg, 'success', d),
    error:   (msg, d) => showToast(msg, 'error',   d),
    warning: (msg, d) => showToast(msg, 'warning', d),
    info:    (msg, d) => showToast(msg, 'info',    d),
  };
}

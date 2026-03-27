import { useNotificationStore } from '@/stores/notificationStore';
import router from '@/router';

/**
 * Natively intercepts and elegantly handles complex edge-cases and race conditions in production.
 * @param {Error} error The caught error instance (typically Axios error)
 * @param {string} context Optional contextual descriptor
 */
export const edgeCaseHandler = (error, context = '') => {
  const notificationStore = useNotificationStore();
  const status = error?.response?.status;
  const message = error?.response?.data?.message || error.message || 'An unexpected error occurred.';

  // 1. Race Conditions / Max Capacity Constraints
  if (status === 400 && message.toLowerCase().includes('max response limit')) {
    notificationStore.warn('Lead Locked: This RFQ has reached its maximum responder capacity right as you submitted.');
    return true;
  }

  // 2. Expiration Bounds
  if (status === 400 && message.toLowerCase().includes('expired')) {
    notificationStore.warn('Lead Closed: This RFQ has expired and is no longer accepting offers natively.');
    router.push('/dashboard/vendor/rfq-offers');
    return true;
  }

  // 3. Not Found / Soft Deletions
  if (status === 404) {
    notificationStore.error(`Record not found ${context}. It may have been removed or secured by someone else.`);
    return true;
  }

  // 4. Rate Limiting / Abuse Protection
  if (status === 429) {
    notificationStore.warn('Slow down: You are performing actions too rapidly. Wait a moment to proceed.');
    return true;
  }

  // Default passthrough fallback
  notificationStore.error(message);
  return false;
};

import api from '@/services/api';
import { logger } from '@/utils/logger';

/**
 * Enterprise Audit Trail Composable
 * Logs critical actions locally (for UI feedback) and remotely (for backend persistence).
 */
export const useAudit = () => {
  /**
   * Logs a critical action.
   * @param {string} action - e.g., 'update_role', 'approve_payment', 'cancel_order'
   * @param {object} payload - Action details
   */
  const logAction = async (action, payload = {}) => {
    const timestamp = new Date().toISOString();
    
    // 1. Local logging for debug/observability
    logger.info(`📝 [Audit] Action: ${action}`, payload);

    // 2. Remote logging (API)
    try {
      // POST /audit-logs (or similar endpoint)
      await api.post('/audit-logs', {
        action,
        payload,
        timestamp,
        path: window.location.pathname,
      });
    } catch (err) {
      // Fail silently for audit logs to not block the main UX, but warn in console
      logger.warn(`Failed to persist audit log: ${action}`, err);
    }
  };

  return { logAction };
};

/**
 * @file api.js
 * @description Singleton Axios HTTP client for all API communication.
 *
 * Design decisions:
 *  - A single shared instance ensures consistent headers, interceptors, and
 *    retry logic across every store and component in the application.
 *  - The base URL is resolved from the Vite env variable VITE_API_URL, with
 *    a fallback to the production Vercel API endpoint.
 *
 * Request interceptor responsibilities:
 *  1. Attaches the JWT Bearer token from localStorage to Authorization header.
 *  2. Sets the Accept-Language header from the stored locale so the server
 *     returns bilingual error messages in the user's preferred language.
 *  3. For FormData uploads: removes Content-Type so the browser sets the
 *     multipart boundary automatically, and extends the timeout to 60 seconds.
 *  4. Sanitizes null JSON bodies (avoids sending "null" as a JSON string).
 *
 * Response interceptor error handling:
 *  - 401: Clears session, dispatches app:logout event, redirects to /login.
 *  - 403: Dispatches app:forbidden event for layout-level route guards.
 *  - 429: Dispatches app:ratelimit event for global toast notification.
 *  - errorMode: 'inline' → errors stored in store.error (no toast).
 *  - errorMode: 'silent' → errors completely suppressed (no UI feedback).
 *  - errorMode: 'toast'  → default: shows a toast notification.
 *
 * Retry policy (axios-retry):
 *  - 3 retries with exponential backoff.
 *  - Retries on network errors and idempotent requests returning 5xx.
 */

import axios from 'axios';
import axiosRetry from 'axios-retry';
import { getLocalizedErrorMessage, handleError, normalizeError } from '@/utils/errorHandler';
import { useNotificationStore } from '@/stores/notificationStore';
import { logger } from '@/utils/logger';

const baseURL = import.meta.env.VITE_API_URL || 'https://el-mowared-server.vercel.app/api/v1';

// One shared Axios instance keeps auth headers, locale, retries, and error normalization
// consistent across the entire frontend.
const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

axiosRetry(api, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status >= 500;
  },
});

api.interceptors.request.use(
  (config) => {
    const method = String(config.method || '').toLowerCase();
    const sendsJsonBody = ['post', 'put', 'patch'].includes(method);

    if (sendsJsonBody && config.data === null) {
      config.data = undefined;
    }

    logger.debug(`API ${config.method?.toUpperCase()} ${config.url}`, {
      hasParams: !!config.params,
      hasBody: !!config.data
    });

    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      // Let the browser choose the multipart boundary header automatically.
      if (config.headers) {
        delete config.headers['Content-Type'];
      }
      config.timeout = Math.max(config.timeout || 0, 60000);
    }

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const locale = localStorage.getItem('locale') || (document.documentElement.lang || 'en');
    config.headers['Accept-Language'] = locale;

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    logger.debug(`API Success ${response.config.url}`, {
      status: response.status
    });

    return response.data || response;
  },
  (error) => {
    const { response } = error;
    const normalized = normalizeError(error);
    const errorMode = error.config?.errorMode || 'toast';
    error.normalized = normalized;
    error.fields = normalized.fields;
    error.userMessage = normalized.message;
    error.requestId = normalized.requestId;
    error.status = normalized.status || error.status;
    error.code = normalized.code || error.code;

    handleError(error, `API:${error.config?.url}`, { errorMode });

    if (response) {
      const { status } = response;

      if (status === 401) {
        // A centralized unauthorized handler keeps session expiry behavior consistent
        // regardless of which store/view triggered the request.
        const notifications = useNotificationStore();
        notifications.error(normalized.message);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new CustomEvent('app:logout'));

        if (error.config?.redirectOn401 !== false && !window.location.pathname.includes('/login')) {
          setTimeout(() => { window.location.href = '/login'; }, 2000);
        }
      } else if (status === 403) {
        // Role/permission failures are surfaced as events so layouts and pages can react uniformly.
        window.dispatchEvent(new CustomEvent('app:forbidden', { detail: getLocalizedErrorMessage(normalized) }));
      } else if (status === 429) {
        window.dispatchEvent(new CustomEvent('app:ratelimit'));
      }
    }

    return Promise.reject(error);
  }
);

export default api;

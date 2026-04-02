import axios from 'axios';
import axiosRetry from 'axios-retry';
import { getLocalizedErrorMessage, handleError, normalizeError } from '@/utils/errorHandler';
import { useNotificationStore } from '@/stores/notificationStore';
import { logger } from '@/utils/logger';

const baseURL = import.meta.env.VITE_API_URL || 'https://el-mowared-server.vercel.app/api/v1';

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
        const notifications = useNotificationStore();
        notifications.error(normalized.message);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new CustomEvent('app:logout'));

        if (error.config?.redirectOn401 !== false && !window.location.pathname.includes('/login')) {
          setTimeout(() => { window.location.href = '/login'; }, 2000);
        }
      } else if (status === 403) {
        window.dispatchEvent(new CustomEvent('app:forbidden', { detail: getLocalizedErrorMessage(normalized) }));
      } else if (status === 429) {
        window.dispatchEvent(new CustomEvent('app:ratelimit'));
      }
    }

    return Promise.reject(error);
  }
);

export default api;

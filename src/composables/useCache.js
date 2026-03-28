import { reactive } from 'vue';

const cache = reactive(new Map());
const TTL = 1000 * 60 * 5; // 5 minutes default

export const useCache = () => {
  const getCacheKey = (key, params = {}) => {
    const locale = localStorage.getItem('locale') || 'en';
    const paramStr = JSON.stringify(params);
    return `${locale}:${key}:${paramStr}`;
  };

  const setItem = (key, data, params = {}) => {
    const cacheKey = getCacheKey(key, params);
    cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });
  };

  const getItem = (key, params = {}) => {
    const cacheKey = getCacheKey(key, params);
    const cached = cache.get(cacheKey);

    if (!cached) return null;

    const isStale = Date.now() - cached.timestamp > TTL;
    return {
      data: cached.data,
      isStale,
    };
  };

  const clearCache = () => cache.clear();

  const invalidate = (keyPrefix) => {
    if (!keyPrefix) return;

    for (const key of Array.from(cache.keys())) {
      if (key.includes(`:${keyPrefix}:`)) {
        cache.delete(key);
      }
    }
  };

  return { setItem, getItem, clearCache, invalidate, getCacheKey };
};

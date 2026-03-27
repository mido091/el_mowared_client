import { computed, onBeforeUnmount, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import { useSettingsStore } from '@/stores/settings';
import { useI18n } from 'vue-i18n';

const MANAGED_SELECTOR = '[data-elmowared-seo="true"]';
const structuredDataMap = new Map();
const preloadLinkMap = new Map();
const VALID_PRELOAD_AS_VALUES = new Set([
  'audio',
  'document',
  'embed',
  'fetch',
  'font',
  'image',
  'object',
  'script',
  'style',
  'track',
  'video',
  'worker'
]);

const toAbsoluteUrl = (value, baseUrl) => {
  if (typeof value !== 'string') return '';
  const normalizedValue = value.trim();
  if (!normalizedValue) return '';

  try {
    return new URL(normalizedValue, baseUrl).toString();
  } catch {
    return '';
  }
};

const upsertTag = (selector, factory) => {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = factory();
    element.setAttribute('data-elmowared-seo', 'true');
    document.head.appendChild(element);
  }
  return element;
};

const setMeta = (name, content, attribute = 'name') => {
  const selector = `meta[${attribute}="${name}"]`;
  const existing = document.head.querySelector(selector);

  if (!content) {
    existing?.remove();
    return;
  }

  const element = existing || upsertTag(selector, () => document.createElement('meta'));
  element.setAttribute(attribute, name);
  element.setAttribute('content', content);
};

const setLink = (rel, href, extras = {}) => {
  const selector = rel === 'canonical'
    ? `link[rel="${rel}"]`
    : `link[rel="${rel}"][href="${href}"]${extras.as ? `[as="${extras.as}"]` : ''}`;
  const existing = document.head.querySelector(selector);

  if (!href) {
    existing?.remove();
    return;
  }

  const element = existing || upsertTag(selector, () => document.createElement('link'));
  element.setAttribute('rel', rel);
  element.setAttribute('href', href);

  Object.entries(extras).forEach(([key, value]) => {
    if (value) element.setAttribute(key, value);
    else element.removeAttribute(key);
  });
};

const syncPreloadLinks = (urls, baseUrl, as = 'image') => {
  const normalizedAs = VALID_PRELOAD_AS_VALUES.has(as) ? as : 'image';
  const items = Array.isArray(urls) ? urls : [];
  const nextKeys = new Set();

  items.forEach((url, index) => {
    const href = toAbsoluteUrl(url, baseUrl);
    if (!href) return;

    const key = `${normalizedAs}:${index}`;
    nextKeys.add(key);
    const selector = `link[rel="preload"][data-preload-key="${key}"]`;
    const element = upsertTag(selector, () => {
      const link = document.createElement('link');
      link.setAttribute('rel', 'preload');
      link.setAttribute('href', href);
      link.setAttribute('as', normalizedAs);
      link.setAttribute('data-preload-key', key);
      return link;
    });

    element.setAttribute('rel', 'preload');
    element.setAttribute('href', href);
    element.setAttribute('as', normalizedAs);
    preloadLinkMap.set(key, element);
  });

  for (const [key, element] of preloadLinkMap.entries()) {
    if (!nextKeys.has(key)) {
      element.remove();
      preloadLinkMap.delete(key);
    }
  }
};

const syncStructuredData = (payload) => {
  const items = Array.isArray(payload) ? payload.filter(Boolean) : (payload ? [payload] : []);
  const nextKeys = new Set();

  items.forEach((item, index) => {
    const key = String(index);
    nextKeys.add(key);
    const selector = `script[type="application/ld+json"][data-schema-key="${key}"]`;
    const element = upsertTag(selector, () => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-schema', 'page');
      script.setAttribute('data-schema-key', key);
      return script;
    });
    element.textContent = JSON.stringify(item);
    structuredDataMap.set(key, element);
  });

  for (const [key, element] of structuredDataMap.entries()) {
    if (!nextKeys.has(key)) {
      element.remove();
      structuredDataMap.delete(key);
    }
  }
};

export const useSeo = (options) => {
  const route = useRoute();
  const settingsStore = useSettingsStore();
  const { locale } = useI18n();

  const fallbackTitle = computed(() => settingsStore.siteName || 'Elmowared');
  const baseUrl = computed(() => import.meta.env.VITE_SITE_URL || window.location.origin);

  watchEffect(() => {
    const resolved = typeof options === 'function' ? options() : options;
    const title = resolved.title || fallbackTitle.value;
    const description = resolved.description
      || (locale.value === 'ar' ? settingsStore.seo.descAr : settingsStore.seo.descEn)
      || (locale.value === 'ar' ? settingsStore.siteDescriptionAr : settingsStore.siteDescriptionEn)
      || '';
    const image = toAbsoluteUrl(resolved.image || settingsStore.seo.ogImage || settingsStore.logo || '', baseUrl.value);
    const canonical = toAbsoluteUrl(resolved.canonical || `${baseUrl.value}${route.fullPath}`, baseUrl.value);
    const robots = resolved.robots || '';

    document.title = title;
    setMeta('description', description);
    setMeta('keywords', resolved.keywords || settingsStore.seo.keywords || '');
    setMeta('robots', robots);
    setMeta('og:title', title, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:type', resolved.ogType || 'website', 'property');
    setMeta('og:url', canonical, 'property');
    if (image) setMeta('og:image', image, 'property');
    setMeta('twitter:card', image ? 'summary_large_image' : 'summary');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    if (image) setMeta('twitter:image', image);
    setLink('canonical', canonical);

    syncPreloadLinks(resolved.preloadImages, baseUrl.value, 'image');

    syncStructuredData(resolved.structuredData || resolved.jsonLd || null);
  });

  onBeforeUnmount(() => {
    document.head.querySelectorAll(MANAGED_SELECTOR).forEach((element) => element.remove());
    structuredDataMap.clear();
    preloadLinkMap.clear();
  });
};

import i18n from '@/locales';

export const getCurrentLocale = () => i18n.global.locale.value || 'en';

export const isLocalizedMessage = (value) =>
  !!value &&
  typeof value === 'object' &&
  typeof value.en === 'string' &&
  typeof value.ar === 'string';

export const resolveLocalizedText = (value, locale = getCurrentLocale(), fallback = '') => {
  if (value == null || value === '') return fallback;

  if (isLocalizedMessage(value)) {
    return locale === 'ar' ? value.ar : value.en;
  }

  if (typeof value === 'string') {
    return i18n.global.te(value) ? i18n.global.t(value) : value;
  }

  return fallback;
};

export const toLocalizedMessage = (value, fallbackKey = 'errors.generic') => {
  if (isLocalizedMessage(value)) return value;

  if (typeof value === 'string') {
    if (i18n.global.te(value, 'en') || i18n.global.te(value, 'ar')) {
      return {
        en: i18n.global.t(value, {}, 'en'),
        ar: i18n.global.t(value, {}, 'ar')
      };
    }

    return { en: value, ar: value };
  }

  return {
    en: i18n.global.t(fallbackKey, {}, 'en'),
    ar: i18n.global.t(fallbackKey, {}, 'ar')
  };
};

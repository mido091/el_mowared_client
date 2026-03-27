import i18n from '@/locales';
import { useNotificationStore } from '@/stores/notificationStore';
import { isLocalizedMessage, resolveLocalizedText, toLocalizedMessage } from '@/utils/localizedText';

const STATUS_FALLBACK_KEYS = {
  400: 'errors.validation',
  401: 'errors.unauthorized',
  403: 'errors.forbidden',
  404: 'errors.notFoundShort',
  429: 'errors.rateLimited',
  500: 'errors.server'
};

const CLIENT_VALIDATION_MAP = {
  'Email is required': { en: 'Email is required.', ar: 'البريد الإلكتروني مطلوب.' },
  'Invalid email address': { en: 'Please enter a valid email address.', ar: 'يرجى إدخال بريد إلكتروني صحيح.' },
  'Password must be at least 6 characters': { en: 'Password must be at least 6 characters.', ar: 'يجب أن تكون كلمة المرور 6 أحرف على الأقل.' },
  'Password must be at least 8 characters': { en: 'Password must be at least 8 characters.', ar: 'يجب أن تكون كلمة المرور 8 أحرف على الأقل.' },
  'First name must be at least 2 characters': { en: 'First name must be at least 2 characters.', ar: 'يجب أن يكون الاسم الأول حرفين على الأقل.' },
  'Last name is required': { en: 'Last name is required.', ar: 'اسم العائلة مطلوب.' },
  'Phone number is too short': { en: 'Phone number is too short.', ar: 'رقم الهاتف قصير جدًا.' },
  'Title is too short': { en: 'Title is too short.', ar: 'العنوان قصير جدًا.' },
  'Category is required': { en: 'Category is required.', ar: 'الفئة مطلوبة.' },
  'Description is too short': { en: 'Description is too short.', ar: 'الوصف قصير جدًا.' },
  'Quantity must be positive': { en: 'Quantity must be greater than zero.', ar: 'يجب أن تكون الكمية أكبر من صفر.' },
  'At least one category is required': { en: 'Please select at least one category.', ar: 'يرجى اختيار فئة واحدة على الأقل.' },
  'Company name is too short': { en: 'Company name is too short.', ar: 'اسم الشركة قصير جدًا.' },
  "Passwords don't match": { en: "Passwords don't match.", ar: 'كلمتا المرور غير متطابقتين.' }
};

const getFallbackMessage = (status) => {
  const key = STATUS_FALLBACK_KEYS[status] || 'errors.generic';
  return {
    en: i18n.global.t(key, {}, 'en'),
    ar: i18n.global.t(key, {}, 'ar')
  };
};

export const normalizeFieldErrors = (fields = {}) => {
  if (!fields || typeof fields !== 'object') return {};

  return Object.fromEntries(
    Object.entries(fields).map(([field, value]) => [field, toLocalizedMessage(value, 'errors.validation')])
  );
};

export const normalizeError = (error) => {
  const status = Number(error?.response?.data?.status || error?.response?.status || error?.status || 0) || null;
  const data = error?.response?.data || {};
  const code = data?.code || error?.code || 'UNKNOWN_ERROR';
  const isNetwork = !error?.response;
  const rawMessage = data?.message || error?.message;

  const message = isNetwork
    ? {
        en: i18n.global.t('errors.network', {}, 'en'),
        ar: i18n.global.t('errors.network', {}, 'ar')
      }
    : isLocalizedMessage(rawMessage)
      ? rawMessage
      : rawMessage
        ? toLocalizedMessage(rawMessage, STATUS_FALLBACK_KEYS[status] || 'errors.generic')
        : getFallbackMessage(status);

  const fields = normalizeFieldErrors(data?.fields || error?.fields);

  return {
    status,
    code,
    message,
    fields,
    requestId: data?.requestId || error?.requestId || null,
    isValidation: status === 400 && Object.keys(fields).length > 0,
    isNetwork,
    raw: error
  };
};

export const getLocalizedErrorMessage = (error, locale = i18n.global.locale.value || 'en') =>
  resolveLocalizedText(error?.message || error, locale, resolveLocalizedText(getFallbackMessage(500), locale));

export const getFieldErrorMessage = (fieldErrors, field, locale = i18n.global.locale.value || 'en') =>
  resolveLocalizedText(fieldErrors?.[field], locale, '');

export const clearFieldError = (fieldErrors, field) => {
  if (fieldErrors && Object.prototype.hasOwnProperty.call(fieldErrors, field)) {
    delete fieldErrors[field];
  }
};

export const mapClientValidationIssues = (issues = []) =>
  Object.fromEntries(
    issues.map((issue) => {
      const key = Array.isArray(issue.path) && issue.path.length ? issue.path[0] : 'general';
      const localized = CLIENT_VALIDATION_MAP[issue.message] || toLocalizedMessage(issue.message, 'errors.validation');
      return [key, localized];
    })
  );

export const handleError = (error, context = 'App', options = {}) => {
  const store = useNotificationStore();
  const normalized = normalizeError(error);
  const errorMode = options.errorMode || error?.config?.errorMode || 'toast';

  if (import.meta.env.DEV) {
    console.group(`[${context}] Error ${normalized.code}`);
    console.error(error);
    console.log('Normalized:', normalized);
    console.groupEnd();
  }

  if (errorMode === 'toast') {
    store.error(normalized.message);
  }

  return normalized;
};

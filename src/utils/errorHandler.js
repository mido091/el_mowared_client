/**
 * @file utils/errorHandler.js
 * @description Client-side error normalization and display utilities.
 *
 * This module bridges the gap between raw Axios errors and the store/component layer.
 * It provides a consistent interface for:
 *  1. Normalizing any error (network, API, validation) into a predictable shape.
 *  2. Localizing error messages to the user's current language (EN/AR).
 *  3. Routing errors to the correct display channel (toast, inline, or silent).
 *
 * Error message resolution priority (in normalizeError):
 *  a. Network error (no response) → 'errors.network' bilingual fallback.
 *  b. Bilingual message from server ({en, ar}) → used as-is.
 *  c. Plain English message from server → mapped via toLocalizedMessage().
 *  d. No message → STATUS_FALLBACK_KEYS lookup + resolveFallbackByKey().
 *
 * Error display modes (errorMode):
 *  - 'toast'   (default) → Shows a notification toast with the error message.
 *  - 'inline'  → Errors are stored in store.error / store.fieldErrors (no toast).
 *  - 'silent'  → Errors are completely suppressed (used for background refetch).
 */

import i18n from '@/locales';
import { useNotificationStore } from '@/stores/notificationStore';
import { isLocalizedMessage, resolveLocalizedText, toLocalizedMessage } from '@/utils/localizedText';

/**
 * Maps HTTP status codes to i18n fallback keys used when no server message is provided.
 * @type {Object.<number, string>}
 */
const STATUS_FALLBACK_KEYS = {
  400: 'errors.validation',
  401: 'errors.unauthorized',
  403: 'errors.forbidden',
  404: 'errors.notFoundShort',
  429: 'errors.rateLimited',
  500: 'errors.server'
};

const FALLBACK_MESSAGES = {
  'errors.generic': {
    en: 'Something went wrong, please try again.',
    ar: 'حدث خطأ، حاول مرة أخرى.'
  },
  'errors.network': {
    en: 'Network error. Please check your connection and try again.',
    ar: 'حدثت مشكلة في الاتصال. تحقق من الشبكة ثم حاول مرة أخرى.'
  },
  'errors.server': {
    en: 'Server error. Please try again in a moment.',
    ar: 'حدث خطأ في الخادم. حاول مرة أخرى بعد قليل.'
  },
  'errors.validation': {
    en: 'Please review the highlighted fields and try again.',
    ar: 'يرجى مراجعة الحقول المحددة ثم المحاولة مرة أخرى.'
  },
  'errors.unauthorized': {
    en: 'You need to sign in to continue.',
    ar: 'تحتاج إلى تسجيل الدخول للمتابعة.'
  },
  'errors.forbidden': {
    en: 'You are not allowed to perform this action.',
    ar: 'غير مسموح لك بتنفيذ هذا الإجراء.'
  },
  'errors.notFoundShort': {
    en: 'The requested item was not found.',
    ar: 'العنصر المطلوب غير موجود.'
  },
  'errors.rateLimited': {
    en: 'Too many requests. Please try again shortly.',
    ar: 'هناك عدد كبير من الطلبات. يرجى المحاولة بعد قليل.'
  }
};

/**
 * Resolves a fallback bilingual message by FALLBACK_MESSAGES key.
 * Returns the generic fallback if the key is not found.
 * @param {string} key - A FALLBACK_MESSAGES key (e.g. 'errors.network').
 * @returns {{en: string, ar: string}}
 */
const resolveFallbackByKey = (key) => FALLBACK_MESSAGES[key] || FALLBACK_MESSAGES['errors.generic'];

/**
 * Maps common client-side validation message strings (e.g. from Zod) to bilingual objects.
 * This prevents English-only messages from appearing in UI for Arabic users.
 * Add new entries here as new form validation messages are introduced.
 * @type {Object.<string, {en: string, ar: string}>}
 */
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
  return resolveFallbackByKey(key);
};

/**
 * Converts raw field errors map (from API response) into bilingual message objects.
 * Each field value is passed through toLocalizedMessage() to ensure {en, ar} format.
 *
 * @param {Object.<string, *>} [fields={}] - Raw field error map from backend response.
 * @returns {Object.<string, {en: string, ar: string}>} Normalized per-field bilingual errors.
 */
export const normalizeFieldErrors = (fields = {}) => {
  if (!fields || typeof fields !== 'object') return {};

  return Object.fromEntries(
    Object.entries(fields).map(([field, value]) => [field, toLocalizedMessage(value, 'errors.validation')])
  );
};

/**
 * Normalizes any Axios/API error into a predictable structured object.
 * This is the primary error normalization entry point for all Pinia stores.
 *
 * @param {Error} error - Raw error from Axios or thrown by store logic.
 * @returns {{
 *   status: number|null,
 *   code: string,
 *   message: {en: string, ar: string},
 *   fields: Object.<string, {en: string, ar: string}>,
 *   requestId: string|null,
 *   isValidation: boolean,
 *   isNetwork: boolean,
 *   raw: Error
 * }}
 */
export const normalizeError = (error) => {
  const status = Number(error?.response?.data?.status || error?.response?.status || error?.status || 0) || null;
  const data = error?.response?.data || {};
  const code = data?.code || error?.code || 'UNKNOWN_ERROR';
  const isNetwork = !error?.response;  // No response means a network/timeout failure
  const rawMessage = data?.message || error?.message;

  // Resolve the bilingual message using the priority chain described in the file header
  const message = isNetwork
    ? resolveFallbackByKey('errors.network')
    : isLocalizedMessage(rawMessage)
      ? rawMessage                                             // Server sent bilingual {en, ar}
      : rawMessage
        ? toLocalizedMessage(rawMessage, STATUS_FALLBACK_KEYS[status] || 'errors.generic')  // Plain string
        : getFallbackMessage(status);                          // No message at all

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

/**
 * Returns a localized plain string version of an error's message for the given locale.
 * Used where a string (not an object) is needed (e.g., window.alert, DOM attributes).
 *
 * @param {Error|{message: {en:string, ar:string}}|string} error - Error or message object.
 * @param {string} [locale] - Target locale ('en' or 'ar'). Defaults to active i18n locale.
 * @returns {string} Localized error string.
 */
export const getLocalizedErrorMessage = (error, locale = i18n.global.locale.value || 'en') =>
  resolveLocalizedText(error?.message || error, locale, resolveLocalizedText(getFallbackMessage(500), locale));

/**
 * Extracts a localized plain string for a specific field from a fieldErrors map.
 *
 * @param {Object.<string, {en:string, ar:string}>} fieldErrors - Bilingual field error map.
 * @param {string} field - The field key to look up.
 * @param {string} [locale] - Target locale. Defaults to active i18n locale.
 * @returns {string} Localized field error string, or empty string if not found.
 */
export const getFieldErrorMessage = (fieldErrors, field, locale = i18n.global.locale.value || 'en') =>
  resolveLocalizedText(fieldErrors?.[field], locale, '');

/**
 * Removes a single field from a mutable fieldErrors object.
 * Useful for clearing a field error when the user starts correcting it.
 *
 * @param {Object} fieldErrors - The fieldErrors object from a Pinia store (mutated in-place).
 * @param {string} field - The field key to clear.
 */
export const clearFieldError = (fieldErrors, field) => {
  if (fieldErrors && Object.prototype.hasOwnProperty.call(fieldErrors, field)) {
    delete fieldErrors[field];
  }
};

/**
 * Converts an array of client-side validation issues (e.g. from Zod) into
 * a bilingual per-field error map consumable by stores.
 * Maps known issue messages via CLIENT_VALIDATION_MAP before falling back to toLocalizedMessage().
 *
 * @param {{ path: string[], message: string }[]} [issues=[]] - Zod or manual validation issues.
 * @returns {Object.<string, {en: string, ar: string}>} Per-field bilingual error map.
 */
export const mapClientValidationIssues = (issues = []) =>
  Object.fromEntries(
    issues.map((issue) => {
      const key = Array.isArray(issue.path) && issue.path.length ? issue.path[0] : 'general';
      const localized = CLIENT_VALIDATION_MAP[issue.message] || toLocalizedMessage(issue.message, 'errors.validation');
      return [key, localized];
    })
  );

/**
 * Central error handler for use in Axios response interceptors and store catch blocks.
 * Determines the display mode and routes the error to the appropriate UI channel.
 *
 * @param {Error} error - Raw error object.
 * @param {string} [context='App'] - Descriptive label shown in dev console logs.
 * @param {{ errorMode?: 'toast'|'inline'|'silent' }} [options={}] - Display mode override.
 * @returns {{ status, code, message, fields, requestId, isValidation, isNetwork, raw }} Normalized error.
 */
export const handleError = (error, context = 'App', options = {}) => {
  const store = useNotificationStore();
  const normalized = normalizeError(error);
  const errorMode = options.errorMode || error?.config?.errorMode || 'toast';

  // In development, log structured error details to the console for debugging
  if (import.meta.env.DEV) {
    console.group(`[${context}] Error ${normalized.code}`);
    console.error(error);
    console.log('Normalized:', normalized);
    console.groupEnd();
  }

  // Only show the toast if the errorMode is 'toast' (default behavior)
  // 'inline' mode: caller stores error in store.error themselves
  // 'silent' mode: error is completely suppressed (background operations)
  if (errorMode === 'toast') {
    store.error(normalized.message);
  }

  return normalized;
};

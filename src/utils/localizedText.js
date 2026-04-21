/**
 * @file localizedText.js
 * @description Core utilities for resolving bilingual (EN/AR) text values.
 *
 * The platform uses two text representation models:
 *  1. **Bilingual object**:  `{ en: "...", ar: "..." }` — returned by the server for
 *     error messages, and used throughout Pinia stores.
 *  2. **i18n key**:  a string like `"errors.validation"` that exists in locale files
 *     and can be translated by vue-i18n.
 *  3. **Plain string**: a raw English message that may or may not be an i18n key.
 *
 * These utilities provide a unified interface for resolving any of the three forms
 * into a plain displayable string (for the current locale) or a bilingual object.
 */

import i18n from '@/locales';

/**
 * Returns the active vue-i18n locale code (e.g. 'en' or 'ar').
 * @returns {string}
 */
export const getCurrentLocale = () => i18n.global.locale.value || 'en';

/**
 * Type guard: returns true if a value is a bilingual object `{ en: string, ar: string }`.
 *
 * @param {*} value - The value to test.
 * @returns {boolean}
 */
export const isLocalizedMessage = (value) =>
  !!value &&
  typeof value === 'object' &&
  typeof value.en === 'string' &&
  typeof value.ar === 'string';

/**
 * Resolves any text value into a plain localized string for the given locale.
 *
 * Resolution strategy:
 *  1. Null/empty → return `fallback`.
 *  2. Bilingual object `{ en, ar }` → return the string for the requested locale.
 *  3. i18n key string (exists in locale files) → return the translated string.
 *  4. Any other string → return as-is.
 *  5. Anything else → return `fallback`.
 *
 * @param {*}       value          - Value to resolve (any type).
 * @param {string}  [locale]       - Target locale code. Defaults to active i18n locale.
 * @param {string}  [fallback='']  - Value returned when resolution yields nothing.
 * @returns {string} Resolved localized plain string.
 */
export const resolveLocalizedText = (value, locale = getCurrentLocale(), fallback = '') => {
  if (value == null || value === '') return fallback;

  // Case 2: bilingual object
  if (isLocalizedMessage(value)) {
    return locale === 'ar' ? value.ar : value.en;
  }

  // Case 3 & 4: raw string — attempt i18n translation, fall back to raw value
  if (typeof value === 'string') {
    return i18n.global.te(value) ? i18n.global.t(value) : value;
  }

  return fallback;
};

/**
 * Converts any value into a bilingual `{ en, ar }` message object.
 *
 * Conversion logic:
 *  1. Already bilingual → return as-is.
 *  2. String that is a known i18n key → translate into both EN and AR.
 *  3. Any other string → use as the EN message; AR mirrors EN (best-effort).
 *  4. Anything else → translate `fallbackKey` into both locales.
 *
 * @param {*}      value              - Value to convert.
 * @param {string} [fallbackKey='errors.generic'] - i18n key used when value is not a string.
 * @returns {{ en: string, ar: string }} Bilingual message object.
 */
export const toLocalizedMessage = (value, fallbackKey = 'errors.generic') => {
  // Already in the correct format — pass through
  if (isLocalizedMessage(value)) return value;

  if (typeof value === 'string') {
    // Try to look up the string as an i18n key in either locale
    if (i18n.global.te(value, 'en') || i18n.global.te(value, 'ar')) {
      return {
        en: i18n.global.t(value, {}, 'en'),
        ar: i18n.global.t(value, {}, 'ar')
      };
    }

    // Raw string: use as English message; Arabic mirrors it (no translation available)
    return { en: value, ar: value };
  }

  // Non-string value: fall back to the generic error translations
  return {
    en: i18n.global.t(fallbackKey, {}, 'en'),
    ar: i18n.global.t(fallbackKey, {}, 'ar')
  };
};

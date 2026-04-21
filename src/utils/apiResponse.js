/**
 * @file apiResponse.js
 * @description Utility functions for unwrapping the standard API response envelope.
 *
 * All server responses follow this envelope structure:
 * {
 *   success: boolean,
 *   data: T | T[],
 *   message: string,
 *   error: string | null
 * }
 *
 * The Axios api.js interceptor unwraps `response.data` so callers receive the
 * envelope object directly. These utilities further extract the payload from
 * the envelope without requiring every component to know the nesting structure.
 */

/**
 * Safely unwraps the top-level response to ensure the envelope object is returned.
 * Handles the case where the Axios interceptor already stripped response.data.
 *
 * @param {*} response - Raw value from an api.XX() call.
 * @returns {Object|null} The envelope object, or null.
 */
export function getApiEnvelope(response) {
  return response?.data ?? response ?? null;
}

/**
 * Extracts the `data` field from a standard API envelope.
 * If the envelope has an explicit `data` property, returns it.
 * Otherwise returns the entire envelope (handles non-standard responses gracefully).
 *
 * @param {*} response - Raw value from an api.XX() call.
 * @returns {*} The payload (object, array, number, etc.).
 */
export function getApiData(response) {
  const envelope = getApiEnvelope(response);
  if (
    envelope &&
    typeof envelope === 'object' &&
    !Array.isArray(envelope) &&
    Object.prototype.hasOwnProperty.call(envelope, 'data')
  ) {
    return envelope.data;
  }
  return envelope;
}

/**
 * Extracts a collection array from an API response.
 * Handles three cases:
 *  1. `data` is already an array → return as-is.
 *  2. `data` is an object with a named collection key → return the array at that key.
 *  3. Neither → return empty array (safe default for v-for rendering).
 *
 * @param {*} response         - Raw value from an api.XX() call.
 * @param {string[]} [collectionKeys] - Ordered list of keys to check inside the data object.
 * @returns {Array} The extracted array, or [].
 */
export function getApiCollection(response, collectionKeys = ['items', 'products', 'orders', 'rfqs']) {
  const data = getApiData(response);
  if (Array.isArray(data)) return data;

  // Try each known collection key in order
  for (const key of collectionKeys) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  return [];
}

/**
 * Extracts the human-readable `message` string from an API envelope.
 *
 * @param {*} response       - Raw value from an api.XX() call.
 * @param {string} [fallback=''] - Value to return when no message is present.
 * @returns {string} The API message string, or the fallback.
 */
export function getApiMessage(response, fallback = '') {
  const envelope = getApiEnvelope(response);
  return envelope?.message || fallback;
}

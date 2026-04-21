/**
 * @file scheduling.js
 * @description Utilities for deferring non-critical work to browser idle time.
 */

/**
 * Schedules a callback to run during the next browser idle period,
 * or falls back to a simple setTimeout if the requestIdleCallback API is unavailable.
 *
 * Intended for non-critical initialization work (e.g. loading settings, connecting
 * to notification channels) that should not delay the initial page render or
 * compete with high-priority user interactions.
 *
 * @param {Function} callback - The work to execute during idle time.
 * @param {number}   [timeout=300] - Maximum wait in ms before forcing execution.
 * @returns {Function} A cleanup/cancel function. Call it in onUnmounted to avoid
 *                     running the callback after the component has been torn down.
 *
 * @example
 * const cancel = whenBrowserIdle(() => settingsStore.fetch(), 150);
 * onUnmounted(() => cancel());
 */
export const whenBrowserIdle = (callback, timeout = 300) => {
  if (typeof window === 'undefined') return () => {};  // SSR guard — no-op in non-browser environments

  if ('requestIdleCallback' in window) {
    // Preferred: schedule work after all pending tasks, with a hard deadline
    const id = window.requestIdleCallback(callback, { timeout });
    return () => window.cancelIdleCallback(id);
  }

  // Fallback: plain timeout approximates idle scheduling in browsers without the API
  const id = window.setTimeout(callback, timeout);
  return () => window.clearTimeout(id);
};

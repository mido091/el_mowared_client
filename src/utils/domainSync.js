/**
 * @file domainSync.js
 * @description Cross-tab and cross-window data invalidation utility.
 *
 * Purpose:
 *  When a Pinia action mutates data (e.g. creates an RFQ), other open browser
 *  tabs need to know the local cache is stale. This utility broadcasts an
 *  "invalidate" signal to all listening contexts without requiring a full page reload.
 *
 * Two broadcast channels are used in parallel for maximum browser compatibility:
 *  1. BroadcastChannel API – modern, same-origin tabs receive events instantly.
 *  2. localStorage 'storage' event – older browsers / cross-tab fallback.
 *     We write and then immediately remove a sync key so the storage event fires
 *     without leaving persistent data (prevents stale payloads on reload).
 *
 * Revision tracking:
 *  Every publish() writes the current Unix timestamp to a persistent revision key.
 *  Stores read this on refocus/visibility change to decide if they need to re-fetch.
 *
 * Usage example:
 *   const rfqSync = createDomainSync('rfqs');
 *   rfqSync.ensure();                        // Start listening (idempotent)
 *   rfqSync.subscribe(() => fetchRfqs());     // Add invalidation listener
 *   rfqSync.publish('create-rfq');            // Broadcast to all open tabs
 *   rfqSync.getStoredRevision();              // Read last known revision
 */

/**
 * Global registry of domain sync states, keyed by domain name.
 * Using a module-level Map ensures all instances of the same domain share state.
 * @type {Map<string, {initialized: boolean, channel: BroadcastChannel|null, listeners: Set, revisionKey: string, syncKey: string}>}
 */
const registry = new Map();

/**
 * Returns (or lazily creates) the internal metadata object for a given domain.
 *
 * @param {string} domain - Logical domain name (e.g. 'rfqs', 'products').
 * @returns {{ initialized: boolean, channel: BroadcastChannel|null, listeners: Set<Function>, revisionKey: string, syncKey: string }}
 */
const getDomainMeta = (domain) => {
  if (!registry.has(domain)) {
    registry.set(domain, {
      initialized: false,
      channel: null,
      listeners: new Set(),
      // Persistent key storing the last revision timestamp (survives page reloads)
      revisionKey: `elmowared:${domain}:revision`,
      // Transient key used as the storage event trigger (written then immediately deleted)
      syncKey: `elmowared:${domain}:sync`,
    });
  }

  return registry.get(domain);
};

/**
 * Creates a domain synchronization controller for data invalidation across tabs.
 *
 * @param {string} domain - Logical domain identifier (e.g. 'rfqs').
 * @returns {{ ensure: Function, subscribe: Function, publish: Function, getStoredRevision: Function }}
 */
export const createDomainSync = (domain) => {
  const meta = getDomainMeta(domain);

  /**
   * Calls all registered listeners with a payload.
   * Uses try/catch so a failing listener never breaks others.
   * @param {Object} payload - Invalidation event payload.
   */
  const emitToListeners = (payload) => {
    meta.listeners.forEach((listener) => {
      try {
        listener(payload);
      } catch {
        // Keep sync resilient even if one listener fails.
      }
    });
  };

  /**
   * Initializes the broadcast listeners (idempotent — safe to call multiple times).
   * Sets up both BroadcastChannel (same-origin tabs) and window storage events (fallback).
   */
  const ensure = () => {
    if (meta.initialized || typeof window === 'undefined') return;

    // Prefer BroadcastChannel API for low-latency cross-tab messaging
    if (typeof BroadcastChannel !== 'undefined') {
      meta.channel = new BroadcastChannel(domain);
      meta.channel.onmessage = (event) => {
        if (event?.data?.type === `${domain}:invalidate`) {
          emitToListeners(event.data);
        }
      };
    }

    // localStorage storage event provides cross-tab fallback and revision persistence
    window.addEventListener('storage', (event) => {
      // React to direct revision key updates (e.g. from publish())
      if (event.key === meta.revisionKey && event.newValue) {
        emitToListeners({
          type: `${domain}:invalidate`,
          reason: 'revision-sync',
          revision: Number(event.newValue || 0),
        });
        return;
      }

      // React to transient sync key writes (the write/delete pattern)
      if (event.key !== meta.syncKey || !event.newValue) return;

      try {
        const payload = JSON.parse(event.newValue);
        if (payload?.type === `${domain}:invalidate`) {
          emitToListeners(payload);
        }
      } catch {
        // Ignore malformed sync payloads.
      }
    });

    meta.initialized = true;
  };

  /**
   * Registers a listener that fires whenever the domain is invalidated from any tab.
   *
   * @param {Function} listener - Callback receiving the invalidation payload.
   * @returns {Function} Unsubscribe function.
   */
  const subscribe = (listener) => {
    ensure();
    meta.listeners.add(listener);
    return () => meta.listeners.delete(listener); // Return cleanup function
  };

  /**
   * Broadcasts an invalidation signal to all listening contexts (tabs, windows).
   *
   * Implementation:
   *  1. Posts via BroadcastChannel (same tab excluded for same-origin cross-tab only).
   *  2. Writes the revision timestamp to localStorage (persistent, survives reload).
   *  3. Writes the full payload to a transient sync key then immediately deletes it
   *     (triggers the storage event in other tabs without leaving stale data).
   *  4. Calls local listeners directly for the current tab.
   *
   * @param {string} [reason='updated'] - Human-readable reason (e.g. 'create-rfq', 'delete-rfq').
   * @returns {number} The Unix timestamp revision that was broadcast.
   */
  const publish = (reason = 'updated') => {
    if (typeof window === 'undefined') return 0;

    ensure();
    const payload = {
      type: `${domain}:invalidate`,
      reason,
      revision: Date.now(),
    };

    meta.channel?.postMessage(payload);                                        // Cross-tab (BroadcastChannel)
    window.localStorage.setItem(meta.revisionKey, String(payload.revision));   // Persistent revision
    window.localStorage.setItem(meta.syncKey, JSON.stringify(payload));        // Trigger storage event
    window.localStorage.removeItem(meta.syncKey);                              // Clean up immediately
    emitToListeners(payload);                                                  // Current tab

    return payload.revision;
  };

  /**
   * Reads the last persisted revision timestamp from localStorage.
   * Returns 0 if no revision has been stored yet (fresh session).
   *
   * @returns {number} Unix ms timestamp of the last mutation revision.
   */
  const getStoredRevision = () => {
    if (typeof window === 'undefined') return 0;
    return Number(window.localStorage.getItem(meta.revisionKey) || 0);
  };

  return {
    ensure,
    subscribe,
    publish,
    getStoredRevision,
  };
};

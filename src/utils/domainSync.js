const registry = new Map();

const getDomainMeta = (domain) => {
  if (!registry.has(domain)) {
    registry.set(domain, {
      initialized: false,
      channel: null,
      listeners: new Set(),
      revisionKey: `elmowared:${domain}:revision`,
      syncKey: `elmowared:${domain}:sync`,
    });
  }

  return registry.get(domain);
};

export const createDomainSync = (domain) => {
  const meta = getDomainMeta(domain);

  const emitToListeners = (payload) => {
    meta.listeners.forEach((listener) => {
      try {
        listener(payload);
      } catch {
        // Keep sync resilient even if one listener fails.
      }
    });
  };

  const ensure = () => {
    if (meta.initialized || typeof window === 'undefined') return;

    if (typeof BroadcastChannel !== 'undefined') {
      meta.channel = new BroadcastChannel(domain);
      meta.channel.onmessage = (event) => {
        if (event?.data?.type === `${domain}:invalidate`) {
          emitToListeners(event.data);
        }
      };
    }

    window.addEventListener('storage', (event) => {
      if (event.key === meta.revisionKey && event.newValue) {
        emitToListeners({
          type: `${domain}:invalidate`,
          reason: 'revision-sync',
          revision: Number(event.newValue || 0),
        });
        return;
      }

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

  const subscribe = (listener) => {
    ensure();
    meta.listeners.add(listener);
    return () => meta.listeners.delete(listener);
  };

  const publish = (reason = 'updated') => {
    if (typeof window === 'undefined') return 0;

    ensure();
    const payload = {
      type: `${domain}:invalidate`,
      reason,
      revision: Date.now(),
    };

    meta.channel?.postMessage(payload);
    window.localStorage.setItem(meta.revisionKey, String(payload.revision));
    window.localStorage.setItem(meta.syncKey, JSON.stringify(payload));
    window.localStorage.removeItem(meta.syncKey);
    emitToListeners(payload);

    return payload.revision;
  };

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

import Pusher from 'pusher-js';
import api from '@/services/api';

const PRESENCE_CHANNEL = 'presence-online-users';
const USER_CHANNEL_PREFIX = 'private-user.';
const CONVERSATION_CHANNEL_PREFIX = 'private-conversation.';
const ROLE_CHANNEL_PREFIX = 'private-role.';
const PUBLIC_MARKETPLACE_CHANNEL = 'public-marketplace';

const getCurrentLocale = () => localStorage.getItem('locale') || document.documentElement.lang || 'en';

const parseCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
};

class SocketService {
  constructor() {
    this.pusher = null;
    this.handlers = new Map();
    this.channelBindings = new Map();
    this.conversationRefs = new Map();
    this.conversationChannels = new Map();
    this.userChannel = null;
    this.roleChannel = null;
    this.publicChannel = null;
    this.presenceChannel = null;
    this.token = null;
    this.userId = null;
    this.userRole = null;
    this.dedupeCache = new Map();
    this.presenceHeartbeat = null;
  }

  connect(token) {
    const currentUser = parseCurrentUser();
    const hasPrivateContext = Boolean(token && currentUser?.id);
    const requestedUserId = hasPrivateContext ? Number(currentUser.id) : null;
    const requestedRole = hasPrivateContext ? `${currentUser.role || ''}`.toLowerCase() : null;

    if (
      this.pusher
      && this.token === (token || null)
      && Number(this.userId || 0) === Number(requestedUserId || 0)
    ) {
      return true;
    }

    if (this.pusher) {
      if (!hasPrivateContext) {
        this.subscribePublicChannel();
        return true;
      }

      if (Number(this.userId || 0) === Number(requestedUserId || 0)) {
        this.token = token || null;
        this.userId = requestedUserId;
        this.userRole = requestedRole;
        this.subscribePublicChannel();
        this.subscribeUserChannel();
        this.subscribeRoleChannel();
        this.subscribePresenceChannel();
        Array.from(this.conversationRefs.keys()).forEach((conversationId) => {
          this.subscribeConversationChannel(conversationId);
        });
        return true;
      }
    }

    this.disconnect();
    this.token = token || null;
    this.userId = requestedUserId;
    this.userRole = requestedRole;

    const key = import.meta.env.VITE_PUSHER_KEY;
    const cluster = import.meta.env.VITE_PUSHER_CLUSTER;
    if (!key || !cluster) {
      console.warn('[Pusher] key or cluster is missing; realtime features are disabled');
      return false;
    }

    Pusher.logToConsole = !!import.meta.env.DEV;

    this.pusher = new Pusher(key, {
      cluster,
      forceTLS: true,
      enabledTransports: ['ws', 'wss'],
      channelAuthorization: {
        customHandler: async ({ socketId, channelName }, callback) => {
          try {
            const response = await api.post('/realtime/pusher/auth', {
              socket_id: socketId,
              channel_name: channelName
            }, {
              errorMode: 'silent',
              redirectOn401: false
            });

            callback(null, response);
          } catch (error) {
            const status = error?.response?.status || error?.status || 'unknown';
            console.error('[Pusher] Channel authorization failed', {
              channelName,
              status,
              code: error?.normalized?.code || error?.code
            });
            callback(error);
          }
        }
      }
    });

    this.pusher.connection.bind('connected', () => {
      console.info('[Pusher] Connected');
      this.syncPresence('online');
      this.startPresenceHeartbeat();
    });

    this.pusher.connection.bind('disconnected', () => {
      console.warn('[Pusher] Disconnected');
      this.stopPresenceHeartbeat();
    });

    this.pusher.connection.bind('error', (error) => {
      console.error('[Pusher] Connection error', error);
    });

    this.subscribePublicChannel();

    if (hasPrivateContext) {
      this.subscribeUserChannel();
      this.subscribeRoleChannel();
      this.subscribePresenceChannel();
    }

    Array.from(this.conversationRefs.keys()).forEach((conversationId) => {
      this.subscribeConversationChannel(conversationId);
    });

    return true;
  }

  on(event, callback) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event).push(callback);
  }

  off(event, callback) {
    if (!callback) {
      this.handlers.delete(event);
      return;
    }

    const callbacks = this.handlers.get(event);
    if (!callbacks) return;

    const filtered = callbacks.filter((cb) => cb !== callback);
    if (!filtered.length) {
      this.handlers.delete(event);
      return;
    }

    this.handlers.set(event, filtered);
  }

  emit(event, data) {
    if (event === 'join_conversation') {
      this.joinConversation(data);
      return;
    }

    if (event === 'leave_conversation') {
      this.leaveConversation(data);
      return;
    }

    if (event === 'typing_start') {
      this.sendTypingStart(data?.conversationId ?? data);
      return;
    }

    if (event === 'typing_stop') {
      this.sendTypingStop(data?.conversationId ?? data);
      return;
    }

    if (event === 'message_read') {
      this.markMessageAsRead(data?.conversationId, data?.messageId);
    }
  }

  async sendTypingStart(conversationId) {
    if (!conversationId) return;
    try {
      await api.post('/realtime/chat/typing', {
        conversationId: Number(conversationId),
        state: 'start'
      }, { errorMode: 'silent' });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[Pusher] typing start failed', error);
      }
    }
  }

  async sendTypingStop(conversationId) {
    if (!conversationId) return;
    try {
      await api.post('/realtime/chat/typing', {
        conversationId: Number(conversationId),
        state: 'stop'
      }, { errorMode: 'silent' });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[Pusher] typing stop failed', error);
      }
    }
  }

  async markMessageAsRead(conversationId, messageId) {
    if (!conversationId || !messageId) return;
    try {
      await api.post('/realtime/chat/read', {
        conversationId: Number(conversationId),
        messageId: Number(messageId)
      }, { errorMode: 'silent' });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[Pusher] message read failed', error);
      }
    }
  }

  joinConversation(conversationId) {
    const normalizedId = Number(conversationId);
    if (!Number.isInteger(normalizedId) || normalizedId <= 0) return;

    const currentCount = this.conversationRefs.get(normalizedId) || 0;
    this.conversationRefs.set(normalizedId, currentCount + 1);

    if (currentCount === 0) {
      this.subscribeConversationChannel(normalizedId);
    }
  }

  leaveConversation(conversationId) {
    const normalizedId = Number(conversationId);
    if (!this.conversationRefs.has(normalizedId)) return;

    const nextCount = Math.max(0, (this.conversationRefs.get(normalizedId) || 0) - 1);
    if (nextCount > 0) {
      this.conversationRefs.set(normalizedId, nextCount);
      return;
    }

    this.conversationRefs.delete(normalizedId);
    this.unsubscribeChannel(`${CONVERSATION_CHANNEL_PREFIX}${normalizedId}`);
    this.conversationChannels.delete(normalizedId);
  }

  subscribeUserChannel() {
    if (!this.pusher || !this.userId) return;
    const channelName = `${USER_CHANNEL_PREFIX}${this.userId}`;
    this.userChannel = this.ensureChannel(channelName, [
      'notification',
      'notification.created',
      'new_rfq',
      'rfq.created',
      'rfq.feed.changed',
      'rfq_feed_updated',
      'rfq_updated',
      'rfq.updated',
      'new_message',
      'support_assigned',
      'order_update',
      'order.updated',
      'new_quote',
      'quote.created',
      'conversation_deleted',
      'product_status_changed',
      'product_moderation_updated',
      'product.created',
      'product.updated',
      'product.reviewed',
      'product.deleted',
      'dashboard.metrics.changed'
    ]);
  }

  subscribeRoleChannel() {
    if (!this.pusher || !this.userRole) return;

    let roleKey = '';
    if (['admin', 'owner'].includes(this.userRole)) roleKey = 'admin';
    else if (this.userRole === 'mowared') roleKey = 'vendor';

    if (!roleKey) return;

    const channelName = `${ROLE_CHANNEL_PREFIX}${roleKey}`;
    this.roleChannel = this.ensureChannel(channelName, [
      'rfq.created',
      'rfq.updated',
      'product.created',
      'product.updated',
      'product.reviewed',
      'product.deleted',
      'dashboard.metrics.changed'
    ]);
  }

  subscribePublicChannel() {
    if (!this.pusher) return;

    this.publicChannel = this.ensureChannel(PUBLIC_MARKETPLACE_CHANNEL, [
      'product.created',
      'product.updated',
      'product.reviewed',
      'product.deleted',
      'dashboard.metrics.changed'
    ]);
  }

  subscribePresenceChannel() {
    if (!this.pusher) return;

    const channel = this.ensureChannel(PRESENCE_CHANNEL);
    this.presenceChannel = channel;

    if (this.channelBindings.has(`${PRESENCE_CHANNEL}:__presence`)) {
      return;
    }

    channel.bind('pusher:subscription_succeeded', (members) => {
      if (!members?.each) return;
      members.each((member) => {
        this.dispatch('user_presence', {
          userId: Number(member.id),
          status: 'online'
        });
      });
    });

    channel.bind('pusher:member_added', (member) => {
      this.dispatch('user_presence', {
        userId: Number(member.id),
        status: 'online'
      });
    });

    channel.bind('pusher:member_removed', (member) => {
      this.dispatch('user_presence', {
        userId: Number(member.id),
        status: 'offline',
        lastSeen: new Date().toISOString()
      });
    });

    this.channelBindings.set(`${PRESENCE_CHANNEL}:__presence`, true);
  }

  subscribeConversationChannel(conversationId) {
    if (!this.pusher) return;
    const normalizedId = Number(conversationId);
    if (!Number.isInteger(normalizedId) || normalizedId <= 0) return;

    const channelName = `${CONVERSATION_CHANNEL_PREFIX}${normalizedId}`;
    const channel = this.ensureChannel(channelName, [
      'new_message',
      'typing_start',
      'typing_stop',
      'message_read_update',
      'support_assigned',
      'conversation_deleted'
    ]);

    this.conversationChannels.set(normalizedId, channel);
  }

  ensureChannel(channelName, events = []) {
    if (!this.pusher) return null;

    const channel = this.pusher.channel(channelName) || this.pusher.subscribe(channelName);
    events.forEach((eventName) => this.bindChannelEvent(channel, channelName, eventName));
    return channel;
  }

  bindChannelEvent(channel, channelName, eventName) {
    const bindingKey = `${channelName}:${eventName}`;
    if (this.channelBindings.has(bindingKey)) return;

    channel.bind(eventName, (payload) => {
      this.dispatch(eventName, payload);
    });

    this.channelBindings.set(bindingKey, true);
  }

  unsubscribeChannel(channelName) {
    if (!this.pusher || !channelName) return;
    this.pusher.unsubscribe(channelName);

    Array.from(this.channelBindings.keys())
      .filter((key) => key.startsWith(`${channelName}:`))
      .forEach((key) => this.channelBindings.delete(key));
  }

  dispatch(eventName, payload) {
    if (this.isDuplicate(eventName, payload)) {
      return;
    }

    const callbacks = this.handlers.get(eventName) || [];
    callbacks.forEach((callback) => callback(payload));
  }

  isDuplicate(eventName, payload) {
    const key = this.buildDedupeKey(eventName, payload);
    if (!key) return false;

    const now = Date.now();
    const cachedAt = this.dedupeCache.get(key);
    this.pruneDedupeCache(now);

    if (cachedAt && now - cachedAt < 1500) {
      return true;
    }

    this.dedupeCache.set(key, now);
    return false;
  }

  pruneDedupeCache(now = Date.now()) {
    Array.from(this.dedupeCache.entries()).forEach(([key, value]) => {
      if (now - value > 5000) {
        this.dedupeCache.delete(key);
      }
    });
  }

  buildDedupeKey(eventName, payload) {
    if (!payload || typeof payload !== 'object') return null;

    if (eventName === 'new_message') {
      const message = payload.message || payload;
      return `new_message:${payload.conversationId || message?.conversation_id || ''}:${message?.id || ''}`;
    }

    if (eventName === 'support_assigned') {
      return `support_assigned:${payload.conversationId || ''}:${payload.adminId || ''}:${payload.status || ''}`;
    }

    if (eventName === 'conversation_deleted') {
      return `conversation_deleted:${payload.conversationId || ''}`;
    }

    if (eventName === 'message_read_update') {
      return `message_read_update:${payload.conversationId || ''}:${payload.messageId || ''}:${payload.readAt || ''}`;
    }

    if (eventName === 'notification') {
      return `notification:${payload.notificationType || ''}:${payload.message || payload.messageAr || ''}:${payload.conversationId || ''}`;
    }

    if (eventName === 'new_rfq') {
      return `new_rfq:${payload.rfq_id || payload.rfqId || ''}`;
    }

    if (eventName === 'rfq_feed_updated') {
      return `rfq_feed_updated:${payload.rfqId || payload.rfq_id || ''}:${payload.status || ''}`;
    }

    if (eventName === 'rfq.feed.changed') {
      return `rfq.feed.changed:${payload.rfqId || payload.rfq_id || ''}:${payload.status || ''}`;
    }

    if (eventName === 'rfq_updated') {
      return `rfq_updated:${payload.rfqId || payload.rfq_id || ''}:${payload.status || ''}`;
    }

    if (eventName === 'rfq.created') {
      return `rfq.created:${payload.rfqId || payload.rfq_id || ''}:${payload.status || ''}`;
    }

    if (eventName === 'new_quote') {
      return `new_quote:${payload.quoteId || ''}`;
    }

    if (eventName === 'quote.created') {
      return `quote.created:${payload.quoteId || ''}:${payload.rfqId || ''}`;
    }

    if (eventName === 'order_update') {
      return `order_update:${payload.orderId || ''}:${payload.status || ''}:${payload.message || ''}`;
    }

    if (eventName === 'product_status_changed') {
      return `product_status_changed:${payload.productId || ''}:${payload.lifecycleStatus || ''}:${payload.link || ''}`;
    }

    if (eventName === 'product_moderation_updated') {
      return `product_moderation_updated:${payload.productId || ''}:${payload.lifecycleStatus || ''}:${payload.link || ''}`;
    }

    if (['product.created', 'product.updated', 'product.reviewed', 'product.deleted'].includes(eventName)) {
      return `${eventName}:${payload.productId || payload.productIds?.join(',') || ''}:${payload.lifecycleStatus || ''}:${payload.revision || ''}`;
    }

    if (eventName === 'dashboard.metrics.changed') {
      return `dashboard.metrics.changed:${payload.scope || ''}:${payload.entity || ''}:${payload.orderId || payload.productId || payload.rfqId || ''}:${payload.status || payload.lifecycleStatus || ''}:${payload.revision || ''}`;
    }

    if (eventName === 'notification.created') {
      return `notification.created:${payload.id || ''}`;
    }

    if (eventName === 'order.updated') {
      return `order.updated:${payload.orderId || ''}:${payload.status || ''}:${payload.revision || ''}`;
    }

    return null;
  }

  disconnect() {
    this.stopPresenceHeartbeat();

    if (this.pusher) {
      this.pusher.disconnect();
    }

    this.pusher = null;
    this.userChannel = null;
    this.roleChannel = null;
    this.publicChannel = null;
    this.presenceChannel = null;
    this.conversationChannels.clear();
    this.channelBindings.clear();
    this.conversationRefs.clear();
    this.dedupeCache.clear();
    this.token = null;
    this.userId = null;
    this.userRole = null;
  }

  startPresenceHeartbeat() {
    this.stopPresenceHeartbeat();
    this.presenceHeartbeat = window.setInterval(() => {
      if (this.isConnected) {
        this.syncPresence('online');
      }
    }, 20_000);
  }

  stopPresenceHeartbeat() {
    if (this.presenceHeartbeat) {
      window.clearInterval(this.presenceHeartbeat);
      this.presenceHeartbeat = null;
    }
  }

  async syncPresence(state = 'online') {
    try {
      await api.post('/realtime/presence', { state }, { errorMode: 'silent', redirectOn401: false });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[Pusher] presence sync failed', state, error);
      }
    }
  }

  get isConnected() {
    return this.pusher?.connection?.state === 'connected';
  }
}

export const socketService = new SocketService();
export default socketService;

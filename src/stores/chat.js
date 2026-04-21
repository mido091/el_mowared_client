import { defineStore } from 'pinia';
import api from '@/services/api';
import socketService from '@/services/socket.service';
import { getApiCollection, getApiData } from '@/utils/apiResponse';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notificationStore';
import { normalizeError } from '@/utils/errorHandler';

/**
 * @file chat.js
 * @description Pinia store for managing real-time chat conversations, messages, and presence.
 * Handles B2B supplier inquiries as well as Admin Support flows.
 *
 * Responsibilities:
 *  - Maintains an organized list of conversations (`activeConversation`, `supportRequests`).
 *  - Interacts with Pusher via `socket.service.js` to process incoming payloads.
 *  - Tracks and computes "typing" states, unread counts, and support availability in real-time.
 */
export const useChatStore = defineStore('chat', {
  state: () => ({
    conversations: [],
    activeConversation: null,
    messages: [],
    loading: false,
    loadingMessages: false,
    sending: false,
    error: null,
    success: false,
    listenersInitialized: false,
    typingUsers: new Set(),
    onlineUsers: new Set(),
    supportAvailability: {
      available: true,
      estimatedResponseMinutes: null,
      locked: false
    },
    supportBoxDismissed: false
  }),

  getters: {
    normalizedConversationType: () => (conversation) => `${conversation?.type || ''}`.toUpperCase(),

    sortedConversations: (state) =>
      [...state.conversations].sort(
        (a, b) => new Date(b.last_activity_at || b.updated_at || b.created_at) - new Date(a.last_activity_at || a.updated_at || a.created_at)
      ),

    unreadCount: (state) => state.conversations.reduce((total, conv) => total + Number(conv.unread_count || 0), 0),

    supportRequests: (state) => {
      const authStore = useAuthStore();
      const role = `${authStore.user?.role || ''}`.toLowerCase();
      if (!['admin', 'owner'].includes(role)) return [];
      return state.conversations.filter((conv) =>
        `${conv?.type || ''}`.toUpperCase() === 'SUPPORT' &&
        !conv?.admin_id &&
        ['waiting', 'assigned'].includes(`${conv?.status || ''}`.toLowerCase())
      );
    },

    mySupportChats: (state) => {
      const authStore = useAuthStore();
      const userId = Number(authStore.user?.id);
      return state.conversations.filter((conv) =>
        `${conv?.type || ''}`.toUpperCase() === 'SUPPORT' &&
        Number(conv?.admin_id) === userId &&
        !['closed', 'archived'].includes(`${conv?.status || ''}`.toLowerCase())
      );
    },

    supportConversation: (state) => {
      const fromList = state.conversations.find((conv) =>
        `${conv?.type || ''}`.toUpperCase() === 'SUPPORT' &&
        !['closed', 'archived'].includes(`${conv?.status || ''}`.toLowerCase())
      );

      if (fromList) return fromList;

      if (
        state.activeConversation &&
        `${state.activeConversation.type || ''}`.toUpperCase() === 'SUPPORT' &&
        !['closed', 'archived'].includes(`${state.activeConversation.status || ''}`.toLowerCase())
      ) {
        return state.activeConversation;
      }

      return null;
    },

    isOtherPartyOnline: (state) => (partyId) => state.onlineUsers.has(Number(partyId)),

    isOtherPartyTyping: (state) => (conversationId) => state.typingUsers.has(Number(conversationId)),

    activeConversationIsLocked: (state) => {
      const conversation = state.activeConversation;
      if (!conversation) return false;
      const authStore = useAuthStore();
      const isPrivileged = ['admin', 'owner'].includes(`${authStore.user?.role || ''}`.toLowerCase());
      if (isPrivileged) return false;
      const status = `${conversation.status || ''}`.toLowerCase();
      return `${conversation.type || ''}`.toUpperCase() === 'SUPPORT' && status === 'assigned' && !!conversation.admin_id;
    }
  },

  actions: {
    _removeConversationLocally(conversationId) {
      const normalizedId = Number(conversationId);
      this.conversations = this.conversations.filter((item) => Number(item.id) !== normalizedId);
      if (Number(this.activeConversation?.id) === normalizedId) {
        this.activeConversation = null;
        this.messages = [];
        this._syncSupportAvailability(null);
      }
    },

    /**
     * Ensures conversations are loaded exactly once unless forced.
     * Useful for layout initializations without redundant API calls.
     */
    async ensureConversationsLoaded(force = false) {
      if (force || !this.conversations.length) {
        await this.fetchConversations();
      }
    },

    _mergeConversation(conversation) {
      if (!conversation?.id) return;
      const idx = this.conversations.findIndex((item) => Number(item.id) === Number(conversation.id));
      if (idx === -1) {
        this.conversations.unshift(conversation);
      } else {
        this.conversations[idx] = {
          ...this.conversations[idx],
          ...conversation
        };
      }

      if (this.activeConversation?.id === conversation.id) {
        this.activeConversation = {
          ...this.activeConversation,
          ...conversation
        };
      }
    },

    _syncSupportAvailability(conversation = this.activeConversation) {
      if (!conversation || `${conversation.type || ''}`.toUpperCase() !== 'SUPPORT') {
        this.supportAvailability = {
          available: true,
          estimatedResponseMinutes: null,
          locked: false
        };
        return;
      }

      const status = `${conversation.status || ''}`.toLowerCase();
      const hasAssignedAdmin = !!conversation.admin_id;
      const previousAvailability = typeof this.supportAvailability?.available === 'boolean'
        ? this.supportAvailability.available
        : false;

      this.supportAvailability = {
        available: hasAssignedAdmin ? true : (status === 'waiting' ? previousAvailability : true),
        estimatedResponseMinutes: conversation.estimated_response_minutes || null,
        locked: hasAssignedAdmin && status === 'assigned'
      };
    },

    async fetchConversations() {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.get('/chats/conversations');
        this.conversations = getApiCollection(res, ['conversations']);
        if (this.activeConversation?.id) {
          const refreshed = this.conversations.find((conv) => Number(conv.id) === Number(this.activeConversation.id));
          if (refreshed) {
            this.activeConversation = refreshed;
            this._syncSupportAvailability(refreshed);
          }
        }
      } catch (e) {
        this.error = normalizeError(e).message;
        console.error('fetchConversations', e);
      } finally {
        this.loading = false;
      }
    },

    async fetchMessages(conversationId) {
      this.loadingMessages = true;
      this.error = null;
      try {
        const res = await api.get(`/chats/${conversationId}/messages`);
        this.messages = getApiCollection(res, ['messages']);
        this._syncSupportAvailability(this.activeConversation);
      } catch (e) {
        this.error = normalizeError(e).message;
        console.error('fetchMessages', e);
      } finally {
        this.loadingMessages = false;
      }
    },

    /**
     * Initializes a new chat or resumes an existing one based on the context.
     * Emits typing stop immediately upon starting to clear UI stale state.
     *
     * @param {number|null} vendorId 
     * @param {number|null} productId
     * @param {string} messageText
     * @param {string} type - 'INQUIRY', 'SUPPORT', 'RFQ'
     * @returns {Promise<Object>} The server response containing the conversation and message.
     */
    async startChat(vendorId, productId, messageText, type = 'INQUIRY', metadata = null, extra = {}) {
      this.sending = true;
      this.error = null;
      try {
        const payload = { vendorId, messageText, type, ...extra };
        if (productId) payload.productId = productId;
        if (metadata) payload.metadata = metadata;
        const res = await api.post('/chats/start', payload);
        const result = getApiData(res) || {};
        const conversation = result.conversation || result;
        if (!conversation?.id) throw new Error('Conversation payload missing');

        this._mergeConversation(conversation);
        await this.setActiveConversation(this.conversations.find((item) => item.id === conversation.id) || conversation);

        if (result.message) {
          this.appendMessage({ conversationId: conversation.id, message: result.message });
        }
        if (result.systemMessage) {
          this.appendMessage({ conversationId: conversation.id, message: result.systemMessage });
        }

        socketService.sendTypingStop(conversation.id);
        return result;
      } catch (error) {
        const normalized = normalizeError(error);
        this.error = normalized.message;
        useNotificationStore().error(normalized.message);
        throw error;
      } finally {
        this.sending = false;
      }
    },

    async startSupportChat(messageText, locale = null) {
      return this.startChat(null, null, messageText, 'SUPPORT', null, {
        source: 'support_widget',
        locale
      });
    },

    async claimSupportConversation(conversationId) {
      const res = await api.patch(`/chats/${conversationId}/claim`);
      const conversation = getApiData(res);
      this._mergeConversation(conversation);
      this._syncSupportAvailability(conversation);
      return conversation;
    },

    async refreshSupportAvailability(conversationId = null) {
      try {
        const activeSupportConversationId = conversationId || this.activeConversation?.id || this.supportConversation?.id;
        const res = await api.get('/chats/support/availability', {
          params: activeSupportConversationId ? { conversationId: Number(activeSupportConversationId) } : {},
          errorMode: 'silent'
        });
        const data = getApiData(res) || {};
        this.supportAvailability = {
          available: !!data.available,
          estimatedResponseMinutes: data.estimatedResponseMinutes || null,
          locked: !!data.assignedAdminId && `${this.activeConversation?.status || ''}`.toLowerCase() === 'assigned'
        };

        if (activeSupportConversationId) {
          const idx = this.conversations.findIndex((item) => Number(item.id) === Number(activeSupportConversationId));
          if (idx !== -1) {
            this.conversations[idx] = {
              ...this.conversations[idx],
              estimated_response_minutes: data.estimatedResponseMinutes || this.conversations[idx].estimated_response_minutes || null
            };
          }

          if (this.activeConversation?.id && Number(this.activeConversation.id) === Number(activeSupportConversationId)) {
            this.activeConversation = {
              ...this.activeConversation,
              estimated_response_minutes: data.estimatedResponseMinutes || this.activeConversation.estimated_response_minutes || null
            };
          }
        }

        return data;
      } catch (error) {
        return null;
      }
    },

    async startRfqChat(vendorId, rfqId, messageText, metadata = null, extra = {}) {
      return this.startChat(vendorId, null, messageText, 'RFQ', metadata, {
        relatedRfqId: rfqId,
        source: 'rfq',
        ...extra
      });
    },

    async sendMessage(conversationId, message, metadata = null) {
      this.sending = true;
      this.error = null;
      try {
        const res = await api.post(`/chats/${conversationId}/messages`, {
          message,
          metadata
        });
        const newMessage = getApiData(res);
        this.appendMessage({ conversationId, message: newMessage }, true);
        return newMessage;
      } catch (error) {
        const normalized = normalizeError(error);
        this.error = normalized.message;
        useNotificationStore().error(normalized.message);
        throw error;
      } finally {
        this.sending = false;
      }
    },

    async uploadAttachments(conversationId, files) {
      this.sending = true;
      this.error = null;
      try {
        const formData = new FormData();
        files.forEach((file) => formData.append('attachments', file));
        const res = await api.post(`/chats/${conversationId}/messages/upload`, formData);
        const msg = getApiData(res);
        this.appendMessage({ conversationId, message: msg }, true);
        return msg;
      } catch (e) {
        const normalized = normalizeError(e);
        this.error = normalized.message;
        useNotificationStore().error(normalized.message);
        console.error('uploadAttachments', e);
        throw e;
      } finally {
        this.sending = false;
      }
    },

    async updateConversationStatus(conversationId, status) {
      const res = await api.patch(`/chats/${conversationId}/status`, { status });
      const conversation = getApiData(res);
      const normalizedStatus = `${conversation?.status || status || ''}`.toLowerCase();
      if (['closed', 'archived'].includes(normalizedStatus)) {
        this._removeConversationLocally(conversationId);
        return conversation;
      }
      this._mergeConversation(conversation);
      this._syncSupportAvailability(conversation);
      return conversation;
    },

    async deleteConversation(conversationId) {
      await api.delete(`/chats/${conversationId}`);
      this._removeConversationLocally(conversationId);
      return true;
    },

    async setActiveConversation(conversation) {
      if (this.activeConversation) {
        socketService.emit('leave_conversation', this.activeConversation.id);
      }

      this.activeConversation = conversation;

      if (conversation) {
        await this.fetchMessages(conversation.id);
        socketService.emit('join_conversation', conversation.id);
        this._syncSupportAvailability(conversation);
        if (`${conversation.type || ''}`.toUpperCase() === 'SUPPORT') {
          await this.refreshSupportAvailability(conversation.id);
        }
        const idx = this.conversations.findIndex((item) => Number(item.id) === Number(conversation.id));
        if (idx !== -1) {
          this.conversations[idx].unread_count = 0;
        }
      } else {
        this.messages = [];
        this._syncSupportAvailability(null);
      }
    },

    /**
     * Appends an incoming (or locally echoed) message to the state without re-fetching.
     * Triggers read receipts implicitly if the conversation is actively open.
     * Updates the parent conversation's `unread_count` properly based on sender.
     *
     * @param {Object} payload 
     * @param {boolean} isLocalEcho - True if the message was sent by the current application instance.
     */
    appendMessage(payload, isLocalEcho = false) {
      const msg = payload?.message || payload;
      const conversationId = Number(msg?.conversation_id || payload?.conversationId);
      if (!msg || !conversationId) return;
      const authStore = useAuthStore();
      const currentUserId = Number(authStore.user?.id);

      if (this.activeConversation && Number(this.activeConversation.id) === conversationId) {
        if (!this.messages.some((item) => Number(item.id) === Number(msg.id))) {
          this.messages.push(msg);
        }
        if (!isLocalEcho) {
          socketService.markMessageAsRead(conversationId, msg.id);
        }
      }

      const idx = this.conversations.findIndex((item) => Number(item.id) === conversationId);
      if (idx !== -1) {
        const current = this.conversations[idx];
        const isActiveThread = this.activeConversation && Number(this.activeConversation.id) === conversationId;
        const shouldIncrementUnread = !isLocalEcho && Number(msg.sender_id) !== currentUserId && !isActiveThread;
        this.conversations[idx] = {
          ...current,
          last_message: msg.message_text,
          updated_at: msg.created_at || new Date().toISOString(),
          last_activity_at: msg.created_at || new Date().toISOString(),
          unread_count: shouldIncrementUnread
            ? Number(current.unread_count || 0) + 1
            : (isActiveThread ? 0 : Number(current.unread_count || 0))
        };
      } else if (!isLocalEcho && Number(msg.sender_id) !== currentUserId) {
        // Keep header/message badge in sync even when the current page has not
        // loaded this conversation yet.
        this.fetchConversations();
      }

      if (this.activeConversation?.id === conversationId && msg.type === 'SYSTEM') {
        const supportAvailability = msg.metadata?.supportAvailability;
        if (supportAvailability === 'busy' || supportAvailability === 'available') {
          this.supportAvailability = {
            ...this.supportAvailability,
            available: supportAvailability === 'available',
            estimatedResponseMinutes: msg.metadata?.estimatedResponseMinutes || this.supportAvailability.estimatedResponseMinutes || null
          };
        }
        if (msg.metadata?.estimatedResponseMinutes) {
          this.activeConversation = {
            ...this.activeConversation,
            estimated_response_minutes: msg.metadata.estimatedResponseMinutes
          };
        }
      }

      this._syncSupportAvailability(this.activeConversation);
    },

    setTypingStatus(conversationId, isTyping) {
      const normalizedId = Number(conversationId);
      if (isTyping) this.typingUsers.add(normalizedId);
      else this.typingUsers.delete(normalizedId);
    },

    setOnlineStatus(userId, isOnline) {
      const normalizedId = Number(userId);
      if (isOnline) this.onlineUsers.add(normalizedId);
      else this.onlineUsers.delete(normalizedId);
    },

    handleMessageRead({ messageId, readAt }) {
      const msg = this.messages.find((item) => Number(item.id) === Number(messageId));
      if (msg) {
        msg.read_at = readAt;
        msg.is_read = 1;
      }
    },

    /**
     * Subscribes to Pusher WebSockets to hydrate the Vue store.
     * Prevents duplicate bindings by maintaining a flag `listenersInitialized`.
     */
    initListeners() {
      if (this.listenersInitialized) return;
      this.listenersInitialized = true;

      socketService.on('new_message', (payload) => this.appendMessage(payload));
      socketService.on('typing_start', ({ conversationId }) => this.setTypingStatus(conversationId, true));
      socketService.on('typing_stop', ({ conversationId }) => this.setTypingStatus(conversationId, false));
      socketService.on('message_read_update', (data) => this.handleMessageRead(data));
      socketService.on('user_presence', ({ userId, status }) => this.setOnlineStatus(userId, status === 'online'));
      socketService.on('user_presence', () => {
        if (`${this.activeConversation?.type || ''}`.toUpperCase() === 'SUPPORT') {
          this.refreshSupportAvailability(this.activeConversation.id);
        }
      });
      socketService.on('support_assigned', ({ conversationId, adminId, status }) => {
        const authStore = useAuthStore();
        const currentRole = `${authStore.user?.role || ''}`.toLowerCase();
        const normalizedStatus = `${status || ''}`.toLowerCase();
        if (['closed', 'archived'].includes(normalizedStatus)) {
          this._removeConversationLocally(conversationId);
          return;
        }

        if (['admin', 'owner'].includes(currentRole) && adminId && Number(adminId) !== Number(authStore.user?.id)) {
          this._removeConversationLocally(conversationId);
          return;
        }

        if (['admin', 'owner'].includes(currentRole)) {
          const existing = this.conversations.find((item) => Number(item.id) === Number(conversationId));
          if (existing) {
            existing.admin_id = adminId ?? existing.admin_id;
            existing.status = status || existing.status;
            existing.updated_at = new Date().toISOString();
          } else {
            this.fetchConversations();
          }

          if (Number(this.activeConversation?.id) === Number(conversationId)) {
            this.activeConversation = {
              ...this.activeConversation,
              admin_id: adminId ?? this.activeConversation.admin_id,
              status: status || this.activeConversation.status
            };
            this._syncSupportAvailability(this.activeConversation);
          }
          return;
        }

        const idx = this.conversations.findIndex((item) => Number(item.id) === Number(conversationId));
        if (idx !== -1) {
          this.conversations[idx] = {
            ...this.conversations[idx],
            admin_id: adminId ?? this.conversations[idx].admin_id,
            status: status || 'assigned'
          };
          if (this.activeConversation?.id === conversationId) {
            this.activeConversation = {
              ...this.activeConversation,
              admin_id: adminId ?? this.activeConversation.admin_id,
              status: status || 'assigned'
            };
            this._syncSupportAvailability(this.activeConversation);
          }
        } else {
          this.fetchConversations();
        }
      });
      socketService.on('conversation_deleted', ({ conversationId }) => {
        if (!conversationId) return;
        this._removeConversationLocally(conversationId);
      });
    }
  }
});

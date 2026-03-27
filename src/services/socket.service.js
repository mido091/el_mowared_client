import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.handlers = new Map();
  }

  connect(token) {
    if (this.socket?.connected || !token) return;
    
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    this.socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket'],
      autoConnect: true
    });

    this.socket.on('connect', () => {
      console.info('🔌 [Socket] Connected');
    });

    this.socket.on('disconnect', () => {
      console.warn('🔌 [Socket] Disconnected');
    });

    // Re-attach handlers if they were registered before connection
    this.handlers.forEach((callbacks, event) => {
      this.socket.on(event, (data) => {
        const cbs = this.handlers.get(event) || [];
        cbs.forEach(cb => cb(data));
      });
    });
  }

  on(event, callback) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
      if (this.socket) {
        this.socket.on(event, (data) => {
          const cbs = this.handlers.get(event);
          if (cbs) cbs.forEach(cb => cb(data));
        });
      }
    }
    this.handlers.get(event).push(callback);
  }

  off(event, callback) {
    if (!callback) {
      this.handlers.delete(event);
      if (this.socket) this.socket.off(event);
    } else {
      const cbs = this.handlers.get(event);
      if (cbs) {
        const filtered = cbs.filter(cb => cb !== callback);
        this.handlers.set(event, filtered);
        if (filtered.length === 0) {
          this.handlers.delete(event);
          if (this.socket) this.socket.off(event);
        }
      }
    }
  }

  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  // --- Chat Lifecycle Helpers ---
  sendTypingStart(conversationId) {
    this.emit('typing_start', { conversationId });
  }

  sendTypingStop(conversationId) {
    this.emit('typing_stop', { conversationId });
  }

  markMessageAsRead(conversationId, messageId) {
    this.emit('message_read', { conversationId, messageId });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  get isConnected() {
    return this.socket?.connected ?? false;
  }
}

export const socketService = new SocketService();
export default socketService;

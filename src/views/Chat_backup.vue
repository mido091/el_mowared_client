<template>
  <div class="h-[calc(100vh-140px)] bg-card rounded-3xl border border-border flex overflow-hidden shadow-premium uppercase tracking-tight">
    
    <!-- Sidebar: Conversation List -->
    <div class="w-full md:w-80 lg:w-96 bg-muted/10 border-r border-border flex flex-col shrink-0 transition-transform duration-300"
      :class="{ 'hidden md:flex': activeConv }">
      
      <!-- List Header -->
      <div class="h-16 px-6 flex items-center justify-between border-b border-border bg-card">
        <h2 class="text-base font-black text-foreground flex items-center gap-2">
          <MessageSquare class="w-4 h-4 text-secondary" /> Messages
        </h2>
        <div class="w-6 h-6 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary text-[10px] font-black">
          {{ conversations.length }}
        </div>
      </div>

      <!-- Search -->
      <div class="p-4 bg-card/50">
        <div class="relative">
          <input type="text" placeholder="Search chats..."
            class="w-full h-10 px-4 pe-10 rounded-xl bg-card border border-border text-xs focus:outline-none focus:ring-2 focus:ring-secondary/50 placeholder:text-muted-foreground transition-all" />
          <Search class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      <!-- Conversations -->
      <div class="flex-grow overflow-y-auto space-y-1 p-2 custom-scrollbar">
        <div v-if="loadingConvs" class="space-y-2 p-2">
          <div v-for="i in 5" :key="i" class="h-16 bg-card rounded-xl border border-border animate-pulse"></div>
        </div>
        
        <div v-if="!loadingConvs && conversations.length > 0">
          <div v-for="conv in conversations" :key="conv.id"
            @click="selectConversation(conv)"
            class="px-4 py-3 rounded-xl cursor-pointer hover:bg-muted/30 transition-all border border-transparent flex gap-4 items-center group mb-1"
            :class="{ 'bg-secondary/5 border-secondary/20 shadow-sm': isConvActive(conv) }">
            
            <div class="relative">
              <div class="w-12 h-12 rounded-xl border border-border overflow-hidden bg-card shrink-0 shadow-sm">
                <img :src="getAvatar(conv)" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div class="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-card"></div>
            </div>
            
            <div class="flex-grow overflow-hidden">
              <div class="flex items-center justify-between mb-1">
                <h3 class="text-xs font-black text-foreground truncate max-w-[140px]" 
                  :class="{ 'text-secondary': isConvActive(conv) }">
                  {{ getConvName(conv) }}
                </h3>
                <span class="text-[9px] font-bold text-muted-foreground shrink-0">{{ formatTime(conv.updated_at) }}</span>
              </div>
              <p class="text-[10px] font-medium text-muted-foreground normal-case truncate leading-tight">
                {{ getConvMessage(conv) }}
              </p>
            </div>
          </div>
        </div>
        
        <div v-if="!loadingConvs && conversations.length === 0" class="text-center py-10 px-4">
          <MessageCircle class="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p class="text-xs font-black text-muted-foreground">No conversations yet</p>
          <p class="text-[9px] text-muted-foreground normal-case mt-1 max-w-[200px] mx-auto">Request a quote or contact a vendor to start chatting.</p>
        </div>
      </div>
    </div>

    <!-- Active Chat Area -->
    <div class="flex-grow flex flex-col bg-card relative" :class="{ 'hidden md:flex': !activeConv }">
      <div v-if="activeConv" class="flex-grow flex flex-col h-full">
        <!-- Chat Header -->
        <div class="h-16 px-6 flex items-center justify-between border-b border-border bg-card shadow-sm z-10">
          <div class="flex items-center gap-4">
            <button class="md:hidden text-muted-foreground hover:text-foreground p-1" @click="activeConv = null">
              <ChevronLeft class="w-6 h-6" />
            </button>
            <div class="w-10 h-10 rounded-xl overflow-hidden bg-muted/20 border border-border">
              <img :src="getAvatar(activeConv)" class="w-full h-full object-cover" />
            </div>
            <div>
              <h2 class="text-sm font-black text-foreground">{{ getConvName(activeConv) }}</h2>
              <p class="text-[9px] font-bold text-emerald-500 flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button class="w-9 h-9 flex items-center justify-center rounded-xl bg-muted/30 hover:bg-muted text-muted-foreground transition-colors">
              <MoreVertical class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Messages Flow -->
        <div class="flex-grow overflow-y-auto p-6 space-y-6 bg-muted/5 custom-scrollbar" ref="messagesContainer">
          <div v-if="loadingMessages" class="text-center py-4">
            <span class="w-6 h-6 border-4 border-secondary border-t-transparent rounded-full animate-spin inline-block"></span>
          </div>
          
          <div v-if="!loadingMessages" class="space-y-6">
            <div v-for="msg in messages" :key="msg.id"
              class="flex gap-4 max-w-[85%]"
              :class="isMyMessage(msg) ? 'ms-auto flex-row-reverse' : ''">
              
              <!-- Message Bubble -->
              <div class="flex flex-col gap-1" :class="isMyMessage(msg) ? 'items-end' : 'items-start'">
                <div class="px-5 py-3 rounded-2xl text-sm font-medium shadow-sm break-words normal-case leading-relaxed"
                  :class="isMyMessage(msg)
                    ? 'bg-secondary text-white rounded-tr-sm' 
                    : 'bg-card border border-border text-foreground rounded-tl-sm'">
                  {{ msg.content }}
                </div>
                <span class="text-[9px] font-bold text-muted-foreground">
                  {{ formatTime(msg.created_at) }}
                  <span v-if="isMyMessage(msg)" class="ml-1 text-secondary">
                    <Check class="w-3 h-3 inline" />
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="p-4 bg-card border-t border-border">
          <form @submit.prevent="sendMessage" class="flex gap-3">
            <button type="button" class="w-12 h-12 rounded-xl bg-muted/30 flex items-center justify-center text-muted-foreground hover:bg-secondary/10 hover:text-secondary transition-colors shrink-0">
              <Paperclip class="w-5 h-5" />
            </button>
            <input v-model="newMessage" type="text" placeholder="Type a message..."
              class="flex-grow h-12 px-5 rounded-xl bg-muted/20 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:bg-card transition-all normal-case" />
            <button type="submit" :disabled="!newMessage.trim() || sending"
              class="w-12 h-12 rounded-xl bg-secondary text-white shadow-lg flex items-center justify-center disabled:opacity-50 transition-all transform active:scale-95 shrink-0">
              <Send class="w-5 h-5 -ml-1 mt-1" />
            </button>
          </form>
          <div class="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground font-bold">
            <ShieldCheck class="w-3.5 h-3.5 text-secondary" />
            <span>Never pay outside El-Mowared Escrow. <a href="#" class="text-secondary hover:underline">Learn more</a></span>
          </div>
        </div>
      </div>
      
      <!-- Empty Chat State -->
      <div v-if="!activeConv" class="flex-grow flex flex-col items-center justify-center p-8 bg-muted/5">
        <div class="w-24 h-24 bg-card rounded-full flex items-center justify-center mb-6 shadow-premium border border-border relative">
          <MessageSquare class="w-10 h-10 text-secondary" />
          <div class="absolute -right-2 -top-2 w-8 h-8 bg-orange-500 rounded-full text-white flex items-center justify-center border-[3px] border-card">
            <Zap class="w-4 h-4" />
          </div>
        </div>
        <h2 class="text-2xl font-black text-foreground mb-2">B2B Messaging Hub</h2>
        <p class="text-xs font-medium text-muted-foreground normal-case max-w-sm text-center">
          Select a conversation from the sidebar or request a quote from a product page to start chatting.
        </p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { socketService } from '@/services/socket.service';
import api from '@/services/api';
import { 
  MessageSquare, Search, MessageCircle, ChevronLeft, 
  MoreVertical, Paperclip, Send, Check, ShieldCheck, Zap 
} from 'lucide-vue-next';

const authStore = useAuthStore();
const conversations = ref([]);
const activeConv = ref(null);
const messages = ref([]);
const newMessage = ref('');
const loadingConvs = ref(false);
const loadingMessages = ref(false);
const sending = ref(false);
const messagesContainer = ref(null);

const getOtherUser = (conv) => {
  if (!conv || !authStore.user) return null;
  return conv.buyer_id === authStore.user.id ? conv.vendor : conv.buyer;
};

const getConvName = (conv) => {
  const u = getOtherUser(conv);
  return u ? (u.full_name || u.company_name || 'User') : 'User';
};

const getConvMessage = (conv) => {
  return conv && conv.last_message ? conv.last_message.content : 'Started a conversation';
};

const isConvActive = (conv) => {
  return activeConv.value && activeConv.value.id === conv.id;
};

const isMyMessage = (msg) => {
  return authStore.user && msg.sender_id === authStore.user.id;
};

const getAvatar = (conv) => {
  const user = getOtherUser(conv) || {};
  const name = encodeURIComponent(user.company_name || user.full_name || 'User');
  return `https://ui-avatars.com/api/?name=${name}&background=06b6d4&color=fff&bold=true`;
};

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString();
};

const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

const loadConversations = async () => {
  loadingConvs.value = true;
  try {
    const res = await api.get('/chats/conversations');
    conversations.value = res?.data || res || [];
  } catch (err) {
    conversations.value = [];
  } finally {
    loadingConvs.value = false;
  }
};

const selectConversation = async (conv) => {
  activeConv.value = conv;
  loadingMessages.value = true;
  try {
    const res = await api.get(`/chats/${conv.id}/messages`);
    messages.value = res?.data || res || [];
    socketService.joinRoom(conv.id);
    scrollToBottom();
  } catch (err) {
    messages.value = [];
  } finally {
    loadingMessages.value = false;
  }
};

const sendMessage = async () => {
  if (!newMessage.value.trim() || !activeConv.value) return;
  sending.value = true;
  const content = newMessage.value;
  newMessage.value = '';

  try {
    const msg = await api.post(`/chats/${activeConv.value.id}/messages`, { content });
    messages.value.push(msg.data || msg);
    
    const idx = conversations.value.findIndex(c => c.id === activeConv.value.id);
    if (idx !== -1) {
      conversations.value[idx].last_message = { content };
      conversations.value[idx].updated_at = new Date().toISOString();
    }
    socketService.sendMessage(activeConv.value.id, content);
    scrollToBottom();
  } catch (err) {
    newMessage.value = content;
  } finally {
    sending.value = false;
  }
};

onMounted(() => {
  loadConversations();
  socketService.initSocket();
  socketService.onNewMessage((msg) => {
    if (activeConv.value && msg.conversation_id === activeConv.value.id) {
      messages.value.push(msg);
      scrollToBottom();
    }
    const idx = conversations.value.findIndex(c => c.id === msg.conversation_id);
    if (idx !== -1) {
      conversations.value[idx].last_message = msg;
      conversations.value[idx].updated_at = msg.created_at;
      const [c] = conversations.value.splice(idx, 1);
      conversations.value.unshift(c);
    }
  });
});

onBeforeUnmount(() => {
  const socket = socketService.getSocket();
  if (socket) socket.off('new_message');
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
.dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
</style>

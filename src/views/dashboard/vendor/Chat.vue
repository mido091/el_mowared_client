<template>
  <div class="h-[calc(100vh-160px)] flex bg-card border border-border/50 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-700">
    <!-- 1. Conversation List -->
    <div class="w-80 border-e border-border/50 flex flex-col bg-muted/10">
      <div class="p-6 border-b border-border/50 bg-card">
        <h2 class="text-xl font-black text-foreground tracking-tighter uppercase">{{ t('chat.messages') }}</h2>
        <div class="mt-4 relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search buyers..." 
            class="w-full h-10 bg-muted/40 border-border/30 rounded-xl ps-10 text-[10px] font-bold uppercase tracking-widest outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>
      </div>

      <div class="flex-1 overflow-y-auto custom-scrollbar">
        <div v-if="chatStore.loading" class="p-6 space-y-4">
          <div v-for="i in 5" :key="i" class="h-16 bg-muted/20 animate-pulse rounded-2xl"></div>
        </div>
        <div v-else class="divide-y divide-border/30">
          <div 
            v-for="conv in chatStore.conversations" 
            :key="conv.id"
            @click="selectConversation(conv)"
            :class="[
              'p-6 flex gap-4 cursor-pointer transition-all relative group',
              chatStore.activeConversation?.id === conv.id ? 'bg-card' : 'hover:bg-muted/30'
            ]"
          >
            <div class="relative shrink-0">
               <div class="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-primary">
                 {{ (conv.other_party_name || 'U').charAt(0) }}
               </div>
               <div v-if="chatStore.onlineUsers.has(conv.other_party_id)" class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-4 border-card"></div>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-start">
                <h4 class="font-black text-foreground text-sm truncate uppercase tracking-tight">{{ conv.other_party_name }}</h4>
                <span class="text-[8px] font-black text-muted-foreground/40">{{ formatTime(conv.updated_at) }}</span>
              </div>
              <p class="text-[10px] text-muted-foreground font-medium truncate mt-1 opacity-60">
                {{ conv.last_message || 'No messages yet' }}
              </p>
            </div>
            <!-- Active Indicator -->
            <div v-if="chatStore.activeConversation?.id === conv.id" class="absolute left-0 top-6 bottom-6 w-1 bg-primary rounded-r-full shadow-[0_0_12px_rgba(var(--primary),0.5)]"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. Message Stream -->
    <div class="flex-1 flex flex-col bg-background relative">
      <template v-if="chatStore.activeConversation">
        <!-- Chat Header -->
        <div class="p-6 border-b border-border/50 bg-card flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-xl bg-muted border border-border/50 flex items-center justify-center text-primary font-black">
              {{ chatStore.activeConversation.other_party_name.charAt(0) }}
            </div>
            <div>
              <h3 class="font-black text-foreground text-sm uppercase tracking-tight">{{ chatStore.activeConversation.other_party_name }}</h3>
              <p class="text-[8px] font-black text-green-500 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                <div class="w-1 h-1 rounded-full bg-green-500"></div>
                Active Negotiation
              </p>
            </div>
          </div>
          <div class="flex gap-2">
            <button class="p-3 rounded-xl hover:bg-muted text-muted-foreground transition-all">
              <Phone class="w-4 h-4" />
            </button>
            <button class="p-3 rounded-xl hover:bg-muted text-muted-foreground transition-all">
              <MoreHorizontal class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Messages Area -->
        <div class="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-slate-50/50 dark:bg-background/90 bg-repeat">
          <div 
            v-for="(msg, index) in chatStore.messages" 
            :key="msg.id"
            :class="['flex', msg.sender_id === authStore.user.id ? 'justify-end' : 'justify-start']"
          >
            <div :class="[
              'max-w-[70%] p-6 rounded-[2rem] shadow-sm relative group',
              msg.sender_id === authStore.user.id 
                ? 'bg-primary text-white rounded-br-none' 
                : 'bg-card border border-border/50 text-foreground rounded-bl-none'
            ]">
              <p class="text-sm font-medium leading-relaxed">{{ msg.message_text }}</p>
              <span :class="[
                'text-[8px] font-black uppercase tracking-widest mt-3 block opacity-40',
                msg.sender_id === authStore.user.id ? 'text-white/60' : 'text-muted-foreground'
              ]">
                {{ formatFullTime(msg.created_at) }}
              </span>

              <!-- Attachments if any -->
              <div v-if="msg.attachments?.length" class="mt-4 grid grid-cols-2 gap-2">
                 <div v-for="file in msg.attachments" :key="file" class="p-3 rounded-xl bg-black/10 border border-white/10 flex items-center gap-2 cursor-pointer hover:bg-black/20 transition-all">
                    <FileText class="w-3.5 h-3.5" />
                    <span class="text-[9px] font-black truncate">{{ file.split('/').pop() }}</span>
                 </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="p-6 border-t border-border/50 bg-card">
          <div v-if="showQuickReplies" class="mb-4 animate-in slide-in-from-bottom duration-300">
             <div class="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                <button 
                  v-for="reply in repliesStore.replies" 
                  :key="reply.id"
                  @click="useQuickReply(reply.content)"
                  class="shrink-0 h-10 px-5 rounded-xl bg-muted/50 border border-border/50 text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all"
                >
                  {{ reply.title }}
                </button>
             </div>
          </div>

          <div class="relative flex items-end gap-4">
            <div class="flex-1 relative">
              <textarea 
                v-model="newMessage" 
                rows="1"
                @input="handleAutoResize"
                @keydown.enter.prevent="sendMessage"
                placeholder="Negotiate terms or share blueprints..."
                class="w-full bg-muted/30 border border-border/50 rounded-2xl p-4 ps-12 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:bg-card transition-all resize-none max-h-32"
              ></textarea>
              <button @click="showQuickReplies = !showQuickReplies" class="absolute left-4 bottom-4 text-muted-foreground hover:text-primary transition-colors">
                <Zap :class="['w-5 h-5', showQuickReplies ? 'fill-primary text-primary' : '']" />
              </button>
            </div>
            <button @click="handleFileUpload" class="h-14 w-14 rounded-2xl bg-muted border border-border/50 flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all">
              <Paperclip class="w-5 h-5" />
            </button>
            <button @click="sendMessage" :disabled="!newMessage.trim()" class="h-14 px-8 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
              <Send class="w-5 h-5" />
            </button>
          </div>
        </div>
      </template>
      <div v-else class="flex-1 flex flex-col items-center justify-center space-y-6 opacity-30 grayscale">
        <div class="w-32 h-32 bg-muted rounded-[3rem] flex items-center justify-center">
          <MessageCircle class="w-16 h-16 text-muted-foreground" />
        </div>
        <div class="text-center">
           <h3 class="text-xl font-black uppercase tracking-[0.2em]">Select a Negotiation</h3>
           <p class="text-xs font-bold mt-2">Pick a buyer conversation to begin the strategy</p>
        </div>
      </div>
    </div>

    <!-- 3. Negotiation Context Sidebar -->
    <div v-if="chatStore.activeConversation" class="w-96 border-s border-border/50 bg-muted/10 flex flex-col p-8 space-y-10 animate-in slide-in-from-right duration-500">
       <div class="space-y-6">
          <h4 class="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-50">Negotiation Core</h4>
          
          <!-- Context Card (RFQ/Order) -->
          <div class="bg-card border border-border/50 rounded-[2rem] p-6 space-y-4 shadow-sm hover:border-primary/30 transition-all cursor-pointer">
             <div class="flex items-center gap-3">
                <div class="p-2.5 rounded-xl bg-orange-500/10 text-orange-500">
                   <FileSearch class="w-4 h-4" />
                </div>
                <div>
                   <p class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Original RFQ</p>
                   <p class="text-xs font-black text-foreground mt-0.5">Industrial Grade Sensors</p>
                </div>
             </div>
             <p class="text-[10px] font-medium text-muted-foreground line-clamp-2">Looking for 500 units of IP67 rated vibration sensors with custom mounting...</p>
             <button class="w-full h-10 bg-muted/50 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all">
                View RFQ Details
             </button>
          </div>
       </div>

       <!-- Shared Artifacts -->
       <div class="space-y-6">
          <div class="flex items-center justify-between">
             <h4 class="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-50">Shared Documents</h4>
             <button class="text-[8px] font-black text-primary uppercase tracking-widest hover:underline">View All</button>
          </div>
          
          <div class="space-y-3">
             <div v-for="i in 2" :key="i" class="flex items-center gap-4 p-4 bg-card border border-border/50 rounded-2xl hover:border-primary/30 transition-all">
                <div class="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-primary">
                   <FileText class="w-5 h-5" />
                </div>
                <div class="flex-1 min-w-0">
                   <p class="text-[10px] font-black text-foreground truncate uppercase">blueprint_v2.pdf</p>
                   <p class="text-[8px] font-bold text-muted-foreground uppercase opacity-50">Shared 2h ago • 1.2MB</p>
                </div>
                <button class="p-2 text-muted-foreground hover:text-primary transition-colors">
                   <Download class="w-4 h-4" />
                </button>
             </div>
          </div>
       </div>

       <!-- Shortcut Actions -->
       <div class="pt-10 flex flex-col gap-3 mt-auto">
          <button class="h-14 bg-secondary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-secondary/20 hover:scale-105 transition-all">
             Create Official Quote
          </button>
          <p class="text-[8px] text-center font-bold text-muted-foreground uppercase opacity-40">Secure B2B Payment Powered by Escrow</p>
       </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { 
  Search, Phone, MoreHorizontal, Send, 
  Paperclip, MessageCircle, FileText, Download,
  Zap, FileSearch, ChevronRight, MoreVertical
} from 'lucide-vue-next';
import { useChatStore } from '@/stores/chat';
import { useAuthStore } from '@/stores/auth';
import { useQuickRepliesStore } from '@/stores/quickRepliesStore';

const { t, locale } = useI18n();
const chatStore = useChatStore();
const authStore = useAuthStore();
const repliesStore = useQuickRepliesStore();

const newMessage = ref('');
const showQuickReplies = ref(false);

const selectConversation = (conv) => {
  chatStore.setActiveConversation(conv);
};

const sendMessage = () => {
  if (!newMessage.value.trim()) return;
  // This would typically involve chatStore.uploadAttachments or a direct message send
  // Simplified for the premium UI demonstration
  const msgText = newMessage.value;
  newMessage.value = '';
  showQuickReplies.value = false;
  // backend integration logic here via chatStore
};

const handleAutoResize = (e) => {
  e.target.style.height = 'auto';
  e.target.style.height = (e.target.scrollHeight) + 'px';
};

const useQuickReply = (content) => {
  newMessage.value = content;
  showQuickReplies.value = false;
};

const formatTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatFullTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' });
};

const handleFileUpload = () => {
  // Trigger file input
};

onMounted(() => {
  chatStore.fetchConversations();
  repliesStore.fetchReplies();
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: hsl(var(--border) / 0.5); border-radius: 20px; }
</style>

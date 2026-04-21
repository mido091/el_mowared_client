<template>
  <div class="fixed bottom-0 right-6 rtl:left-6 rtl:right-auto z-[100] flex flex-col items-end gap-3 pointer-events-none">
    <div
      v-if="supportRequests.length && !chatStore.supportBoxDismissed"
      class="pointer-events-auto w-[360px] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-2xl dark:border-slate-800 dark:bg-slate-900/95"
    >
      <div class="bg-[linear-gradient(135deg,#1e293b_0%,hsl(var(--primary))_100%)] px-4 py-3 text-white">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-xs font-black uppercase tracking-[0.18em]">
              {{ locale === 'ar' ? 'طلبات الدعم' : 'Support Requests' }}
            </p>
            <p class="mt-1 text-[10px] text-white/75">
              {{ locale === 'ar' ? `${supportRequests.length} طلب بانتظار الاستلام` : `${supportRequests.length} request(s) waiting` }}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <div class="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-black">
              {{ supportRequests.length }}
            </div>
            <button
              class="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-white/15"
              @click.stop="chatStore.supportBoxDismissed = true"
            >
              <X class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div class="max-h-[280px] space-y-2 overflow-y-auto p-3 custom-scrollbar">
        <div
          v-for="request in supportRequests"
          :key="request.id"
          class="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/60"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="truncate text-sm font-bold text-slate-800 dark:text-slate-100">
                {{ request.user_first_name }} {{ request.user_last_name }}
              </p>
              <p class="mt-1 line-clamp-2 text-[11px] text-slate-500 dark:text-slate-400">
                {{ request.last_message || (locale === 'ar' ? 'طلب دعم جديد' : 'New support request') }}
              </p>
            </div>
            <span
              class="shrink-0 rounded-full px-2 py-1 text-[10px] font-black"
              :class="`${request.status}`.toLowerCase() === 'assigned'
                ? 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'"
            >
              {{ `${request.status}`.toLowerCase() === 'assigned'
                ? (locale === 'ar' ? 'مباشر' : 'Live')
                : (locale === 'ar' ? 'انتظار' : 'Waiting') }}
            </span>
          </div>

          <div class="mt-3 flex items-center justify-between gap-2">
            <span class="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">#{{ request.id }}</span>
            <button
              @click="claimRequest(request)"
              class="rounded-xl bg-primary px-3 py-2 text-[11px] font-black text-white shadow-lg shadow-primary/20 transition hover:brightness-110"
            >
              {{ locale === 'ar' ? 'استلام المحادثة' : 'Claim Chat' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="flex items-end gap-3 pointer-events-none">
      <div
        v-for="popup in activePopups"
        :key="popup.id"
        class="pointer-events-auto flex w-[340px] max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-[0_-12px_40px_-18px_rgba(15,23,42,0.35)] transition-all duration-300 dark:border-slate-800 dark:bg-slate-900"
        :class="popup.minimized ? 'h-12' : 'h-[460px]'"
      >
        <div
          class="flex h-12 cursor-pointer items-center justify-between bg-[linear-gradient(135deg,#1e293b_0%,hsl(var(--primary))_100%)] px-4 text-white"
          @click="toggleMinimized(popup.id)"
        >
          <div class="min-w-0 flex items-center gap-3">
            <span class="relative flex h-2.5 w-2.5">
              <span
                class="absolute inline-flex h-full w-full rounded-full opacity-75"
                :class="chatStore.isOtherPartyOnline(popup.user_id) ? 'bg-emerald-400 animate-ping' : 'bg-slate-400'"
              />
              <span
                class="relative inline-flex h-2.5 w-2.5 rounded-full"
                :class="chatStore.isOtherPartyOnline(popup.user_id) ? 'bg-emerald-400' : 'bg-slate-400'"
              />
            </span>
            <div class="min-w-0">
              <p class="truncate text-sm font-bold">
                {{ popup.user_first_name }} {{ popup.user_last_name }}
              </p>
              <p class="truncate text-[10px] font-medium uppercase tracking-[0.18em] text-white/70">
                {{ popup.type === 'SUPPORT' ? (locale === 'ar' ? 'دعم' : 'Support') : popup.type }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-1">
            <span
              v-if="popup.unread_count > 0"
              class="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white/15 px-1.5 text-[10px] font-bold"
            >
              {{ popup.unread_count > 99 ? '99+' : popup.unread_count }}
            </span>
            <button
              class="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-white/15"
              @click.stop="closePopup(popup.id)"
            >
              <X class="h-4 w-4" />
            </button>
          </div>
        </div>

        <div v-show="!popup.minimized" class="flex min-h-0 flex-1 flex-col">
          <div
            :ref="(el) => setBoxRef(popup.id, el)"
            class="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-3 custom-scrollbar dark:bg-slate-950"
          >
            <div v-if="loading[popup.id]" class="flex h-full items-center justify-center">
              <Loader2 class="h-6 w-6 animate-spin text-primary" />
            </div>

            <template v-else>
              <div
                v-for="msg in (messages[popup.id] || [])"
                :key="msg.id"
                :class="['flex', msg.sender_id === authStore.user?.id && msg.type !== 'SYSTEM' ? 'justify-end' : 'justify-start']"
              >
                <div class="max-w-[85%] rounded-2xl px-3 py-2.5 text-[13px] leading-relaxed shadow-sm" :class="messageClass(msg)">
                  {{ msg.message_text }}
                </div>
              </div>
            </template>
          </div>

          <div v-if="showQuickReplies" class="border-t border-slate-200 bg-slate-50 px-2 py-2 dark:border-slate-800 dark:bg-slate-900">
            <div class="flex gap-2 overflow-x-auto custom-scrollbar">
              <button
                v-for="reply in quickReplies"
                :key="reply.id"
                class="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold text-slate-600 transition-colors hover:border-primary/40 hover:text-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                @click="inputs[popup.id] = reply.content"
              >
                {{ reply.title }}
              </button>
            </div>
          </div>

          <div class="border-t border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900">
            <div class="mb-2 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.18em]">
              <button class="text-primary transition-colors hover:text-primary/70" @click="toggleMinimized(popup.id)">
                {{ locale === 'ar' ? 'تصغير' : 'Minimize' }}
              </button>
              <div class="flex items-center gap-3">
                <button class="text-rose-600 transition-colors hover:text-rose-500" @click="endConversation(popup.id)">
                  {{ locale === 'ar' ? 'انهاء و حذف المحادثه' : 'End & Delete Conversation' }}
                </button>
                <button class="text-slate-500 transition-colors hover:text-rose-600" @click="deleteConversation(popup.id)">
                  {{ locale === 'ar' ? 'حذف الرسائل' : 'Delete Messages' }}
                </button>
              </div>
            </div>

            <form class="flex items-end gap-2" @submit.prevent="sendMessage(popup.id)">
              <input
                v-model="inputs[popup.id]"
                type="text"
                :placeholder="locale === 'ar' ? 'اكتب الرد...' : 'Type reply...'"
                class="h-11 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition-all focus:border-primary/40 focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800"
              />
              <button
                type="submit"
                :disabled="!inputs[popup.id]?.trim()"
                class="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white hover:brightness-110 disabled:opacity-50"
              >
                <Send class="h-4 w-4 rtl:-scale-x-100" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * @file AdminChatPopups.vue
 * @description Floating UI manager for admin support agents. Operates independently
 * of the global layout to persist active chat windows across page navigations.
 *
 * Capabilities:
 *  - Displays a queue of incoming, unassigned support requests.
 *  - Manages up to 3 concurrent "popup" chat windows simultaneously.
 *  - Directly binds to Pusher events (`new_message`, `support_assigned`) to auto-open
 *    popups when an admin receives a message or is automatically routed a new chat.
 *  - Retrieves canned responses from `quickRepliesStore`.
 */

import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Loader2, Send, X } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { useChatStore } from '@/stores/chat';
import { useQuickRepliesStore } from '@/stores/quickRepliesStore';
import socketService from '@/services/socket.service';
import api from '@/services/api';
import { getApiCollection } from '@/utils/apiResponse';

const { locale } = useI18n();
const authStore = useAuthStore();
const chatStore = useChatStore();
const quickRepliesStore = useQuickRepliesStore();

const activePopups = ref([]);
const messages = ref({});
const inputs = ref({});
const loading = ref({});
const boxRefs = ref({});

const showQuickReplies = computed(() => ['mowared', 'admin', 'owner'].includes(`${authStore.user?.role || ''}`.toLowerCase()));
const quickReplies = computed(() => quickRepliesStore.replies.slice(0, 6));
const supportRequests = computed(() => chatStore.supportRequests);

const handleNewMessage = async (payload) => {
  const role = `${authStore.user?.role || ''}`.toLowerCase();
  if (!['admin', 'owner'].includes(role)) return;

  const message = payload?.message || payload;
  const conversationId = Number(payload?.conversationId || message?.conversation_id);
  if (!conversationId || Number(message?.sender_id) === Number(authStore.user?.id)) return;

  const resolvedConversation = chatStore.conversations.find((item) => Number(item.id) === Number(conversationId));
  if (!resolvedConversation) return;

  if (`${resolvedConversation.type || ''}`.toUpperCase() === 'SUPPORT' && !resolvedConversation.admin_id) {
    return;
  }

  await openPopup(resolvedConversation, { reloadMessages: false });
  if (!messages.value[conversationId]) {
    messages.value[conversationId] = [];
  }
  if (!messages.value[conversationId].some((item) => Number(item.id) === Number(message.id))) {
    messages.value[conversationId].push(message);
    scrollToBottom(conversationId);
  }
};

const handleSupportAssigned = async ({ conversationId, adminId, status }) => {
  const role = `${authStore.user?.role || ''}`.toLowerCase();
  if (!['admin', 'owner'].includes(role) || !conversationId) return;

  const normalizedStatus = `${status || ''}`.toLowerCase();
  if (['closed', 'archived'].includes(normalizedStatus)) {
    closePopup(conversationId);
    return;
  }

  if (adminId && Number(adminId) !== Number(authStore.user?.id)) {
    closePopup(conversationId);
    return;
  }

  const conversation = chatStore.conversations.find((item) => Number(item.id) === Number(conversationId));
  if (conversation && conversation.admin_id && Number(conversation.admin_id) === Number(authStore.user?.id)) {
    await openPopup(conversation, { reloadMessages: false });
  }
};

const handleConversationDeleted = ({ conversationId }) => {
  if (!conversationId) return;
  closePopup(conversationId);
};

function setBoxRef(id, el) {
  if (el) boxRefs.value[id] = el;
}

function scrollToBottom(id) {
  nextTick(() => {
    const el = boxRefs.value[id];
    if (el) el.scrollTop = el.scrollHeight;
  });
}

function messageClass(msg) {
  if (msg.type === 'SYSTEM') {
    return 'border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200';
  }
  if (msg.sender_id === authStore.user?.id) {
    return 'bg-primary text-white';
  }
  return 'border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200';
}

async function openPopup(conversation, options = {}) {
  const { reloadMessages = true } = options;
  const exists = activePopups.value.find((popup) => Number(popup.id) === Number(conversation.id));
  if (exists) {
    exists.minimized = false;
    Object.assign(exists, conversation);
    socketService.emit('join_conversation', conversation.id);
    if (reloadMessages) {
      await loadMessages(conversation.id);
    }
    return;
  }

  if (activePopups.value.length >= 3) {
    const removed = activePopups.value.shift();
    if (removed?.id) {
      socketService.emit('leave_conversation', removed.id);
    }
  }

  activePopups.value.push({
    ...conversation,
    minimized: false
  });
  socketService.emit('join_conversation', conversation.id);
  inputs.value[conversation.id] = inputs.value[conversation.id] || '';
  if (reloadMessages) {
    await loadMessages(conversation.id);
  }
}

function closePopup(id) {
  socketService.emit('leave_conversation', id);
  activePopups.value = activePopups.value.filter((popup) => Number(popup.id) !== Number(id));
}

function toggleMinimized(id) {
  const popup = activePopups.value.find((item) => Number(item.id) === Number(id));
  if (popup) popup.minimized = !popup.minimized;
}

async function loadMessages(id) {
  loading.value[id] = true;
  try {
    const res = await api.get(`/chats/${id}/messages`);
    messages.value[id] = getApiCollection(res, ['messages']);
    scrollToBottom(id);
  } catch (error) {
    console.error('Admin popup loadMessages', error);
  } finally {
    loading.value[id] = false;
  }
}

async function bootstrapSupportWorkspace() {
  await chatStore.fetchConversations();
  const mine = chatStore.mySupportChats
    .slice()
    .sort((a, b) => new Date(b.last_activity_at || b.updated_at || b.created_at) - new Date(a.last_activity_at || a.updated_at || a.created_at))
    .slice(0, 3);

  for (const conversation of mine) {
    await openPopup(conversation);
  }
}

async function claimRequest(request) {
  try {
    const claimed = await chatStore.claimSupportConversation(request.id);
    await chatStore.fetchConversations();
    await openPopup(claimed);
  } catch (error) {
    console.error('Support claim failed', error);
  }
}

async function sendMessage(id) {
  const value = inputs.value[id];
  if (!value?.trim()) return;
  const original = value;
  inputs.value[id] = '';
  try {
    const message = await chatStore.sendMessage(id, value);
    if (!messages.value[id]?.some((item) => Number(item.id) === Number(message.id))) {
      messages.value[id] = [...(messages.value[id] || []), message];
    }
    scrollToBottom(id);
  } catch (error) {
    console.error('Admin popup sendMessage', error);
    inputs.value[id] = original;
  }
}

async function endConversation(id) {
  await chatStore.updateConversationStatus(id, 'closed');
  closePopup(id);
}

async function deleteConversation(id) {
  try {
    await chatStore.deleteConversation(id);
    closePopup(id);
  } catch (error) {
    console.error('Admin popup deleteConversation', error);
  }
}

onMounted(async () => {
  if (showQuickReplies.value) {
    quickRepliesStore.fetchReplies();
  }

  await bootstrapSupportWorkspace();

  socketService.on('new_message', handleNewMessage);
  socketService.on('support_assigned', handleSupportAssigned);
  socketService.on('conversation_deleted', handleConversationDeleted);
});

onUnmounted(() => {
  socketService.off('new_message', handleNewMessage);
  socketService.off('support_assigned', handleSupportAssigned);
  socketService.off('conversation_deleted', handleConversationDeleted);
  activePopups.value.forEach((popup) => socketService.emit('leave_conversation', popup.id));
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: hsl(var(--border) / 0.5); border-radius: 20px; }
</style>

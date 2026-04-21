<template>
  <div class="fixed bottom-6 right-6 rtl:left-6 rtl:right-auto z-[999] pointer-events-none">
    <div
      v-if="isOpen"
      class="absolute bottom-16 right-0 rtl:left-0 rtl:right-auto w-[320px] h-[440px] sm:w-[380px] sm:h-[560px] max-w-[calc(100vw-1.5rem)] bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col pointer-events-auto"
    >
      <div class="relative overflow-hidden bg-[linear-gradient(135deg,#1e293b_0%,hsl(var(--primary))_100%)] px-5 py-4 text-white">
        <div class="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_top_left,white_0,transparent_48%)]"></div>
        <div class="relative z-10 flex items-start justify-between gap-4">
          <div class="min-w-0">
            <p class="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">
              {{ locale === 'ar' ? 'دعم المورد' : 'Elmowared Support' }}
            </p>
            <h3 class="mt-1 text-lg font-black">
              {{ locale === 'ar' ? 'الدعم المباشر' : 'Live Support' }}
            </h3>
            <div class="mt-2 flex items-center gap-2 text-xs font-medium text-white/80">
              <span class="h-2 w-2 rounded-full" :class="supportStatusDotClass"></span>
              <span>{{ supportStatusText }}</span>
            </div>
          </div>
          <button
            @click="close"
            class="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref="messagesBox"
        class="flex-1 overflow-y-auto bg-slate-50/90 dark:bg-slate-950 p-4 custom-scrollbar"
      >
        <div v-if="!currentSupportConversation" class="h-full flex flex-col justify-center">
          <div class="mx-auto w-full max-w-[290px] rounded-[2rem] border border-slate-200 bg-white p-6 text-center shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-primary/10 text-primary">
              <Headset class="w-8 h-8" />
            </div>
            <h4 class="mt-4 text-lg font-black text-slate-800 dark:text-slate-100">
              {{ locale === 'ar' ? 'مرحبًا بك في المورد' : 'Welcome to Elmowared' }}
            </h4>
            <p class="mt-2 text-sm leading-7 text-slate-500 dark:text-slate-400">
              {{ locale === 'ar' ? 'كيف يمكننا مساعدتك اليوم؟' : 'How can we help you today?' }}
            </p>
            <button
              @click="startSupport"
              :disabled="isConnecting"
              class="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[1.2rem] bg-primary px-4 py-3 text-sm font-black text-white shadow-lg shadow-primary/20 transition hover:brightness-110 disabled:opacity-60"
            >
              <Loader2 v-if="isConnecting" class="w-4 h-4 animate-spin" />
              <LifeBuoy v-else class="w-4 h-4" />
              {{ locale === 'ar' ? 'تواصل مع الدعم' : 'Contact Support' }}
            </button>
          </div>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="msg in visibleMessages"
            :key="msg.id"
            :class="['flex', msg.sender_id === authStore.user?.id && msg.type !== 'SYSTEM' ? 'justify-end' : 'justify-start']"
          >
            <div
              :class="messageBubbleClass(msg)"
              class="max-w-[85%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed shadow-sm"
            >
              <div
                v-if="msg.type === 'SYSTEM' && msg.metadata?.estimatedResponseMinutes"
                class="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-600 dark:text-amber-400"
              >
                {{ locale === 'ar' ? `متوسط وقت الرد ${msg.metadata.estimatedResponseMinutes} دقيقة` : `ETA ${msg.metadata.estimatedResponseMinutes} min` }}
              </div>
              <div>{{ msg.message_text }}</div>
              <router-link
                v-if="msg.type === 'SYSTEM' && msg.metadata?.cta"
                :to="msg.metadata.cta"
                @click="close"
                class="mt-2 inline-flex text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
              >
                {{ locale === 'ar' ? 'اذهب إلى صفحة تواصل معنا' : 'Go to Contact Us' }}
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <div class="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
        <div
          v-if="currentSupportConversation && currentSupportConversation.status === 'closed'"
          class="mb-3 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 px-4 py-3 text-xs text-rose-700 dark:text-rose-300"
        >
          {{ locale === 'ar' ? 'تم إنهاء هذه المحادثة. عند التواصل مرة أخرى سيتم إنشاء محادثة دعم جديدة.' : 'This support conversation has ended. A new support chat will be created next time.' }}
        </div>

        <div
          v-else-if="showBusyNotice"
          class="mb-3 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-4 py-3 text-xs text-amber-700 dark:text-amber-300"
        >
          {{ locale === 'ar'
            ? 'جميع خدمة العملاء مشغولون الآن. يمكنك كتابة استفسارك وسيتم الرد عليك في أقرب وقت.'
            : 'All support agents are busy right now. You can write your inquiry and we will reply as soon as possible.' }}
        </div>

        <div
          v-if="currentSupportConversation && chatStore.supportAvailability.estimatedResponseMinutes && isInputLocked"
          class="mb-3 rounded-2xl bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 px-4 py-3 text-xs text-sky-700 dark:text-sky-300"
        >
          {{ locale === 'ar'
            ? `الرد المتوقع خلال ${chatStore.supportAvailability.estimatedResponseMinutes} دقيقة تقريبًا.`
            : `Estimated response time is about ${chatStore.supportAvailability.estimatedResponseMinutes} minutes.` }}
        </div>

        <div v-if="currentSupportConversation" class="mb-3 flex items-center justify-end gap-2">
          <button
            type="button"
            class="text-[11px] font-black uppercase tracking-[0.18em] text-rose-600 hover:text-rose-500 transition-colors"
            @click="endConversation"
          >
            {{ locale === 'ar' ? 'انهاء و حذف المحادثه' : 'End & Delete Conversation' }}
          </button>
        </div>

        <form v-if="currentSupportConversation" @submit.prevent="send" class="relative flex items-center">
          <input
            v-model="inputText"
            type="text"
            :placeholder="inputPlaceholder"
            class="w-full h-12 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 pe-12 text-sm outline-none transition-all focus:border-primary/40 focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
            :disabled="isInputLocked || isConnecting || chatStore.sending"
          />
          <button
            type="submit"
            :disabled="!inputText.trim() || isInputLocked || isConnecting || chatStore.sending"
            class="absolute right-2 rtl:left-2 rtl:right-auto h-8 w-8 rounded-xl bg-primary text-white flex items-center justify-center hover:brightness-110 disabled:opacity-50"
          >
            <Loader2 v-if="chatStore.sending" class="w-4 h-4 animate-spin" />
            <Send v-else class="w-4 h-4 rtl:-scale-x-100" />
          </button>
        </form>
      </div>
    </div>

    <button
      v-show="authStore.token && route.name !== 'Chat'"
      @click="toggle"
      class="pointer-events-auto relative h-14 w-14 rounded-[1.2rem] bg-primary text-white shadow-2xl shadow-primary/25 hover:brightness-110 transition-all active:scale-95 flex items-center justify-center"
    >
      <MessageSquare v-if="!isOpen" class="w-6 h-6" />
      <X v-else class="w-6 h-6" />
      <span
        v-if="!isOpen && unreadCount > 0"
        class="absolute -top-1 -right-1 min-w-[20px] h-5 rounded-full bg-rose-500 border-2 border-white dark:border-slate-900 text-[10px] font-bold flex items-center justify-center px-1"
      >
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>
  </div>
</template>

<script setup>
/**
 * @file GlobalChatWidget.vue
 * @description Floating UI widget allowing any logged-in User/Vendor to initialize
 * or resume a SUPPORT conversation. It integrates tightly with Pinia's `chatStore`
 * for real-time messaging, presence polling, and UI state synchronization.
 *
 * Key features:
 *  - Automatically pulls the active SUPPORT conversation via `chatStore.supportConversation`.
 *  - Polls support availability/ETA while an agent hasn't yet joined (`refreshSupportAvailability`).
 *  - Subscribes to Pusher events indirectly by activating the conversation in the store.
 */

import { computed, nextTick, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Headset, LifeBuoy, Loader2, MessageSquare, Send, X } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { useChatStore } from '@/stores/chat';

const route = useRoute();
const { locale } = useI18n();
const authStore = useAuthStore();
const chatStore = useChatStore();

const isOpen = ref(false);
const isConnecting = ref(false);
const inputText = ref('');
const messagesBox = ref(null);

const supportConversation = computed(() => chatStore.supportConversation);
const currentSupportConversation = computed(() => {
  if (supportConversation.value) return supportConversation.value;
  if (`${chatStore.activeConversation?.type || ''}`.toUpperCase() === 'SUPPORT') {
    return chatStore.activeConversation;
  }
  return null;
});

const unreadCount = computed(() => supportConversation.value?.unread_count || 0);
const visibleMessages = computed(() => {
  if (!chatStore.activeConversation || `${chatStore.activeConversation.type || ''}`.toUpperCase() !== 'SUPPORT') {
    return [];
  }
  return chatStore.messages;
});

const isInputLocked = computed(() => chatStore.activeConversationIsLocked);
const showBusyNotice = computed(() => {
  if (!currentSupportConversation.value) return false;
  const status = `${currentSupportConversation.value.status || ''}`.toLowerCase();
  return status === 'waiting' && !currentSupportConversation.value.admin_id && !chatStore.supportAvailability.available;
});

const inputPlaceholder = computed(() => {
  if (isInputLocked.value) {
    return locale.value === 'ar' ? 'بانتظار رد فريق الدعم...' : 'Waiting for support to reply...';
  }
  return locale.value === 'ar' ? 'اكتب استفسارك...' : 'Type your message...';
});

const supportStatusText = computed(() => {
  if (!currentSupportConversation.value) {
    return locale.value === 'ar' ? 'جاهز لاستقبال استفسارك' : 'Ready to help';
  }

  const status = `${currentSupportConversation.value.status || ''}`.toLowerCase();
  if (status === 'assigned' && currentSupportConversation.value.admin_id) {
    return locale.value === 'ar' ? 'يرجى الانتظار حتى يتم استلام طلبك' : 'Please wait while an agent takes your request';
  }
  if (status === 'waiting' && chatStore.supportAvailability.available) {
    return locale.value === 'ar' ? 'فريق الدعم متاح وسيتم استلام طلبك قريبًا' : 'Support is available and your request will be picked up shortly';
  }
  if (status === 'waiting') {
    return locale.value === 'ar' ? 'في انتظار استفسارك أو رد الدعم' : 'Waiting for your inquiry or support reply';
  }
  if (status === 'active') {
    return locale.value === 'ar' ? 'محادثة نشطة مع الدعم' : 'Live support conversation';
  }
  return locale.value === 'ar' ? 'جلسة دعم' : 'Support session';
});

const supportStatusDotClass = computed(() => {
  if (!currentSupportConversation.value) return 'bg-emerald-400 animate-pulse';
  const status = `${currentSupportConversation.value.status || ''}`.toLowerCase();
  if (status === 'active') return 'bg-emerald-400 animate-pulse';
  if (status === 'assigned' && currentSupportConversation.value.admin_id) return 'bg-sky-400 animate-pulse';
  if (status === 'waiting' && chatStore.supportAvailability.available) return 'bg-emerald-400 animate-pulse';
  if (status === 'waiting') return 'bg-amber-400';
  return 'bg-slate-300';
});

function messageBubbleClass(msg) {
  if (msg.type === 'SYSTEM') {
    return 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200';
  }
  if (msg.sender_id === authStore.user?.id) {
    return 'bg-primary text-white';
  }
  return 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200';
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesBox.value) {
      messagesBox.value.scrollTop = messagesBox.value.scrollHeight;
    }
  });
}

watch(() => chatStore.messages.length, scrollToBottom);

async function startSupport() {
  await chatStore.ensureConversationsLoaded();

  if (currentSupportConversation.value) {
    await chatStore.setActiveConversation(currentSupportConversation.value);
    await chatStore.refreshSupportAvailability(currentSupportConversation.value.id);
    return;
  }

  isConnecting.value = true;
  try {
    const initialText = locale.value === 'ar' ? 'التواصل مع الدعم' : 'Contact Support';
    const result = await chatStore.startSupportChat(initialText, locale.value);
    if (result?.conversation?.id) {
      await chatStore.setActiveConversation(result.conversation);
      await chatStore.refreshSupportAvailability(result.conversation.id);
    }
  } catch (error) {
    console.error('[GlobalChatWidget.startSupport]', error);
  } finally {
    isConnecting.value = false;
    scrollToBottom();
  }
}

async function toggle() {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    await chatStore.ensureConversationsLoaded();
  }
  if (isOpen.value && currentSupportConversation.value) {
    if (chatStore.activeConversation?.id !== currentSupportConversation.value.id) {
      await chatStore.setActiveConversation(currentSupportConversation.value);
    } else {
      await chatStore.refreshSupportAvailability(currentSupportConversation.value.id);
    }
    scrollToBottom();
  }
  if (!isOpen.value) {
    await chatStore.setActiveConversation(null);
  }
}

async function close() {
  isOpen.value = false;
  await chatStore.setActiveConversation(null);
}

async function send() {
  if (!inputText.value.trim() || isInputLocked.value || !chatStore.activeConversation?.id) return;
  const message = inputText.value;
  inputText.value = '';
  try {
    await chatStore.sendMessage(chatStore.activeConversation.id, message);
    scrollToBottom();
  } catch {
    inputText.value = message;
  }
}

async function endConversation() {
  if (!currentSupportConversation.value?.id) return;
  await chatStore.updateConversationStatus(currentSupportConversation.value.id, 'closed');
  inputText.value = '';
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: hsl(var(--border) / 0.5); border-radius: 20px; }
</style>

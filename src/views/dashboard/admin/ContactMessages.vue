<template>
  <div class="space-y-6" :dir="isArabic ? 'rtl' : 'ltr'">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div class="space-y-2">
        <h1 class="text-3xl font-black tracking-tight text-foreground">
          {{ isArabic ? 'مركز مراجعة المحادثات' : 'Conversation Review Center' }}
        </h1>
        <p class="max-w-3xl text-sm leading-7 text-muted-foreground">
          {{
            isArabic
              ? 'يعرض هذا المركز جميع محادثات المستخدمين مع الدعم أو الموردين من الأحدث إلى الأقدم. يمكنك مراجعة المحادثة كاملة، وأرشفة المحادثات المهمة، ومتابعة المحادثات التي ستحذف تلقائيًا بعد 7 أيام إذا لم يتم الاحتفاظ بها.'
              : 'This center lists all user conversations with support or suppliers from newest to oldest. Review the full chat, archive important conversations, and monitor the ones that will be deleted automatically after 7 days if they remain unarchived.'
          }}
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <button
          class="btn-outline btn-sm border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-500/20 dark:text-rose-300 dark:hover:bg-rose-500/10"
          :disabled="loading || actionLoading || !conversations.length"
          @click="deleteAllConversations"
        >
          <Trash2 class="h-4 w-4" />
          <span>{{ isArabic ? 'حذف الكل' : 'Delete All' }}</span>
        </button>
        <button class="btn-outline btn-sm" :disabled="loading" @click="fetchConversations">
          {{ isArabic ? 'تحديث' : 'Refresh' }}
        </button>
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        class="rounded-[1.5rem] border p-5 text-start transition-all"
        :class="activeTab === tab.key
          ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10'
          : 'border-border bg-card hover:border-primary/30 hover:bg-primary/5'"
        @click="changeTab(tab.key)"
      >
        <p class="text-xs font-black uppercase tracking-[0.22em] text-muted-foreground">
          {{ tab.label }}
        </p>
        <div class="mt-4 flex items-end justify-between gap-4">
          <p class="text-3xl font-black text-foreground">{{ counts[tab.key] }}</p>
          <component :is="tab.icon" class="h-6 w-6 text-primary" />
        </div>
      </button>
    </div>

    <div class="rounded-[2rem] border border-border bg-card shadow-sm">
      <div class="overflow-x-auto">
        <table v-if="!loading && conversations.length" class="min-w-full divide-y divide-border">
          <thead class="bg-muted/30">
            <tr>
              <th class="px-5 py-4 text-start text-xs font-black uppercase tracking-[0.22em] text-muted-foreground">
                {{ isArabic ? 'التاريخ' : 'Date' }}
              </th>
              <th class="px-5 py-4 text-start text-xs font-black uppercase tracking-[0.22em] text-muted-foreground">
                {{ isArabic ? 'المتصل' : 'Contact' }}
              </th>
              <th class="px-5 py-4 text-start text-xs font-black uppercase tracking-[0.22em] text-muted-foreground">
                {{ isArabic ? 'المجيب' : 'Responder' }}
              </th>
              <th class="px-5 py-4 text-start text-xs font-black uppercase tracking-[0.22em] text-muted-foreground">
                {{ isArabic ? 'الحالة' : 'Status' }}
              </th>
              <th class="px-5 py-4 text-start text-xs font-black uppercase tracking-[0.22em] text-muted-foreground">
                {{ isArabic ? 'الرسائل' : 'Messages' }}
              </th>
              <th class="px-5 py-4 text-start text-xs font-black uppercase tracking-[0.22em] text-muted-foreground">
                {{ isArabic ? 'الاحتفاظ' : 'Retention' }}
              </th>
              <th class="px-5 py-4 text-start text-xs font-black uppercase tracking-[0.22em] text-muted-foreground">
                {{ isArabic ? 'إجراء' : 'Action' }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr v-for="conversation in conversations" :key="conversation.id" class="hover:bg-muted/20">
              <td class="px-5 py-4 text-sm text-muted-foreground">
                {{ formatDate(conversation.last_activity_at || conversation.updated_at || conversation.created_at) }}
              </td>
              <td class="px-5 py-4">
                <div class="space-y-1">
                  <p class="font-bold text-foreground">{{ getUserName(conversation) }}</p>
                  <p class="text-xs text-muted-foreground">{{ conversation.user_email || (isArabic ? 'بدون بريد' : 'No email') }}</p>
                </div>
              </td>
              <td class="px-5 py-4">
                <div class="space-y-1">
                  <p class="font-bold text-foreground">{{ getAgentName(conversation) }}</p>
                  <p class="text-xs text-muted-foreground">
                    {{ Number(conversation.admin_id) ? (isArabic ? 'تم الرد' : 'Responded') : (isArabic ? 'بانتظار الرد' : 'Waiting for reply') }}
                  </p>
                </div>
              </td>
              <td class="px-5 py-4">
                <span :class="statusClass(conversation)">
                  {{ statusLabel(conversation) }}
                </span>
              </td>
              <td class="px-5 py-4 text-sm font-bold text-foreground">
                {{ conversation.message_count || 0 }}
              </td>
              <td class="px-5 py-4 text-sm">
                <div class="space-y-1">
                  <p class="font-semibold text-foreground">{{ retentionLabel(conversation) }}</p>
                  <p class="text-xs text-muted-foreground">{{ retentionHint(conversation) }}</p>
                </div>
              </td>
              <td class="px-5 py-4">
                <button class="btn-outline btn-sm" @click="openConversation(conversation)">
                  {{ isArabic ? 'عرض المحادثة' : 'Open Chat' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-else-if="loading" class="flex justify-center py-16">
          <Loader2 class="h-8 w-8 animate-spin text-primary" />
        </div>

        <div v-else class="py-16 text-center text-muted-foreground">
          {{ emptyState }}
        </div>
      </div>
    </div>

    <BaseModal
      v-model="detailsOpen"
      :title="selectedConversation ? `${isArabic ? 'المحادثة #' : 'Conversation #'}${selectedConversation.id}` : ''"
      size="xl"
    >
      <div v-if="selectedConversation" class="space-y-5">
        <div class="grid gap-4 rounded-[1.5rem] border border-border bg-muted/20 p-4 md:grid-cols-3">
          <div>
            <p class="text-xs font-black uppercase tracking-[0.22em] text-muted-foreground">
              {{ isArabic ? 'المتصل' : 'Contact' }}
            </p>
            <p class="mt-2 font-bold text-foreground">{{ getUserName(selectedConversation) }}</p>
          </div>
          <div>
            <p class="text-xs font-black uppercase tracking-[0.22em] text-muted-foreground">
              {{ isArabic ? 'المجيب' : 'Responder' }}
            </p>
            <p class="mt-2 font-bold text-foreground">{{ getAgentName(selectedConversation) }}</p>
          </div>
          <div>
            <p class="text-xs font-black uppercase tracking-[0.22em] text-muted-foreground">
              {{ isArabic ? 'الاحتفاظ' : 'Retention' }}
            </p>
            <p class="mt-2 font-bold text-foreground">{{ retentionLabel(selectedConversation) }}</p>
            <p class="mt-1 text-xs text-muted-foreground">{{ retentionHint(selectedConversation) }}</p>
          </div>
        </div>

        <div class="max-h-[26rem] space-y-4 overflow-y-auto rounded-[1.5rem] border border-border bg-background p-4">
          <div v-if="detailsLoading" class="flex justify-center py-10">
            <Loader2 class="h-7 w-7 animate-spin text-primary" />
          </div>

          <div v-else-if="!selectedMessages.length" class="py-10 text-center text-sm text-muted-foreground">
            {{ isArabic ? 'لا توجد رسائل داخل هذه المحادثة.' : 'No messages in this conversation.' }}
          </div>

          <div v-else v-for="message in selectedMessages" :key="message.id">
            <div v-if="message.type === 'SYSTEM'" class="mx-auto max-w-md rounded-2xl bg-muted px-4 py-2 text-center text-xs font-bold text-muted-foreground">
              {{ message.message_text }}
            </div>
            <div
              v-else
              class="flex"
              :class="isMessageFromRequester(message, selectedConversation) ? 'justify-start' : 'justify-end'"
            >
              <div
                class="max-w-[85%] space-y-2 rounded-[1.5rem] px-4 py-3 shadow-sm"
                :class="isMessageFromRequester(message, selectedConversation)
                  ? 'bg-muted text-foreground'
                  : 'bg-primary text-primary-foreground'"
              >
                <div class="flex items-center justify-between gap-3">
                  <p class="text-xs font-black uppercase tracking-[0.18em] opacity-80">
                    {{ messageSenderLabel(message, selectedConversation) }}
                  </p>
                  <p class="text-[11px] opacity-70">
                    {{ formatDate(message.created_at) }}
                  </p>
                </div>
                <p class="whitespace-pre-wrap break-words text-sm leading-7">
                  {{ message.message_text }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap gap-3">
          <button
            v-if="selectedConversation && !isArchived(selectedConversation) && `${selectedConversation.status || ''}`.toLowerCase() === 'closed'"
            class="btn-primary btn-sm"
            :disabled="actionLoading"
            @click="archiveConversation(selectedConversation.id)"
          >
            <Archive class="h-4 w-4" />
            <span>{{ isArabic ? 'أرشفة المحادثة' : 'Archive Conversation' }}</span>
          </button>
          <button
            class="btn-outline btn-sm border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-500/20 dark:text-rose-300 dark:hover:bg-rose-500/10"
            :disabled="actionLoading"
            @click="deleteConversation(selectedConversation.id)"
          >
            <Trash2 class="h-4 w-4" />
            <span>{{ isArabic ? 'حذف نهائي' : 'Delete Permanently' }}</span>
          </button>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Archive, ArchiveX, Clock3, Loader2, MessageSquareText, Trash2 } from 'lucide-vue-next';
import api from '@/services/api';
import { getApiCollection, getApiData } from '@/utils/apiResponse';
import { useNotificationStore } from '@/stores/notificationStore';
import BaseModal from '@/components/ui/BaseModal.vue';

const { locale } = useI18n();
const notificationStore = useNotificationStore();

const activeTab = ref('all');
const loading = ref(false);
const detailsLoading = ref(false);
const actionLoading = ref(false);
const detailsOpen = ref(false);
const conversations = ref([]);
const selectedConversation = ref(null);
const selectedMessages = ref([]);
const counts = ref({
  all: 0,
  expiring: 0,
  archived: 0
});

const isArabic = computed(() => locale.value === 'ar');

const tabs = computed(() => ([
  {
    key: 'all',
    label: isArabic.value ? 'جميع الرسائل' : 'All Messages',
    icon: MessageSquareText
  },
  {
    key: 'expiring',
    label: isArabic.value ? 'سيتم حذفها بعد 7 أيام' : 'Delete After 7 Days',
    icon: Clock3
  },
  {
    key: 'archived',
    label: isArabic.value ? 'رسائل مؤرشفة' : 'Archived Messages',
    icon: ArchiveX
  }
]));

const emptyState = computed(() => {
  if (activeTab.value === 'expiring') {
    return isArabic.value ? 'لا توجد محادثات بانتظار الحذف حاليًا.' : 'No conversations pending deletion.';
  }
  if (activeTab.value === 'archived') {
    return isArabic.value ? 'لا توجد محادثات مؤرشفة حاليًا.' : 'No archived conversations yet.';
  }
  return isArabic.value ? 'لا توجد محادثات محفوظة حاليًا.' : 'No conversations found yet.';
});

function formatDate(value) {
  if (!value) return isArabic.value ? 'غير متاح' : 'N/A';
  return new Date(value).toLocaleString(isArabic.value ? 'ar-EG' : 'en-US');
}

function isArchived(conversation) {
  return Number(conversation.preserve_messages_normalized || conversation.preserve_messages || 0) === 1
    || `${conversation.status || ''}`.toLowerCase() === 'archived'
    || `${conversation.chat_status || ''}`.toUpperCase() === 'ARCHIVED';
}

function statusLabel(conversation) {
  const status = `${conversation.status || ''}`.toLowerCase();
  if (status === 'closed') return isArabic.value ? 'مغلقة' : 'Closed';
  if (status === 'archived' || isArchived(conversation)) return isArabic.value ? 'مؤرشفة' : 'Archived';
  if (status === 'active') return isArabic.value ? 'نشطة' : 'Active';
  if (status === 'assigned') return isArabic.value ? 'تم استلامها' : 'Claimed';
  return isArabic.value ? 'بانتظار الرد' : 'Waiting';
}

function statusClass(conversation) {
  const status = `${conversation.status || ''}`.toLowerCase();
  if (status === 'closed') return 'badge-secondary';
  if (status === 'archived' || isArchived(conversation)) return 'badge-success';
  if (status === 'active' || status === 'assigned') return 'badge-primary';
  return 'badge-warning';
}

function getUserName(conversation) {
  const name = `${conversation.user_first_name || ''} ${conversation.user_last_name || ''}`.trim();
  return name || (isArabic.value ? 'المتصل' : 'Contact User');
}

function getAgentName(conversation) {
  const name = `${conversation.admin_first_name || ''} ${conversation.admin_last_name || ''}`.trim();
  if (name) return name;
  const vendorName = `${conversation.vendor_company_name_ar || conversation.vendor_company_name_en || ''}`.trim();
  return vendorName || (isArabic.value ? 'لم يتم الرد بعد' : 'No responder yet');
}

function getRetentionDate(conversation) {
  if (conversation.expires_at) return new Date(conversation.expires_at);
  if (`${conversation.status || ''}`.toLowerCase() !== 'closed') return null;
  const base = conversation.closed_at || conversation.retention_base_at || conversation.updated_at || conversation.created_at;
  if (!base) return null;
  return new Date(new Date(base).getTime() + (7 * 24 * 60 * 60 * 1000));
}

function getDaysLeft(conversation) {
  const date = getRetentionDate(conversation);
  if (!date) return null;
  const diff = Math.ceil((date.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
  return Math.max(diff, 0);
}

function retentionLabel(conversation) {
  if (isArchived(conversation)) {
    return isArabic.value ? 'مؤرشفة ومحفوظة' : 'Archived and preserved';
  }

  const status = `${conversation.status || ''}`.toLowerCase();
  if (status === 'closed') {
    const daysLeft = getDaysLeft(conversation);
    return isArabic.value
      ? `تحذف بعد ${daysLeft} يوم`
      : `Deletes in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`;
  }

  return isArabic.value ? 'محادثة جارية' : 'Active conversation';
}

function retentionHint(conversation) {
  if (isArchived(conversation)) {
    return isArabic.value ? 'لن تُحذف تلقائيًا ما دامت مؤرشفة.' : 'Will not be deleted automatically while archived.';
  }
  if (`${conversation.status || ''}`.toLowerCase() === 'closed') {
    return isArabic.value ? 'يمكنك أرشفتها قبل انتهاء المهلة للحفاظ عليها.' : 'Archive it before expiry to preserve it.';
  }
  return isArabic.value ? 'أغلق المحادثة أولًا حتى تبدأ مهلة الحذف.' : 'Close the conversation first for retention countdown.';
}

function isMessageFromRequester(message, conversation) {
  return Number(message.sender_id) === Number(conversation.user_id);
}

function messageSenderLabel(message, conversation) {
  if (message.type === 'SYSTEM') return isArabic.value ? 'النظام' : 'System';
  return isMessageFromRequester(message, conversation)
    ? getUserName(conversation)
    : getAgentName(conversation);
}

async function fetchCounts() {
  const [allRes, expiringRes, archivedRes] = await Promise.all([
    api.get('/admin/support-conversations?scope=all'),
    api.get('/admin/support-conversations?scope=expiring'),
    api.get('/admin/support-conversations?scope=archived')
  ]);

  counts.value = {
    all: getApiCollection(allRes, ['items', 'conversations']).length,
    expiring: getApiCollection(expiringRes, ['items', 'conversations']).length,
    archived: getApiCollection(archivedRes, ['items', 'conversations']).length
  };
}

async function fetchConversations() {
  loading.value = true;
  try {
    const [listRes] = await Promise.all([
      api.get(`/admin/support-conversations?scope=${activeTab.value}`),
      fetchCounts()
    ]);
    conversations.value = getApiCollection(listRes, ['items', 'conversations']);
  } catch {
    notificationStore.error(isArabic.value ? 'تعذر تحميل سجل المحادثات.' : 'Failed to load conversation history.');
  } finally {
    loading.value = false;
  }
}

async function openConversation(conversation) {
  selectedConversation.value = conversation;
  selectedMessages.value = [];
  detailsOpen.value = true;
  detailsLoading.value = true;
  try {
    const res = await api.get(`/admin/support-conversations/${conversation.id}/messages`);
    const data = getApiData(res) || {};
    selectedConversation.value = {
      ...conversation,
      ...(data.conversation || {})
    };
    selectedMessages.value = data.messages || [];
  } catch {
    notificationStore.error(isArabic.value ? 'تعذر تحميل تفاصيل المحادثة.' : 'Failed to load conversation details.');
  } finally {
    detailsLoading.value = false;
  }
}

async function archiveConversation(id) {
  actionLoading.value = true;
  try {
    const res = await api.patch(`/admin/support-archives/${id}/archive`);
    const updated = getApiData(res);
    conversations.value = conversations.value.map((item) => Number(item.id) === Number(id)
      ? { ...item, ...updated, preserve_messages_normalized: 1 }
      : item);
    if (selectedConversation.value && Number(selectedConversation.value.id) === Number(id)) {
      selectedConversation.value = { ...selectedConversation.value, ...updated, preserve_messages_normalized: 1 };
    }
    notificationStore.success(isArabic.value ? 'تمت أرشفة المحادثة.' : 'Conversation archived.');
    await fetchCounts();
    if (activeTab.value === 'expiring') {
      conversations.value = conversations.value.filter((item) => Number(item.id) !== Number(id));
    }
  } catch {
    notificationStore.error(isArabic.value ? 'فشل أرشفة المحادثة.' : 'Failed to archive conversation.');
  } finally {
    actionLoading.value = false;
  }
}

async function deleteConversation(id) {
  const confirmed = await notificationStore.openDialog({
    title: isArabic.value ? 'تأكيد الإجراء' : 'Confirm Action',
    message: isArabic.value
      ? 'سيتم حذف هذه المحادثة نهائيًا من النظام. هل تريد المتابعة؟'
      : 'This conversation will be deleted permanently. Do you want to continue?',
    type: 'confirm',
    confirmText: isArabic.value ? 'تأكيد' : 'Confirm',
    cancelText: isArabic.value ? 'إلغاء' : 'Cancel'
  });
  if (!confirmed) return;

  actionLoading.value = true;
  try {
    await api.delete(`/admin/support-archives/${id}`);
    conversations.value = conversations.value.filter((item) => Number(item.id) !== Number(id));
    if (selectedConversation.value && Number(selectedConversation.value.id) === Number(id)) {
      detailsOpen.value = false;
      selectedConversation.value = null;
      selectedMessages.value = [];
    }
    notificationStore.success(isArabic.value ? 'تم حذف المحادثة نهائيًا.' : 'Conversation deleted permanently.');
    await fetchCounts();
  } catch {
    notificationStore.error(isArabic.value ? 'فشل حذف المحادثة.' : 'Failed to delete conversation.');
  } finally {
    actionLoading.value = false;
  }
}

async function deleteAllConversations() {
  if (!conversations.value.length) return;

  const activeTabLabel = tabs.value.find((tab) => tab.key === activeTab.value)?.label || activeTab.value;
  const confirmed = await notificationStore.openDialog({
    title: isArabic.value ? 'تأكيد الحذف الجماعي' : 'Confirm Bulk Delete',
    message: isArabic.value
      ? `سيتم حذف جميع المحادثات الظاهرة داخل تبويب "${activeTabLabel}" نهائيًا. هل تريد المتابعة؟`
      : `All conversations listed in the "${activeTabLabel}" tab will be deleted permanently. Do you want to continue?`,
    type: 'confirm',
    confirmText: isArabic.value ? 'حذف الكل' : 'Delete All',
    cancelText: isArabic.value ? 'إلغاء' : 'Cancel'
  });
  if (!confirmed) return;

  actionLoading.value = true;
  try {
    await api.delete(`/admin/support-archives?scope=${activeTab.value}`);
    conversations.value = [];
    if (detailsOpen.value) {
      detailsOpen.value = false;
      selectedConversation.value = null;
      selectedMessages.value = [];
    }
    await fetchCounts();
    notificationStore.success(isArabic.value ? 'تم حذف جميع المحادثات الظاهرة نهائيًا.' : 'All visible conversations were deleted permanently.');
  } catch {
    notificationStore.error(isArabic.value ? 'فشل حذف جميع المحادثات.' : 'Failed to delete all conversations.');
  } finally {
    actionLoading.value = false;
  }
}

function changeTab(tab) {
  if (activeTab.value === tab) return;
  activeTab.value = tab;
  fetchConversations();
}

onMounted(fetchConversations);
</script>

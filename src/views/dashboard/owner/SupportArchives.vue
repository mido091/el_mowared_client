<template>
  <div class="space-y-6" :dir="locale === 'ar' ? 'rtl' : 'ltr'">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-foreground">
          {{ locale === 'ar' ? 'أرشيف محادثات الدعم' : 'Support Archives' }}
        </h1>
        <p class="mt-1 text-sm text-muted-foreground">
          {{ locale === 'ar' ? 'سيتم حذف المحادثات غير المؤرشفة بعد 7 أيام من تاريخ إنهائها. يمكنك أرشفة المحادثات المهمة للاحتفاظ بها.' : 'Unarchived support conversations will be deleted 7 days after closing. Archive important ones to preserve them.' }}
        </p>
      </div>
      <button class="btn-outline btn-sm" @click="fetchArchives">
        {{ locale === 'ar' ? 'تحديث' : 'Refresh' }}
      </button>
    </div>

    <div class="rounded-[1.5rem] border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
      {{ locale === 'ar' ? 'تنبيه: الرسائل غير المؤرشفة تُحذف نهائيًا بعد 7 أيام من إنهاء المحادثة.' : 'Notice: unarchived messages are permanently deleted 7 days after the conversation ends.' }}
    </div>

    <div class="card overflow-hidden">
      <div v-if="loading" class="flex justify-center py-12">
        <Loader2 class="w-7 h-7 animate-spin text-primary" />
      </div>

      <div v-else-if="!archives.length" class="py-14 text-center text-muted-foreground">
        {{ locale === 'ar' ? 'لا توجد محادثات دعم منتهية حاليًا.' : 'No closed support conversations found.' }}
      </div>

      <div v-else class="divide-y divide-border">
        <div
          v-for="conversation in archives"
          :key="conversation.id"
          class="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between"
        >
          <div class="space-y-2">
            <div class="flex flex-wrap items-center gap-2">
              <span class="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-[11px] font-black text-primary">
                #{{ conversation.id }}
              </span>
              <span class="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {{ conversation.user_first_name }} {{ conversation.user_last_name }}
              </span>
              <span v-if="conversation.preserve_messages" class="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                {{ locale === 'ar' ? 'مؤرشف' : 'Archived' }}
              </span>
            </div>

            <p class="text-sm text-muted-foreground">
              {{ locale === 'ar' ? 'تم الإغلاق بواسطة' : 'Handled by' }}:
              <span class="font-bold text-foreground">{{ conversation.admin_first_name || (locale === 'ar' ? 'مسؤول الدعم' : 'Support Agent') }} {{ conversation.admin_last_name || '' }}</span>
            </p>

            <div class="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span>{{ locale === 'ar' ? 'عدد الرسائل' : 'Messages' }}: {{ conversation.message_count || 0 }}</span>
              <span>{{ locale === 'ar' ? 'أُغلقت في' : 'Closed at' }}: {{ formatDate(conversation.closed_at || conversation.updated_at) }}</span>
              <span v-if="!conversation.preserve_messages">
                {{ locale === 'ar' ? 'متبقي للحذف' : 'Deletion in' }}: {{ getDaysLeft(conversation) }}
              </span>
            </div>
          </div>

          <div class="flex flex-wrap gap-3">
            <button
              v-if="!conversation.preserve_messages"
              class="btn-primary btn-sm"
              @click="archiveConversation(conversation.id)"
            >
              {{ locale === 'ar' ? 'أرشفة' : 'Archive' }}
            </button>
            <button
              class="btn-outline btn-sm border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-500/20 dark:text-rose-300 dark:hover:bg-rose-500/10"
              @click="deleteConversation(conversation.id)"
            >
              {{ locale === 'ar' ? 'حذف نهائي' : 'Delete Permanently' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Loader2 } from 'lucide-vue-next';
import api from '@/services/api';
import { getApiCollection, getApiData } from '@/utils/apiResponse';
import { useNotificationStore } from '@/stores/notificationStore';

const { locale } = useI18n();
const notificationStore = useNotificationStore();

const archives = ref([]);
const loading = ref(false);

function formatDate(value) {
  if (!value) return locale.value === 'ar' ? 'غير متاح' : 'N/A';
  return new Date(value).toLocaleString(locale.value === 'ar' ? 'ar-EG' : 'en-US');
}

function getDaysLeft(conversation) {
  const base = conversation.closed_at || conversation.updated_at || conversation.created_at;
  const deadline = new Date(base).getTime() + (7 * 24 * 60 * 60 * 1000);
  const diff = Math.ceil((deadline - Date.now()) / (24 * 60 * 60 * 1000));
  const safeDiff = Math.max(0, diff);
  return locale.value === 'ar' ? `${safeDiff} يوم` : `${safeDiff} day${safeDiff === 1 ? '' : 's'}`;
}

async function fetchArchives() {
  loading.value = true;
  try {
    const res = await api.get('/admin/support-archives');
    archives.value = getApiCollection(res, ['items', 'archives']);
  } catch {
    notificationStore.error(locale.value === 'ar' ? 'تعذر تحميل أرشيف الدعم.' : 'Failed to load support archives.');
  } finally {
    loading.value = false;
  }
}

async function archiveConversation(id) {
  try {
    const res = await api.patch(`/admin/support-archives/${id}/archive`);
    const updated = getApiData(res);
    archives.value = archives.value.map((item) => Number(item.id) === Number(id) ? { ...item, ...updated } : item);
    notificationStore.success(locale.value === 'ar' ? 'تم أرشفة المحادثة.' : 'Conversation archived.');
  } catch {
    notificationStore.error(locale.value === 'ar' ? 'فشل أرشفة المحادثة.' : 'Failed to archive conversation.');
  }
}

async function deleteConversation(id) {
  const confirmed = await notificationStore.confirm(
    locale.value === 'ar' ? 'سيتم حذف هذه المحادثة نهائيًا. هل تريد المتابعة؟' : 'This conversation will be deleted permanently. Continue?',
    'common.confirm'
  );
  if (!confirmed) return;

  try {
    await api.delete(`/admin/support-archives/${id}`);
    archives.value = archives.value.filter((item) => Number(item.id) !== Number(id));
    notificationStore.success(locale.value === 'ar' ? 'تم حذف المحادثة نهائيًا.' : 'Conversation deleted permanently.');
  } catch {
    notificationStore.error(locale.value === 'ar' ? 'فشل حذف المحادثة.' : 'Failed to delete conversation.');
  }
}

onMounted(fetchArchives);
</script>

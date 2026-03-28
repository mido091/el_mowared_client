<template>
  <div class="space-y-8">
    <div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 class="text-3xl font-black text-foreground">{{ labels.pageTitle }}</h1>
        <p class="mt-1 text-muted-foreground">{{ labels.pageSubtitle }}</p>
      </div>

      <div class="grid grid-cols-2 gap-4 lg:flex">
        <div class="rounded-2xl border border-border bg-white px-4 py-3 text-center shadow-sm dark:bg-card">
          <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{{ labels.activeTab }}</p>
          <p class="mt-1 text-2xl font-black text-primary">{{ filteredLeads.length }}</p>
        </div>
        <div class="rounded-2xl border border-border bg-white px-4 py-3 text-center shadow-sm dark:bg-card">
          <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{{ labels.totalLeads }}</p>
          <p class="mt-1 text-2xl font-black text-foreground">{{ rfqStore.allLeads.length }}</p>
        </div>
      </div>
    </div>

    <div class="rounded-2xl border border-border bg-white p-4 shadow-sm dark:bg-card">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div class="relative flex-1">
          <Search class="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input v-model.trim="search" type="text" :placeholder="labels.searchPlaceholder" class="form-input ps-10" />
        </div>

        <div class="lg:w-72">
          <ResponsiveSelect
            v-model="selectedCategoryId"
            :options="categoryOptions"
            :placeholder="labels.allCategories"
            :sheet-title="labels.allCategories"
            :sheet-kicker="locale === 'ar' ? 'فلاتر الفرص' : 'Lead filters'"
            searchable
          />
        </div>
      </div>

      <div class="mt-5 flex flex-wrap gap-2">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] transition-all"
          :class="activeTab === tab.id
            ? 'bg-primary text-primary-foreground shadow-md'
            : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'"
        >
          {{ tab.label }} ({{ tab.count }})
        </button>
      </div>
    </div>

    <div v-if="rfqStore.loading" class="grid gap-6 xl:grid-cols-2">
      <div v-for="i in 4" :key="i" class="h-64 rounded-2xl border border-border bg-white shadow-sm animate-pulse dark:bg-card" />
    </div>

    <div
      v-else-if="!filteredLeads.length"
      class="rounded-2xl border-2 border-dashed border-border bg-white px-6 py-20 text-center shadow-sm dark:bg-card"
    >
      <Inbox class="mx-auto h-10 w-10 text-muted-foreground/40" />
      <h3 class="mt-4 text-lg font-black text-foreground">{{ labels.emptyTitle }}</h3>
      <p class="mt-2 text-sm text-muted-foreground">{{ labels.emptyDescription }}</p>
    </div>

    <div v-else class="grid gap-6 xl:grid-cols-2">
      <article
        v-for="lead in filteredLeads"
        :key="lead.id"
        class="rounded-2xl border border-border bg-white p-6 shadow-sm transition-all hover:border-primary/30 hover:shadow-md dark:bg-card"
      >
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <span class="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
              {{ getCategoryName(lead) }}
            </span>
            <span class="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:bg-slate-800 dark:text-slate-300">
              {{ lead.status }}
            </span>
            <span
              v-if="Number(lead.vendor_has_declined || 0)"
              class="rounded-full bg-rose-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-rose-600 dark:bg-rose-950/40 dark:text-rose-300"
            >
              {{ labels.declinedByYou }}
            </span>
          </div>

          <div class="text-xs font-bold text-muted-foreground">
            {{ labels.remaining }}: {{ formatRemaining(lead.expiration_time) }}
          </div>
        </div>

        <div class="mt-5 flex gap-4">
          <div v-if="lead.image_url" class="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-border bg-muted/20">
            <img :src="lead.image_url" :alt="lead.title" class="h-full w-full object-cover" />
          </div>

          <div class="min-w-0 flex-1">
            <h3 class="line-clamp-1 text-xl font-black text-foreground">{{ lead.title }}</h3>
            <p class="mt-2 line-clamp-2 text-sm text-muted-foreground">{{ lead.description }}</p>
          </div>
        </div>

        <div class="mt-5 grid gap-3 sm:grid-cols-3">
          <div class="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
            <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{{ labels.quantity }}</p>
            <p class="mt-1 text-lg font-black text-foreground">{{ lead.quantity }}</p>
          </div>
          <div class="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
            <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{{ labels.budget }}</p>
            <p class="mt-1 text-lg font-black text-primary">{{ formatBudget(lead.target_price) }}</p>
          </div>
          <div class="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
            <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{{ labels.competition }}</p>
            <p class="mt-1 text-lg font-black text-foreground">{{ lead.current_responders || 0 }} / {{ lead.max_responders || 0 }}</p>
          </div>
        </div>

        <div class="mt-5 rounded-2xl border border-border bg-muted/10 p-4">
          <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{{ labels.buyer }}</p>
          <div class="mt-2 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-slate-100 font-black text-slate-500 dark:bg-slate-800">
              <img v-if="lead.user_avatar" :src="lead.user_avatar" :alt="lead.user_name" class="h-full w-full object-cover" />
              <span v-else>{{ getInitials(lead.user_name) }}</span>
            </div>
            <div>
              <p class="font-bold text-foreground">{{ lead.user_name || labels.buyerFallback }}</p>
              <p class="text-xs text-muted-foreground">{{ getCategoryName(lead) }}</p>
            </div>
          </div>
        </div>

        <div class="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            @click="startBuyerChat(lead)"
            :disabled="chatStore.sending || rfqStore.submitting || !vendorProfileId || Number(lead.vendor_has_declined || 0)"
            class="btn-primary flex-1 font-bold"
          >
            <MessageSquare class="h-4 w-4" />
            {{ labels.messageBuyer }}
          </button>

          <router-link :to="`/rfq/${lead.id}`" class="btn-outline flex-1 justify-center font-bold">
            {{ labels.viewDetails }}
          </router-link>

          <button
            v-if="canDeclineLead(lead)"
            @click="declineLead(lead)"
            :disabled="rfqStore.submitting"
            class="inline-flex flex-1 items-center justify-center rounded-2xl border border-rose-200 px-4 py-3 text-sm font-bold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50 dark:border-rose-900/60 dark:text-rose-300 dark:hover:bg-rose-950/30"
          >
            {{ labels.declineLead }}
          </button>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Inbox, MessageSquare, Search } from 'lucide-vue-next';
import api from '@/services/api';
import { getApiData } from '@/utils/apiResponse';
import { useCategoryStore } from '@/stores/categoryStore';
import { useChatStore } from '@/stores/chat';
import { useNotificationStore } from '@/stores/notificationStore';
import { useRfqStore } from '@/stores/rfqStore';
import { formatEGPCurrency } from '@/utils/currency';
import { normalizeError } from '@/utils/errorHandler';
import ResponsiveSelect from '@/components/ui/ResponsiveSelect.vue';

const router = useRouter();
const { locale } = useI18n();
const categoryStore = useCategoryStore();
const chatStore = useChatStore();
const notificationStore = useNotificationStore();
const rfqStore = useRfqStore();

const activeTab = ref('available');
const search = ref('');
const selectedCategoryId = ref(0);
const vendorProfileId = ref(null);

const localized = (ar, en) => (locale.value === 'ar' ? ar : en);

const labels = computed(() => ({
  pageTitle: localized('مركز الفرص', 'Leads Center'),
  pageSubtitle: localized('طلبات العروض التي وصلت إلى تخصصك بعد مراجعة الإدارة.', 'RFQs that reached your specialization after admin review.'),
  activeTab: localized('المعروض الآن', 'Visible Now'),
  totalLeads: localized('إجمالي الطلبات', 'Total Leads'),
  searchPlaceholder: localized('ابحث داخل الطلبات...', 'Search RFQs...'),
  allCategories: localized('كل الفئات', 'All Categories'),
  remaining: localized('المتبقي', 'Remaining'),
  quantity: localized('الكمية', 'Quantity'),
  budget: localized('الميزانية', 'Budget'),
  competition: localized('المنافسة', 'Competition'),
  buyer: localized('المشتري', 'Buyer'),
  buyerFallback: localized('مشتري', 'Buyer'),
  messageBuyer: localized('ابدأ تواصل', 'Message Buyer'),
  viewDetails: localized('عرض التفاصيل', 'View Details'),
  declineLead: localized('رفض الطلب', 'Decline RFQ'),
  declinedByYou: localized('مرفوض من طرفك', 'Declined by you'),
  emptyTitle: localized('لا توجد طلبات حالية', 'No active leads'),
  emptyDescription: localized('جرّب تغيير الفلتر أو انتظر حتى يتم بث طلبات جديدة لفئتك.', 'Try changing filters or wait for new RFQs to be broadcast to your category.'),
  tabOpen: localized('الجديدة والمفتوحة', 'New & Open'),
  tabNegotiations: localized('تفاوضات', 'Negotiations'),
  tabWon: localized('مقبولة', 'Won'),
  tabExpired: localized('منتهية', 'Expired'),
  uncategorized: localized('غير مصنف', 'Uncategorized'),
  noBudget: localized('غير محددة', 'Not set'),
  noDeadline: localized('غير محدد', 'No deadline'),
  expired: localized('انتهى', 'Expired'),
  vendorResolveError: localized('تعذر تحديد حساب المورد الحالي.', 'Unable to resolve the current vendor profile.'),
  chatError: localized('تعذر بدء المحادثة الآن.', 'Unable to start the chat right now.'),
  declineSuccess: localized('تم رفض الطلب لهذا المورد.', 'RFQ declined for this vendor.'),
  declineError: localized('تعذر رفض الطلب حاليًا.', 'Unable to decline this RFQ right now.')
}));

const categories = computed(() => categoryStore.categories);
const categoryOptions = computed(() => [
  {
    value: 0,
    label: labels.value.allCategories,
    description: locale.value === 'ar' ? 'كل التخصصات المرتبطة بك' : 'All categories relevant to your profile',
  },
  ...categories.value.map((category) => ({
    value: Number(category.id),
    label: locale.value === 'ar' ? category.name_ar : category.name_en,
    description: category.slug ? `/${category.slug}` : '',
  })),
]);
const tabLabels = computed(() => ({
  incomplete: locale.value === 'ar' ? 'غير مكتمل' : 'Incomplete',
  completed: locale.value === 'ar' ? 'مكتمل' : 'Completed'
}));

const completedLeads = computed(() => rfqStore.allLeads.filter((lead) => `${lead?.status || ''}`.toUpperCase() === 'COMPLETED'));
const incompleteLeads = computed(() => rfqStore.allLeads.filter((lead) => `${lead?.status || ''}`.toUpperCase() !== 'COMPLETED'));

const tabs = computed(() => [
  { id: 'available', label: locale.value === 'ar' ? 'الفرص المتاحة' : 'Available Opportunities', count: rfqStore.availableOpportunities.length },
  { id: 'accepted', label: locale.value === 'ar' ? 'الفرص المقبولة' : 'Accepted Opportunities', count: rfqStore.acceptedOpportunities.length },
  { id: 'incomplete', label: tabLabels.value.incomplete, count: incompleteLeads.value.length },
  { id: 'completed', label: tabLabels.value.completed, count: completedLeads.value.length }
]);

const tabLeads = computed(() => {
  switch (activeTab.value) {
    case 'available':
      return rfqStore.availableOpportunities;
    case 'accepted':
      return rfqStore.acceptedOpportunities;
    case 'completed':
      return completedLeads.value;
    default:
      return incompleteLeads.value;
  }
});

const filteredLeads = computed(() => {
  const term = search.value.toLowerCase();
  return tabLeads.value.filter((lead) => {
    const matchesCategory = !selectedCategoryId.value || Number(lead.category_id) === Number(selectedCategoryId.value);
    const haystack = `${lead.title || ''} ${lead.description || ''} ${lead.user_name || ''}`.toLowerCase();
    const matchesSearch = !term || haystack.includes(term);
    return matchesCategory && matchesSearch;
  });
});

function getCategoryName(lead) {
  return locale.value === 'ar'
    ? (lead.category_name_ar || lead.category_name || lead.category_name_en || labels.value.uncategorized)
    : (lead.category_name_en || lead.category_name || lead.category_name_ar || labels.value.uncategorized);
}

function formatBudget(value) {
  return value ? formatEGPCurrency(Number(value), locale.value) : labels.value.noBudget;
}

function formatRemaining(expirationTime) {
  if (!expirationTime) return labels.value.noDeadline;
  const diff = new Date(expirationTime).getTime() - Date.now();
  if (diff <= 0) return labels.value.expired;

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  if (days > 0) {
    return locale.value === 'ar' ? `${days} يوم ${remainingHours} س` : `${days}d ${remainingHours}h`;
  }

  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return locale.value === 'ar' ? `${hours} س ${minutes} د` : `${hours}h ${minutes}m`;
}

function getInitials(name = '') {
  return String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase() || 'B';
}

function buildOpeningMessage(lead) {
  return locale.value === 'ar'
    ? `مرحبًا، يمكنني تلبية طلبك: ${lead.title}. هل يمكننا مناقشة التفاصيل؟`
    : `Hello, I can help with your RFQ: ${lead.title}. Can we discuss the details?`;
}

function canDeclineLead(lead) {
  const status = `${lead?.status || ''}`.toUpperCase();
  if (['COMPLETED', 'EXPIRED', 'CANCELED'].includes(status)) return false;

  return !Number(lead?.vendor_has_offer || 0)
    && !Number(lead?.vendor_has_chat || 0)
    && !Number(lead?.vendor_has_declined || 0);
}

async function startBuyerChat(lead) {
  if (!vendorProfileId.value) {
    notificationStore.error(labels.value.vendorResolveError);
    return;
  }

  try {
    const result = await chatStore.startRfqChat(
      vendorProfileId.value,
      lead.id,
      buildOpeningMessage(lead),
      {
        rfq_id: lead.id,
        rfq_title: lead.title,
        rfq_quantity: lead.quantity,
        rfq_budget: lead.target_price,
        rfq_image: lead.image_url || null
      },
      { buyerId: lead.user_id }
    );
    const conversation = result?.conversation || result;
    if (rfqStore.feed[lead.id]) {
      rfqStore.feed[lead.id] = {
        ...rfqStore.feed[lead.id],
        vendor_has_chat: 1,
        vendor_has_declined: 0
      };
    }
    if (conversation?.id) {
      router.push(`/chat?id=${conversation.id}`);
    }
  } catch (error) {
    notificationStore.error(normalizeError(error).message || labels.value.chatError);
  }
}

async function declineLead(lead) {
  try {
    await rfqStore.declineRfq(lead.id);
    notificationStore.success(labels.value.declineSuccess);
  } catch (error) {
    notificationStore.error(normalizeError(error).message || labels.value.declineError);
  }
}

async function loadVendorProfileId() {
  try {
    const response = await api.get('/vendor/me');
    vendorProfileId.value = getApiData(response)?.vendor?.id || null;
  } catch {
    vendorProfileId.value = null;
  }
}

onMounted(async () => {
  await Promise.all([
    categoryStore.fetchCategories({ mode: 'revalidate' }),
    rfqStore.fetchFeed(),
    loadVendorProfileId()
  ]);
});
</script>

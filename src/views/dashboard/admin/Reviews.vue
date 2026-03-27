<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p class="text-xs font-black uppercase tracking-[0.22em] text-[hsl(var(--primary))]">{{ copy.eyebrow }}</p>
        <h1 class="mt-2 text-3xl font-black text-foreground">{{ copy.title }}</h1>
        <p class="mt-2 text-sm text-muted-foreground">{{ copy.subtitle }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <button
        v-for="card in statCards"
        :key="card.key"
        type="button"
        class="card flex items-center justify-between p-5 text-start transition"
        :class="activeQuickFilter === card.key ? 'border-primary/30 shadow-md shadow-primary/10' : 'hover:border-primary/20'"
        @click="applyQuickFilter(card.key)"
      >
        <div>
          <p class="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">{{ card.label }}</p>
          <p class="mt-2 text-3xl font-black text-foreground">{{ card.value }}</p>
        </div>
        <div class="flex h-12 w-12 items-center justify-center rounded-2xl" :class="card.wrapClass">
          <component :is="card.icon" class="h-6 w-6" :class="card.iconClass" />
        </div>
      </button>
    </div>

    <div class="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_320px]">
      <div class="min-w-0 space-y-6">
        <div class="card relative isolate overflow-visible">
          <div class="border-b border-border p-5">
            <div class="flex flex-col gap-4">
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="tab in tabs"
                  :key="tab.key"
                  type="button"
                  class="rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.18em] transition"
                  :class="filters.type === tab.key ? 'bg-[hsl(var(--primary))] text-white' : 'bg-slate-100 text-slate-600 hover:text-[hsl(var(--primary))] dark:bg-slate-800 dark:text-slate-300'"
                  @click="filters.type = tab.key"
                >
                  {{ tab.label }}
                </button>
              </div>

              <div ref="filtersPanelRef" class="relative z-20 grid gap-3 lg:grid-cols-2 2xl:grid-cols-[minmax(0,1.5fr)_minmax(180px,0.8fr)_minmax(180px,0.8fr)_minmax(180px,0.8fr)_minmax(160px,0.7fr)_auto]">
                <div class="relative z-30">
                  <Search class="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    v-model.trim="filters.search"
                    type="text"
                    class="w-full rounded-[1.4rem] border border-border bg-background px-4 py-3 ps-11 text-sm font-medium outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                    :placeholder="copy.searchPlaceholder"
                  />
                </div>

                <div class="relative z-30">
                  <button
                    type="button"
                    class="flex w-full items-center justify-between gap-3 rounded-[1.4rem] border border-border bg-background px-4 py-3 text-sm font-bold text-foreground transition hover:border-primary/30"
                    @click.stop="toggleSelect('status')"
                  >
                    <span class="truncate">{{ selectedStatusLabel }}</span>
                    <ChevronDown class="h-4 w-4 shrink-0 text-muted-foreground transition-transform" :class="activeSelect === 'status' ? 'rotate-180' : ''" />
                  </button>
                  <div
                    v-if="activeSelect === 'status'"
                    class="absolute inset-x-0 top-full z-[1200] mt-2 max-h-72 overflow-auto rounded-[1.4rem] border border-border bg-card p-2 shadow-2xl"
                  >
                    <button
                      v-for="option in statusOptions"
                      :key="option.value || 'all-status'"
                      type="button"
                      class="flex w-full items-center justify-between gap-3 rounded-[1rem] px-3 py-3 text-start text-sm font-bold transition"
                      :class="filters.status === option.value ? 'bg-primary text-white' : 'text-foreground hover:bg-muted/70'"
                      @click="selectStatus(option.value)"
                    >
                      <span>{{ option.label }}</span>
                    </button>
                  </div>
                </div>

                <div class="relative z-30">
                  <button
                    type="button"
                    class="flex w-full items-center justify-between gap-3 rounded-[1.4rem] border border-border bg-background px-4 py-3 text-sm font-bold text-foreground transition hover:border-primary/30"
                    @click.stop="toggleSelect('rating')"
                  >
                    <span class="truncate">{{ selectedRatingLabel }}</span>
                    <ChevronDown class="h-4 w-4 shrink-0 text-muted-foreground transition-transform" :class="activeSelect === 'rating' ? 'rotate-180' : ''" />
                  </button>
                  <div
                    v-if="activeSelect === 'rating'"
                    class="absolute inset-x-0 top-full z-[1200] mt-2 max-h-72 overflow-auto rounded-[1.4rem] border border-border bg-card p-2 shadow-2xl"
                  >
                    <button
                      v-for="option in ratingOptions"
                      :key="option.value || 'all-rating'"
                      type="button"
                      class="flex w-full items-center justify-between gap-3 rounded-[1rem] px-3 py-3 text-start text-sm font-bold transition"
                      :class="filters.rating === option.value ? 'bg-primary text-white' : 'text-foreground hover:bg-muted/70'"
                      @click="selectRating(option.value)"
                    >
                      <span>{{ option.label }}</span>
                    </button>
                  </div>
                </div>

                <label class="relative flex items-center">
                  <CalendarDays class="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    v-model="filters.dateFrom"
                    type="date"
                    class="w-full rounded-[1.4rem] border border-border bg-background px-4 py-3 ps-11 text-sm font-bold outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                  />
                </label>

                <button
                  type="button"
                  class="flex min-h-[52px] items-center justify-center gap-2 rounded-[1.4rem] border px-4 py-3 text-sm font-black transition"
                  :class="filters.flaggedOnly ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300' : 'border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground'"
                  @click="filters.flaggedOnly = !filters.flaggedOnly"
                >
                  <TriangleAlert class="h-4 w-4" />
                  <span>{{ copy.flaggedOnlyLabel }}</span>
                </button>

                <button
                  type="button"
                  class="min-h-[52px] rounded-[1.4rem] border border-border bg-background px-4 py-3 text-sm font-black text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
                  @click="resetFilters"
                >
                  {{ copy.resetFiltersLabel }}
                </button>
              </div>
            </div>
          </div>

          <div v-if="loading" class="space-y-4 p-6">
            <div v-for="index in 4" :key="index" class="skeleton h-20 rounded-2xl" />
          </div>

          <div v-else-if="items.length === 0" class="p-10 text-center">
            <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
              <MessageSquareText class="h-7 w-7" />
            </div>
            <h3 class="text-lg font-black text-foreground">{{ copy.emptyTitle }}</h3>
            <p class="mt-2 text-sm text-muted-foreground">{{ copy.emptySubtitle }}</p>
          </div>

          <div v-else class="space-y-4 p-4 sm:p-5 lg:hidden">
            <article
              v-for="item in items"
              :key="`mobile-${item.review_type}-${item.id}`"
              class="rounded-[1.6rem] border border-border bg-background p-4 shadow-sm"
            >
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-black text-foreground">{{ item.user_name }}</p>
                  <p class="mt-1 text-xs font-bold text-muted-foreground">{{ reviewTypeLabel(item.review_type) }}</p>
                </div>
                <span class="inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em]" :class="statusClass(item.status)">
                  {{ statusLabel(item.status) }}
                </span>
              </div>

              <div class="mt-4 flex flex-wrap items-center gap-2">
                <span class="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">{{ targetName(item) }}</span>
                <span v-if="item.is_verified_review" class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <BadgeCheck class="h-3.5 w-3.5" />
                  {{ copy.verifiedLabel }}
                </span>
                <span v-if="item.profanity_flag" class="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-black text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
                  <TriangleAlert class="h-3.5 w-3.5" />
                  {{ copy.flaggedBadge }}
                </span>
              </div>

              <div class="mt-4 flex items-center gap-1">
                <Star
                  v-for="index in 5"
                  :key="`mobile-star-${item.id}-${index}`"
                  class="h-4 w-4"
                  :class="index <= Number(item.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'"
                />
              </div>

              <button
                type="button"
                class="mt-4 block w-full rounded-[1.2rem] bg-slate-50 px-4 py-4 text-start text-sm leading-7 text-slate-600 transition hover:bg-slate-100 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:bg-slate-900"
                @click="openPreview(item)"
              >
                {{ item.comment || copy.emptyComment }}
              </button>

              <p v-if="item.flag_reason" class="mt-2 text-xs font-medium text-rose-500">{{ item.flag_reason }}</p>

              <div class="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span>{{ formatDate(item.created_at) }}</span>
                <span v-if="item.moderated_by_name">{{ item.moderated_by_name }}</span>
              </div>

              <div class="mt-4 flex flex-wrap gap-2">
                <button
                  v-if="item.status !== 'APPROVED'"
                  type="button"
                  class="inline-flex items-center gap-1 rounded-xl bg-emerald-500/10 px-3 py-2 text-xs font-black text-emerald-700 transition hover:bg-emerald-500/15"
                  :disabled="actionLoading"
                  @click="moderate(item, 'approve')"
                >
                  <CheckCircle2 class="h-4 w-4" />
                  {{ copy.approveAction }}
                </button>
                <button
                  v-if="item.status !== 'REJECTED'"
                  type="button"
                  class="inline-flex items-center gap-1 rounded-xl bg-amber-500/10 px-3 py-2 text-xs font-black text-amber-700 transition hover:bg-amber-500/15"
                  :disabled="actionLoading"
                  @click="moderate(item, 'reject')"
                >
                  <XCircle class="h-4 w-4" />
                  {{ copy.rejectAction }}
                </button>
                <button
                  type="button"
                  class="inline-flex items-center gap-1 rounded-xl bg-rose-500/10 px-3 py-2 text-xs font-black text-rose-700 transition hover:bg-rose-500/15"
                  :disabled="actionLoading"
                  @click="deleteReview(item)"
                >
                  <Trash2 class="h-4 w-4" />
                  {{ copy.deleteAction }}
                </button>
              </div>
            </article>
          </div>

          <div class="hidden overflow-x-auto lg:block">
            <table class="w-full min-w-[980px] border-collapse">
              <thead>
                <tr class="border-b border-border bg-slate-50/60 text-start text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground dark:bg-slate-900/50">
                  <th class="p-4">{{ copy.userColumn }}</th>
                  <th class="p-4">{{ copy.targetColumn }}</th>
                  <th class="p-4">{{ copy.ratingColumn }}</th>
                  <th class="p-4">{{ copy.commentColumn }}</th>
                  <th class="p-4">{{ copy.statusColumn }}</th>
                  <th class="p-4">{{ copy.dateColumn }}</th>
                  <th class="p-4 text-center">{{ copy.actionsColumn }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                <tr v-for="item in items" :key="`${item.review_type}-${item.id}`" class="align-top hover:bg-slate-50/60 dark:hover:bg-slate-900/40">
                  <td class="p-4">
                    <p class="font-bold text-foreground">{{ item.user_name }}</p>
                    <p class="mt-1 text-xs text-muted-foreground">{{ reviewTypeLabel(item.review_type) }}</p>
                  </td>
                  <td class="p-4">
                    <p class="font-bold text-foreground">{{ targetName(item) }}</p>
                    <div class="mt-2 flex flex-wrap gap-2">
                      <span v-if="item.is_verified_review" class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                        <BadgeCheck class="h-3.5 w-3.5" />
                        {{ copy.verifiedLabel }}
                      </span>
                      <span v-if="item.profanity_flag" class="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-black text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
                        <TriangleAlert class="h-3.5 w-3.5" />
                        {{ copy.flaggedBadge }}
                      </span>
                    </div>
                  </td>
                  <td class="p-4">
                    <div class="flex items-center gap-1">
                      <Star
                        v-for="index in 5"
                        :key="index"
                        class="h-4 w-4"
                        :class="index <= Number(item.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'"
                      />
                    </div>
                  </td>
                  <td class="p-4">
                    <button
                      type="button"
                      class="max-w-[340px] text-start text-sm leading-6 text-slate-600 transition hover:text-[hsl(var(--primary))] dark:text-slate-300"
                      @click="openPreview(item)"
                    >
                      <span class="line-clamp-3 break-words">{{ item.comment || copy.emptyComment }}</span>
                    </button>
                    <p v-if="item.flag_reason" class="mt-2 text-xs font-medium text-rose-500">{{ item.flag_reason }}</p>
                  </td>
                  <td class="p-4">
                    <span class="inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em]" :class="statusClass(item.status)">
                      {{ statusLabel(item.status) }}
                    </span>
                  </td>
                  <td class="p-4">
                    <p class="text-sm font-medium text-foreground">{{ formatDate(item.created_at) }}</p>
                    <p v-if="item.moderated_by_name" class="mt-1 text-xs text-muted-foreground">{{ item.moderated_by_name }}</p>
                  </td>
                  <td class="p-4">
                    <div class="flex flex-wrap justify-center gap-2">
                      <button
                        v-if="item.status !== 'APPROVED'"
                        type="button"
                        class="inline-flex items-center gap-1 rounded-xl bg-emerald-500/10 px-3 py-2 text-xs font-black text-emerald-700 transition hover:bg-emerald-500/15"
                        :disabled="actionLoading"
                        @click="moderate(item, 'approve')"
                      >
                        <CheckCircle2 class="h-4 w-4" />
                        {{ copy.approveAction }}
                      </button>
                      <button
                        v-if="item.status !== 'REJECTED'"
                        type="button"
                        class="inline-flex items-center gap-1 rounded-xl bg-amber-500/10 px-3 py-2 text-xs font-black text-amber-700 transition hover:bg-amber-500/15"
                        :disabled="actionLoading"
                        @click="moderate(item, 'reject')"
                      >
                        <XCircle class="h-4 w-4" />
                        {{ copy.rejectAction }}
                      </button>
                      <button
                        type="button"
                        class="inline-flex items-center gap-1 rounded-xl bg-rose-500/10 px-3 py-2 text-xs font-black text-rose-700 transition hover:bg-rose-500/15"
                        :disabled="actionLoading"
                        @click="deleteReview(item)"
                      >
                        <Trash2 class="h-4 w-4" />
                        {{ copy.deleteAction }}
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <aside class="space-y-6">
        <div class="card p-5">
          <p class="text-xs font-black uppercase tracking-[0.2em] text-[hsl(var(--primary))]">{{ copy.analyticsLabel }}</p>
          <h3 class="mt-2 text-xl font-black text-foreground">{{ copy.topVendorsLabel }}</h3>
          <div v-if="topVendors.length" class="mt-4 space-y-3">
            <div v-for="vendor in topVendors" :key="vendor.id" class="rounded-2xl border border-border bg-background p-4">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <p class="font-bold text-foreground">{{ localizedVendorName(vendor) }}</p>
                  <p class="mt-1 text-xs text-muted-foreground">{{ vendor.review_count }} {{ copy.reviewsCountLabel }}</p>
                </div>
                <div class="text-end">
                  <p class="text-lg font-black text-foreground">{{ Number(vendor.avg_rating || 0).toFixed(1) }}</p>
                  <p class="text-xs text-muted-foreground">{{ copy.responseRateLabel }} {{ Number(vendor.response_rate || 0).toFixed(0) }}%</p>
                </div>
              </div>
            </div>
          </div>
          <p v-else class="mt-4 text-sm text-muted-foreground">{{ copy.noAnalyticsLabel }}</p>
        </div>

        <div class="card p-5">
          <p class="text-xs font-black uppercase tracking-[0.2em] text-[hsl(var(--primary))]">{{ copy.analyticsLabel }}</p>
          <h3 class="mt-2 text-xl font-black text-foreground">{{ copy.categoryAveragesLabel }}</h3>
          <div v-if="categoryAverages.length" class="mt-4 space-y-3">
            <div v-for="category in categoryAverages" :key="category.id" class="rounded-2xl border border-border bg-background p-4">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <p class="font-bold text-foreground">{{ localizedCategoryName(category) }}</p>
                  <p class="mt-1 text-xs text-muted-foreground">{{ category.total_reviews }} {{ copy.reviewsCountLabel }}</p>
                </div>
                <div class="flex items-center gap-1 text-sm font-black text-foreground">
                  <Star class="h-4 w-4 fill-amber-400 text-amber-400" />
                  {{ Number(category.average_rating || 0).toFixed(1) }}
                </div>
              </div>
            </div>
          </div>
          <p v-else class="mt-4 text-sm text-muted-foreground">{{ copy.noAnalyticsLabel }}</p>
        </div>
      </aside>
    </div>

    <div
      v-if="previewItem"
      class="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      @click.self="previewItem = null"
    >
      <div class="w-full max-w-2xl rounded-3xl border border-border bg-card shadow-2xl">
        <div class="flex items-center justify-between border-b border-border px-6 py-5">
          <div>
            <p class="text-xs font-black uppercase tracking-[0.22em] text-[hsl(var(--primary))]">{{ copy.previewLabel }}</p>
            <h3 class="mt-2 text-2xl font-black text-foreground">{{ targetName(previewItem) }}</h3>
          </div>
          <button class="rounded-full bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700" @click="previewItem = null">
            <X class="h-5 w-5" />
          </button>
        </div>
        <div class="space-y-4 px-6 py-5">
          <div class="flex items-center gap-1">
            <Star
              v-for="index in 5"
              :key="index"
              class="h-5 w-5"
              :class="index <= Number(previewItem.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'"
            />
          </div>
          <p class="break-words text-sm leading-8 text-slate-600 dark:text-slate-300">
            {{ previewItem.comment || copy.emptyComment }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  BadgeCheck,
  CalendarDays,
  ChevronDown,
  CheckCircle2,
  Layers3,
  MessageSquareText,
  Radio,
  Search,
  ShieldAlert,
  Star,
  Trash2,
  TriangleAlert,
  X,
  XCircle
} from 'lucide-vue-next';
import api from '@/services/api';
import { useNotificationStore } from '@/stores/notificationStore';
import { getApiCollection, getApiData, getApiMessage } from '@/utils/apiResponse';

const { locale } = useI18n();
const notificationStore = useNotificationStore();

const loading = ref(true);
const actionLoading = ref(false);
const activeQuickFilter = ref('all');
const previewItem = ref(null);
const activeSelect = ref(null);
const filtersPanelRef = ref(null);
const items = ref([]);
const stats = ref({
  totalReviews: 0,
  pendingReviews: 0,
  approvedToday: 0,
  flaggedReviews: 0
});
const topVendors = ref([]);
const categoryAverages = ref([]);

const filters = reactive({
  type: 'PENDING',
  search: '',
  status: '',
  rating: '',
  dateFrom: '',
  flaggedOnly: false
});

const copy = computed(() => ({
  eyebrow: locale.value === 'ar' ? 'لوحة الإشراف' : 'Moderation desk',
  title: locale.value === 'ar' ? 'إدارة التقييمات والمراجعات' : 'Reviews & ratings moderation',
  subtitle: locale.value === 'ar'
    ? 'راجع التقييمات قبل نشرها، وارفض أو احذف أي محتوى غير مناسب من مكان واحد منظم.'
    : 'Moderate product and vendor reviews from one organized workspace before they go live.',
  searchPlaceholder: locale.value === 'ar' ? 'ابحث باسم المستخدم أو المورد أو المنتج أو محتوى التعليق...' : 'Search by user, vendor, product, or comment...',
  allStatusesLabel: locale.value === 'ar' ? 'كل الحالات' : 'All statuses',
  allRatingsLabel: locale.value === 'ar' ? 'كل التقييمات' : 'All ratings',
  pendingLabel: locale.value === 'ar' ? 'معلق' : 'Pending',
  approvedLabel: locale.value === 'ar' ? 'معتمد' : 'Approved',
  rejectedLabel: locale.value === 'ar' ? 'مرفوض' : 'Rejected',
  starsLabel: locale.value === 'ar' ? 'نجوم' : 'stars',
  flaggedOnlyLabel: locale.value === 'ar' ? 'المحتوى المميز فقط' : 'Flagged only',
  emptyTitle: locale.value === 'ar' ? 'لا توجد مراجعات مطابقة' : 'No matching reviews',
  emptySubtitle: locale.value === 'ar' ? 'جرّب تغيير الفلاتر أو إزالة البحث الحالي.' : 'Try changing the filters or clearing the current search.',
  userColumn: locale.value === 'ar' ? 'المستخدم' : 'User',
  targetColumn: locale.value === 'ar' ? 'الجهة المستهدفة' : 'Target',
  ratingColumn: locale.value === 'ar' ? 'التقييم' : 'Rating',
  commentColumn: locale.value === 'ar' ? 'التعليق' : 'Comment',
  statusColumn: locale.value === 'ar' ? 'الحالة' : 'Status',
  dateColumn: locale.value === 'ar' ? 'التاريخ' : 'Date',
  actionsColumn: locale.value === 'ar' ? 'الإجراءات' : 'Actions',
  verifiedLabel: locale.value === 'ar' ? 'مراجعة موثقة' : 'Verified review',
  flaggedBadge: locale.value === 'ar' ? 'محتوى حساس' : 'Flagged',
  emptyComment: locale.value === 'ar' ? 'بدون تعليق نصي' : 'No written comment',
  approveAction: locale.value === 'ar' ? 'اعتماد' : 'Approve',
  rejectAction: locale.value === 'ar' ? 'رفض' : 'Reject',
  deleteAction: locale.value === 'ar' ? 'حذف' : 'Delete',
  previewLabel: locale.value === 'ar' ? 'معاينة التعليق' : 'Comment preview',
  analyticsLabel: locale.value === 'ar' ? 'تحليلات المراجعات' : 'Review analytics',
  topVendorsLabel: locale.value === 'ar' ? 'أفضل الموردين' : 'Top vendors',
  categoryAveragesLabel: locale.value === 'ar' ? 'متوسط التقييم حسب القسم' : 'Average rating by category',
  reviewsCountLabel: locale.value === 'ar' ? 'مراجعة' : 'reviews',
  responseRateLabel: locale.value === 'ar' ? 'الاستجابة' : 'Response',
  fetchFailMessage: locale.value === 'ar' ? 'تعذر تحميل المراجعات الآن.' : 'Unable to load reviews right now.',
  approveSuccess: locale.value === 'ar' ? 'تم اعتماد المراجعة بنجاح.' : 'Review approved successfully.',
  rejectSuccess: locale.value === 'ar' ? 'تم رفض المراجعة بنجاح.' : 'Review rejected successfully.',
  deleteSuccess: locale.value === 'ar' ? 'تم حذف المراجعة بنجاح.' : 'Review deleted successfully.',
  actionFailMessage: locale.value === 'ar' ? 'تعذر تنفيذ الإجراء على المراجعة.' : 'Unable to perform the requested action on this review.',
  resetFiltersLabel: locale.value === 'ar' ? 'إعادة ضبط' : 'Reset filters',
  noAnalyticsLabel: locale.value === 'ar' ? 'لا توجد بيانات كافية حتى الآن.' : 'No data available yet.'
}));

const normalizedTypeParam = computed(() => (filters.type === 'PENDING' ? '' : filters.type));

const statusOptions = computed(() => ([
  { value: '', label: copy.value.allStatusesLabel },
  { value: 'PENDING', label: copy.value.pendingLabel },
  { value: 'APPROVED', label: copy.value.approvedLabel },
  { value: 'REJECTED', label: copy.value.rejectedLabel }
]));

const ratingOptions = computed(() => ([
  { value: '', label: copy.value.allRatingsLabel },
  ...[5, 4, 3, 2, 1].map((rating) => ({
    value: String(rating),
    label: `${rating} ${copy.value.starsLabel}`
  }))
]));

const selectedStatusLabel = computed(() => statusOptions.value.find((option) => option.value === filters.status)?.label || copy.value.allStatusesLabel);
const selectedRatingLabel = computed(() => ratingOptions.value.find((option) => option.value === filters.rating)?.label || copy.value.allRatingsLabel);

const tabs = computed(() => ([
  { key: 'PENDING', label: locale.value === 'ar' ? 'المراجعات المعلقة' : 'Pending reviews' },
  { key: 'PRODUCT', label: locale.value === 'ar' ? 'مراجعات المنتجات' : 'Product reviews' },
  { key: 'VENDOR', label: locale.value === 'ar' ? 'مراجعات الموردين' : 'Vendor reviews' }
]));

const statCards = computed(() => ([
  {
    key: 'all',
    label: locale.value === 'ar' ? 'إجمالي المراجعات' : 'Total reviews',
    value: stats.value.totalReviews || 0,
    icon: Layers3,
    wrapClass: 'bg-primary/10',
    iconClass: 'text-primary'
  },
  {
    key: 'pending',
    label: locale.value === 'ar' ? 'قيد المراجعة' : 'Pending',
    value: stats.value.pendingReviews || 0,
    icon: ShieldAlert,
    wrapClass: 'bg-amber-500/10',
    iconClass: 'text-amber-600'
  },
  {
    key: 'approvedToday',
    label: locale.value === 'ar' ? 'تم اعتمادها اليوم' : 'Approved today',
    value: stats.value.approvedToday || 0,
    icon: Radio,
    wrapClass: 'bg-emerald-500/10',
    iconClass: 'text-emerald-600'
  },
  {
    key: 'flagged',
    label: locale.value === 'ar' ? 'مراجعات مميزة بالمخالفة' : 'Flagged reviews',
    value: stats.value.flaggedReviews || 0,
    icon: TriangleAlert,
    wrapClass: 'bg-rose-500/10',
    iconClass: 'text-rose-600'
  }
]));

const toggleSelect = (name) => {
  activeSelect.value = activeSelect.value === name ? null : name;
};

const closeSelects = () => {
  activeSelect.value = null;
};

const selectStatus = (value) => {
  filters.status = value;
  closeSelects();
};

const selectRating = (value) => {
  filters.rating = value;
  closeSelects();
};

const resetFilters = () => {
  filters.type = '';
  filters.search = '';
  filters.status = '';
  filters.rating = '';
  filters.dateFrom = '';
  filters.flaggedOnly = false;
  activeQuickFilter.value = 'all';
  closeSelects();
};

const fetchReviews = async () => {
  loading.value = true;
  try {
    const response = await api.get('/admin/reviews', {
      params: {
        type: normalizedTypeParam.value || undefined,
        status: filters.type === 'PENDING' ? 'PENDING' : (filters.status || undefined),
        rating: filters.rating || undefined,
        search: filters.search || undefined,
        dateFrom: filters.dateFrom || undefined,
        flaggedOnly: filters.flaggedOnly || undefined
      }
    });

    const data = getApiData(response) || {};
    items.value = getApiCollection(data, ['items']);
    stats.value = data.stats || stats.value;
    topVendors.value = getApiCollection(data, ['topVendors']);
    categoryAverages.value = getApiCollection(data, ['categoryAverages']);
  } catch (error) {
    notificationStore.error(error?.response?.data?.message || copy.value.fetchFailMessage);
  } finally {
    loading.value = false;
  }
};

const moderate = async (item, action) => {
  actionLoading.value = true;
  try {
    const response = await api.patch(`/admin/reviews/${item.review_type}/${item.id}/${action}`);
    notificationStore.success(getApiMessage(response, action === 'approve' ? copy.value.approveSuccess : copy.value.rejectSuccess));
    await fetchReviews();
  } catch (error) {
    notificationStore.error(error?.response?.data?.message || copy.value.actionFailMessage);
  } finally {
    actionLoading.value = false;
  }
};

const deleteReview = async (item) => {
  const confirmed = await notificationStore.confirm(
    locale.value === 'ar'
      ? 'سيتم حذف هذه المراجعة نهائيًا. هل أنت متأكد؟'
      : 'This review will be deleted permanently. Are you sure?',
    locale.value === 'ar' ? 'تأكيد حذف المراجعة' : 'Delete review'
  );

  if (!confirmed) return;

  actionLoading.value = true;
  try {
    const response = await api.delete(`/admin/reviews/${item.review_type}/${item.id}`);
    notificationStore.success(getApiMessage(response, copy.value.deleteSuccess));
    if (previewItem.value?.id === item.id && previewItem.value?.review_type === item.review_type) {
      previewItem.value = null;
    }
    await fetchReviews();
  } catch (error) {
    notificationStore.error(error?.response?.data?.message || copy.value.actionFailMessage);
  } finally {
    actionLoading.value = false;
  }
};

const applyQuickFilter = (key) => {
  activeQuickFilter.value = key;
  closeSelects();

  if (key === 'all') {
    filters.type = '';
    filters.status = '';
    filters.rating = '';
    filters.dateFrom = '';
    filters.flaggedOnly = false;
    return;
  }

  if (key === 'pending') {
    filters.type = 'PENDING';
    filters.status = '';
    filters.rating = '';
    filters.dateFrom = '';
    filters.flaggedOnly = false;
    return;
  }

  if (key === 'approvedToday') {
    filters.type = '';
    filters.status = 'APPROVED';
    filters.rating = '';
    filters.dateFrom = new Date().toISOString().slice(0, 10);
    filters.flaggedOnly = false;
    return;
  }

  if (key === 'flagged') {
    filters.type = '';
    filters.status = '';
    filters.rating = '';
    filters.dateFrom = '';
    filters.flaggedOnly = true;
  }
};

const openPreview = (item) => {
  previewItem.value = item;
};

const targetName = (item) => {
  if (!item) return '-';
  return locale.value === 'ar'
    ? item.target_name_ar || item.target_name_en || '-'
    : item.target_name_en || item.target_name_ar || '-';
};

const localizedVendorName = (vendor) => (
  locale.value === 'ar'
    ? vendor.company_name_ar || vendor.company_name_en || '-'
    : vendor.company_name_en || vendor.company_name_ar || '-'
);

const localizedCategoryName = (category) => (
  locale.value === 'ar'
    ? category.name_ar || category.name_en || '-'
    : category.name_en || category.name_ar || '-'
);

const reviewTypeLabel = (type) => {
  if (type === 'PRODUCT') return locale.value === 'ar' ? 'مراجعة منتج' : 'Product review';
  return locale.value === 'ar' ? 'مراجعة مورد' : 'Vendor review';
};

const statusLabel = (status) => {
  if (status === 'APPROVED') return copy.value.approvedLabel;
  if (status === 'REJECTED') return copy.value.rejectedLabel;
  return copy.value.pendingLabel;
};

const statusClass = (status) => {
  const map = {
    PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
    APPROVED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
    REJECTED: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300'
  };
  return map[status] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
};

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleString(locale.value === 'ar' ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const handleOutsideClick = (event) => {
  if (!filtersPanelRef.value) return;
  if (!filtersPanelRef.value.contains(event.target)) {
    closeSelects();
  }
};

watch(
  () => [filters.type, filters.search, filters.status, filters.rating, filters.dateFrom, filters.flaggedOnly],
  fetchReviews,
  { deep: true }
);

onMounted(() => {
  document.addEventListener('click', handleOutsideClick);
  fetchReviews();
});

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick);
});
</script>

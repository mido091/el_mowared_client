<template>
  <section class="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_44px_-32px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900 sm:p-6">
    <div class="space-y-6">
      <div class="space-y-3">
        <p class="text-xs font-bold uppercase tracking-[0.22em] text-[hsl(var(--primary))]">
          {{ copy.eyebrow }}
        </p>
        <h3 class="text-xl font-black leading-tight text-[#1e293b] dark:text-white sm:text-2xl">
          {{ copy.title }}
        </h3>
        <p class="max-w-3xl text-sm leading-7 text-slate-500 dark:text-slate-400">
          {{ copy.subtitle }}
        </p>
      </div>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:max-w-xl">
        <div class="rounded-[1.4rem] border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/60">
          <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">{{ copy.averageLabel }}</p>
          <div class="mt-2 flex items-center gap-2 text-2xl font-black text-[#1e293b] dark:text-white">
            <Star class="h-5 w-5 fill-amber-400 text-amber-400" />
            {{ averageDisplay }}
          </div>
          <div class="mt-3">
            <StarRating
              :model-value="Number(summary.averageRating || 0)"
              :count="summary.totalReviews || 0"
              :show-count="(summary.totalReviews || 0) > 0"
            />
          </div>
        </div>

        <div class="rounded-[1.4rem] border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/60">
          <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">{{ copy.totalLabel }}</p>
          <div class="mt-2 text-2xl font-black text-[#1e293b] dark:text-white">{{ summary.totalReviews || 0 }}</div>
        </div>
      </div>

      <div class="rounded-[1.6rem] border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-950/60">
        <div class="mb-4 flex items-center gap-3">
          <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-[hsl(var(--primary))/0.12] text-[hsl(var(--primary))]">
            <MessageSquareText class="h-5 w-5" />
          </div>
          <div>
            <h4 class="text-lg font-black text-[#1e293b] dark:text-white">{{ copy.writeReviewLabel }}</h4>
            <p class="text-sm text-slate-500 dark:text-slate-400">{{ copy.writeReviewHint }}</p>
          </div>
        </div>

        <div
          v-if="!authStore.isAuthenticated"
          class="rounded-[1.2rem] border border-dashed border-slate-300 bg-white/70 p-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300"
        >
          {{ copy.loginRequiredLabel }}
        </div>

        <div
          v-else-if="authStore.user?.role?.toLowerCase() !== 'user'"
          class="rounded-[1.2rem] border border-dashed border-slate-300 bg-white/70 p-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300"
        >
          {{ copy.buyersOnlyLabel }}
        </div>

        <div v-else class="space-y-4">
          <div
            v-if="myReview?.status"
            class="rounded-[1.2rem] border px-4 py-3 text-sm font-medium"
            :class="myReview.status === 'APPROVED'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300'
              : myReview.status === 'REJECTED'
                ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300'
                : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300'"
          >
            {{ reviewStatusMessage }}
          </div>

          <div
            v-if="!eligibility.canReview && !myReview"
            class="rounded-[1.2rem] border border-dashed border-slate-300 bg-white/70 p-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300"
          >
            {{ copy.eligibilityLabel }}
          </div>

          <form v-else class="space-y-4" @submit.prevent="submitReview">
            <div>
              <p class="mb-3 text-sm font-black text-[#1e293b] dark:text-white">{{ copy.rateLabel }}</p>
              <div class="flex flex-wrap items-center gap-2">
                <button
                  v-for="index in 5"
                  :key="index"
                  type="button"
                  class="transition-transform hover:scale-110"
                  @click="form.rating = index"
                >
                  <Star
                    class="h-7 w-7"
                    :class="index <= form.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'"
                  />
                </button>
              </div>
            </div>

            <div>
              <label class="mb-2 block text-sm font-black text-[#1e293b] dark:text-white">{{ copy.commentLabel }}</label>
              <textarea
                v-model="form.comment"
                rows="5"
                class="w-full rounded-[1.2rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[hsl(var(--primary))] focus:ring-4 focus:ring-[hsl(var(--primary))/0.12] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                :placeholder="copy.commentPlaceholder"
                maxlength="1200"
              />
              <p class="mt-2 text-[11px] font-bold text-slate-400">{{ form.comment.length }}/1200</p>
            </div>

            <button
              type="submit"
              class="inline-flex w-full items-center justify-center gap-2 rounded-[1.2rem] bg-[hsl(var(--primary))] px-4 py-3 text-sm font-black text-white shadow-[0_16px_40px_-24px_hsl(var(--primary))] transition disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="submitting || form.rating < 1"
            >
              <Loader2 v-if="submitting" class="h-4 w-4 animate-spin" />
              <span v-else>{{ submitLabel }}</span>
            </button>
          </form>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          class="rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.18em] transition"
          :class="sortBy === 'newest' ? activeSortClass : idleSortClass"
          @click="changeSort('newest')"
        >
          {{ copy.newestLabel }}
        </button>
        <button
          type="button"
          class="rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.18em] transition"
          :class="sortBy === 'highest' ? activeSortClass : idleSortClass"
          @click="changeSort('highest')"
        >
          {{ copy.highestLabel }}
        </button>
      </div>

      <div v-if="loading" class="space-y-4">
        <div v-for="index in 3" :key="index" class="skeleton h-36 rounded-[1.35rem]" />
      </div>

      <div v-else-if="reviews.length" class="space-y-4">
        <article
          v-for="review in reviews"
          :key="review.id"
          class="rounded-[1.35rem] border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-950/60"
        >
          <div class="mb-3 flex items-start gap-3">
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))/0.14] text-sm font-black text-[hsl(var(--primary))]">
              {{ reviewerInitial(review) }}
            </div>

            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <p class="truncate text-sm font-black text-[#1e293b] dark:text-white">{{ review.reviewer_name || copy.buyerFallback }}</p>
                <span
                  v-if="review.is_verified_review"
                  class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                >
                  <BadgeCheck class="h-3.5 w-3.5" />
                  {{ copy.verifiedLabel }}
                </span>
              </div>

              <div class="mt-1 flex flex-wrap items-center gap-2">
                <div class="flex items-center gap-1">
                  <Star
                    v-for="index in 5"
                    :key="index"
                    class="h-3.5 w-3.5"
                    :class="index <= Number(review.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'"
                  />
                </div>
                <span class="text-[11px] font-bold text-slate-400">{{ formatDate(review.created_at) }}</span>
              </div>
            </div>
          </div>

          <p class="break-words text-sm leading-7 text-slate-600 dark:text-slate-300">
            {{ review.comment || copy.emptyCommentLabel }}
          </p>
        </article>
      </div>

      <div
        v-else
        class="rounded-[1.4rem] border border-dashed border-slate-300 bg-slate-50/80 p-10 text-center text-sm font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-400"
      >
        {{ copy.emptyState }}
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { BadgeCheck, Loader2, MessageSquareText, Star } from 'lucide-vue-next';
import api from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notificationStore';
import { getApiCollection, getApiData, getApiMessage } from '@/utils/apiResponse';
import StarRating from '@/components/ui/StarRating.vue';

const props = defineProps({
  type: {
    type: String,
    required: true
  },
  targetId: {
    type: Number,
    required: true
  }
});

const { locale } = useI18n();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();

const loading = ref(true);
const submitting = ref(false);
const sortBy = ref('newest');
const reviews = ref([]);
const summary = ref({
  averageRating: 0,
  totalReviews: 0,
  pendingReviews: 0,
  verifiedReviews: 0
});
const myReview = ref(null);
const eligibility = ref({
  canReview: false,
  isVerifiedInteraction: false,
  interactionType: null
});

const form = reactive({
  rating: 0,
  comment: ''
});

const basePath = computed(() => (
  props.type === 'vendor'
    ? `/reviews/vendors/${props.targetId}`
    : `/reviews/products/${props.targetId}`
));

const copy = computed(() => {
  const isAr = locale.value === 'ar';
  const isVendor = props.type === 'vendor';

  return {
    eyebrow: isAr
      ? (isVendor ? 'سمعة المورد' : 'انطباعات المشترين')
      : (isVendor ? 'Supplier reputation' : 'Buyer feedback'),
    title: isAr
      ? (isVendor ? 'تقييمات المورد' : 'تقييمات المنتج')
      : (isVendor ? 'Supplier reviews' : 'Product reviews'),
    subtitle: isAr
      ? (isVendor
        ? 'نعرض هنا المراجعات المعتمدة فقط بعد مراجعتها من الإدارة.'
        : 'آراء المشترين المعتمدة تساعد في فهم جودة المنتج وتجربة التوريد الفعلية.')
      : (isVendor
        ? 'Only approved reviews appear here after admin moderation.'
        : 'Approved buyer reviews help clarify product quality and real sourcing experience.'),
    emptyState: isAr
      ? (isVendor ? 'لا توجد مراجعات معتمدة لهذا المورد بعد.' : 'لا توجد مراجعات معتمدة لهذا المنتج بعد.')
      : (isVendor ? 'No approved reviews for this supplier yet.' : 'No approved reviews for this product yet.'),
    eligibilityLabel: isAr
      ? (isVendor
        ? 'يمكنك تقييم المورد بعد وجود تفاعل حقيقي مثل محادثة أو طلب عرض أو طلب شراء.'
        : 'يمكنك تقييم المنتج بعد وجود تفاعل حقيقي مرتبط بهذا المنتج.')
      : (isVendor
        ? 'You can review this supplier after a real interaction such as chat, RFQ, or order.'
        : 'You can review this product after a real product-specific interaction.'),
    averageLabel: isAr ? 'متوسط التقييم' : 'Average rating',
    totalLabel: isAr ? 'إجمالي المراجعات' : 'Total reviews',
    newestLabel: isAr ? 'الأحدث' : 'Newest',
    highestLabel: isAr ? 'الأعلى تقييمًا' : 'Highest rated',
    writeReviewLabel: isAr ? 'اكتب تقييمك' : 'Write your review',
    writeReviewHint: isAr ? 'سيتم مراجعة التقييم قبل نشره.' : 'Your review will be moderated before publishing.',
    loginRequiredLabel: isAr ? 'سجل الدخول كمشتري لإضافة تقييمك.' : 'Log in as a buyer to submit your review.',
    buyersOnlyLabel: isAr ? 'إضافة التقييمات متاحة للمشترين فقط.' : 'Only buyers can submit reviews.',
    rateLabel: isAr ? 'التقييم بالنجوم' : 'Star rating',
    commentLabel: isAr ? 'التعليق' : 'Comment',
    commentPlaceholder: isAr
      ? 'شارك رأيك المهني عن التجربة والجودة وسرعة الاستجابة...'
      : 'Share a professional note about quality, responsiveness, and overall experience...',
    submitCreateLabel: isAr ? 'إرسال المراجعة' : 'Submit review',
    submitUpdateLabel: isAr ? 'تحديث المراجعة' : 'Update review',
    buyerFallback: isAr ? 'مشتري' : 'Buyer',
    verifiedLabel: isAr ? 'مراجعة موثقة' : 'Verified review',
    emptyCommentLabel: isAr ? 'تجربة موثقة بدون تعليق إضافي.' : 'Verified experience without an additional comment.',
    submitSuccess: isAr ? 'تم إرسال المراجعة بنجاح.' : 'Review submitted successfully.',
    submitFail: isAr ? 'تعذر حفظ المراجعة الآن.' : 'Unable to save the review right now.',
    approvedStatus: isAr ? 'مراجعتك معتمدة ومنشورة الآن.' : 'Your review is approved and now published.',
    rejectedStatus: isAr ? 'تم رفض المراجعة الحالية. يمكنك تعديلها وإعادة إرسالها.' : 'Your current review was rejected. You can edit and resubmit it.',
    pendingStatus: isAr ? 'مراجعتك قيد المراجعة من الإدارة.' : 'Your review is pending admin moderation.'
  };
});

const refreshPublic = async () => {
  loading.value = true;
  try {
    const response = await api.get(basePath.value, {
      params: { sort: sortBy.value }
    });
    const data = getApiData(response) || {};
    reviews.value = getApiCollection(data, ['reviews']);
    summary.value = data.summary || {
      averageRating: 0,
      totalReviews: 0,
      pendingReviews: 0,
      verifiedReviews: 0
    };
  } finally {
    loading.value = false;
  }
};

const refreshMine = async () => {
  if (!authStore.isAuthenticated || authStore.user?.role?.toLowerCase() !== 'user') {
    myReview.value = null;
    eligibility.value = {
      canReview: false,
      isVerifiedInteraction: false,
      interactionType: null
    };
    return;
  }

  try {
    const response = await api.get(`${basePath.value}/me`);
    const data = getApiData(response) || {};
    myReview.value = data.review || null;
    eligibility.value = data.eligibility || {
      canReview: false,
      isVerifiedInteraction: false,
      interactionType: null
    };
    form.rating = Number(myReview.value?.rating || 0);
    form.comment = myReview.value?.comment || '';
  } catch {
    myReview.value = null;
  }
};

const refreshAll = async () => {
  await Promise.all([refreshPublic(), refreshMine()]);
};

const submitReview = async () => {
  if (form.rating < 1) return;

  submitting.value = true;
  try {
    const method = myReview.value ? 'patch' : 'post';
    const response = await api[method](basePath.value, {
      rating: form.rating,
      comment: form.comment
    });

    notificationStore.success(getApiMessage(response, copy.value.submitSuccess));
    await refreshAll();
  } catch (error) {
    notificationStore.error(error?.response?.data?.message || copy.value.submitFail);
  } finally {
    submitting.value = false;
  }
};

const changeSort = async (value) => {
  if (sortBy.value === value) return;
  sortBy.value = value;
  await refreshPublic();
};

const reviewerInitial = (review) => {
  const name = review?.reviewer_name || copy.value.buyerFallback;
  return String(name).trim().charAt(0).toUpperCase();
};

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString(locale.value === 'ar' ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const averageDisplay = computed(() => Number(summary.value.averageRating || 0).toFixed(1));
const submitLabel = computed(() => myReview.value ? copy.value.submitUpdateLabel : copy.value.submitCreateLabel);
const reviewStatusMessage = computed(() => {
  if (!myReview.value?.status) return '';
  if (myReview.value.status === 'APPROVED') return copy.value.approvedStatus;
  if (myReview.value.status === 'REJECTED') return copy.value.rejectedStatus;
  return copy.value.pendingStatus;
});

const activeSortClass = 'bg-[hsl(var(--primary))] text-white shadow-sm';
const idleSortClass = 'bg-slate-100 text-slate-600 hover:text-[hsl(var(--primary))] dark:bg-slate-800 dark:text-slate-300';

watch(() => [props.targetId, props.type], refreshAll);
watch(() => locale.value, refreshAll);
onMounted(refreshAll);
</script>

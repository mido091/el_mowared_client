<template>
  <div v-if="rfq" class="container-narrow py-8">
    <router-link to="/rfq" class="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
      <ChevronLeft class="h-4 w-4 rtl:rotate-180" />
      {{ labels.back }}
    </router-link>

    <div class="card p-6 mb-6">
      <div class="flex flex-col gap-5 lg:flex-row lg:items-start">
        <div v-if="rfq.image_url" class="h-32 w-32 shrink-0 overflow-hidden rounded-2xl border border-border bg-muted/20">
          <img :src="rfq.image_url" :alt="rfq.title" class="h-full w-full object-cover" />
        </div>

        <div class="min-w-0 flex-1">
          <div class="mb-3 flex flex-wrap gap-2">
            <span class="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
              {{ categoryName }}
            </span>
            <span class="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:bg-slate-800 dark:text-slate-300">
              {{ rfq.status }}
            </span>
          </div>

          <h1 class="text-3xl font-black text-foreground">{{ rfq.title }}</h1>
          <div class="mt-4">
            <RfqItemsList :items="rfqItems" :item-label="labels.whatNeeded" :details-label="labels.productDetails" />
            <p v-if="!rfqItems.length" class="mt-3 text-sm leading-7 text-muted-foreground">{{ labels.noDescription }}</p>
          </div>
        </div>
      </div>

      <div class="mt-6 grid gap-4 md:grid-cols-4">
        <div class="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
          <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{{ labels.quantity }}</p>
          <p class="mt-1 text-lg font-black text-foreground">{{ rfq.quantity }}</p>
        </div>
        <div class="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
          <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{{ labels.budget }}</p>
          <p class="mt-1 text-lg font-black text-primary">{{ formattedBudget }}</p>
        </div>
        <div class="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
          <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{{ labels.responders }}</p>
          <p class="mt-1 text-lg font-black text-foreground">{{ rfq.current_responders || 0 }} / {{ rfq.max_responders || 0 }}</p>
        </div>
        <div class="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
          <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{{ labels.deadline }}</p>
          <p class="mt-1 text-lg font-black text-foreground">{{ formattedDeadline }}</p>
        </div>
      </div>

      <div class="mt-6 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end" v-if="showPrimaryAction">
        <button
          v-if="canVendorChatBuyer"
          @click="startVendorChat"
          :disabled="chatStore.sending"
          class="btn-primary font-bold"
        >
          {{ labels.vendorChatBuyer }}
        </button>

        <button
          v-if="canBuyerChatSelectedVendor"
          @click="openBuyerChatWithOffer(selectedOfferForBuyer)"
          :disabled="chatStore.sending"
          class="btn-primary font-bold"
        >
          {{ labels.buyerChatVendor }}
        </button>
      </div>
    </div>

    <div class="card p-6 mb-8">
      <div class="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 class="text-xl font-black text-foreground">{{ labels.offersTitle }}</h2>
          <p class="text-sm text-muted-foreground">{{ labels.offersSubtitle }}</p>
        </div>
        <span class="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">{{ offers.length }}</span>
      </div>

      <div v-if="offers.length" class="space-y-4">
        <div v-for="offer in offers" :key="offer.id" class="rounded-2xl border border-border p-5">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-3">
                <div class="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 text-sm font-black text-slate-500 dark:bg-slate-800">
                  <img v-if="offer.vendor?.logo_url" :src="offer.vendor.logo_url" :alt="offer.vendor?.company_name" class="h-full w-full object-cover" />
                  <span v-else>{{ vendorInitials(offer.vendor?.company_name) }}</span>
                </div>
                <div>
                  <p class="font-black text-foreground">{{ offer.vendor?.company_name || labels.vendorFallback }}</p>
                </div>
              </div>
            </div>

            <div class="shrink-0">
              <div class="flex flex-col gap-2 sm:flex-row lg:justify-end">
                <button
                  v-if="isBuyer"
                  @click="openBuyerChatWithOffer(offer)"
                  :disabled="chatStore.sending"
                  class="btn-outline font-bold"
                >
                  {{ labels.buyerChatVendor }}
                </button>
                <button
                  v-if="isBuyer && canAcceptOffer"
                  @click="acceptOffer(offer.id)"
                  :disabled="rfqStore.submitting"
                  class="btn-primary font-bold"
                >
                  {{ labels.acceptOffer }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="rounded-2xl border-2 border-dashed border-border px-6 py-14 text-center">
        <FileText class="mx-auto h-10 w-10 text-muted-foreground/40" />
        <h3 class="mt-4 text-lg font-black text-foreground">{{ labels.noOffers }}</h3>
        <p class="mt-2 text-sm text-muted-foreground">{{ labels.noOffersDescription }}</p>
      </div>
    </div>

    <div v-if="isVendor && canSubmitOffer" class="card p-6">
      <h2 class="mb-5 text-xl font-black text-foreground">{{ labels.submitOffer }}</h2>
      <form class="space-y-4" @submit.prevent="submitOffer">
        <div class="grid gap-4 md:grid-cols-2">
          <div class="form-group">
            <label class="form-label font-bold">{{ labels.offerPrice }}</label>
            <input v-model.number="offerForm.offered_price" type="number" min="1" step="0.01" class="form-input" required @input="clearField('offered_price')" />
            <p v-if="fieldMessage('offered_price')" class="form-error mt-2">{{ fieldMessage('offered_price') }}</p>
          </div>
          <div class="form-group">
            <label class="form-label font-bold">{{ labels.deliveryTime }}</label>
            <input v-model.trim="offerForm.delivery_time" type="text" class="form-input" :placeholder="labels.deliveryTimePlaceholder" required @input="clearField('delivery_time')" />
            <p v-if="fieldMessage('delivery_time')" class="form-error mt-2">{{ fieldMessage('delivery_time') }}</p>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label font-bold">{{ labels.offerNotesLabel }}</label>
          <textarea v-model.trim="offerForm.notes" rows="4" class="form-input resize-none" :placeholder="labels.offerNotesPlaceholder" @input="clearField('notes')" />
          <p v-if="fieldMessage('notes')" class="form-error mt-2">{{ fieldMessage('notes') }}</p>
        </div>

        <div v-if="rfqStore.error" class="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {{ resolveLocalizedText(rfqStore.error, locale) }}
        </div>

        <div class="flex justify-end">
          <button class="btn-primary font-bold" type="submit" :disabled="rfqStore.submitting">
            {{ rfqStore.submitting ? labels.submitting : labels.submitOffer }}
          </button>
        </div>
      </form>
    </div>
  </div>

  <div v-else-if="loading" class="container-narrow py-8 space-y-4">
    <div class="card skeleton h-44 rounded-2xl" />
    <div class="card skeleton h-56 rounded-2xl" />
  </div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ChevronLeft, FileText } from 'lucide-vue-next';
import api from '@/services/api';
import { getApiData } from '@/utils/apiResponse';
import { formatEGPCurrency } from '@/utils/currency';
import { useAuthStore } from '@/stores/auth';
import { useChatStore } from '@/stores/chat';
import { useNotificationStore } from '@/stores/notificationStore';
import { useRfqStore } from '@/stores/rfqStore';
import { clearFieldError, getFieldErrorMessage } from '@/utils/errorHandler';
import { resolveLocalizedText } from '@/utils/localizedText';
import { normalizeRfqItems } from '@/utils/rfqItems';
import RfqItemsList from '@/components/rfq/RfqItemsList.vue';

const route = useRoute();
const router = useRouter();
const { locale } = useI18n();
const authStore = useAuthStore();
const chatStore = useChatStore();
const notificationStore = useNotificationStore();
const rfqStore = useRfqStore();

const rfq = ref(null);
const offers = ref([]);
const loading = ref(true);
const vendorProfileId = ref(null);

const offerForm = reactive({
  offered_price: '',
  delivery_time: '',
  notes: ''
});

const localized = (ar, en) => (locale.value === 'ar' ? ar : en);

const labels = computed(() => ({
  back: localized('العودة إلى طلبات العروض', 'Back to RFQs'),
  noDescription: localized('لا يوجد وصف تفصيلي مضاف لهذا الطلب حتى الآن.', 'No detailed description has been added yet.'),
  whatNeeded: localized('ماذا تحتاج', 'What do you need'),
  productDetails: localized('تفاصيل المنتج', 'Product details'),
  quantity: localized('الكمية', 'Quantity'),
  budget: localized('الميزانية', 'Budget'),
  responders: localized('الاستجابات', 'Responders'),
  deadline: localized('تاريخ الانتهاء', 'Deadline'),
  offersTitle: localized('العروض المقدمة', 'Submitted Offers'),
  offersSubtitle: localized('كل الموردين الذين تفاعلوا مع هذا الطلب يظهرون هنا.', 'All suppliers who interacted with this RFQ appear here.'),
  vendorFallback: localized('مورد', 'Vendor'),
  noDeliveryTime: localized('مدة التوريد غير محددة', 'Delivery time not specified'),
  noOfferNotes: localized('لا توجد ملاحظات إضافية على العرض.', 'No extra notes for this offer.'),
  buyerChatVendor: localized('تواصل مع المورد', 'Chat with Vendor'),
  vendorChatBuyer: localized('ابدأ تواصل مع العميل', 'Message Buyer'),
  acceptOffer: localized('اعتماد العرض', 'Accept Offer'),
  noOffers: localized('لا توجد عروض بعد', 'No offers yet'),
  noOffersDescription: localized('سيظهر الموردون الذين يتفاعلون مع الطلب هنا فورًا.', 'Suppliers who respond to this RFQ will appear here immediately.'),
  submitOffer: localized('إرسال عرض', 'Submit Offer'),
  offerPrice: localized('سعر العرض', 'Offer Price'),
  deliveryTime: localized('مدة التوريد', 'Delivery Time'),
  deliveryTimePlaceholder: localized('مثال: 7 أيام عمل', 'e.g. 7 business days'),
  offerNotesLabel: localized('ملاحظات العرض', 'Offer Notes'),
  offerNotesPlaceholder: localized('اكتب أي تفاصيل إضافية عن السعر أو التوريد أو الضمان...', 'Add any extra details about pricing, delivery, or warranty...'),
  submitting: localized('جارٍ الإرسال...', 'Submitting...'),
  rfqChatBuyerMessage: localized('مرحبًا، يمكنني تلبية طلبك. هل يمكننا مناقشة التفاصيل؟', 'Hello, I can fulfill your request. Can we discuss the details?'),
  buyerChatError: localized('تعذر فتح المحادثة الآن.', 'Unable to open the chat right now.'),
  offerSubmitted: localized('تم إرسال العرض بنجاح.', 'Offer submitted successfully.'),
  offerSubmitError: localized('تعذر إرسال العرض الآن.', 'Unable to submit the offer right now.'),
  offerAccepted: localized('تم اعتماد العرض بنجاح.', 'Offer accepted successfully.'),
  offerAcceptError: localized('تعذر اعتماد العرض الآن.', 'Unable to accept the offer right now.')
}));

const isVendor = computed(() => `${authStore.user?.role || ''}`.toUpperCase() === 'MOWARED');
const isBuyer = computed(() => `${authStore.user?.role || ''}`.toUpperCase() === 'USER');
const categoryName = computed(() => (locale.value === 'ar'
  ? (rfq.value?.category_name_ar || rfq.value?.category_name_en || localized('غير مصنف', 'Uncategorized'))
  : (rfq.value?.category_name_en || rfq.value?.category_name_ar || localized('غير مصنف', 'Uncategorized'))));
const formattedBudget = computed(() => rfq.value?.target_price ? formatEGPCurrency(Number(rfq.value.target_price), locale.value) : localized('غير محددة', 'Not set'));
const formattedDeadline = computed(() => rfq.value?.expiration_time ? new Date(rfq.value.expiration_time).toLocaleDateString(locale.value === 'ar' ? 'ar-EG' : 'en-US') : localized('غير محدد', 'Not set'));
const rfqItems = computed(() => normalizeRfqItems(rfq.value));
const canSubmitOffer = computed(() => isVendor.value && ['BROADCASTED', 'OPEN', 'NEGOTIATING'].includes(`${rfq.value?.status || ''}`.toUpperCase()));
const canAcceptOffer = computed(() => isBuyer.value && ['OPEN', 'NEGOTIATING', 'OFFERED'].includes(`${rfq.value?.status || ''}`.toUpperCase()));
const canVendorChatBuyer = computed(() => isVendor.value && !!vendorProfileId.value && !!rfq.value?.id);
const selectedOfferForBuyer = computed(() => offers.value[0] || null);
const canBuyerChatSelectedVendor = computed(() => isBuyer.value && !!selectedOfferForBuyer.value?.vendor?.id);
const showPrimaryAction = computed(() => canVendorChatBuyer.value || canBuyerChatSelectedVendor.value);
const fieldMessage = (field) => getFieldErrorMessage(rfqStore.fieldErrors, field, locale.value);
const clearField = (field) => clearFieldError(rfqStore.fieldErrors, field);
let stopRfqSync = null;

const vendorInitials = (name = '') =>
  String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase() || 'V';

const formatCurrency = (value) => formatEGPCurrency(Number(value || 0), locale.value);

async function loadVendorProfileId() {
  if (!isVendor.value) return;
  try {
    const response = await api.get('/vendor/me');
    vendorProfileId.value = getApiData(response)?.vendor?.id || null;
  } catch {
    vendorProfileId.value = null;
  }
}

async function loadRfq() {
  const response = await api.get(`/rfq/${route.params.id}`);
  const data = getApiData(response);
  rfq.value = data;
  offers.value = Array.isArray(data?.offers) ? data.offers : [];
}

function buildRfqMetadata() {
  return {
    rfq_id: rfq.value.id,
    rfq_title: rfq.value.title,
    rfq_quantity: rfq.value.quantity,
    rfq_budget: rfq.value.target_price,
    rfq_image: rfq.value.image_url || null
  };
}

async function startVendorChat() {
  if (!vendorProfileId.value || !rfq.value?.id) return;
  try {
    const result = await chatStore.startRfqChat(
      vendorProfileId.value,
      rfq.value.id,
      labels.value.rfqChatBuyerMessage,
      buildRfqMetadata(),
      { buyerId: rfq.value.user_id }
    );
    const conversation = result?.conversation || result;
    if (conversation?.id) {
      router.push(`/chat?id=${conversation.id}`);
    }
  } catch {
    notificationStore.error(labels.value.buyerChatError);
  }
}

async function openBuyerChatWithOffer(offer) {
  if (!offer?.vendor?.id || !rfq.value?.id) return;
  try {
    const result = await chatStore.startChat(
      offer.vendor.id,
      null,
      localized(`مرحبًا، أريد متابعة المناقشة حول طلب العرض: ${rfq.value.title}`, `Hello, I would like to continue the discussion about RFQ: ${rfq.value.title}`),
      'RFQ',
      buildRfqMetadata(),
      { relatedRfqId: rfq.value.id, source: 'rfq' }
    );
    const conversation = result?.conversation || result;
    if (conversation?.id) {
      router.push(`/chat?id=${conversation.id}`);
    }
  } catch {
    notificationStore.error(labels.value.buyerChatError);
  }
}

async function submitOffer() {
  try {
    await rfqStore.submitOffer(rfq.value.id, offerForm);
    notificationStore.success(labels.value.offerSubmitted);
    offerForm.offered_price = '';
    offerForm.delivery_time = '';
    offerForm.notes = '';
    await loadRfq();
  } catch {
    notificationStore.error(labels.value.offerSubmitError);
  }
}

async function acceptOffer(offerId) {
  try {
    await rfqStore.acceptOffer(offerId);
    notificationStore.success(labels.value.offerAccepted);
    await loadRfq();
  } catch {
    notificationStore.error(labels.value.offerAcceptError);
  }
}

onMounted(async () => {
  try {
    rfqStore.ensureSync();
    stopRfqSync = rfqStore.$subscribe((_mutation, state) => {
      if (state.revision && rfq.value?.id) {
        loadRfq().catch(() => {});
      }
    });
    await Promise.all([loadVendorProfileId(), loadRfq()]);
  } finally {
    loading.value = false;
  }
});

onBeforeUnmount(() => {
  if (typeof stopRfqSync === 'function') {
    stopRfqSync();
  }
});
</script>

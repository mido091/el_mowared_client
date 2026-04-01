<template>
  <div class="mx-auto max-w-5xl px-4 py-10 sm:px-6" :dir="locale === 'ar' ? 'rtl' : 'ltr'">
    <div class="mb-8 flex items-center gap-4">
      <router-link
        to="/rfq"
        class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
      >
        <ChevronLeft class="h-5 w-5 rtl:rotate-180" />
      </router-link>

      <div>
        <h1 class="text-3xl font-black text-foreground">{{ labels.pageTitle }}</h1>
        <p class="mt-1 text-muted-foreground">{{ labels.pageSubtitle }}</p>
      </div>
    </div>

    <div class="mb-8 rounded-[2rem] border border-border bg-white p-5 shadow-sm dark:bg-card">
      <div class="relative">
        <div class="absolute left-[16.666%] right-[16.666%] top-6 h-1 rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            class="h-full rounded-full bg-primary transition-all duration-300"
            :style="{ width: `${((step - 1) / Math.max(steps.length - 1, 1)) * 100}%` }"
          />
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div v-for="(item, index) in steps" :key="item.key" class="flex flex-col items-center gap-3 text-center">
            <div
              class="relative z-10 flex h-12 w-12 items-center justify-center rounded-full text-sm font-black shadow-sm transition-all"
              :class="step > index + 1
                ? 'bg-primary text-primary-foreground'
                : step === index + 1
                  ? 'bg-primary text-primary-foreground ring-4 ring-primary/15'
                  : 'border-2 border-slate-200 bg-white text-muted-foreground dark:border-slate-700 dark:bg-slate-900'"
            >
              <CheckIcon v-if="step > index + 1" class="h-5 w-5" />
              <span v-else>{{ index + 1 }}</span>
            </div>
            <div>
              <p class="text-sm font-black" :class="step >= index + 1 ? 'text-foreground' : 'text-muted-foreground'">
                {{ item.label }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="rounded-[2rem] border border-border bg-white p-6 shadow-sm dark:bg-card md:p-8">
      <form @submit.prevent="submitForm">
        <div v-show="step === 1" class="space-y-6">
          <h2 class="border-b border-border pb-3 text-xl font-black">{{ labels.coreSectionTitle }}</h2>

          <div class="grid gap-6 xl:grid-cols-2">
            <section class="rounded-[1.75rem] border border-slate-200/80 bg-[linear-gradient(135deg,rgba(45,191,178,0.08),rgba(255,255,255,0.98)_65%)] p-5 shadow-[0_18px_45px_-38px_rgba(15,23,42,0.38)]">
              <div class="mb-4">
                <p class="text-[11px] font-black uppercase tracking-[0.18em] text-primary">{{ labels.categoryLabel }}</p>
                <h3 class="mt-1 text-base font-black text-foreground">{{ labels.mainCategoryTitle }}</h3>
                <p class="mt-1 text-xs leading-6 text-muted-foreground">{{ labels.categoryPanelHint }}</p>
              </div>

              <ResponsiveSelect
                v-model="selectedCategoryId"
                :options="rootCategoryOptions"
                :placeholder="labels.selectCategory"
                :sheet-title="labels.categoryLabel"
                :sheet-kicker="labels.mainCategoryTitle"
                searchable
              />

              <p v-if="fieldMessage('category_id')" class="form-error mt-2">{{ fieldMessage('category_id') }}</p>
            </section>

            <section class="rounded-[1.75rem] border border-slate-200/80 bg-white p-5 shadow-[0_18px_45px_-38px_rgba(15,23,42,0.3)]">
              <div class="mb-4">
                <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">{{ labels.priorityLabel }}</p>
                <h3 class="mt-1 text-base font-black text-foreground">{{ labels.priorityPanelTitle }}</h3>
                <p class="mt-1 text-xs leading-6 text-muted-foreground">{{ labels.priorityPanelHint }}</p>
              </div>

              <div ref="priorityMenuRef" class="relative">
                <button
                  type="button"
                  class="form-input flex min-h-[56px] w-full items-center justify-between rounded-2xl border border-slate-200 bg-white pe-4 ps-4 text-start font-bold shadow-sm transition-colors hover:border-primary/30 dark:bg-slate-900"
                  @click="priorityMenuOpen = !priorityMenuOpen"
                >
                  <span>{{ selectedPriorityLabel }}</span>
                  <ChevronDown class="h-5 w-5 shrink-0 text-muted-foreground transition-transform" :class="priorityMenuOpen ? 'rotate-180' : ''" />
                </button>

                <div
                  v-if="priorityMenuOpen"
                  class="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-border bg-card p-2 shadow-2xl"
                >
                  <button
                    v-for="option in priorityOptions"
                    :key="option.value"
                    type="button"
                    class="flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm font-bold transition-colors"
                    :class="form.lead_priority === option.value ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground hover:bg-muted'"
                    @click="selectPriority(option.value)"
                  >
                    <span>{{ option.label }}</span>
                    <CheckIcon v-if="form.lead_priority === option.value" class="h-4 w-4" />
                  </button>
                </div>
              </div>
            </section>
          </div>

          <p class="text-sm text-muted-foreground">{{ labels.categoryHint }}</p>

          <div class="grid gap-6 md:grid-cols-2">
            <div class="form-group">
              <label class="form-label font-bold">{{ labels.quantityLabel }} <span class="text-destructive">*</span></label>
              <input v-model.number="form.quantity" type="number" min="1" class="form-input" required @input="clearField('quantity')" />
              <p v-if="fieldMessage('quantity')" class="form-error mt-2">{{ fieldMessage('quantity') }}</p>
            </div>

            <div class="form-group">
              <label class="form-label font-bold">{{ labels.targetPriceLabel }} <span class="font-normal text-muted-foreground">({{ labels.optional }})</span></label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">EGP</span>
                <input
                  v-model.number="form.target_price"
                  type="number"
                  step="0.01"
                  min="0"
                  class="form-input ps-14"
                  :placeholder="labels.targetPricePlaceholder"
                  @input="clearField('target_price')"
                />
              </div>
              <p v-if="fieldMessage('target_price')" class="form-error mt-2">{{ fieldMessage('target_price') }}</p>
            </div>
          </div>
        </div>

        <div v-show="step === 2" class="space-y-6">
          <div class="flex flex-col gap-3 border-b border-border pb-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 class="text-xl font-black">{{ labels.productsSectionTitle }}</h2>
              <p class="mt-1 text-sm text-muted-foreground">{{ labels.productsSectionHint }}</p>
            </div>

            <button type="button" class="btn-outline font-bold" @click="addItem">
              <PlusIcon class="h-4 w-4" />
              {{ labels.addItem }}
            </button>
          </div>

          <div v-if="fieldMessage('items')" class="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {{ fieldMessage('items') }}
          </div>

          <div class="space-y-4">
            <article
              v-for="(item, index) in form.items"
              :key="item.id"
              class="rounded-[1.75rem] border border-slate-200/80 bg-[linear-gradient(135deg,rgba(45,191,178,0.06),rgba(255,255,255,0.98)_70%)] p-5 shadow-[0_18px_45px_-38px_rgba(15,23,42,0.28)]"
            >
              <div class="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p class="text-[11px] font-black uppercase tracking-[0.18em] text-primary">{{ labels.itemKicker }}</p>
                  <h3 class="mt-1 text-lg font-black text-foreground">{{ labels.itemTitle(index + 1) }}</h3>
                </div>

                <button
                  v-if="form.items.length > 1"
                  type="button"
                  class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100"
                  :aria-label="labels.removeItem"
                  @click="removeItem(index)"
                >
                  <Trash2Icon class="h-4 w-4" />
                </button>
              </div>

              <div class="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
                <div class="form-group">
                  <label class="form-label font-bold">{{ labels.itemLabel }} <span class="text-destructive">*</span></label>
                  <input
                    v-model.trim="item.label"
                    type="text"
                    class="form-input"
                    :placeholder="labels.itemLabelPlaceholder"
                    @input="clearField('items')"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label font-bold">{{ labels.itemDetailsLabel }} <span class="text-destructive">*</span></label>
                  <textarea
                    v-model.trim="item.details"
                    rows="4"
                    class="form-input resize-none"
                    :placeholder="labels.itemDetailsPlaceholder"
                    @input="clearField('items')"
                  />
                </div>
              </div>
            </article>
          </div>

          <div class="form-group">
            <label class="form-label font-bold">{{ labels.imageLabel }} <span class="font-normal text-muted-foreground">({{ labels.optional }})</span></label>
            <label class="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 p-6 text-center transition-all hover:border-primary/40 hover:bg-primary/5 dark:border-slate-700 dark:bg-slate-900/50">
              <UploadCloud class="mb-3 h-8 w-8 text-primary" />
              <p class="font-bold text-foreground">{{ labels.uploadTitle }}</p>
              <p class="mt-1 text-sm text-muted-foreground">{{ labels.uploadHint }}</p>
              <input type="file" accept="image/*" class="hidden" @change="handleImageChange" />
            </label>
            <p v-if="fieldMessage('image') || fieldMessage('image_url')" class="form-error mt-2">{{ fieldMessage('image') || fieldMessage('image_url') }}</p>

            <div v-if="imagePreview" class="mt-4 overflow-hidden rounded-2xl border border-border bg-muted/20">
              <div class="relative">
                <button
                  type="button"
                  class="absolute end-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white shadow-lg transition hover:bg-black/85"
                  :aria-label="labels.removeImage"
                  @click="removeImage"
                >
                  <span class="text-lg font-black leading-none">x</span>
                </button>
                <img :src="imagePreview" :alt="labels.previewAlt" class="h-56 w-full object-cover" />
              </div>
            </div>
          </div>
        </div>

        <div v-show="step === 3" class="space-y-6">
          <h2 class="border-b border-border pb-3 text-xl font-black">{{ labels.settingsSectionTitle }}</h2>

          <div class="grid gap-6 md:grid-cols-2">
            <div class="form-group">
              <label class="form-label font-bold">{{ labels.maxRespondersLabel }}</label>
              <input v-model.number="form.max_responders" type="number" min="1" max="50" class="form-input" @input="clearField('max_responders')" />
              <p v-if="fieldMessage('max_responders')" class="form-error mt-2">{{ fieldMessage('max_responders') }}</p>
              <p class="mt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{{ labels.maxRespondersHint }}</p>
            </div>

            <div class="form-group">
              <label class="form-label font-bold">{{ labels.expirationLabel }} <span class="text-destructive">*</span></label>
              <input v-model="form.expiration_date" type="date" class="form-input" :min="minDate" required @input="clearField('expiration_time')" />
              <p v-if="fieldMessage('expiration_time')" class="form-error mt-2">{{ fieldMessage('expiration_time') }}</p>
            </div>
          </div>
        </div>

        <div v-if="rfqStore.error" class="mt-6 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {{ resolveLocalizedText(rfqStore.error, locale) }}
        </div>

        <div class="mt-10 flex items-center justify-between border-t border-border pt-6">
          <button v-if="step > 1" type="button" class="btn-outline px-8 font-bold" @click="step -= 1">
            {{ labels.back }}
          </button>
          <div v-else />

          <button v-if="step < steps.length" type="button" class="btn-primary px-8 font-bold" @click="nextStep">
            {{ labels.next }}
          </button>

          <button
            v-else
            type="submit"
            :disabled="submitting"
            class="btn-primary flex items-center gap-2 bg-green-600 px-10 font-bold hover:bg-green-700 disabled:opacity-50"
          >
            <Loader2Icon v-if="submitting" class="h-4 w-4 animate-spin" />
            <CheckIcon v-else class="h-4 w-4" />
            {{ labels.submit }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ChevronDown, ChevronLeft, CheckIcon, Loader2Icon, PlusIcon, Trash2Icon, UploadCloud } from 'lucide-vue-next';
import { useNotificationStore } from '@/stores/notificationStore';
import { useRfqStore } from '@/stores/rfqStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { clearFieldError, getFieldErrorMessage } from '@/utils/errorHandler';
import { resolveLocalizedText } from '@/utils/localizedText';
import { useCategoryHierarchy } from '@/composables/useCategoryHierarchy';
import ResponsiveSelect from '@/components/ui/ResponsiveSelect.vue';

const router = useRouter();
const { locale } = useI18n();
const notificationStore = useNotificationStore();
const rfqStore = useRfqStore();
const categoryStore = useCategoryStore();

const step = ref(1);
const submitting = ref(false);
const imageFile = ref(null);
const imagePreview = ref('');
const priorityMenuOpen = ref(false);
const priorityMenuRef = ref(null);
const selectedCategoryId = ref('');
const itemSeed = ref(1);

const minDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];

const createItem = () => ({
  id: itemSeed.value++,
  label: '',
  details: ''
});

const form = reactive({
  category_id: null,
  quantity: 1,
  target_price: null,
  lead_priority: 'MEDIUM',
  items: [createItem()],
  max_responders: 5,
  expiration_date: minDate
});

const localized = (ar, en) => (locale.value === 'ar' ? ar : en);

const labels = computed(() => ({
  pageTitle: localized('إنشاء طلب عرض سعر جديد', 'Create New RFQ'),
  pageSubtitle: localized('أرسل متطلباتك ليصل الطلب إلى الموردين المناسبين بعد مراجعة الإدارة.', 'Submit your requirements so the right suppliers receive them after admin review.'),
  coreSectionTitle: localized('الأساسيات', 'Core Requirements'),
  productsSectionTitle: localized('المنتجات المطلوبة', 'Requested Products'),
  productsSectionHint: localized('أضف منتجًا واحدًا أو عدة منتجات داخل نفس الطلب مع وصف واضح لكل بند.', 'Add one or multiple products in the same RFQ with clear details for each item.'),
  settingsSectionTitle: localized('الإعدادات', 'RFQ Settings'),
  categoryLabel: localized('الفئة', 'Category'),
  mainCategoryTitle: localized('القسم الرئيسي', 'Main category'),
  selectCategory: localized('اختر القسم الرئيسي', 'Select main category'),
  categoryPanelHint: localized('طلبات RFQ تعتمد على الأقسام الرئيسية فقط لتسهيل توجيه الطلب للموردين المناسبين.', 'RFQs use main categories only to route requests more clearly.'),
  categoryHint: localized('سيتم توجيه الطلب تلقائيًا إلى الموردين المطابقين لهذا القسم بعد المراجعة.', 'This RFQ will be routed automatically to matching suppliers after review.'),
  priorityLabel: localized('الأولوية', 'Priority'),
  priorityPanelTitle: localized('أولوية الطلب', 'Request priority'),
  priorityPanelHint: localized('حدد أولوية واضحة حتى يفهم المورد سرعة الاحتياج.', 'Choose the urgency level that best matches your request.'),
  priorityLow: localized('منخفضة', 'Low'),
  priorityMedium: localized('متوسطة', 'Medium'),
  priorityHigh: localized('مرتفعة', 'High'),
  quantityLabel: localized('الكمية المطلوبة', 'Required Quantity'),
  targetPriceLabel: localized('السعر المستهدف', 'Target Price'),
  targetPricePlaceholder: localized('مثال: 5000', 'e.g. 5000'),
  itemKicker: localized('بند RFQ', 'RFQ Item'),
  itemTitle: (count) => localized(`المنتج ${count}`, `Item ${count}`),
  itemLabel: localized('ماذا تحتاج', 'What do you need'),
  itemLabelPlaceholder: localized('مثال: كاميرا خارجية 4MP', 'e.g. Outdoor CCTV camera 4MP'),
  itemDetailsLabel: localized('تفاصيل المنتج', 'Product details'),
  itemDetailsPlaceholder: localized('اكتب المواصفات، الكميات الفرعية، المواد، المقاسات، أو أي اشتراطات مهمة لهذا البند...', 'Describe specifications, sub-quantities, materials, dimensions, or any important constraints for this item...'),
  addItem: localized('إضافة منتج', 'Add Item'),
  removeItem: localized('حذف البند', 'Remove item'),
  imageLabel: localized('صورة مرجعية', 'Reference Image'),
  optional: localized('اختياري', 'Optional'),
  uploadTitle: localized('ارفع صورة من جهازك', 'Upload an image from your device'),
  uploadHint: localized('الصيغ المدعومة: JPG, PNG, WEBP بحد أقصى 5MB', 'Supported formats: JPG, PNG, WEBP up to 5MB'),
  previewAlt: localized('معاينة الصورة المرفوعة', 'Uploaded image preview'),
  removeImage: localized('حذف الصورة', 'Remove image'),
  maxRespondersLabel: localized('أقصى عدد للردود', 'Maximum Responders'),
  maxRespondersHint: localized('يُستخدم لتحديد عدد الموردين الذين سيتنافسون على الطلب.', 'Used to limit how many suppliers can compete on this RFQ.'),
  expirationLabel: localized('تاريخ الانتهاء', 'Expiration Date'),
  back: localized('السابق', 'Back'),
  next: localized('التالي', 'Next'),
  submit: localized('إرسال الطلب', 'Submit RFQ'),
  coreValidation: localized('يرجى استكمال بيانات القسم والكمية أولًا.', 'Please complete category and quantity first.'),
  itemsValidation: localized('أضف بندًا واحدًا على الأقل مع ماذا تحتاج وتفاصيل المنتج.', 'Please add at least one complete item with what you need and product details.'),
  submitSuccess: localized('تم إرسال طلب العرض بنجاح وهو الآن بانتظار مراجعة الإدارة.', 'RFQ submitted successfully and is now awaiting admin review.'),
  submitError: localized('تعذر إرسال الطلب حاليًا.', 'Failed to submit RFQ right now.')
}));

const steps = computed(() => [
  { key: 'core', label: localized('الأساسيات', 'Core') },
  { key: 'details', label: localized('التفاصيل', 'Details') },
  { key: 'settings', label: localized('الإعدادات', 'Settings') }
]);

const categories = computed(() => categoryStore.categories);
const { rootCategories } = useCategoryHierarchy(categories, locale);

const rootCategoryOptions = computed(() =>
  rootCategories.value.map((category) => ({
    value: category.id,
    label: category.label,
    description: category.slug ? `/${category.slug}` : '',
  }))
);

const priorityOptions = computed(() => [
  { value: 'LOW', label: labels.value.priorityLow },
  { value: 'MEDIUM', label: labels.value.priorityMedium },
  { value: 'HIGH', label: labels.value.priorityHigh }
]);

const selectedPriorityLabel = computed(() =>
  priorityOptions.value.find((option) => option.value === form.lead_priority)?.label || labels.value.priorityMedium
);

const fieldMessage = (field) => getFieldErrorMessage(rfqStore.fieldErrors, field, locale.value);
const clearField = (field) => clearFieldError(rfqStore.fieldErrors, field);

function handleImageChange(event) {
  const file = event.target.files?.[0] || null;
  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value);
  }
  imageFile.value = file;
  imagePreview.value = file ? URL.createObjectURL(file) : '';
}

function removeImage() {
  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value);
  }
  imageFile.value = null;
  imagePreview.value = '';
}

function addItem() {
  form.items.push(createItem());
  clearField('items');
}

function removeItem(index) {
  if (form.items.length === 1) return;
  form.items.splice(index, 1);
  clearField('items');
}

function selectPriority(priority) {
  form.lead_priority = priority;
  priorityMenuOpen.value = false;
}

function handleOutsideClick(event) {
  if (priorityMenuRef.value && !priorityMenuRef.value.contains(event.target)) {
    priorityMenuOpen.value = false;
  }
}

function hasValidItems() {
  return form.items.every((item) => `${item.label}`.trim() && `${item.details}`.trim());
}

function nextStep() {
  if (step.value === 1 && (!form.category_id || !form.quantity)) {
    notificationStore.warn(labels.value.coreValidation);
    return;
  }

  if (step.value === 2 && (!form.items.length || !hasValidItems())) {
    notificationStore.warn(labels.value.itemsValidation);
    return;
  }

  step.value += 1;
}

async function submitForm() {
  submitting.value = true;
  try {
    const payload = new FormData();
    payload.append('category_id', String(form.category_id));
    payload.append('quantity', String(form.quantity));
    payload.append('lead_priority', form.lead_priority);
    payload.append('items', JSON.stringify(
      form.items.map((item, index) => ({
        label: `${item.label}`.trim(),
        details: `${item.details}`.trim(),
        order: index + 1
      }))
    ));
    payload.append('max_responders', String(form.max_responders));
    payload.append('expiration_time', `${form.expiration_date} 23:59:00`);

    if (form.target_price != null && form.target_price !== '') {
      payload.append('target_price', String(form.target_price));
    }

    if (imageFile.value) {
      payload.append('image', imageFile.value);
    }

    await rfqStore.createRfq(payload);
    notificationStore.success(labels.value.submitSuccess);
    router.push('/profile?tab=rfqs');
  } catch (error) {
    notificationStore.error(error?.userMessage || rfqStore.error || {
      en: labels.value.submitError,
      ar: labels.value.submitError
    });
  } finally {
    submitting.value = false;
  }
}

watch(selectedCategoryId, (nextValue) => {
  form.category_id = nextValue ? Number(nextValue) : null;
});

watch(
  () => form.category_id,
  (categoryId) => {
    selectedCategoryId.value = categoryId ? String(categoryId) : '';
  },
  { immediate: true }
);

onMounted(async () => {
  document.addEventListener('click', handleOutsideClick, true);
  await categoryStore.fetchCategories({ mode: 'revalidate' });
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutsideClick, true);
  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value);
  }
});
</script>

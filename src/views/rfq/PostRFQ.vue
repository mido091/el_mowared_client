<template>
  <div class="mx-auto max-w-4xl px-4 py-10 sm:px-6" :dir="locale === 'ar' ? 'rtl' : 'ltr'">
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

    <div class="relative mb-8 flex justify-between gap-4 rounded-2xl border border-border bg-white p-4 shadow-sm dark:bg-card">
      <div class="absolute left-8 right-8 top-1/2 -z-0 h-1 -translate-y-1/2 rounded bg-slate-100 dark:bg-slate-800">
        <div class="h-full rounded bg-primary transition-all duration-300" :style="{ width: `${((step - 1) / 2) * 100}%` }" />
      </div>

      <div v-for="(item, index) in steps" :key="item.key" class="relative z-10 flex flex-col items-center gap-2">
        <div
          class="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold shadow-sm transition-all"
          :class="step > index + 1
            ? 'bg-primary text-primary-foreground'
            : step === index + 1
              ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
              : 'border-2 border-slate-200 bg-white text-muted-foreground dark:border-slate-800 dark:bg-slate-900'"
        >
          <CheckIcon v-if="step > index + 1" class="h-5 w-5" />
          <span v-else>{{ index + 1 }}</span>
        </div>
        <span class="text-xs font-bold" :class="step >= index + 1 ? 'text-foreground' : 'text-muted-foreground'">
          {{ item.label }}
        </span>
      </div>
    </div>

    <div class="rounded-2xl border border-border bg-white p-6 shadow-sm dark:bg-card md:p-10">
      <form @submit.prevent="submitForm">
        <div v-show="step === 1" class="space-y-6">
          <h2 class="mb-4 border-b border-border pb-2 text-xl font-bold">{{ labels.coreSectionTitle }}</h2>

          <div class="form-group">
            <label class="form-label font-bold">{{ labels.titleLabel }} <span class="text-destructive">*</span></label>
            <input v-model.trim="form.title" type="text" :placeholder="labels.titlePlaceholder" class="form-input py-3 text-lg" required @input="clearField('title')" />
            <p v-if="fieldMessage('title')" class="form-error mt-2">{{ fieldMessage('title') }}</p>
          </div>

          <div class="grid gap-6 md:grid-cols-2">
            <div class="form-group">
              <label class="form-label font-bold">{{ labels.categoryLabel }} <span class="text-destructive">*</span></label>
              <div ref="categoryMenuRef" class="relative">
                <button
                  type="button"
                  class="form-input flex min-h-[56px] w-full items-center justify-between rounded-2xl border-2 border-primary/20 bg-primary/5 pe-4 ps-4 text-start font-bold shadow-sm transition-colors hover:border-primary/35 focus:border-primary"
                  @click="categoryMenuOpen = !categoryMenuOpen"
                >
                  <span :class="form.category_id ? 'text-foreground' : 'text-muted-foreground'">
                    {{ selectedCategoryLabel }}
                  </span>
                  <ChevronDown class="h-5 w-5 shrink-0 text-primary transition-transform" :class="categoryMenuOpen ? 'rotate-180' : ''" />
                </button>

                <div
                  v-if="categoryMenuOpen"
                  class="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-border bg-card p-2 shadow-2xl"
                >
                  <div class="mb-2 px-3 py-2 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
                    {{ labels.selectCategory }}
                  </div>
                  <button
                    v-for="category in categories"
                    :key="category.id"
                    type="button"
                    class="flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm font-bold transition-colors"
                    :class="form.category_id === category.id ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground hover:bg-muted'"
                    @click="selectCategory(category.id)"
                  >
                    <span>{{ locale === 'ar' ? category.name_ar : category.name_en }}</span>
                    <CheckIcon v-if="form.category_id === category.id" class="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p v-if="fieldMessage('category_id')" class="form-error mt-2">{{ fieldMessage('category_id') }}</p>
              <p class="mt-2 text-xs font-medium text-muted-foreground">{{ labels.categoryHint }}</p>
            </div>

            <div class="form-group">
              <label class="form-label font-bold">{{ labels.priorityLabel }}</label>
              <div ref="priorityMenuRef" class="relative">
                <button
                  type="button"
                  class="form-input flex min-h-[56px] w-full items-center justify-between rounded-2xl bg-slate-50 pe-4 ps-4 text-start font-bold shadow-sm dark:bg-slate-900"
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
            </div>
          </div>

          <div class="grid gap-6 md:grid-cols-2">
            <div class="form-group">
              <label class="form-label font-bold">{{ labels.quantityLabel }} <span class="text-destructive">*</span></label>
              <input v-model.number="form.quantity" type="number" min="1" class="form-input" required @input="clearField('quantity')" />
              <p v-if="fieldMessage('quantity')" class="form-error mt-2">{{ fieldMessage('quantity') }}</p>
            </div>

            <div class="form-group">
              <label class="form-label font-bold">{{ labels.targetPriceLabel }} <span class="font-normal text-muted-foreground">({{ labels.optional }})</span></label>
              <div class="relative">
                <span class="absolute top-1/2 left-3 -translate-y-1/2 font-bold text-muted-foreground">EGP</span>
                <input v-model.number="form.target_price" type="number" step="0.01" min="0" class="form-input ps-14" :placeholder="labels.targetPricePlaceholder" @input="clearField('target_price')" />
              </div>
              <p v-if="fieldMessage('target_price')" class="form-error mt-2">{{ fieldMessage('target_price') }}</p>
            </div>
          </div>
        </div>

        <div v-show="step === 2" class="space-y-6">
          <h2 class="mb-4 border-b border-border pb-2 text-xl font-bold">{{ labels.detailsSectionTitle }}</h2>

          <div class="form-group">
            <label class="form-label font-bold">{{ labels.descriptionLabel }} <span class="text-destructive">*</span></label>
            <textarea v-model.trim="form.description" rows="5" class="form-input resize-none" :placeholder="labels.descriptionPlaceholder" required @input="clearField('description')" />
            <p v-if="fieldMessage('description')" class="form-error mt-2">{{ fieldMessage('description') }}</p>
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
                  aria-label="Remove image"
                  @click="removeImage"
                >
                  <span class="text-lg font-black leading-none">×</span>
                </button>
                <img :src="imagePreview" :alt="labels.previewAlt" class="h-56 w-full object-cover" />
              </div>
            </div>
          </div>
        </div>

        <div v-show="step === 3" class="space-y-6">
          <h2 class="mb-4 border-b border-border pb-2 text-xl font-bold">{{ labels.settingsSectionTitle }}</h2>

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
          <button v-if="step > 1" type="button" @click="step -= 1" class="btn-outline px-8 font-bold">
            {{ labels.back }}
          </button>
          <div v-else />

          <button v-if="step < 3" type="button" @click="nextStep" class="btn-primary px-8 font-bold">
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
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ChevronDown, ChevronLeft, CheckIcon, Loader2Icon, UploadCloud } from 'lucide-vue-next';
import { useNotificationStore } from '@/stores/notificationStore';
import { useRfqStore } from '@/stores/rfqStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { clearFieldError, getFieldErrorMessage } from '@/utils/errorHandler';
import { resolveLocalizedText } from '@/utils/localizedText';

const router = useRouter();
const { locale } = useI18n();
const notificationStore = useNotificationStore();
const rfqStore = useRfqStore();
const categoryStore = useCategoryStore();

const step = ref(1);
const submitting = ref(false);
const imageFile = ref(null);
const imagePreview = ref('');
const categoryMenuOpen = ref(false);
const priorityMenuOpen = ref(false);
const categoryMenuRef = ref(null);
const priorityMenuRef = ref(null);

const minDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];

const form = reactive({
  title: '',
  category_id: null,
  quantity: 1,
  target_price: null,
  lead_priority: 'MEDIUM',
  description: '',
  max_responders: 5,
  expiration_date: minDate
});

const localized = (ar, en) => (locale.value === 'ar' ? ar : en);

const labels = computed(() => ({
  pageTitle: localized('إنشاء طلب عرض سعر جديد', 'Create New RFQ'),
  pageSubtitle: localized('أرسل متطلباتك ليصل الطلب إلى الموردين المناسبين بعد مراجعة الإدارة.', 'Submit your requirements so the right suppliers receive them after admin review.'),
  coreSectionTitle: localized('المتطلبات الأساسية', 'Core Requirements'),
  detailsSectionTitle: localized('التفاصيل والمرفقات', 'Details & Attachments'),
  settingsSectionTitle: localized('إعدادات الطلب', 'RFQ Settings'),
  titleLabel: localized('ماذا تحتاج؟', 'What do you need?'),
  titlePlaceholder: localized('مثال: 50 متر سلك', 'e.g. 50 meters of cable'),
  categoryLabel: localized('الفئة', 'Category'),
  selectCategory: localized('اختر الفئة', 'Select category'),
  categoryHint: localized('سيتم توجيه الطلب تلقائيًا إلى الموردين المطابقين لهذه الفئة بعد المراجعة.', 'This RFQ will be routed automatically to matching suppliers after review.'),
  priorityLabel: localized('الأولوية', 'Priority'),
  priorityLow: localized('منخفضة', 'Low'),
  priorityMedium: localized('متوسطة', 'Medium'),
  priorityHigh: localized('مرتفعة', 'High'),
  quantityLabel: localized('الكمية المطلوبة', 'Required Quantity'),
  targetPriceLabel: localized('السعر المستهدف', 'Target Price'),
  targetPricePlaceholder: localized('مثال: 5000', 'e.g. 5000'),
  descriptionLabel: localized('الوصف التفصيلي', 'Detailed Description'),
  descriptionPlaceholder: localized('اشرح المواصفات والمواد والكمية وأي اشتراطات مهمة...', 'Describe specs, materials, quantity, and any important constraints...'),
  imageLabel: localized('صورة مرجعية', 'Reference Image'),
  optional: localized('اختياري', 'Optional'),
  uploadTitle: localized('ارفع صورة من جهازك', 'Upload an image from your device'),
  uploadHint: localized('الصيغ المدعومة: JPG, PNG, WEBP بحد أقصى 5MB', 'Supported formats: JPG, PNG, WEBP up to 5MB'),
  previewAlt: localized('معاينة الصورة المرفوعة', 'Uploaded image preview'),
  maxRespondersLabel: localized('أقصى عدد للردود', 'Maximum Responders'),
  maxRespondersHint: localized('يُستخدم لتحديد عدد الموردين الذين سيتنافسون على الطلب.', 'Used to limit how many suppliers can compete on this RFQ.'),
  expirationLabel: localized('تاريخ الانتهاء', 'Expiration Date'),
  back: localized('السابق', 'Back'),
  next: localized('التالي', 'Next'),
  submit: localized('إرسال الطلب', 'Submit RFQ'),
  coreValidation: localized('يرجى استكمال الحقول الأساسية المطلوبة.', 'Please complete the required core fields.'),
  descriptionValidation: localized('يرجى إضافة وصف واضح للطلب.', 'Please add a clear description.'),
  submitSuccess: localized('تم إرسال طلب العرض بنجاح وهو الآن بانتظار مراجعة الإدارة.', 'RFQ submitted successfully and is now awaiting admin review.'),
  submitError: localized('تعذر إرسال الطلب حاليًا.', 'Failed to submit RFQ right now.')
}));

const steps = computed(() => [
  { key: 'core', label: localized('الأساسيات', 'Core') },
  { key: 'details', label: localized('التفاصيل', 'Details') },
  { key: 'settings', label: localized('الإعدادات', 'Settings') }
]);

const categories = computed(() => categoryStore.categories);
const priorityOptions = computed(() => [
  { value: 'LOW', label: labels.value.priorityLow },
  { value: 'MEDIUM', label: labels.value.priorityMedium },
  { value: 'HIGH', label: labels.value.priorityHigh }
]);

const selectedCategoryLabel = computed(() => {
  const selected = categories.value.find((category) => category.id === form.category_id);
  if (!selected) return labels.value.selectCategory;
  return locale.value === 'ar' ? selected.name_ar : selected.name_en;
});

const selectedPriorityLabel = computed(() => {
  return priorityOptions.value.find((option) => option.value === form.lead_priority)?.label || labels.value.priorityMedium;
});

const fieldMessage = (field) => getFieldErrorMessage(rfqStore.fieldErrors, field, locale.value);
const clearField = (field) => clearFieldError(rfqStore.fieldErrors, field);

function handleImageChange(event) {
  const file = event.target.files?.[0] || null;
  imageFile.value = file;
  imagePreview.value = file ? URL.createObjectURL(file) : '';
}

function removeImage() {
  imageFile.value = null;
  imagePreview.value = '';
}

function selectCategory(categoryId) {
  form.category_id = categoryId;
  categoryMenuOpen.value = false;
}

function selectPriority(priority) {
  form.lead_priority = priority;
  priorityMenuOpen.value = false;
}

function handleOutsideClick(event) {
  if (categoryMenuRef.value && !categoryMenuRef.value.contains(event.target)) {
    categoryMenuOpen.value = false;
  }
  if (priorityMenuRef.value && !priorityMenuRef.value.contains(event.target)) {
    priorityMenuOpen.value = false;
  }
}

function nextStep() {
  if (step.value === 1 && (!form.title || !form.category_id || !form.quantity)) {
    notificationStore.warn(labels.value.coreValidation);
    return;
  }

  if (step.value === 2 && !form.description) {
    notificationStore.warn(labels.value.descriptionValidation);
    return;
  }

  step.value += 1;
}

async function submitForm() {
  submitting.value = true;
  try {
    const payload = new FormData();
    payload.append('title', form.title);
    payload.append('category_id', String(form.category_id));
    payload.append('quantity', String(form.quantity));
    payload.append('lead_priority', form.lead_priority);
    payload.append('description', form.description);
    payload.append('max_responders', String(form.max_responders));
    payload.append('expiration_time', `${form.expiration_date} 23:59:00`);

    if (form.target_price) {
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

onMounted(async () => {
  document.addEventListener('click', handleOutsideClick, true);
  await categoryStore.fetchCategories(true);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutsideClick, true);
});
</script>

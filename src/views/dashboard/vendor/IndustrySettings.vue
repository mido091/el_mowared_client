<template>
  <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div class="flex flex-col gap-2">
      <h1 class="text-3xl font-black text-foreground">{{ labels.pageTitle }}</h1>
      <p class="max-w-3xl text-sm leading-7 text-muted-foreground">{{ labels.pageSubtitle }}</p>
    </div>

    <div class="grid grid-cols-1 gap-5 md:grid-cols-3">
      <div class="rounded-[1.75rem] border border-border/60 bg-card/70 p-6 shadow-sm">
        <p class="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">{{ labels.currentCount }}</p>
        <p class="mt-3 text-3xl font-black text-foreground">{{ initialCategoryIds.length }}</p>
      </div>
      <div class="rounded-[1.75rem] border border-border/60 bg-card/70 p-6 shadow-sm">
        <p class="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">{{ labels.selectedCount }}</p>
        <p class="mt-3 text-3xl font-black text-foreground">{{ selectedCategoryIds.length }}</p>
      </div>
      <div class="rounded-[1.75rem] border border-border/60 bg-card/70 p-6 shadow-sm">
        <p class="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">{{ labels.changeState }}</p>
        <p class="mt-3 text-xl font-black" :class="hasChanges ? 'text-amber-600' : 'text-emerald-600'">
          {{ hasChanges ? labels.unsavedChanges : labels.savedState }}
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-8 xl:grid-cols-[1.15fr_0.85fr]">
      <section class="rounded-[2rem] border border-border/60 bg-card shadow-sm">
        <div class="border-b border-border/60 px-6 py-5">
          <h2 class="text-lg font-black text-foreground">{{ labels.manageTitle }}</h2>
          <p class="mt-1 text-sm text-muted-foreground">{{ labels.manageSubtitle }}</p>
        </div>

        <div v-if="loading" class="space-y-4 p-6">
          <div v-for="i in 4" :key="i" class="h-20 animate-pulse rounded-2xl bg-muted/40"></div>
        </div>

        <div v-else class="space-y-6 p-6">
          <div class="rounded-[1.75rem] border border-border/60 bg-muted/10 p-5">
            <div class="flex items-center gap-2">
              <Layers class="h-4 w-4 text-primary" />
              <h3 class="font-black text-foreground">{{ labels.selectorTitle }}</h3>
            </div>
            <p class="mt-2 text-sm text-muted-foreground">{{ labels.selectorSubtitle }}</p>

            <div class="mt-5">
              <CategoryMultiSelect
                v-model="selectedCategoryIds"
                :label="labels.selectorLabel"
                :placeholder="labels.selectorPlaceholder"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div class="rounded-[1.75rem] border border-border/60 bg-card/80 p-5">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <h3 class="font-black text-foreground">{{ labels.currentSectionsTitle }}</h3>
                  <p class="mt-1 text-sm text-muted-foreground">{{ labels.currentSectionsSubtitle }}</p>
                </div>
                <span class="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-primary">
                  {{ initialCategoryIds.length }}
                </span>
              </div>

              <div v-if="currentCategoryObjects.length" class="mt-5 flex flex-wrap gap-3">
                <button
                  v-for="category in currentCategoryObjects"
                  :key="`current-${category.id}`"
                  type="button"
                  @click="removeCategory(category.id)"
                  class="inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-muted/20 px-4 py-2 text-sm font-bold text-foreground transition-colors hover:bg-rose-50 hover:text-rose-600"
                >
                  <span>{{ category.name }}</span>
                  <X class="h-4 w-4" />
                </button>
              </div>
              <div v-else class="mt-5 rounded-2xl border border-dashed border-border/70 px-4 py-8 text-center text-sm text-muted-foreground">
                {{ labels.noSections }}
              </div>
            </div>

            <div class="rounded-[1.75rem] border border-border/60 bg-card/80 p-5">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <h3 class="font-black text-foreground">{{ labels.previewTitle }}</h3>
                  <p class="mt-1 text-sm text-muted-foreground">{{ labels.previewSubtitle }}</p>
                </div>
                <span class="rounded-full bg-secondary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-secondary">
                  {{ selectedCategoryIds.length }}
                </span>
              </div>

              <div v-if="selectedCategoryObjects.length" class="mt-5 flex flex-wrap gap-3">
                <div
                  v-for="category in selectedCategoryObjects"
                  :key="`selected-${category.id}`"
                  class="inline-flex items-center gap-2 rounded-2xl border border-secondary/20 bg-secondary/10 px-4 py-2 text-sm font-bold text-secondary"
                >
                  <Check class="h-4 w-4" />
                  <span>{{ category.name }}</span>
                </div>
              </div>
              <div v-else class="mt-5 rounded-2xl border border-dashed border-border/70 px-4 py-8 text-center text-sm text-muted-foreground">
                {{ labels.noSelectedSections }}
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-3 border-t border-border/60 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-sm text-muted-foreground">{{ labels.footerNote }}</p>
            <button
              @click="saveSections"
              :disabled="saving || !hasChanges || selectedCategoryIds.length === 0"
              class="btn-primary inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-8 font-black disabled:opacity-50"
            >
              <Loader2 v-if="saving" class="h-4 w-4 animate-spin" />
              <Save v-else class="h-4 w-4" />
              {{ labels.saveButton }}
            </button>
          </div>
        </div>
      </section>

      <section class="rounded-[2rem] border border-border/60 bg-card shadow-sm">
        <div class="border-b border-border/60 px-6 py-5">
          <h2 class="text-lg font-black text-foreground">{{ labels.guidanceTitle }}</h2>
          <p class="mt-1 text-sm text-muted-foreground">{{ labels.guidanceSubtitle }}</p>
        </div>

        <div class="space-y-4 p-6">
          <div class="rounded-[1.5rem] border border-border/60 bg-muted/10 p-5">
            <h3 class="font-black text-foreground">{{ labels.tipMatchTitle }}</h3>
            <p class="mt-2 text-sm leading-7 text-muted-foreground">{{ labels.tipMatchBody }}</p>
          </div>
          <div class="rounded-[1.5rem] border border-border/60 bg-muted/10 p-5">
            <h3 class="font-black text-foreground">{{ labels.tipQualityTitle }}</h3>
            <p class="mt-2 text-sm leading-7 text-muted-foreground">{{ labels.tipQualityBody }}</p>
          </div>
          <div class="rounded-[1.5rem] border border-border/60 bg-muted/10 p-5">
            <h3 class="font-black text-foreground">{{ labels.tipFlexibilityTitle }}</h3>
            <p class="mt-2 text-sm leading-7 text-muted-foreground">{{ labels.tipFlexibilityBody }}</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Check, Layers, Loader2, Save, X } from 'lucide-vue-next';
import api from '@/services/api';
import CategoryMultiSelect from '@/components/ui/CategoryMultiSelect.vue';
import { useCategoryStore } from '@/stores/categoryStore';
import { useUiStore } from '@/stores/ui';
import { normalizeError } from '@/utils/errorHandler';
import { useCategoryHierarchy } from '@/composables/useCategoryHierarchy';

const { locale } = useI18n();
const uiStore = useUiStore();
const categoryStore = useCategoryStore();

const loading = ref(true);
const saving = ref(false);
const vendorProfile = ref(null);
const selectedCategoryIds = ref([]);
const initialCategoryIds = ref([]);

const isArabic = computed(() => locale.value === 'ar');

const labels = computed(() => ({
  pageTitle: isArabic.value ? 'الأقسام' : 'Sections',
  pageSubtitle: isArabic.value
    ? 'أدر الأقسام التي يعمل بها حسابك حتى تصلك الفرص المطابقة فقط، وتظهر هويتك التجارية بشكل أوضح داخل المنصة.'
    : 'Manage the sections your business serves so you receive only matching opportunities and present your catalog more clearly.',
  currentCount: isArabic.value ? 'الأقسام الحالية' : 'Current Sections',
  selectedCount: isArabic.value ? 'الأقسام المحددة' : 'Selected Sections',
  changeState: isArabic.value ? 'حالة الحفظ' : 'Save State',
  unsavedChanges: isArabic.value ? 'تغييرات غير محفوظة' : 'Unsaved Changes',
  savedState: isArabic.value ? 'محفوظ' : 'Saved',
  manageTitle: isArabic.value ? 'إدارة الأقسام' : 'Manage Sections',
  manageSubtitle: isArabic.value
    ? 'يمكنك إضافة قسم جديد أو حذف أي قسم حالي، وسيتم حفظ التغييرات على ملف المورد مباشرة.'
    : 'Add new sections or remove existing ones, then save them directly to your vendor profile.',
  selectorTitle: isArabic.value ? 'اختيار الأقسام' : 'Section Selector',
  selectorSubtitle: isArabic.value
    ? 'اختر الأقسام التي تمثل نشاطك الفعلي. هذه الأقسام تؤثر على فرص RFQ التي تصلك.'
    : 'Choose the sections that truly represent your business activity. They directly affect the RFQs you receive.',
  selectorLabel: isArabic.value ? 'الأقسام المتاحة' : 'Available Sections',
  selectorPlaceholder: isArabic.value ? 'اختر قسمًا أو أكثر' : 'Select one or more sections',
  currentSectionsTitle: isArabic.value ? 'أقسامك الحالية' : 'Your Current Sections',
  currentSectionsSubtitle: isArabic.value ? 'اضغط على أي قسم لإزالته من الحساب.' : 'Click any section to remove it from your account.',
  previewTitle: isArabic.value ? 'المعاينة بعد الحفظ' : 'Saved Preview',
  previewSubtitle: isArabic.value ? 'هذه هي الأقسام التي ستظل مرتبطة بحسابك بعد الحفظ.' : 'These are the sections that will remain linked to your account after saving.',
  noSections: isArabic.value ? 'لا توجد أقسام مرتبطة بالحساب حاليًا.' : 'No sections are currently linked to this account.',
  noSelectedSections: isArabic.value ? 'لم يتم تحديد أي قسم بعد.' : 'No sections selected yet.',
  footerNote: isArabic.value
    ? 'يجب الاحتفاظ بقسم واحد على الأقل حتى يظل الملف التجاري مرتبطًا بنشاط واضح.'
    : 'Keep at least one section selected so the business profile stays mapped to a clear activity.',
  saveButton: isArabic.value ? 'حفظ الأقسام' : 'Save Sections',
  loadError: isArabic.value ? 'تعذر تحميل بيانات الأقسام الحالية.' : 'Failed to load current sections.',
  saveSuccess: isArabic.value ? 'تم تحديث الأقسام بنجاح.' : 'Sections updated successfully.',
  saveError: isArabic.value ? 'تعذر تحديث الأقسام.' : 'Failed to update sections.',
  guidanceTitle: isArabic.value ? 'كيف تؤثر الأقسام؟' : 'How Sections Affect Matching',
  guidanceSubtitle: isArabic.value ? 'ملاحظات مهمة قبل الحفظ.' : 'Important guidance before saving.',
  tipMatchTitle: isArabic.value ? 'استقبال الفرص المطابقة' : 'Matching Opportunities',
  tipMatchBody: isArabic.value
    ? 'طلبات RFQ تصل إلى الموردين حسب القسم المطابق مباشرة، لذلك اختيار الأقسام الصحيحة يساعدك على استقبال فرص أكثر دقة.'
    : 'RFQs are delivered to vendors by exact section match, so choosing the right sections gives you cleaner, more relevant opportunities.',
  tipQualityTitle: isArabic.value ? 'تحسين جودة الظهور' : 'Sharper Marketplace Positioning',
  tipQualityBody: isArabic.value
    ? 'كلما كانت الأقسام مرتبطة بنشاطك الحقيقي ومنتجاتك الفعلية، أصبح ظهورك داخل المنصة أكثر احترافية للمشترين.'
    : 'The closer your selected sections are to your real products and operations, the stronger and more credible your marketplace positioning becomes.',
  tipFlexibilityTitle: isArabic.value ? 'يمكنك العمل بأكثر من قسم' : 'Multi-Section Support',
  tipFlexibilityBody: isArabic.value
    ? 'إذا كان نشاطك يغطي أكثر من مجال، يمكنك الاحتفاظ بأكثر من قسم في نفس الوقت دون أي مشكلة.'
    : 'If your business spans multiple lines, you can keep more than one section linked to your account without any issue.'
}));

const allCategories = computed(() => categoryStore.localizedCategories(locale.value));
const { getCategoryPathLabel } = useCategoryHierarchy(allCategories, locale);

const getCategoryName = (id) => {
  return getCategoryPathLabel(id) || `#${id}`;
};

const selectedCategoryObjects = computed(() =>
  selectedCategoryIds.value.map((id) => ({ id, name: getCategoryName(id) }))
);

const currentCategoryObjects = computed(() =>
  initialCategoryIds.value.map((id) => ({ id, name: getCategoryName(id) }))
);

const hasChanges = computed(() => {
  if (selectedCategoryIds.value.length !== initialCategoryIds.value.length) return true;
  const current = [...selectedCategoryIds.value].sort((a, b) => a - b);
  const initial = [...initialCategoryIds.value].sort((a, b) => a - b);
  return current.some((id, index) => Number(id) !== Number(initial[index]));
});

const removeCategory = (categoryId) => {
  selectedCategoryIds.value = selectedCategoryIds.value.filter((id) => Number(id) !== Number(categoryId));
};

const normalizeProfile = (payload) => {
  const vendor = payload?.vendor || payload;
  if (!vendor) return null;
  return {
    ...vendor,
    companyNameAr: vendor.company_name_ar || vendor.companyNameAr || '',
    companyNameEn: vendor.company_name_en || vendor.companyNameEn || '',
    bioAr: vendor.bio_ar || vendor.bioAr || null,
    bioEn: vendor.bio_en || vendor.bioEn || null,
    location: vendor.location || null,
    categories: Array.isArray(vendor.categories) ? vendor.categories : []
  };
};

const fetchProfile = async () => {
  loading.value = true;
  try {
    await categoryStore.fetchCategories({ mode: 'revalidate' });
    const response = await api.get('/vendor/me');
    vendorProfile.value = normalizeProfile(response?.data || response);

    const categoryIds = (vendorProfile.value?.categories || []).map((category) => Number(category.id));
    selectedCategoryIds.value = [...categoryIds];
    initialCategoryIds.value = [...categoryIds];
  } catch (error) {
    uiStore.showToast(normalizeError(error).message || labels.value.loadError, 'error');
  } finally {
    loading.value = false;
  }
};

const saveSections = async () => {
  if (!vendorProfile.value || selectedCategoryIds.value.length === 0) return;

  saving.value = true;
  try {
    const payload = {
      companyNameAr: vendorProfile.value.companyNameAr,
      companyNameEn: vendorProfile.value.companyNameEn,
      bioAr: vendorProfile.value.bioAr,
      bioEn: vendorProfile.value.bioEn,
      location: vendorProfile.value.location,
      categoryIds: selectedCategoryIds.value.map(Number)
    };

    const response = await api.patch('/vendor/me', payload);
    vendorProfile.value = normalizeProfile(response?.data || response) || vendorProfile.value;
    initialCategoryIds.value = [...selectedCategoryIds.value];
    uiStore.showToast(labels.value.saveSuccess, 'success');
  } catch (error) {
    uiStore.showToast(normalizeError(error).message || labels.value.saveError, 'error');
  } finally {
    saving.value = false;
  }
};

onMounted(fetchProfile);
</script>

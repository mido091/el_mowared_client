<template>
  <div class="space-y-8">
    <div class="rounded-[2.2rem] border border-border/60 bg-card overflow-hidden">
      <div class="bg-gradient-to-r from-primary to-secondary p-8 text-white">
        <p class="text-[10px] font-bold uppercase tracking-[0.24em] text-white/70">{{ headerLabel }}</p>
        <div class="mt-5 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div class="flex items-center gap-5">
            <div class="flex h-24 w-24 items-center justify-center overflow-hidden rounded-[1.8rem] border border-white/15 bg-white/10 text-2xl font-black">
              <img v-if="logo" :src="logo" :alt="companyName" class="h-full w-full object-cover" />
              <span v-else>{{ initials }}</span>
            </div>
            <div>
              <h1 class="text-3xl font-black">{{ companyName }}</h1>
              <p class="mt-2 text-sm text-white/80">{{ verificationText }}</p>
            </div>
          </div>
          <button class="btn bg-white text-primary hover:bg-white/90 border-0">
            {{ editLabel }}
          </button>
        </div>
      </div>
    </div>

    <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      <div class="rounded-[1.6rem] border border-border/60 bg-card p-5">
        <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{{ locationLabel }}</p>
        <p class="mt-3 text-lg font-black text-foreground">{{ company.location || noDataLabel }}</p>
      </div>
      <div class="rounded-[1.6rem] border border-border/60 bg-card p-5">
        <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{{ categoriesLabel }}</p>
        <p class="mt-3 text-lg font-black text-foreground">{{ categoriesCount }}</p>
      </div>
      <div class="rounded-[1.6rem] border border-border/60 bg-card p-5">
        <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{{ ratingLabel }}</p>
        <p class="mt-3 text-lg font-black text-foreground">{{ rating }}</p>
      </div>
      <div class="rounded-[1.6rem] border border-border/60 bg-card p-5">
        <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{{ activeProductsLabel }}</p>
        <p class="mt-3 text-lg font-black text-foreground">{{ profileStore.verification.activeProducts || 0 }}</p>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div class="rounded-[1.8rem] border border-border/60 bg-card p-6">
        <h2 class="text-xl font-black text-foreground">{{ overviewTitle }}</h2>
        <p class="mt-4 whitespace-pre-wrap text-sm leading-8 text-muted-foreground">{{ companyBio }}</p>
      </div>

      <div class="rounded-[1.8rem] border border-border/60 bg-card p-6">
        <h2 class="text-xl font-black text-foreground">{{ contactTitle }}</h2>
        <div class="mt-6 space-y-4">
          <div class="rounded-2xl border border-border/50 bg-muted/10 px-4 py-4">
            <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{{ emailLabel }}</p>
            <p class="mt-2 text-sm font-black text-foreground break-all">{{ company.email || noDataLabel }}</p>
          </div>
          <div class="rounded-2xl border border-border/50 bg-muted/10 px-4 py-4">
            <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{{ phoneLabel }}</p>
            <p class="mt-2 text-sm font-black text-foreground">{{ company.phone || noDataLabel }}</p>
          </div>
          <div class="rounded-2xl border border-border/50 bg-muted/10 px-4 py-4">
            <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{{ sectionsTitle }}</p>
            <div class="mt-3 flex flex-wrap gap-2">
              <span
                v-for="category in displayCategories"
                :key="category.id || category.name"
                class="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary"
              >
                {{ category.name }}
              </span>
              <span v-if="!categories.length" class="text-sm text-muted-foreground">{{ noDataLabel }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCategoryStore } from '@/stores/categoryStore';
import { useVendorProfileStore } from '@/stores/vendorProfileStore';

const { locale } = useI18n();
const profileStore = useVendorProfileStore();
const categoryStore = useCategoryStore();

const company = computed(() => profileStore.company || {});
const categories = computed(() => Array.isArray(company.value.categories) ? company.value.categories : []);
const displayCategories = computed(() =>
  categories.value
    .map((category) => {
      const liveCategory = category?.id ? categoryStore.getCategoryById(Number(category.id)) : null;
      if (category?.id && categoryStore.lastFetched && !liveCategory) {
        return null;
      }
      const source = liveCategory || category;
      return {
        id: category?.id || liveCategory?.id || null,
        name: categoryStore.localizedCategoryName(source, locale.value) || source?.name || '',
      };
    })
    .filter((category) => category?.name)
);
const logo = computed(() => company.value.logo || company.value.logo_url || '');
const companyName = computed(() => company.value.company_name || company.value.company_name_ar || company.value.company_name_en || (locale.value === 'ar' ? 'شركة المورد' : 'Vendor company'));
const initials = computed(() => companyName.value.slice(0, 2).toUpperCase());
const companyBio = computed(() => company.value.about || company.value.bio_ar || company.value.bio_en || (locale.value === 'ar' ? 'لا يوجد وصف متاح حتى الآن.' : 'No company description available yet.'));
const categoriesCount = computed(() => displayCategories.value.length);
const rating = computed(() => Number(profileStore.verification.rating || 0).toFixed(1));

const headerLabel = computed(() => (locale.value === 'ar' ? 'ملف الشركة' : 'Company profile'));
const editLabel = computed(() => (locale.value === 'ar' ? 'تعديل الملف' : 'Edit profile'));
const locationLabel = computed(() => (locale.value === 'ar' ? 'الموقع' : 'Location'));
const categoriesLabel = computed(() => (locale.value === 'ar' ? 'عدد الأقسام' : 'Categories count'));
const ratingLabel = computed(() => (locale.value === 'ar' ? 'التقييم' : 'Rating'));
const activeProductsLabel = computed(() => (locale.value === 'ar' ? 'المنتجات النشطة' : 'Active products'));
const overviewTitle = computed(() => (locale.value === 'ar' ? 'نبذة الشركة' : 'Company overview'));
const contactTitle = computed(() => (locale.value === 'ar' ? 'بيانات التواصل' : 'Contact details'));
const emailLabel = computed(() => (locale.value === 'ar' ? 'البريد الإلكتروني' : 'Email'));
const phoneLabel = computed(() => (locale.value === 'ar' ? 'الهاتف' : 'Phone'));
const sectionsTitle = computed(() => (locale.value === 'ar' ? 'الأقسام الحالية' : 'Current sections'));
const noDataLabel = computed(() => (locale.value === 'ar' ? 'لا توجد بيانات بعد' : 'No data yet'));
const verificationText = computed(() => {
  const status = String(profileStore.verification.status || '').toLowerCase();
  if (locale.value === 'ar') {
    if (status === 'approved' || status === 'verified') return 'الحساب موثق';
    if (status === 'rejected') return 'الحساب مرفوض';
    return 'الحساب قيد المراجعة';
  }
  if (status === 'approved' || status === 'verified') return 'Account verified';
  if (status === 'rejected') return 'Account rejected';
  return 'Account under review';
});

onMounted(async () => {
  await Promise.allSettled([
    profileStore.fetchProfile(),
    categoryStore.fetchCategories({ mode: 'revalidate' }),
  ]);
});
</script>

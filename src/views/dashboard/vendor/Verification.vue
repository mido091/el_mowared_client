<template>
  <div class="space-y-8">
    <div :class="bannerClass" class="rounded-[2.25rem] p-8 md:p-10 text-white">
      <p class="text-[10px] font-bold uppercase tracking-[0.24em] text-white/70">{{ statusLabel }}</p>
      <div class="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div class="max-w-2xl">
          <h1 class="text-3xl md:text-4xl font-black">{{ headline }}</h1>
          <p class="mt-3 text-sm md:text-base text-white/80 leading-7">{{ description }}</p>
        </div>

        <div class="rounded-[1.8rem] border border-white/15 bg-white/10 px-8 py-6 text-center backdrop-blur">
          <p class="text-[10px] font-bold uppercase tracking-[0.22em] text-white/70">{{ trustIndexLabel }}</p>
          <p class="mt-2 text-5xl font-black">{{ Math.round(profileStore.verification.score || 0) }}</p>
        </div>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-4">
      <div class="rounded-[1.6rem] border border-border/60 bg-card p-5">
        <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{{ activeProductsLabel }}</p>
        <p class="mt-3 text-3xl font-black text-foreground">{{ profileStore.verification.activeProducts || 0 }}</p>
      </div>
      <div class="rounded-[1.6rem] border border-border/60 bg-card p-5">
        <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{{ ratingLabel }}</p>
        <p class="mt-3 text-3xl font-black text-foreground">{{ Number(profileStore.verification.rating || 0).toFixed(1) }}</p>
      </div>
      <div class="rounded-[1.6rem] border border-border/60 bg-card p-5">
        <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{{ responseRateLabel }}</p>
        <p class="mt-3 text-3xl font-black text-foreground">{{ Math.round(profileStore.verification.responseRate || 0) }}%</p>
      </div>
      <div class="rounded-[1.6rem] border border-border/60 bg-card p-5">
        <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{{ completedDealsLabel }}</p>
        <p class="mt-3 text-3xl font-black text-foreground">{{ profileStore.verification.completedDeals || 0 }}</p>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div class="rounded-[1.8rem] border border-border/60 bg-card p-6">
        <h2 class="text-xl font-black text-foreground">{{ checklistTitle }}</h2>
        <div class="mt-6 space-y-4">
          <div v-for="item in checklist" :key="item.key" class="flex items-start gap-4 rounded-2xl border border-border/50 bg-muted/10 px-4 py-4">
            <div :class="item.ready ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'" class="flex h-10 w-10 items-center justify-center rounded-xl shrink-0">
              <CheckCircle2 v-if="item.ready" class="w-5 h-5" />
              <Clock3 v-else class="w-5 h-5" />
            </div>
            <div class="min-w-0">
              <p class="text-sm font-black text-foreground">{{ item.title }}</p>
              <p class="mt-1 text-sm text-muted-foreground leading-6">{{ item.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-[1.8rem] border border-border/60 bg-card p-6">
        <h2 class="text-xl font-black text-foreground">{{ summaryTitle }}</h2>
        <div class="mt-6 space-y-4">
          <div class="rounded-2xl border border-border/50 bg-muted/10 px-4 py-4">
            <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{{ avgResponseTimeLabel }}</p>
            <p class="mt-2 text-lg font-black text-foreground">{{ profileStore.verification.averageResponseTimeLabel || noDataLabel }}</p>
          </div>
          <div class="rounded-2xl border border-border/50 bg-muted/10 px-4 py-4">
            <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{{ reviewCountLabel }}</p>
            <p class="mt-2 text-lg font-black text-foreground">{{ profileStore.verification.reviewCount || 0 }}</p>
          </div>
          <div class="rounded-2xl border border-border/50 bg-muted/10 px-4 py-4">
            <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{{ verificationStateLabel }}</p>
            <p class="mt-2 text-lg font-black text-foreground">{{ humanStatus }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { CheckCircle2, Clock3 } from 'lucide-vue-next';
import { useVendorProfileStore } from '@/stores/vendorProfileStore';

const { locale } = useI18n();
const profileStore = useVendorProfileStore();

const isVerified = computed(() => ['approved', 'verified'].includes(String(profileStore.verification.status || '').toLowerCase()));

const bannerClass = computed(() => isVerified.value
  ? 'bg-gradient-to-br from-emerald-500 to-emerald-700'
  : 'bg-gradient-to-br from-amber-500 to-orange-600');

const statusLabel = computed(() => locale.value === 'ar' ? 'حالة التوثيق' : 'Verification status');
const trustIndexLabel = computed(() => locale.value === 'ar' ? 'مؤشر الثقة' : 'Trust index');
const headline = computed(() => {
  if (locale.value === 'ar') {
    return isVerified.value ? 'حسابك موثق وجاهز للعمل بثقة أعلى' : 'حسابك ما زال قيد الاستكمال والمراجعة';
  }
  return isVerified.value ? 'Your account is verified and ready for trusted trading' : 'Your account is still being completed and reviewed';
});
const description = computed(() => {
  if (locale.value === 'ar') {
    return isVerified.value
      ? 'البيانات المعروضة هنا مبنية على نشاطك الحقيقي داخل المنصة: تقييمات، استجابة، صفقات مكتملة، ومنتجات نشطة.'
      : 'أكمل بيانات الشركة وارفع جودة نشاطك داخل المنصة لرفع مؤشر الثقة وتحسين ظهورك أمام المشترين.';
  }
  return isVerified.value
    ? 'The values shown here are built from your real marketplace activity: ratings, response rate, completed deals, and active products.'
    : 'Complete your company data and improve your real marketplace activity to increase trust and visibility.';
});
const activeProductsLabel = computed(() => (locale.value === 'ar' ? 'المنتجات النشطة' : 'Active products'));
const ratingLabel = computed(() => (locale.value === 'ar' ? 'التقييم' : 'Rating'));
const responseRateLabel = computed(() => (locale.value === 'ar' ? 'معدل الاستجابة' : 'Response rate'));
const completedDealsLabel = computed(() => (locale.value === 'ar' ? 'الصفقات المكتملة' : 'Completed deals'));
const checklistTitle = computed(() => (locale.value === 'ar' ? 'قائمة الجاهزية' : 'Readiness checklist'));
const summaryTitle = computed(() => (locale.value === 'ar' ? 'ملخص التوثيق' : 'Verification summary'));
const avgResponseTimeLabel = computed(() => (locale.value === 'ar' ? 'متوسط زمن الاستجابة' : 'Average response time'));
const reviewCountLabel = computed(() => (locale.value === 'ar' ? 'عدد المراجعات' : 'Review count'));
const verificationStateLabel = computed(() => (locale.value === 'ar' ? 'الحالة الحالية' : 'Current status'));
const noDataLabel = computed(() => (locale.value === 'ar' ? 'لا توجد بيانات بعد' : 'No data yet'));

const humanStatus = computed(() => {
  const status = String(profileStore.verification.status || '').toLowerCase();
  if (locale.value === 'ar') {
    if (status === 'approved' || status === 'verified') return 'موثق';
    if (status === 'rejected') return 'مرفوض';
    return 'قيد المراجعة';
  }
  if (status === 'approved' || status === 'verified') return 'Verified';
  if (status === 'rejected') return 'Rejected';
  return 'Pending review';
});

const checklist = computed(() => {
  const company = profileStore.company || {};
  return [
    {
      key: 'company_name',
      ready: Boolean(company.company_name_ar || company.company_name_en || company.company_name),
      title: locale.value === 'ar' ? 'اسم الشركة' : 'Company identity',
      description: locale.value === 'ar' ? 'وجود اسم شركة واضح ومعتمد.' : 'A clear approved company identity is available.'
    },
    {
      key: 'bio',
      ready: Boolean(company.bio_ar || company.bio_en || company.about),
      title: locale.value === 'ar' ? 'وصف الشركة' : 'Company profile',
      description: locale.value === 'ar' ? 'تمت إضافة وصف مهني يوضح النشاط والخبرة.' : 'A professional description explains business activity and expertise.'
    },
    {
      key: 'categories',
      ready: Array.isArray(company.categories) && company.categories.length > 0,
      title: locale.value === 'ar' ? 'الأقسام' : 'Categories',
      description: locale.value === 'ar' ? 'تم تحديد أقسام العمل التي يتبع لها المورد.' : 'Business categories are mapped for this vendor.'
    },
    {
      key: 'activity',
      ready: Number(profileStore.verification.activeProducts || 0) > 0 || Number(profileStore.verification.completedDeals || 0) > 0,
      title: locale.value === 'ar' ? 'نشاط حقيقي' : 'Live activity',
      description: locale.value === 'ar' ? 'هناك منتجات أو صفقات فعلية مسجلة في النظام.' : 'There are real products or completed deals recorded in the system.'
    }
  ];
});

onMounted(profileStore.fetchProfile);
</script>

<template>
  <div class="container-narrow py-12 md:py-16">
    <div class="mx-auto grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-[1.05fr,0.95fr]">
      <section class="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-slate-900">
        <p class="text-[11px] font-bold uppercase tracking-[0.24em] text-primary">
          {{ locale === 'ar' ? 'الدعم والمبيعات' : 'Support & Sales' }}
        </p>
        <h1 class="mt-3 text-3xl font-black text-foreground md:text-4xl">
          {{ t('common.contactUs') || 'Contact Us' }}
        </h1>
        <p class="mt-4 text-sm leading-7 text-muted-foreground md:text-base">
          {{ locale === 'ar'
            ? 'أرسل رسالتك وسيتابع معك فريق المورد. ويمكن للإدارة أيضًا تحويل الطلب إلى محادثة دعم مباشرة عند الحاجة.'
            : 'Send your request and the Elmowared team will follow up with you. Admins can also convert it into a live support chat when needed.' }}
        </p>

        <div class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70">
            <p class="text-xs font-bold text-slate-500">{{ locale === 'ar' ? 'دعم مباشر' : 'Live Support' }}</p>
            <p class="mt-2 text-sm font-semibold text-foreground">{{ locale === 'ar' ? 'عبر نافذة الدعم العائمة' : 'Via floating support widget' }}</p>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70">
            <p class="text-xs font-bold text-slate-500">{{ locale === 'ar' ? 'بريد إلكتروني' : 'Email Follow-up' }}</p>
            <p class="mt-2 text-sm font-semibold text-foreground">{{ locale === 'ar' ? 'تأكيد واستلام آمن للطلب' : 'Tracked and stored safely' }}</p>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70">
            <p class="text-xs font-bold text-slate-500">{{ locale === 'ar' ? 'تحويل داخلي' : 'Admin Conversion' }}</p>
            <p class="mt-2 text-sm font-semibold text-foreground">{{ locale === 'ar' ? 'تحويل الرسالة إلى محادثة دعم مباشرة' : 'Convert message into support chat' }}</p>
          </div>
        </div>
      </section>

      <section class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-slate-900 md:p-8">
        <form class="space-y-4" @submit.prevent="submit">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div class="form-group">
              <label class="form-label">{{ t('common.name') || 'Name' }}</label>
              <input v-model="form.name" type="text" required class="form-input" @input="clearField('name')" />
              <p v-if="fieldMessage('name')" class="form-error mt-2">{{ fieldMessage('name') }}</p>
            </div>
            <div class="form-group">
              <label class="form-label">{{ t('common.email') || 'Email' }}</label>
              <input v-model="form.email" type="email" required class="form-input" @input="clearField('email')" />
              <p v-if="fieldMessage('email')" class="form-error mt-2">{{ fieldMessage('email') }}</p>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">{{ locale === 'ar' ? 'رقم الهاتف (اختياري)' : 'Phone (Optional)' }}</label>
            <input v-model="form.phone" type="tel" class="form-input" @input="clearField('phone')" />
            <p v-if="fieldMessage('phone')" class="form-error mt-2">{{ fieldMessage('phone') }}</p>
          </div>

          <div class="form-group">
            <label class="form-label">{{ t('common.message') || 'Message' }}</label>
            <textarea v-model="form.message" required rows="6" class="form-input resize-none" @input="clearField('message')"></textarea>
            <p v-if="fieldMessage('message')" class="form-error mt-2">{{ fieldMessage('message') }}</p>
          </div>

          <div v-if="submitError" class="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {{ submitError }}
          </div>

          <button type="submit" :disabled="loading" class="btn-primary w-full justify-center">
            <Loader2 v-if="loading" class="h-4 w-4 animate-spin" />
            <span v-else>{{ locale === 'ar' ? 'إرسال الرسالة' : 'Send Message' }}</span>
          </button>
        </form>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Loader2 } from 'lucide-vue-next';
import { useNotificationStore } from '@/stores/notificationStore';
import api from '@/services/api';
import { useSeo } from '@/composables/useSeo';
import { clearFieldError, getFieldErrorMessage, normalizeError } from '@/utils/errorHandler';
import { resolveLocalizedText } from '@/utils/localizedText';

const { t, locale } = useI18n();
const router = useRouter();
const notificationStore = useNotificationStore();

const form = ref({
  name: '',
  email: '',
  phone: '',
  message: ''
});
const loading = ref(false);
const fieldErrors = ref({});
const submitError = ref('');

const fieldMessage = (field) => getFieldErrorMessage(fieldErrors.value, field, locale.value);
const clearField = (field) => {
  clearFieldError(fieldErrors.value, field);
  if (submitError.value) submitError.value = '';
};

useSeo(() => ({
  title: locale.value === 'ar' ? 'تواصل معنا | Elmowared' : 'Contact Us | Elmowared',
  description: locale.value === 'ar'
    ? 'تواصل مع فريق Elmowared للدعم والاستفسارات التجارية ومتابعة طلباتك ورسائلك.'
    : 'Contact the Elmowared team for support, sales questions, and procurement follow-up.',
  canonical: '/contact-us',
  ogType: 'website',
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: locale.value === 'ar' ? 'تواصل معنا' : 'Contact Us',
      url: `${window.location.origin}/contact-us`,
      description: locale.value === 'ar'
        ? 'صفحة التواصل الرسمية لمنصة Elmowared.'
        : 'Official contact page for Elmowared.'
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: locale.value === 'ar' ? 'الرئيسية' : 'Home',
          item: `${window.location.origin}/`
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: locale.value === 'ar' ? 'تواصل معنا' : 'Contact Us',
          item: `${window.location.origin}/contact-us`
        }
      ]
    }
  ]
}));

async function submit() {
  loading.value = true;
  fieldErrors.value = {};
  submitError.value = '';

  try {
    await api.post('/contact', form.value, { errorMode: 'inline' });
    notificationStore.success({
      en: 'Your message has been sent successfully. The team will contact you shortly.',
      ar: 'تم إرسال رسالتك بنجاح، وسيتواصل معك الفريق قريبًا.'
    });
    router.push('/');
  } catch (error) {
    const normalized = normalizeError(error);
    fieldErrors.value = normalized.fields;
    submitError.value = resolveLocalizedText(normalized.message, locale.value);
  } finally {
    loading.value = false;
  }
}
</script>

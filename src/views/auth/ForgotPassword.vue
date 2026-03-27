<template>
  <div class="min-h-screen flex flex-col justify-center py-10">
    <div class="mb-8 text-center max-w-sm mx-auto">
      <div class="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary/20">
        <Key class="w-8 h-8 text-primary" />
      </div>
      <h2 class="text-2xl font-black text-foreground mb-2">{{ t('auth.forgotPasswordTitle') }}</h2>
      <p class="text-sm text-muted-foreground">{{ t('auth.forgotPasswordDesc') }}</p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6 max-w-sm w-full mx-auto">
      <!-- Email -->
      <div class="form-group">
        <label class="form-label">{{ t('auth.email') }}</label>
        <div class="relative">
          <Mail class="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            v-model="email"
            type="email"
            :placeholder="t('auth.emailPlaceholder')"
            class="form-input !pe-10 !ps-10 text-center text-lg tracking-wide"
            required
            autocomplete="email"
            :disabled="authStore.loading"
            @input="clearError('email')"
          />
        </div>
        <p v-if="fieldMessage('email')" class="form-error">{{ fieldMessage('email') }}</p>
      </div>

      <!-- Error -->
      <div v-if="authStore.error" class="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
        <AlertCircle class="w-4 h-4 shrink-0" />
        {{ resolveLocalizedText(authStore.error, locale) }}
      </div>

      <!-- Submit -->
      <button
        type="submit"
        :disabled="authStore.loading || !email"
        class="btn-primary w-full h-12 text-base font-bold"
      >
        <svg v-if="authStore.loading" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        <span v-else>{{ t('auth.sendCode') }}</span>
      </button>

      <div class="text-center mt-6">
        <router-link to="/login" class="text-sm font-semibold text-muted-foreground hover:text-foreground inline-flex items-center gap-2 transition-colors">
          <ArrowLeft class="w-4 h-4 rtl:rotate-180" />
          {{ t('common.cancel') }}
        </router-link>
      </div>
    </form>

    <!-- OTP Modal Verification -->
    <OtpModal 
      v-model="showOtpModal"
      :email="email"
      type="PASSWORD_RESET"
      @verified="onOtpVerified"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Mail, Key, AlertCircle, ArrowLeft } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import OtpModal from '@/components/auth/OtpModal.vue';
import { clearFieldError, getFieldErrorMessage } from '@/utils/errorHandler';
import { resolveLocalizedText } from '@/utils/localizedText';

const { t, locale } = useI18n();
const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const showOtpModal = ref(false);

const fieldMessage = (field) => getFieldErrorMessage(authStore.fieldErrors, field, locale.value);
const clearError = (field) => clearFieldError(authStore.fieldErrors, field);

const handleSubmit = async () => {
  if (!email.value) return;
  authStore.error = null;
  
  try {
    // Send password reset OTP
    await authStore.forgotPassword(email.value);
    // Open verification modal
    showOtpModal.value = true;
  } catch (err) {
    // Error is set in store
  }
};

const onOtpVerified = (resetToken) => {
  showOtpModal.value = false;
  // Route to the new password page, passing the token via query param
  router.push({ path: '/reset-password', query: { token: resetToken } });
};
</script>

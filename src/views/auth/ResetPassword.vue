<template>
  <div class="min-h-screen flex flex-col justify-center py-10">
    <div class="mb-8 text-center max-w-sm mx-auto">
      <div class="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-green-500/20">
        <ShieldCheck class="w-8 h-8 text-green-600 dark:text-green-500" />
      </div>
      <h2 class="text-2xl font-black text-foreground mb-2">{{ t('auth.resetPasswordTitle') }}</h2>
      <p class="text-sm text-muted-foreground">{{ t('auth.resetPasswordDesc') }}</p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-5 max-w-sm w-full mx-auto">
      <!-- New Password -->
      <div class="form-group">
        <label class="form-label">{{ t('auth.newPassword') }}</label>
        <div class="relative">
          <Lock class="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            v-model="form.password"
            :type="showPass ? 'text' : 'password'"
            :placeholder="t('auth.passwordPlaceholder')"
            class="form-input !pe-10 !ps-10"
            required
            minlength="8"
            @input="clearError('password')"
          />
          <button type="button" @click="showPass = !showPass" class="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
            <Eye v-if="!showPass" class="w-4 h-4" />
            <EyeOff v-else        class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Confirm Password -->
      <div class="form-group">
        <label class="form-label">{{ t('auth.confirmNewPassword') }}</label>
        <div class="relative">
          <Lock class="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            v-model="form.confirm"
            :type="showPass ? 'text' : 'password'"
            class="form-input !pe-10 !ps-10"
            required
            @input="clearError('confirm')"
          />
        </div>
        <p v-if="fieldMessage('confirm') || fieldMessage('newPassword') || error" class="form-error mt-2">{{ fieldMessage('confirm') || fieldMessage('newPassword') || error }}</p>
      </div>

      <!-- Global Error from Store -->
      <div v-if="authStore.error" class="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
        {{ resolveLocalizedText(authStore.error, locale) }}
      </div>

      <!-- Submit -->
      <button
        type="submit"
        :disabled="authStore.loading || !form.password || !form.confirm"
        class="btn-primary w-full h-12 text-base font-bold mt-4"
      >
        <svg v-if="authStore.loading" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        <span v-else>{{ t('common.saveChanges') }}</span>
      </button>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { clearFieldError, getFieldErrorMessage } from '@/utils/errorHandler';
import { resolveLocalizedText } from '@/utils/localizedText';

const { t, locale } = useI18n();
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const form = reactive({ password: '', confirm: '' });
const showPass = ref(false);
const error = ref('');
const token = ref('');

const fieldMessage = (field) => getFieldErrorMessage(authStore.fieldErrors, field, locale.value);
const clearError = (field) => clearFieldError(authStore.fieldErrors, field);

onMounted(() => {
  if (!route.query.token) {
    // No token provided, redirect to forgot-password flow
    router.replace('/forgot-password');
  } else {
    token.value = route.query.token;
  }
});

const handleSubmit = async () => {
  error.value = '';
  authStore.error = null;

  if (form.password !== form.confirm) {
    error.value = t('auth.passwordMismatch');
    return;
  }
  
  if (form.password.length < 8) {
    error.value = t('auth.errorPasswordMin');
    return;
  }

  try {
    await authStore.resetPassword(token.value, form.password);
    
    // Show success & redirect
    // A proper UI would probably show a toast here, we'll route to login with a query param
    router.push({ path: '/login', query: { reset: 'success' } });
  } catch (err) {
    // Handled in store
  }
};
</script>

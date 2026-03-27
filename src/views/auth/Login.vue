<template>
  <div class="min-h-screen flex flex-col justify-center py-10">
    <div class="mb-8">
      <h2 class="text-2xl font-black text-foreground mb-1">{{ t('auth.loginTitle') }}</h2>
      <p class="text-sm text-muted-foreground flex items-center gap-1">
        <span>{{ t('auth.noAccount') }}</span>
        <router-link to="/register" class="text-secondary font-semibold hover:underline">
          {{ t('auth.joinFree') }}
        </router-link>
      </p>
    </div>

    <form @submit.prevent="handleLogin" class="space-y-5">
      <!-- Email -->
      <div class="form-group">
        <label class="form-label">{{ t('auth.email') }}</label>
        <div class="relative">
          <Mail class="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            v-model="form.email"
            type="email"
            :placeholder="t('auth.emailPlaceholder')"
            class="form-input !pe-10 !ps-10"
            required
            autocomplete="email"
            @input="clearError('email')"
          />
        </div>
        <p v-if="fieldMessage('email')" class="form-error">{{ fieldMessage('email') }}</p>
      </div>

      <!-- Password -->
      <div class="form-group">
        <div class="flex items-center justify-between mb-2">
          <label class="form-label mb-0">{{ t('auth.password') }}</label>
          <router-link to="/forgot-password" class="text-xs font-semibold text-secondary hover:underline transition-colors" tabindex="-1">
            {{ t('auth.forgotPassword') }}
          </router-link>
        </div>
        <div class="relative">
          <Lock class="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            v-model="form.password"
            :type="showPass ? 'text' : 'password'"
            :placeholder="t('auth.passwordPlaceholder')"
            class="form-input !pe-10 !ps-10"
            required
            autocomplete="current-password"
            @input="clearError('password')"
          />
          <button type="button" @click="showPass = !showPass"
            class="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
            <Eye v-if="!showPass" class="w-4 h-4" />
            <EyeOff v-else        class="w-4 h-4" />
          </button>
        </div>
        <p v-if="fieldMessage('password')" class="form-error">{{ fieldMessage('password') }}</p>
      </div>

      <!-- Error -->
      <div v-if="authStore.error" class="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
        <AlertCircle class="w-4 h-4 shrink-0" />
        {{ resolveLocalizedText(authStore.error, locale) }}
      </div>

      <!-- Reset Success Message -->
      <div v-if="route.query.reset === 'success'" class="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400 text-sm flex items-center gap-2 font-medium">
        <CheckCircle class="w-4 h-4 shrink-0" />
        {{ t('auth.passwordUpdated') }}
      </div>

      <!-- Submit -->
      <button
        type="submit"
        :disabled="authStore.loading"
        class="btn-primary w-full h-12 text-base font-bold"
      >
        <svg v-if="authStore.loading" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        {{ authStore.loading ? t('common.loading') : t('auth.loginBtn') }}
      </button>
    </form>

    <!-- Divider -->
    <div class="flex items-center gap-3 my-6">
      <div class="h-px flex-1 bg-border"></div>
      <span class="text-xs text-muted-foreground font-medium">{{ t('auth.or') }}</span>
      <div class="h-px flex-1 bg-border"></div>
    </div>

    <p class="text-center text-sm text-muted-foreground">
      {{ t('auth.vendorLogin') }}
      <router-link to="/register" class="text-secondary font-semibold hover:underline">
        {{ t('auth.registerVendor') }}
      </router-link>
    </p>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { clearFieldError, getFieldErrorMessage, mapClientValidationIssues } from '@/utils/errorHandler';
import { resolveLocalizedText } from '@/utils/localizedText';

import { loginSchema } from '@/validation/schemas';

const { t, locale } = useI18n();
const router = useRouter();
const route  = useRoute();
const authStore = useAuthStore();

const showPass = ref(false);
const form = reactive({ email: '', password: '' });
const errors = ref({});

const fieldMessage = (field) => getFieldErrorMessage(errors.value, field, locale.value)
  || getFieldErrorMessage(authStore.fieldErrors, field, locale.value);

const clearError = (field) => {
  clearFieldError(errors.value, field);
  clearFieldError(authStore.fieldErrors, field);
};

const handleLogin = async () => {
  errors.value = {};
  
  // Validate with Zod
  const result = loginSchema.safeParse(form);
  if (!result.success) {
    errors.value = mapClientValidationIssues(result.error.issues);
    return;
  }

  try {
    const user = await authStore.login(form);
    // Unified redirect to Home for all roles (UX requirement)
    router.push('/');
  } catch {
    // Error handled in store
  }
};
</script>

<template>
  <!-- Tab switcher -->
  <div class="min-h-screen flex flex-col justify-center py-8">
    <div class="mb-6">
      <h2 class="text-2xl font-black text-foreground mb-1">{{ t('auth.registerTitle') }}</h2>
      <p class="text-sm text-muted-foreground">
        {{ t('auth.haveAccount') }}
        <router-link to="/login" class="text-secondary font-semibold hover:underline">{{ t('auth.login') }}</router-link>
      </p>
    </div>

    <!-- Tabs -->
    <div class="flex rounded-xl bg-muted p-1 mb-6">
      <button
        v-for="tab in tabs" :key="tab.id"
        @click="activeTab = tab.id"
        :class="[
          'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200',
          activeTab === tab.id
            ? 'bg-card text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground',
        ]"
      >
        <component :is="tab.icon" class="w-4 h-4" />
        {{ tab.label }}
      </button>
    </div>

    <!-- User Form -->
    <form v-if="activeTab === 'user'" @submit.prevent="handleUserRegister" class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div class="form-group">
          <label class="form-label">{{ t('auth.firstName') }}</label>
          <input v-model="userForm.first_name" type="text" :placeholder="t('auth.firstNamePlaceholder')" class="form-input" required @input="clearUserError('first_name')" />
          <p v-if="userFieldMessage('first_name')" class="form-error">{{ userFieldMessage('first_name') }}</p>
        </div>
        <div class="form-group">
          <label class="form-label">{{ t('auth.lastName') }}</label>
          <input v-model="userForm.last_name" type="text" :placeholder="t('auth.lastNamePlaceholder')" class="form-input" required @input="clearUserError('last_name')" />
          <p v-if="userFieldMessage('last_name')" class="form-error">{{ userFieldMessage('last_name') }}</p>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div class="form-group">
          <label class="form-label">{{ t('auth.phone') }}</label>
          <div class="relative">
            <Phone class="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input v-model="userForm.phone" type="tel" :placeholder="t('auth.phonePlaceholder')" class="form-input !pe-10" @input="clearUserError('phone')" />
          </div>
          <p v-if="userFieldMessage('phone')" class="form-error">{{ userFieldMessage('phone') }}</p>
        </div>
        <div class="form-group">
          <label class="form-label">{{ t('auth.email') }}</label>
          <div class="relative">
            <Mail class="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input v-model="userForm.email" type="email" :placeholder="t('auth.emailPlaceholder')" class="form-input !pe-10" required @input="clearUserError('email')" />
          </div>
          <p v-if="userFieldMessage('email')" class="form-error">{{ userFieldMessage('email') }}</p>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div class="form-group">
          <label class="form-label">{{ t('auth.password') }}</label>
          <div class="relative">
            <Lock class="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input v-model="userForm.password" :type="showPass ? 'text':'password'" :placeholder="t('auth.passwordPlaceholder')" class="form-input !pe-10 !ps-10" required @input="clearUserError('password')" />
            <button type="button" @click="showPass=!showPass" class="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground"><Eye v-if="!showPass" class="w-4 h-4"/><EyeOff v-else class="w-4 h-4"/></button>
          </div>
          <p v-if="userFieldMessage('password')" class="form-error">{{ userFieldMessage('password') }}</p>
        </div>
        <div class="form-group">
          <label class="form-label">{{ t('auth.confirmPassword') }}</label>
          <input v-model="userForm.confirm_password" :type="showPass ? 'text':'password'" :placeholder="t('auth.confirmPasswordPlaceholder')" class="form-input" required @input="clearUserError('confirm_password')" />
          <p v-if="userFieldMessage('confirm_password')" class="form-error">{{ userFieldMessage('confirm_password') }}</p>
        </div>
      </div>

      <div v-if="authStore.error" class="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
        {{ resolveLocalizedText(authStore.error, locale) }}
      </div>

      <button type="submit" :disabled="authStore.loading" class="btn-secondary w-full h-12 font-bold text-base">
        <svg v-if="authStore.loading" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
        {{ authStore.loading ? t('common.loading') : t('auth.registerBtn') }}
      </button>
    </form>

    <!-- Vendor Form -->
    <form v-else @submit.prevent="handleVendorRegister" class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div class="form-group">
          <label class="form-label">{{ t('auth.firstName') }}</label>
          <input v-model="vendorForm.first_name" type="text" :placeholder="t('auth.firstNamePlaceholder')" class="form-input" required @input="clearVendorError('first_name')" />
          <p v-if="vendorFieldMessage('first_name')" class="form-error">{{ vendorFieldMessage('first_name') }}</p>
        </div>
        <div class="form-group">
          <label class="form-label">{{ t('auth.lastName') }}</label>
          <input v-model="vendorForm.last_name" type="text" :placeholder="t('auth.lastNamePlaceholder')" class="form-input" required @input="clearVendorError('last_name')" />
          <p v-if="vendorFieldMessage('last_name')" class="form-error">{{ vendorFieldMessage('last_name') }}</p>
        </div>
        <div class="form-group col-span-2">
          <label class="form-label">{{ t('auth.companyName') }}</label>
          <input v-model="vendorForm.company_name" type="text" :placeholder="t('auth.companyNamePlaceholder')" class="form-input" required @input="clearVendorError('company_name')" />
          <p v-if="vendorFieldMessage('company_name')" class="form-error">{{ vendorFieldMessage('company_name') }}</p>
        </div>
        <CategoryMultiSelect
          v-model="vendorForm.categoryIds"
          :label="t('auth.category')"
          :error="vendorFieldMessage('categoryIds')"
          root-only
          class="col-span-2"
        />
      </div>
      <div class="form-group">
        <label class="form-label">{{ t('auth.email') }}</label>
        <div class="relative">
          <Mail class="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input v-model="vendorForm.email" type="email" :placeholder="t('auth.emailPlaceholder')" class="form-input !pe-10" required @input="clearVendorError('email')" />
        </div>
        <p v-if="vendorFieldMessage('email')" class="form-error">{{ vendorFieldMessage('email') }}</p>
      </div>
      <div class="form-group">
        <label class="form-label">{{ t('auth.phone') }}</label>
        <div class="relative">
          <Phone class="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input v-model="vendorForm.phone" type="tel" :placeholder="t('auth.phonePlaceholder')" class="form-input !px-10" required @input="clearVendorError('phone')" />
        </div>
        <p v-if="vendorFieldMessage('phone')" class="form-error">{{ vendorFieldMessage('phone') }}</p>
      </div>
      <div class="form-group">
        <label class="form-label">{{ t('auth.address') }}</label>
        <div class="relative">
          <MapPin class="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input v-model="vendorForm.address" type="text" :placeholder="t('auth.addressPlaceholder')" class="form-input !px-10" />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">{{ t('auth.bio') }}</label>
        <textarea v-model="vendorForm.bio" rows="2" :placeholder="t('auth.bioPlaceholder')" class="form-input resize-none" />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div class="form-group">
          <label class="form-label">{{ t('auth.password') }}</label>
          <div class="relative">
            <Lock class="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input v-model="vendorForm.password" :type="showPass ? 'text':'password'" :placeholder="t('auth.passwordPlaceholder')" class="form-input !pe-10 !ps-10" required @input="clearVendorError('password')" />
            <button type="button" @click="showPass=!showPass" class="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground"><Eye v-if="!showPass" class="w-4 h-4"/><EyeOff v-else class="w-4 h-4"/></button>
          </div>
          <p v-if="vendorFieldMessage('password')" class="form-error">{{ vendorFieldMessage('password') }}</p>
        </div>
        <div class="form-group">
          <label class="form-label">{{ t('auth.confirmPassword') }}</label>
          <input v-model="vendorForm.confirm_password" :type="showPass ? 'text':'password'" :placeholder="t('auth.confirmPasswordPlaceholder')" class="form-input" required @input="clearVendorError('confirm_password')" />
          <p v-if="vendorFieldMessage('confirm_password')" class="form-error">{{ vendorFieldMessage('confirm_password') }}</p>
        </div>
      </div>

      <div class="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
        <AlertTriangle class="w-4 h-4 shrink-0 mt-0.5" />
        <span>{{ t('auth.vendorApprovalNote') }}</span>
      </div>

      <div v-if="authStore.error" class="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
        {{ resolveLocalizedText(authStore.error, locale) }}
      </div>

      <button type="submit" :disabled="authStore.loading" class="btn-primary w-full h-12 font-bold text-base">
        <svg v-if="authStore.loading" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
        {{ authStore.loading ? t('common.loading') : t('auth.registerVendorBtn') }}
      </button>
    </form>
  </div>

  <!-- OTP Modal Verification -->
  <OtpModal 
    v-model="showOtpModal"
    :email="registrationEmail"
    type="REGISTRATION"
    @verified="onOtpVerified"
  />

  <!-- Success Modal for Vendors -->
  <div v-if="showSuccessModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
    <div class="w-full max-w-md bg-card border border-border shadow-2xl rounded-3xl p-8 text-center animate-in zoom-in-95 duration-300">
       <div class="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
         <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-500/20">
           <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
         </div>
       </div>
       <h2 class="text-2xl font-black text-foreground mb-4">{{ t('auth.pendingApprovalTitle') }}</h2>
       <p class="text-muted-foreground font-medium leading-relaxed mb-8">
         {{ t('auth.pendingApprovalDesc') }}
       </p>
       <button @click="router.push('/login')" class="btn-primary w-full h-12 font-bold group">
         {{ t('auth.pendingApprovalBtn') }}
         <ArrowRight class="w-4 h-4 rtl:rotate-180 group-hover:translate-x-1 transition-transform" />
       </button>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { User, Building2, Eye, EyeOff, AlertTriangle, ArrowRight, Lock, Phone, Mail, MapPin } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { useCategoryStore } from '@/stores/categoryStore';
import CategoryMultiSelect from '@/components/ui/CategoryMultiSelect.vue';
import OtpModal from '@/components/auth/OtpModal.vue';

import { userRegisterSchema, vendorRegisterSchema } from '@/validation/schemas';
import { clearFieldError, getFieldErrorMessage, mapClientValidationIssues } from '@/utils/errorHandler';
import { resolveLocalizedText, toLocalizedMessage } from '@/utils/localizedText';

const { t, locale } = useI18n();
const router = useRouter();
const authStore = useAuthStore();
const categoryStore = useCategoryStore();

const activeTab = ref('user');
const showPass  = ref(false);
const showSuccessModal = ref(false);
const showOtpModal = ref(false);
const registrationEmail = ref('');
const registeringAs = ref('user'); // 'user' | 'vendor'

const tabs = computed(() => [
  { id: 'user',   label: t('auth.tabBuyer'),  icon: User     },
  { id: 'vendor', label: t('auth.tabVendor'), icon: Building2 },
]);

const userForm = reactive({ first_name: '', last_name: '', email: '', phone: '', password: '', confirm_password: '' });
const uErrors  = ref({});

const vendorForm = reactive({ 
  first_name: '',
  last_name: '',
  company_name: '', 
  email: '', 
  phone: '', 
  address: '', 
  bio: '', 
  categoryIds: [], 
  password: '', 
  confirm_password: '' 
});
const vErrors    = ref({});

const userFieldMessage = (field) => getFieldErrorMessage(uErrors.value, field, locale.value)
  || getFieldErrorMessage(authStore.fieldErrors, field, locale.value);
const vendorFieldMessage = (field) => getFieldErrorMessage(vErrors.value, field, locale.value)
  || getFieldErrorMessage(authStore.fieldErrors, field, locale.value);

const clearUserError = (field) => {
  clearFieldError(uErrors.value, field);
  clearFieldError(authStore.fieldErrors, field);
};

const clearVendorError = (field) => {
  clearFieldError(vErrors.value, field);
  clearFieldError(authStore.fieldErrors, field);
};

onMounted(async () => {
  try {
    await categoryStore.fetchCategories({ mode: 'revalidate' });
  } catch { /* ignore */ }
});

const handleUserRegister = async () => {
  uErrors.value = {};
  
  // Confirm password check
  if (userForm.password !== userForm.confirm_password) {
    uErrors.value.confirm_password = toLocalizedMessage('auth.passwordMismatch');
    return;
  }

  // Zod validation
  const result = userRegisterSchema.safeParse(userForm);
  if (!result.success) {
    uErrors.value = mapClientValidationIssues(result.error.issues);
    return;
  }

  try {
    const { confirm_password, ...payload } = userForm;
    await authStore.registerUser(payload);
    
    if (authStore.isAuthenticated) {
      // Immediate login for regular users — no OTP needed
      router.push('/');
    } else {
      // Fallback: show OTP modal if backend still requires verification
      registrationEmail.value = payload.email;
      registeringAs.value = 'user';
      showOtpModal.value = true;
    }
  } catch { /* handled in store */ }
};

const handleVendorRegister = async () => {
  vErrors.value = {};

  if (vendorForm.password !== vendorForm.confirm_password) {
    vErrors.value.confirm_password = toLocalizedMessage('auth.passwordMismatch');
    return;
  }

  const result = vendorRegisterSchema.safeParse(vendorForm);
  if (!result.success) {
    vErrors.value = mapClientValidationIssues(result.error.issues);
    return;
  }

  try {
    const { confirm_password, ...payload } = vendorForm;
    await authStore.registerMowared(payload);
    
    // Success: show OTP modal for vendor too
    registrationEmail.value = payload.email;
    registeringAs.value = 'vendor';
    showOtpModal.value = true;
  } catch { /* handled in store */ }
};

const onOtpVerified = () => {
  showOtpModal.value = false;
  
  if (registeringAs.value === 'vendor') {
    // Show pending approval modal for vendors
    showSuccessModal.value = true;
  } else {
    // Auto-login or redirect to homepage for regular buyers
    // (AuthStore verifyRegistrationOtp already sets the token for user)
    router.push('/');
  }
};

</script>

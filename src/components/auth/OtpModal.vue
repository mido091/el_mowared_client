<template>
  <div v-if="modelValue" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/40 backdrop-blur-xl animate-in fade-in duration-500">
    <div class="relative w-full max-w-[95vw] sm:max-w-[420px] bg-card/80 border border-border/50 shadow-[0_20px_50px_rgba(0,0,0,0.1)] backdrop-blur-2xl rounded-[2rem] p-5 sm:p-8 animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 overflow-hidden">
      
      <!-- Decorative Background Elements -->
      <div class="absolute -top-24 -right-24 w-48 h-48 bg-[#06b6d4]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-24 -left-24 w-48 h-48 bg-[#06b6d4]/10 rounded-full blur-3xl pointer-events-none"></div>

      <!-- Close Button -->
      <button v-if="cancellable && !verified" @click="$emit('update:modelValue', false)" class="absolute top-6 end-6 p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-all duration-300">
        <X class="w-5 h-5" />
      </button>

      <!-- Content -->
      <div class="relative z-10">
        <!-- Success State -->
        <div v-if="verified" class="text-center py-10 animate-in zoom-in duration-500">
          <div class="w-24 h-24 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-success/10 border border-success/20">
            <Check class="w-12 h-12" />
          </div>
          <h2 class="text-3xl font-black text-[#1e293b] mb-3 leading-tight">{{ t('auth.otp.successTitle') || 'Verified!' }}</h2>
          <p class="text-muted-foreground text-lg">{{ t('auth.otp.successSubtitle') || 'Redirecting you shortly...' }}</p>
        </div>

        <!-- Verification State -->
        <template v-else>
          <!-- Header -->
          <div class="text-center mb-10">
            <div class="w-20 h-20 bg-[#06b6d4]/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-[#06b6d4]/20 shadow-inner">
              <Mail class="w-10 h-10 text-[#06b6d4]" />
            </div>
            <h2 class="text-2xl sm:text-3xl font-black text-[#1e293b] mb-3 leading-tight tracking-tight">{{ t('auth.otp.title') }}</h2>
            <p class="text-base text-muted-foreground/80 font-medium px-4">
              {{ t('auth.otp.subtitle').replace('{email}', '') }}
              <span class="text-[#1e293b] block mt-1 font-bold">{{ email }}</span>
            </p>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleVerify" class="space-y-8">
            <OtpInput 
              v-model="otpCode" 
              :length="6" 
              :errors="!!error"
              :disabled="loading"
              @complete="handleVerify"
            />

            <!-- Error Msg -->
            <div v-if="error" class="flex items-center justify-center gap-2 text-destructive bg-destructive/5 py-3 px-4 rounded-2xl border border-destructive/10 animate-in slide-in-from-top-2 duration-300">
              <AlertCircle class="w-4 h-4 flex-shrink-0" />
              <span class="text-sm font-bold leading-tight">{{ error }}</span>
            </div>

            <!-- Submit -->
            <button 
              type="submit" 
              :disabled="loading || otpCode.length !== 6"
              class="w-full h-14 bg-[#06b6d4] text-white text-lg font-black rounded-2xl shadow-lg shadow-[#06b6d4]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#06b6d4]/30 active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:scale-100 disabled:shadow-none flex items-center justify-center gap-3"
            >
              <RefreshCw v-if="loading" class="animate-spin w-6 h-6" />
              <span v-else>{{ t('auth.otp.verify') }}</span>
              <ArrowRight v-if="!loading" class="w-5 h-5 rtl:rotate-180" />
            </button>
          </form>

          <!-- Resend & Change Email -->
          <div class="mt-10 text-center space-y-6">
            <div class="bg-muted/30 py-4 px-6 rounded-3xl inline-block mx-auto border border-border/30">
              <button 
                v-if="timer === 0" 
                @click="handleResend"
                :disabled="resending"
                class="text-secondary font-black hover:text-secondary-hover transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw v-if="resending" class="w-4 h-4 animate-spin" />
                <span :class="resending ? 'opacity-70' : ''">{{ t('auth.otp.resend') }}</span>
              </button>
              <div v-else class="text-muted-foreground font-bold flex items-center justify-center gap-2">
                <Clock class="w-4 h-4 text-[#06b6d4]" />
                <span class="tabular-nums tracking-wider">{{ t('auth.otp.resendIn', { n: timer }) }}</span>
              </div>
            </div>

            <div v-if="type === 'REGISTRATION'">
              <button 
                @click.prevent="handleChangeEmail"
                type="button"
                class="text-sm font-bold text-muted-foreground hover:text-foreground underline underline-offset-4 decoration-border/50 transition-colors"
              >
                {{ t('auth.otp.changeEmail') }}
              </button>
            </div>
          </div>
        </template>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import { X, Mail, RefreshCw, Clock, Check, AlertCircle, ArrowRight } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import OtpInput from '@/components/ui/OtpInput.vue';
import { normalizeError } from '@/utils/errorHandler';
import { resolveLocalizedText } from '@/utils/localizedText';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  email: { type: String, required: true },
  type: { type: String, required: true, validator: v => ['REGISTRATION', 'PASSWORD_RESET'].includes(v) },
  cancellable: { type: Boolean, default: true }
});

const emit = defineEmits(['update:modelValue', 'verified']);
const { t, locale } = useI18n();
const authStore = useAuthStore();

const otpCode = ref('');
const loading = ref(false);
const resending = ref(false);
const error = ref('');
const verified = ref(false);

// Timer logic
const timer = ref(60);
let interval = null;

const startTimer = () => {
  timer.value = 60;
  clearInterval(interval);
  interval = setInterval(() => {
    if (timer.value > 0) timer.value--;
    else clearInterval(interval);
  }, 1000);
};

// Reset state when modal opens
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    otpCode.value = '';
    error.value = '';
    verified.value = false;
    startTimer();
  } else {
    clearInterval(interval);
  }
});

onBeforeUnmount(() => clearInterval(interval));

const handleVerify = async () => {
  if (otpCode.value.length !== 6 || loading.value || verified.value) return;
  
  loading.value = true;
  error.value = '';
  
  try {
    let result = null;
    if (props.type === 'REGISTRATION') {
      result = await authStore.verifyRegistrationOtp(props.email, otpCode.value);
    } else {
      result = await authStore.verifyResetOtp(props.email, otpCode.value);
    }
    
    // Success -> show success state
    verified.value = true;
    
    // Wait for the animation before emitting and closing
    setTimeout(() => {
      emit('verified', result);
    }, 2000);
  } catch (err) {
    const normalized = normalizeError(err);
    error.value = resolveLocalizedText(normalized.message, locale.value, t('auth.otp.invalid'));
    otpCode.value = ''; // Clear input on error
  } finally {
    loading.value = false;
  }
};

const handleResend = async () => {
  if (timer.value > 0 || resending.value) return;
  
  resending.value = true;
  error.value = '';
  
  try {
    const res = await authStore.resendOtp(props.email, props.type);
    startTimer();
    // Optional: show small success toast here
  } catch (err) {
    const normalized = normalizeError(err);
    error.value = resolveLocalizedText(normalized.message, locale.value, t('errors.loadFailed'));
  } finally {
    resending.value = false;
  }
};

const handleChangeEmail = async () => {
  if (loading.value) return;
  loading.value = true;
  try {
    await authStore.cancelRegistration(props.email);
    emit('update:modelValue', false);
  } catch (err) {
    const normalized = normalizeError(err);
    error.value = resolveLocalizedText(normalized.message, locale.value, t('errors.generic'));
  } finally {
    loading.value = false;
  }
};
</script>

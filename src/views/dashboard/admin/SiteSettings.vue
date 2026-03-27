<template>
  <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-foreground uppercase tracking-tight">{{ t('settings.title') }}</h1>
        <p class="text-muted-foreground font-medium uppercase text-[10px] tracking-widest mt-1">{{ t('settings.subtitle') }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Main Settings Form -->
      <DashCard class="lg:col-span-2" :title="t('settings.siteInfo')">
        <form @submit.prevent="saveSettings" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="form-group">
              <label class="form-label uppercase text-[10px] tracking-[0.2em]">{{ t('settings.siteName') }}</label>
              <input v-model="form.site_name" class="form-input" required />
            </div>
            <div class="form-group">
              <label class="form-label uppercase text-[10px] tracking-[0.2em]">{{ t('settings.bankName') }}</label>
              <input v-model="form.bank_name" class="form-input" required />
            </div>
            <div class="form-group">
              <label class="form-label uppercase text-[10px] tracking-[0.2em]">{{ t('settings.accountNumber') }}</label>
              <input v-model="form.account_number" class="form-input font-mono" required />
            </div>
            <div class="form-group">
              <label class="form-label uppercase text-[10px] tracking-[0.2em]">{{ t('settings.accountHolder') }}</label>
              <input v-model="form.account_holder" class="form-input" required />
            </div>
            <div class="form-group md:col-span-2">
              <label class="form-label uppercase text-[10px] tracking-[0.2em]">{{ t('settings.bankIBAN') }}</label>
              <input v-model="form.iban" class="form-input font-mono uppercase" required />
            </div>
          </div>

          <div class="pt-6 border-t border-border/50 flex justify-end">
             <button type="submit" :disabled="saving" class="btn-primary min-w-[150px] shadow-lg shadow-primary/20 h-11">
                <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />
                <span v-else class="font-black uppercase tracking-widest text-xs">{{ t('common.save') }}</span>
             </button>
          </div>
        </form>
      </DashCard>

      <!-- Sidebar Info -->
      <div class="space-y-6">
         <DashCard :title="t('settings.billingConfig')">
            <div class="space-y-4">
               <div class="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <p class="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{{ t('settings.commissionRate') }}</p>
                  <p class="text-2xl font-black mt-1">10<span class="text-primary">%</span></p>
               </div>
               <p class="text-[10px] text-muted-foreground font-medium italic">{{ t('settings.commissionDesc') }}</p>
            </div>
         </DashCard>

         <DashCard :title="t('settings.security')">
            <div class="space-y-3">
               <button class="w-full btn-outline justify-between text-xs h-10">
                  <span>{{ t('settings.systemLogs') }}</span>
                  <ChevronRight class="w-4 h-4" />
               </button>
               <button class="w-full btn-outline justify-between text-xs h-10">
                  <span>{{ t('settings.auditTrail') }}</span>
                  <ChevronRight class="w-4 h-4" />
               </button>
            </div>
         </DashCard>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Loader2, ChevronRight } from 'lucide-vue-next';
import api from '@/services/api';
import { getApiData } from '@/utils/apiResponse';
import { useUiStore } from '@/stores/ui';
import { useSettingsStore } from '@/stores/settings';
import DashCard from '@/components/dashboard/DashCard.vue';

const { t } = useI18n();
const uiStore = useUiStore();
const settingsStore = useSettingsStore();

const saving = ref(false);
const form = reactive({
  site_name: '',
  bank_name: '',
  account_number: '',
  account_holder: '',
  iban: ''
});

onMounted(async () => {
  try {
    const res = await api.get('/settings');
    Object.assign(form, getApiData(res) || {});
  } catch (err) { console.error('Settings error:', err); }
});

const saveSettings = async () => {
  saving.value = true;
  try {
    await api.put('/admin/settings', form);
    uiStore.showToast(t('settings.saved'), 'success');
    settingsStore.fetch(); // Refresh global site name
  } catch (err) { uiStore.showToast(t('settings.saveFailed'), 'error'); }
  finally { saving.value = false; }
};
</script>

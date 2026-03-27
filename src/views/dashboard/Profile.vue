<template>
  <div>
    <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-black text-foreground">{{ t('profile.title') }}</h1>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div class="lg:col-span-1 space-y-1">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all',
            activeTab === tab.id
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          ]"
        >
          <component :is="tab.icon" class="w-4 h-4" />
          {{ tab.label }}
        </button>
      </div>

      <div class="lg:col-span-3">
        <div class="card p-6 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div v-if="activeTab === 'info'" class="space-y-6">
            <div class="flex flex-col md:flex-row gap-8 items-start md:items-center border-b border-border pb-8">
              <div class="relative group">
                <div class="w-24 h-24 rounded-2xl border-4 border-card shadow-xl overflow-hidden bg-muted/30 relative">
                  <img
                    v-if="authStore.user?.avatar"
                    :src="authStore.user.avatar"
                    class="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-black text-2xl">
                    {{ (authStore.userName || 'U').charAt(0) }}
                  </div>
                  <div v-if="uploadingAvatar" class="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Loader2 class="w-6 h-6 text-white animate-spin" />
                  </div>
                </div>

                <input
                  ref="avatarInput"
                  type="file"
                  class="hidden"
                  accept="image/*"
                  @change="onAvatarChange"
                />

                <button
                  @click="triggerAvatarUpload"
                  :disabled="uploadingAvatar"
                  class="absolute -bottom-2 -end-2 p-2 bg-secondary text-white rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                >
                  <Camera class="w-4 h-4" />
                </button>
              </div>

              <div class="space-y-1">
                <h2 class="text-xl font-black text-foreground">{{ authStore.userName }}</h2>
                <p class="text-sm text-muted-foreground">{{ authStore.user?.email }}</p>
                <div class="flex gap-2 pt-2">
                  <BaseBadge variant="secondary" class="uppercase text-[10px] tracking-widest">{{ authStore.user?.role }}</BaseBadge>
                  <BaseBadge v-if="authStore.user?.verified" variant="success" class="text-[10px]">{{ t('profile.verified') }}</BaseBadge>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BaseInput :label="t('profile.firstName')" v-model="form.first_name" :placeholder="t('profile.firstNamePlaceholder')" />
              <BaseInput :label="t('profile.lastName')" v-model="form.last_name" :placeholder="t('profile.lastNamePlaceholder')" />
              <BaseInput :label="t('profile.phone')" v-model="form.phone" :placeholder="t('profile.phonePlaceholder')" />
            </div>

            <div class="flex justify-end pt-4">
              <BaseButton :loading="loading" @click="saveInfo" class="px-8">
                {{ t('common.saveChanges') }}
              </BaseButton>
            </div>
          </div>

          <div v-if="activeTab === 'orders'" class="space-y-6">
            <div class="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 class="text-lg font-bold text-foreground">{{ buyerOrderTitle }}</h3>
                <p class="text-sm text-muted-foreground">{{ buyerOrderDescription }}</p>
              </div>
              <BaseBadge variant="secondary">{{ buyerOrders.length }}</BaseBadge>
            </div>
            <div v-if="buyerOrdersLoading" class="text-sm text-muted-foreground">{{ t('common.loading') }}</div>
            <div v-else-if="!buyerOrders.length" class="text-sm text-muted-foreground">{{ t('orders.no_orders') }}</div>
            <div v-else class="space-y-3">
              <div v-for="order in buyerOrders" :key="order.id" class="rounded-2xl border border-border p-4 bg-muted/20">
                <div class="flex items-center justify-between gap-3">
                  <div>
                    <p class="text-sm font-bold text-foreground">#{{ order.id }}</p>
                    <p class="text-xs text-muted-foreground">{{ order.vendor_name || order.company_name_en || order.company_name_ar || t('roles.mowared') }}</p>
                  </div>
                  <div class="text-end">
                    <p class="text-sm font-bold text-foreground">${{ Number(order.total_price || order.amount || 0).toFixed(2) }}</p>
                    <p class="text-xs text-muted-foreground">{{ order.status }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'rfqs'" class="space-y-6">
            <div class="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 class="text-lg font-bold text-foreground">{{ buyerRfqTitle }}</h3>
                <p class="text-sm text-muted-foreground">{{ buyerRfqDescription }}</p>
              </div>
              <BaseBadge variant="secondary">{{ buyerRfqs.length }}</BaseBadge>
            </div>
            <div v-if="buyerRfqs.length" class="flex flex-wrap gap-2">
              <button
                v-for="section in buyerRfqSections"
                :key="section.id"
                @click="buyerRfqFilter = section.id"
                class="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] transition-all"
                :class="buyerRfqFilter === section.id
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'"
              >
                {{ section.label }} ({{ section.count }})
              </button>
            </div>
            <div v-if="buyerRfqsLoading" class="text-sm text-muted-foreground">{{ t('common.loading') }}</div>
            <div v-else-if="!buyerRfqs.length" class="text-sm text-muted-foreground">{{ t('rfq.no_rfqs_yet') }}</div>
            <div v-else-if="!filteredBuyerRfqs.length" class="text-sm text-muted-foreground">
              {{ isArabic ? 'لا توجد طلبات في هذا القسم.' : 'No RFQs in this section yet.' }}
            </div>
            <div v-else class="space-y-3">
              <div v-for="rfq in filteredBuyerRfqs" :key="rfq.id" class="rounded-2xl border border-border p-4 bg-muted/20 space-y-4">
                <div class="flex items-center justify-between gap-3">
                  <div>
                    <p class="text-sm font-bold text-foreground">{{ rfq.title }}</p>
                    <p class="text-xs text-muted-foreground">{{ rfq.category_name_en || rfq.category_name_ar }}</p>
                  </div>
                  <div class="text-end">
                    <p class="text-sm font-bold text-foreground">{{ rfq.status }}</p>
                    <p class="text-xs text-muted-foreground">{{ rfq.offers_count || 0 }} {{ t('rfq.offers_count') }}</p>
                  </div>
                </div>

                <div v-if="Number(rfq.offers_count || 0) > 0" class="rounded-xl border border-secondary/15 bg-secondary/5 px-4 py-3">
                  <p class="text-[10px] font-black uppercase tracking-[0.16em] text-secondary">
                    {{ isArabic ? 'آخر عرض مقدم' : 'Latest Offer' }}
                  </p>
                  <div class="mt-2 flex flex-col gap-1 text-sm">
                    <p class="font-bold text-foreground">
                      {{ rfq.latest_offer_vendor_name || (isArabic ? 'مورد معتمد' : 'Verified Supplier') }}
                    </p>
                    <p class="text-xs text-muted-foreground">
                      {{ isArabic ? 'السعر المقدم:' : 'Offered Price:' }}
                      {{ formatCurrency(rfq.latest_offer_price) }}
                      <span v-if="rfq.latest_offer_delivery_time">
                        • {{ isArabic ? 'التوريد:' : 'Delivery:' }} {{ rfq.latest_offer_delivery_time }}
                      </span>
                    </p>
                  </div>
                </div>

                <div class="flex flex-col gap-3 sm:flex-row">
                  <router-link :to="`/rfq/${rfq.id}`" class="btn-outline flex-1 justify-center font-bold">
                    {{ isArabic ? 'عرض تفاصيل الطلب' : 'View RFQ Details' }}
                  </router-link>
                  <button
                    v-if="canDeleteRfq(rfq)"
                    @click="openDeleteConfirm(rfq)"
                    :disabled="loading || deleteRfqLoading"
                    class="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-3 text-sm font-bold text-red-600 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {{ isArabic ? '\u062D\u0630\u0641 \u0627\u0644\u0637\u0644\u0628' : 'Delete RFQ' }}
                  </button>
                  <button
                    v-if="Number(rfq.offers_count || 0) > 0 && rfq.latest_offer_vendor_id"
                    @click="chatWithRfqVendor(rfq)"
                    :disabled="loading"
                    class="btn-primary flex-1 font-bold"
                  >
                    {{ isArabic ? 'التحدث مع المورد' : 'Chat with Supplier' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'security'" class="space-y-6">
            <h3 class="text-lg font-bold text-foreground">{{ t('profile.changePassword') }}</h3>
            <div class="grid grid-cols-1 gap-6 max-w-md">
              <BaseInput type="password" :label="t('profile.currentPassword')" v-model="security.current" show-password-toggle />
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <BaseInput type="password" :label="t('profile.newPassword')" v-model="security.new" show-password-toggle />
                <BaseInput type="password" :label="t('profile.confirmPassword')" v-model="security.confirm" show-password-toggle />
              </div>
            </div>
            <div class="flex justify-end pt-4">
              <BaseButton variant="secondary" :loading="loading" @click="saveSecurity">
                {{ t('profile.updatePassword') }}
              </BaseButton>
            </div>
          </div>

          <div v-if="activeTab === 'prefs'" class="space-y-8">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div class="space-y-4">
                <h3 class="text-lg font-bold text-foreground flex items-center gap-2">
                  <Languages class="w-5 h-5 text-secondary" />
                  {{ t('profile.languagePreference') }}
                </h3>
                <div class="grid grid-cols-2 gap-3">
                  <button
                    v-for="l in ['ar', 'en']"
                    :key="l"
                    @click="setLang(l)"
                    :class="[
                      'px-4 py-3 rounded-xl border-2 font-bold transition-all text-center',
                      locale === l
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:border-muted-foreground/30 text-muted-foreground'
                    ]"
                  >
                    {{ l === 'ar' ? 'العربية' : 'English' }}
                  </button>
                </div>
              </div>

              <div class="space-y-4">
                <h3 class="text-lg font-bold text-foreground flex items-center gap-2">
                  <component :is="uiStore.isDark ? Moon : Sun" class="w-5 h-5 text-secondary" />
                  {{ t('profile.themePreference') }}
                </h3>
                <div class="grid grid-cols-2 gap-3">
                  <button
                    @click="uiStore.setDark(false)"
                    :class="[
                      'px-4 py-3 rounded-xl border-2 font-bold transition-all flex items-center justify-center gap-2',
                      !uiStore.isDark
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border text-muted-foreground'
                    ]"
                  >
                    <Sun class="w-4 h-4" />
                    {{ t('common.light') }}
                  </button>
                  <button
                    @click="uiStore.setDark(true)"
                    :class="[
                      'px-4 py-3 rounded-xl border-2 font-bold transition-all flex items-center justify-center gap-2',
                      uiStore.isDark
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border text-muted-foreground'
                    ]"
                  >
                    <Moon class="w-4 h-4" />
                    {{ t('common.dark') }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'business'" class="space-y-8">
            <div class="flex items-center gap-3 border-b border-border pb-6">
              <div class="p-3 bg-secondary/10 text-secondary rounded-2xl">
                <Building2 class="w-6 h-6" />
              </div>
              <div>
                <h3 class="text-xl font-bold text-foreground">{{ t('profile.businessInfo') }}</h3>
                <p class="text-sm text-muted-foreground">{{ t('profile.businessInfoDesc') }}</p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BaseInput :label="t('profile.companyNameAr')" v-model="businessForm.companyNameAr" :placeholder="t('profile.companyNameArPlaceholder')" />
              <BaseInput :label="t('profile.companyNameEn')" v-model="businessForm.companyNameEn" :placeholder="t('profile.companyNameEnPlaceholder')" />
              <div class="md:col-span-2">
                <CategoryMultiSelect v-model="businessForm.categoryIds" :label="t('profile.industries')" />
              </div>
              <BaseInput :label="t('profile.location')" v-model="businessForm.location" :placeholder="t('profile.locationPlaceholder')" class="md:col-span-2" />
              <div class="md:col-span-2 space-y-2">
                <label class="form-label">{{ t('profile.bioAr') }}</label>
                <textarea v-model="businessForm.bioAr" rows="3" class="form-input resize-none" :placeholder="t('profile.bioArPlaceholder')" />
              </div>
              <div class="md:col-span-2 space-y-2">
                <label class="form-label">{{ t('profile.bioEn') }}</label>
                <textarea v-model="businessForm.bioEn" rows="3" class="form-input resize-none" :placeholder="t('profile.bioEnPlaceholder')" />
              </div>
            </div>

            <div class="flex justify-end pt-4">
              <BaseButton :loading="loading" @click="saveBusinessInfo" class="px-8">
                {{ t('common.saveChanges') }}
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>

    <BaseModal
      v-model="deleteConfirmOpen"
      :title="isArabic ? '\u062A\u0623\u0643\u064A\u062F \u062D\u0630\u0641 \u0627\u0644\u0637\u0644\u0628' : 'Confirm RFQ Deletion'"
      size="sm"
      body-class="space-y-4"
    >
      <div class="space-y-4">
        <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
          <FileText class="h-7 w-7" />
        </div>

        <div class="space-y-2 text-center">
          <h3 class="text-lg font-black text-foreground">
            {{ isArabic ? '\u0647\u0644 \u0623\u0646\u062A \u0645\u062A\u0623\u0643\u062F\u061F' : 'Are you sure?' }}
          </h3>
          <p class="text-sm leading-7 text-muted-foreground">
            {{
              isArabic
                ? `\u0633\u064A\u062A\u0645 \u062D\u0630\u0641 \u0637\u0644\u0628 RFQ "${pendingDeleteRfq?.title || ''}" \u0648\u0644\u0627 \u064A\u0645\u0643\u0646 \u0627\u0644\u062A\u0631\u0627\u062C\u0639 \u0639\u0646 \u0647\u0630\u0627 \u0627\u0644\u0625\u062C\u0631\u0627\u0621.`
                : `The RFQ "${pendingDeleteRfq?.title || ''}" will be removed and this action cannot be undone.`
            }}
          </p>
        </div>
      </div>

      <template #footer>
        <BaseButton
          variant="ghost"
          @click="closeDeleteConfirm"
          :disabled="deleteRfqLoading"
        >
          {{ isArabic ? '\u0625\u0644\u063A\u0627\u0621' : 'Cancel' }}
        </BaseButton>
        <BaseButton
          @click="confirmDeleteBuyerRfq"
          :loading="deleteRfqLoading"
          class="bg-red-600 text-white hover:bg-red-700"
        >
          {{ isArabic ? '\u062D\u0630\u0641 \u0627\u0644\u0637\u0644\u0628' : 'Delete RFQ' }}
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { User, ShieldCheck, Settings, Camera, Languages, Sun, Moon, Building2, Loader2, Package, FileText } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { useUiStore } from '@/stores/ui';
import { useChatStore } from '@/stores/chat';
import { useRfqStore } from '@/stores/rfqStore';
import api from '@/services/api';
import { profileSchema, passwordSchema } from '@/validation/schemas';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseBadge from '@/components/ui/BaseBadge.vue';
import BaseModal from '@/components/ui/BaseModal.vue';
import CategoryMultiSelect from '@/components/ui/CategoryMultiSelect.vue';
import { getApiCollection, getApiData } from '@/utils/apiResponse';

const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const uiStore = useUiStore();
const chatStore = useChatStore();
const rfqStore = useRfqStore();

const activeTab = ref(route.query.tab || 'info');
const loading = ref(false);
const uploadingAvatar = ref(false);
const avatarInput = ref(null);
const errors = ref({});
const buyerOrders = ref([]);
const buyerRfqs = ref([]);
const buyerOrdersLoading = ref(false);
const buyerRfqsLoading = ref(false);
const deleteConfirmOpen = ref(false);
const pendingDeleteRfq = ref(null);
const deleteRfqLoading = ref(false);
const buyerRfqFilter = ref('incomplete');
const isBuyer = computed(() => authStore.user?.role === 'user');
const isArabic = computed(() => locale.value === 'ar');
const buyerOrderTitle = computed(() => (isArabic.value ? 'سجل الطلبات' : 'Order History'));
const buyerOrderDescription = computed(() => (
  isArabic.value
    ? 'تابع الطلبات المقسمة على الموردين والتي تم إنشاؤها من نشاط التوريد الخاص بك.'
    : 'Track the split-vendor leads created from your sourcing activity.'
));
const buyerRfqTitle = computed(() => (isArabic.value ? 'طلبات العروض الخاصة بي' : 'My RFQs'));
const buyerRfqDescription = computed(() => (
  isArabic.value
    ? 'راجع طلبات التوريد الخاصة بك ومستوى تفاعل الموردين معها.'
    : 'Review your sourcing requests and the offer activity around them.'
));

const isCompletedRfq = (rfq) => `${rfq?.status || ''}`.toUpperCase() === 'COMPLETED';
const completedBuyerRfqs = computed(() => buyerRfqs.value.filter((rfq) => isCompletedRfq(rfq)));
const incompleteBuyerRfqs = computed(() => buyerRfqs.value.filter((rfq) => !isCompletedRfq(rfq)));
const buyerRfqSections = computed(() => ([
  { id: 'incomplete', label: isArabic.value ? 'غير مكتمل' : 'Incomplete', count: incompleteBuyerRfqs.value.length },
  { id: 'completed', label: isArabic.value ? 'مكتمل' : 'Completed', count: completedBuyerRfqs.value.length }
]));
const filteredBuyerRfqs = computed(() =>
  buyerRfqFilter.value === 'completed' ? completedBuyerRfqs.value : incompleteBuyerRfqs.value
);


const tabs = computed(() => {
  const base = [
    { id: 'info', icon: User, label: t('profile.tabs.info') },
    { id: 'security', icon: ShieldCheck, label: t('profile.tabs.security') },
    { id: 'prefs', icon: Settings, label: t('profile.tabs.prefs') },
  ];

  if (isBuyer.value) {
    base.splice(1, 0, { id: 'orders', icon: Package, label: isArabic.value ? 'الطلبات' : 'Orders' });
    base.splice(2, 0, { id: 'rfqs', icon: FileText, label: isArabic.value ? 'طلبات العروض' : 'RFQs' });
  }

  if (authStore.user?.role === 'mowared') {
    base.splice(1, 0, { id: 'business', icon: Building2, label: t('profile.tabs.business') });
  }

  return base;
});

const form = reactive({
  first_name: authStore.user?.first_name || '',
  last_name: authStore.user?.last_name || '',
  phone: authStore.user?.phone || '',
});

const security = reactive({
  current: '',
  new: '',
  confirm: '',
});

const businessForm = reactive({
  companyNameAr: '',
  companyNameEn: '',
  bioAr: '',
  bioEn: '',
  location: '',
  categoryIds: []
});

const loadBuyerOrders = async () => {
  if (!isBuyer.value) return;
  buyerOrdersLoading.value = true;
  try {
    const res = await api.get('/user/orders');
    buyerOrders.value = getApiCollection(res);
  } finally {
    buyerOrdersLoading.value = false;
  }
};

const loadBuyerRfqs = async () => {
  if (!isBuyer.value) return;
  buyerRfqsLoading.value = true;
  try {
    const res = await api.get('/rfq');
    buyerRfqs.value = getApiCollection(res);
  } finally {
    buyerRfqsLoading.value = false;
  }
};

onMounted(async () => {
  if (isBuyer.value) {
    await Promise.all([loadBuyerOrders(), loadBuyerRfqs()]);
  }

  if (authStore.user?.role === 'mowared') {
    try {
      const res = await api.get('/vendor/me');
      const payload = getApiData(res);
      const v = payload?.vendor || payload || {};
      businessForm.companyNameAr = v.company_name_ar || '';
      businessForm.companyNameEn = v.company_name_en || '';
      businessForm.bioAr = v.bio_ar || '';
      businessForm.bioEn = v.bio_en || '';
      businessForm.location = v.location || '';
      businessForm.categoryIds = v.categories?.map((c) => c.id) || [];
    } catch (err) {
      console.error('Failed to load vendor data', err);
    }
  }
});

watch(() => route.query.tab, (tab) => {
  if (typeof tab === 'string' && tab) {
    activeTab.value = tab;
  }
});

const saveInfo = async () => {
  errors.value = {};
  const result = profileSchema.safeParse(form);
  if (!result.success) {
    result.error.issues.forEach((issue) => {
      errors.value[issue.path[0]] = issue.message;
    });
    uiStore.showToast(Object.values(errors.value)[0], 'error');
    return;
  }

  loading.value = true;
  try {
    const res = await api.put('/user/profile', form);
    const user = getApiData(res)?.user;
    if (user) {
      authStore.setUser({ ...authStore.user, ...user }, authStore.token);
    }
    uiStore.showToast(t('profile.updateSuccess'), 'success');
  } finally {
    loading.value = false;
  }
};

const saveSecurity = async () => {
  errors.value = {};
  const result = passwordSchema.safeParse(security);
  if (!result.success) {
    result.error.issues.forEach((issue) => {
      errors.value[issue.path[0]] = issue.message;
    });
    uiStore.showToast(Object.values(errors.value)[0], 'error');
    return;
  }

  loading.value = true;
  try {
    await api.patch('/auth/change-password', {
      currentPassword: security.current,
      newPassword: security.new
    });
    uiStore.showToast(t('profile.passwordSuccess'), 'success');
    security.current = '';
    security.new = '';
    security.confirm = '';
  } finally {
    loading.value = false;
  }
};

const saveBusinessInfo = async () => {
  loading.value = true;
  try {
    await api.patch('/vendor/me', businessForm);
    uiStore.showToast(t('profile.businessUpdateSuccess'), 'success');
  } finally {
    loading.value = false;
  }
};

const setLang = (l) => {
  locale.value = l;
  localStorage.setItem('locale', l);
  document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = l;
};

const triggerAvatarUpload = () => {
  avatarInput.value?.click();
};

const onAvatarChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    uiStore.showToast(t('common.invalidFile'), 'error');
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    uiStore.showToast(t('common.fileTooLarge'), 'error');
    return;
  }

  const formData = new FormData();
  formData.append('image', file);

  uploadingAvatar.value = true;
  try {
    const res = await api.put('/user/profile/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    const payload = getApiData(res);
    const newAvatar = payload?.avatar || payload?.profile_image_url;
    authStore.updateAvatar(newAvatar);
    uiStore.showToast(t('profile.updateSuccess'), 'success');
  } catch (err) {
    console.error('Avatar upload failed', err);
  } finally {
    uploadingAvatar.value = false;
    if (avatarInput.value) avatarInput.value.value = '';
  }
};

const formatCurrency = (value) => {
  const numeric = Number(value || 0);
  if (!numeric) return isArabic.value ? 'غير محدد' : 'Not set';
  return new Intl.NumberFormat(isArabic.value ? 'ar-EG' : 'en-US', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 2
  }).format(numeric);
};

const buildRfqMetadata = (rfq) => ({
  rfq_id: rfq.id,
  rfq_title: rfq.title,
  rfq_quantity: rfq.quantity,
  rfq_budget: rfq.target_price,
  rfq_image: rfq.image_url || null
});

const canDeleteRfq = (rfq) => {
  const status = `${rfq?.status || ''}`.toUpperCase();
  const offersCount = Number(rfq?.offers_count || 0);
  return !['ACCEPTED', 'COMPLETED'].includes(status) && offersCount === 0;
};

const openDeleteConfirm = (rfq) => {
  pendingDeleteRfq.value = rfq;
  deleteConfirmOpen.value = true;
};

const closeDeleteConfirm = () => {
  if (deleteRfqLoading.value) return;
  deleteConfirmOpen.value = false;
  pendingDeleteRfq.value = null;
};

const confirmDeleteBuyerRfq = async () => {
  if (!pendingDeleteRfq.value?.id) return;

  deleteRfqLoading.value = true;
  try {
    await rfqStore.deleteRfq(pendingDeleteRfq.value.id);
    buyerRfqs.value = buyerRfqs.value.filter((item) => Number(item.id) !== Number(pendingDeleteRfq.value.id));
    uiStore.showToast(isArabic.value ? '\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0637\u0644\u0628 \u0628\u0646\u062C\u0627\u062D' : 'RFQ deleted successfully', 'success');
    deleteConfirmOpen.value = false;
    pendingDeleteRfq.value = null;
  } catch (err) {
    uiStore.showToast(
      err?.response?.data?.message || (isArabic.value ? '\u062A\u0639\u0630\u0631 \u062D\u0630\u0641 \u0627\u0644\u0637\u0644\u0628 \u0627\u0644\u0622\u0646.' : 'Unable to delete the RFQ right now.'),
      'error'
    );
  } finally {
    deleteRfqLoading.value = false;
  }
};

const chatWithRfqVendor = async (rfq) => {
  if (!rfq?.latest_offer_vendor_id) return;

  loading.value = true;
  try {
    const result = await chatStore.startChat(
      rfq.latest_offer_vendor_id,
      null,
      isArabic.value
        ? `مرحبًا، أريد متابعة مناقشة العرض المقدم على طلب: ${rfq.title}`
        : `Hello, I would like to continue discussing the submitted offer for RFQ: ${rfq.title}`,
      'RFQ',
      buildRfqMetadata(rfq),
      { relatedRfqId: rfq.id, source: 'rfq' }
    );

    const conversation = result?.conversation || result;
    if (conversation?.id) {
      router.push(`/chat?id=${conversation.id}`);
    }
  } catch (err) {
    uiStore.showToast(
      err?.response?.data?.message || (isArabic.value ? 'تعذر فتح المحادثة الآن.' : 'Unable to open the chat right now.'),
      'error'
    );
  } finally {
    loading.value = false;
  }
};
</script>

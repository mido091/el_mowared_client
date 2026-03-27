<template>
  <div
    v-if="product"
    class="relative overflow-x-hidden bg-gradient-to-b from-white via-slate-50/70 to-white pb-28 pt-8 text-slate-900 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 dark:text-slate-100"
    :dir="locale === 'ar' ? 'rtl' : 'ltr'"
  >
    <div class="container-wide font-plex">
      <section class="mb-8 rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/85 md:p-8">
        <div class="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] xl:gap-12">
          <div class="space-y-4">
            <div class="overflow-hidden rounded-[2rem] border border-slate-200/70 bg-slate-50 shadow-inner dark:border-slate-800 dark:bg-slate-950">
              <div class="relative aspect-[1/1]">
                <AppImage
                  v-if="activeImageUrl"
                  :src="activeImageUrl"
                  :alt="productTitle"
                  :width="720"
                  :height="720"
                  fetchpriority="high"
                  sizes="(min-width: 1280px) 45vw, (min-width: 768px) 50vw, 100vw"
                  :responsive-widths="[480, 720, 960]"
                  img-class="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
                />
                <div
                  v-else
                  class="ui-empty-media"
                >
                  <div class="rounded-[2rem] border border-slate-200 bg-white px-6 py-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <div class="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-[1.75rem] bg-slate-100 text-4xl font-black uppercase tracking-[0.12em] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {{ productInitials }}
                    </div>
                    <p class="text-xs font-bold text-slate-500 dark:text-slate-400">
                      {{ productCategory }}
                    </p>
                  </div>
                </div>

                <div class="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
                  <div class="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/85 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-200">
                    <span class="h-2 w-2 rounded-full bg-[hsl(var(--primary))]" />
                    {{ productCategory }}
                  </div>
                  <div
                    v-if="discountPercent > 0"
                    class="rounded-full bg-rose-500 px-3 py-1 text-xs font-black text-white shadow-lg"
                  >
                    -{{ discountPercent }}%
                  </div>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-4 gap-3 sm:grid-cols-5">
              <button
                v-for="(image, index) in galleryImages"
                :key="image.src || index"
                type="button"
                class="group relative overflow-hidden rounded-[1.25rem] border bg-white transition-all duration-300 dark:bg-slate-900"
                :class="activeImageIndex === index ? 'border-[hsl(var(--primary))] shadow-[0_16px_40px_-24px_hsl(var(--primary))]' : 'border-slate-200 hover:border-[hsl(var(--primary))]/40 dark:border-slate-800'"
                @click="activeImageIndex = index"
              >
                <div class="aspect-square">
                  <AppImage
                    v-if="image.src"
                    :src="image.src"
                    :alt="productTitle"
                    :width="160"
                    :height="160"
                    sizes="96px"
                    img-class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div
                    v-else
                    class="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                  >
                    <ImageIcon class="h-5 w-5" />
                  </div>
                </div>
                <span
                  v-if="image.isPrimary"
                  class="absolute start-2 top-2 rounded-full bg-[hsl(var(--primary))] px-2 py-0.5 text-[10px] font-bold text-white shadow-sm"
                >
                  {{ primaryImageLabel }}
                </span>
              </button>
            </div>
          </div>

          <div class="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div class="space-y-4">
              <div class="flex flex-wrap items-center gap-2">
                <span class="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary))/0.12] px-3 py-1 text-xs font-bold text-[hsl(var(--primary))]">
                  <span class="h-2 w-2 rounded-full bg-[hsl(var(--primary))]" />
                  {{ inquiryReadyLabel }}
                </span>
                <span
                  v-if="product.vendor?.is_verified"
                  class="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300"
                >
                  <BadgeCheck class="h-3.5 w-3.5" />
                  {{ verifiedLabel }}
                </span>
              </div>

              <div class="space-y-3">
                <h1 class="max-w-3xl text-3xl font-black leading-tight text-[#1e293b] dark:text-white md:text-[2.65rem]">
                  {{ productTitle }}
                </h1>
                <p v-if="productShortDescription" class="max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 md:text-base">
                  {{ productShortDescription }}
                </p>
              </div>

              <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <div class="min-h-[122px] rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                  <p class="ui-field-label mb-2">
                    {{ priceLabel }}
                  </p>
                  <p class="text-xl font-black leading-tight text-[#1e293b] dark:text-white" dir="ltr">
                    {{ displayPrice }}
                  </p>
                </div>
                <div class="min-h-[122px] rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                  <p class="ui-field-label mb-2">
                    {{ moqLabel }}
                  </p>
                  <p class="text-xl font-black leading-tight text-[#1e293b] dark:text-white">
                    {{ displayMoq }}
                  </p>
                </div>
                <div class="min-h-[122px] rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                  <p class="ui-field-label mb-2">
                    {{ availableQuantityLabel }}
                  </p>
                  <p class="text-xl font-black leading-tight text-[#1e293b] dark:text-white">
                    {{ displayAvailableQuantity }}
                  </p>
                </div>
                <div class="min-h-[122px] rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                  <p class="ui-field-label mb-2">
                    {{ viewsLabel }}
                  </p>
                  <p class="text-xl font-black leading-tight text-[#1e293b] dark:text-white" dir="ltr">
                    {{ productViewsCount }}
                  </p>
                </div>
                <div class="min-h-[122px] rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                  <p class="ui-field-label mb-2">
                    {{ inquiriesLabel }}
                  </p>
                  <p class="text-xl font-black leading-tight text-[#1e293b] dark:text-white" dir="ltr">
                    {{ productInquiriesCount }}
                  </p>
                </div>
                <div class="min-h-[122px] rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                  <p class="ui-field-label mb-2">
                    {{ availabilityLabel }}
                  </p>
                  <div class="flex items-center gap-2">
                    <span
                      class="relative inline-flex h-3 w-3 rounded-full"
                      :class="isVendorOnline ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'"
                    >
                      <span
                        v-if="isVendorOnline"
                        class="absolute inset-0 animate-ping rounded-full bg-emerald-500/60"
                      />
                    </span>
                    <p class="text-sm font-bold text-[#1e293b] dark:text-white">
                      {{ isVendorOnline ? onlineLabel : offlineLabel }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  class="inline-flex items-center justify-center gap-2 rounded-[1.35rem] bg-[hsl(var(--primary))] px-5 py-4 text-sm font-black text-white shadow-[0_16px_40px_-24px_hsl(var(--primary))] transition hover:translate-y-[-1px] hover:shadow-[0_20px_44px_-24px_hsl(var(--primary))]"
                  :disabled="chatStore.sending"
                  :class="{ 'cursor-not-allowed opacity-50 hover:translate-y-0 hover:shadow-[0_16px_40px_-24px_hsl(var(--primary))]': chatStore.sending }"
                  @click="handlePrimaryContact"
                >
                  <Loader2 v-if="chatStore.sending" class="h-4 w-4 animate-spin" />
                  <MessageSquare v-else class="h-4 w-4" />
                  {{ primaryContactButtonLabel }}
                </button>
              </div>
            </div>

            <aside class="rounded-[1.75rem] border border-slate-200 bg-white/95 p-5 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.35)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
              <div class="mb-4 flex items-start gap-4">
                <div class="flex h-16 w-16 items-center justify-center overflow-hidden rounded-[1.4rem] border border-slate-200 bg-slate-50 text-xl font-black text-[#1e293b] shadow-inner dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                  <AppImage
                    v-if="vendorLogo"
                    :src="vendorLogo"
                    :alt="vendorName"
                    :width="64"
                    :height="64"
                    sizes="64px"
                    img-class="h-full w-full object-cover"
                  />
                  <span v-else>{{ vendorInitial }}</span>
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <h2 class="truncate text-lg font-black text-[#1e293b] dark:text-white">
                      {{ vendorName }}
                    </h2>
                    <span
                      v-if="product.vendor?.is_verified"
                      class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                    >
                      <BadgeCheck class="h-3.5 w-3.5" />
                      {{ verifiedLabel }}
                    </span>
                  </div>
                  <div class="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span class="inline-flex items-center gap-1.5">
                      <Star class="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {{ vendorRatingLabel }}
                    </span>
                    <span>{{ totalProductsLabel }}</span>
                    <span>{{ memberSinceLabel }}</span>
                  </div>
                </div>
              </div>

              <div class="mb-5 grid gap-3 sm:grid-cols-2">
                <div class="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/70">
                  <p class="ui-kicker mb-1">
                    {{ responseRateLabel }}
                  </p>
                  <p class="text-lg font-black text-[#1e293b] dark:text-white">
                    {{ vendorMetrics?.response_rate != null ? `${Math.round(vendorMetrics.response_rate)}%` : fallbackDash }}
                  </p>
                </div>
                <div class="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/70">
                  <p class="ui-kicker mb-1">
                    {{ liveStatusLabel }}
                  </p>
                  <p class="text-lg font-black text-[#1e293b] dark:text-white">
                    {{ isVendorOnline ? onlineLabel : offlineLabel }}
                  </p>
                </div>
              </div>

              <router-link
                :to="`/vendor/${product.vendor?.id}`"
                class="inline-flex w-full items-center justify-center gap-2 rounded-[1.2rem] border border-slate-200 px-4 py-3 text-sm font-bold text-[#1e293b] transition hover:border-[hsl(var(--primary))]/40 hover:text-[hsl(var(--primary))] dark:border-slate-800 dark:text-slate-100"
              >
                <Store class="h-4 w-4" />
                {{ viewStoreLabel }}
              </router-link>
            </aside>
          </div>
        </div>
      </section>
      
      <section class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div class="space-y-6">
          <div class="ui-surface p-6">
            <div class="mb-5 flex items-center gap-3">
              <div class="h-10 w-1.5 rounded-full bg-[hsl(var(--primary))]" />
              <div>
                <p class="ui-kicker-primary">
                  {{ premiumDetailsLabel }}
                </p>
                <h3 class="text-xl font-black text-[#1e293b] dark:text-white">
                  {{ descriptionLabel }}
                </h3>
              </div>
            </div>
            <p class="whitespace-pre-wrap text-sm leading-8 text-slate-600 dark:text-slate-300">
              {{ productDescription || noDescriptionLabel }}
            </p>
          </div>

          <div class="ui-surface p-6">
            <div class="mb-5 flex items-center gap-3">
              <div class="h-10 w-1.5 rounded-full bg-[hsl(var(--primary))]" />
              <div>
                <p class="ui-kicker-primary">
                  {{ technicalDataLabel }}
                </p>
                <h3 class="text-xl font-black text-[#1e293b] dark:text-white">
                  {{ specsLabel }}
                </h3>
              </div>
            </div>

            <div v-if="normalizedSpecs.length" class="overflow-hidden rounded-[1.4rem] border border-slate-200 dark:border-slate-800">
              <div
                v-for="(spec, index) in normalizedSpecs"
                :key="`${spec.key}-${index}`"
                class="grid gap-3 border-b border-slate-200 px-4 py-4 last:border-b-0 md:grid-cols-[220px_1fr] dark:border-slate-800"
                :class="index % 2 === 0 ? 'bg-slate-50/80 dark:bg-slate-950/70' : 'bg-white dark:bg-slate-900'"
              >
                <div class="text-sm font-bold text-[#1e293b] dark:text-white">
                  {{ spec.key }}
                </div>
                <div class="text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {{ spec.value }}
                </div>
              </div>
            </div>
            <div
              v-else
              class="rounded-[1.4rem] border border-dashed border-slate-300 bg-slate-50/80 p-8 text-center text-sm font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-400"
            >
              {{ noSpecsLabel }}
            </div>
          </div>

          <div v-if="similarProducts.length" class="ui-surface p-6">
            <div class="mb-5 flex items-center justify-between gap-4">
              <div class="flex items-center gap-3">
                <div class="h-10 w-1.5 rounded-full bg-[hsl(var(--primary))]" />
                <div>
                  <p class="ui-kicker-primary">
                    {{ exploreMoreLabel }}
                  </p>
                  <h3 class="text-xl font-black text-[#1e293b] dark:text-white">
                    {{ similarProductsLabel }}
                  </h3>
                </div>
              </div>
            </div>
            <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <ProductCard
                v-for="similar in similarProducts"
                :key="similar.id"
                :product="similar"
              />
            </div>
          </div>
        </div>

        <div class="space-y-6">
          <div class="ui-surface p-6">
            <div class="mb-5 flex items-center gap-3">
              <div class="h-10 w-1.5 rounded-full bg-[hsl(var(--primary))]" />
              <div>
                <p class="ui-kicker-primary">
                  {{ sourcingFlowLabel }}
                </p>
                <h3 class="text-xl font-black text-[#1e293b] dark:text-white">
                  {{ inquiryWorkflowLabel }}
                </h3>
              </div>
            </div>
            <div class="space-y-4">
              <div
                v-for="step in sourcingSteps"
                :key="step.title"
                class="flex gap-3 rounded-[1.2rem] border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/60"
              >
                <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))/0.14] text-[hsl(var(--primary))]">
                  <component :is="step.icon" class="h-4 w-4" />
                </div>
                <div>
                  <p class="mb-1 text-sm font-black text-[#1e293b] dark:text-white">
                    {{ step.title }}
                  </p>
                  <p class="text-xs leading-6 text-slate-600 dark:text-slate-300">
                    {{ step.description }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="mt-6">
        <ReviewSection type="product" :target-id="Number(route.params.id)" />
      </section>
    </div>

    <div class="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/92 p-4 shadow-[0_-18px_48px_-36px_rgba(15,23,42,0.45)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/92 lg:hidden">
      <div class="mx-auto flex max-w-5xl items-center gap-3">
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-black text-[#1e293b] dark:text-white">
            {{ productTitle }}
          </p>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            {{ displayPrice }} - {{ displayMoq }}
          </p>
        </div>
        <button
          type="button"
          class="inline-flex shrink-0 items-center justify-center gap-2 rounded-[1.15rem] bg-[hsl(var(--primary))] px-4 py-3 text-sm font-black text-white shadow-[0_16px_40px_-24px_hsl(var(--primary))]"
          :disabled="chatStore.sending"
          :class="{ 'cursor-not-allowed opacity-50': chatStore.sending }"
          @click="handlePrimaryContact"
        >
          <Loader2 v-if="chatStore.sending" class="h-4 w-4 animate-spin" />
          <MessageSquare v-else class="h-4 w-4" />
          {{ primaryContactButtonLabel }}
        </button>
      </div>
    </div>

    <BaseModal v-model="offlineInquiryOpen" :title="offlineInquiryTitle" size="md">
      <div class="space-y-4">
        <div class="rounded-[1.25rem] border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/60">
          <div class="flex items-center gap-3">
            <div class="h-14 w-14 overflow-hidden rounded-[1rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <img
                v-if="activeImageUrl"
                :src="activeImageUrl"
                :alt="productTitle"
                class="h-full w-full object-cover"
              />
              <div v-else class="flex h-full w-full items-center justify-center text-slate-400 dark:text-slate-500">
                <ImageIcon class="h-5 w-5" />
              </div>
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-black text-[#1e293b] dark:text-white">
                {{ productTitle }}
              </p>
              <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {{ displayPrice }} - {{ displayMoq }}
              </p>
            </div>
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-bold text-[#1e293b] dark:text-white">
            {{ inquiryMessageLabel }}
          </label>
          <textarea
            v-model="inquiryMessage"
            rows="5"
            class="w-full rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[hsl(var(--primary))] focus:ring-4 focus:ring-[hsl(var(--primary))/0.12] dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            :placeholder="inquiryPlaceholder"
          />
        </div>
      </div>
      <template #footer>
        <button type="button" class="btn-ghost btn-sm" @click="offlineInquiryOpen = false">
          {{ cancelLabel }}
        </button>
        <button
          type="button"
          class="btn-primary btn-sm"
          :disabled="chatStore.sending || !inquiryMessage.trim()"
          @click="submitOfflineInquiry"
        >
          <Loader2 v-if="chatStore.sending" class="h-4 w-4 animate-spin" />
          <span v-else>{{ sendInquiryLabel }}</span>
        </button>
      </template>
    </BaseModal>
  </div>

  <div
    v-else-if="loading"
    class="container-wide grid gap-8 py-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]"
  >
    <div class="space-y-4">
      <div class="skeleton aspect-square rounded-[2rem]" />
      <div class="grid grid-cols-4 gap-3">
        <div v-for="i in 4" :key="i" class="skeleton aspect-square rounded-[1.25rem]" />
      </div>
    </div>
    <div class="space-y-4">
      <div class="skeleton h-10 w-32 rounded-full" />
      <div class="skeleton h-14 w-3/4 rounded-2xl" />
      <div class="skeleton h-28 w-full rounded-[1.75rem]" />
      <div class="skeleton h-40 w-full rounded-[1.75rem]" />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import {
  BadgeCheck,
  ClipboardList,
  FileText,
  Image as ImageIcon,
  Loader2,
  MessageSquare,
  Star,
  Store,
  UsersRound
} from 'lucide-vue-next';
import api from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import { useChatStore } from '@/stores/chat';
import { useNotificationStore } from '@/stores/notificationStore';
import { getApiCollection, getApiData } from '@/utils/apiResponse';
import { formatEGPCurrency } from '@/utils/currency';
import { useSeo } from '@/composables/useSeo';
import AppImage from '@/components/ui/AppImage.vue';
import BaseModal from '@/components/ui/BaseModal.vue';
import ProductCard from '@/components/ui/ProductCard.vue';
import ReviewSection from '@/components/reviews/ReviewSection.vue';
import { buildProductPath, buildProductSlug } from '@/utils/routes';

const { locale } = useI18n();
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const chatStore = useChatStore();
const notificationStore = useNotificationStore();

const loading = ref(true);
const product = ref(null);
const productMetrics = ref(null);
const vendorMetrics = ref(null);
const similarProducts = ref([]);
const activeImageIndex = ref(0);
const offlineInquiryOpen = ref(false);
const inquiryMessage = ref('');

const apiOrigin = (() => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
  return apiUrl.replace(/\/api\/v\d+\/?$/, '');
})();

const localizeField = (entity, field, fallback = '') => {
  if (!entity) return fallback;
  const preferred = locale.value === 'ar' ? entity[`${field}_ar`] : entity[`${field}_en`];
  const alternate = locale.value === 'ar' ? entity[`${field}_en`] : entity[`${field}_ar`];
  return preferred || alternate || entity[field] || fallback;
};

const resolveAssetUrl = (src) => {
  if (!src) return '';
  if (/^(https?:)?\/\//i.test(src) || src.startsWith('data:') || src.startsWith('blob:')) return src;
  if (src.startsWith('/')) return `${apiOrigin}${src}`;
  return `${apiOrigin}/${src}`;
};

const galleryImages = computed(() => {
  const productImages = Array.isArray(product.value?.images) ? product.value.images : [];
  const normalized = productImages
    .map((image) => {
      if (typeof image === 'string') {
        return { src: resolveAssetUrl(image), isPrimary: false };
      }

      return {
        src: resolveAssetUrl(image?.image_url || image?.url || ''),
        isPrimary: Boolean(image?.is_main)
      };
    })
    .filter((image) => image.src);

  const fallbackImage = resolveAssetUrl(product.value?.main_image || product.value?.product_image || product.value?.image_url || '');
  if (fallbackImage && !normalized.some((image) => image.src === fallbackImage)) {
    normalized.unshift({ src: fallbackImage, isPrimary: true });
  }

  return normalized.length ? normalized : [{ src: '', isPrimary: true }];
});

const activeImageUrl = computed(() => galleryImages.value[activeImageIndex.value]?.src || '');
const productTitle = computed(() => localizeField(product.value, 'name', product.value?.title || 'Product'));
const productDescription = computed(() => localizeField(product.value, 'description', ''));
const productShortDescription = computed(() => {
  const description = productDescription.value || '';
  if (description.length <= 190) return description;
  return `${description.slice(0, 187).trim()}...`;
});
const productCategory = computed(() => localizeField(
  product.value,
  'category_name',
  product.value?.category || (locale.value === 'ar' ? 'الفئة' : 'Category')
));
const productInitials = computed(() => (
  String(productTitle.value || 'P')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0])
    .join('')
    .toUpperCase() || 'P'
));

const normalizedSpecs = computed(() => {
  const rawSpecs = product.value?.specs;
  if (!rawSpecs) return [];

  let parsed = rawSpecs;
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return [];
    }
  }

  if (Array.isArray(parsed)) {
    return parsed
      .map((item) => ({
        key: locale.value === 'ar'
          ? item?.key_ar || item?.key_en || item?.key
          : item?.key_en || item?.key_ar || item?.key,
        value: locale.value === 'ar'
          ? item?.value_ar || item?.value_en || item?.value
          : item?.value_en || item?.value_ar || item?.value
      }))
      .filter((item) => item.key && item.value);
  }

  if (typeof parsed === 'object') {
    return Object.entries(parsed)
      .map(([key, value]) => ({
        key: key.replace(/_/g, ' '),
        value: typeof value === 'object' ? JSON.stringify(value) : `${value}`
      }))
      .filter((item) => item.key && item.value);
  }

  return [];
});

const formatCurrency = (value) => formatEGPCurrency(Number(value || 0), locale.value);

const displayPrice = computed(() => {
  const min = Number(product.value?.price_min ?? product.value?.price ?? 0);
  const max = Number(product.value?.price_max ?? product.value?.discount_price ?? min);
  if (max > min) {
    return `${formatCurrency(min)} - ${formatCurrency(max)}`;
  }
  return formatCurrency(min);
});

const displayMoq = computed(() => {
  const moq = product.value?.min_order_quantity || product.value?.moq || 1;
  return locale.value === 'ar' ? `الحد الأدنى ${moq} قطعة` : `MOQ ${moq} pcs`;
});

const discountPercent = computed(() => {
  const base = Number(product.value?.price_max || product.value?.price || 0);
  const discount = Number(product.value?.price_min || product.value?.discount_price || 0);
  if (!base || !discount || discount >= base) return 0;
  return Math.round((1 - discount / base) * 100);
});

const availableQuantity = computed(() => Number(product.value?.quantity_available ?? 0));
const displayAvailableQuantity = computed(() => (
  locale.value === 'ar'
    ? `${availableQuantity.value} وحدة`
    : `${availableQuantity.value} units`
));

const productViewsCount = computed(() => Number(productMetrics.value?.views_count || 0));
const productInquiriesCount = computed(() => Number(productMetrics.value?.inquiries_count || 0));

const vendorName = computed(() => localizeField(product.value?.vendor, 'company_name', product.value?.company_name || 'Vendor'));
const vendorLogo = computed(() => resolveAssetUrl(product.value?.vendor?.logo || ''));
const vendorInitial = computed(() => vendorName.value?.charAt(0)?.toUpperCase() || 'V');
const canonicalProductPath = computed(() => (
  product.value ? buildProductPath(product.value) : `/products/${route.params.id}`
));
const isVendorOnline = computed(() => {
  const vendorUserId = product.value?.vendor?.user_id;
  return vendorUserId ? chatStore.isOtherPartyOnline(vendorUserId) : false;
});

const buildProductMetadata = () => ({
  thumbnail: activeImageUrl.value,
  product_id: product.value?.id,
  product_name: productTitle.value,
  product_slug: product.value?.slug,
  product_image: activeImageUrl.value,
  product_url: canonicalProductPath.value,
  priceAtInquiry: displayPrice.value,
  moq: displayMoq.value
});

const buildDefaultInquiryMessage = () => {
  if (locale.value === 'ar') {
    return `مرحبًا، أنا مهتم بهذا المنتج: ${productTitle.value}. أود معرفة السعر النهائي ومدة التوريد والمواصفات المتاحة.`;
  }
  return `Hello, I'm interested in this product: ${productTitle.value}. Please share the latest pricing, lead time, and available specifications.`;
};

const loadProduct = async () => {
  loading.value = true;
  try {
    const productResponse = await api.get(`/products/${route.params.id}`);
    product.value = getApiData(productResponse);
    activeImageIndex.value = 0;

    if (product.value) {
      const nextPath = buildProductPath(product.value);
      const currentSlug = `${route.params.slug || ''}`.trim();
      const expectedSlug = buildProductSlug(product.value);
      const isLegacyRoute = route.name === 'ProductDetailLegacy' || !currentSlug || currentSlug !== expectedSlug;

      if (isLegacyRoute && route.fullPath !== nextPath) {
        void router.replace(nextPath);
      }
    }

    const vendorId = product.value?.vendor?.id;
    const [similarResponse, productMetricsResponse, vendorMetricsResponse] = await Promise.allSettled([
      api.get(`/products/${route.params.id}/similar`),
      api.get(`/products/${route.params.id}/metrics`),
      vendorId ? api.get(`/vendors/${vendorId}/metrics`) : Promise.resolve(null)
    ]);

    similarProducts.value = similarResponse.status === 'fulfilled'
      ? getApiCollection(similarResponse.value, ['products'])
      : [];

    productMetrics.value = productMetricsResponse.status === 'fulfilled'
      ? (getApiData(productMetricsResponse.value) || null)
      : null;

    vendorMetrics.value = vendorMetricsResponse.status === 'fulfilled'
      ? (getApiData(vendorMetricsResponse.value) || null)
      : null;
  } finally {
    loading.value = false;
  }
};

const ensureAuth = () => {
  if (authStore.isAuthenticated) return true;
  router.push('/login');
  return false;
};

const startContextualConversation = async (messageText) => {
  const result = await chatStore.startChat(
    product.value?.vendor?.id,
    product.value?.id,
    messageText,
    'PRODUCT',
    buildProductMetadata()
  );
  const conversation = result?.conversation || result;
  if (conversation?.id) {
    router.push(`/chat?id=${conversation.id}`);
  }
};

const handlePrimaryContact = async () => {
  if (!ensureAuth()) return;
  try {
    await startContextualConversation(buildDefaultInquiryMessage());
  } catch {
    notificationStore.error(locale.value === 'ar' ? 'تعذر بدء المحادثة الآن.' : 'Unable to start chat right now.');
  }
};

const submitOfflineInquiry = async () => {
  if (!ensureAuth()) return;
  try {
    await startContextualConversation((inquiryMessage.value || '').trim() || buildDefaultInquiryMessage());
    offlineInquiryOpen.value = false;
    inquiryMessage.value = '';
  } catch {
    notificationStore.error(locale.value === 'ar' ? 'تعذر بدء المحادثة الآن.' : 'Unable to start chat right now.');
  }
};

const fallbackDash = computed(() => (locale.value === 'ar' ? 'غير متاح' : 'N/A'));
const primaryImageLabel = computed(() => (locale.value === 'ar' ? 'أساسي' : 'Primary'));
const inquiryReadyLabel = computed(() => (locale.value === 'ar' ? 'جاهز للاستفسار والتفاوض' : 'Ready for sourcing inquiry'));
const verifiedLabel = computed(() => (locale.value === 'ar' ? 'موثّق' : 'Verified'));
const priceLabel = computed(() => (locale.value === 'ar' ? 'السعر' : 'Pricing'));
const moqLabel = computed(() => (locale.value === 'ar' ? 'الحد الأدنى' : 'MOQ'));
const availabilityLabel = computed(() => (locale.value === 'ar' ? 'حالة المورد' : 'Supplier status'));
const onlineLabel = computed(() => (locale.value === 'ar' ? 'متصل الآن' : 'Online now'));
const offlineLabel = computed(() => (locale.value === 'ar' ? 'غير متصل' : 'Offline'));
const primaryContactLabel = computed(() => {
  if (isVendorOnline.value) return locale.value === 'ar' ? 'تواصل مع المورد الآن' : 'Contact Supplier';
  return locale.value === 'ar' ? 'أرسل استفسارًا' : 'Send Inquiry';
});
const vendorRatingLabel = computed(() => {
  const rating = vendorMetrics.value?.rating ?? product.value?.vendor?.avg_rating;
  return rating ? `${Number(rating).toFixed(1)} / 5` : fallbackDash.value;
});

const availableQuantityLabel = computed(() => (locale.value === 'ar' ? 'الكمية المتاحة' : 'Available quantity'));
const primaryContactButtonLabel = computed(() => {
  if (isVendorOnline.value) return locale.value === 'ar' ? 'تواصل مع المورد الآن' : 'Contact Supplier';
  return locale.value === 'ar' ? 'أرسل استفسارًا' : 'Send Inquiry';
});
const totalProductsLabel = computed(() => locale.value === 'ar'
  ? `${vendorMetrics.value?.total_products ?? product.value?.vendor?.total_products ?? 0} منتج`
  : `${vendorMetrics.value?.total_products ?? product.value?.vendor?.total_products ?? 0} products`);
const memberSinceLabel = computed(() => {
  const year = product.value?.vendor?.member_since ? new Date(product.value.vendor.member_since).getFullYear() : null;
  return locale.value === 'ar'
    ? `عضو منذ ${year || fallbackDash.value}`
    : `Member since ${year || fallbackDash.value}`;
});
const responseRateLabel = computed(() => (locale.value === 'ar' ? 'معدل الرد' : 'Response rate'));
const viewsLabel = computed(() => (locale.value === 'ar' ? 'المشاهدات' : 'Views'));
const inquiriesLabel = computed(() => (locale.value === 'ar' ? 'الاستفسارات' : 'Inquiries'));
const liveStatusLabel = computed(() => (locale.value === 'ar' ? 'التواجد' : 'Live status'));
const viewStoreLabel = computed(() => (locale.value === 'ar' ? 'عرض متجر المورد' : 'View Store'));
const premiumDetailsLabel = computed(() => (locale.value === 'ar' ? 'عرض احترافي' : 'Premium details'));
const descriptionLabel = computed(() => (locale.value === 'ar' ? 'وصف المنتج' : 'Product description'));
const noDescriptionLabel = computed(() => (locale.value === 'ar' ? 'لا يوجد وصف تفصيلي متاح حاليًا.' : 'No detailed description is available right now.'));
const technicalDataLabel = computed(() => (locale.value === 'ar' ? 'مواصفات ثنائية اللغة' : 'Bilingual specifications'));
const specsLabel = computed(() => (locale.value === 'ar' ? 'المواصفات الفنية' : 'Technical specs'));
const noSpecsLabel = computed(() => (locale.value === 'ar' ? 'لم يتم إضافة مواصفات تفصيلية بعد.' : 'Detailed specs have not been added yet.'));
const exploreMoreLabel = computed(() => (locale.value === 'ar' ? 'خيارات مشابهة' : 'Explore more'));
const similarProductsLabel = computed(() => (locale.value === 'ar' ? 'منتجات مشابهة' : 'Similar products'));
const sourcingFlowLabel = computed(() => (locale.value === 'ar' ? 'آلية العمل' : 'Sourcing flow'));
const inquiryWorkflowLabel = computed(() => (locale.value === 'ar' ? 'كيف تتم الصفقة' : 'How sourcing works'));
const offlineInquiryTitle = computed(() => (locale.value === 'ar' ? 'أرسل استفسارك للمورد' : 'Send your inquiry'));
const inquiryMessageLabel = computed(() => (locale.value === 'ar' ? 'رسالتك' : 'Your message'));
const inquiryPlaceholder = computed(() => (locale.value === 'ar'
  ? 'اكتب ما تحتاجه من سعر، كمية، أو موعد توريد...'
  : 'Tell the supplier what pricing, quantity, or lead time you need...'));
const cancelLabel = computed(() => (locale.value === 'ar' ? 'إلغاء' : 'Cancel'));
const sendInquiryLabel = computed(() => (locale.value === 'ar' ? 'إرسال الاستفسار' : 'Send inquiry'));

const sourcingSteps = computed(() => ([
  {
    icon: MessageSquare,
    title: locale.value === 'ar' ? 'ابدأ باستفسار سياقي' : 'Open a contextual inquiry',
    description: locale.value === 'ar'
      ? 'سيصل للمورد المنتج المقصود مع الصورة والرابط والسعر المرجعي داخل المحادثة.'
      : 'The supplier receives the exact product, image, direct link, and inquiry pricing inside the conversation.'
  },
  {
    icon: ClipboardList,
    title: locale.value === 'ar' ? 'ناقش التفاصيل الفنية' : 'Align on specifications',
    description: locale.value === 'ar'
      ? 'ناقش المواصفات والكمية والمهلة الزمنية قبل تثبيت أي قرار شرائي.'
      : 'Discuss specifications, quantities, and lead times before locking any sourcing decision.'
  },
  {
    icon: UsersRound,
    title: locale.value === 'ar' ? 'قارن واختر المورد' : 'Compare and choose',
    description: locale.value === 'ar'
      ? 'يمكنك مقارنة العروض والردود قبل تحويل الطلب إلى صفقة جادة.'
      : 'Compare offers and response quality before moving forward with a serious sourcing deal.'
  },
  {
    icon: FileText,
    title: locale.value === 'ar' ? 'حوّلها إلى صفقة' : 'Turn it into a deal',
    description: locale.value === 'ar'
      ? 'بعد التوافق، تستمر المتابعة عبر الشات وطلبات الأسعار وسجل الطلبات.'
      : 'Once aligned, continue through chat, quotation requests, and order coordination.'
  }
]));

useSeo(() => ({
  title: `${productTitle.value} | Elmowared`,
  description: productShortDescription.value || productDescription.value || (locale.value === 'ar' ? 'تفاصيل منتج على منصة المورد.' : 'Product details on Elmowared.'),
  image: activeImageUrl.value || vendorLogo.value,
  canonical: canonicalProductPath.value,
  ogType: 'product',
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: productTitle.value,
      description: productShortDescription.value || productDescription.value || '',
      image: activeImageUrl.value ? [activeImageUrl.value] : [],
      sku: String(product.value?.id || route.params.id),
      brand: {
        '@type': 'Brand',
        name: vendorName.value
      },
      offers: {
        '@type': 'Offer',
        priceCurrency: 'EGP',
        price: Number(product.value?.price_min ?? product.value?.price ?? 0) || 0,
        availability: availableQuantity.value > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        url: `${window.location.origin}${canonicalProductPath.value}`
      },
      aggregateRating: Number(product.value?.avg_rating || productMetrics.value?.rating || 0) > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: Number(product.value?.avg_rating || productMetrics.value?.rating || 0).toFixed(1),
            reviewCount: Number(product.value?.review_count || productMetrics.value?.review_count || 0)
          }
        : undefined
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
          name: locale.value === 'ar' ? 'المنتجات' : 'Products',
          item: `${window.location.origin}/products`
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: productTitle.value,
          item: `${window.location.origin}${canonicalProductPath.value}`
        }
      ]
    }
  ]
}));

watch(() => route.params.id, loadProduct);
onMounted(loadProduct);
</script>

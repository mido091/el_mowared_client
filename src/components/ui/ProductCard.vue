<template>
  <router-link :to="productPath" class="group flex self-start flex-col overflow-hidden rounded-[1.35rem] border border-slate-200 bg-white shadow-[0_14px_32px_-28px_rgba(15,23,42,0.28)] transition-all duration-300 hover:-translate-y-1 hover:border-[hsl(var(--primary))]/25 hover:shadow-[0_18px_40px_-28px_rgba(15,23,42,0.32)] dark:border-slate-800 dark:bg-slate-900 font-plex" :dir="locale === 'ar' ? 'rtl' : 'ltr'">
    <div class="relative h-28 overflow-hidden bg-muted/30 sm:h-32 lg:h-28 xl:h-32 2xl:h-24">
      <AppImage
        v-if="displayImage"
        :src="displayImage"
        :alt="productTitle"
        :width="480"
        :height="360"
        sizes="(min-width: 1280px) 22vw, (min-width: 640px) 45vw, 100vw"
        :responsive-widths="[320, 480, 640]"
        img-class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        @error="markImageBroken"
      />
      <div
        v-else
        class="ui-empty-media"
      >
        <div class="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200/70 bg-white/80 text-sm font-black uppercase tracking-[0.18em] shadow-sm dark:border-slate-700 dark:bg-slate-800/80">
          {{ productInitials }}
        </div>
      </div>

      <div class="absolute inset-0 flex items-center justify-center gap-2 bg-primary/0 opacity-0 transition-all duration-300 group-hover:bg-primary/10 group-hover:opacity-100">
        <button
          @click.prevent="comparisonStore.toggle(product)"
          :class="[
            'flex h-8 w-8 items-center justify-center rounded-lg shadow-lg transition-all',
            comparisonStore.isInList(product.id)
              ? 'bg-secondary text-white'
              : 'bg-white/90 text-foreground hover:bg-primary hover:text-white'
          ]"
          :title="t('products.compare')"
        >
          <BarChart2 class="h-4 w-4" />
        </button>
      </div>

      <div v-if="discountPercent > 0" class="absolute end-2 top-2">
        <span class="rounded-full bg-destructive px-2 py-0.5 text-[9px] font-black text-white shadow-sm">
          -{{ discountPercent }}%
        </span>
      </div>

      <div class="absolute start-2 top-2">
        <span class="rounded-full border border-white/60 bg-white/90 px-2 py-1 text-[9px] font-bold text-slate-700 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-200">
          {{ categoryLabel }}
        </span>
      </div>
    </div>

    <div class="flex flex-col p-3">
      <div class="mb-1.5 flex items-center gap-1">
        <VendorBadge v-if="product.vendor?.is_verified" type="verified" />
        <span class="truncate text-[10px] font-medium text-muted-foreground">
          {{ product.vendor?.company_name || product.vendor?.name || product.company_name || '' }}
        </span>
      </div>

      <h3 class="product-title mb-1 min-h-[2.25rem] overflow-hidden text-[13px] font-bold leading-[1.15rem] text-foreground transition-colors group-hover:text-primary">
        {{ productTitle }}
      </h3>

      <StarRating
        v-if="product.avg_rating"
        :modelValue="parseFloat(product.avg_rating)"
        :count="product.review_count"
        class="mb-1.5"
      />

      <div class="border-t border-border/60 pt-2">
        <p class="mb-1 text-[10px] font-bold" :class="stockTone">
          {{ stockLabel }}
        </p>
        <div class="flex items-end justify-between">
          <div class="min-w-0 flex-1">
            <p class="text-[13px] font-black leading-tight text-primary" dir="ltr">
              <template v-if="product.discount_price">
                {{ formatCurrency(product.discount_price) }}
                <span class="ms-1 text-[10px] font-medium text-muted-foreground line-through">
                  {{ formatCurrency(product.price_min || product.price) }}
                </span>
              </template>
              <template v-else>
                {{ formatCurrency(product.price_min || product.price) }}
                <span v-if="product.price_max && product.price_max !== product.price_min" class="text-[10px] font-medium text-muted-foreground">
                  - {{ formatCurrency(product.price_max) }}
                </span>
              </template>
            </p>
            <p v-if="product.moq || product.min_order_quantity" class="mt-0.5 text-[9px] font-medium leading-4 text-muted-foreground">
              {{ t('products.moq_label', { n: product.moq || product.min_order_quantity, u: t('products.pieces') }) }}
            </p>
          </div>

          <div class="ms-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--primary))/0.1] text-[hsl(var(--primary))] transition-all group-hover:bg-primary group-hover:text-white">
            <ArrowRight class="h-3.5 w-3.5 rtl:rotate-180" />
          </div>
        </div>
      </div>
    </div>
  </router-link>
</template>

<script setup>
import { computed, ref } from 'vue';
import { BarChart2, ArrowRight } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';
import { useComparisonStore } from '@/stores/comparison';
import VendorBadge from '@/components/ui/VendorBadge.vue';
import StarRating from '@/components/ui/StarRating.vue';
import AppImage from '@/components/ui/AppImage.vue';
import { formatEGPCurrency } from '@/utils/currency';
import { buildProductPath } from '@/utils/routes';

const props = defineProps({
  product: { type: Object, required: true }
});

const { t, locale } = useI18n();
const comparisonStore = useComparisonStore();
const brokenImage = ref(false);

const apiOrigin = (() => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
  return apiUrl.replace(/\/api\/v\d+\/?$/, '');
})();

const productTitle = computed(() => (
  locale.value === 'ar'
    ? (props.product.name_ar || props.product.name_en || props.product.title || props.product.name || 'Product')
    : (props.product.name_en || props.product.name_ar || props.product.title || props.product.name || 'Product')
));

const productInitials = computed(() => (
  String(productTitle.value || 'P')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'P'
));

const resolveImageUrl = (src) => {
  if (!src) return '';
  if (/^(https?:)?\/\//i.test(src) || src.startsWith('data:') || src.startsWith('blob:')) return src;
  if (src.startsWith('/')) return `${apiOrigin}${src}`;
  return `${apiOrigin}/${src}`;
};

const rawImage = computed(() => (
  props.product.product_image ||
  props.product.main_image ||
  props.product.images?.find?.((item) => item?.is_main)?.image_url ||
  props.product.images?.[0]?.image_url ||
  props.product.images?.[0] ||
  props.product.image_url ||
  ''
));

const displayImage = computed(() => (brokenImage.value ? '' : resolveImageUrl(rawImage.value)));
const productPath = computed(() => buildProductPath(props.product));
const categoryLabel = computed(() => {
  if (props.product.category_name) return props.product.category_name;
  if (!props.product.category) return locale.value === 'ar' ? 'الفئة' : 'Category';
  return t(`categories.${props.product.category}`);
});

const discountPercent = computed(() => {
  const base = Number(props.product.price_max || props.product.price || 0);
  const discount = Number(props.product.price_min || props.product.discount_price || 0);
  if (!base || !discount || discount >= base) return 0;
  return Math.round((1 - discount / base) * 100);
});

const availableQuantity = computed(() => Number(props.product.quantity_available ?? 0));
const stockLabel = computed(() => {
  if (availableQuantity.value <= 0) {
    return locale.value === 'ar' ? 'غير متوفر حالياً' : 'Currently unavailable';
  }
  return locale.value === 'ar'
    ? `المتاح: ${availableQuantity.value}`
    : `In stock: ${availableQuantity.value}`;
});

const stockTone = computed(() => {
  if (availableQuantity.value <= 0) return 'text-rose-600 dark:text-rose-300';
  if (availableQuantity.value < 10) return 'text-orange-600 dark:text-orange-300';
  return 'text-emerald-600 dark:text-emerald-300';
});

const markImageBroken = () => {
  brokenImage.value = true;
};

const formatCurrency = (value) => formatEGPCurrency(value, locale.value);
</script>

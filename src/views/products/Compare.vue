<template>
  <div class="container-wide py-8 font-plex">
    <div class="section-header mb-8">
      <div class="section-accent" />
      <h1 class="section-title">{{ compareTitle }}</h1>
    </div>

    <EmptyState
      v-if="!products.length && !loading"
      :title="emptyTitle"
      :description="emptyDescription"
      :icon="BarChart2"
    >
      <router-link to="/products" class="btn-secondary btn-sm mt-2">
        {{ browseProductsLabel }}
      </router-link>
    </EmptyState>

    <div v-else-if="loading" class="skeleton h-96 rounded-2xl" />

    <div v-else class="overflow-x-auto">
      <table class="w-full min-w-[860px] border-separate border-spacing-y-3">
        <thead>
          <tr>
            <th class="w-44 p-3 text-start text-sm font-bold text-muted-foreground">
              {{ featureLabel }}
            </th>

            <th
              v-for="product in products"
              :key="product.id"
              class="p-3 text-center align-top"
            >
              <div class="card relative p-4">
                <button
                  @click="comparisonStore.remove(product.id)"
                  class="absolute top-3 end-3 flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-red-50 hover:text-red-500"
                  :title="removeLabel"
                >
                  <X class="h-4 w-4" />
                </button>

                <div class="mx-auto mb-3 flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-muted/30">
                  <img
                    v-if="getProductImage(product)"
                    :src="getProductImage(product)"
                    :alt="getProductTitle(product)"
                    class="h-full w-full object-cover"
                  />
                  <div
                    v-else
                    class="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/90 text-lg font-black uppercase tracking-[0.16em] text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {{ getProductInitials(product) }}
                  </div>
                </div>

                <p class="product-title text-sm font-bold text-foreground">
                  {{ getProductTitle(product) }}
                </p>
                <p class="mt-2 text-base font-black text-primary">
                  {{ getPriceLabel(product) }}
                </p>

                <router-link :to="buildProductPath(product)" class="btn-secondary btn-sm mt-3 w-full text-xs">
                  {{ viewDetailsLabel }}
                </router-link>
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr class="bg-muted/20">
            <td colspan="100%" class="px-3 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {{ generalInfoLabel }}
            </td>
          </tr>

          <tr
            v-for="field in coreFields"
            :key="field.key"
            class="border-t border-border transition-colors hover:bg-muted/10"
          >
            <td class="p-3 text-sm font-semibold text-muted-foreground">
              {{ field.label }}
            </td>
            <td
              v-for="product in products"
              :key="`${product.id}-${field.key}`"
              class="p-3 text-center text-sm text-foreground"
            >
              {{ getCoreValue(product, field.key) }}
            </td>
          </tr>

          <tr v-if="specRows.length" class="bg-muted/20">
            <td colspan="100%" class="px-3 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {{ technicalSpecsLabel }}
            </td>
          </tr>

          <tr
            v-for="row in specRows"
            :key="row.key"
            class="border-t border-border transition-colors hover:bg-muted/10"
          >
            <td class="p-3 text-sm font-semibold text-muted-foreground">
              {{ row.label }}
            </td>
            <td
              v-for="product in products"
              :key="`${product.id}-${row.key}`"
              class="p-3 text-center text-sm text-foreground"
            >
              <span :class="isHighlighted(row, product.id) ? 'font-bold text-primary' : 'font-medium'">
                {{ row.valuesByProductId[product.id] || emptyValue }}
              </span>
            </td>
          </tr>

          <tr v-if="!specRows.length" class="border-t border-border">
            <td class="p-3 text-sm font-semibold text-muted-foreground">
              {{ technicalSpecsLabel }}
            </td>
            <td
              v-for="product in products"
              :key="`${product.id}-no-specs`"
              class="p-3 text-center text-sm text-muted-foreground"
            >
              {{ noSpecsLabel }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { BarChart2, X } from 'lucide-vue-next';
import api from '@/services/api';
import { getApiCollection } from '@/utils/apiResponse';
import { buildProductPath } from '@/utils/routes';
import { useComparisonStore } from '@/stores/comparison';
import { formatEGPCurrency } from '@/utils/currency';
import EmptyState from '@/components/ui/EmptyState.vue';

const { t, te, locale } = useI18n();
const comparisonStore = useComparisonStore();

const products = ref([]);
const loading = ref(false);

const apiOrigin = (() => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
  return apiUrl.replace(/\/api\/v\d+\/?$/, '');
})();

const localized = (ar, en) => (locale.value === 'ar' ? ar : en);
const safeT = (key, ar, en) => (te(key) ? t(key) : localized(ar, en));

const compareTitle = computed(() => safeT('products.compareTitle', 'مقارنة المنتجات', 'Compare Products'));
const emptyTitle = computed(() => safeT('products.nothingToCompare', 'لا توجد منتجات للمقارنة', 'Nothing to compare'));
const emptyDescription = computed(() => safeT('products.addProductsToCompare', 'أضف منتجات إلى المقارنة أولًا لعرض الفروقات بينها.', 'Add products to compare first to view differences.'));
const browseProductsLabel = computed(() => safeT('nav.products', 'المنتجات', 'Products'));
const featureLabel = computed(() => safeT('products.feature', 'الميزة', 'Feature'));
const removeLabel = computed(() => safeT('common.remove', 'إزالة', 'Remove'));
const generalInfoLabel = computed(() => localized('معلومات عامة', 'General Info'));
const technicalSpecsLabel = computed(() => localized('المواصفات الفنية', 'Technical Specs'));
const viewDetailsLabel = computed(() => localized('عرض التفاصيل', 'View Details'));
const noSpecsLabel = computed(() => localized('لا توجد مواصفات', 'No specs available'));
const emptyValue = computed(() => localized('—', '—'));
const piecesLabel = computed(() => localized('قطعة', 'pcs'));

const coreFields = computed(() => [
  { key: 'category', label: localized('الفئة', 'Category') },
  { key: 'vendor', label: localized('المورد', 'Vendor') },
  { key: 'price', label: localized('السعر', 'Price') },
  { key: 'moq', label: localized('أقل كمية طلب', 'MOQ') },
  { key: 'avg_rating', label: localized('التقييم', 'Rating') }
]);

const resolveImageUrl = (src) => {
  if (!src) return '';
  if (/^(https?:)?\/\//i.test(src) || src.startsWith('data:') || src.startsWith('blob:')) return src;
  if (src.startsWith('/')) return `${apiOrigin}${src}`;
  return `${apiOrigin}/${src}`;
};

const parseSpecs = (rawSpecs) => {
  if (!rawSpecs) return [];

  let source = rawSpecs;
  if (typeof source === 'string') {
    try {
      source = JSON.parse(source);
    } catch {
      return [];
    }
  }

  if (Array.isArray(source)) {
    return source
      .map((item, index) => {
        if (!item) return null;

        if (typeof item === 'object') {
          const label = locale.value === 'ar'
            ? (item.key_ar || item.key || item.key_en || `${localized('المواصفة', 'Spec')} ${index + 1}`)
            : (item.key_en || item.key || item.key_ar || `${localized('المواصفة', 'Spec')} ${index + 1}`);

          const value = locale.value === 'ar'
            ? (item.value_ar || item.value || item.value_en || '')
            : (item.value_en || item.value || item.value_ar || '');

          return {
            key: String(item.key_en || item.key_ar || item.key || `spec_${index}`),
            label: String(label).trim(),
            value: String(value).trim()
          };
        }

        return {
          key: `spec_${index}`,
          label: `${localized('المواصفة', 'Spec')} ${index + 1}`,
          value: String(item).trim()
        };
      })
      .filter((item) => item?.label && item?.value);
  }

  if (typeof source === 'object') {
    return Object.entries(source)
      .map(([key, value]) => ({
        key,
        label: key.replace(/_/g, ' '),
        value: typeof value === 'object' ? JSON.stringify(value) : String(value ?? '').trim()
      }))
      .filter((item) => item.value);
  }

  return [];
};

const getProductTitle = (product) => (
  locale.value === 'ar'
    ? (product.name_ar || product.name_en || product.title || product.name || localized('منتج', 'Product'))
    : (product.name_en || product.name_ar || product.title || product.name || localized('منتج', 'Product'))
);

const getProductInitials = (product) => (
  String(getProductTitle(product))
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'P'
);

const getProductImage = (product) => resolveImageUrl(
  product.product_image ||
  product.main_image ||
  product.images?.find?.((item) => item?.is_main)?.image_url ||
  product.images?.[0]?.image_url ||
  product.images?.[0] ||
  product.image_url ||
  ''
);

const getCategoryLabel = (product) => (
  locale.value === 'ar'
    ? (product.category_name_ar || product.category_name || product.category_name_en || '')
    : (product.category_name_en || product.category_name || product.category_name_ar || '')
);

const getVendorLabel = (product) => (
  locale.value === 'ar'
    ? (
        product.brand_ar ||
        product.company_name_ar ||
        product.vendor?.company_name_ar ||
        product.vendor?.company_name ||
        product.brand_en ||
        ''
      )
    : (
        product.brand_en ||
        product.company_name_en ||
        product.vendor?.company_name_en ||
        product.vendor?.company_name ||
        product.brand_ar ||
        ''
      )
);

const getPriceLabel = (product) => {
  const min = Number(product.price_min ?? product.price ?? 0);
  const max = Number(product.price_max ?? product.discount_price ?? min);

  if (max > min) {
    return `${formatEGPCurrency(min, locale.value)} - ${formatEGPCurrency(max, locale.value)}`;
  }

  return formatEGPCurrency(min, locale.value);
};

const getMoqValue = (product) => {
  const moq = product.moq || product.min_order_quantity || product.minimum_order_quantity;
  if (!moq) return '';
  return `${moq} ${piecesLabel.value}`;
};

const getRatingValue = (product) => {
  const rating = Number(product.avg_rating || 0);
  return rating ? `${rating.toFixed(1)} ★` : emptyValue.value;
};

const getCoreValue = (product, key) => {
  if (key === 'category') return getCategoryLabel(product) || emptyValue.value;
  if (key === 'vendor') return getVendorLabel(product) || emptyValue.value;
  if (key === 'price') return getPriceLabel(product);
  if (key === 'moq') return getMoqValue(product) || emptyValue.value;
  if (key === 'avg_rating') return getRatingValue(product);
  return product[key] || emptyValue.value;
};

const specRows = computed(() => {
  const rowsMap = new Map();

  products.value.forEach((product) => {
    parseSpecs(product.specs).forEach((spec) => {
      const rowKey = spec.key || spec.label;
      if (!rowsMap.has(rowKey)) {
        rowsMap.set(rowKey, {
          key: rowKey,
          label: spec.label || rowKey,
          valuesByProductId: {}
        });
      }

      rowsMap.get(rowKey).valuesByProductId[product.id] = spec.value || emptyValue.value;
    });
  });

  return Array.from(rowsMap.values());
});

const isHighlighted = (row, productId) => {
  const values = Object.values(row.valuesByProductId || {})
    .map((value) => Number(String(value).replace(/[^\d.]/g, '')))
    .filter((value) => !Number.isNaN(value));

  if (values.length < 2) return false;

  const currentValue = Number(String(row.valuesByProductId?.[productId] || '').replace(/[^\d.]/g, ''));
  if (Number.isNaN(currentValue)) return false;

  return currentValue === Math.max(...values);
};

onMounted(async () => {
  const ids = comparisonStore.ids;

  if (!ids.length) {
    products.value = comparisonStore.products;
    return;
  }

  loading.value = true;
  try {
    const res = await api.get('/products/compare', { params: { ids: ids.join(',') } });
    products.value = getApiCollection(res, ['products', 'items']);
    if (!products.value.length) {
      products.value = comparisonStore.products;
    }
  } catch {
    products.value = comparisonStore.products;
  } finally {
    loading.value = false;
  }
});
</script>

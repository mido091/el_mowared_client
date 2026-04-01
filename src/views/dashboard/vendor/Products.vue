<template>
  <div :dir="locale === 'ar' ? 'rtl' : 'ltr'" class="space-y-8 font-plex animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div v-if="pendingCount > 0" class="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <Clock class="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
      <div>
        <p class="text-sm font-bold text-amber-800">{{ t('products.lifecycle.banner_pending', { n: pendingCount }) }}</p>
        <p class="mt-0.5 text-xs text-amber-600">{{ t('products.lifecycle.banner_pending_desc') }}</p>
      </div>
    </div>

    <div v-if="rejectedProducts.length" class="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
      <AlertCircle class="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
      <div class="flex-1">
        <p class="text-sm font-bold text-rose-800">{{ t('products.lifecycle.banner_rejected', { n: rejectedProducts.length }) }}</p>
        <div class="mt-1 space-y-1">
          <p v-for="product in rejectedProducts.slice(0, 3)" :key="product.id" class="text-xs text-rose-600">
            - {{ displayName(product) }}: <em>{{ product.rejection_reason || t('products.lifecycle.no_reason') }}</em>
          </p>
        </div>
      </div>
    </div>

    <section class="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
      <div class="space-y-1">
        <h1 class="text-3xl font-bold tracking-tight text-[#1e293b] dark:text-slate-100">
          {{ t('vendor.products') }}
        </h1>
        <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
          {{ productsStore.pagination.total }} {{ t('vendor.stats.live_listings') }} - {{ t('vendor.stats.managed_catalog') }}
        </p>
      </div>

      <div class="flex items-center gap-3">
        <div class="relative hidden lg:block">
          <Search :class="['absolute top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400', locale === 'ar' ? 'right-3' : 'left-3']" />
          <input
            v-model="productsStore.filters.search"
            type="text"
            :placeholder="t('common.searchPlaceholder')"
            :class="[
              'h-11 w-80 rounded-xl border border-slate-200 bg-white text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100',
              locale === 'ar' ? 'pe-10 ps-4' : 'ps-10 pe-4'
            ]"
            @input="debounceFetch"
          />
        </div>

        <button
          @click="openCreate"
          class="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white shadow-lg shadow-primary/30 transition hover:opacity-90 active:scale-95"
        >
          <PlusCircle class="h-4 w-4" />
          {{ t('products.addProduct') }}
        </button>
      </div>
    </section>

    <div class="relative lg:hidden">
      <Search :class="['absolute top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400', locale === 'ar' ? 'right-3' : 'left-3']" />
      <input
        v-model="productsStore.filters.search"
        type="text"
        :placeholder="t('common.searchPlaceholder')"
        :class="[
          'h-11 w-full rounded-xl border border-slate-200 bg-white text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100',
          locale === 'ar' ? 'pe-10 ps-4' : 'ps-10 pe-4'
        ]"
        @input="debounceFetch"
      />
    </div>

    <section class="rounded-[1.75rem] border border-slate-200/70 bg-white/85 p-4 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.18)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/75">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar sm:pb-0">
          <button
            v-for="status in statusFilters"
            :key="status.value"
            @click="setLifecycleFilter(status.value)"
            :class="[
              'relative h-10 px-4 text-[10px] font-bold uppercase tracking-[0.18em] transition whitespace-nowrap',
              productsStore.filters.lifecycleStatus === status.value
                ? 'text-secondary dark:text-white'
                : 'text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200'
            ]"
          >
            {{ status.label }}
            <span
              :class="[
                'absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full transition',
                productsStore.filters.lifecycleStatus === status.value ? 'bg-primary' : 'bg-transparent'
              ]"
            ></span>
          </button>
        </div>

        <div class="flex w-full items-center gap-3 sm:w-auto">
          <select
            v-model="productsStore.filters.category"
            class="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-[10px] font-bold uppercase tracking-[0.18em] outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 sm:w-52"
            @change="fetch"
          >
            <option value="">{{ t('common.allCats') }}</option>
            <option v-for="cat in allowedCategories" :key="cat.id" :value="cat.id">
              {{ locale === 'ar' ? cat.name_ar : cat.name_en }}
            </option>
          </select>

          <button
            @click="resetFilters"
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400 transition hover:bg-slate-100 hover:text-[#1e293b] dark:border-slate-700 dark:bg-slate-800 dark:hover:text-slate-100"
          >
            <RefreshCw :class="['h-4 w-4', productsStore.loading ? 'animate-spin' : '']" />
          </button>
        </div>
      </div>
    </section>

    <ProductTable
      :products="productsStore.products"
      :total="productsStore.pagination.total"
      :loading="productsStore.loading"
      :categories="categoryStore.categories"
      @edit="openEdit"
      @delete="handleDelete"
      @toggleStatus="handleToggleStatus"
      @bulkDelete="handleBulkDelete"
      @viewHistory="openHistory"
    />

    <ProductDialog
      v-model="showDialog"
      :product="activeProduct"
      :categories="allowedCategories"
      :saving="saving"
      :field-errors="productsStore.fieldErrors"
      :error-message="productsStore.error"
      @save="handleSave"
      @clear-field-error="clearProductFieldError"
    />

    <StatusHistoryModal
      v-model="showHistory"
      :product-id="historyProduct?.id"
      :product-name="historyProduct ? displayName(historyProduct) : ''"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { AlertCircle, Clock, PlusCircle, RefreshCw, Search } from 'lucide-vue-next';
import api from '@/services/api';
import ProductDialog from '@/components/dashboard/vendor/products/ProductDialog.vue';
import StatusHistoryModal from '@/components/dashboard/vendor/products/StatusHistoryModal.vue';
import ProductTable from '@/components/dashboard/vendor/products/ProductTable.vue';
import { useCategoryStore } from '@/stores/categoryStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { useUiStore } from '@/stores/ui';
import { useVendorProductsStore } from '@/stores/vendorProductsStore';
import { clearFieldError, normalizeError } from '@/utils/errorHandler';

const { t, te, locale } = useI18n();
const productsStore = useVendorProductsStore();
const categoryStore = useCategoryStore();
const uiStore = useUiStore();
const notificationStore = useNotificationStore();

const showDialog = ref(false);
const activeProduct = ref(null);
const saving = ref(false);
const vendorCategoryIds = ref([]);
const showHistory = ref(false);
const historyProduct = ref(null);

const productStatus = (product) => {
  const status = (product?.lifecycle_status || product?.status || 'PENDING').toUpperCase();
  if (status === 'PENDING' && product?.is_edited) return 'UPDATE_PENDING';
  return status;
};
const displayName = (product) => (locale.value === 'ar'
  ? (product?.name_ar || product?.name_en || '-')
  : (product?.name_en || product?.name_ar || '-'));
const lifecycleTabLabel = (status, fallback) => {
  const key = `products.lifecycle.${String(status || '').toLowerCase()}`;
  return te(key) ? t(key) : fallback;
};
const lifecycleFallback = (status) => {
  const fallbacks = {
    APPROVED: locale.value === 'ar' ? 'معتمد' : 'Approved',
    PENDING: locale.value === 'ar' ? 'قيد المراجعة' : 'Pending Review',
    UPDATE_PENDING: locale.value === 'ar' ? 'قيد المراجعة' : 'Under Review',
    REJECTED: locale.value === 'ar' ? 'مرفوض' : 'Rejected',
    DRAFT: locale.value === 'ar' ? 'مسودة' : 'Draft'
  };
  return fallbacks[status] || status;
};

const pendingCount = computed(() => productsStore.products.filter((product) => ['PENDING', 'UPDATE_PENDING'].includes(productStatus(product))).length);
const rejectedProducts = computed(() => productsStore.products.filter((product) => productStatus(product) === 'REJECTED'));

const statusFilters = computed(() => [
  { label: t('common.all'), value: '' },
  { label: lifecycleTabLabel('APPROVED', lifecycleFallback('APPROVED')), value: 'APPROVED' },
  { label: lifecycleTabLabel('PENDING', lifecycleFallback('PENDING')), value: 'PENDING' },
  { label: lifecycleTabLabel('UPDATE_PENDING', lifecycleFallback('UPDATE_PENDING')), value: 'UPDATE_PENDING' },
  { label: lifecycleTabLabel('REJECTED', lifecycleFallback('REJECTED')), value: 'REJECTED' },
  { label: lifecycleTabLabel('DRAFT', lifecycleFallback('DRAFT')), value: 'DRAFT' }
]);

const allowedCategories = computed(() => {
  if (!categoryStore.categories.length) return [];
  if (!vendorCategoryIds.value.length) return categoryStore.categories;
  return categoryStore.categories.filter((category) => vendorCategoryIds.value.includes(category.id));
});

const fetch = () => productsStore.fetchVendorProducts();

let debounceTimer;
const debounceFetch = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(fetch, 400);
};

const setLifecycleFilter = (value) => {
  productsStore.filters.lifecycleStatus = value;
  productsStore.pagination.page = 1;
  fetch();
};

const resetFilters = () => {
  productsStore.filters.search = '';
  productsStore.filters.lifecycleStatus = '';
  productsStore.filters.category = '';
  productsStore.pagination.page = 1;
  fetch();
};

const openCreate = () => {
  activeProduct.value = null;
  productsStore.error = null;
  productsStore.fieldErrors = {};
  showDialog.value = true;
};

const openEdit = (product) => {
  const proceed = () => {
    activeProduct.value = product;
    productsStore.error = null;
    productsStore.fieldErrors = {};
    showDialog.value = true;
  };

  if (productStatus(product) === 'APPROVED') {
    notificationStore.confirm(
      t('products.lifecycle.editApprovedWarning'),
      t('products.lifecycle.title')
    ).then((confirmed) => {
      if (confirmed) proceed();
    });
    return;
  }

  proceed();
};

const openHistory = (product) => {
  historyProduct.value = product;
  showHistory.value = true;
};

const clearProductFieldError = (field) => {
  clearFieldError(productsStore.fieldErrors, field);
};

const buildOptimisticProduct = (formData) => ({
  id: activeProduct.value?.id,
  name_ar: formData.name_ar,
  name_en: formData.name_en || formData.name_ar,
  model_number: (formData.model_number || '').trim() || null,
  description_ar: formData.description_ar,
  description_en: formData.description_en || formData.description_ar,
  category_id: Number(formData.category_id),
  price: Number(formData.price || 0),
  discount_price:
    formData.discount_price === '' || formData.discount_price === null || formData.discount_price === undefined
      ? null
      : Number(formData.discount_price),
  min_order_quantity: Number(formData.min_order_quantity || 1),
  quantity_available: Number(formData.quantity_available || 0),
  specs: formData.specs || [],
  main_image: formData.images?.[0]
    ? URL.createObjectURL(formData.images[0])
    : (activeProduct.value?.main_image || activeProduct.value?.image_url || ''),
  images: activeProduct.value?.images || [],
  views_count: activeProduct.value?.views_count || 0,
  inquiries_count: activeProduct.value?.inquiries_count || 0,
  quality_score: activeProduct.value?.quality_score || null,
  rejection_reason: null,
  is_edited: Boolean(activeProduct.value?.id),
  status: 'PENDING',
  lifecycle_status: 'PENDING'
});

const handleSave = async (formData) => {
  saving.value = true;

  try {
    const optimisticProduct = buildOptimisticProduct(formData);
    const payload = new FormData();
    const imageFiles = Array.isArray(formData.images)
      ? formData.images.filter((file) => typeof File !== 'undefined' && file instanceof File)
      : [];

    payload.append('name_ar', formData.name_ar);
    payload.append('name_en', formData.name_en || formData.name_ar);
    payload.append('modelNumber', (formData.model_number || '').trim());
    payload.append('description_ar', formData.description_ar);
    payload.append('description_en', formData.description_en || formData.description_ar);
    payload.append('price', formData.price);
    if (
      formData.discount_price !== '' &&
      formData.discount_price !== null &&
      formData.discount_price !== undefined
    ) {
      payload.append('discountPrice', formData.discount_price);
    }
    payload.append('minOrderQuantity', formData.min_order_quantity);
    payload.append('quantityAvailable', formData.quantity_available || 0);
    payload.append('categoryId', formData.category_id);
    payload.append('specs', JSON.stringify(formData.specs || []));

    if (imageFiles.length) {
      imageFiles.forEach((file) => payload.append('images', file));
    }

    if (activeProduct.value) {
      await productsStore.updateProduct(activeProduct.value.id, payload, optimisticProduct);
      uiStore.showToast(t('products.updated'), 'success');
    } else {
      await productsStore.createProduct(payload, optimisticProduct);
      uiStore.showToast(t('products.created'), 'success');
    }

    showDialog.value = false;
  } catch (err) {
    const normalized = normalizeError(err);

    if (err?.response?.status === 409) {
      uiStore.showToast(
        normalized.message || {
          en: 'A similar product already exists in your catalog.',
          ar: 'يوجد منتج مشابه بالفعل داخل الكتالوج الخاص بك.'
        },
        'error'
      );
      return;
    }

    if (!normalized.isValidation) {
      uiStore.showToast(normalized.message || t('common.error_occurred'), 'error');
    }
  } finally {
    saving.value = false;
  }
};

const handleDelete = async (product) => {
  if (await notificationStore.confirm(t('products.deleteConfirm'), t('common.delete'))) {
    await productsStore.deleteProduct(product.id);
    uiStore.showToast(t('common.success'), 'success');
  }
};

const handleToggleStatus = async () => {
  uiStore.showToast('Product lifecycle is controlled by moderation.', 'info');
};

const handleBulkDelete = async (ids) => {
  if (await notificationStore.confirm(t('products.bulkDeleteConfirm', { n: ids.length }), t('common.delete'))) {
    await productsStore.bulkDelete(ids);
    uiStore.showToast(t('common.success'), 'success');
  }
};

onMounted(async () => {
  await categoryStore.fetchCategories({ mode: 'revalidate' });

  try {
    const profileRes = await api.get('/vendor/me');
    const vendorData = profileRes?.data?.vendor || profileRes?.vendor || profileRes;
    if (vendorData?.categories) {
      vendorCategoryIds.value = vendorData.categories.map((category) => category.id || category);
    }
  } catch (error) {
    console.error('Failed to fetch vendor mapping', error);
  }

  fetch();
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  height: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.4);
  border-radius: 999px;
}
</style>

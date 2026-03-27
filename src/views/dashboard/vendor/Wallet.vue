<template>
  <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div class="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
      <div>
        <h1 class="text-3xl font-black text-foreground">{{ labels.pageTitle }}</h1>
        <p class="mt-2 text-sm text-muted-foreground">{{ labels.pageSubtitle }}</p>
      </div>

      <button
        @click="openCreateModal"
        :disabled="!productOptions.length"
        class="btn-primary flex h-14 items-center gap-3 rounded-2xl px-8 font-black shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
      >
        <PlusCircle class="h-5 w-5" />
        {{ productOptions.length ? labels.addSale : labels.noProductsToSell }}
      </button>
    </div>

    <div class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
      <div v-for="card in summaryCards" :key="card.key" class="rounded-[2rem] border border-border/60 bg-card/70 p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <div :class="['flex h-12 w-12 items-center justify-center rounded-2xl border', card.iconWrapClass]">
            <component :is="card.icon" class="h-5 w-5" :class="card.iconClass" />
          </div>
          <span class="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{{ card.badge }}</span>
        </div>
        <p class="mt-5 text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">{{ card.label }}</p>
        <p class="mt-2 text-3xl font-black tracking-tight text-foreground">{{ card.value }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-8 xl:grid-cols-[1.6fr_1fr]">
      <section class="overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-sm">
        <div class="flex flex-col gap-4 border-b border-border/60 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 class="text-lg font-black text-foreground">{{ labels.salesLogTitle }}</h2>
            <p class="mt-1 text-sm text-muted-foreground">{{ labels.salesLogSubtitle }}</p>
          </div>
          <div class="flex flex-col gap-3 sm:flex-row">
            <input
              v-model.trim="searchQuery"
              type="text"
              :placeholder="labels.searchPlaceholder"
              class="form-input min-w-[220px]"
            />
          </div>
        </div>

        <div v-if="loading" class="space-y-3 p-6">
          <div v-for="i in 5" :key="i" class="h-20 animate-pulse rounded-2xl bg-muted/40"></div>
        </div>

        <div v-else-if="!filteredSales.length" class="px-6 py-14 text-center">
          <Receipt class="mx-auto h-10 w-10 text-muted-foreground/40" />
          <h3 class="mt-4 text-lg font-black text-foreground">{{ labels.emptySalesTitle }}</h3>
          <p class="mt-2 text-sm text-muted-foreground">{{ labels.emptySalesSubtitle }}</p>
        </div>

        <div v-else class="space-y-4 p-5">
          <article
            v-for="sale in filteredSales"
            :key="sale.id"
            class="overflow-hidden rounded-[1.75rem] border border-border/70 bg-gradient-to-br from-background via-card to-muted/20 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div class="flex flex-col gap-5 p-5 lg:flex-row lg:items-start lg:justify-between">
              <div class="min-w-0 flex-1 space-y-4">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-primary">
                    {{ sale.product_name }}
                  </span>
                  <span class="rounded-full border border-border/70 bg-background px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">
                    {{ formatSaleDate(sale.sale_date) }}
                  </span>
                  <span class="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-600">
                    {{ labels.quantityBadge }} {{ sale.quantity }}
                  </span>
                </div>

                <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <div class="rounded-2xl border border-border/60 bg-card/80 p-4">
                    <p class="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">{{ labels.grossSales }}</p>
                    <p class="mt-2 text-lg font-black text-foreground">{{ formatCurrency(sale.gross_sale_amount) }}</p>
                  </div>
                  <div class="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                    <p class="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">{{ labels.netProfit }}</p>
                    <p class="mt-2 text-lg font-black text-emerald-600">{{ formatCurrency(sale.net_profit) }}</p>
                  </div>
                  <div class="rounded-2xl border border-border/60 bg-card/80 p-4">
                    <p class="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">{{ labels.remainingStock }}</p>
                    <p class="mt-2 text-lg font-black" :class="stockToneClass(sale.current_quantity_available)">
                      {{ sale.current_quantity_available }}
                    </p>
                  </div>
                </div>

                <div
                  v-if="sale.notes"
                  class="rounded-2xl border border-border/50 bg-muted/20 px-4 py-3 text-sm leading-relaxed text-muted-foreground"
                >
                  {{ sale.notes }}
                </div>
              </div>

              <div class="flex w-full flex-col gap-3 lg:w-auto lg:min-w-[180px]">
                <button
                  @click="openEditModal(sale)"
                  class="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-border px-4 text-sm font-black text-foreground transition-colors hover:bg-muted"
                >
                  <Pencil class="h-4 w-4" />
                  {{ labels.edit }}
                </button>
                <button
                  @click="deleteSaleRecord(sale)"
                  class="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-rose-200 px-4 text-sm font-black text-rose-600 transition-colors hover:bg-rose-50"
                >
                  <Trash2 class="h-4 w-4" />
                  {{ labels.delete }}
                </button>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section class="space-y-8">
        <div class="overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-sm">
          <div class="border-b border-border/60 px-6 py-5">
            <h2 class="text-lg font-black text-foreground">{{ labels.stockTitle }}</h2>
            <p class="mt-1 text-sm text-muted-foreground">{{ labels.stockSubtitle }}</p>
          </div>

          <div v-if="loading" class="space-y-3 p-6">
            <div v-for="i in 4" :key="i" class="h-20 animate-pulse rounded-2xl bg-muted/40"></div>
          </div>

          <div v-else-if="!lowStockProducts.length" class="px-6 py-12 text-center">
            <ShieldCheck class="mx-auto h-10 w-10 text-emerald-500/60" />
            <h3 class="mt-4 text-lg font-black text-foreground">{{ labels.noLowStockTitle }}</h3>
            <p class="mt-2 text-sm text-muted-foreground">{{ labels.noLowStockSubtitle }}</p>
          </div>

          <div v-else class="space-y-3 p-5">
            <article
              v-for="product in lowStockProducts"
              :key="product.id"
              class="rounded-2xl border border-border/60 bg-muted/10 p-4"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="font-black text-foreground">{{ product.product_name }}</p>
                  <p class="mt-1 text-xs text-muted-foreground">{{ labels.stockLeft }}: {{ product.quantity_available }}</p>
                </div>
                <span
                  class="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em]"
                  :class="Number(product.quantity_available) === 0
                    ? 'bg-rose-500/10 text-rose-600'
                    : 'bg-amber-500/10 text-amber-600'"
                >
                  {{ Number(product.quantity_available) === 0 ? labels.outOfStock : labels.lowStock }}
                </span>
              </div>
            </article>
          </div>
        </div>
      </section>
    </div>

    <BaseModal
      v-model="showModal"
      :title="editingSaleId ? labels.editModalTitle : labels.createModalTitle"
      size="lg"
      bodyClass="max-h-[72vh] overflow-y-auto px-5 py-6 sm:px-8"
    >
      <form @submit.prevent="submitSale" class="space-y-6">
        <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div ref="productSelectorRef" class="form-group md:col-span-2">
            <label class="form-label">{{ labels.productLabel }}</label>
            <button
              type="button"
              :disabled="!productOptions.length"
              @click="productSelectorOpen = !productSelectorOpen"
              class="flex min-h-[72px] w-full items-center justify-between rounded-[1.5rem] border border-border/70 bg-card/80 px-5 py-4 text-start transition-all hover:border-primary/40 hover:bg-muted/10 disabled:cursor-not-allowed disabled:opacity-60"
              :class="productSelectorOpen ? 'ring-2 ring-primary/20 border-primary/40' : ''"
            >
              <div class="min-w-0">
                <p class="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">{{ labels.productSelectorBadge }}</p>
                <template v-if="selectedProduct">
                  <p class="mt-2 truncate text-base font-black text-foreground">{{ selectedProduct.product_name }}</p>
                  <p class="mt-1 text-sm text-muted-foreground">
                    {{ labels.stockLeft }}: {{ selectedProduct.quantity_available }} • {{ formatCurrency(selectedProduct.price) }}
                  </p>
                </template>
                <template v-else>
                  <p class="mt-2 text-base font-bold text-muted-foreground">{{ labels.productPlaceholder }}</p>
                </template>
              </div>
              <ChevronDown class="h-5 w-5 shrink-0 text-muted-foreground transition-transform" :class="productSelectorOpen ? 'rotate-180 text-primary' : ''" />
            </button>

            <transition name="dropdown-pop">
              <div
                v-if="productSelectorOpen && productOptions.length"
                class="mt-3 max-h-72 overflow-y-auto rounded-[1.5rem] border border-border/70 bg-card/95 p-2 shadow-2xl backdrop-blur"
              >
                <button
                  v-for="product in productOptions"
                  :key="product.id"
                  type="button"
                  @click="selectProduct(product.id)"
                  class="flex w-full items-start justify-between gap-4 rounded-[1.25rem] px-4 py-3 text-start transition-colors hover:bg-muted/40"
                  :class="Number(form.productId) === Number(product.id) ? 'bg-primary/8 ring-1 ring-primary/20' : ''"
                >
                  <div class="min-w-0">
                    <p class="truncate text-sm font-black text-foreground">{{ product.product_name }}</p>
                    <p class="mt-1 text-xs text-muted-foreground">{{ labels.stockLeft }}: {{ product.quantity_available }}</p>
                  </div>
                  <div class="shrink-0 text-end">
                    <p class="text-sm font-black text-foreground">{{ formatCurrency(product.price) }}</p>
                    <p class="mt-1 text-[10px] font-black uppercase tracking-[0.16em]" :class="stockToneClass(product.quantity_available)">
                      {{ Number(product.quantity_available) === 0 ? labels.outOfStock : labels.availableNow }}
                    </p>
                  </div>
                </button>
              </div>
            </transition>
            <p v-if="!productOptions.length" class="mt-2 text-sm text-muted-foreground">
              {{ labels.noProductsHint }}
            </p>
          </div>

          <BaseInput v-model="form.quantity" type="number" min="1" :label="labels.quantityLabel" required />
          <BaseInput v-model="form.saleDate" type="datetime-local" :label="labels.saleDateLabel" required />
          <BaseInput v-model="form.grossSaleAmount" type="number" min="0" step="0.01" :label="labels.grossSalesLabel" required />
          <BaseInput v-model="form.netProfit" type="number" min="0" step="0.01" :label="labels.netProfitLabel" required />
        </div>

        <div class="form-group">
          <label class="form-label">{{ labels.notesLabel }}</label>
          <textarea
            v-model="form.notes"
            rows="4"
            class="form-input resize-none"
            :placeholder="labels.notesPlaceholder"
          ></textarea>
        </div>

        <div v-if="selectedProduct" class="rounded-2xl border border-primary/10 bg-primary/5 p-4">
          <p class="text-[10px] font-black uppercase tracking-[0.16em] text-primary">{{ labels.selectedProduct }}</p>
          <div class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <p class="text-xs text-muted-foreground">{{ labels.currentStock }}</p>
              <p class="mt-1 font-black text-foreground">{{ selectedProduct.quantity_available }}</p>
            </div>
            <div>
              <p class="text-xs text-muted-foreground">{{ labels.productPrice }}</p>
              <p class="mt-1 font-black text-foreground">{{ formatCurrency(selectedProduct.price) }}</p>
            </div>
            <div>
              <p class="text-xs text-muted-foreground">{{ labels.afterSave }}</p>
              <p class="mt-1 font-black" :class="stockToneClass(projectedStock)">
                {{ projectedStock }}
              </p>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 border-t border-border/60 pt-4">
          <button type="button" class="btn-outline px-6 font-black" @click="closeModal">
            {{ labels.cancel }}
          </button>
          <button
            type="submit"
            :disabled="submitting || form.productId === 0"
            class="btn-primary px-8 font-black disabled:opacity-50"
          >
            <Loader2 v-if="submitting" class="h-4 w-4 animate-spin" />
            <span v-else>{{ editingSaleId ? labels.saveChanges : labels.saveSale }}</span>
          </button>
        </div>
      </form>
    </BaseModal>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  Boxes,
  ChevronDown,
  Loader2,
  Package,
  Pencil,
  PlusCircle,
  Receipt,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  TrendingUp
} from 'lucide-vue-next';
import api from '@/services/api';
import { getApiData } from '@/utils/apiResponse';
import { formatEGPCurrency } from '@/utils/currency';
import { useUiStore } from '@/stores/ui';
import { normalizeError } from '@/utils/errorHandler';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseModal from '@/components/ui/BaseModal.vue';

const { locale } = useI18n();
const uiStore = useUiStore();

const loading = ref(true);
const submitting = ref(false);
const showModal = ref(false);
const editingSaleId = ref(null);
const searchQuery = ref('');
const productSelectorOpen = ref(false);
const productSelectorRef = ref(null);

const dashboard = ref({
  summary: {
    total_records: 0,
    sold_products: 0,
    total_quantity: 0,
    total_sales: 0,
    total_profit: 0
  },
  sales: [],
  lowStock: [],
  productOptions: []
});

const form = reactive({
  productId: 0,
  quantity: 1,
  grossSaleAmount: '',
  netProfit: '',
  saleDate: '',
  notes: ''
});

const isArabic = computed(() => locale.value === 'ar');

const labels = computed(() => ({
  pageTitle: isArabic.value ? 'مراجعة المبيعات' : 'Sales Review',
  pageSubtitle: isArabic.value
    ? 'سجّل عمليات البيع اليدوية، راقب الربح الصافي، وتابع المخزون الحقيقي للمنتجات.'
    : 'Track manual sales, real net profit, and actual remaining product stock.',
  addSale: isArabic.value ? 'إضافة عملية بيع' : 'Add Sale',
  noProductsToSell: isArabic.value ? 'أضف منتجات أولًا' : 'Add Products First',
  salesLogTitle: isArabic.value ? 'سجل المبيعات' : 'Sales Log',
  salesLogSubtitle: isArabic.value
    ? 'كل عملية بيع مسجلة هنا تخصم من المخزون الفعلي وتنعكس على الملخصات.'
    : 'Each recorded sale deducts real stock and updates the summary.',
  searchPlaceholder: isArabic.value ? 'ابحث داخل سجل المبيعات...' : 'Search sales log...',
  emptySalesTitle: isArabic.value ? 'لا توجد عمليات بيع مسجلة' : 'No sales recorded yet',
  emptySalesSubtitle: isArabic.value
    ? 'ابدأ بإضافة أول عملية بيع حتى تظهر الملخصات وسجل الربح.'
    : 'Add your first sale to start populating this dashboard.',
  quantityBadge: isArabic.value ? 'الكمية:' : 'Qty:',
  grossSales: isArabic.value ? 'إجمالي البيع' : 'Gross Sale',
  netProfit: isArabic.value ? 'صافي الربح' : 'Net Profit',
  remainingStock: isArabic.value ? 'المخزون المتبقي' : 'Remaining Stock',
  edit: isArabic.value ? 'تعديل' : 'Edit',
  delete: isArabic.value ? 'حذف' : 'Delete',
  stockTitle: isArabic.value ? 'متابعة المخزون' : 'Stock Monitoring',
  stockSubtitle: isArabic.value
    ? 'المنتجات التي وصل مخزونها لأقل من 10 قطع تحتاج متابعة قريبة.'
    : 'Products below 10 units need immediate stock attention.',
  noLowStockTitle: isArabic.value ? 'لا توجد منتجات منخفضة المخزون' : 'No low stock products',
  noLowStockSubtitle: isArabic.value
    ? 'كل المنتجات الحالية أعلى من حد التنبيه.'
    : 'All current products are above the alert threshold.',
  stockLeft: isArabic.value ? 'المتبقي' : 'Left',
  lowStock: isArabic.value ? 'منخفض' : 'Low Stock',
  outOfStock: isArabic.value ? 'نفد' : 'Out of Stock',
  createModalTitle: isArabic.value ? 'إضافة عملية بيع جديدة' : 'Add New Sale',
  editModalTitle: isArabic.value ? 'تعديل عملية البيع' : 'Edit Sale',
  productLabel: isArabic.value ? 'المنتج' : 'Product',
  productPlaceholder: isArabic.value ? 'اختر منتجًا من منتجاتك' : 'Select one of your products',
  productSelectorBadge: isArabic.value ? 'المنتج المختار' : 'Selected Product',
  noProductsHint: isArabic.value
    ? 'لا توجد منتجات معروضة ومعتمدة حاليًا. أضف منتجًا أولًا من صفحة المنتجات.'
    : 'There are no approved active products available yet. Add a product first from your products page.',
  availableNow: isArabic.value ? 'متاح الآن' : 'Available Now',
  quantityLabel: isArabic.value ? 'الكمية' : 'Quantity',
  saleDateLabel: isArabic.value ? 'تاريخ البيع' : 'Sale Date',
  grossSalesLabel: isArabic.value ? 'إجمالي سعر البيع' : 'Gross Sale Amount',
  netProfitLabel: isArabic.value ? 'صافي الربح' : 'Net Profit',
  notesLabel: isArabic.value ? 'ملاحظات' : 'Notes',
  notesPlaceholder: isArabic.value ? 'اكتب أي ملاحظات إضافية تخص عملية البيع...' : 'Add any extra notes for this sale...',
  selectedProduct: isArabic.value ? 'معلومات المنتج المختار' : 'Selected Product',
  currentStock: isArabic.value ? 'المخزون الحالي' : 'Current Stock',
  productPrice: isArabic.value ? 'السعر الحالي للمنتج' : 'Current Product Price',
  afterSave: isArabic.value ? 'المخزون بعد الحفظ' : 'Stock After Save',
  cancel: isArabic.value ? 'إلغاء' : 'Cancel',
  saveSale: isArabic.value ? 'حفظ عملية البيع' : 'Save Sale',
  saveChanges: isArabic.value ? 'حفظ التعديل' : 'Save Changes',
  createSuccess: isArabic.value ? 'تم تسجيل عملية البيع بنجاح.' : 'Sale recorded successfully.',
  updateSuccess: isArabic.value ? 'تم تحديث عملية البيع بنجاح.' : 'Sale updated successfully.',
  deleteSuccess: isArabic.value ? 'تم حذف عملية البيع وإرجاع الكمية للمخزون.' : 'Sale deleted and stock restored successfully.',
  deleteConfirm: isArabic.value ? 'هل تريد حذف عملية البيع هذه؟' : 'Do you want to delete this sale record?',
  genericError: isArabic.value ? 'حدث خطأ غير متوقع. حاول مرة أخرى.' : 'Something went wrong. Please try again.',
  soldProducts: isArabic.value ? 'المنتجات المباعة' : 'Sold Products',
  totalQuantity: isArabic.value ? 'إجمالي الكمية' : 'Total Quantity',
  totalProfit: isArabic.value ? 'إجمالي الربح' : 'Total Profit',
  totalSales: isArabic.value ? 'إجمالي المبيعات' : 'Total Sales',
  totalRecords: isArabic.value ? 'عدد العمليات' : 'Recorded Sales'
}));

const sales = computed(() =>
  dashboard.value.sales.map((sale) => ({
    ...sale,
    product_name: isArabic.value
      ? (sale.product_name_ar || sale.product_name_en || `#${sale.product_id}`)
      : (sale.product_name_en || sale.product_name_ar || `#${sale.product_id}`)
  }))
);

const lowStockProducts = computed(() =>
  dashboard.value.lowStock.map((product) => ({
    ...product,
    product_name: isArabic.value
      ? (product.name_ar || product.name_en || `#${product.id}`)
      : (product.name_en || product.name_ar || `#${product.id}`)
  }))
);

const productOptions = computed(() =>
  dashboard.value.productOptions.map((product) => ({
    ...product,
    product_name: isArabic.value
      ? (product.name_ar || product.name_en || `#${product.id}`)
      : (product.name_en || product.name_ar || `#${product.id}`)
  }))
);

const filteredSales = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return sales.value;

  return sales.value.filter((sale) => {
    const haystack = `${sale.product_name} ${sale.notes || ''}`.toLowerCase();
    return haystack.includes(query);
  });
});

const selectedProduct = computed(() =>
  productOptions.value.find((product) => Number(product.id) === Number(form.productId)) || null
);

const projectedStock = computed(() => {
  if (!selectedProduct.value) return '-';
  const quantity = Number(form.quantity || 0);
  const baseStock = Number(selectedProduct.value.quantity_available || 0);

  if (!editingSaleId.value) return baseStock - quantity;

  const currentSale = sales.value.find((sale) => Number(sale.id) === Number(editingSaleId.value));
  if (!currentSale) return baseStock - quantity;

  if (Number(currentSale.product_id) === Number(selectedProduct.value.id)) {
    return baseStock + Number(currentSale.quantity || 0) - quantity;
  }

  return baseStock - quantity;
});

const summaryCards = computed(() => ([
  {
    key: 'sold_products',
    icon: Package,
    label: labels.value.soldProducts,
    value: Number(dashboard.value.summary.sold_products || 0),
    badge: labels.value.totalRecords,
    iconWrapClass: 'border-primary/20 bg-primary/10',
    iconClass: 'text-primary'
  },
  {
    key: 'total_quantity',
    icon: Boxes,
    label: labels.value.totalQuantity,
    value: Number(dashboard.value.summary.total_quantity || 0),
    badge: labels.value.soldProducts,
    iconWrapClass: 'border-amber-500/20 bg-amber-500/10',
    iconClass: 'text-amber-600'
  },
  {
    key: 'total_profit',
    icon: TrendingUp,
    label: labels.value.totalProfit,
    value: formatCurrency(dashboard.value.summary.total_profit),
    badge: labels.value.netProfit,
    iconWrapClass: 'border-emerald-500/20 bg-emerald-500/10',
    iconClass: 'text-emerald-600'
  },
  {
    key: 'total_sales',
    icon: ShoppingBag,
    label: labels.value.totalSales,
    value: formatCurrency(dashboard.value.summary.total_sales),
    badge: labels.value.grossSales,
    iconWrapClass: 'border-secondary/20 bg-secondary/10',
    iconClass: 'text-secondary'
  },
  {
    key: 'total_records',
    icon: Receipt,
    label: labels.value.totalRecords,
    value: Number(dashboard.value.summary.total_records || 0),
    badge: labels.value.salesLogTitle,
    iconWrapClass: 'border-slate-500/20 bg-slate-500/10',
    iconClass: 'text-slate-600'
  }
]));

const formatCurrency = (value) => formatEGPCurrency(Number(value || 0), locale.value);

const formatSaleDate = (value) => new Date(value).toLocaleString(locale.value === 'ar' ? 'ar-EG' : 'en-EG', {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit'
});

const stockToneClass = (value) => {
  const quantity = Number(value || 0);
  if (quantity === 0) return 'text-rose-600';
  if (quantity < 10) return 'text-amber-600';
  return 'text-foreground';
};

const resetForm = () => {
  editingSaleId.value = null;
  productSelectorOpen.value = false;
  Object.assign(form, {
    productId: 0,
    quantity: 1,
    grossSaleAmount: '',
    netProfit: '',
    saleDate: new Date().toISOString().slice(0, 16),
    notes: ''
  });
};

const closeModal = () => {
  showModal.value = false;
  resetForm();
};

const selectProduct = (productId) => {
  form.productId = Number(productId);
  productSelectorOpen.value = false;
};

const handleOutsideProductSelector = (event) => {
  if (!productSelectorRef.value) return;
  if (!productSelectorRef.value.contains(event.target)) {
    productSelectorOpen.value = false;
  }
};

const fetchDashboard = async () => {
  loading.value = true;
  try {
    const response = await api.get('/vendor/sales-review');
    const payload = getApiData(response) || {};
    dashboard.value = {
      summary: payload.summary || dashboard.value.summary,
      sales: payload.sales || [],
      lowStock: payload.lowStock || [],
      productOptions: payload.productOptions || []
    };
  } catch (error) {
    uiStore.showToast(normalizeError(error).message || labels.value.genericError, 'error');
  } finally {
    loading.value = false;
  }
};

const openCreateModal = () => {
  resetForm();
  showModal.value = true;
};

const openEditModal = (sale) => {
  editingSaleId.value = sale.id;
  Object.assign(form, {
    productId: Number(sale.product_id),
    quantity: Number(sale.quantity),
    grossSaleAmount: Number(sale.gross_sale_amount),
    netProfit: Number(sale.net_profit),
    saleDate: new Date(sale.sale_date).toISOString().slice(0, 16),
    notes: sale.notes || ''
  });
  productSelectorOpen.value = false;
  showModal.value = true;
};

const submitSale = async () => {
  submitting.value = true;
  try {
    const payload = {
      productId: Number(form.productId),
      quantity: Number(form.quantity),
      grossSaleAmount: Number(form.grossSaleAmount),
      netProfit: Number(form.netProfit),
      saleDate: form.saleDate ? new Date(form.saleDate).toISOString().slice(0, 19).replace('T', ' ') : null,
      notes: form.notes?.trim() || null
    };

    if (editingSaleId.value) {
      await api.patch(`/vendor/sales-review/${editingSaleId.value}`, payload);
      uiStore.showToast(labels.value.updateSuccess, 'success');
    } else {
      await api.post('/vendor/sales-review', payload);
      uiStore.showToast(labels.value.createSuccess, 'success');
    }

    closeModal();
    await fetchDashboard();
  } catch (error) {
    uiStore.showToast(normalizeError(error).message || labels.value.genericError, 'error');
  } finally {
    submitting.value = false;
  }
};

const deleteSaleRecord = async (sale) => {
  if (!window.confirm(labels.value.deleteConfirm)) return;

  try {
    await api.delete(`/vendor/sales-review/${sale.id}`);
    uiStore.showToast(labels.value.deleteSuccess, 'success');
    await fetchDashboard();
  } catch (error) {
    uiStore.showToast(normalizeError(error).message || labels.value.genericError, 'error');
  }
};

onMounted(async () => {
  window.addEventListener('click', handleOutsideProductSelector);
  resetForm();
  await fetchDashboard();
});

onBeforeUnmount(() => {
  window.removeEventListener('click', handleOutsideProductSelector);
});
</script>

<style scoped>
.dropdown-pop-enter-active {
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.dropdown-pop-leave-active {
  transition: all 0.12s ease-in;
}

.dropdown-pop-enter-from,
.dropdown-pop-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}
</style>

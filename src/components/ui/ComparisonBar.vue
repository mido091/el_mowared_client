<template>
  <transition name="slide-up">
    <div
      v-if="comparisonStore.count > 0"
      class="fixed bottom-6 left-1/2 z-[200] w-full max-w-xl -translate-x-1/2 px-4"
    >
      <div class="flex items-center gap-3 rounded-2xl border border-secondary/30 bg-card p-3 shadow-2xl shadow-secondary/10">
        <div class="flex flex-1 items-center gap-2 overflow-hidden">
          <div
            v-for="product in comparisonStore.products"
            :key="product.id"
            class="relative shrink-0 group"
          >
            <img
              :src="getProductImage(product)"
              :alt="getProductTitle(product)"
              class="h-12 w-12 rounded-xl border-2 border-secondary/30 object-cover"
            />
            <button
              @click="comparisonStore.remove(product.id)"
              class="absolute -top-1.5 -end-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100"
              :title="removeLabel"
            >
              <X class="h-3 w-3" />
            </button>
          </div>

          <div
            v-for="i in (4 - comparisonStore.count)"
            :key="`empty-${i}`"
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-border"
          >
            <Plus class="h-4 w-4 text-muted-foreground/40" />
          </div>
        </div>

        <div class="flex shrink-0 items-center gap-2">
          <button @click="comparisonStore.clear()" class="btn-ghost btn-sm text-xs text-muted-foreground">
            {{ clearLabel }}
          </button>
          <router-link to="/compare" class="btn-secondary btn-sm text-xs">
            <BarChart2 class="h-4 w-4" />
            {{ compareLabel }} ({{ comparisonStore.count }})
          </router-link>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue';
import { X, Plus, BarChart2 } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';
import { useComparisonStore } from '@/stores/comparison';

const { t, te, locale } = useI18n();
const comparisonStore = useComparisonStore();

const localized = (ar, en) => (locale.value === 'ar' ? ar : en);
const safeT = (key, ar, en) => (te(key) ? t(key) : localized(ar, en));

const clearLabel = computed(() => safeT('common.clear', 'مسح', 'Clear'));
const compareLabel = computed(() => safeT('products.compare', 'مقارنة', 'Compare'));
const removeLabel = computed(() => safeT('common.remove', 'إزالة', 'Remove'));

const apiOrigin = computed(() => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
  return apiUrl.replace(/\/api\/v\d+\/?$/, '');
});

const resolveImageUrl = (src) => {
  if (!src) return 'https://via.placeholder.com/48';
  if (/^(https?:)?\/\//i.test(src) || src.startsWith('data:') || src.startsWith('blob:')) return src;
  if (src.startsWith('/')) return `${apiOrigin.value}${src}`;
  return `${apiOrigin.value}/${src}`;
};

const getProductImage = (product) => resolveImageUrl(
  product.product_image ||
  product.main_image ||
  product.images?.find?.((item) => item?.is_main)?.image_url ||
  product.images?.[0]?.image_url ||
  product.images?.[0] ||
  product.image_url ||
  ''
);

const getProductTitle = (product) => (
  locale.value === 'ar'
    ? (product.name_ar || product.name_en || product.title || product.name || 'منتج')
    : (product.name_en || product.name_ar || product.title || product.name || 'Product')
);
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px) scale(0.95);
}
</style>

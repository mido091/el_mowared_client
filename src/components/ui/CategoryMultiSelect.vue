<template>
  <div ref="containerRef" class="relative w-full">
    <label v-if="label" class="form-label mb-1.5 block">{{ label }}</label>

    <div
      class="min-h-[52px] w-full cursor-pointer rounded-xl border border-input bg-background px-3 py-2 transition-all duration-200 hover:border-ring"
      :class="{ 'border-destructive': error, 'ring-2 ring-ring border-ring': isOpen }"
      @click="isOpen = !isOpen"
    >
      <div v-if="selectedItems.length" class="flex flex-wrap gap-2">
        <div
          v-for="item in selectedItems"
          :key="item.id"
          class="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-secondary/20 bg-secondary/10 px-2.5 py-1 text-xs font-bold text-secondary"
          @click.stop
        >
          <span class="truncate">{{ item.path }}</span>
          <button
            type="button"
            class="rounded-md p-0.5 transition-colors hover:bg-secondary/20"
            @click.stop="removeCategory(item.id)"
          >
            <X class="h-3 w-3" />
          </button>
        </div>
      </div>

      <div v-else class="flex items-center justify-between gap-3">
        <span class="ps-1 text-sm text-muted-foreground">
          {{ placeholder || t('auth.selectCategory') }}
        </span>
        <ChevronDown class="h-4 w-4 text-muted-foreground/60 transition-transform duration-300" :class="{ 'rotate-180 text-secondary': isOpen }" />
      </div>

      <div v-if="selectedItems.length" class="mt-2 flex items-center justify-between gap-3">
        <span class="text-[11px] font-bold text-muted-foreground">
          {{ locale === 'ar' ? `${selectedItems.length} قسم محدد` : `${selectedItems.length} selected` }}
        </span>
        <ChevronDown class="h-4 w-4 text-muted-foreground/60 transition-transform duration-300" :class="{ 'rotate-180 text-secondary': isOpen }" />
      </div>
    </div>

    <p v-if="error" class="mt-1 text-xs font-medium text-destructive">{{ error }}</p>

    <transition name="dropdown-pop">
      <div
        v-if="isOpen"
        class="absolute left-0 right-0 top-full z-[100] mt-2 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-luxury"
      >
        <div class="border-b border-border/40 bg-muted/20 p-3">
          <div class="relative">
            <Search class="absolute start-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              ref="searchInputRef"
              v-model.trim="searchQuery"
              type="text"
              :placeholder="t('common.search')"
              class="w-full rounded-lg border border-input bg-background py-2 pe-4 ps-9 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              @click.stop
            />
          </div>
        </div>

        <div class="grid max-h-[22rem] gap-0" :class="props.rootOnly ? '' : 'md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)]'">
          <div class="border-b border-border/40 p-2 md:border-b-0 md:border-e">
            <div class="mb-2 px-2 text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">
              {{ locale === 'ar' ? 'الأقسام الرئيسية' : 'Main categories' }}
            </div>

            <div class="custom-scrollbar max-h-[10rem] overflow-y-auto md:max-h-[18rem]">
              <button
                v-for="category in filteredRootCategories"
                :key="category.id"
                type="button"
                class="mb-1 flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-start text-sm font-bold transition-all last:mb-0"
                :class="activeParentId === category.id ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted/60'"
                @click.stop="activateParent(category.id)"
              >
                <span class="truncate">{{ category.label }}</span>
                <span class="text-[11px] text-muted-foreground">
                  {{ props.rootOnly ? '' : (getChildren(category.id).length || '') }}
                </span>
              </button>
            </div>
          </div>

          <div v-if="!props.rootOnly" class="p-2">
            <div class="mb-2 flex items-center justify-between gap-3 px-2">
              <div class="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                {{ activeParentChildren.length ? (locale === 'ar' ? 'الأقسام الفرعية' : 'Subcategories') : (locale === 'ar' ? 'التحديد' : 'Selection') }}
              </div>
              <button
                v-if="activeParentId && !activeParentChildren.length"
                type="button"
                class="text-xs font-bold text-primary transition hover:underline"
                @click.stop="toggleCategory(activeParentId)"
              >
                {{ isSelected(activeParentId) ? (locale === 'ar' ? 'إلغاء' : 'Remove') : (locale === 'ar' ? 'اختيار' : 'Select') }}
              </button>
            </div>

            <div class="custom-scrollbar max-h-[18rem] overflow-y-auto">
              <template v-if="activeParentId">
                <div v-if="activeParentChildren.length" class="space-y-1">
                  <button
                    v-for="category in activeParentChildren"
                    :key="category.id"
                    type="button"
                    class="group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-start transition-all"
                    :class="isSelected(category.id) ? 'bg-secondary/10 text-secondary' : 'hover:bg-muted/60 text-foreground'"
                    @click.stop="toggleCategory(category.id)"
                  >
                    <div class="min-w-0">
                      <div class="truncate text-sm font-semibold">{{ category.label }}</div>
                      <div v-if="category.slug" class="mt-1 truncate text-[11px] text-muted-foreground">/{{ category.slug }}</div>
                    </div>
                    <div
                      class="flex h-5 w-5 items-center justify-center rounded-full border transition"
                      :class="isSelected(category.id) ? 'border-secondary bg-secondary text-white' : 'border-border bg-card text-transparent'"
                    >
                      <Check class="h-3 w-3" />
                    </div>
                  </button>
                </div>

                <div v-else class="rounded-2xl border border-dashed border-border/70 bg-muted/15 px-4 py-5 text-center">
                  <p class="text-sm font-semibold text-foreground">{{ activeParentLabel }}</p>
                  <p class="mt-1 text-xs text-muted-foreground">
                    {{ locale === 'ar' ? 'هذا القسم لا يحتوي على أقسام فرعية، ويمكن اختياره مباشرة.' : 'This category has no subcategories and can be selected directly.' }}
                  </p>
                </div>
              </template>

              <div v-else class="rounded-2xl border border-dashed border-border/70 bg-muted/15 px-4 py-10 text-center text-sm text-muted-foreground">
                {{ locale === 'ar' ? 'اختر قسمًا رئيسيًا أولًا' : 'Choose a main category first' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Check, ChevronDown, Search, X } from 'lucide-vue-next';
import { useCategoryStore } from '@/stores/categoryStore';
import { useCategoryHierarchy } from '@/composables/useCategoryHierarchy';

const { t, locale } = useI18n();
const categoryStore = useCategoryStore();

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  label: String,
  placeholder: String,
  error: String,
  rootOnly: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue', 'change']);

const isOpen = ref(false);
const searchQuery = ref('');
const activeParentId = ref(null);
const containerRef = ref(null);
const searchInputRef = ref(null);

const categories = computed(() => categoryStore.localizedCategories(locale.value));
const { rootCategories, getChildren, getCategoryById, getCategoryPathLabel } = useCategoryHierarchy(categories, locale);

const normalizedModelValue = computed(() =>
  [...new Set((props.modelValue || []).map((value) => Number(value)).filter((value) => Number.isFinite(value)))]
);

const filteredRootCategories = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return rootCategories.value;

  return rootCategories.value.filter((category) => {
    const inParent = category.label.toLowerCase().includes(query) || (category.slug || '').toLowerCase().includes(query);
    const inChildren = getChildren(category.id).some((child) =>
      child.label.toLowerCase().includes(query) || (child.slug || '').toLowerCase().includes(query)
    );

    return inParent || inChildren;
  });
});

const activeParentChildren = computed(() => {
  if (props.rootOnly) return [];
  if (!activeParentId.value) return [];

  const query = searchQuery.value.trim().toLowerCase();
  const children = getChildren(activeParentId.value);

  if (!query) return children;

  return children.filter((category) =>
    category.label.toLowerCase().includes(query) || (category.slug || '').toLowerCase().includes(query)
  );
});

const activeParentLabel = computed(() => getCategoryById(activeParentId.value)?.label || '');

const selectedItems = computed(() =>
  normalizedModelValue.value
    .map((id) => ({
      id,
      path: props.rootOnly ? (getCategoryById(id)?.label || '') : getCategoryPathLabel(id),
    }))
    .filter((item) => item.path)
);

const isSelected = (id) => normalizedModelValue.value.includes(Number(id));

const activateParent = (parentId) => {
  const normalizedParentId = Number(parentId);
  activeParentId.value = normalizedParentId;

  if (props.rootOnly) {
    const nextValue = isSelected(normalizedParentId) ? [] : [normalizedParentId];
    emit('update:modelValue', nextValue);
    emit('change', nextValue);
    isOpen.value = false;
  }
};

const toggleCategory = (id) => {
  const normalizedId = Number(id);
  if (props.rootOnly) {
    const nextValue = isSelected(normalizedId) ? [] : [normalizedId];
    emit('update:modelValue', nextValue);
    emit('change', nextValue);
    isOpen.value = false;
    return;
  }

  const nextValue = [...normalizedModelValue.value];
  const index = nextValue.indexOf(normalizedId);

  if (index === -1) {
    nextValue.push(normalizedId);
  } else {
    nextValue.splice(index, 1);
  }

  emit('update:modelValue', nextValue);
  emit('change', nextValue);
};

const removeCategory = (id) => {
  const normalizedId = Number(id);
  const nextValue = normalizedModelValue.value.filter((value) => value !== normalizedId);
  emit('update:modelValue', nextValue);
  emit('change', nextValue);
};

const handleClickOutside = (event) => {
  if (containerRef.value && !containerRef.value.contains(event.target)) {
    isOpen.value = false;
  }
};

watch(isOpen, (open) => {
  if (!open) return;

  searchQuery.value = '';

  if (!activeParentId.value) {
    const firstSelected = normalizedModelValue.value[0];
    const selectedCategory = getCategoryById(firstSelected);
    activeParentId.value = selectedCategory?.parentId ?? selectedCategory?.id ?? rootCategories.value[0]?.id ?? null;
  }

  setTimeout(() => searchInputRef.value?.focus(), 80);
});

watch(
  filteredRootCategories,
  (availableCategories) => {
    if (!availableCategories.length) {
      activeParentId.value = null;
      return;
    }

    const stillVisible = availableCategories.some((category) => category.id === activeParentId.value);
    if (!stillVisible) {
      activeParentId.value = availableCategories[0]?.id ?? null;
    }
  },
  { immediate: true }
);

onMounted(() => {
  window.addEventListener('click', handleClickOutside);
  categoryStore.fetchCategories({ mode: 'revalidate' });
});

onBeforeUnmount(() => {
  window.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.dropdown-pop-enter-active {
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.dropdown-pop-leave-active {
  transition: all 0.12s ease-in;
}

.dropdown-pop-enter-from {
  opacity: 0;
  transform: translateY(-8px) scale(0.97);
}

.dropdown-pop-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.99);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: hsl(var(--border));
  border-radius: 999px;
}
</style>

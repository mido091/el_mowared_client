<template>
  <div ref="rootRef" class="space-y-2">
    <label v-if="label" class="form-label">{{ label }}</label>

    <div class="relative">
      <button
        type="button"
        class="responsive-select-trigger"
        :class="{
          'opacity-60 cursor-not-allowed': disabled,
          'ring-2 ring-primary/20 border-primary/30': open
        }"
        :disabled="disabled"
        @click="toggleOpen"
      >
        <div class="min-w-0 flex-1 text-start">
          <span
            class="block truncate text-sm font-semibold"
            :class="selectedOption ? 'text-foreground' : 'text-muted-foreground'"
          >
            {{ selectedOption?.label || placeholder }}
          </span>
          <span
            v-if="selectedOption?.description"
            class="mt-1 block truncate text-[11px] text-muted-foreground"
          >
            {{ selectedOption.description }}
          </span>
        </div>

        <ChevronDown
          class="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200"
          :class="{ 'rotate-180 text-primary': open }"
        />
      </button>

      <Transition name="slide-down">
        <div
          v-if="open && !isMobile"
          class="absolute inset-x-0 top-full mt-2 layer-dropdown"
        >
          <div class="responsive-select-menu">
            <div v-if="searchable" class="border-b border-border/70 p-3">
              <div class="relative">
                <Search class="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  v-model.trim="search"
                  type="text"
                  :placeholder="searchPlaceholder"
                  class="form-input ps-10"
                />
              </div>
            </div>

            <div class="max-h-72 overflow-y-auto custom-scrollbar p-2">
              <button
                v-for="option in filteredOptions"
                :key="option.key"
                type="button"
                class="responsive-select-option"
                :class="{ 'responsive-select-option-active': isSelected(option.value) }"
                :disabled="option.disabled"
                @click="selectOption(option)"
              >
                <div class="min-w-0 flex-1 text-start">
                  <div class="truncate text-sm font-bold">{{ option.label }}</div>
                  <div
                    v-if="option.description"
                    class="mt-1 truncate text-[11px] text-muted-foreground"
                  >
                    {{ option.description }}
                  </div>
                </div>
                <Check v-if="isSelected(option.value)" class="h-4 w-4 shrink-0 text-primary" />
              </button>

              <div
                v-if="!filteredOptions.length"
                class="rounded-2xl border border-dashed border-border/70 px-4 py-8 text-center text-sm text-muted-foreground"
              >
                {{ emptyLabel }}
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <Transition name="slide-down">
      <div
        v-if="open && isInlineMobile"
        class="layer-dropdown mt-2"
      >
        <div class="responsive-select-menu">
          <div v-if="searchable" class="border-b border-border/70 p-3">
            <div class="relative">
              <Search class="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                v-model.trim="search"
                type="text"
                :placeholder="searchPlaceholder"
                class="form-input ps-10"
              />
            </div>
          </div>

          <div class="max-h-72 overflow-y-auto custom-scrollbar p-2">
            <button
              v-for="option in filteredOptions"
              :key="option.key"
              type="button"
              class="responsive-select-option"
              :class="{ 'responsive-select-option-active': isSelected(option.value) }"
              :disabled="option.disabled"
              @click="selectOption(option)"
            >
              <div class="min-w-0 flex-1 text-start">
                <div class="truncate text-sm font-bold">{{ option.label }}</div>
                <div
                  v-if="option.description"
                  class="mt-1 truncate text-[11px] text-muted-foreground"
                >
                  {{ option.description }}
                </div>
              </div>
              <Check v-if="isSelected(option.value)" class="h-4 w-4 shrink-0 text-primary" />
            </button>

            <div
              v-if="!filteredOptions.length"
              class="rounded-2xl border border-dashed border-border/70 px-4 py-8 text-center text-sm text-muted-foreground"
            >
              {{ emptyLabel }}
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <Teleport to="body">
      <Transition name="fade">
        <div v-if="open && usesMobileSheet" class="fixed inset-0 layer-modal">
          <button
            type="button"
            class="absolute inset-0 w-full h-full bg-slate-900/40"
            aria-label="Close selector"
            @click="close"
          />

          <div class="bottom-sheet-panel absolute inset-x-0 bottom-0">
            <div class="mb-4 flex items-center justify-between gap-3">
              <div>
                <p class="ui-kicker-primary">{{ sheetKicker }}</p>
                <h3 class="mt-1 text-lg font-black text-foreground">
                  {{ sheetTitle || label || placeholder }}
                </h3>
              </div>

              <button
                type="button"
                class="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-muted/50 text-muted-foreground transition hover:border-primary/30 hover:text-primary"
                @click="close"
              >
                <X class="h-4 w-4" />
              </button>
            </div>

            <div v-if="searchable" class="mb-4">
              <div class="relative">
                <Search class="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  v-model.trim="search"
                  type="text"
                  :placeholder="searchPlaceholder"
                  class="form-input ps-10"
                />
              </div>
            </div>

            <div class="max-h-[55vh] overflow-y-auto custom-scrollbar pe-1">
              <button
                v-for="option in filteredOptions"
                :key="option.key"
                type="button"
                class="responsive-sheet-option"
                :class="{ 'responsive-sheet-option-active': isSelected(option.value) }"
                :disabled="option.disabled"
                @click="selectOption(option)"
              >
                <div class="min-w-0 flex-1 text-start">
                  <div class="truncate text-base font-black">{{ option.label }}</div>
                  <div
                    v-if="option.description"
                    class="mt-1 truncate text-xs text-muted-foreground"
                  >
                    {{ option.description }}
                  </div>
                </div>
                <span
                  class="flex h-6 w-6 items-center justify-center rounded-full border transition"
                  :class="isSelected(option.value)
                    ? 'border-primary bg-primary text-white'
                    : 'border-border bg-card text-transparent'"
                >
                  <Check class="h-3.5 w-3.5" />
                </span>
              </button>

              <div
                v-if="!filteredOptions.length"
                class="rounded-3xl border border-dashed border-border/70 px-4 py-10 text-center text-sm text-muted-foreground"
              >
                {{ emptyLabel }}
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { Check, ChevronDown, Search, X } from 'lucide-vue-next';
import { useMediaQuery } from '@/composables/useMediaQuery';

const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean, Object],
    default: null,
  },
  options: {
    type: Array,
    default: () => [],
  },
  label: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: 'Select an option',
  },
  searchPlaceholder: {
    type: String,
    default: 'Search...',
  },
  emptyLabel: {
    type: String,
    default: 'No options found.',
  },
  sheetTitle: {
    type: String,
    default: '',
  },
  sheetKicker: {
    type: String,
    default: 'Selector',
  },
  searchable: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  mobileBehavior: {
    type: String,
    default: 'sheet',
  },
});

const emit = defineEmits(['update:modelValue', 'change']);

const rootRef = ref(null);
const open = ref(false);
const search = ref('');
const isMobile = useMediaQuery('(max-width: 767px)');
const previousBodyOverflow = ref('');
const isInlineMobile = computed(() => isMobile.value && props.mobileBehavior === 'inline');
const usesMobileSheet = computed(() => isMobile.value && !isInlineMobile.value);

const normalizedOptions = computed(() =>
  props.options.map((option, index) => {
    if (typeof option === 'object' && option !== null) {
      return {
        key: option.key ?? `${index}-${option.value}`,
        label: option.label ?? option.name ?? String(option.value ?? ''),
        value: option.value ?? null,
        description: option.description ?? '',
        disabled: !!option.disabled,
      };
    }

    return {
      key: `${index}-${option}`,
      label: String(option),
      value: option,
      description: '',
      disabled: false,
    };
  })
);

const selectedOption = computed(() =>
  normalizedOptions.value.find((option) => sameValue(option.value, props.modelValue)) || null
);

const filteredOptions = computed(() => {
  if (!props.searchable || !search.value) return normalizedOptions.value;

  const query = search.value.toLowerCase();
  return normalizedOptions.value.filter((option) => {
    return `${option.label} ${option.description}`.toLowerCase().includes(query);
  });
});

function sameValue(left, right) {
  if (left == null && right == null) return true;
  if (typeof left === 'number' || typeof right === 'number') {
    return Number(left) === Number(right);
  }
  return String(left) === String(right);
}

function isSelected(value) {
  return sameValue(value, props.modelValue);
}

function toggleOpen() {
  if (props.disabled) return;
  open.value = !open.value;
}

function close() {
  open.value = false;
}

function selectOption(option) {
  if (option.disabled) return;
  emit('update:modelValue', option.value);
  emit('change', option.value);
  close();
}

function handleOutsideClick(event) {
  if (!open.value || usesMobileSheet.value) return;
  if (!rootRef.value?.contains(event.target)) {
    close();
  }
}

function handleEscape(event) {
  if (event.key === 'Escape') {
    close();
  }
}

watch(open, (value) => {
  if (!value) {
    search.value = '';
  }

  if (typeof document !== 'undefined' && usesMobileSheet.value) {
    if (value) {
      previousBodyOverflow.value = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = previousBodyOverflow.value;
    }
  }
});

watch(isMobile, (value) => {
  if (!value && typeof document !== 'undefined') {
    document.body.style.overflow = previousBodyOverflow.value;
  }
});

onMounted(() => {
  document.addEventListener('mousedown', handleOutsideClick);
  document.addEventListener('keydown', handleEscape);
});

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleOutsideClick);
  document.removeEventListener('keydown', handleEscape);
  if (typeof document !== 'undefined') {
    document.body.style.overflow = previousBodyOverflow.value;
  }
});
</script>

<template>
  <ResponsiveSelect
    :model-value="normalizedValue"
    :label="labelText"
    :options="options"
    :placeholder="placeholderText"
    :sheet-title="labelText"
    :sheet-kicker="labelText"
    mobile-behavior="inline"
    searchable
    @update:model-value="handleUpdate"
  />
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import ResponsiveSelect from '@/components/ui/ResponsiveSelect.vue';

const { t, locale } = useI18n();

const props = defineProps({
  modelValue: [String, Number],
  categories: { type: Array, default: () => [] },
  placeholder: String,
  label: String,
});

const emit = defineEmits(['update:modelValue']);

const normalizedValue = computed(() => {
  if (props.modelValue === '' || props.modelValue == null) return '';
  return String(props.modelValue);
});

const labelText = computed(() => props.label || t('auth.category'));
const placeholderText = computed(() => props.placeholder || t('products.selectCategory'));

const options = computed(() =>
  props.categories.map((category) => ({
    value: String(category.id),
    label: locale.value === 'ar'
      ? (category.name_ar || category.name || category.name_en || '')
      : (category.name_en || category.name || category.name_ar || ''),
    description: category.slug ? `/${category.slug}` : '',
  }))
);

const handleUpdate = (value) => {
  emit('update:modelValue', value === '' ? '' : Number(value));
};
</script>

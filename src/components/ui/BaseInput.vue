<template>
  <div class="form-group">
    <label v-if="label" :for="id" class="form-label">
      {{ label }}
      <span v-if="required" class="text-destructive ms-0.5">*</span>
    </label>
    <div class="relative">
      <div v-if="$slots.prefix" class="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
        <slot name="prefix" />
      </div>
      <input
        v-bind="$attrs"
        :id="id"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :aria-invalid="!!error"
        :aria-describedby="error ? `${id}-error` : (hint ? `${id}-hint` : undefined)"
        :class="[
          'form-input',
          $slots.prefix ? 'ps-10' : '',
          $slots.suffix ? 'pe-10' : '',
          error ? 'form-input-error' : '',
        ]"
        @input="$emit('update:modelValue', $event.target.value)"
      />
      <div v-if="$slots.suffix" class="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        <slot name="suffix" />
      </div>
    </div>
    <p v-if="error" :id="`${id}-error`" class="form-error" role="alert">{{ error }}</p>
    <p v-else-if="hint" :id="`${id}-hint`" class="form-hint">{{ hint }}</p>
  </div>
</template>

<script setup>
defineProps({
  id:          { type: String, default: () => `input-${Math.random().toString(36).slice(2,8)}` },
  label:       { type: String, default: '' },
  modelValue:  { type: [String, Number], default: '' },
  type:        { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  error:       { type: String, default: '' },
  hint:        { type: String, default: '' },
  disabled:    { type: Boolean, default: false },
  required:    { type: Boolean, default: false },
});
defineEmits(['update:modelValue']);
defineOptions({ inheritAttrs: false });
</script>

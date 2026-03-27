<template>
  <div class="flex items-center justify-center gap-1 sm:gap-2" :dir="'ltr'">
    <input
      v-for="(digit, index) in digits"
      :key="index"
      ref="inputRefs"
      v-model="digits[index]"
      type="text"
      inputmode="numeric"
      pattern="[0-9]*"
      maxlength="1"
      class="w-10 h-12 p-0 sm:w-12 sm:h-14 text-center text-2xl sm:text-3xl font-black rounded-xl sm:rounded-2xl border-2 transition-all duration-300 outline-none
             bg-card/50 text-[#1e293b] shadow-sm focus:border-[#06b6d4] focus:ring-8 focus:ring-[#06b6d4]/10
             disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-muted-foreground/20"
      :class="errors ? 'border-destructive bg-destructive/5 focus:border-destructive focus:ring-destructive/10' : 'border-border/50 hover:border-border'"
      :disabled="disabled"
      placeholder="•"
      @input="onInput(index, $event)"
      @keydown="onKeyDown(index, $event)"
      @paste.prevent="onPaste"
      @focus="onFocus"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  length: {
    type: Number,
    default: 6,
  },
  errors: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  autoFocus: {
    type: Boolean,
    default: true,
  }
});

const emit = defineEmits(['update:modelValue', 'complete']);

const digits = ref(Array(props.length).fill(''));
const inputRefs = ref([]);

// Watch external value changes (e.g., clearing the form)
watch(() => props.modelValue, (newVal) => {
  if (!newVal) {
    digits.value = Array(props.length).fill('');
  } else if (newVal.length === props.length && newVal !== digits.value.join('')) {
    digits.value = newVal.split('');
  }
});

onMounted(() => {
  if (props.autoFocus && inputRefs.value[0]) {
    // Small delay to ensure modal transition finishes
    setTimeout(() => {
      inputRefs.value[0].focus();
    }, 100);
  }
});

const updateValue = () => {
  const code = digits.value.join('');
  emit('update:modelValue', code);
  if (code.length === props.length) {
    emit('complete', code);
  }
};

const onInput = (index, event) => {
  const v = event.target.value.replace(/\D/g, ''); // Ensure numeric only
  digits.value[index] = v.slice(-1); // Take last digit if multiple were somehow entered

  if (v && index < props.length - 1) {
    inputRefs.value[index + 1]?.focus();
  }
  updateValue();
};

const onKeyDown = (index, event) => {
  // Handle Backspace
  if (event.key === 'Backspace' && !digits.value[index] && index > 0) {
    inputRefs.value[index - 1]?.focus();
    digits.value[index - 1] = '';
    updateValue();
  }
  
  // Left arrow
  if (event.key === 'ArrowLeft' && index > 0) {
    inputRefs.value[index - 1]?.focus();
  }
  
  // Right arrow
  if (event.key === 'ArrowRight' && index < props.length - 1) {
    inputRefs.value[index + 1]?.focus();
  }
};

const onPaste = (event) => {
  const paste = (event.clipboardData || window.clipboardData).getData('text');
  const numbersOnly = paste.replace(/\D/g, '').slice(0, props.length);
  
  if (numbersOnly.length > 0) {
    const chars = numbersOnly.split('');
    for (let i = 0; i < props.length; i++) {
      digits.value[i] = chars[i] || '';
    }
    
    // Focus the next empty input or the last one
    const nextIndex = Math.min(chars.length, props.length - 1);
    inputRefs.value[nextIndex]?.focus();
    
    updateValue();
  }
};

const onFocus = (event) => {
  event.target.select();
};
</script>

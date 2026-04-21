<template>
  <div class="relative h-full" ref="containerRef">
    <!-- Trigger -->
    <div
      @click="isOpen = !isOpen"
      class="h-full flex items-center justify-between gap-3 px-6 cursor-pointer hover:bg-muted/30 transition-all select-none group"
      :class="{ 'bg-muted/40': isOpen }"
    >
      <span class="text-[13px] font-bold text-foreground truncate max-w-[120px]">
        {{ modelValue || placeholder }}
      </span>
      <ChevronDown 
        class="w-3.5 h-3.5 text-muted-foreground/60 transition-transform duration-300"
        :class="{ 'rotate-180 text-secondary': isOpen }"
      />
    </div>

    <!-- Dropdown Menu -->
    <transition name="dropdown-pop">
      <div
        v-if="isOpen"
        class="absolute top-full mt-2 min-w-[220px] bg-card border border-border/40 rounded-2xl shadow-luxury z-[60] py-2 overflow-hidden"
        :class="align === 'right' ? 'end-0' : 'start-0'"
      >
        <div class="max-h-[300px] overflow-y-auto custom-scrollbar">
          <div
            v-for="option in options"
            :key="option.value"
            @click="selectOption(option)"
            class="px-5 py-3 flex items-center justify-between group cursor-pointer hover:bg-muted/40 transition-all"
            :class="{ 'bg-primary/5 text-secondary': modelValue === option.label }"
          >
            <span class="text-[13px] font-bold whitespace-nowrap">
              {{ option.label }}
            </span>
            <Check 
              v-if="modelValue === option.label" 
              class="w-4 h-4 text-secondary stroke-[3px]" 
            />
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { ChevronDown, Check } from 'lucide-vue-next';

const props = defineProps({
  modelValue: String,
  options: Array, // Array of { label, value }
  placeholder: String,
  align: { type: String, default: 'left' }
});

const emit = defineEmits(['update:modelValue', 'change']);

const isOpen = ref(false);
const containerRef = ref(null);

const selectOption = (option) => {
  emit('update:modelValue', option.label);
  emit('change', option.value);
  isOpen.value = false;
};

const handleClickOutside = (e) => {
  if (containerRef.value && !containerRef.value.contains(e.target)) {
    isOpen.value = false;
  }
};

onMounted(() => window.addEventListener('click', handleClickOutside));
onBeforeUnmount(() => window.removeEventListener('click', handleClickOutside));
</script>

<style scoped>
.dropdown-pop-enter-active {
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.dropdown-pop-leave-active {
  transition: all 0.1s ease-in;
  pointer-events: none;
}
.dropdown-pop-enter-from {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}
.dropdown-pop-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}

/* Custom Scrollbar for Dropdown */
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(var(--primary), 0.1);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--primary), 0.2);
}
</style>

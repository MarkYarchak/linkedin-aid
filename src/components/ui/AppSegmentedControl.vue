<script lang="ts" setup>
interface Option {
  label: string;
  value: string;
}

interface Props {
  modelValue: string;
  options: Option[];
}

defineProps<Props>();
const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <div class="app-segmented-control">
    <button
      v-for="option in options"
      :key="option.value"
      :class="['segmented-button', { active: modelValue === option.value }]"
      @click="emit('update:modelValue', option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<style scoped>
.app-segmented-control {
  display: flex;
  background: #f1f5f9;
  padding: 2px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.segmented-button {
  flex: 1;
  padding: 4px 12px;
  border: none;
  background: transparent;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  border-radius: 4px;
  white-space: nowrap;
  user-select: none;
}

.segmented-button.active {
  background: white;
  color: #0a66c2;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.segmented-button:hover:not(.active) {
  color: #1e293b;
}
</style>

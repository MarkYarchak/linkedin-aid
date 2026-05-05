<script lang="ts" setup>
interface Props {
  modelValue: boolean;
  label?: string;
}

const props = defineProps<Props>();
const emit = defineEmits(['update:modelValue']);

const toggle = () => {
  emit('update:modelValue', !props.modelValue);
};
</script>

<template>
  <label class="app-checkbox" @click.prevent="toggle">
    <div :class="['checkbox-box', { checked: modelValue }]">
      <svg v-if="modelValue" viewBox="0 0 24 24" class="check-icon">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor" />
      </svg>
    </div>
    <span v-if="label" class="checkbox-label">{{ label }}</span>
  </label>
</template>

<style scoped>
.app-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
  font-size: 0.9rem;
  padding: 4px 0;
}

.checkbox-box {
  width: 18px;
  height: 18px;
  border: 2px solid #cbd5e1;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  background: white;
  flex-shrink: 0;
}

.checkbox-box.checked {
  background: #0a66c2;
  border-color: #0a66c2;
}

.check-icon {
  width: 14px;
  height: 14px;
  color: white;
}

.checkbox-label {
  color: #334155;
  line-height: 1.2;
}

.app-checkbox:hover .checkbox-box {
  border-color: #0a66c2;
}
</style>

<script lang="ts" setup>
interface Props {
  modelValue: any;
  value: any;
  label?: string;
}

const props = defineProps<Props>();
const emit = defineEmits(['update:modelValue']);

const select = () => {
  emit('update:modelValue', props.value);
};
</script>

<template>
  <label class="app-radio" @click.prevent="select">
    <div :class="['radio-circle', { checked: modelValue === value }]">
      <div v-if="modelValue === value" class="radio-inner"></div>
    </div>
    <div v-if="$slots.default || label" class="radio-label">
      <slot>{{ label }}</slot>
    </div>
  </label>
</template>

<style scoped>
.app-radio {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  user-select: none;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.app-radio:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.app-radio:has(.radio-circle.checked) {
  border-color: #0a66c2;
  background: #f0f7ff;
}

.radio-circle {
  width: 18px;
  height: 18px;
  border: 2px solid #cbd5e1;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  background: white;
  flex-shrink: 0;
  margin-top: 2px;
}

.radio-circle.checked {
  border-color: #0a66c2;
}

.radio-inner {
  width: 10px;
  height: 10px;
  background: #0a66c2;
  border-radius: 50%;
}

.radio-label {
  color: #334155;
  font-size: 0.9rem;
  line-height: 1.4;
}
</style>

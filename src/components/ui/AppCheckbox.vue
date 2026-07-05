<script lang="ts" setup>
interface Props {
  modelValue: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
});
const emit = defineEmits(['update:modelValue']);

const toggle = () => {
  emit('update:modelValue', !props.modelValue);
};
</script>

<template>
  <label :class="['app-checkbox', `size-${size}`]">
    <input
      type="checkbox"
      class="checkbox-input"
      :checked="modelValue"
      @change="toggle"
    />
    <div :class="['checkbox-box', { checked: modelValue }]">
      <svg v-if="modelValue" viewBox="0 0 24 24" class="check-icon">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor" />
      </svg>
    </div>
    <span v-if="label || $slots.default" class="checkbox-label">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<style scoped>
.app-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
  padding: 4px 0;
  width: fit-content;
}

.checkbox-input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.app-checkbox.size-sm {
  font-size: 0.8rem;
  gap: 8px;
}

.app-checkbox.size-md {
  font-size: 0.9rem;
  gap: 10px;
}

.app-checkbox.size-lg {
  font-size: 1rem;
  gap: 12px;
}

.checkbox-box {
  border: 2px solid #cbd5e1;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  background: white;
  flex-shrink: 0;
}

.size-sm .checkbox-box {
  width: 14px;
  height: 14px;
  border-width: 1.5px;
  border-radius: 3px;
}

.size-md .checkbox-box {
  width: 18px;
  height: 18px;
}

.size-lg .checkbox-box {
  width: 22px;
  height: 22px;
}

.checkbox-box.checked {
  background: #0a66c2;
  border-color: #0a66c2;
}

.checkbox-input:focus-visible + .checkbox-box {
  outline: 2px solid #0a66c2;
  outline-offset: 2px;
}

.check-icon {
  color: white;
}

.size-sm .check-icon {
  width: 10px;
  height: 10px;
}

.size-md .check-icon {
  width: 14px;
  height: 14px;
}

.size-lg .check-icon {
  width: 18px;
  height: 18px;
}

.checkbox-label {
  color: #334155;
  line-height: 1.2;
}

.app-checkbox:hover .checkbox-box {
  border-color: #0a66c2;
}
</style>

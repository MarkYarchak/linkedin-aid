<script lang="ts" setup>
interface Props {
  selected?: boolean;
}

defineProps<Props>();
defineEmits(['toggle']);
</script>

<template>
  <div
    :class="['selectable-item', { selected }]"
    @click="$emit('toggle')"
  >
    <div class="selectable-item__content">
      <slot />
    </div>
    <div v-if="selected" class="selected-indicator">
      <svg viewBox="0 0 24 24" class="check-icon">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor" />
      </svg>
    </div>
  </div>
</template>

<style scoped>
.selectable-item {
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.selectable-item:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}

.selectable-item.selected {
  border-color: #0a66c2;
  background: #f0f7ff;
}

.selectable-item__content {
  flex: 1;
  font-size: 0.85rem;
  color: #334155;
  line-height: 1.5;
}

.selected-indicator {
  width: 20px;
  height: 20px;
  background: #0a66c2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.check-icon {
  width: 14px;
  height: 14px;
}
</style>

<script lang="ts" setup>
interface Props {
  selected?: boolean;
  label: string;
}

defineProps<Props>();
defineEmits(['toggle']);
</script>

<template>
  <button
    type="button"
    :class="['app-tag', { selected }]"
    @click="$emit('toggle')"
  >
    {{ label }}
  </button>
</template>

<style scoped>
.app-tag {
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  background: white;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  color: #475569;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.app-tag:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}

.app-tag.selected {
  background: #0a66c2;
  color: white;
  border-color: #0a66c2;
  box-shadow: 0 2px 4px rgba(10, 102, 194, 0.2);
}
</style>

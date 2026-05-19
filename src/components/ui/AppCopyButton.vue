<script lang="ts" setup>
import IconCopy from '@/components/icons/IconCopy.vue';

interface Props {
  label?: string;
  primary?: boolean;
}

withDefaults(defineProps<Props>(), {
  label: 'Copy info',
  primary: false,
});

const emit = defineEmits(['click']);
</script>

<template>
  <button
    type="button"
    :class="['app-copy-button', { '_primary': primary }]"
    @click="emit('click')"
  >
    <IconCopy :size="14" />
    <span>{{ label }}</span>
  </button>
</template>

<style scoped>
.app-copy-button {
  display: inline-flex;
  align-items: center;
  text-wrap: nowrap;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  background: white;
  color: #475569;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  line-height: 1;
}

.app-copy-button:hover {
  background: #f8fafc;
  border-color: #94a3b8;
  color: #1e293b;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.app-copy-button._primary {
  background: #0a66c2;
  border-color: #0a66c2;
  color: white;
}

.app-copy-button._primary:hover {
  background: #004182;
  border-color: #004182;
}

.app-copy-button i {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

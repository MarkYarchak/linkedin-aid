<script lang="ts" setup>
import IconCross from '@/components/icons/IconCross.vue';

interface Props {
  show: boolean;
  title?: string;
  maxWidth?: string;
}

defineProps<Props>();
const emit = defineEmits(['close']);
</script>

<template>
  <div v-if="show" class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content" :style="{ maxWidth: maxWidth || '400px' }">
      <div class="modal-header">
        <slot name="header">
          <h3 v-if="title">{{ title }}</h3>
        </slot>
        <button class="close-btn" @click="emit('close')">
          <IconCross size="20" />
        </button>
      </div>

      <div class="modal-body">
        <slot></slot>
      </div>

      <div v-if="$slots.footer" class="modal-footer">
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  width: 90%;
  max-height: 90vh;
  height: 100%;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  padding: 16px;
  color: #333;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.close-btn {
  background: none;
  border: none;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  border-radius: 4px;
  transition: all 0.2s;
  cursor: pointer;
}

.close-btn:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 16px;
  padding-right: 4px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  border-top: 1px solid #eee;
  padding-top: 16px;
}
</style>

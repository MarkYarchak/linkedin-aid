<script lang="ts" setup>
import { ref, watch, onUnmounted } from 'vue';
import IconCross from '@/components/icons/IconCross.vue';

interface Props {
  title?: string;
  maxWidth?: string;
  /** Shrink the modal to its content instead of filling the available height. */
  compact?: boolean;
}

const props = defineProps<Props>();

const show = defineModel<boolean>('show');

const modalBodyRef = ref<HTMLElement | null>(null);

const scrollToTop = () => {
  if (modalBodyRef.value) {
    modalBodyRef.value.scrollTop = 0;
  }
};

defineExpose({
  scrollToTop
});

watch(show, (value) => {
  const appElement = document.getElementById('app');
  if (value) {
    appElement?.classList.add('modal-open');
  } else {
    appElement?.classList.remove('modal-open');
  }
}, { immediate: true });

onUnmounted(() => {
  const appElement = document.getElementById('app');
  appElement?.classList.remove('modal-open');
});
</script>

<template>
  <div v-if="show" class="modal-overlay" @click.self="show = false">
    <div
      :class="['modal-content', { '_compact': compact }]"
      :style="{ maxWidth: maxWidth || '400px' }"
    >
      <div class="modal-header">
        <slot name="header">
          <h3 v-if="title">{{ title }}</h3>
        </slot>
        <button class="close-btn" @click="show = false">
          <IconCross size="20" />
        </button>
      </div>

      <div ref="modalBodyRef" class="modal-body">
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

.modal-content._compact {
  height: auto;
}

.modal-content._compact .modal-body {
  flex: initial;
  margin-bottom: 0;
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

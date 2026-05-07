<script lang="ts" setup>
interface Props {
  wrapText?: boolean;
  mini?: boolean;
}

withDefaults(defineProps<Props>(), {
  wrapText: false,
  mini: false,
});
</script>

<template>
  <div
    class="preview-box"
    :class="{ mini }"
  >
    <div v-if="$slots.prepend" class="preview-prepend">
      <slot name="prepend" />
    </div>
    <div
      class="preview-content"
      :style="{ whiteSpace: wrapText ? 'pre-wrap' : 'pre' }"
    >
      <slot />
    </div>
    <div v-if="$slots.append" class="preview-append">
      <slot name="append" />
    </div>
  </div>
</template>

<style scoped>
.preview-box {
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  font-size: 0.8rem;
  word-break: break-word;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}

.preview-content {
  max-height: 310px;
  overflow: auto;
  flex: 1;
}

.preview-box.mini {
  max-height: none;
  font-weight: 500;
}

.preview-prepend,
.preview-append {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
</style>

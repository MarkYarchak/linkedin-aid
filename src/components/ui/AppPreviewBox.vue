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
    :style="{ whiteSpace: wrapText ? 'pre-wrap' : 'pre' }"
  >
    <slot />
  </div>
</template>

<style scoped>
.preview-box {
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  font-size: 0.8rem;
  word-break: break-word;
  max-height: 300px;
  overflow: auto;
  color: #333;
}

.preview-box.mini {
  max-height: none;
  font-weight: 500;
}
</style>

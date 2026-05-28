<script lang="ts" setup>
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';

interface Props {
  wrapText?: boolean;
  mini?: boolean;
  json?: any;
  editablePrefix?: boolean;
}

withDefaults(defineProps<Props>(), {
  wrapText: false,
  mini: false,
  json: null,
  editablePrefix: false,
});

const prefix = defineModel('prefix', { default: ''});
</script>

<template>
  <div
    class="preview-box"
    :class="{ mini }"
  >
    <div v-if="$slots.prepend" class="preview-prepend">
      <slot name="prepend" />
    </div>
    <div class="content-container">
      <div v-if="$slots.header || editablePrefix" class="content-header">
        <slot name="header"></slot>

        <input
          v-model="prefix"
          type="text"
          placeholder="Add a prefix (e.g., #lead)"
          class="prefix-input"
        />
      </div>
      <div
        class="preview-content"
        :style="{ whiteSpace: wrapText ? 'pre-wrap' : 'pre' }"
      >
        <template v-if="json">
          <VueJsonPretty
            :data="json"
            :deep="3"
            show-length
            show-line
            show-icon
            :show-double-quotes="false"
            class="json-pretty-small"
          />
        </template>
        <template v-else>
          <slot />
        </template>
      </div>
      <div v-if="$slots.footer" class="content-footer">
        <slot name="footer"></slot>
      </div>
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

.preview-box:has(.content-header) {
  padding-top: 4px;
}

.preview-box:has(.content-footer) {
  padding-bottom: 4px;
}

.content-container {
  max-height: 320px;
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.content-header,
.content-footer {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
}

.content-header {
  border-bottom: 1px solid #999;
  padding-bottom: 4px;
}

.content-footer {
  border-top: 1px solid #999;
  padding-top: 4px;
}

.preview-content {
  overflow: auto;
  flex: 1;
}

.preview-content .json-pretty-small * {
  font-size: 0.75rem;
  line-height: 1.4;
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

.prefix-input {
  flex-grow: 1;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #cbd5e1;
  font-size: 0.9rem;
}

.prefix-input:focus {
  outline: none;
  border-color: #0a66c2;
  box-shadow: 0 0 0 2px rgba(10, 102, 194, 0.1);
}
</style>

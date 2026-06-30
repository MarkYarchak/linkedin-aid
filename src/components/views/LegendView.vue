<script lang="ts" setup>
import { ref } from 'vue';
import { titleTargets, titleStates } from '@/helpers/title-helper';

const copiedValue = ref<string | null>(null);

const copyToClipboard = async (text: string, value: string) => {
  try {
    await navigator.clipboard.writeText(text);
    copiedValue.value = value;
    setTimeout(() => {
      if (copiedValue.value === value) {
        copiedValue.value = null;
      }
    }, 2000);
  } catch (err) {
    console.error('Failed to copy: ', err);
  }
};
</script>

<template>
  <div class="legend-view">
    <div class="section">
      <h3>Title Targets</h3>
      <div class="list">
        <div
          v-for="target in titleTargets"
          :key="target.value"
          title="Click to copy emoji"
          class="item"
          :class="{ copied: copiedValue === target.value }"
          @click="copyToClipboard(target.emoji, target.value)"
        >
          <span class="emoji">{{ target.emoji }}</span>
          <span class="label">{{ target.label }}</span>
          <span v-if="copiedValue === target.value" class="copied-badge">Copied!</span>
        </div>
      </div>
    </div>

    <div class="section">
      <h3>Title Statuses</h3>
      <div class="list">
        <div
          v-for="state in titleStates"
          :key="state.value"
          title="Click to copy emoji"
          class="item"
          :class="{ copied: copiedValue === state.value }"
          @click="copyToClipboard(state.emoji, state.value)"
        >
          <span class="emoji">{{ state.emoji }}</span>
          <span class="label">{{ state.label }}</span>
          <span v-if="copiedValue === state.value" class="copied-badge">Copied!</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.legend-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  padding: 16px;
  overflow-y: auto;
}

.section {
  margin-bottom: 24px;
}

h3 {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 14px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 6px;
  background: #f5f5f5;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.item:hover {
  background: #e0e0e0;
}

.item.copied {
  background: #e8f5e9;
  border-color: #4caf50;
}

.emoji {
  font-size: 18px;
  width: 24px;
  display: flex;
  justify-content: center;
}

.label {
  font-size: 13px;
  color: #333;
}

.copied-badge {
  margin-left: auto;
  font-size: 11px;
  font-weight: bold;
  color: #2e7d32;
  text-transform: uppercase;
}
</style>

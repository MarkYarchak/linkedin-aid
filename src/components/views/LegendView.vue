<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useDataStore } from '@/store/data-store';
import { titleTargets as defaultTargets, titleStates as defaultStates } from '@/helpers/title-helper';

const { copyLeadSettings } = useDataStore();

const targets = computed(() => copyLeadSettings.value?.titleTargets || defaultTargets);
const states = computed(() => copyLeadSettings.value?.titleStates || defaultStates);

const activeTab = ref<'statuses' | 'targets'>('statuses');
const copiedValue = ref<string | null>(null);

const tabs = computed(() => [
  {
    key: 'statuses' as const,
    label: 'Title Statuses',
    items: states.value,
  },
  {
    key: 'targets' as const,
    label: 'Title Targets',
    items: targets.value,
  },
]);

const activeItems = computed(() => tabs.value.find((tab) => tab.key === activeTab.value)?.items || []);

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
    <div class="tabs" role="tablist" aria-label="Title legend categories">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        class="tab"
        :class="{ active: activeTab === tab.key }"
        role="tab"
        :aria-selected="activeTab === tab.key"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="tab-content">
      <div class="grid">
        <div
          v-for="item in activeItems"
          :key="item.value"
          title="Click to copy emoji"
          class="card"
          :class="{ copied: copiedValue === item.value }"
          @click="copyToClipboard(item.emoji, item.value)"
        >
          <span class="emoji">{{ item.emoji }}</span>
          <span class="label">{{ item.label }}</span>
          <span v-if="copiedValue === item.value" class="copied-badge">Copied!</span>
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
}

.tabs {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid #ddd;
  padding: 8px 16px 0;
}

.tab {
  padding: 10px 14px;
  border-radius: 0;
  border: 0;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: #666;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: none;
}

.tab:hover {
  color: #333;
  background: #fafafa;
}

.tab.active {
  color: #1976d2;
  border-bottom-color: #1976d2;
}

.tab-content {
  flex-grow: 1;
  overflow-y: auto;
  padding: 16px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}

.card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 104px;
  padding: 14px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: #f5f5f5;
  cursor: pointer;
  transition: all 0.1s;
  position: relative;
  text-align: center;
}

.card:hover {
  background: #e0e0e0;
}

.card.copied {
  background: #e8f5e9;
  border-color: #4caf50;
  animation: copy-flash-green 0.6s ease-out;
}

@keyframes copy-flash-green {
  0% {
    background-color: #f5f5f5;
  }
  20% {
    background-color: #e8f5e9;
  }
  100% {
    background-color: #e8f5e9;
  }
}

.emoji {
  display: flex;
  justify-content: center;
  font-size: 28px;
  line-height: 1;
}

.label {
  display: -webkit-box;
  overflow: hidden;
  font-size: 13px;
  font-weight: bold;
  color: #333;
  line-height: 1.25;
  overflow-wrap: anywhere;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.copied-badge {
  position: absolute;
  right: 8px;
  bottom: 8px;
  font-size: 10px;
  font-weight: bold;
  color: #2e7d32;
  text-transform: uppercase;
}
</style>

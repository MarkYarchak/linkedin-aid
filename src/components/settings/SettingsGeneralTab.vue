<script lang="ts" setup>
import { browser } from 'wxt/browser';
import AppPreviewBox from '@/components/ui/AppPreviewBox.vue';

const resetSettings = async () => {
  if (confirm('Are you sure you want to reset all settings?')) {
    await browser.storage.local.remove(['copyLeadSettings', 'bulkCopyLeadSettings']);
    alert('Settings reset.');
  }
};
</script>

<template>
  <div class="tab-content">
    <AppPreviewBox>
      <template #header>
        <span class="section-title">Profile</span>
      </template>
      <div class="placeholder-content">
        Profile settings will be available here soon.
      </div>
    </AppPreviewBox>

    <AppPreviewBox>
      <template #header>
        <span class="section-title">Subscription</span>
      </template>
      <div class="placeholder-content">
        Subscription management will be available here soon.
      </div>
    </AppPreviewBox>

    <AppPreviewBox>
      <template #header>
        <span class="section-title">Maintenance</span>
      </template>
      
      <div class="actions">
        <button class="secondary-button" @click="resetSettings">
          Reset All Settings
        </button>
      </div>
    </AppPreviewBox>
  </div>
</template>

<style scoped>
.tab-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  font-weight: bold;
  color: #333;
}

.placeholder-content {
  padding: 8px 0;
  color: #64748b;
  font-size: 0.85rem;
  font-style: italic;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.secondary-button {
  background-color: #f0f0f0;
  color: #333;
  border: 1px solid #ddd;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
}

.secondary-button:hover {
  background-color: #e6e6e6;
}
</style>

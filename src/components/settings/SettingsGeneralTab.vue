<script lang="ts" setup>
import { ref, watch } from 'vue';
import { browser } from 'wxt/browser';
import { useDataStore } from '@/store/data-store';
import { storageService } from '@/services/storage-service';
import AppCard from '@/components/ui/AppCard.vue';
import AppRadio from '@/components/ui/AppRadio.vue';

const { entitiesTTL } = useDataStore();
const localTTL = ref(30);

watch(() => entitiesTTL.value, (val) => {
  localTTL.value = val;
}, { immediate: true });

watch(localTTL, async (newValue) => {
  await storageService.setLocal({ entitiesTTL: newValue });
});

const ttlOptions = [
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
  { label: '180 days', value: 180 },
  { label: '1 year', value: 365 },
  { label: 'Never', value: -1 },
];

const resetSettings = async () => {
  if (confirm('Are you sure you want to reset all settings?')) {
    await browser.storage.local.remove(['copyLeadSettings', 'bulkCopyLeadSettings', 'entitiesTTL']);
    alert('Settings reset.');
  }
};
</script>

<template>
  <div class="tab-content">
    <AppCard title="Profile">
      <div class="placeholder-content">
        Profile settings will be available here soon.
      </div>
    </AppCard>

    <AppCard title="Subscription">
      <div class="placeholder-content">
        Subscription management will be available here soon.
      </div>
    </AppCard>

    <AppCard title="Data Retention">
      <div class="settings-group">
        <span class="group-description">
          Choose how long to keep leads, companies, and sessions before they are automatically deleted.
        </span>
        <div class="radio-grid">
          <AppRadio
            v-for="option in ttlOptions"
            :key="option.value"
            v-model="localTTL"
            :value="option.value"
            :label="option.label"
          />
        </div>
      </div>
    </AppCard>

    <AppCard title="Maintenance">
      <div class="actions">
        <button class="secondary-button" @click="resetSettings">
          Reset All Settings
        </button>
      </div>
    </AppCard>
  </div>
</template>

<style scoped>
.tab-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.placeholder-content {
  padding: 8px 0;
  color: #64748b;
  font-size: 0.85rem;
  font-style: italic;
}

.settings-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.group-description {
  color: #64748b;
  font-size: 0.85rem;
  line-height: 1.4;
}

.radio-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 8px;
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

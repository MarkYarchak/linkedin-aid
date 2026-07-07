<script lang="ts" setup>
import { ref, watch } from 'vue';
import { browser } from 'wxt/browser';
import { useDataStore } from '@/store/data-store';
import { storageService } from '@/services/storage-service';

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
  <div>
    <v-card title="Profile" class="mb-4">
      <v-card-text>
        <div class="placeholder-content">
          Profile settings will be available here soon.
        </div>
      </v-card-text>
    </v-card>

    <v-card title="Subscription" class="mb-4">
      <v-card-text>
        <div class="placeholder-content">
          Subscription management will be available here soon.
        </div>
      </v-card-text>
    </v-card>

    <v-card title="Data Retention" class="mb-4">
      <v-card-text>
        <div class="text-body-2 text-medium-emphasis mb-4">
          Choose how long to keep leads, companies, and sessions before they are automatically deleted.
        </div>
        <v-radio-group v-model="localTTL" hide-details>
          <v-row no-gutters>
            <v-col
              v-for="option in ttlOptions"
              :key="option.value"
              cols="6"
            >
              <v-radio
                :value="option.value"
                :label="option.label"
                color="#0073b1"
                density="comfortable"
              />
            </v-col>
          </v-row>
        </v-radio-group>
      </v-card-text>
    </v-card>

    <v-card title="Maintenance">
      <v-card-text>
        <v-btn
          color="error"
          @click="resetSettings"
        >
          Reset All Settings
        </v-btn>
      </v-card-text>
    </v-card>
  </div>
</template>

<style scoped>
.placeholder-content {
  color: #64748b;
  font-size: 0.85rem;
  font-style: italic;
}
</style>

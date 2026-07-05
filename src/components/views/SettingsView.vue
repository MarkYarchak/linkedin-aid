<script lang="ts" setup>
import { ref } from 'vue';
import { browser } from 'wxt/browser';
import AppSegmentedControl from '@/components/ui/AppSegmentedControl.vue';
import SettingsEntitiesTab from '@/components/settings/SettingsEntitiesTab.vue';
import SettingsSessionsTab from '@/components/settings/SettingsSessionsTab.vue';
import SettingsTitlesTab from '@/components/settings/SettingsTitlesTab.vue';
import SettingsCopyTab from '@/components/settings/SettingsCopyTab.vue';
import SettingsGeneralTab from '@/components/settings/SettingsGeneralTab.vue';

const tabs = ref([
  { label: 'General', value: 'general' },
  { label: 'Entities', value: 'entities' },
  { label: 'Sessions', value: 'sessions' },
  { label: 'Titles', value: 'titles' },
  { label: 'Copy', value: 'copy' },
]);
const activeTab = ref('general');

const version = browser.runtime.getManifest().version;
</script>

<template>
  <div class="settings-view">
    <div class="tabs-container">
      <AppSegmentedControl
        v-model="activeTab"
        :options="tabs"
      />
    </div>

    <SettingsGeneralTab v-if="activeTab === 'general'" />
    <SettingsEntitiesTab v-else-if="activeTab === 'entities'" />
    <SettingsSessionsTab v-else-if="activeTab === 'sessions'" />
    <SettingsTitlesTab v-else-if="activeTab === 'titles'" />
    <SettingsCopyTab v-else-if="activeTab === 'copy'" />

    <div class="footer">
      <p>LinkedIn AID v{{ version }}</p>
    </div>
  </div>
</template>

<style scoped>
.settings-view {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 350px;
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
}

.tabs-container {
  margin-bottom: 4px;
}

.footer {
  margin-top: auto;
  text-align: center;
  color: #999;
  font-size: 0.8rem;
}
</style>

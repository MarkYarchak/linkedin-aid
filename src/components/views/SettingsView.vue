<script lang="ts" setup>
import { ref } from 'vue';
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
</script>

<template>
  <v-container class="settings-view">
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
  </v-container>
</template>

<style scoped>
.settings-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tabs-container {
  margin-bottom: 4px;
}
</style>

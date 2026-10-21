<script lang="ts" setup>
import { ref } from 'vue';
import { browser } from 'wxt/browser';
const SettingsCapturedEntitiesTab = defineAsyncComponent(() => import('@/entrypoints/settings/pages/SettingsCapturedEntitiesTab.vue'));
const SettingsSessionsTab = defineAsyncComponent(() => import('@/entrypoints/settings/pages/SettingsSessionsTab.vue'));
const SettingsTitlesTab = defineAsyncComponent(() => import('@/entrypoints/settings/pages/SettingsTitlesTab.vue'));
const SettingsCopyTab = defineAsyncComponent(() => import('@/entrypoints/settings/pages/SettingsCopyTab.vue'));
const SettingsGeneralTab = defineAsyncComponent(() => import('@/entrypoints/settings/pages/SettingsGeneralTab.vue'));
const SettingsCrmTab = defineAsyncComponent(() => import('@/entrypoints/settings/pages/crm/SettingsCrmTab.vue'));

interface TabItem {
  title: string;
  value: string;
  badge?: string;
  getComponent: () => any;
}

const tabs = ref<TabItem[]>([
  { title: 'General', value: 'general', getComponent: () => SettingsGeneralTab },
  { title: 'Captured entities', value: 'captured_entities', getComponent: () => SettingsCapturedEntitiesTab },
  { title: 'Sessions', value: 'sessions', getComponent: () => SettingsSessionsTab },
  { title: 'Titles', value: 'titles', getComponent: () => SettingsTitlesTab },
  { title: 'Copy', value: 'copy', getComponent: () => SettingsCopyTab },
  { title: 'CRM', value: 'crm', badge: 'Beta', getComponent: () => SettingsCrmTab },
]);
const activeTab = ref(0);

const version = browser.runtime.getManifest().version;
</script>

<template>
  <v-container>
    <v-navigation-drawer permanent>
      <v-item-group
        v-model="activeTab"
        mandatory
      >
        <v-list nav color="#0073b1">
          <v-item
            v-for="tab in tabs"
            :key="tab.value"
            v-slot="{ isSelected, selectedClass, toggle }"
          >
            <v-list-item
              :active="isSelected"
              :value="tab.value"
              :title="tab.title"
              :class="selectedClass"
              @click="toggle"
            >
              <template v-if="tab.badge" #append>
                <v-chip
                  size="x-small"
                  color="#0073b1"
                  variant="flat"
                  class="font-weight-bold"
                >
                  {{ tab.badge }}
                </v-chip>
              </template>
            </v-list-item>
          </v-item>
        </v-list>
      </v-item-group>

      <template #append>
        <v-divider />
        <v-footer>
          LinkedIn AID v{{ version }}
        </v-footer>
      </template>
    </v-navigation-drawer>

    <v-item-group v-model="activeTab" mandatory>
      <v-item
        v-for="tab in tabs"
        :key="tab.value"
        v-slot="{ isSelected }"
      >
        <component v-if="isSelected" :is="tab.getComponent()"></component>
      </v-item>
    </v-item-group>
  </v-container>
</template>

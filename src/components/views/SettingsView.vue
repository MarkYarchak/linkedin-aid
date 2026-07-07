<script lang="ts" setup>
import { ref } from 'vue';
const SettingsEntitiesTab = defineAsyncComponent(() => import('@/components/settings/SettingsEntitiesTab.vue'));
const SettingsSessionsTab = defineAsyncComponent(() => import('@/components/settings/SettingsSessionsTab.vue'));
const SettingsTitlesTab = defineAsyncComponent(() => import('@/components/settings/SettingsTitlesTab.vue'));
const SettingsCopyTab = defineAsyncComponent(() => import('@/components/settings/SettingsCopyTab.vue'));
const SettingsGeneralTab = defineAsyncComponent(() => import('@/components/settings/SettingsGeneralTab.vue'));

const tabs = ref([
  { title: 'General', value: 'general', getComponent: () => SettingsGeneralTab },
  { title: 'Entities', value: 'entities', getComponent: () => SettingsEntitiesTab },
  { title: 'Sessions', value: 'sessions', getComponent: () => SettingsSessionsTab },
  { title: 'Titles', value: 'titles', getComponent: () => SettingsTitlesTab },
  { title: 'Copy', value: 'copy', getComponent: () => SettingsCopyTab },
]);
const activeTab = ref(0);
</script>

<template>
  <v-container>
    <v-navigation-drawer permanent>
      <v-item-group
        v-model="activeTab"
        mandatory
      >
        <v-list nav active-color="#0073b1">
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
            ></v-list-item>
          </v-item>
        </v-list>
      </v-item-group>
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

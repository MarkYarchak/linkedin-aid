<script lang="ts" setup>
import { ref } from 'vue';
import { browser } from 'wxt/browser';

interface TabItem {
  title: string;
  value: string;
  badge?: string;
  route: string;
}

const tabs = ref<TabItem[]>([
  { title: 'General', value: 'general', route: '/' },
  { title: 'Captured entities', value: 'captured_entities', route: '/captured-entities' },
  { title: 'Sessions', value: 'sessions', route: '/sessions' },
  { title: 'Titles', value: 'titles', route: '/titles' },
  { title: 'Copy', value: 'copy', route: '/copy' },
  { title: 'CRM', value: 'crm', badge: 'Beta', route: '/crm' },
]);

const version = browser.runtime.getManifest().version;
</script>

<template>
  <v-container>
    <v-navigation-drawer permanent>
      <v-list nav color="#0073b1">
        <v-list-item
          v-for="tab in tabs"
          :key="tab.value"
          :to="tab.route"
          :value="tab.value"
          :title="tab.title"
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
      </v-list>

      <template #append>
        <v-divider />
        <v-footer>
          LinkedIn AID v{{ version }}
        </v-footer>
      </template>
    </v-navigation-drawer>

    <router-view></router-view>
  </v-container>
</template>

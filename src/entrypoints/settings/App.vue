<script lang="ts" setup>
import { browser } from 'wxt/browser';
import { useDataStore } from '@/store/data-store';
import SettingsView from '@/components/views/SettingsView.vue';

const { isLoaded, loadData } = useDataStore();

loadData();

const version = browser.runtime.getManifest().version;
</script>

<template>
  <v-app id="settings-app">
    <div v-if="!isLoaded" class="loading">
      Loading Settings...
    </div>
    <template v-else>
      <v-app-bar>
        <v-avatar :rounded="false" size="32" class="ml-5">
          <v-img
            src="/logo.svg"
          />
        </v-avatar>
        <v-app-bar-title tag="h1" class="app-bar-title-text">LinkedIn AID Settings</v-app-bar-title>
      </v-app-bar>

      <v-main>
        <SettingsView />
      </v-main>

      <v-footer app name="app-footer" border>
        LinkedIn AID v{{ version }}
      </v-footer>
    </template>
  </v-app>
</template>

<style>
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 1.2rem;
}

.app-bar-title-text {
  color: #0073b1; /* LinkedIn Blue */
  font-weight: bold;
}
</style>


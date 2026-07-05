<script lang="ts" setup>
import { useDataStore } from '@/store/data-store';
import SettingsView from '@/components/views/SettingsView.vue';

const { isLoaded, loadData } = useDataStore();

loadData();
</script>

<template>
  <div v-if="!isLoaded" class="loading">
    Loading Settings...
  </div>
  <div v-else class="settings-container">
    <header class="settings-header">
      <h1>LinkedIn AID Settings</h1>
    </header>
    <main class="settings-content">
      <SettingsView />
    </main>
  </div>
</template>

<style>
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 1.2rem;
}

.settings-container {
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 24px;
  display: flex;
  flex-direction: column;
}

.settings-header {
  padding: 20px 0;
}

.settings-header h1 {
  margin: 0;
  font-size: 2rem;
  color: #0073b1; /* LinkedIn Blue */
}

.settings-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  min-height: 500px;
}
</style>


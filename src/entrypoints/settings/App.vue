<script lang="ts" setup>
import { onMounted } from 'vue';
import { useDataStore } from '@/store/data-store';

const { isLoaded, loadData } = useDataStore();

onMounted(() => {
  loadData();
});
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
      <!-- Settings view -->
    </main>
  </div>
</template>

<style>
:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
  color: #213547;
  background-color: #f6f6f6;
}

body {
  margin: 0;
  min-height: 100vh;
}

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

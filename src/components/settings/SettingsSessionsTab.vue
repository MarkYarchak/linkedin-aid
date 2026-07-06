<script lang="ts" setup>
import { computed } from 'vue';
import { browser } from 'wxt/browser';
import { db } from '@/db/schema';
import { useDataStore } from '@/store/data-store';
import AppCard from '@/components/ui/AppCard.vue';
import AppDivider from '@/components/ui/AppDivider.vue';

const { sessionsMap, personasStorage, leadTitles } = useDataStore();

const sessionsCount = computed(() => Object.keys(sessionsMap.value).length);
const personasCount = computed(() => {
  const general = personasStorage.value.general.length;
  const byCompany = Object.values(personasStorage.value.byCompany).reduce((acc, val) => acc + val.length, 0);
  return general + byCompany;
});
const leadTitlesCount = computed(() => Object.keys(leadTitles.value).length);

const clearSessionData = async () => {
  if (confirm('Are you sure you want to clear session data (search sessions and personas)?')) {
    await Promise.all([
      db.searchSessions.clear(),
      browser.storage.session.remove(['personas', 'lead_titles'])
    ]);
    alert('Session data cleared.');
  }
};
</script>

<template>
  <div class="tab-content">
    <AppCard title="Session Management">
      <div class="data-stats">
        <div class="stat-item">
          <span class="label">Search Sessions:</span>
          <span class="value">{{ sessionsCount }}</span>
        </div>
        <div class="stat-item">
          <span class="label">Stored Personas:</span>
          <span class="value">{{ personasCount }}</span>
        </div>
        <div class="stat-item">
          <span class="label">Stored Lead Titles:</span>
          <span class="value">{{ leadTitlesCount }}</span>
        </div>
      </div>

      <AppDivider />

      <div class="actions">
        <button class="secondary-button" @click="clearSessionData">
          Clear Session Data
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

.data-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
}

.label {
  color: #666;
}

.value {
  font-weight: bold;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
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

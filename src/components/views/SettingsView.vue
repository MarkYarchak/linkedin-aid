<script lang="ts" setup>
import { computed } from 'vue';
import { browser } from 'wxt/browser';
import { useDataStore } from '@/store/data-store';
import { db } from '@/db/schema';
import AppPreviewBox from '@/components/ui/AppPreviewBox.vue';
import AppDivider from '@/components/ui/AppDivider.vue';

const { leadsMap, companiesMap, sessionsMap, personasStorage, copyLeadSettings, bulkCopyLeadSettings } = useDataStore();

const leadsCount = computed(() => Object.keys(leadsMap.value).length);
const companiesCount = computed(() => Object.keys(companiesMap.value).length);
const sessionsCount = computed(() => Object.keys(sessionsMap.value).length);
const personasCount = computed(() => {
  const general = personasStorage.value.general.length;
  const byCompany = Object.values(personasStorage.value.byCompany).reduce((acc, val) => acc + val.length, 0);
  return general + byCompany;
});

const clearData = async () => {
  if (confirm('Are you sure you want to clear all stored leads and companies?')) {
    await db.leads.clear();
    await db.companies.clear();
    alert('Leads and companies cleared.');
  }
};

const clearSessionData = async () => {
  if (confirm('Are you sure you want to clear session data (search sessions and personas)?')) {
    await browser.storage.session.remove(['searchSessions', 'personas', 'lead_titles']);
    alert('Session data cleared.');
  }
};

const resetSettings = async () => {
  if (confirm('Are you sure you want to reset all settings?')) {
    await browser.storage.local.remove(['copyLeadSettings', 'bulkCopyLeadSettings']);
    alert('Settings reset.');
  }
};

const version = browser.runtime.getManifest().version;
</script>

<template>
  <div class="settings-view">
    <AppPreviewBox>
      <template #header>
        <span class="section-title">Data Management</span>
      </template>
      <div class="data-stats">
        <div class="stat-item">
          <span class="label">Stored Leads:</span>
          <span class="value">{{ leadsCount }}</span>
        </div>
        <div class="stat-item">
          <span class="label">Stored Companies:</span>
          <span class="value">{{ companiesCount }}</span>
        </div>
        <div class="stat-item">
          <span class="label">Search Sessions:</span>
          <span class="value">{{ sessionsCount }}</span>
        </div>
        <div class="stat-item">
          <span class="label">Stored Personas:</span>
          <span class="value">{{ personasCount }}</span>
        </div>
      </div>

      <AppDivider />

      <div class="actions">
        <button class="danger-button" @click="clearData">
          Clear Leads & Companies
        </button>
        <button class="secondary-button" @click="clearSessionData">
          Clear Session Data
        </button>
      </div>
    </AppPreviewBox>

    <AppPreviewBox>
      <template #header>
        <span class="section-title">Application Settings</span>
      </template>
      <div class="settings-summary">
        <div class="stat-item">
          <span class="label">Copy Settings:</span>
          <span class="value">{{ copyLeadSettings ? 'Configured' : 'Default' }}</span>
        </div>
      </div>

      <AppDivider />

      <div class="actions">
        <button class="secondary-button" @click="resetSettings">
          Reset All Settings
        </button>
      </div>
    </AppPreviewBox>

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

.section-title {
  font-weight: bold;
  color: #333;
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

.danger-button {
  background-color: #ff4d4f;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
  font-weight: bold;
}

.danger-button:hover {
  background-color: #ff7875;
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

.data-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.footer {
  margin-top: auto;
  text-align: center;
  color: #999;
  font-size: 0.8rem;
}
</style>

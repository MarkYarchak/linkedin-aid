<script lang="ts" setup>
import { computed } from 'vue';
import { useDataStore } from '@/store/data-store';
import { db } from '@/db/schema';
import AppPreviewBox from '@/components/ui/AppPreviewBox.vue';
import AppDivider from '@/components/ui/AppDivider.vue';

const { leadsMap, companiesMap } = useDataStore();

const leadsCount = computed(() => Object.keys(leadsMap.value).length);
const companiesCount = computed(() => Object.keys(companiesMap.value).length);

const clearData = async () => {
  if (confirm('Are you sure you want to clear all stored leads and companies?')) {
    await db.leads.clear();
    await db.companies.clear();
    alert('Leads and companies cleared.');
  }
};
</script>

<template>
  <div class="tab-content">
    <AppPreviewBox>
      <template #header>
        <span class="section-title">Entities Management</span>
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
      </div>

      <AppDivider />

      <div class="actions">
        <button class="danger-button" @click="clearData">
          Clear Leads & Companies
        </button>
      </div>
    </AppPreviewBox>
  </div>
</template>

<style scoped>
.tab-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  font-weight: bold;
  color: #333;
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
</style>

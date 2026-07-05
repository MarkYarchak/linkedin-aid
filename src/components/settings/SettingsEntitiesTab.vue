<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useDataStore } from '@/store/data-store';
import { db } from '@/db/schema';
import AppCard from '@/components/ui/AppCard.vue';
import AppDivider from '@/components/ui/AppDivider.vue';
import AppSegmentedControl from '@/components/ui/AppSegmentedControl.vue';
import LeadPreviewList from '@/components/leads/LeadPreviewList.vue';
import CompanyPreview from '@/components/companies/CompanyPreview.vue';

const { leadsMap, companiesMap } = useDataStore();

const leadsCount = computed(() => Object.keys(leadsMap.value).length);
const companiesCount = computed(() => Object.keys(companiesMap.value).length);

const leads = computed(() => Object.values(leadsMap.value).sort((a, b) => b.updatedAt - a.updatedAt));
const companies = computed(() => Object.values(companiesMap.value).sort((a, b) => b.updatedAt - a.updatedAt));

const activeTab = ref('leads');

const clearLeads = async () => {
  if (confirm('Are you sure you want to clear all stored leads?')) {
    await db.leads.clear();
    alert('Leads cleared.');
  }
};

const clearCompanies = async () => {
  if (confirm('Are you sure you want to clear all stored companies?')) {
    await db.companies.clear();
    alert('Companies cleared.');
  }
};
</script>

<template>
  <div class="tab-content">
    <AppCard title="Entities Management">
      <div class="mb-4">
        <AppSegmentedControl
          v-model="activeTab"
          :options="[
            { label: `Leads (${leadsCount})`, value: 'leads' },
            { label: `Companies (${companiesCount})`, value: 'companies' }
          ]"
        />
      </div>

      <div v-if="activeTab === 'leads'" class="nested-tab-content">
        <div class="actions mb-3">
          <button class="danger-button" :disabled="leadsCount === 0" @click="clearLeads">
            Clear All Leads
          </button>
        </div>

        <div v-if="leads.length > 0" class="entity-list">
          <LeadPreviewList :leads="leads" />
        </div>
        <div v-else class="empty-state">
          No leads stored.
        </div>
      </div>

      <div v-else-if="activeTab === 'companies'" class="nested-tab-content">
        <div class="actions mb-3">
          <button class="danger-button" :disabled="companiesCount === 0" @click="clearCompanies">
            Clear All Companies
          </button>
        </div>

        <div v-if="companies.length > 0" class="entity-list">
          <div class="company-list">
            <div v-for="company in companies" :key="company.entityUrn" class="company-item">
              <CompanyPreview :company="company" />
              <AppDivider v-if="company !== companies[companies.length - 1]" />
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          No companies stored.
        </div>
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

.nested-tab-content {
  display: flex;
  flex-direction: column;
}

.mb-4 {
  margin-bottom: 16px;
}

.mb-3 {
  margin-bottom: 12px;
}

.actions {
  display: flex;
  gap: 8px;
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

.danger-button:hover:not(:disabled) {
  background-color: #ff7875;
}

.danger-button:disabled {
  background-color: #ffa39e;
  cursor: not-allowed;
}

.entity-list {
  padding: 4px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
}

.company-list {
  display: flex;
  flex-direction: column;
}

.company-item {
  padding: 8px 0;
}

.empty-state {
  text-align: center;
  padding: 24px;
  color: #999;
  background: #fafafa;
  border-radius: 4px;
}
</style>

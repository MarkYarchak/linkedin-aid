<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { useDataStore } from '@/store/data-store';
import { db } from '@/db/schema';
import AppCard from '@/components/ui/AppCard.vue';
import AppDivider from '@/components/ui/AppDivider.vue';
import AppSegmentedControl from '@/components/ui/AppSegmentedControl.vue';
import AppCheckbox from '@/components/ui/AppCheckbox.vue';
import AppPagination from '@/components/ui/AppPagination.vue';
import LeadPreviewList from '@/components/leads/LeadPreviewList.vue';
import CompanyPreview from '@/components/companies/CompanyPreview.vue';

const { leadsMap, companiesMap } = useDataStore();

const PAGE_SIZE = 50;

const leadsCount = computed(() => Object.keys(leadsMap.value).length);
const companiesCount = computed(() => Object.keys(companiesMap.value).length);

const leads = computed(() => Object.values(leadsMap.value).sort((a, b) => b.updatedAt - a.updatedAt));
const companies = computed(() => Object.values(companiesMap.value).sort((a, b) => b.updatedAt - a.updatedAt));

const leadsPage = ref(1);
const companiesPage = ref(1);

const paginatedLeads = computed(() => {
  const start = (leadsPage.value - 1) * PAGE_SIZE;
  return leads.value.slice(start, start + PAGE_SIZE);
});

const paginatedCompanies = computed(() => {
  const start = (companiesPage.value - 1) * PAGE_SIZE;
  return companies.value.slice(start, start + PAGE_SIZE);
});

watch(leadsCount, (newCount) => {
  const maxPage = Math.max(1, Math.ceil(newCount / PAGE_SIZE));
  if (leadsPage.value > maxPage) {
    leadsPage.value = maxPage;
  }
});

watch(companiesCount, (newCount) => {
  const maxPage = Math.max(1, Math.ceil(newCount / PAGE_SIZE));
  if (companiesPage.value > maxPage) {
    companiesPage.value = maxPage;
  }
});

const activeTab = ref('leads');

const selectedLeadUrns = ref(new Set<string>());
const selectedCompanyUrns = ref(new Set<string>());

const isCompaniesDense = ref(true);

const companyViewMode = computed({
  get: () => isCompaniesDense.value ? 'dense' : 'detailed',
  set: (val) => isCompaniesDense.value = val === 'dense'
});

const toggleLeadSelection = (urn: string, selected: boolean) => {
  const next = new Set(selectedLeadUrns.value);
  if (selected) {
    next.add(urn);
  } else {
    next.delete(urn);
  }
  selectedLeadUrns.value = next;
};

const toggleCompanySelection = (urn: string, selected: boolean) => {
  const next = new Set(selectedCompanyUrns.value);
  if (selected) {
    next.add(urn);
  } else {
    next.delete(urn);
  }
  selectedCompanyUrns.value = next;
};

const allLeadsSelected = computed({
  get: () => leadsCount.value > 0 && selectedLeadUrns.value.size === leadsCount.value,
  set: (val) => {
    if (val) {
      selectedLeadUrns.value = new Set(leads.value.map(l => l.entityUrn));
    } else {
      selectedLeadUrns.value = new Set();
    }
  }
});

const allCompaniesSelected = computed({
  get: () => companiesCount.value > 0 && selectedCompanyUrns.value.size === companiesCount.value,
  set: (val) => {
    if (val) {
      selectedCompanyUrns.value = new Set(companies.value.map(c => c.entityUrn));
    } else {
      selectedCompanyUrns.value = new Set();
    }
  }
});

const clearLeads = async () => {
  if (confirm('Are you sure you want to clear all stored leads?')) {
    await db.leads.clear();
    selectedLeadUrns.value = new Set();
    alert('Leads cleared.');
  }
};

const clearSelectedLeads = async () => {
  const urns = Array.from(selectedLeadUrns.value);
  if (urns.length === 0) return;
  if (confirm(`Are you sure you want to clear ${urns.length} selected leads?`)) {
    await db.leads.bulkDelete(urns);
    selectedLeadUrns.value = new Set();
    alert('Selected leads cleared.');
  }
};

const clearCompanies = async () => {
  if (confirm('Are you sure you want to clear all stored companies?')) {
    await db.companies.clear();
    selectedCompanyUrns.value = new Set();
    alert('Companies cleared.');
  }
};

const clearSelectedCompanies = async () => {
  const urns = Array.from(selectedCompanyUrns.value);
  if (urns.length === 0) return;
  if (confirm(`Are you sure you want to clear ${urns.length} selected companies?`)) {
    await db.companies.bulkDelete(urns);
    selectedCompanyUrns.value = new Set();
    alert('Selected companies cleared.');
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
          <AppCheckbox v-model="allLeadsSelected" label="Select All" />
          <div class="flex-spacer"></div>
          <button
            class="danger-button outline"
            :disabled="selectedLeadUrns.size === 0"
            @click="clearSelectedLeads"
          >
            Clear Selected ({{ selectedLeadUrns.size }})
          </button>
          <button class="danger-button" :disabled="leadsCount === 0" @click="clearLeads">
            Clear All
          </button>
        </div>

        <div v-if="leads.length > 0" class="entity-list">
          <LeadPreviewList
            :leads="paginatedLeads"
            :selected-urns="selectedLeadUrns"
            @update:selected="toggleLeadSelection"
          />

          <AppPagination
            v-model="leadsPage"
            :total-items="leadsCount"
            :page-size="PAGE_SIZE"
          />
        </div>
        <div v-else class="empty-state">
          No leads stored.
        </div>
      </div>

      <div v-else-if="activeTab === 'companies'" class="nested-tab-content">
        <div class="actions mb-3">
          <AppCheckbox v-model="allCompaniesSelected" label="Select All" />

          <div class="view-options">
            <span class="view-label">View:</span>
            <AppSegmentedControl
              v-model="companyViewMode"
              :options="[
                { label: 'Compact', value: 'dense' },
                { label: 'Detailed', value: 'detailed' }
              ]"
            />
          </div>

          <div class="flex-spacer"></div>
          <button
            class="danger-button outline"
            :disabled="selectedCompanyUrns.size === 0"
            @click="clearSelectedCompanies"
          >
            Clear Selected ({{ selectedCompanyUrns.size }})
          </button>
          <button class="danger-button" :disabled="companiesCount === 0" @click="clearCompanies">
            Clear All
          </button>
        </div>

        <div v-if="companies.length > 0" class="entity-list">
          <div class="company-list">
            <template v-for="company in paginatedCompanies" :key="company.entityUrn">
              <CompanyPreview
                :company="company"
                selectable
                :dense="isCompaniesDense"
                :selected="selectedCompanyUrns.has(company.entityUrn)"
                @update:selected="(val) => toggleCompanySelection(company.entityUrn, val)"
              />
              <AppDivider v-if="company !== paginatedCompanies[paginatedCompanies.length - 1]" class="my-1" />
            </template>
          </div>

          <AppPagination
            v-model="companiesPage"
            :total-items="companiesCount"
            :page-size="PAGE_SIZE"
          />
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
  align-items: center;
}

.flex-spacer {
  flex: 1;
}

.view-options {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 8px;
  border-left: 1px solid #eee;
}

.view-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
}

.danger-button {
  background-color: #ff4d4f;
  color: white;
  border: 1px solid #ff4d4f;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9em;
  transition: all 0.2s;
}

.danger-button.outline {
  background-color: transparent;
  color: #ff4d4f;
}

.danger-button:hover:not(:disabled) {
  background-color: #ff7875;
  border-color: #ff7875;
  color: white;
}

.danger-button:disabled {
  background-color: #ffa39e;
  border-color: #ffa39e;
  cursor: not-allowed;
}

.danger-button.outline:disabled {
  background-color: transparent;
  color: #ffa39e;
  border-color: #ffa39e;
}

.company-list {
  display: flex;
  flex-direction: column;
}

.empty-state {
  text-align: center;
  padding: 24px;
  color: #999;
  background: #fafafa;
  border-radius: 4px;
}
</style>

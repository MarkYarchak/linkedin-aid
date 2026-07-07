<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { useDataStore } from '@/store/data-store';
import { db } from '@/db/schema';
import LeadPreviewList from '@/components/leads/LeadPreviewList.vue';
import CompanyPreview from '@/components/companies/CompanyPreview.vue';
import SearchSessionPreview from '@/components/search-sessions/SearchSessionPreview.vue';
import { matchesLead, matchesCompany, matchesSession } from '@/helpers/entity-search-helper';
import type { Lead } from '@/types/lead/lead';
import type { Company } from '@/types/company/company';
import type { SearchSession } from '@/types/search/search';

const { leadsMap, companiesMap, sessionsMap } = useDataStore();

const PAGE_SIZE = 50;

const searchQuery = ref('');

const leads = computed(() => {
  const all = Object.values(leadsMap.value).sort((a, b) => b.updatedAt - a.updatedAt);
  return all.filter(lead => matchesLead(lead as Lead, searchQuery.value));
});

const companies = computed(() => {
  const all = Object.values(companiesMap.value).sort((a, b) => b.updatedAt - a.updatedAt);
  return all.filter(company => matchesCompany(company as Company, searchQuery.value));
});

const sessions = computed(() => {
  const all = Object.values(sessionsMap.value).sort((a, b) => b.updatedAt - a.updatedAt);
  return all.filter(session => matchesSession(session as SearchSession, searchQuery.value));
});

const leadsCount = computed(() => leads.value.length);
const companiesCount = computed(() => companies.value.length);
const sessionsCount = computed(() => sessions.value.length);

const leadsPage = ref(1);
const companiesPage = ref(1);
const sessionsPage = ref(1);

const paginatedLeads = computed(() => {
  const start = (leadsPage.value - 1) * PAGE_SIZE;
  return leads.value.slice(start, start + PAGE_SIZE);
});

const paginatedCompanies = computed(() => {
  const start = (companiesPage.value - 1) * PAGE_SIZE;
  return companies.value.slice(start, start + PAGE_SIZE);
});

const paginatedSessions = computed(() => {
  const start = (sessionsPage.value - 1) * PAGE_SIZE;
  return sessions.value.slice(start, start + PAGE_SIZE);
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

watch(sessionsCount, (newCount) => {
  const maxPage = Math.max(1, Math.ceil(newCount / PAGE_SIZE));
  if (sessionsPage.value > maxPage) {
    sessionsPage.value = maxPage;
  }
});

watch(searchQuery, () => {
  leadsPage.value = 1;
  companiesPage.value = 1;
  sessionsPage.value = 1;
});

const activeTab = ref('leads');
const tabs = computed(() => [
  { value: 'leads', title: `Leads (${ leadsCount.value })` },
  { value: 'companies', title: `Companies (${ companiesCount.value })` },
  { value: 'sessions', title: `Sessions (${ sessionsCount.value })` },
]);

const selectedLeadUrns = ref(new Set<string>());
const selectedCompanyUrns = ref(new Set<string>());
const selectedSessionIds = ref(new Set<string>());

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

const toggleSessionSelection = (id: string, selected: boolean) => {
  const next = new Set(selectedSessionIds.value);
  if (selected) {
    next.add(id);
  } else {
    next.delete(id);
  }
  selectedSessionIds.value = next;
};

const allLeadsSelected = computed({
  get: () => leadsCount.value > 0 && leads.value.every(l => selectedLeadUrns.value.has(l.entityUrn)),
  set: (val) => {
    const next = new Set(selectedLeadUrns.value);
    if (val) {
      leads.value.forEach(l => next.add(l.entityUrn));
    } else {
      leads.value.forEach(l => next.delete(l.entityUrn));
    }
    selectedLeadUrns.value = next;
  }
});

const allCompaniesSelected = computed({
  get: () => companiesCount.value > 0 && companies.value.every(c => selectedCompanyUrns.value.has(c.entityUrn)),
  set: (val) => {
    const next = new Set(selectedCompanyUrns.value);
    if (val) {
      companies.value.forEach(c => next.add(c.entityUrn));
    } else {
      companies.value.forEach(c => next.delete(c.entityUrn));
    }
    selectedCompanyUrns.value = next;
  }
});

const allSessionsSelected = computed({
  get: () => sessionsCount.value > 0 && sessions.value.every(s => selectedSessionIds.value.has(s.id)),
  set: (val) => {
    const next = new Set(selectedSessionIds.value);
    if (val) {
      sessions.value.forEach(s => next.add(s.id));
    } else {
      sessions.value.forEach(s => next.delete(s.id));
    }
    selectedSessionIds.value = next;
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

const clearSessions = async () => {
  if (confirm('Are you sure you want to clear all stored search sessions?')) {
    await db.searchSessions.clear();
    selectedSessionIds.value = new Set();
    alert('Search sessions cleared.');
  }
};

const clearSelectedSessions = async () => {
  const ids = Array.from(selectedSessionIds.value);
  if (ids.length === 0) return;
  if (confirm(`Are you sure you want to clear ${ids.length} selected search sessions?`)) {
    await db.searchSessions.bulkDelete(ids);
    selectedSessionIds.value = new Set();
    alert('Selected search sessions cleared.');
  }
};
</script>

<template>
  <div>
    <v-btn-toggle
      v-model="activeTab"
      mandatory
      divided
      color="#0073b1"
      class="mb-4 d-flex"
    >
      <v-btn
        v-for="tab in tabs"
        :key="tab.value"
        :value="tab.value"
        :variant="$vuetify.theme.current.dark ? undefined : 'outlined'"
        class="flex-grow-1"
      >
        {{ tab.title }}
      </v-btn>
    </v-btn-toggle>

    <v-card>
      <div class="px-4 py-3">
        <v-text-field
          v-model="searchQuery"
          label="Search by name, title, company, etc."
          rounded
          flat
          variant="outlined"
          autocomplete="none"
          clearable
          prepend-inner-icon="mdi-magnify"
          hide-details
        />
      </div>

      <v-divider></v-divider>

      <v-card-text>
        <div v-if="activeTab === 'leads'" class="nested-tab-content">
          <div class="actions mb-3">
            <v-checkbox v-model="allLeadsSelected" label="Select All" hide-details density="compact" color="#0073b1" />
            <div class="flex-spacer"></div>
            <v-btn
              color="error"
              variant="outlined"
              size="small"
              class="mr-2"
              :disabled="selectedLeadUrns.size === 0"
              @click="clearSelectedLeads"
            >
              Clear Selected ({{ selectedLeadUrns.size }})
            </v-btn>
            <v-btn
              color="error"
              size="small"
              :disabled="leadsCount === 0"
              @click="clearLeads"
            >
              Clear All
            </v-btn>
          </div>

          <div v-if="leads.length > 0" class="entity-list">
            <LeadPreviewList
              :leads="paginatedLeads"
              :selected-urns="selectedLeadUrns"
              @update:selected="toggleLeadSelection"
            />

            <v-pagination
              v-model="leadsPage"
              :length="Math.ceil(leadsCount / PAGE_SIZE)"
              :total-visible="5"
              density="compact"
              class="mt-4"
            ></v-pagination>
          </div>
          <div v-else class="empty-state">
            No leads stored.
          </div>
        </div>

        <div v-else-if="activeTab === 'companies'" class="nested-tab-content">
          <div class="actions mb-3">
            <v-checkbox v-model="allCompaniesSelected" label="Select All" hide-details density="compact" color="#0073b1" />

            <div class="view-options">
              <span class="view-label mr-2">View:</span>
              <v-btn-toggle
                v-model="companyViewMode"
                mandatory
                density="compact"
                variant="outlined"
                color="#0073b1"
              >
                <v-btn value="dense" size="x-small">Compact</v-btn>
                <v-btn value="detailed" size="x-small">Detailed</v-btn>
              </v-btn-toggle>
            </div>

            <div class="flex-spacer"></div>
            <v-btn
              color="error"
              variant="outlined"
              size="small"
              class="mr-2"
              :disabled="selectedCompanyUrns.size === 0"
              @click="clearSelectedCompanies"
            >
              Clear Selected ({{ selectedCompanyUrns.size }})
            </v-btn>
            <v-btn
              color="error"
              size="small"
              :disabled="companiesCount === 0"
              @click="clearCompanies"
            >
              Clear All
            </v-btn>
          </div>

          <div v-if="companies.length > 0" class="entity-list">
            <div class="company-list">
              <template v-for="(company, index) in paginatedCompanies" :key="company.entityUrn">
                <CompanyPreview
                  :company="company"
                  selectable
                  :dense="isCompaniesDense"
                  :selected="selectedCompanyUrns.has(company.entityUrn)"
                  @update:selected="(val) => toggleCompanySelection(company.entityUrn, val)"
                />
                <v-divider v-if="index < paginatedCompanies.length - 1" class="my-1" />
              </template>
            </div>

            <v-pagination
              v-model="companiesPage"
              :length="Math.ceil(companiesCount / PAGE_SIZE)"
              :total-visible="5"
              density="compact"
              class="mt-4"
            ></v-pagination>
          </div>
          <div v-else class="empty-state">
            No companies stored.
          </div>
        </div>

        <div v-else-if="activeTab === 'sessions'" class="nested-tab-content">
          <div class="actions mb-3">
            <v-checkbox v-model="allSessionsSelected" label="Select All" hide-details density="compact" color="#0073b1" />
            <div class="flex-spacer"></div>
            <v-btn
              color="error"
              variant="outlined"
              size="small"
              class="mr-2"
              :disabled="selectedSessionIds.size === 0"
              @click="clearSelectedSessions"
            >
              Clear Selected ({{ selectedSessionIds.size }})
            </v-btn>
            <v-btn
              color="error"
              size="small"
              :disabled="sessionsCount === 0"
              @click="clearSessions"
            >
              Clear All
            </v-btn>
          </div>

          <div v-if="sessions.length > 0" class="entity-list">
            <div class="session-list">
              <template v-for="(session, index) in paginatedSessions" :key="session.id">
                <SearchSessionPreview
                  :session="session"
                  selectable
                  :selected="selectedSessionIds.has(session.id)"
                  @update:selected="(val) => toggleSessionSelection(session.id, val)"
                />
                <v-divider v-if="index < paginatedSessions.length - 1" class="my-1" />
              </template>
            </div>

            <v-pagination
              v-model="sessionsPage"
              :length="Math.ceil(sessionsCount / PAGE_SIZE)"
              :total-visible="5"
              density="compact"
              class="mt-4"
            ></v-pagination>
          </div>
          <div v-else class="empty-state">
            No search sessions stored.
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<style scoped>
.nested-tab-content {
  display: flex;
  flex-direction: column;
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
  gap: 4px;
  padding-left: 12px;
  border-left: 1px solid #eee;
}

.view-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
}

.company-list,
.session-list {
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

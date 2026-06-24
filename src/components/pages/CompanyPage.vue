<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useCompanies } from '@/composables/useCompanies';
import { useLeads } from '@/composables/useLeads';
import { usePersonas } from '@/composables/usePersonas';
import { useSearchSessions } from '@/composables/useSearchSessions';
import { getPersonaSearchIdFromUrn } from '@/helpers/urn';
import CompanyPreview from '@/components/companies/CompanyPreview.vue';
import LeadPreviewList from '@/components/leads/LeadPreviewList.vue';
import AppSegmentedControl from '@/components/ui/AppSegmentedControl.vue';
import AppCheckbox from '@/components/ui/AppCheckbox.vue';
import AppCopyButton from '@/components/ui/AppCopyButton.vue';
import BulkCopyModal from '@/components/modals/BulkCopyModal.vue';

interface Props {
  tabUrl: string;
}
const props = defineProps<Props>();

const { currentUrlCompany } = useCompanies(props.tabUrl);
const { getLeadsByCompany, getLeadsByPersona, getSavedLeadsByCompany } = useLeads(props.tabUrl);
const { getPersonasByCompany } = usePersonas();
const { getSessionsByCompany } = useSearchSessions();

const activeTab = ref('persona');
const tabs = [
  { label: 'By Persona', value: 'persona' },
  { label: 'All Leads', value: 'all' },
  { label: 'Saved', value: 'saved' },
];

const selectedPersonaId = ref('');

const companyPersonas = computed(() => {
  if (!currentUrlCompany.value) return [];
  return getPersonasByCompany(currentUrlCompany.value.entityUrn);
});

const companySessions = computed(() => {
  const companyUrn = currentUrlCompany.value?.entityUrn;
  if (!companyUrn) return [];
  return companyUrn ? getSessionsByCompany(companyUrn) : [];
});

const currentSessionHeroCard = computed(() => {
  const sessionByPersona = activeTab.value === 'persona' && companySessions.value.find(s => s.personaId);
  const session = sessionByPersona || companySessions.value.find(s => s.heroCard);
  return session?.heroCard;
});

const personaOptions = computed(() => {
  const options: { label: string; value: string }[] = [];
  companyPersonas.value.forEach(p => {
    try {
      const id = getPersonaSearchIdFromUrn(p.personaUrn);
      options.push({ label: p.personaName, value: id });
    } catch (e) {
      console.error('Failed to parse persona URN', p.personaUrn);
    }
  });

  if (options.length > 0 && !selectedPersonaId.value) {
    const latestPersonaSession = companySessions.value.find(s => s.personaId); // Already sorted by updatedAt in useSearchSessions
    if (latestPersonaSession && latestPersonaSession.personaId) {
      selectedPersonaId.value = latestPersonaSession.personaId;
    } else {
      selectedPersonaId.value = options[0].value;
    }
  }

  return options;
});

const companyLeads = computed(() => {
  if (!currentUrlCompany.value) return [];
  const urn = currentUrlCompany.value.entityUrn;

  if (activeTab.value === 'persona') {
    return getLeadsByPersona(urn, selectedPersonaId.value);
  }
  if (activeTab.value === 'saved') {
    return getSavedLeadsByCompany(urn);
  }
  return getLeadsByCompany(urn, true);
});

const selectedUrns = ref<Set<string>>(new Set());

const selectedLeads = computed(() => {
  return companyLeads.value.filter(l => selectedUrns.value.has(l.entityUrn));
});

const isAllSelected = computed(() => {
  if (companyLeads.value.length === 0) return false;
  return companyLeads.value.every(l => selectedUrns.value.has(l.entityUrn));
});

const toggleLeadSelection = (urn: string, selected: boolean) => {
  if (selected) {
    selectedUrns.value.add(urn);
  } else {
    selectedUrns.value.delete(urn);
  }
};

const toggleAllSelection = (selected: boolean) => {
  companyLeads.value.forEach(l => {
    if (selected) {
      selectedUrns.value.add(l.entityUrn);
    } else {
      selectedUrns.value.delete(l.entityUrn);
    }
  });
};

const showBulkCopyModal = ref(false);

const copySelected = () => {
  if (selectedLeads.value.length === 0) return;
  showBulkCopyModal.value = true;
};

watch([activeTab, selectedPersonaId, () => props.tabUrl], () => {
  selectedUrns.value.clear();
});
</script>

<template>
  <div class="company-page">
    <div v-if="currentUrlCompany">
      <CompanyPreview :company="currentUrlCompany" />

      <div class="leads-section">
        <div class="leads-header">
          <h4>Loaded leads ({{ companyLeads.length }})</h4>
          <AppSegmentedControl
            v-model="activeTab"
            :options="tabs"
          />
        </div>

        <div v-if="activeTab === 'persona' && personaOptions.length > 0" class="persona-selector">
          <label>Filter by Persona:</label>
          <select v-model="selectedPersonaId" class="app-select">
            <option v-for="opt in personaOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>

        <div v-if="companyLeads.length > 0" class="selection-actions">
          <AppCheckbox
            :model-value="isAllSelected"
            label="Select All"
            @update:model-value="toggleAllSelection"
          />
          <AppCopyButton
            :label="`Copy Selected (${selectedLeads.length})`"
            :primary="true"
            :disabled="selectedLeads.length === 0"
            size="sm"
            @click="copySelected"
          />
        </div>

        <LeadPreviewList
          v-if="companyLeads.length > 0"
          :leads="companyLeads"
          :selected-urns="selectedUrns"
          @update:selected="toggleLeadSelection"
        />
        <div v-else class="no-leads">
          No leads found for this category.
        </div>
      </div>
    </div>
    <div v-else class="no-data">
      No company collected yet. Navigate to a Sales Navigator company profile to collect data.
    </div>

    <BulkCopyModal
      v-if="showBulkCopyModal"
      :show="showBulkCopyModal"
      :leads="selectedLeads"
      :hero-card="currentSessionHeroCard"
      @close="showBulkCopyModal = false"
    />
  </div>
</template>

<style scoped>
.company-page {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.leads-section {
  margin-top: 8px;
}

.leads-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  gap: 8px;
}

.leads-header h4 {
  margin: 0;
  font-size: 0.95em;
  color: #333;
}

.selection-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 0 4px;
}

.persona-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 8px;
  background: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.persona-selector label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
}

.app-select {
  flex: 1;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #cbd5e1;
  font-size: 0.85rem;
  background-color: white;
  color: #1e293b;
  outline: none;
}

.app-select:focus {
  border-color: #0a66c2;
  box-shadow: 0 0 0 2px rgba(10, 102, 194, 0.1);
}

.no-leads {
  padding: 20px;
  text-align: center;
  color: #666;
  font-size: 0.9em;
  background: #f9fafb;
  border-radius: 4px;
  border: 1px dashed #e2e8f0;
}
</style>

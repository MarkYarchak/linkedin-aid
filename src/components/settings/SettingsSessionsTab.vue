<script lang="ts" setup>
import { computed, ref } from 'vue';
import { browser } from 'wxt/browser';
import { useDataStore } from '@/store/data-store';
import AppCard from '@/components/ui/AppCard.vue';
import AppSegmentedControl from '@/components/ui/AppSegmentedControl.vue';
import IconCross from '@/components/icons/IconCross.vue';

const { personasStorage, leadTitles, leadsMap } = useDataStore();

const activeSubTab = ref('personas');
const subTabs = [
  { label: 'Personas', value: 'personas' },
  { label: 'Lead Titles', value: 'lead_titles' },
];

const personasCount = computed(() => {
  const general = personasStorage.value.general.length;
  const byCompany = Object.values(personasStorage.value.byCompany).reduce((acc, val) => acc + val.length, 0);
  return general + byCompany;
});

const leadTitlesCount = computed(() => Object.keys(leadTitles.value).length);

const allPersonas = computed(() => {
  const list: { name: string, urn: string, type: string }[] = [];

  personasStorage.value.general.forEach(p => {
    list.push({ name: p.personaName, urn: p.personaUrn, type: 'General' });
  });

  Object.entries(personasStorage.value.byCompany).forEach(([companyUrn, personas]) => {
    personas.forEach(p => {
      list.push({ name: p.personaName, urn: p.personaUrn, type: `Company ${companyUrn.split(':').pop()}` });
    });
  });

  return list;
});

const leadTitlesList = computed(() => {
  return Object.entries(leadTitles.value).map(([urn, title]) => {
    const lead = leadsMap.value[urn];
    return {
      urn,
      title,
      name: lead ? `${lead.main?.fullName || lead.searchResult?.fullName}` : urn.split(':').pop() || urn,
    };
  });
});

const removePersona = async (urn: string) => {
  const newStorage = JSON.parse(JSON.stringify(personasStorage.value));

  // Remove from general
  newStorage.general = newStorage.general.filter((p: any) => p.personaUrn !== urn);

  // Remove from byCompany
  Object.keys(newStorage.byCompany).forEach(companyUrn => {
    newStorage.byCompany[companyUrn] = newStorage.byCompany[companyUrn].filter((p: any) => p.personaUrn !== urn);
    if (newStorage.byCompany[companyUrn].length === 0) {
      delete newStorage.byCompany[companyUrn];
    }
  });

  await browser.storage.session.set({ personas: newStorage });
};

const removeLeadTitle = async (urn: string) => {
  const newTitles = { ...leadTitles.value };
  delete newTitles[urn];
  await browser.storage.session.set({ lead_titles: newTitles });
};

const clearPersonas = async () => {
  if (confirm('Are you sure you want to clear all stored personas?')) {
    await browser.storage.session.remove(['personas']);
  }
};

const clearLeadTitles = async () => {
  if (confirm('Are you sure you want to clear all stored lead titles?')) {
    await browser.storage.session.remove(['lead_titles']);
  }
};
</script>

<template>
  <div class="tab-content">
    <AppSegmentedControl
      v-model="activeSubTab"
      :options="subTabs"
    />

    <div v-if="activeSubTab === 'personas'" class="sub-tab-content">
      <AppCard>
        <template #header>
          <div class="card-header-content">
            <h3 class="card-title">Stored Personas ({{ personasCount }})</h3>
            <button v-if="personasCount > 0" class="clear-btn" @click="clearPersonas">
              Clear All
            </button>
          </div>
        </template>

        <div v-if="allPersonas.length === 0" class="empty-state">
          No personas stored in current session.
        </div>

        <div v-else class="items-list">
          <div v-for="persona in allPersonas" :key="persona.urn" class="item-row">
            <div class="item-info">
              <span class="item-name">{{ persona.name }}</span>
              <span class="item-meta">{{ persona.type }}</span>
            </div>
            <button class="remove-item-btn" @click="removePersona(persona.urn)" title="Remove">
              <IconCross size="14" />
            </button>
          </div>
        </div>
      </AppCard>
    </div>

    <div v-else-if="activeSubTab === 'lead_titles'" class="sub-tab-content">
      <AppCard>
        <template #header>
          <div class="card-header-content">
            <h3 class="card-title">Stored Lead Titles ({{ leadTitlesCount }})</h3>
            <button v-if="leadTitlesCount > 0" class="clear-btn" @click="clearLeadTitles">
              Clear All
            </button>
          </div>
        </template>

        <div v-if="leadTitlesList.length === 0" class="empty-state">
          No lead titles stored in current session.
        </div>

        <div v-else class="items-list">
          <div v-for="item in leadTitlesList" :key="item.urn" class="item-row">
            <div class="item-info">
              <span class="item-name">{{ item.name }}</span>
              <span class="item-meta">{{ item.title }}</span>
            </div>
            <button class="remove-item-btn" @click="removeLeadTitle(item.urn)" title="Remove">
              <IconCross size="14" />
            </button>
          </div>
        </div>
      </AppCard>
    </div>
  </div>
</template>

<style scoped>
.tab-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 700;
  color: #1e293b;
}

.clear-btn {
  font-size: 0.75rem;
  color: #ef4444;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
}

.clear-btn:hover {
  background-color: #fee2e2;
}

.empty-state {
  text-align: center;
  color: #64748b;
  font-size: 0.85rem;
  padding: 12px 0;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background-color: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
}

.item-meta {
  font-size: 0.75rem;
  color: #64748b;
}

.remove-item-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  color: #94a3b8;
}

.remove-item-btn:hover {
  background-color: #fee2e2;
  color: #ef4444;
}
</style>

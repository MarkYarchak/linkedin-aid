<script lang="ts" setup>
import { computed, ref } from 'vue';
import { browser } from 'wxt/browser';
import { useDataStore } from '@/store/data-store';

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
  <div>
    <v-btn-toggle
      v-model="activeSubTab"
      mandatory
      divided
      color="#0073b1"
      class="mb-4 d-flex"
    >
      <v-btn
        v-for="tab in subTabs"
        :key="tab.value"
        :value="tab.value"
        :variant="$vuetify.theme.current.dark ? undefined : 'outlined'"
        class="flex-grow-1"
      >
        {{ tab.label }}
      </v-btn>
    </v-btn-toggle>

    <div v-if="activeSubTab === 'personas'" class="sub-tab-content">
      <v-card>
        <v-card-item>
          <template #append>
            <v-btn
              v-if="personasCount > 0"
              color="error"
              variant="text"
              size="x-small"
              @click="clearPersonas"
            >
              Clear All
            </v-btn>
          </template>
          <v-card-title class="text-subtitle-2 font-weight-bold">
            Stored Personas ({{ personasCount }})
          </v-card-title>
        </v-card-item>

        <v-divider></v-divider>

        <v-card-text>
          <div v-if="allPersonas.length === 0" class="empty-state">
            No personas stored in current session.
          </div>

          <div v-else class="items-list">
            <div v-for="persona in allPersonas" :key="persona.urn" class="item-row">
              <div class="item-info">
                <span class="item-name">{{ persona.name }}</span>
                <span class="item-meta">{{ persona.type }}</span>
              </div>
              <v-btn
                icon
                variant="text"
                size="x-small"
                color="error"
                @click="removePersona(persona.urn)"
                title="Remove"
              >
                <v-icon size="16">mdi-close</v-icon>
              </v-btn>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <div v-else-if="activeSubTab === 'lead_titles'" class="sub-tab-content">
      <v-card>
        <v-card-item>
          <template #append>
            <v-btn
              v-if="leadTitlesCount > 0"
              color="error"
              variant="text"
              size="x-small"
              @click="clearLeadTitles"
            >
              Clear All
            </v-btn>
          </template>
          <v-card-title class="text-subtitle-2 font-weight-bold">
            Stored Lead Titles ({{ leadTitlesCount }})
          </v-card-title>
        </v-card-item>

        <v-divider></v-divider>

        <v-card-text>
          <div v-if="leadTitlesList.length === 0" class="empty-state">
            No lead titles stored in current session.
          </div>

          <div v-else class="items-list">
            <div v-for="item in leadTitlesList" :key="item.urn" class="item-row">
              <div class="item-info">
                <span class="item-name">{{ item.name }}</span>
                <span class="item-meta">{{ item.title }}</span>
              </div>
              <v-btn
                icon
                variant="text"
                size="x-small"
                color="error"
                @click="removeLeadTitle(item.urn)"
                title="Remove"
              >
                <v-icon size="16">mdi-close</v-icon>
              </v-btn>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<style scoped>
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
  padding: 8px 12px;
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
</style>

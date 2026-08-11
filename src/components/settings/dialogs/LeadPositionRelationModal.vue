<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { useDataStore } from '@/store/data-store';
import { db } from '@/db/schema';
import { deepToRaw } from '@/helpers/vue-helper';
import CompanyPreview from '@/components/companies/CompanyPreview.vue';
import type { Lead } from '@/types/lead/lead';
import type { Company } from '@/types/company/company';
import type { OptionalDeepReadonly } from '@/types/common';

interface Props {
  modelValue: boolean;
  lead: Lead | null;
}

const props = defineProps<Props>();
const emit = defineEmits(['update:modelValue', 'saved']);

const { companiesMap, sessionsMap, leadPositionRelationsMap } = useDataStore();

const show = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

// All companies extracted from the lead's profile/search result
const profileCompanies = computed(() => {
  if (!props.lead) return [];
  const lead = props.lead;
  const urns = new Set<string>();
  const result: { urn: string, name: string }[] = [];

  const add = (urn?: string, name?: string) => {
    if (urn && !urns.has(urn)) {
      urns.add(urn);
      result.push({ urn, name: name || 'Unknown Company' });
    }
  };

  lead.main?.positions?.forEach(p => {
    add(p.companyUrn, p.companyName);
    add(p.companyUrnResolutionResult?.entityUrn, p.companyName);
  });

  if (lead.main?.defaultPosition) {
    const dp = lead.main.defaultPosition;
    add(dp.companyUrn, dp.companyName);
  }

  lead.searchResult?.currentPositions?.forEach(p => {
    add(p.companyUrn, p.companyName);
  });

  return result;
});

const leadSessionCompanyUrns = computed(() => {
  if (!props.lead) return new Set<string>();
  const leadUrn = props.lead.entityUrn;
  const urns = new Set<string>();
  Object.values(sessionsMap.value).forEach(session => {
    const pages = Object.values(session.leadUrnsByPage || {});
    if (pages.some(page => page.includes(leadUrn)) && session.companyUrn) {
      urns.add(session.companyUrn);
    }
  });
  return urns;
});

const getPositionItems = (pos: any) => {
  const sessionUrns = leadSessionCompanyUrns.value;
  const posCompanyName = pos.companyName?.toLowerCase();

  const allInDb = Object.values(companiesMap.value);
  const profile = profileCompanies.value;

  const urns = new Set<string>();
  const items: any[] = [];

  const addItem = (urn: string, name: string, type: string, score: number) => {
    if (urn && !urns.has(urn)) {
      urns.add(urn);
      items.push({
        urn,
        name,
        type,
        score,
        inDb: !!companiesMap.value[urn],
        props: {
          subtitle: type
        }
      });
    }
  };

  // 1. Session related (Top priority)
  sessionUrns.forEach(urn => {
    const company = companiesMap.value[urn];
    if (company) addItem(urn, company.main?.name || 'Unknown', 'Search Session Relation', 100);
  });

  // 2. Name matches in DB
  if (posCompanyName) {
    allInDb.forEach(c => {
      if (c.main?.name?.toLowerCase() === posCompanyName) {
        addItem(c.entityUrn, c.main!.name!, 'Common Name Match', 80);
      }
    });
  }

  // 3. Profile companies
  profile.forEach(c => {
    addItem(c.urn, c.name, 'Lead Profile', 60);
  });

  // 4. All other companies in DB
  allInDb.forEach(c => {
    addItem(c.entityUrn, c.main?.name || 'Unknown', 'In Database', 0);
  });

  return items.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.name.localeCompare(b.name);
  });
};

const positions = computed(() => {
  return props.lead?.main?.positions?.filter(p => p.current) || [];
});

const selectedRelations = ref<Record<number, string>>({});

watch(() => [props.lead, props.modelValue], ([newLead, isVisible]) => {
  if (isVisible && newLead) {
    const existing = leadPositionRelationsMap.value[(newLead as Lead).entityUrn] || {};
    selectedRelations.value = { ...existing };
  }
}, { immediate: true });

const setRelation = (posId: number, companyUrn: string | null) => {
  const next = { ...selectedRelations.value };
  if (companyUrn) {
    next[posId] = companyUrn;
  } else {
    delete next[posId];
  }
  selectedRelations.value = next;
};

const saveRelations = async () => {
  if (!props.lead) return;
  const leadUrn = props.lead.entityUrn;

  const now = Date.now();
  const hasRelations = Object.keys(selectedRelations.value).length > 0;

  if (hasRelations) {
    // Get existing to preserve createdAt
    const existing = await db.leadPositionRelations.get(leadUrn);
    await db.leadPositionRelations.put({
      leadUrn,
      relations: deepToRaw(selectedRelations.value),
      createdAt: existing?.createdAt || now,
      updatedAt: now
    });
  } else {
    await db.leadPositionRelations.delete(leadUrn);
  }

  emit('saved');
  show.value = false;
};

const leadName = computed(() => {
  if (!props.lead) return '';
  return `${props.lead.main?.firstName || props.lead.searchResult?.firstName || ''} ${props.lead.main?.lastName || props.lead.searchResult?.lastName || ''}`.trim();
});

const getCompanyFromMap = (urn: string): OptionalDeepReadonly<Company> | null => {
  return companiesMap.value[urn] || null;
};
</script>

<template>
  <v-dialog v-model="show" max-width="700" scrollable>
    <v-card v-if="lead">
      <v-toolbar color="#0073b1" theme="dark" density="compact">
        <v-toolbar-title class="text-subtitle-1">
          Manage Position Relations: {{ leadName }}
        </v-toolbar-title>
        <v-btn icon="mdi-close" variant="text" @click="show = false"></v-btn>
      </v-toolbar>

      <v-card-text>
        <div class="mb-4">
          <p class="text-body-2 mb-2">
            Assign companies to specific positions to override their primary company.
            Suggestions are prioritized by search session relations and common names.
          </p>
        </div>

        <div class="position-list border rounded">
          <v-list density="comfortable" lines="three">
            <template v-for="(pos, index) in positions" :key="pos.posId">
              <v-list-item>
                <v-list-item-title class="font-weight-bold">{{ pos.title }}</v-list-item-title>
                <v-list-item-subtitle>
                  Original: {{ pos.companyName }}
                  <span class="text-caption text-grey">({{ pos.companyUrn || 'No URN' }})</span>
                </v-list-item-subtitle>

                <div class="mt-2">
                  <v-autocomplete
                    :model-value="selectedRelations[pos.posId] || null"
                    :items="getPositionItems(pos)"
                    item-title="name"
                    item-value="urn"
                    label="Assign Primary Company"
                    density="compact"
                    variant="outlined"
                    clearable
                    hide-details
                    class="relation-select"
                    @update:model-value="(val) => setRelation(pos.posId, val)"
                  >
                    <template #item="{ props: itemProps, item }">
                      <v-list-item v-bind="itemProps">
                        <template #title>
                          <div class="d-flex align-center">
                            {{ item.name }}
                            <v-chip v-if="item.inDb" size="x-small" color="success" variant="flat" class="ml-2">In DB</v-chip>
                          </div>
                        </template>
                        <template #subtitle>
                          <span :class="{'text-primary font-weight-bold': item.score > 0}">
                            {{ item.type }}
                          </span>
                          <span class="text-caption ml-2">({{ item.urn }})</span>
                        </template>
                      </v-list-item>
                    </template>
                  </v-autocomplete>
                </div>

                <div v-if="selectedRelations[pos.posId]" class="mt-2 ml-4">
                  <div v-if="getCompanyFromMap(selectedRelations[pos.posId])" class="preview-box">
                    <CompanyPreview :company="getCompanyFromMap(selectedRelations[pos.posId])!" dense />
                  </div>
                  <div v-else class="text-caption text-grey italic">
                    <v-icon icon="mdi-information-outline" size="14" class="mr-1" />
                    Company data not yet stored in database.
                  </div>
                </div>
              </v-list-item>
              <v-divider v-if="index < positions.length - 1" />
            </template>
          </v-list>

          <div v-if="positions.length === 0" class="text-center py-8 text-grey">
            <v-icon icon="mdi-briefcase-off-outline" size="large" class="mb-2" />
            <p v-if="!lead.main">Please open the lead's full profile first to load all positions.</p>
            <p v-else>No current positions found in lead's profile.</p>
          </div>
        </div>
      </v-card-text>

      <v-divider></v-divider>
      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="show = false">Cancel</v-btn>
        <v-btn color="#0073b1" variant="flat" @click="saveRelations">Save Relations</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.position-list {
  max-height: 500px;
  overflow-y: auto;
}

.relation-select {
  max-width: 100%;
}

.preview-box {
  background: rgba(0,0,0,0.02);
  padding: 4px;
  border-radius: 4px;
}

.italic {
  font-style: italic;
}
</style>

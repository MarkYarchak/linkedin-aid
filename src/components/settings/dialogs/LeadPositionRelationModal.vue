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

const { companiesMap, leadPositionRelationsMap } = useDataStore();

const show = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

// All companies extracted from the lead's profile/search result
const availableCompanies = computed(() => {
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

const positions = computed(() => {
  const mainPos = props.lead?.main?.positions || [];
  if (mainPos.length > 0) return mainPos;
  return props.lead?.searchResult?.currentPositions || [];
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
            Assign companies from the lead's profile to specific positions to override their primary company.
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
                  <v-select
                    :model-value="selectedRelations[pos.posId] || null"
                    :items="availableCompanies"
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
                        <template #subtitle>
                          {{ item.name }}
                          <v-chip v-if="getCompanyFromMap(item.urn)" size="x-small" color="success" class="ml-2">In DB</v-chip>
                        </template>
                      </v-list-item>
                    </template>
                  </v-select>
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
            <p>No positions found in lead's profile.</p>
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

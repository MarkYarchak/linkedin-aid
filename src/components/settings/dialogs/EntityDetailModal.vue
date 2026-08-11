<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useDataStore } from '@/store/data-store';
import { getEffectiveLeadPositions } from '@/helpers/lead-helper';
import { getSalesNavigatorLeadUrl, getSalesNavigatorCompanyUrl } from '@/helpers/url-helpers';
import { getEntityExpirationInfo } from '@/helpers/date-helper';
import AppPreviewBox from '@/components/ui/AppPreviewBox.vue';
import type { Lead } from '@/types/lead/lead';
import type { Company } from '@/types/company/company';
import type { SearchSession } from '@/types/search/search';
import type { CompaniesMap } from '@/store/data-store';

type Entity = Lead | Company | SearchSession | null;

interface Props {
  modelValue: boolean;
  entity: Entity;
  showExpiration?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showExpiration: false,
});
const emit = defineEmits(['update:modelValue', 'close']);

const { leadPositionRelationsMap, companiesMap, entitiesTTL } = useDataStore();

const expirationInfo = computed(() => {
  if (!props.entity) return '';
  return getEntityExpirationInfo(props.entity.updatedAt, entitiesTTL.value);
});

const effectivePositions = computed(() => {
  if (!props.entity || !isLead(props.entity)) return null;
  return getEffectiveLeadPositions(props.entity, leadPositionRelationsMap.value, companiesMap.value as CompaniesMap);
});

const primaryPosition = computed(() => {
  const positions = effectivePositions.value;
  if (!positions) return null;
  const current = positions.mainPositions.filter(p => p.current);
  if (current.length > 0) {
    const manual = current.find(p => (p as any).isManuallyLinked);
    return manual || current[0];
  }
  const searchCurrent = positions.searchPositions.filter(p => p.current);
  if (searchCurrent.length > 0) {
    const manual = searchCurrent.find(p => (p as any).isManuallyLinked);
    return manual || searchCurrent[0];
  }
  return positions.mainPositions[0] || positions.searchPositions[0] || null;
});

const customRelations = computed(() => {
  if (!props.entity || !isLead(props.entity)) return [];
  const relations = leadPositionRelationsMap.value[props.entity.entityUrn] || {};
  return Object.entries(relations).map(([posId, companyUrn]) => {
    const company = companiesMap.value[companyUrn];
    return {
      posId: parseInt(posId),
      companyUrn,
      name: company?.main?.name || 'Linked Company'
    };
  });
});

const show = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const activeTab = ref('raw');

const entityType = computed(() => {
  if (!props.entity) return '';
  const e = props.entity as any;
  if (e.main?.firstName || e.searchResult?.firstName || e.main?.lastName) return 'Lead';
  if (e.main?.name || e.entityUrn?.includes('company')) return 'Company';
  if (e.id && (e.query || e.searchTitle)) return 'Session';
  return 'Unknown';
});

const isLead = (entity: Entity): entity is Lead => {
  return entityType.value === 'Lead';
};

const isCompany = (entity: Entity): entity is Company => {
  return entityType.value === 'Company';
};

const isSearchSession = (entity: Entity): entity is SearchSession => {
  return entityType.value === 'Session';
};

const isLeadOrCompany = (entity: Entity) => {
  return isLead(entity) || isCompany(entity);
}

const entityName = computed(() => {
  if (!props.entity) return '';
  if (isLead(props.entity)) {
    const lead = props.entity;
    return `${lead.main?.firstName || lead.searchResult?.firstName || ''} ${lead.main?.lastName || lead.searchResult?.lastName || ''}`.trim();
  } else if (isCompany(props.entity)) {
    const company = props.entity;
    return company.main?.name || 'Company';
  } else {
    const session = props.entity as SearchSession;
    return session.searchTitle || session.query || 'Session';
  }
});

const profileUrl = computed(() => {
  if (!props.entity) return null;
  if (isLead(props.entity)) {
    return props.entity.profileUrl || getSalesNavigatorLeadUrl(props.entity.entityUrn);
  } else if (isCompany(props.entity)) {
    return props.entity.profileUrl || getSalesNavigatorCompanyUrl(props.entity.entityUrn);
  }
  return null;
});

const jsonData = computed(() => {
  if (!props.entity) return {};
  return props.entity;
});

const wrapJsonData = ref(false);
const isCopied = ref(false);

const copyJson = async () => {
  try {
    const formatterJson = JSON.stringify(jsonData.value, null, 2);
    await navigator.clipboard.writeText(formatterJson);
    isCopied.value = true;
    setTimeout(() => {
      isCopied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy JSON:', err);
  }
};

const close = () => {
  show.value = false;
  emit('close');
};
</script>

<template>
  <v-dialog
    v-model="show"
    max-width="900"
    scrollable
  >
    <v-card v-if="entity">
      <v-toolbar
        color="primary"
        density="compact"
        class="ga-2"
      >
        <v-toolbar-title>
          {{ entityType }} Details: {{ entityName }}
        </v-toolbar-title>
        <v-btn
          v-if="profileUrl"
          :href="profileUrl"
          target="_blank"
          variant="elevated"
          density="comfortable"
          prepend-icon="mdi-open-in-new"
          class="mr-2"
        >
          Open in LinkedIn
        </v-btn>
        <v-btn icon="mdi-close" variant="text" @click="close"></v-btn>
      </v-toolbar>

      <v-tabs v-model="activeTab" bg-color="transparent" color="primary" density="compact">
        <v-tab value="info" prepend-icon="mdi-information-outline">General</v-tab>
        <v-tab value="raw" prepend-icon="mdi-code-json">Raw Data</v-tab>
      </v-tabs>

      <v-divider></v-divider>

      <v-card-text style="height: 600px;">
        <v-window v-model="activeTab">
          <v-window-item value="info">
            <v-list density="compact">
              <template v-if="isLeadOrCompany(entity)">
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon icon="mdi-identifier" class="mr-2"></v-icon>
                  </template>
                  <v-list-item-title class="font-weight-bold">Entity URN</v-list-item-title>
                  <v-list-item-subtitle>{{ entity.entityUrn }}</v-list-item-subtitle>
                </v-list-item>

                <v-list-item v-if="profileUrl" :href="profileUrl" target="_blank">
                  <template v-slot:prepend>
                    <v-icon icon="mdi-linkedin" class="mr-2" color="#0073b1"></v-icon>
                  </template>
                  <v-list-item-title class="font-weight-bold">LinkedIn Profile</v-list-item-title>
                  <v-list-item-subtitle class="text-primary">{{ profileUrl }}</v-list-item-subtitle>
                </v-list-item>
              </template>

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon icon="mdi-clock-outline" class="mr-2"></v-icon>
                </template>
                <v-list-item-title class="font-weight-bold">Last Updated</v-list-item-title>
                <v-list-item-subtitle>{{ new Date(entity.updatedAt).toLocaleString() }}</v-list-item-subtitle>
              </v-list-item>

              <v-list-item v-if="showExpiration">
                <template v-slot:prepend>
                  <v-icon icon="mdi-delete-clock-outline" class="mr-2"></v-icon>
                </template>
                <v-list-item-title class="font-weight-bold">Expiration / TTL</v-list-item-title>
                <v-list-item-subtitle>{{ expirationInfo }}</v-list-item-subtitle>
              </v-list-item>

              <template v-if="isLead(entity)">
                <v-divider class="my-2"></v-divider>
                <v-list-subheader>Lead Information</v-list-subheader>
                <v-list-item>
                  <v-list-item-title class="font-weight-bold">Title</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ primaryPosition?.title || 'N/A' }}
                  </v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title class="font-weight-bold">Company</v-list-item-title>
                  <v-list-item-subtitle :class="{ 'text-primary font-weight-bold': (primaryPosition as any)?.isManuallyLinked }">
                    <v-icon v-if="(primaryPosition as any)?.isManuallyLinked" icon="mdi-link" size="small" class="mr-1" />
                    {{ primaryPosition?.companyName || 'N/A' }}
                  </v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title class="font-weight-bold">Location</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ entity.main?.location || entity.searchResult?.geoRegion || 'N/A' }}
                  </v-list-item-subtitle>
                </v-list-item>
                <v-list-item v-if="customRelations.length > 0">
                  <v-list-item-title class="font-weight-bold">Manually Linked Companies</v-list-item-title>
                  <v-list-item-subtitle v-for="rel in customRelations" :key="rel.posId" class="text-primary font-weight-bold">
                    <v-icon icon="mdi-link" size="small" class="mr-1" />
                    Pos {{ rel.posId }}: {{ rel.name }}
                  </v-list-item-subtitle>
                </v-list-item>
              </template>

              <template v-if="isCompany(entity)">
                <v-divider class="my-2"></v-divider>
                <v-list-subheader>Company Information</v-list-subheader>
                <v-list-item>
                  <v-list-item-title class="font-weight-bold">Industry</v-list-item-title>
                  <v-list-item-subtitle>{{ entity.main?.industry || 'N/A' }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title class="font-weight-bold">Employee Count</v-list-item-title>
                  <v-list-item-subtitle>{{ entity.extra?.employeeCount || 'N/A' }}</v-list-item-subtitle>
                </v-list-item>
              </template>

              <template v-if="isSearchSession(entity)">
                <v-divider class="my-2"></v-divider>
                <v-list-subheader>Session Information</v-list-subheader>
                <v-list-item>
                  <v-list-item-title class="font-weight-bold">Query</v-list-item-title>
                  <v-list-item-subtitle>{{ entity.query }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title class="font-weight-bold">Total Results</v-list-item-title>
                  <v-list-item-subtitle>{{ entity.total }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title class="font-weight-bold">Source</v-list-item-title>
                  <v-list-item-subtitle>{{ entity.source || 'N/A' }}</v-list-item-subtitle>
                </v-list-item>
              </template>
            </v-list>
          </v-window-item>

          <v-window-item value="raw">
            <AppPreviewBox
              :json="jsonData"
              :wrap-text="wrapJsonData"
              :is-copied="isCopied"
              :deep="5"
              content-max-height="544px"
            >
              <template #header>
                <v-btn
                  size="small"
                  variant="tonal"
                  :color="isCopied ? 'success' : 'primary'"
                  :prepend-icon="isCopied ? 'mdi-check' : 'mdi-content-copy'"
                  @click="copyJson"
                >
                  {{ isCopied ? 'Copied!' : 'Copy JSON' }}
                </v-btn>
                <v-checkbox-btn
                  v-model="wrapJsonData"
                  label="Wrap text"
                />
              </template>
            </AppPreviewBox>
          </v-window-item>
        </v-window>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          variant="text"
          @click="close"
        >
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
:deep(.v-list-item-subtitle) {
  opacity: 1;
}
</style>

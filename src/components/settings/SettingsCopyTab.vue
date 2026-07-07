<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useDataStore } from '@/store/data-store';
import { storageService } from '@/services/storage-service';

const { copyLeadSettings, bulkCopyLeadSettings } = useDataStore();

// Copy Settings Local State
const localCopySettings = ref({
  leadFields: {
    fullName: true,
    headline: true,
    location: true,
    summary: true,
    recentActivity: true,
    mutualConnections: true,
    position: {
      title: true,
      companyName: true,
      industry: true,
      location: true,
      startedOn: true,
      description: true,
    },
  },
  companyFields: {
    name: true,
    description: true,
    industry: true,
    location: true,
    revenueRange: true,
    specialties: true,
    type: true,
    yearFounded: true,
    employeeCount: true,
  },
  prefix: '',
  viewMode: 'text',
  wrapText: false,
  insightFilters: [] as string[],
});

const localBulkCopySettings = ref({
  leadFields: {
    fullName: true,
    location: true,
    summary: true,
    recentActivity: true,
    mutualConnections: true,
    heroCard: true,
    position: {
      title: true,
      companyName: true,
      industry: true,
      location: true,
      startedOn: true,
      description: true,
    },
  },
  prefix: '',
  viewMode: 'text',
  wrapText: false,
});

const insightSelectionOptions = [
  { title: 'Posts', value: 'posts' },
  { title: 'Reshared posts', value: 'posts_reshared' },
  { title: 'Comments', value: 'comments' },
];

const viewOptions = [
  { title: 'Text', value: 'text' },
  { title: 'JSON', value: 'json' },
];

// Initialize local state from store
watch(() => copyLeadSettings.value, (val) => {
  if (val) {
    if (val.leadFields) localCopySettings.value.leadFields = JSON.parse(JSON.stringify(val.leadFields));
    if (val.companyFields) localCopySettings.value.companyFields = JSON.parse(JSON.stringify(val.companyFields));
    if (val.prefix !== undefined) localCopySettings.value.prefix = val.prefix;
    if (val.viewMode !== undefined) localCopySettings.value.viewMode = val.viewMode;
    if (val.wrapText !== undefined) localCopySettings.value.wrapText = val.wrapText;
    if (val.insightFilters) localCopySettings.value.insightFilters = JSON.parse(JSON.stringify(val.insightFilters));
  }
}, { immediate: true, deep: true });

watch(() => bulkCopyLeadSettings.value, (val) => {
  if (val) {
    localBulkCopySettings.value = JSON.parse(JSON.stringify(val));
  }
}, { immediate: true, deep: true });

// Auto-save changes
watch(localCopySettings, async (newValue) => {
  if (copyLeadSettings.value) {
    await storageService.setLocal({
      copyLeadSettings: {
        ...copyLeadSettings.value,
        ...newValue,
      }
    });
  }
}, { deep: true });

watch(localBulkCopySettings, async (newValue) => {
  await storageService.setLocal({ bulkCopyLeadSettings: newValue });
}, { deep: true });
</script>

<template>
  <div>
    <v-card title="Single Lead Copy Fields" class="mb-4">
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="6">
            <span class="group-title">Lead Info</span>
            <v-checkbox v-model="localCopySettings.leadFields.fullName" label="Full Name" density="comfortable" hide-details color="#0073b1" />
            <v-checkbox v-model="localCopySettings.leadFields.headline" label="Headline" density="comfortable" hide-details color="#0073b1" />
            <v-checkbox v-model="localCopySettings.leadFields.location" label="Location" density="comfortable" hide-details color="#0073b1" />
            <v-checkbox v-model="localCopySettings.leadFields.summary" label="Summary" density="comfortable" hide-details color="#0073b1" />
            <v-checkbox v-model="localCopySettings.leadFields.recentActivity" label="Recent Activity" density="comfortable" hide-details color="#0073b1" />
            <v-checkbox v-model="localCopySettings.leadFields.mutualConnections" label="Mutual Connections" density="comfortable" hide-details color="#0073b1" />
          </v-col>

          <v-col cols="12" sm="6">
            <span class="group-title">Position Info</span>
            <v-checkbox v-model="localCopySettings.leadFields.position.title" label="Title" density="comfortable" hide-details color="#0073b1" />
            <v-checkbox v-model="localCopySettings.leadFields.position.companyName" label="Company Name" density="comfortable" hide-details color="#0073b1" />
            <v-checkbox v-model="localCopySettings.leadFields.position.industry" label="Industry" density="comfortable" hide-details color="#0073b1" />
            <v-checkbox v-model="localCopySettings.leadFields.position.location" label="Location" density="comfortable" hide-details color="#0073b1" />
            <v-checkbox v-model="localCopySettings.leadFields.position.startedOn" label="Started On" density="comfortable" hide-details color="#0073b1" />
            <v-checkbox v-model="localCopySettings.leadFields.position.description" label="Description" density="comfortable" hide-details color="#0073b1" />
          </v-col>
        </v-row>

        <v-divider class="my-4"></v-divider>

        <div class="group-title mb-2">Company Info</div>
        <v-row>
          <v-col cols="12" sm="6">
            <v-checkbox v-model="localCopySettings.companyFields.name" label="Name" density="comfortable" hide-details color="#0073b1" />
            <v-checkbox v-model="localCopySettings.companyFields.description" label="Description" density="comfortable" hide-details color="#0073b1" />
            <v-checkbox v-model="localCopySettings.companyFields.industry" label="Industry" density="comfortable" hide-details color="#0073b1" />
            <v-checkbox v-model="localCopySettings.companyFields.location" label="Location" density="comfortable" hide-details color="#0073b1" />
            <v-checkbox v-model="localCopySettings.companyFields.revenueRange" label="Revenue" density="comfortable" hide-details color="#0073b1" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-checkbox v-model="localCopySettings.companyFields.specialties" label="Specialties" density="comfortable" hide-details color="#0073b1" />
            <v-checkbox v-model="localCopySettings.companyFields.type" label="Type" density="comfortable" hide-details color="#0073b1" />
            <v-checkbox v-model="localCopySettings.companyFields.yearFounded" label="Founded" density="comfortable" hide-details color="#0073b1" />
            <v-checkbox v-model="localCopySettings.companyFields.employeeCount" label="Headcount" density="comfortable" hide-details color="#0073b1" />
          </v-col>
        </v-row>

        <v-divider class="my-4"></v-divider>

        <v-select
          v-model="localCopySettings.insightFilters"
          :items="insightSelectionOptions"
          label="Default Insight Filters"
          multiple
          chips
          closable-chips
          density="comfortable"
          variant="outlined"
          hide-details
        />
      </v-card-text>
    </v-card>

    <v-card title="Bulk Copy Fields" class="mb-4">
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="6">
            <span class="group-title">Lead Info</span>
            <v-checkbox v-model="localBulkCopySettings.leadFields.fullName" label="Full Name" density="comfortable" hide-details color="#0073b1" />
            <v-checkbox v-model="localBulkCopySettings.leadFields.location" label="Location" density="comfortable" hide-details color="#0073b1" />
            <v-checkbox v-model="localBulkCopySettings.leadFields.summary" label="Summary" density="comfortable" hide-details color="#0073b1" />
            <v-checkbox v-model="localBulkCopySettings.leadFields.recentActivity" label="Recent Activity" density="comfortable" hide-details color="#0073b1" />
            <v-checkbox v-model="localBulkCopySettings.leadFields.mutualConnections" label="Mutual Connections" density="comfortable" hide-details color="#0073b1" />
            <v-checkbox v-model="localBulkCopySettings.leadFields.heroCard" label="Company Highlight" density="comfortable" hide-details color="#0073b1" />
          </v-col>

          <v-col cols="12" sm="6">
            <span class="group-title">Position Info</span>
            <v-checkbox v-model="localBulkCopySettings.leadFields.position.title" label="Title" density="comfortable" hide-details color="#0073b1" />
            <v-checkbox v-model="localBulkCopySettings.leadFields.position.companyName" label="Company Name" density="comfortable" hide-details color="#0073b1" />
            <v-checkbox v-model="localBulkCopySettings.leadFields.position.industry" label="Industry" density="comfortable" hide-details color="#0073b1" />
            <v-checkbox v-model="localBulkCopySettings.leadFields.position.location" label="Location" density="comfortable" hide-details color="#0073b1" />
            <v-checkbox v-model="localBulkCopySettings.leadFields.position.startedOn" label="Started On" density="comfortable" hide-details color="#0073b1" />
            <v-checkbox v-model="localBulkCopySettings.leadFields.position.description" label="Description" density="comfortable" hide-details color="#0073b1" />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card title="Single Copy Preferences" class="mb-4">
      <v-card-text>
        <v-textarea
          v-model="localCopySettings.prefix"
          label="Default Prefix"
          placeholder="Text to prepend to all copies..."
          variant="outlined"
          rows="2"
          auto-grow
          density="comfortable"
          class="mb-4"
        ></v-textarea>

        <v-row align="center">
          <v-col cols="12" sm="8">
            <div class="text-caption text-medium-emphasis mb-1">View Mode</div>
            <v-btn-toggle
              v-model="localCopySettings.viewMode"
              mandatory
              divided
              variant="outlined"
              color="#0073b1"
              density="comfortable"
            >
              <v-btn v-for="opt in viewOptions" :key="opt.value" :value="opt.value" size="small">
                {{ opt.title }}
              </v-btn>
            </v-btn-toggle>
          </v-col>
          <v-col cols="12" sm="4">
            <v-checkbox v-model="localCopySettings.wrapText" label="Wrap Text" density="comfortable" hide-details color="#0073b1" />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card title="Bulk Copy Preferences">
      <v-card-text>
        <v-textarea
          v-model="localBulkCopySettings.prefix"
          label="Default Prefix"
          placeholder="Text to prepend to all bulk copies..."
          variant="outlined"
          rows="2"
          auto-grow
          density="comfortable"
          class="mb-4"
        ></v-textarea>

        <v-row align="center">
          <v-col cols="12" sm="8">
            <div class="text-caption text-medium-emphasis mb-1">View Mode</div>
            <v-btn-toggle
              v-model="localBulkCopySettings.viewMode"
              mandatory
              divided
              variant="outlined"
              color="#0073b1"
              density="comfortable"
            >
              <v-btn v-for="opt in viewOptions" :key="opt.value" :value="opt.value">
                {{ opt.title }}
              </v-btn>
            </v-btn-toggle>
          </v-col>
          <v-col cols="12" sm="4">
            <v-checkbox v-model="localBulkCopySettings.wrapText" label="Wrap Text" density="comfortable" hide-details color="#0073b1" />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<style scoped>
.group-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  margin-bottom: 4px;
}
</style>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useDataStore } from '@/store/data-store';
import { storageService } from '@/services/storage-service';
import { titleTargets, titleStates } from '@/helpers/title-helper';
import AppPreviewBox from '@/components/ui/AppPreviewBox.vue';
import AppDivider from '@/components/ui/AppDivider.vue';
import AppCheckbox from '@/components/ui/AppCheckbox.vue';
import AppRadio from '@/components/ui/AppRadio.vue';
import AppMultiSelect from '@/components/ui/AppMultiSelect.vue';
import AppSegmentedControl from '@/components/ui/AppSegmentedControl.vue';

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
  selectedTarget: titleTargets[0].value,
  selectedState: titleStates[0].value,
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
  { label: 'Posts', value: 'posts' },
  { label: 'Reshared posts', value: 'posts_reshared' },
  { label: 'Comments', value: 'comments' },
];

const viewOptions = [
  { label: 'Text', value: 'text' },
  { label: 'JSON', value: 'json' },
];

// Initialize local state from store
watch(() => copyLeadSettings.value, (val) => {
  if (val) {
    localCopySettings.value = JSON.parse(JSON.stringify(val));
  }
}, { immediate: true, deep: true });

watch(() => bulkCopyLeadSettings.value, (val) => {
  if (val) {
    localBulkCopySettings.value = JSON.parse(JSON.stringify(val));
  }
}, { immediate: true, deep: true });

// Auto-save changes
watch(localCopySettings, async (newValue) => {
  await storageService.setLocal({ copyLeadSettings: newValue });
}, { deep: true });

watch(localBulkCopySettings, async (newValue) => {
  await storageService.setLocal({ bulkCopyLeadSettings: newValue });
}, { deep: true });
</script>

<template>
  <div class="tab-content">
    <AppPreviewBox>
      <template #header>
        <span class="section-title">Single Lead Copy Fields</span>
      </template>
      <div class="settings-grid">
        <div class="settings-group">
          <span class="group-title">Lead Info</span>
          <AppCheckbox v-model="localCopySettings.leadFields.fullName" label="Full Name" size="sm" />
          <AppCheckbox v-model="localCopySettings.leadFields.headline" label="Headline" size="sm" />
          <AppCheckbox v-model="localCopySettings.leadFields.location" label="Location" size="sm" />
          <AppCheckbox v-model="localCopySettings.leadFields.summary" label="Summary" size="sm" />
          <AppCheckbox v-model="localCopySettings.leadFields.recentActivity" label="Recent Activity" size="sm" />
          <AppCheckbox v-model="localCopySettings.leadFields.mutualConnections" label="Mutual Connections" size="sm" />
        </div>

        <div class="settings-group">
          <span class="group-title">Position Info</span>
          <AppCheckbox v-model="localCopySettings.leadFields.position.title" label="Title" size="sm" />
          <AppCheckbox v-model="localCopySettings.leadFields.position.companyName" label="Company Name" size="sm" />
          <AppCheckbox v-model="localCopySettings.leadFields.position.industry" label="Industry" size="sm" />
          <AppCheckbox v-model="localCopySettings.leadFields.position.location" label="Location" size="sm" />
          <AppCheckbox v-model="localCopySettings.leadFields.position.startedOn" label="Started On" size="sm" />
          <AppCheckbox v-model="localCopySettings.leadFields.position.description" label="Description" size="sm" />
        </div>
      </div>

      <div class="settings-group">
        <span class="group-title">Company Info</span>
        <div class="settings-grid">
          <div class="settings-group">
            <AppCheckbox v-model="localCopySettings.companyFields.name" label="Name" size="sm" />
            <AppCheckbox v-model="localCopySettings.companyFields.description" label="Description" size="sm" />
            <AppCheckbox v-model="localCopySettings.companyFields.industry" label="Industry" size="sm" />
            <AppCheckbox v-model="localCopySettings.companyFields.location" label="Location" size="sm" />
            <AppCheckbox v-model="localCopySettings.companyFields.revenueRange" label="Revenue" size="sm" />
          </div>
          <div class="settings-group">
            <AppCheckbox v-model="localCopySettings.companyFields.specialties" label="Specialties" size="sm" />
            <AppCheckbox v-model="localCopySettings.companyFields.type" label="Type" size="sm" />
            <AppCheckbox v-model="localCopySettings.companyFields.yearFounded" label="Founded" size="sm" />
            <AppCheckbox v-model="localCopySettings.companyFields.employeeCount" label="Headcount" size="sm" />
          </div>
        </div>
      </div>

      <AppDivider />

      <div class="settings-row">
        <AppMultiSelect
          v-model="localCopySettings.insightFilters"
          :options="insightSelectionOptions"
          label="Default Insight Filters"
          display-mode="labels"
        />
      </div>
    </AppPreviewBox>

    <AppPreviewBox>
      <template #header>
        <span class="section-title">Bulk Copy Fields</span>
      </template>
      <div class="settings-grid">
        <div class="settings-group">
          <span class="group-title">Lead Info</span>
          <AppCheckbox v-model="localBulkCopySettings.leadFields.fullName" label="Full Name" size="sm" />
          <AppCheckbox v-model="localBulkCopySettings.leadFields.location" label="Location" size="sm" />
          <AppCheckbox v-model="localBulkCopySettings.leadFields.summary" label="Summary" size="sm" />
          <AppCheckbox v-model="localBulkCopySettings.leadFields.recentActivity" label="Recent Activity" size="sm" />
          <AppCheckbox v-model="localBulkCopySettings.leadFields.mutualConnections" label="Mutual Connections" size="sm" />
          <AppCheckbox v-model="localBulkCopySettings.leadFields.heroCard" label="Company Highlight" size="sm" />
        </div>

        <div class="settings-group">
          <span class="group-title">Position Info</span>
          <AppCheckbox v-model="localBulkCopySettings.leadFields.position.title" label="Title" size="sm" />
          <AppCheckbox v-model="localBulkCopySettings.leadFields.position.companyName" label="Company Name" size="sm" />
          <AppCheckbox v-model="localBulkCopySettings.leadFields.position.industry" label="Industry" size="sm" />
          <AppCheckbox v-model="localBulkCopySettings.leadFields.position.location" label="Location" size="sm" />
          <AppCheckbox v-model="localBulkCopySettings.leadFields.position.startedOn" label="Started On" size="sm" />
          <AppCheckbox v-model="localBulkCopySettings.leadFields.position.description" label="Description" size="sm" />
        </div>
      </div>
    </AppPreviewBox>

    <AppPreviewBox>
      <template #header>
        <span class="section-title">Title Defaults</span>
      </template>
      <div class="settings-column">
        <span class="group-title">Target</span>
        <div class="radio-grid">
          <AppRadio
            v-for="target in titleTargets"
            :key="target.value"
            v-model="localCopySettings.selectedTarget"
            :value="target.value"
          >
            {{ target.emoji }} {{ target.label }}
          </AppRadio>
        </div>

        <AppDivider />

        <span class="group-title">State</span>
        <div class="radio-grid">
          <AppRadio
            v-for="state in titleStates"
            :key="state.value"
            v-model="localCopySettings.selectedState"
            :value="state.value"
          >
            {{ state.emoji }} {{ state.label }}
          </AppRadio>
        </div>
      </div>
    </AppPreviewBox>

    <AppPreviewBox>
      <template #header>
        <span class="section-title">Single Copy Preferences</span>
      </template>
      <div class="settings-column">
        <div class="form-item">
          <label class="item-label">Default Prefix</label>
          <textarea
            v-model="localCopySettings.prefix"
            class="app-textarea"
            placeholder="Text to prepend to all copies..."
            rows="2"
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-item">
            <label class="item-label">View Mode</label>
            <AppSegmentedControl
              v-model="localCopySettings.viewMode"
              :options="viewOptions"
            />
          </div>
          <div class="form-item align-end">
            <AppCheckbox v-model="localCopySettings.wrapText" label="Wrap Text" />
          </div>
        </div>
      </div>
    </AppPreviewBox>

    <AppPreviewBox>
      <template #header>
        <span class="section-title">Bulk Copy Preferences</span>
      </template>
      <div class="settings-column">
        <div class="form-item">
          <label class="item-label">Default Prefix</label>
          <textarea
            v-model="localBulkCopySettings.prefix"
            class="app-textarea"
            placeholder="Text to prepend to all bulk copies..."
            rows="2"
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-item">
            <label class="item-label">View Mode</label>
            <AppSegmentedControl
              v-model="localBulkCopySettings.viewMode"
              :options="viewOptions"
            />
          </div>
          <div class="form-item align-end">
            <AppCheckbox v-model="localBulkCopySettings.wrapText" label="Wrap Text" />
          </div>
        </div>
      </div>
    </AppPreviewBox>
  </div>
</template>

<style scoped>
.tab-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  font-weight: bold;
  color: #333;
}

.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 12px;
}

.settings-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.group-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  margin-bottom: 4px;
  display: block;
}

.settings-column {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.settings-row {
  margin-top: 8px;
}

.radio-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
}

.app-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.85rem;
  font-family: inherit;
  resize: vertical;
  box-sizing: border-box;
}

.app-textarea:focus {
  outline: none;
  border-color: #0a66c2;
  box-shadow: 0 0 0 2px rgba(10, 102, 194, 0.1);
}

.form-row {
  display: flex;
  gap: 16px;
  align-items: center;
}

.align-end {
  margin-top: auto;
  padding-bottom: 4px;
}
</style>

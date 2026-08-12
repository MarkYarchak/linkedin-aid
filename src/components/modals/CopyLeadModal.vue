<script lang="ts" setup>
import { ref, computed, watch, nextTick } from 'vue';
import { useCopyLead } from '@/composables/useCopyLead';
import { getRelativeTime } from '@/helpers/date-helper';
import { getSalesNavigatorCompanyUrl } from '@/helpers/url-helpers';
import AppStepper from '@/components/ui/AppStepper.vue';
import AppModal from '@/components/ui/AppModal.vue';
import AppCheckbox from '@/components/ui/AppCheckbox.vue';
import AppTag from '@/components/ui/AppTag.vue';
import AppMultiSelect from '@/components/ui/AppMultiSelect.vue';
import AppSelectableItem from '@/components/ui/AppSelectableItem.vue';
import AppPreviewBox from '@/components/ui/AppPreviewBox.vue';
import AppSegmentedControl from '@/components/ui/AppSegmentedControl.vue';
import IconCopy from '@/components/icons/IconCopy.vue';
import type { OptionalDeepReadonly } from '@/types/common';
import type { Lead } from '@/types/lead/lead';

interface Props {
  lead: OptionalDeepReadonly<Lead>;
}

const props = defineProps<Props>();

const show = defineModel<boolean>('show');

const modalRef = ref<InstanceType<typeof AppModal> | null>(null);

const {
  currentStep,
  totalSteps,
  currentStepIndex,
  modalVisibility,
  leadFields,
  selectedPositionIds,
  primaryPositionId,
  currentPositions,
  selectedInsights,
  selectedSkills,
  companyFields,
  selectedCompanies,
  isLoadingCompany,
  capturedCompanyUrns,
  isCopied,
  isTitleCopied,
  targets,
  states,
  selectedTarget,
  selectedState,
  missingCompanies,
  nextStep,
  prevStep,
  generateCopyText,
  generateJsonData,
  generateTitle,
  copyToClipboard,
  copyTitleToClipboard,
  toggleInsight,
  toggleSkill,
  togglePosition,
  togglePrimary,
  insightSelectionOptions,
  insightFilters,
  viewMode,
  viewOptions,
  prefix,
  wrapText,
} = useCopyLead(props.lead);

const selectedPositionsTitle = computed(() => {
  return `${selectedPositionIds.value.length} / ${currentPositions.value.length}`;
});

const allCompaniesSelected = computed({
  get: () => currentPositions.value.length > 0
    && currentPositions.value.every(position => selectedPositionIds.value.includes(position.posId)),
  set: (selected: boolean) => {
    const currentPositionIds = new Set(currentPositions.value.map(position => position.posId));
    const otherPositionIds = selectedPositionIds.value.filter(id => !currentPositionIds.has(id));

    selectedPositionIds.value = selected
      ? [...otherPositionIds, ...currentPositionIds]
      : otherPositionIds;

    if (!selected && primaryPositionId.value !== null && currentPositionIds.has(primaryPositionId.value)) {
      primaryPositionId.value = null;
    }
  },
});

const getInsightData = (insight: any) => {
  const activity = insight.activityUnion;
  const date = insight.createdAt ? getRelativeTime(insight.createdAt) : '';

  if (activity.postActivity) {
    const post = activity.postActivity;
    const type = post.rootActivity ? 'RESHARED POST' : 'POST';
    return {
      type,
      date,
      text: post.message?.text || post.rootActivity?.message?.text || 'Post content'
    };
  } else if (activity.commentActivity) {
    return {
      type: 'COMMENT',
      date,
      text: activity.commentActivity.commentary?.text || 'Comment content'
    };
  }
  return { type: 'Activity', date, text: 'Unknown activity' };
};

const copyTitle = async () => {
  await copyTitleToClipboard();
};

const isJsonView = computed(() => viewMode.value === 'json');

watch(currentStep, () => {
  nextTick(() => {
    modalRef.value?.scrollToTop();
  });
});
</script>

<template>
  <AppModal
    ref="modalRef"
    v-model:show="show"
    title="Copy Lead Information"
  >
    <AppStepper
      :current-step="currentStepIndex + 1"
      :total-steps="totalSteps"
      class="mb-4"
    />

    <div class="step-content">
      <!-- Step 1: Lead Info -->
      <div v-if="currentStep === 1">
        <template v-if="modalVisibility.leadBasicInfo">
          <h4>Lead Basic Info</h4>
          <div class="field-group grid _three-cols">
            <AppCheckbox v-model="leadFields.fullName" label="Full Name" />
            <AppCheckbox v-model="leadFields.headline" label="Headline" />
            <AppCheckbox v-model="leadFields.location" label="Location" />
            <AppCheckbox v-model="leadFields.summary" label="Summary" />
            <AppCheckbox
              v-if="lead.searchResult"
              v-model="leadFields.recentActivity"
              label="Recent Activity"
            />
            <AppCheckbox
              v-if="lead.searchResult"
              v-model="leadFields.mutualConnections"
              label="Mutual Connections"
            />
          </div>
        </template>

        <template v-if="modalVisibility.currentPositionFields">
          <h4>Current Position Fields</h4>
          <div class="field-group grid _three-cols">
            <AppCheckbox v-model="leadFields.position.title" label="Job Title" />
            <AppCheckbox v-model="leadFields.position.companyName" label="Company" />
            <AppCheckbox v-model="leadFields.position.industry" label="Industry" />
            <AppCheckbox v-model="leadFields.position.location" label="Location" />
            <AppCheckbox v-model="leadFields.position.startedOn" label="Started On" />
            <AppCheckbox
              v-if="lead.main?.defaultPosition?.description"
              v-model="leadFields.position.description"
              label="Description"
            />
          </div>
        </template>

        <div class="step-header-with-action">
          <h4>Select Positions</h4>
          <div class="position-selection-actions">
            <AppCheckbox
              v-if="currentPositions.length > 0"
              v-model="allCompaniesSelected"
              label="Select all"
              class="pa-0"
            />
            <span class="selection-badge">{{ selectedPositionsTitle }}</span>
          </div>
        </div>
        <div v-if="currentPositions.length > 0" class="positions-list">
          <div
            v-for="pos in currentPositions"
            :key="pos.posId"
            :class="{ 'is-selected': selectedPositionIds.includes(pos.posId) }"
            class="position-item-row"
            @click="togglePosition(pos.posId)"
          >
            <AppCheckbox
              :model-value="selectedPositionIds.includes(pos.posId)"
              class="flex-1"
              @update:model-value="togglePosition(pos.posId)"
              @click.stop
            >
              <div class="position-info-label">
                <strong>{{ pos.title }}</strong> at
                <span
                  :class="[
                    'company-name-label',
                    pos.companyUrn && capturedCompanyUrns.includes(pos.companyUrn) ? 'is-captured' : 'is-not-captured'
                  ]"
                >
                  {{ pos.companyName }}
                </span>
              </div>
            </AppCheckbox>

            <button
              v-if="selectedPositionIds.includes(pos.posId)"
              :class="['btn-primary-toggle', { 'is-primary': primaryPositionId === pos.posId }]"
              title="Toggle primary status"
              @click.stop="togglePrimary(pos.posId)"
            >
              {{ primaryPositionId === pos.posId ? '★ Primary' : '☆ Primary' }}
            </button>
          </div>
        </div>
        <div v-else>No current positions found.</div>
      </div>

      <!-- Step 2: Company Info -->
      <div v-if="currentStep === 2">
        <div v-if="isLoadingCompany">Loading company data...</div>
        <div v-else>
          <!-- Loaded Companies -->
          <div v-if="Object.keys(selectedCompanies).length > 0">
            <h4>Company Fields</h4>
            <div v-for="(company, urn) in selectedCompanies" :key="urn" class="company-data-section">
              <p>
                Data for: <strong>{{ company.main?.name }}</strong>
                <span v-if="primaryPositionId !== null && lead.main?.positions.find(p => p.posId === primaryPositionId)?.companyUrn === urn" class="primary-badge">
                  Primary
                </span>
              </p>
              <div class="field-group grid">
                <AppCheckbox v-model="companyFields.name" label="Name" />
                <AppCheckbox v-model="companyFields.industry" label="Industry" />
                <AppCheckbox v-model="companyFields.location" label="Location" />
                <AppCheckbox v-model="companyFields.revenueRange" label="Revenue" />
                <AppCheckbox v-model="companyFields.type" label="Type" />
                <AppCheckbox v-model="companyFields.yearFounded" label="Year Founded" />
                <AppCheckbox v-model="companyFields.employeeCount" label="Headcount" />
                <AppCheckbox v-model="companyFields.description" label="Description" />
                <AppCheckbox v-model="companyFields.specialties" label="Specialties" />
              </div>
            </div>
          </div>

          <!-- Missing Companies -->
          <div v-if="missingCompanies.length > 0" class="missing-companies-section" :class="{ 'mt-6': Object.keys(selectedCompanies).length > 0 }">
            <div class="no-company-data">
              <p v-if="Object.keys(selectedCompanies).length === 0">No collected data found for the selected companies.</p>
              <p v-else>Some selected companies are missing data:</p>

              <div class="company-links-list">
                <div v-for="item in missingCompanies" :key="item.name" class="missing-company-item">
                  <span class="missing-company-name">{{ item.name }}</span>
                  <a v-if="item.url" :href="item.url" target="_blank" class="company-link">
                    Open Company Page
                  </a>
                  <span v-else class="company-link-disabled" title="No LinkedIn company page available for this position">
                    No URL available
                  </span>
                </div>
              </div>
              <p class="collect-hint">Opening the page will automatically collect the missing data.</p>
            </div>
          </div>

          <!-- No Companies Selected -->
          <div v-if="Object.keys(selectedCompanies).length === 0 && missingCompanies.length === 0" class="no-company-data">
            <p>No companies available or selected.</p>
            <p v-if="currentPositions.length > 0" class="collect-hint mt-2">
              Please go back and select at least one position to see company information.
            </p>
          </div>
        </div>
      </div>

      <!-- Step 3: Insights & Skills -->
      <div v-if="currentStep === 3">
        <div class="step-header-with-action">
          <h4>Recent Activity</h4>
          <div v-if="lead.insights?.elements?.length" class="recent-activity-multi-select">
            <AppMultiSelect
              v-model="insightFilters"
              :options="insightSelectionOptions"
              display-mode="labels"
              placeholder="Activities selection..."
            />
          </div>
        </div>
        <div v-if="lead.insights?.elements?.length" class="insights-list">
          <AppSelectableItem
            v-for="insight in lead.insights.elements"
            :key="insight.insightId"
            :selected="selectedInsights.includes(insight.insightId)"
            @toggle="toggleInsight(insight.insightId)"
          >
            <div class="insight-item">
              <div class="insight-item__header">
                <span class="insight-item__type">{{ getInsightData(insight).type }}</span>
                <span v-if="getInsightData(insight).date" class="insight-item__date">{{ getInsightData(insight).date }}</span>
              </div>
              <div class="insight-item__text">
                {{ getInsightData(insight).text }}
              </div>
            </div>
          </AppSelectableItem>
        </div>
        <div v-else>No recent activity found.</div>

        <template v-if="modalVisibility.skills">
          <h4 class="mt-6">Skills</h4>
          <div v-if="lead.extra?.skills?.length" class="tags-list">
            <AppTag
              v-for="skill in lead.extra.skills"
              :key="skill.name"
              :label="skill.name"
              :selected="selectedSkills.includes(skill.name)"
              @toggle="toggleSkill(skill.name)"
            />
          </div>
          <div v-else>No skills found.</div>
        </template>
      </div>

      <!-- Step 4: Title Settings -->
      <div v-if="currentStep === 4">
        <div class="step-header-with-action">
          <h4>Title Settings</h4>
          <button class="btn-small" @click="copyTitle">Copy Title</button>
        </div>
        <div class="title-generator">
          <div class="title-generator-fields">
            <div class="select-group">
              <label>Target</label>
              <select v-model="selectedTarget">
                <option v-for="t in targets" :key="t.value" :value="t.value">
                  {{ t.emoji }} {{ t.label }}
                </option>
              </select>
            </div>
            <div class="select-group">
              <label>State</label>
              <select v-model="selectedState">
                <option v-for="s in states" :key="s.value" :value="s.value">
                  {{ s.emoji }} {{ s.label }}
                </option>
              </select>
            </div>
          </div>
          <div class="generated-title-preview mt-4">
            <strong>Title Preview:</strong>
            <AppPreviewBox
              mini
              wrap-text
              :is-copied="isTitleCopied"
              class="mt-1"
            >
              {{ generateTitle() }}
              <template #append>
                <button class="btn-icon" title="Copy Title" @click="copyTitle">
                  <IconCopy :size="16" />
                </button>
              </template>
            </AppPreviewBox>
          </div>
        </div>
      </div>

      <!-- Step 5: Preview -->
      <div v-if="currentStep === 5">
        <div class="step-header-with-action">
          <h4>Preview</h4>
          <div class="header-actions">
            <AppSegmentedControl
              v-model="viewMode"
              :options="viewOptions"
            />
            <AppCheckbox
              v-model="wrapText"
              label="Wrap text"
              size="sm"
            />
          </div>
        </div>
        <AppPreviewBox
          v-model:prefix="prefix"
          editable-prefix
          :json="isJsonView ? generateJsonData() : null"
          :wrap-text="wrapText"
          :is-copied="isCopied"
        >
          <template v-if="!isJsonView">{{ generateCopyText() }}</template>
        </AppPreviewBox>
      </div>
    </div>

    <template #footer>
      <div v-if="isCopied" class="copied-feedback">Copied!</div>
      <div v-if="isTitleCopied" class="copied-feedback">Title Copied!</div>
      <button v-if="currentStepIndex > 0" @click="prevStep">Back</button>
      <button v-if="currentStepIndex < totalSteps - 1" @click="nextStep" class="primary">Next</button>
      <button v-else @click="copyToClipboard" class="primary">
        {{ isCopied ? 'Copied!' : 'Copy Info' }}
      </button>
    </template>
  </AppModal>
</template>

<style scoped>
.step-content {
  flex: 1;
  overflow-y: auto;
  min-height: 200px;
}

.step-content h4 {
  margin: 0 0 12px 0;
  color: #1e293b;
  font-size: 1rem;
}

.step-header-with-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  gap: 12px;
}

.step-header-with-action h4 {
  margin: 0;
}

.position-selection-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-small {
  padding: 4px 8px;
  font-size: 0.75rem;
  background: #0a66c2;
  color: white;
  border: none;
}

.title-generator-fields {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.select-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.select-group label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
}

.select-group select {
  padding: 6px;
  border-radius: 4px;
  border: 1px solid #cbd5e1;
  font-size: 0.85rem;
  background: white;
}

.recent-activity-multi-select {
  min-width: 220px;
  max-width: 220px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 20px;
}
.field-group.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}
.field-group.grid._three-cols {
  grid-template-columns: repeat(3, 1fr);
}

.selection-badge {
  background: #eee;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

.positions-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.insights-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.insight-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

.insight-item__header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
}

.insight-item__type {
  text-transform: uppercase;
  color: #0a66c2;
}

.insight-item__date {
  font-weight: normal;
}

.insight-item__text {
  white-space: pre-wrap;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 7;
  -webkit-box-orient: vertical;
  font-size: 0.85rem;
  line-height: 1.4;
  color: #1e293b;
}

.company-name-label.is-captured {
  color: #059669;
  font-weight: 600;
}

.company-name-label.is-not-captured {
  color: #94a3b8;
  font-style: italic;
}

.no-company-data {
  text-align: center;
  padding: 20px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px dashed #cbd5e1;
  color: #64748b;
}

.no-company-data p {
  margin: 4px 0;
}

.company-links-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 16px 0;
}

.missing-company-item {
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  gap: 12px;
}

.missing-company-name {
  font-weight: 600;
  color: #1e293b;
  text-align: left;
}

.company-link {
  display: inline-block;
  padding: 6px 12px;
  background-color: #0a66c2;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.company-link:hover {
  background-color: #004182;
  color: white;
}

.company-link-disabled {
  color: #94a3b8;
  font-size: 0.85rem;
  font-style: italic;
  cursor: help;
}

.collect-hint {
  font-size: 0.8rem;
  font-style: italic;
  color: #94a3b8;
}

.copied-feedback {
  color: #059669;
  font-weight: 600;
  font-size: 0.9rem;
  margin-right: auto;
}

button {
  padding: 8px 16px;
  border-radius: 4px;
  border: 1px solid #ccc;
  background: white;
  cursor: pointer;
  font-weight: 600;
}

button.primary {
  background: #0a66c2;
  color: white;
  border: none;
}

button:hover {
  opacity: 0.9;
}

.btn-icon {
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  border: 1px solid transparent;
  background: transparent;
  color: #64748b;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #e2e8f0;
  color: #1e293b;
  border-color: #cbd5e1;
}

.position-item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: pointer;
}

.position-item-row.is-selected {
  background: #f0f7ff;
  border-color: #0a66c2;
}

.position-info-label {
  flex: 1;
}

.btn-primary-toggle {
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #cbd5e1;
  background: white;
  color: #64748b;
  white-space: nowrap;
}

.btn-primary-toggle.is-primary {
  border-color: #0a66c2;
  color: #0a66c2;
}

.company-data-section {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.company-data-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.primary-badge {
  background: #0a66c2;
  color: white;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: 8px;
  vertical-align: middle;
}
</style>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useCopyLead } from '@/composables/useCopyLead';
import { getRelativeTime } from '@/helpers/date-helper';
import { getSalesNavigatorCompanyUrl } from '@/helpers/url-helpers';
import AppStepper from '@/components/ui/AppStepper.vue';
import AppModal from '@/components/ui/AppModal.vue';
import AppCheckbox from '@/components/ui/AppCheckbox.vue';
import AppRadio from '@/components/ui/AppRadio.vue';
import AppTag from '@/components/ui/AppTag.vue';
import AppSelectableItem from '@/components/ui/AppSelectableItem.vue';
import AppPreviewBox from '@/components/ui/AppPreviewBox.vue';
import AppSegmentedControl from '@/components/ui/AppSegmentedControl.vue';
import IconCopy from '@/components/icons/IconCopy.vue';
import type { Lead } from '@/types/lead/lead';

interface Props {
  lead: Lead;
  show: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(['close']);

const wrapText = ref(false);

const jsonPreview = computed(() => {
  return JSON.stringify(generateJsonData(), null, 2);
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

const {
  currentStep,
  totalSteps,
  leadFields,
  selectedPositionUrn,
  currentPositions,
  selectedInsights,
  selectedSkills,
  companyFields,
  selectedCompany,
  isLoadingCompany,
  capturedCompanyUrns,
  isCopied,
  targets,
  states,
  selectedTarget,
  selectedState,
  nextStep,
  prevStep,
  generateCopyText,
  generateJsonData,
  generateTitle,
  copyToClipboard,
  toggleInsight,
  toggleSkill,
  viewMode,
  viewOptions,
} = useCopyLead(props.lead);

const copyTitle = async () => {
  await navigator.clipboard.writeText(generateTitle());
  // We can reuse isCopied for feedback
  isCopied.value = true;
  setTimeout(() => {
    isCopied.value = false;
  }, 2000);
};

const selectedCompanyUrl = computed(() => {
  if (!selectedPositionUrn.value) return null;
  return getSalesNavigatorCompanyUrl(selectedPositionUrn.value);
});

</script>

<template>
  <AppModal
    :show="show"
    title="Copy Lead Information"
    @close="emit('close')"
  >
    <AppStepper
      :current-step="currentStep"
      :total-steps="totalSteps"
      class="mb-4"
    />

    <div class="step-content">
      <!-- Step 1: Lead Info -->
      <div v-if="currentStep === 1">
        <h4>Lead Basic Info</h4>
        <div class="field-group grid _three-cols">
          <AppCheckbox v-model="leadFields.fullName" label="Full Name" />
          <AppCheckbox v-model="leadFields.headline" label="Headline" />
          <AppCheckbox v-model="leadFields.location" label="Location" />
          <AppCheckbox v-model="leadFields.summary" label="Summary" />
        </div>
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

        <h4>Select Position</h4>
        <div v-if="currentPositions.length > 0" class="positions-list">
          <AppRadio
            v-for="pos in currentPositions"
            :key="pos.posId"
            v-model="selectedPositionUrn"
            :value="pos.companyUrn"
          >
            <strong>{{ pos.title }}</strong> at
            <span
              :class="[
                'company-name-label',
                pos.companyUrn && capturedCompanyUrns.includes(pos.companyUrn) ? 'is-captured' : 'is-not-captured'
              ]"
            >
              {{ pos.companyName }}
            </span>
          </AppRadio>
        </div>
        <div v-else>No current positions found.</div>
      </div>

      <!-- Step 2: Insights & Skills -->
      <div v-if="currentStep === 2">
        <h4>Recent Activity</h4>
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
      </div>

      <!-- Step 3: Company Info -->
      <div v-if="currentStep === 3">
        <h4>Company Fields</h4>
        <div v-if="isLoadingCompany">Loading company data...</div>
        <div v-else-if="selectedCompany">
          <p>Data for: <strong>{{ selectedCompany.main?.name }}</strong></p>
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
        <div v-else class="no-company-data">
          <p>No collected data found for the selected company.</p>
          <p v-if="selectedCompanyUrl">
            You can open the company page to collect its data:
            <br />
            <a :href="selectedCompanyUrl" target="_blank" class="company-link">
              Open LinkedIn Company Page
            </a>
          </p>
        </div>
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
            <AppCheckbox v-model="wrapText" label="Wrap text" />
          </div>
        </div>
        <AppPreviewBox :wrap-text="wrapText">
          <template v-if="viewMode === 'json'">{{ jsonPreview }}</template>
          <template v-else>{{ generateCopyText() }}</template>
        </AppPreviewBox>
      </div>
    </div>

    <template #footer>
      <div v-if="isCopied" class="copied-feedback">Copied!</div>
      <button v-if="currentStep > 1" @click="prevStep">Back</button>
      <button v-if="currentStep < totalSteps" @click="nextStep" class="primary">Next</button>
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
}

.step-header-with-action h4 {
  margin: 0;
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
  margin: 8px 0;
}

.company-link {
  display: inline-block;
  margin-top: 8px;
  padding: 8px 16px;
  background-color: #0a66c2;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 600;
  transition: background-color 0.2s;
}

.company-link:hover {
  background-color: #004182;
  color: white;
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

.btn-icon:focus {
  outline: none;
}
</style>

<script lang="ts" setup>
import { useCopyLead } from '@/composables/useCopyLead';
import AppStepper from '@/components/ui/AppStepper.vue';
import AppCheckbox from '@/components/ui/AppCheckbox.vue';
import AppRadio from '@/components/ui/AppRadio.vue';
import AppTag from '@/components/ui/AppTag.vue';
import AppSelectableItem from '@/components/ui/AppSelectableItem.vue';
import type { Lead } from '@/types/lead/lead';

interface Props {
  lead: Lead;
  show: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(['close']);

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
  generateTitle,
  copyToClipboard,
  toggleInsight,
  toggleSkill,
} = useCopyLead(props.lead, emit);

const copyTitle = async () => {
  await navigator.clipboard.writeText(generateTitle());
  // We can reuse isCopied for feedback
  isCopied.value = true;
  setTimeout(() => {
    isCopied.value = false;
  }, 2000);
};

</script>

<template>
  <div v-if="show" class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Copy Lead Information</h3>
        <button class="close-btn" @click="emit('close')">&times;</button>
      </div>

      <AppStepper :current-step="currentStep" :total-steps="totalSteps" />

      <div class="step-content">
        <!-- Step 1: Lead Info -->
        <div v-if="currentStep === 1">
          <h4>Lead Basic Info</h4>
          <div class="field-group">
            <AppCheckbox v-model="leadFields.fullName" label="Full Name" />
            <AppCheckbox v-model="leadFields.headline" label="Headline" />
            <AppCheckbox v-model="leadFields.location" label="Location" />
            <AppCheckbox v-model="leadFields.summary" label="Summary" />
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
          <h4>Insights</h4>
          <div v-if="lead.insights?.elements?.length" class="insights-list">
            <AppSelectableItem
              v-for="insight in lead.insights.elements"
              :key="insight.insightId"
              :selected="selectedInsights.includes(insight.insightId)"
              @toggle="toggleInsight(insight.insightId)"
            >
              <div class="insight-item__text">
                {{ insight.activityUnion?.postActivity?.message?.text || 'Post' }}
              </div>
            </AppSelectableItem>
          </div>
          <div v-else>No insights found.</div>

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
          <div v-else>
            No captured data found for the selected company.
          </div>
        </div>

        <!-- Step 4: Title Settings -->
        <div v-if="currentStep === 4">
          <h4>Title Settings</h4>
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
              <div class="preview-box mini mt-1">{{ generateTitle() }}</div>
            </div>
          </div>
        </div>

        <!-- Step 5: Preview -->
        <div v-if="currentStep === 5">
          <div class="preview-header">
            <h4>Preview</h4>
            <button class="btn-small" @click="copyTitle">Create Title</button>
          </div>
          <pre class="preview-box">{{ generateCopyText() }}</pre>
        </div>
      </div>

      <div class="modal-footer">
        <div v-if="isCopied" class="copied-feedback">Copied!</div>
        <button v-if="currentStep > 1" @click="prevStep">Back</button>
        <button v-if="currentStep < totalSteps" @click="nextStep" class="primary">Next</button>
        <button v-else @click="copyToClipboard" class="primary">
          {{ isCopied ? 'Copied!' : 'Copy Info' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  width: 90%;
  max-width: 400px;
  max-height: 90vh;
  height: 100%;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  padding: 16px;
  color: #333;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0 5px;
  line-height: 1;
  color: #64748b;
}

.close-btn:hover {
  color: #1e293b;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.step-content {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 16px;
  min-height: 200px;
  padding-right: 4px;
}

.step-content h4 {
  margin: 0 0 12px 0;
  color: #1e293b;
  font-size: 1rem;
}

.mt-6 {
  margin-top: 24px !important;
}

.mt-4 {
  margin-top: 16px !important;
}

.mt-2 {
  margin-top: 8px !important;
}

.mt-1 {
  margin-top: 4px !important;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.preview-header h4 {
  margin: 0;
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

.preview-box.mini {
  max-height: none;
  font-weight: 500;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 20px;
}

.field-group.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
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

.insight-item__text {
  white-space: pre-wrap;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 7;
  -webkit-box-orient: vertical;
}

.preview-box {
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  font-size: 0.8rem;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 300px;
  overflow-y: auto;
}

.company-name-label.is-captured {
  color: #059669;
  font-weight: 600;
}

.company-name-label.is-not-captured {
  color: #94a3b8;
  font-style: italic;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  border-top: 1px solid #eee;
  padding-top: 16px;
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
</style>

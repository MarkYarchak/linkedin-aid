<script lang="ts" setup>
import { useCopyLead } from '@/composables/useCopyLead';
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
  nextStep,
  prevStep,
  generateCopyText,
  copyToClipboard,
  toggleInsight,
  toggleSkill,
} = useCopyLead(props.lead, emit);

</script>

<template>
  <div v-if="show" class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Copy Lead Information</h3>
        <button class="close-btn" @click="emit('close')">&times;</button>
      </div>

      <div class="stepper">
        <div v-for="step in totalSteps" :key="step"
             :class="['step', { active: currentStep === step, completed: currentStep > step }]">
          {{ step }}
        </div>
      </div>

      <div class="step-content">
        <!-- Step 1: Lead Info -->
        <div v-if="currentStep === 1">
          <h4>Lead Basic Info</h4>
          <div class="field-group">
            <label><input type="checkbox" v-model="leadFields.fullName"> Full Name</label>
            <label><input type="checkbox" v-model="leadFields.headline"> Headline</label>
            <label><input type="checkbox" v-model="leadFields.location"> Location</label>
            <label><input type="checkbox" v-model="leadFields.summary"> Summary</label>
          </div>

          <h4>Select Position</h4>
          <div v-if="currentPositions.length > 0" class="positions-list">
            <div v-for="pos in currentPositions" :key="pos.posId" class="position-item">
              <label>
                <input type="radio" :value="pos.companyUrn" v-model="selectedPositionUrn">
                <strong>{{ pos.title }}</strong> at {{ pos.companyName }}
              </label>
            </div>
          </div>
          <div v-else>No current positions found.</div>
        </div>

        <!-- Step 2: Insights & Skills -->
        <div v-if="currentStep === 2">
          <h4>Insights</h4>
          <div v-if="lead.insights?.elements?.length" class="insights-list">
            <div v-for="insight in lead.insights.elements" :key="insight.insightId"
                 :class="['insight-item', { selected: selectedInsights.includes(insight.insightId) }]"
                 @click="toggleInsight(insight.insightId)">
              <div class="insight-item__text">
                {{ insight.activityUnion?.postActivity?.message?.text || 'Post' }}
              </div>
            </div>
          </div>
          <div v-else>No insights found.</div>

          <h4 class="mt-6">Skills</h4>
          <div v-if="lead.extra?.skills?.length" class="tags-list">
            <button v-for="skill in lead.extra.skills" :key="skill.name"
                    :class="['tag', { selected: selectedSkills.includes(skill.name) }]"
                    @click="toggleSkill(skill.name)">
              {{ skill.name }}
            </button>
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
              <label><input type="checkbox" v-model="companyFields.name"> Name</label>
              <label><input type="checkbox" v-model="companyFields.industry"> Industry</label>
              <label><input type="checkbox" v-model="companyFields.location"> Location</label>
              <label><input type="checkbox" v-model="companyFields.revenueRange"> Revenue</label>
              <label><input type="checkbox" v-model="companyFields.type"> Type</label>
              <label><input type="checkbox" v-model="companyFields.yearFounded"> Year Founded</label>
              <label><input type="checkbox" v-model="companyFields.employeeCount"> Headcount</label>
              <label><input type="checkbox" v-model="companyFields.description"> Description</label>
              <label><input type="checkbox" v-model="companyFields.specialties"> Specialties</label>
            </div>
          </div>
          <div v-else>
            No captured data found for the selected company.
          </div>
        </div>

        <!-- Step 4: Preview -->
        <div v-if="currentStep === 4">
          <h4>Preview</h4>
          <pre class="preview-box">{{ generateCopyText() }}</pre>
        </div>
      </div>

      <div class="modal-footer">
        <button v-if="currentStep > 1" @click="prevStep">Back</button>
        <button v-if="currentStep < totalSteps" @click="nextStep" class="primary">Next</button>
        <button v-else @click="copyToClipboard" class="primary">Copy & Close</button>
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

.modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0 5px;
}

.stepper {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  position: relative;
}

.step {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  z-index: 1;
}

.step.active {
  background: #0a66c2;
  color: white;
}

.step.completed {
  background: #057642;
  color: white;
}

.step-content {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 16px;
  min-height: 200px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.field-group.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.field-group label {
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.positions-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.position-item {
  padding: 8px;
  border: 1px solid #eee;
  border-radius: 4px;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.tag {
  padding: 4px 12px;
  border-radius: 16px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  font-size: 0.8rem;
}

.tag.selected {
  background: #0a66c2;
  color: white;
  border-color: #0a66c2;
}

.insights-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.insight-item {
  padding: 8px;
  border: 1px solid #eee;
  border-radius: 4px;
  font-size: 0.8rem;
  line-height: 1rem;
  cursor: pointer;
}

.insight-item.selected {
  border-color: #0a66c2;
  background: #f0f7ff;
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

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-top: 1px solid #eee;
  padding-top: 16px;
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

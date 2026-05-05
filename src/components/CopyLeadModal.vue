<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue';
import { companyService } from '@/services/company-service';
import { parseLinkedInUrn } from '@/helpers/urn';
import { browser } from 'wxt/browser';
import type { Lead } from '@/types/lead/lead';
import type { Company } from '@/types/company/company';
import type { CopyLeadSettings } from '@/types/copy-lead-settings';

interface Props {
  lead: Lead;
  show: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(['close']);

const currentStep = ref(1);
const totalSteps = 4;

// Lead Fields
const leadFields = ref({
  fullName: true,
  headline: true,
  location: true,
  summary: true,
});

// Positions
const selectedPositionUrn = ref<string>('');

const currentPositions = computed(() => {
  return props.lead.main?.positions?.filter(p => p.current) || [];
});

onMounted(async () => {
  // Load default settings if any
  const settings = await browser.storage.local.get('copyLeadSettings');
  if (settings.copyLeadSettings) {
    const s = settings.copyLeadSettings as CopyLeadSettings;
    if (s.leadFields) leadFields.value = { ...leadFields.value, ...s.leadFields };
    if (s.companyFields) companyFields.value = { ...companyFields.value, ...s.companyFields };
  }

  // Set default position
  if (props.lead.main?.defaultPosition) {
    const defPos = props.lead.main.defaultPosition;
    const found = props.lead.main.positions.find(p => p.posId === defPos.posId);
    if (found) {
      selectedPositionUrn.value = found.companyUrn || '';
    }
  } else if (currentPositions.value.length > 0) {
    selectedPositionUrn.value = currentPositions.value[0].companyUrn || '';
  }
});

// Insights & Skills
const selectedInsights = ref<string[]>([]);
const selectedSkills = ref<string[]>([]);

// Company Fields
const companyFields = ref({
  name: true,
  description: true,
  industry: true,
  location: true,
  revenueRange: true,
  specialties: true,
  type: true,
  yearFounded: true,
  employeeCount: true,
});

const selectedCompany = ref<Company | null>(null);
const isLoadingCompany = ref(false);

watch(selectedPositionUrn, async (newUrn) => {
  if (newUrn) {
    isLoadingCompany.value = true;
    try {
      const id = parseLinkedInUrn(newUrn).id;
      const company = await companyService.findCompanyById(id);
      selectedCompany.value = company || null;
    } catch (e) {
      console.error('Failed to fetch company', e);
      selectedCompany.value = null;
    } finally {
      isLoadingCompany.value = false;
    }
  } else {
    selectedCompany.value = null;
  }
});

const nextStep = () => {
  if (currentStep.value < totalSteps) currentStep.value++;
};

const prevStep = () => {
  if (currentStep.value > 1) currentStep.value--;
};

const generateCopyText = () => {
  let text = '';
  const main = props.lead.main;
  const extra = props.lead.extra;

  if (main) {
    if (leadFields.value.fullName) text += `Name: ${main.fullName}\n`;
    if (leadFields.value.headline) text += `Headline: ${main.headline}\n`;
    if (leadFields.value.location) text += `Location: ${main.location}\n`;
    if (leadFields.value.summary && main.summary) text += `Summary: ${main.summary}\n`;
  }

  if (selectedPositionUrn.value) {
    const pos = main?.positions.find(p => p.companyUrn === selectedPositionUrn.value);
    if (pos) {
      text += `Current Position: ${pos.title} at ${pos.companyName}\n`;
    }
  }

  if (selectedSkills.value.length > 0) {
    text += `Skills: ${selectedSkills.value.join(', ')}\n`;
  }

  if (selectedInsights.value.length > 0) {
    text += `Insights:\n`;
    selectedInsights.value.forEach(insightId => {
      const insight = props.lead.insights?.elements.find(e => e.insightId === insightId);
      if (insight?.activityUnion?.postActivity?.message?.text) {
        text += `- ${insight.activityUnion.postActivity.message.text}\n`;
      }
    });
  }

  if (selectedCompany.value) {
    const cMain = selectedCompany.value.main;
    const cExtra = selectedCompany.value.extra;
    text += `\nCompany Info (${cMain?.name}):\n`;
    if (companyFields.value.description && cMain?.description) text += `Description: ${cMain.description}\n`;
    if (companyFields.value.industry && cMain?.industry) text += `Industry: ${cMain.industry}\n`;
    if (companyFields.value.location && cMain?.location) text += `Location: ${cMain.location}\n`;
    if (companyFields.value.yearFounded && cMain?.yearFounded) text += `Founded: ${cMain.yearFounded}\n`;
    if (companyFields.value.type && cMain?.type) text += `Type: ${cMain.type}\n`;
    if (companyFields.value.specialties && cMain?.specialties?.length) text += `Specialties: ${cMain.specialties.join(', ')}\n`;
    if (companyFields.value.employeeCount && cExtra?.employeeDisplayCount) text += `Headcount: ${cExtra.employeeDisplayCount}\n`;
    if (companyFields.value.revenueRange && cMain?.revenueRange) {
        const { estimatedMinRevenue, estimatedMaxRevenue } = cMain.revenueRange;
        const rev = `${estimatedMinRevenue.currencyCode} ${estimatedMinRevenue.amount}${estimatedMinRevenue.unit} - ${estimatedMaxRevenue.amount}${estimatedMaxRevenue.unit}`;
        text += `Revenue: ${rev}\n`;
    }
  }

  return text;
};

const copyToClipboard = async () => {
  const text = generateCopyText();
  await navigator.clipboard.writeText(text);

  // Save settings
  const settings: CopyLeadSettings = {
    leadFields: leadFields.value,
    companyFields: companyFields.value,
  };
  await browser.storage.local.set({ copyLeadSettings: settings });

  emit('close');
};

const toggleInsight = (id: string) => {
  const index = selectedInsights.value.indexOf(id);
  if (index === -1) selectedInsights.value.push(id);
  else selectedInsights.value.splice(index, 1);
};

const toggleSkill = (name: string) => {
  const index = selectedSkills.value.indexOf(name);
  if (index === -1) selectedSkills.value.push(name);
  else selectedSkills.value.splice(index, 1);
};

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
          <h4>Skills</h4>
          <div v-if="lead.extra?.skills?.length" class="tags-list">
            <button v-for="skill in lead.extra.skills" :key="skill.name"
                    :class="['tag', { selected: selectedSkills.includes(skill.name) }]"
                    @click="toggleSkill(skill.name)">
              {{ skill.name }}
            </button>
          </div>
          <div v-else>No skills found.</div>

          <h4>Insights</h4>
          <div v-if="lead.insights?.elements?.length" class="insights-list">
            <div v-for="insight in lead.insights.elements" :key="insight.insightId"
                 :class="['insight-item', { selected: selectedInsights.includes(insight.insightId) }]"
                 @click="toggleInsight(insight.insightId)">
              {{ insight.activityUnion?.postActivity?.message?.text || 'Post' }}
            </div>
          </div>
          <div v-else>No insights found.</div>
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
  font-size: 0.85rem;
  cursor: pointer;
  max-height: 60px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.insight-item.selected {
  border-color: #0a66c2;
  background: #f0f7ff;
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

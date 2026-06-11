<script lang="ts" setup>
import { computed } from 'vue';
import { useBulkCopyLeads } from '@/composables/useBulkCopyLeads';
import AppStepper from '@/components/ui/AppStepper.vue';
import AppModal from '@/components/ui/AppModal.vue';
import AppCheckbox from '@/components/ui/AppCheckbox.vue';
import AppPreviewBox from '@/components/ui/AppPreviewBox.vue';
import AppSegmentedControl from '@/components/ui/AppSegmentedControl.vue';
import type { Lead } from '@/types/lead/lead';

interface Props {
  leads: Lead[];
  heroCard?: any;
  show: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(['close']);

const {
  currentStep,
  totalSteps,
  leadFields,
  isCopied,
  nextStep,
  prevStep,
  generateCopyText,
  generateJsonData,
  copyToClipboard,
  viewMode,
  viewOptions,
  groupByCompany,
  prefix,
  wrapText,
} = useBulkCopyLeads(props.leads, props.heroCard);

const isJsonView = computed(() => viewMode.value === 'json');
</script>

<template>
  <AppModal
    :show="show"
    title="Bulk Copy Leads"
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
          <AppCheckbox v-model="leadFields.location" label="Location" />
          <AppCheckbox v-model="leadFields.summary" label="Summary" />
          <AppCheckbox v-model="leadFields.recentActivity" label="Recent Activity" />
          <AppCheckbox v-model="leadFields.mutualConnections" label="Mutual Connections" />
          <AppCheckbox v-if="heroCard" v-model="leadFields.heroCard" label="Company Highlight" />
        </div>
        <h4>Current Position Fields</h4>
        <div class="field-group grid _three-cols">
          <AppCheckbox v-model="leadFields.position.title" label="Job Title" />
          <AppCheckbox v-model="leadFields.position.companyName" label="Company" />
          <AppCheckbox v-model="leadFields.position.industry" label="Industry" />
          <AppCheckbox v-model="leadFields.position.location" label="Location" />
          <AppCheckbox v-model="leadFields.position.startedOn" label="Started On" />
          <AppCheckbox v-model="leadFields.position.description" label="Description" />
        </div>
      </div>

      <!-- Step 2: Preview -->
      <div v-if="currentStep === 2">
        <div class="step-header-with-action">
          <h4>Preview ({{ leads.length }} leads)</h4>
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
        >
          <template v-if="!heroCard" #header>
            <AppCheckbox
              v-model="groupByCompany"
              label="Group by company"
              size="sm"
            />
          </template>
          <template v-if="!isJsonView">{{ generateCopyText() }}</template>
        </AppPreviewBox>
      </div>
    </div>

    <template #footer>
      <div v-if="isCopied" class="copied-feedback">Copied!</div>
      <button v-if="currentStep > 1" @click="prevStep">Back</button>
      <button v-if="currentStep < totalSteps" @click="nextStep" class="primary">Next</button>
      <button v-else @click="copyToClipboard" class="primary">
        {{ isCopied ? 'Copied!' : 'Copy Leads' }}
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

.field-group {
  margin-bottom: 24px;
}

.grid {
  display: grid;
  gap: 12px;
}

.grid._three-cols {
  grid-template-columns: repeat(3, 1fr);
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

.copied-feedback {
  color: #057642;
  font-weight: 600;
  margin-right: auto;
  font-size: 0.875rem;
}

button {
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  background: white;
  color: #475569;
  font-weight: 600;
  cursor: pointer;
}

button.primary {
  background: #0a66c2;
  border-color: #0a66c2;
  color: white;
}

button.primary:hover {
  background: #004182;
}
</style>

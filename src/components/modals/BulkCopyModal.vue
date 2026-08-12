<script lang="ts" setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { useBulkCopyLeads } from '@/composables/useBulkCopyLeads';
import AppStepper from '@/components/ui/AppStepper.vue';
import AppModal from '@/components/ui/AppModal.vue';
import AppCheckbox from '@/components/ui/AppCheckbox.vue';
import AppPreviewBox from '@/components/ui/AppPreviewBox.vue';
import AppSegmentedControl from '@/components/ui/AppSegmentedControl.vue';
import IconCross from '@/components/icons/IconCross.vue';
import type { OptionalDeepReadonly } from '@/types/common';
import type { Lead } from '@/types/lead/lead';

interface Props {
  leads: OptionalDeepReadonly<Lead>[];
  heroCard?: any;
}

const props = defineProps<Props>();

const show = defineModel<boolean>('show');

const modalRef = ref<InstanceType<typeof AppModal> | null>(null);

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
  isInstantCopy,
} = useBulkCopyLeads(props.leads, props.heroCard);

const isJsonView = computed(() => viewMode.value === 'json');

// Instant copy: no fields/preview steps, just copy with the saved preferences
// and play the confirmation animation before closing.
const AUTO_CLOSE_DELAY = 1600;

const manualOverride = ref(false);
const copyFailed = ref(false);
const closeTimeout = ref<ReturnType<typeof setTimeout> | null>(null);

const isInstantView = computed(() => isInstantCopy.value && !manualOverride.value);

const switchToManual = () => {
  if (closeTimeout.value) clearTimeout(closeTimeout.value);
  manualOverride.value = true;
};

onMounted(async () => {
  if (!isInstantCopy.value) return;

  try {
    await copyToClipboard();
  } catch (error) {
    console.error('Instant bulk copy failed', error);
    copyFailed.value = true;
    return;
  }

  closeTimeout.value = setTimeout(() => {
    show.value = false;
  }, AUTO_CLOSE_DELAY);
});

onUnmounted(() => {
  if (closeTimeout.value) clearTimeout(closeTimeout.value);
});

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
    title="Bulk Copy Leads"
    :compact="isInstantView"
  >
    <div v-if="isInstantView" class="instant-copy">
      <div v-if="copyFailed" class="instant-icon _failed">
        <IconCross :size="30" />
      </div>
      <div v-else class="instant-icon">
        <svg class="check" viewBox="0 0 52 52" aria-hidden="true">
          <circle class="check-circle" cx="26" cy="26" r="23" />
          <path class="check-mark" d="M15 27 L23 35 L38 19" />
        </svg>
      </div>

      <template v-if="copyFailed">
        <p class="instant-title">Couldn't copy automatically</p>
        <p class="instant-subtitle">Pick the fields and copy manually instead.</p>
        <button class="primary" @click="switchToManual">Copy options</button>
      </template>
      <template v-else>
        <p class="instant-title">
          Copied {{ leads.length }} {{ leads.length === 1 ? 'lead' : 'leads' }}
        </p>
        <p class="instant-subtitle">Using your saved bulk copy preferences</p>
      </template>
    </div>

    <AppStepper
      v-if="!isInstantView"
      :current-step="currentStep"
      :total-steps="totalSteps"
      class="mb-4"
    />

    <div v-if="!isInstantView" class="step-content">
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
          :deep="4"
          :is-copied="isCopied"
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

    <template v-if="!isInstantView" #footer>
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


.instant-copy {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 6px;
  padding: 12px 8px 8px;
}

.instant-icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  margin-bottom: 6px;
  border-radius: 50%;
  background: #ecfdf5;
  color: #057642;
  animation: instant-pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

/* Ripple radiating out of the badge */
.instant-icon::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid #057642;
  animation: instant-ripple 1.1s ease-out 0.15s both;
}

.instant-icon._failed {
  background: #fef2f2;
  color: #b91c1c;
}

.instant-icon._failed::after {
  border-color: #b91c1c;
  animation: none;
}

.check {
  width: 40px;
  height: 40px;
  stroke: currentColor;
  stroke-width: 4;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
}

.check-circle {
  stroke-width: 2;
  opacity: 0.35;
  stroke-dasharray: 145;
  stroke-dashoffset: 145;
  animation: instant-draw 0.5s ease-out 0.1s forwards;
}

.check-mark {
  stroke-dasharray: 40;
  stroke-dashoffset: 40;
  animation: instant-draw 0.35s ease-out 0.35s forwards;
}

.instant-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
}

.instant-subtitle {
  margin: 0;
  font-size: 0.85rem;
  color: #64748b;
}

.instant-copy button {
  margin-top: 12px;
}

@keyframes instant-pop {
  from {
    transform: scale(0.6);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes instant-ripple {
  from {
    transform: scale(1);
    opacity: 0.5;
  }
  to {
    transform: scale(1.6);
    opacity: 0;
  }
}

@keyframes instant-draw {
  to {
    stroke-dashoffset: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .instant-icon,
  .instant-icon::after,
  .check-circle,
  .check-mark {
    animation: none;
  }

  .check-circle,
  .check-mark {
    stroke-dashoffset: 0;
  }
}
</style>

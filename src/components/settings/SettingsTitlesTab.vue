<script lang="ts" setup>
import { ref, watch, nextTick, computed } from 'vue';
import { useDataStore } from '@/store/data-store';
import { storageService } from '@/services/storage-service';
import { titleTargets, titleStates, generateLeadTitle } from '@/helpers/title-helper';
import AppCard from '@/components/ui/AppCard.vue';
import AppPreviewBox from '@/components/ui/AppPreviewBox.vue';
import IconCross from '@/components/icons/IconCross.vue';
import IconChevronUp from '@/components/icons/IconChevronUp.vue';
import IconChevronDown from '@/components/icons/IconChevronDown.vue';
import type { TitleTarget, TitleState } from '@/helpers/title-helper';

const { copyLeadSettings } = useDataStore();

const localSettings = ref({
  selectedTarget: '',
  selectedState: '',
  titleTargets: [] as TitleTarget[],
  titleStates: [] as TitleState[],
});

// Initialize local state from store
watch(() => copyLeadSettings.value, (val) => {
  if (val) {
    localSettings.value.selectedTarget = val.selectedTarget || titleTargets[0].value;
    localSettings.value.selectedState = val.selectedState || titleStates[0].value;
    localSettings.value.titleTargets = JSON.parse(JSON.stringify(val.titleTargets || titleTargets));
    localSettings.value.titleStates = JSON.parse(JSON.stringify(val.titleStates || titleStates));
  } else {
    localSettings.value.selectedTarget = titleTargets[0].value;
    localSettings.value.selectedState = titleStates[0].value;
    localSettings.value.titleTargets = JSON.parse(JSON.stringify(titleTargets));
    localSettings.value.titleStates = JSON.parse(JSON.stringify(titleStates));
  }
}, { immediate: true, deep: true });

// Auto-save changes
watch(localSettings, async (newValue) => {
  if (copyLeadSettings.value) {
    await storageService.setLocal({
      copyLeadSettings: {
        ...copyLeadSettings.value,
        selectedTarget: newValue.selectedTarget,
        selectedState: newValue.selectedState,
        titleTargets: newValue.titleTargets,
        titleStates: newValue.titleStates,
      }
    });
  }
}, { deep: true });

const targetCard = ref<any>(null);
const stateCard = ref<any>(null);

const addTarget = async () => {
  localSettings.value.titleTargets.push({
    label: '',
    emoji: '🔵',
    value: `target_${Date.now()}`
  });
  await nextTick();
  const inputs = targetCard.value?.$el?.querySelectorAll('.label-input');
  if (inputs) inputs[inputs.length - 1]?.focus();
};

const removeTarget = (index: number) => {
  if (localSettings.value.titleTargets.length <= 1) return;

  const target = localSettings.value.titleTargets[index];
  if (target.label.trim() !== '' && !confirm(`Remove title target "${target.label}"?`)) {
    return;
  }

  const removed = localSettings.value.titleTargets.splice(index, 1)[0];
  if (localSettings.value.selectedTarget === removed.value) {
    localSettings.value.selectedTarget = localSettings.value.titleTargets[0]?.value || '';
  }
};

const moveTargetUp = (index: number) => {
  if (index > 0) {
    const item = localSettings.value.titleTargets.splice(index, 1)[0];
    localSettings.value.titleTargets.splice(index - 1, 0, item);
  }
};

const moveTargetDown = (index: number) => {
  if (index < localSettings.value.titleTargets.length - 1) {
    const item = localSettings.value.titleTargets.splice(index, 1)[0];
    localSettings.value.titleTargets.splice(index + 1, 0, item);
  }
};

const addState = async () => {
  localSettings.value.titleStates.push({
    label: '',
    emoji: '⚪',
    value: `state_${Date.now()}`
  });
  await nextTick();
  const inputs = stateCard.value?.$el?.querySelectorAll('.label-input');
  if (inputs) inputs[inputs.length - 1]?.focus();
};

const removeState = (index: number) => {
  if (localSettings.value.titleStates.length <= 1) return;

  const state = localSettings.value.titleStates[index];
  if (state.label.trim() !== '' && !confirm(`Remove title state "${state.label}"?`)) {
    return;
  }

  const removed = localSettings.value.titleStates.splice(index, 1)[0];
  if (localSettings.value.selectedState === removed.value) {
    localSettings.value.selectedState = localSettings.value.titleStates[0]?.value || '';
  }
};

const moveStateUp = (index: number) => {
  if (index > 0) {
    const item = localSettings.value.titleStates.splice(index, 1)[0];
    localSettings.value.titleStates.splice(index - 1, 0, item);
  }
};

const moveStateDown = (index: number) => {
  if (index < localSettings.value.titleStates.length - 1) {
    const item = localSettings.value.titleStates.splice(index, 1)[0];
    localSettings.value.titleStates.splice(index + 1, 0, item);
  }
};
const previewTitle = computed(() => {
  return generateLeadTitle({
    fullName: 'Mark Zuckerberg',
    positionTitle: 'Chief Executive Officer',
    companyName: 'Meta',
    targetValue: localSettings.value.selectedTarget,
    stateValue: localSettings.value.selectedState,
    customTargets: localSettings.value.titleTargets,
    customStates: localSettings.value.titleStates,
  });
});

const resetToDefaults = () => {
  if (confirm('Are you sure you want to reset all title options to defaults? This will remove your custom entries.')) {
    localSettings.value.titleTargets = JSON.parse(JSON.stringify(titleTargets));
    localSettings.value.titleStates = JSON.parse(JSON.stringify(titleStates));
    localSettings.value.selectedTarget = titleTargets[0].value;
    localSettings.value.selectedState = titleStates[0].value;
  }
};
</script>

<template>
  <div class="tab-content">
    <div class="intro-section">
      <p class="tab-description">
        Configure the format of lead titles used in the Copy Modal. These help you organize leads in your CRM or notes.
      </p>
    </div>

    <AppCard title="Live Preview">
      <div class="preview-wrapper">
        <p class="section-desc">How the lead title looks with current defaults:</p>
        <AppPreviewBox mini wrap-text>
          {{ previewTitle }}
        </AppPreviewBox>
      </div>
    </AppCard>

    <AppCard title="Title Targets" ref="targetCard">
      <p class="section-desc">Targets represent the type of lead's business (e.g. SaaS, Agency).</p>
      <div class="editable-list">
        <div class="list-header">
          <span class="header-label">Default</span>
          <span class="header-label">Emoji</span>
          <span class="header-label">Label</span>
          <span class="header-label actions-header">Actions</span>
        </div>
        <div
          v-for="(target, index) in localSettings.titleTargets"
          :key="target.value"
          class="editable-row"
          :class="{ 'is-default': localSettings.selectedTarget === target.value }"
        >
          <div class="radio-wrapper">
            <input
              type="radio"
              :value="target.value"
              v-model="localSettings.selectedTarget"
              class="custom-radio"
              title="Set as default"
            />
          </div>
          <input v-model="target.emoji" class="emoji-input" placeholder="Emoji" />
          <input v-model="target.label" class="label-input" placeholder="Label" />

          <div class="row-actions">
            <div class="reorder-btns">
              <button
                class="reorder-btn"
                title="Move Up"
                @click="moveTargetUp(index)"
                :disabled="index === 0"
              >
                <IconChevronUp size="16" />
              </button>
              <button
                class="reorder-btn"
                title="Move Down"
                @click="moveTargetDown(index)"
                :disabled="index === localSettings.titleTargets.length - 1"
              >
                <IconChevronDown size="16" />
              </button>
            </div>
            <button
              class="remove-btn"
              title="Remove"
              @click="removeTarget(index)"
              :disabled="localSettings.titleTargets.length <= 1"
            >
              <IconCross size="16" color="#ef4444" />
            </button>
          </div>
        </div>
        <button class="add-btn" @click="addTarget">+ Add Target</button>
      </div>
    </AppCard>

    <AppCard title="Title States" ref="stateCard">
      <p class="section-desc">States represent your current interaction status with the lead.</p>
      <div class="editable-list">
        <div class="list-header">
          <span class="header-label">Default</span>
          <span class="header-label">Emoji</span>
          <span class="header-label">Label</span>
          <span class="header-label actions-header">Actions</span>
        </div>
        <div
          v-for="(state, index) in localSettings.titleStates"
          :key="state.value"
          class="editable-row"
          :class="{ 'is-default': localSettings.selectedState === state.value }"
        >
          <div class="radio-wrapper">
            <input
              type="radio"
              :value="state.value"
              v-model="localSettings.selectedState"
              class="custom-radio"
              title="Set as default"
            />
          </div>
          <input v-model="state.emoji" class="emoji-input" placeholder="Emoji" />
          <input v-model="state.label" class="label-input" placeholder="Label" />

          <div class="row-actions">
            <div class="reorder-btns">
              <button
                class="reorder-btn"
                title="Move Up"
                @click="moveStateUp(index)"
                :disabled="index === 0"
              >
                <IconChevronUp size="16" />
              </button>
              <button
                class="reorder-btn"
                title="Move Down"
                @click="moveStateDown(index)"
                :disabled="index === localSettings.titleStates.length - 1"
              >
                <IconChevronDown size="16" />
              </button>
            </div>
            <button
              class="remove-btn"
              title="Remove"
              @click="removeState(index)"
              :disabled="localSettings.titleStates.length <= 1"
            >
              <IconCross size="16" color="#ef4444" />
            </button>
          </div>
        </div>
        <button class="add-btn" @click="addState">+ Add State</button>
      </div>
    </AppCard>

    <div class="actions">
      <button class="reset-btn" @click="resetToDefaults">
        Reset Titles to Defaults
      </button>
    </div>
  </div>
</template>

<style scoped>
.tab-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.intro-section {
  padding: 0 4px;
}

.tab-description {
  font-size: 0.9rem;
  color: #475569;
  line-height: 1.5;
}

.preview-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-desc {
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: 12px;
}

.list-header {
  display: flex;
  gap: 8px;
  padding: 0 4px;
  margin-bottom: 4px;
}

.header-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
}

.header-label:nth-child(1) { width: 56px; text-align: center; }
.header-label:nth-child(2) { width: 60px; text-align: center; }
.header-label:nth-child(3) { flex: 1; padding-left: 2px; }
.header-label.actions-header { width: 110px; text-align: right; padding-right: 4px; }

.editable-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.editable-row {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 6px 8px;
  transition: all 0.2s;
  border-radius: 8px;
  border: 1px solid transparent;
}

.editable-row.is-default {
  background-color: #f0f9ff;
  border: 1px solid #bae6fd;
}

.editable-row:hover {
  background-color: #f8fafc;
}

.editable-row.is-default:hover {
  background-color: #e0f2fe;
}

.radio-wrapper {
  width: 52px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.custom-radio {
  appearance: none;
  width: 18px;
  height: 18px;
  border: 2px solid #cbd5e1;
  border-radius: 50%;
  outline: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  background: white;
}

.custom-radio:checked {
  border-color: #0a66c2;
}

.custom-radio:checked::after {
  content: "";
  width: 10px;
  height: 10px;
  background-color: #0a66c2;
  border-radius: 50%;
  display: block;
}

.custom-radio:hover:not(:checked) {
  border-color: #94a3b8;
}

.emoji-input {
  width: 44px;
  padding: 6px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  text-align: center;
  font-size: 0.9rem;
}

.label-input {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-size: 0.85rem;
}

.emoji-input:focus,
.label-input:focus {
  outline: none;
  border-color: #0a66c2;
  box-shadow: 0 0 0 2px rgba(10, 102, 194, 0.1);
  background: white;
}

.remove-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.remove-btn:hover:not(:disabled) {
  background-color: #fee2e2;
}

.remove-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.row-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 110px;
  justify-content: flex-end;
}

.reorder-btns {
  display: flex;
  gap: 4px;
}

.reorder-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  color: #94a3b8;
  transition: all 0.2s;
}

.reorder-btn:hover:not(:disabled) {
  background-color: #f1f5f9;
  color: #0a66c2;
}

.reorder-btn:disabled {
  opacity: 0.2;
  cursor: not-allowed;
}

.add-btn {
  margin-top: 8px;
  padding: 10px;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  background: #f8fafc;
  color: #0a66c2;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.add-btn:hover {
  background-color: #f0f7ff;
  border-color: #0a66c2;
  border-style: solid;
}

.actions {
  margin-top: 8px;
}

.reset-btn {
  width: 100%;
  padding: 10px;
  background-color: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-btn:hover {
  background-color: #f1f5f9;
  color: #ef4444;
  border-color: #fca5a5;
}
</style>

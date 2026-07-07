<script lang="ts" setup>
import { ref, watch, nextTick, computed } from 'vue';
import { useDataStore } from '@/store/data-store';
import { storageService } from '@/services/storage-service';
import { titleTargets, titleStates, generateLeadTitle } from '@/helpers/title-helper';
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
  <div>
    <div class="intro-section mb-4">
      <p class="text-body-2 text-medium-emphasis">
        Configure the format of lead titles used in the Copy Modal. These help you organize leads in your CRM or notes.
      </p>
    </div>

    <v-card title="Live Preview" class="mb-4">
      <v-card-text>
        <p class="text-caption text-medium-emphasis mb-2">How the lead title looks with current defaults:</p>
        <AppPreviewBox mini wrap-text>
          {{ previewTitle }}
        </AppPreviewBox>
      </v-card-text>
    </v-card>

    <v-card ref="targetCard" title="Title Targets" class="mb-4">
      <v-card-text>
        <p class="text-caption text-medium-emphasis mb-4">Targets represent the type of lead's business (e.g. SaaS, Agency).</p>
        <div class="editable-list">
          <div class="list-header">
            <span class="header-label">Default</span>
            <span class="header-label">Emoji</span>
            <span class="header-label">Label</span>
            <span class="header-label actions-header">Actions</span>
          </div>
          <v-radio-group v-model="localSettings.selectedTarget" hide-details>
            <div
              v-for="(target, index) in localSettings.titleTargets"
              :key="target.value"
              class="editable-row"
              :class="{ 'is-default': localSettings.selectedTarget === target.value }"
            >
              <div class="radio-wrapper">
                <v-radio
                  :value="target.value"
                  color="#0073b1"
                  density="compact"
                  hide-details
                ></v-radio>
              </div>
              <v-text-field
                v-model="target.emoji"
                placeholder="Emoji"
                density="compact"
                hide-details
                variant="outlined"
                class="emoji-input-field"
              ></v-text-field>
              <v-text-field
                v-model="target.label"
                placeholder="Label"
                density="compact"
                hide-details
                variant="outlined"
                class="label-input-field"
              ></v-text-field>

              <div class="row-actions">
                <div class="reorder-btns">
                  <v-btn
                    icon
                    variant="text"
                    size="x-small"
                    title="Move Up"
                    @click="moveTargetUp(index)"
                    :disabled="index === 0"
                  >
                    <IconChevronUp size="16" />
                  </v-btn>
                  <v-btn
                    icon
                    variant="text"
                    size="x-small"
                    title="Move Down"
                    @click="moveTargetDown(index)"
                    :disabled="index === localSettings.titleTargets.length - 1"
                  >
                    <IconChevronDown size="16" />
                  </v-btn>
                </div>
                <v-btn
                  icon
                  variant="text"
                  size="x-small"
                  color="error"
                  title="Remove"
                  @click="removeTarget(index)"
                  :disabled="localSettings.titleTargets.length <= 1"
                >
                  <IconCross size="16" />
                </v-btn>
              </div>
            </div>
          </v-radio-group>
          <v-btn
            variant="tonal"
            block
            class="mt-4"
            @click="addTarget"
          >
            + Add Target
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <v-card ref="stateCard" title="Title States" class="mb-4">
      <v-card-text>
        <p class="text-caption text-medium-emphasis mb-4">States represent your current interaction status with the lead.</p>
        <div class="editable-list">
          <div class="list-header">
            <span class="header-label">Default</span>
            <span class="header-label">Emoji</span>
            <span class="header-label">Label</span>
            <span class="header-label actions-header">Actions</span>
          </div>
          <v-radio-group v-model="localSettings.selectedState" hide-details>
            <div
              v-for="(state, index) in localSettings.titleStates"
              :key="state.value"
              class="editable-row"
              :class="{ 'is-default': localSettings.selectedState === state.value }"
            >
              <div class="radio-wrapper">
                <v-radio
                  :value="state.value"
                  color="#0073b1"
                  density="compact"
                  hide-details
                ></v-radio>
              </div>
              <v-text-field
                v-model="state.emoji"
                placeholder="Emoji"
                density="compact"
                hide-details
                variant="outlined"
                class="emoji-input-field"
              ></v-text-field>
              <v-text-field
                v-model="state.label"
                placeholder="Label"
                density="compact"
                hide-details
                variant="outlined"
                class="label-input-field"
              ></v-text-field>

              <div class="row-actions">
                <div class="reorder-btns">
                  <v-btn
                    icon
                    variant="text"
                    size="x-small"
                    title="Move Up"
                    @click="moveStateUp(index)"
                    :disabled="index === 0"
                  >
                    <IconChevronUp size="16" />
                  </v-btn>
                  <v-btn
                    icon
                    variant="text"
                    size="x-small"
                    title="Move Down"
                    @click="moveStateDown(index)"
                    :disabled="index === localSettings.titleStates.length - 1"
                  >
                    <IconChevronDown size="16" />
                  </v-btn>
                </div>
                <v-btn
                  icon
                  variant="text"
                  size="x-small"
                  color="error"
                  title="Remove"
                  @click="removeState(index)"
                  :disabled="localSettings.titleStates.length <= 1"
                >
                  <IconCross size="16" />
                </v-btn>
              </div>
            </div>
          </v-radio-group>
          <v-btn
            variant="tonal"
            block
            class="mt-4"
            @click="addState"
          >
            + Add State
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <div class="mt-3">
      <v-btn
        color="error"
        variant="outlined"
        block
        @click="resetToDefaults"
      >
        Reset Titles to Defaults
      </v-btn>
    </div>
  </div>
</template>

<style scoped>
.mb-4 {
  margin-bottom: 16px;
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
  padding: 4px 8px;
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

.emoji-input-field {
  max-width: 60px;
}

:deep(.emoji-input-field .v-field__input) {
  text-align: center;
}

.label-input-field {
  flex: 1;
}

.row-actions {
  display: flex;
  align-items: center;
  padding-left: 8px;
  gap: 8px;
  justify-content: flex-end;
}

.reorder-btns {
  display: flex;
  gap: 4px;
}
</style>

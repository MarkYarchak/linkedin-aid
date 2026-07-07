<script lang="ts" setup>
import { ref, watch, nextTick, computed } from 'vue';
import { useDataStore } from '@/store/data-store';
import { storageService } from '@/services/storage-service';
import { titleTargets, titleStates, generateLeadTitle } from '@/helpers/title-helper';
import AppPreviewBox from '@/components/ui/AppPreviewBox.vue';
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
        <div class="text-caption text-medium-emphasis mb-2">How the lead title looks with current defaults:</div>
        <AppPreviewBox mini wrap-text>
          {{ previewTitle }}
        </AppPreviewBox>
      </v-card-text>
    </v-card>

    <v-card ref="targetCard" title="Title Targets" class="mb-4">
      <v-card-text>
        <div class="text-caption text-medium-emphasis mb-4">Targets represent the type of lead's business (e.g. SaaS, Agency).</div>
        <div class="editable-list">
          <v-row no-gutters class="px-2 mb-2 ga-2">
            <v-col cols="auto" style="width: 52px" class="text-center text-caption font-weight-bold text-medium-emphasis text-uppercase">Default</v-col>
            <v-col cols="auto" style="width: 60px" class="text-center text-caption font-weight-bold text-medium-emphasis text-uppercase">Emoji</v-col>
            <v-col class="text-caption font-weight-bold text-medium-emphasis text-uppercase">Label</v-col>
            <v-col cols="auto" style="width: 110px" class="text-right text-caption font-weight-bold text-medium-emphasis text-uppercase pr-1">Actions</v-col>
          </v-row>

          <v-radio-group v-model="localSettings.selectedTarget" hide-details>
            <v-row
              v-for="(target, index) in localSettings.titleTargets"
              :key="target.value"
              no-gutters
              align="center"
              :class="{ [$vuetify.theme.current.dark ? 'bg-blue-grey-darken-4' : 'bg-blue-lighten-5']: localSettings.selectedTarget === target.value }"
              class="px-2 py-1 rounded-lg mb-1 transition-swing ga-2"
            >
              <v-col cols="auto" style="width: 52px" class="d-flex justify-center">
                <v-radio
                  :value="target.value"
                  color="#0073b1"
                  density="compact"
                  hide-details
                ></v-radio>
              </v-col>
              <v-col cols="auto" style="width: 60px">
                <v-text-field
                  v-model="target.emoji"
                  placeholder="Emoji"
                  density="compact"
                  hide-details
                  variant="outlined"
                  class="emoji-input-field"
                ></v-text-field>
              </v-col>
              <v-col>
                <v-text-field
                  v-model="target.label"
                  placeholder="Label"
                  density="compact"
                  hide-details
                  variant="outlined"
                ></v-text-field>
              </v-col>

              <v-col cols="auto" style="width: 110px" class="d-flex justify-end ga-1">
                <v-btn
                  icon
                  variant="text"
                  size="x-small"
                  title="Move Up"
                  @click="moveTargetUp(index)"
                  :disabled="index === 0"
                >
                  <v-icon size="20">mdi-chevron-up</v-icon>
                </v-btn>
                <v-btn
                  icon
                  variant="text"
                  size="x-small"
                  title="Move Down"
                  @click="moveTargetDown(index)"
                  :disabled="index === localSettings.titleTargets.length - 1"
                >
                  <v-icon size="20">mdi-chevron-down</v-icon>
                </v-btn>
                <v-btn
                  icon
                  variant="text"
                  size="x-small"
                  color="error"
                  title="Remove"
                  @click="removeTarget(index)"
                  :disabled="localSettings.titleTargets.length <= 1"
                >
                  <v-icon size="18">mdi-close</v-icon>
                </v-btn>
              </v-col>
            </v-row>
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
        <div class="text-caption text-medium-emphasis mb-4">States represent your current interaction status with the lead.</div>
        <div class="editable-list">
          <v-row no-gutters class="px-2 mb-2 ga-2">
            <v-col cols="auto" style="width: 52px" class="text-center text-caption font-weight-bold text-medium-emphasis text-uppercase">Default</v-col>
            <v-col cols="auto" style="width: 60px" class="text-center text-caption font-weight-bold text-medium-emphasis text-uppercase">Emoji</v-col>
            <v-col class="text-caption font-weight-bold text-medium-emphasis text-uppercase">Label</v-col>
            <v-col cols="auto" style="width: 110px" class="text-right text-caption font-weight-bold text-medium-emphasis text-uppercase pr-1">Actions</v-col>
          </v-row>

          <v-radio-group v-model="localSettings.selectedState" hide-details>
            <v-row
              v-for="(state, index) in localSettings.titleStates"
              :key="state.value"
              align="center"
              density="compact"
              :class="{ [$vuetify.theme.current.dark ? 'bg-blue-grey-darken-4' : 'bg-blue-lighten-5']: localSettings.selectedState === state.value }"
              class="px-2 py-1 rounded-lg transition-swing ga-2"
            >
              <v-col cols="auto" style="width: 52px" class="d-flex justify-center">
                <v-radio
                  :value="state.value"
                  color="#0073b1"
                  density="compact"
                  hide-details
                ></v-radio>
              </v-col>
              <v-col cols="auto" style="width: 60px">
                <v-text-field
                  v-model="state.emoji"
                  placeholder="Emoji"
                  density="compact"
                  hide-details
                  variant="outlined"
                  class="emoji-input-field"
                ></v-text-field>
              </v-col>
              <v-col>
                <v-text-field
                  v-model="state.label"
                  placeholder="Label"
                  density="compact"
                  hide-details
                  variant="outlined"
                ></v-text-field>
              </v-col>

              <v-col cols="auto" style="width: 110px" class="d-flex justify-end ga-1">
                <v-btn
                  icon
                  variant="text"
                  size="x-small"
                  title="Move Up"
                  @click="moveStateUp(index)"
                  :disabled="index === 0"
                >
                  <v-icon size="20">mdi-chevron-up</v-icon>
                </v-btn>
                <v-btn
                  icon
                  variant="text"
                  size="x-small"
                  title="Move Down"
                  @click="moveStateDown(index)"
                  :disabled="index === localSettings.titleStates.length - 1"
                >
                  <v-icon size="20">mdi-chevron-down</v-icon>
                </v-btn>
                <v-btn
                  icon
                  variant="text"
                  size="x-small"
                  color="error"
                  title="Remove"
                  @click="removeState(index)"
                  :disabled="localSettings.titleStates.length <= 1"
                >
                  <v-icon size="18">mdi-close</v-icon>
                </v-btn>
              </v-col>
            </v-row>
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
.emoji-input-field {
  max-width: 60px;
}

:deep(.emoji-input-field .v-field__input) {
  text-align: center;
}
</style>

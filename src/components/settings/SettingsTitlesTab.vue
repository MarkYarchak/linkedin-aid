<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useDataStore } from '@/store/data-store';
import { storageService } from '@/services/storage-service';
import { titleTargets, titleStates } from '@/helpers/title-helper';
import AppCard from '@/components/ui/AppCard.vue';
import AppDivider from '@/components/ui/AppDivider.vue';
import AppRadio from '@/components/ui/AppRadio.vue';
import IconCross from '@/components/icons/IconCross.vue';
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

const addTarget = () => {
  localSettings.value.titleTargets.push({
    label: 'New Target',
    emoji: '🔵',
    value: `target_${Date.now()}`
  });
};

const removeTarget = (index: number) => {
  const removed = localSettings.value.titleTargets.splice(index, 1)[0];
  if (localSettings.value.selectedTarget === removed.value) {
    localSettings.value.selectedTarget = localSettings.value.titleTargets[0]?.value || '';
  }
};

const addState = () => {
  localSettings.value.titleStates.push({
    label: 'New State',
    emoji: '⚪',
    value: `state_${Date.now()}`
  });
};

const removeState = (index: number) => {
  const removed = localSettings.value.titleStates.splice(index, 1)[0];
  if (localSettings.value.selectedState === removed.value) {
    localSettings.value.selectedState = localSettings.value.titleStates[0]?.value || '';
  }
};
</script>

<template>
  <div class="tab-content">
    <AppCard title="Title Defaults">
      <div class="settings-column">
        <span class="group-title">Target Default</span>
        <div class="radio-grid">
          <AppRadio
            v-for="target in localSettings.titleTargets"
            :key="target.value"
            v-model="localSettings.selectedTarget"
            :value="target.value"
          >
            {{ target.emoji }} {{ target.label }}
          </AppRadio>
        </div>

        <AppDivider />

        <span class="group-title">State Default</span>
        <div class="radio-grid">
          <AppRadio
            v-for="state in localSettings.titleStates"
            :key="state.value"
            v-model="localSettings.selectedState"
            :value="state.value"
          >
            {{ state.emoji }} {{ state.label }}
          </AppRadio>
        </div>
      </div>
    </AppCard>

    <AppCard title="Manage Targets">
      <div class="editable-list">
        <div v-for="(target, index) in localSettings.titleTargets" :key="target.value" class="editable-row">
          <input v-model="target.emoji" class="emoji-input" placeholder="Emoji" />
          <input v-model="target.label" class="label-input" placeholder="Label" />
          <button class="remove-btn" title="Remove" @click="removeTarget(index)">
            <IconCross size="14" color="#ef4444" />
          </button>
        </div>
        <button class="add-btn" @click="addTarget">+ Add Target</button>
      </div>
    </AppCard>

    <AppCard title="Manage States">
      <div class="editable-list">
        <div v-for="(state, index) in localSettings.titleStates" :key="state.value" class="editable-row">
          <input v-model="state.emoji" class="emoji-input" placeholder="Emoji" />
          <input v-model="state.label" class="label-input" placeholder="Label" />
          <button class="remove-btn" title="Remove" @click="removeState(index)">
            <IconCross size="14" color="#ef4444" />
          </button>
        </div>
        <button class="add-btn" @click="addState">+ Add State</button>
      </div>
    </AppCard>
  </div>
</template>

<style scoped>
.tab-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.settings-column {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.group-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  margin-bottom: 4px;
  display: block;
}

.radio-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.editable-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.editable-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.emoji-input {
  width: 40px;
  padding: 6px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  text-align: center;
}

.label-input {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-size: 0.85rem;
}

.remove-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.remove-btn:hover {
  background-color: #fee2e2;
}

.add-btn {
  margin-top: 4px;
  padding: 8px;
  border: 1px dashed #cbd5e1;
  border-radius: 6px;
  background: none;
  color: #0a66c2;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.add-btn:hover {
  background-color: #f8fafc;
  border-color: #0a66c2;
}
</style>

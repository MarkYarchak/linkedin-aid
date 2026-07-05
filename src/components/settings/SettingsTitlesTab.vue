<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useDataStore } from '@/store/data-store';
import { storageService } from '@/services/storage-service';
import { titleTargets, titleStates } from '@/helpers/title-helper';
import AppCard from '@/components/ui/AppCard.vue';
import AppDivider from '@/components/ui/AppDivider.vue';
import AppRadio from '@/components/ui/AppRadio.vue';
import type { CopyLeadSettings } from '@/types/copy-lead-settings';

const { copyLeadSettings } = useDataStore();

const localSettings = ref<Pick<CopyLeadSettings, 'selectedTarget' | 'selectedState'>>({
  selectedTarget: titleTargets[0].value,
  selectedState: titleStates[0].value,
});

// Initialize local state from store
watch(() => copyLeadSettings.value, (val) => {
  if (val) {
    localSettings.value.selectedTarget = val.selectedTarget;
    localSettings.value.selectedState = val.selectedState;
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
      }
    });
  }
}, { deep: true });
</script>

<template>
  <div class="tab-content">
    <AppCard title="Title Defaults">
      <div class="settings-column">
        <span class="group-title">Target</span>
        <div class="radio-grid">
          <AppRadio
            v-for="target in titleTargets"
            :key="target.value"
            v-model="localSettings.selectedTarget"
            :value="target.value"
          >
            {{ target.emoji }} {{ target.label }}
          </AppRadio>
        </div>

        <AppDivider />

        <span class="group-title">State</span>
        <div class="radio-grid">
          <AppRadio
            v-for="state in titleStates"
            :key="state.value"
            v-model="localSettings.selectedState"
            :value="state.value"
          >
            {{ state.emoji }} {{ state.label }}
          </AppRadio>
        </div>
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
</style>

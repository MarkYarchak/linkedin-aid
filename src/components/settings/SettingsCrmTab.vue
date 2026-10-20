<script lang="ts" setup>
import { ref } from 'vue';
import SettingsAiTab from '@/components/settings/SettingsAiTab.vue';
import SettingsSignalsTab from '@/components/settings/SettingsSignalsTab.vue';

const activeSubTab = ref<'crm' | 'ai' | 'signals'>('crm');

const subTabs = [
  { label: 'CRM', value: 'crm' },
  { label: 'AI', value: 'ai' },
  { label: 'Signals', value: 'signals' },
];
</script>

<template>
  <div>
    <v-btn-toggle
      v-model="activeSubTab"
      mandatory
      divided
      color="#0073b1"
      class="mb-4 d-flex"
    >
      <v-btn
        v-for="tab in subTabs"
        :key="tab.value"
        :value="tab.value"
        :variant="$vuetify.theme.current.dark ? undefined : 'outlined'"
        class="flex-grow-1"
      >
        {{ tab.label }}
      </v-btn>
    </v-btn-toggle>

    <div v-if="activeSubTab === 'crm'">
      <v-card title="CRM Configuration" class="mb-4">
        <v-card-text>
          <div class="placeholder-content">
            CRM integration settings and mappings will be available here soon.
          </div>
        </v-card-text>
      </v-card>
    </div>

    <div v-else-if="activeSubTab === 'ai'">
      <SettingsAiTab />
    </div>

    <div v-else-if="activeSubTab === 'signals'">
      <SettingsSignalsTab />
    </div>
  </div>
</template>

<style scoped>
.placeholder-content {
  color: #64748b;
  font-size: 0.85rem;
  font-style: italic;
}
</style>

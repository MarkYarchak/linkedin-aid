<script setup lang="ts">
import { useLeads } from '@/composables/useLeads';
import LeadPreview from '../leads/LeadPreview.vue';

interface Props {
  tabUrl: string;
}
const props = defineProps<Props>();

const { currentUrlLead } = useLeads(props.tabUrl);
</script>

<template>
  <div class="lead-page">
    <LeadPreview
      v-if="currentUrlLead"
      :lead="currentUrlLead"
    />
    <div v-else class="no-data">
      No leads collected yet. Navigate to a Sales Navigator lead profile to collect data.
    </div>
  </div>
</template>

<style scoped>
.lead-page {
  padding: 10px;
}
</style>

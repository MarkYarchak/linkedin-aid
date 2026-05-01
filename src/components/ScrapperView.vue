<script lang="ts" setup>
import ScrapeActions from '@/components/ScrapeActions.vue';
import LeadPreview from '@/components/LeadPreview.vue';
import { useLeads } from '@/composables/useLeads';

interface Props {
  tabUrl: string;
}
const props = defineProps<Props>();

const { sortedLeads } = useLeads(props.tabUrl);
</script>

<template>
  <div class="scrapper-view">
    <ScrapeActions :tab-url="tabUrl" />

    <div v-if="sortedLeads.length" class="leads-list">
      <LeadPreview v-for="lead in sortedLeads" :key="lead.entityUrn" :lead="lead" />
    </div>
    <div v-else class="no-leads">
      No leads captured yet. Navigate to a Sales Navigator lead profile to capture data.
    </div>
  </div>
</template>

<style scoped>
.scrapper-view {
  min-width: 320px;
  max-height: 500px;
  overflow-y: auto;
}

.leads-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.no-leads {
  margin-top: 20px;
  text-align: center;
  color: #666;
  font-size: 0.9em;
}
</style>

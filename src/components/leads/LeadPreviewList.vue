<script lang="ts" setup>
import LeadSearchPreview from '@/components/lead-search/LeadSearchPreview.vue';
import type { Lead } from '@/types/lead/lead';

interface Props {
  leads: Lead[];
  selectedUrns?: Set<string>;
}
defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:selected', urn: string, selected: boolean): void;
}>();
</script>

<template>
  <div class="lead-preview-list">
    <LeadSearchPreview
      v-for="lead in leads"
      :key="lead.entityUrn"
      :lead="lead"
      :selected="selectedUrns?.has(lead.entityUrn)"
      @update:selected="(selected) => emit('update:selected', lead.entityUrn, selected)"
    />
  </div>
</template>

<style scoped>
.lead-preview-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>

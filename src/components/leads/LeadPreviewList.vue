<script lang="ts" setup>
import LeadSearchPreview from '@/components/lead-search/LeadSearchPreview.vue';
import type { OptionalDeepReadonly } from '@/types/common';
import type { Lead } from '@/types/lead/lead';

interface Props {
  leads: OptionalDeepReadonly<Lead[]>;
  selectedUrns?: Set<string>;
  showExpiration?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  showExpiration: false,
});

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
      :show-expiration="showExpiration"
      @update:selected="(selected) => emit('update:selected', lead.entityUrn, selected)"
    >
      <template #actions="{ lead: slotLead }">
        <slot name="actions" :lead="slotLead" />
      </template>
    </LeadSearchPreview>
  </div>
</template>

<style scoped>
.lead-preview-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>

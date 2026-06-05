<script lang="ts" setup>
import AppAvatar from '@/components/ui/AppAvatar.vue';
import AppCheckbox from '@/components/ui/AppCheckbox.vue';
import type { Lead } from '@/types/lead/lead';

interface Props {
  leads: Lead[];
  selectedUrns?: Set<string>;
}
const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:selected', urn: string, selected: boolean): void;
}>();

const getAvatarUrl = (lead: Lead) => {
  if (lead.extra?.profilePictureDisplayImage) {
    const img = lead.extra.profilePictureDisplayImage;
    return img.rootUrl + img.artifacts[0].fileIdentifyingUrlPathSegment;
  }
  if (lead.searchResult?.profilePictureDisplayImage) {
    const img = lead.searchResult.profilePictureDisplayImage;
    return img.rootUrl + img.artifacts[0].fileIdentifyingUrlPathSegment;
  }
  return null;
};
</script>

<template>
  <div class="lead-preview-list">
    <div v-for="lead in leads" :key="lead.entityUrn" class="lead-item">
      <div v-if="selectedUrns" class="lead-selection">
        <AppCheckbox
          :model-value="selectedUrns.has(lead.entityUrn)"
          size="sm"
          @update:model-value="emit('update:selected', lead.entityUrn, $event)"
        />
      </div>
      <AppAvatar
        :src="getAvatarUrl(lead)"
        :alt="`${lead.main?.firstName || lead.searchResult?.firstName} ${lead.main?.lastName || lead.searchResult?.lastName}`"
        size="sm"
      />
      <div class="lead-info">
        <div class="lead-name">
          {{ lead.main?.firstName || lead.searchResult?.firstName }} {{ lead.main?.lastName || lead.searchResult?.lastName }}
        </div>
        <div class="lead-title">
          {{ lead.main?.defaultPosition?.title || lead.searchResult?.currentPositions?.[0]?.title || 'N/A' }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lead-preview-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.lead-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border: 1px solid #eee;
  border-radius: 4px;
  background-color: #fafafa;
}

.lead-selection {
  display: flex;
  align-items: center;
  padding-right: 4px;
}

.lead-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.lead-name {
  font-weight: 600;
  font-size: 0.9em;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lead-title {
  font-size: 0.8em;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>

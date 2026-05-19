<script lang="ts" setup>
import { ref } from 'vue';
import AppCopyButton from '@/components/ui/AppCopyButton.vue';
import CopyLeadModal from '@/components/modals/CopyLeadModal.vue';
import type { Lead } from '@/types/lead/lead';

interface Props {
  lead: Lead;
}
const props = defineProps<Props>();

const showCopyModal = ref(false);

const avatarUrl = computed(() => {
  const { extra, searchResult } = props.lead;
  if (extra?.profilePictureDisplayImage) {
    const img = extra.profilePictureDisplayImage;
    return img.rootUrl + img.artifacts[0].fileIdentifyingUrlPathSegment;
  }
  if (searchResult?.profilePictureDisplayImage) {
    const img = searchResult.profilePictureDisplayImage;
    return img.rootUrl + img.artifacts[0].fileIdentifyingUrlPathSegment;
  }
  return null;
});

function copyLeadInfo() {
  showCopyModal.value = true;
}
</script>

<template>
  <div class="lead-search-preview">
    <div class="content">
      <img v-if="avatarUrl"
           :src="avatarUrl"
           :alt="`${lead.main?.firstName || lead.searchResult?.firstName} ${lead.main?.lastName || lead.searchResult?.lastName}`"
           class="avatar" />
      <div class="info">
        <div class="name-row">
          <h3>{{ lead.main?.firstName || lead.searchResult?.firstName }} {{ lead.main?.lastName || lead.searchResult?.lastName }}</h3>
          <AppCopyButton @click="copyLeadInfo" />
        </div>
        <p class="headline">{{ lead.main?.headline || lead.searchResult?.headline }}</p>
        <div class="meta-row">
          <span class="company">{{ lead.main?.defaultPosition?.companyName || lead.searchResult?.currentPositions?.[0]?.companyName || 'N/A' }}</span>
          <span class="dot">&middot;</span>
          <span class="location">{{ lead.main?.location || lead.searchResult?.geoRegion }}</span>
        </div>
      </div>
    </div>

    <CopyLeadModal
      :show="showCopyModal"
      :lead="lead"
      @close="showCopyModal = false"
    />
  </div>
</template>

<style scoped>
.lead-search-preview {
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #ffffff;
  transition: box-shadow 0.2s;
}

.lead-search-preview:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.content {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #eee;
  flex-shrink: 0;
}

.info {
  flex: 1;
  min-width: 0;
}

.name-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2px;
  gap: 4px;
}

.name-row h3 {
  margin: 0;
  font-size: 0.95em;
  color: #0a66c2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.headline {
  margin: 0 0 4px 0;
  font-size: 0.85em;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.3;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8em;
  color: #666;
}

.company {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dot {
  flex-shrink: 0;
}

.location {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>

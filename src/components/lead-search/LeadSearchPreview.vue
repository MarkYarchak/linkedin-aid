<script lang="ts" setup>
import { computed } from 'vue';
import AppAvatar from '@/components/ui/AppAvatar.vue';
import type { Lead } from '@/types/lead/lead';

interface Props {
  lead: Lead;
}
const props = defineProps<Props>();

const avatarUrl = computed(() => {
  const { extra, searchResult } = props.lead;
  if (searchResult?.profilePictureDisplayImage) {
    const img = searchResult.profilePictureDisplayImage;
    return img.rootUrl + img.artifacts[0].fileIdentifyingUrlPathSegment;
  }
  if (extra?.profilePictureDisplayImage) {
    const img = extra.profilePictureDisplayImage;
    return img.rootUrl + img.artifacts[0].fileIdentifyingUrlPathSegment;
  }
  return null;
});

const isSaved = computed(() => {
  return props.lead.searchResult?.saved || props.lead.main?.savedLead || false;
});

const isPremium = computed(() => {
  return props.lead.searchResult?.premium || props.lead.extra?.memberBadges?.premium || false;
});

const summary = computed(() => {
  return props.lead.searchResult?.summary || props.lead.main?.summary || '';
});

const currentPositions = computed(() => {
  return props.lead.searchResult?.currentPositions || props.lead.main?.positions.filter(p => p.current) || [];
});

const secondDegreeBadge = computed(() => {
  return props.lead.searchResult?.spotlightBadges?.find(b => b.id === 'SECOND_DEGREE_CONNECTION');
});
</script>

<template>
  <div class="lead-search-preview">
    <div class="content">
      <AppAvatar
        :src="avatarUrl"
        :alt="`${lead.searchResult?.fullName || lead.main?.fullName}`"
        size="sm"
      />
      <div class="info">
        <div class="name-row">
          <h3>{{ lead.searchResult?.fullName || lead.main?.fullName }}</h3>
          <span v-if="isPremium" class="premium-icon" title="Premium">in</span>
          <span v-if="isSaved" class="saved-badge">Saved</span>
          <span v-if="secondDegreeBadge" class="connection-badge">{{ secondDegreeBadge.displayValue }}</span>
        </div>
        <div class="meta-row">
          <span class="company">{{ currentPositions[0]?.companyName || lead.main?.defaultPosition?.companyName || 'N/A' }}</span>
          <span class="dot">&middot;</span>
          <span class="location">{{ lead.searchResult?.geoRegion || lead.main?.location }}</span>
        </div>
        <p v-if="summary" class="summary">{{ summary }}</p>
      </div>
    </div>
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

.info {
  flex: 1;
  min-width: 0;
}

.name-row {
  display: flex;
  align-items: center;
  margin-bottom: 2px;
  gap: 6px;
}

.name-row h3 {
  margin: 0;
  font-size: 0.95em;
  color: #0a66c2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.premium-icon {
  background-color: #f8c100;
  color: #000;
  font-weight: bold;
  font-size: 10px;
  padding: 0 2px;
  border-radius: 2px;
  line-height: 1;
  text-transform: lowercase;
}

.saved-badge {
  font-size: 10px;
  background-color: #e1f0fe;
  color: #0a66c2;
  padding: 1px 4px;
  border-radius: 4px;
  font-weight: 500;
}

.connection-badge {
  font-size: 10px;
  color: #666;
  background-color: #f3f3f3;
  padding: 1px 4px;
  border-radius: 4px;
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

.summary {
  margin-top: 6px;
  font-size: 0.8em;
  color: #666;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}
</style>

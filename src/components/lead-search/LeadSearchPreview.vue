<script lang="ts" setup>
import { computed } from 'vue';
import AppAvatar from '@/components/ui/AppAvatar.vue';
import IconLocation from '@/components/icons/IconLocation.vue';
import IconIndustry from '@/components/icons/IconIndustry.vue';
import AppDivider from '@/components/ui/AppDivider.vue';
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

const primaryPosition = computed(() => currentPositions.value[0]);

const tenure = computed(() => {
  const pos = primaryPosition.value;
  if (!pos) return '';

  const tenureAtPosition = pos.tenureAtPosition || (pos as any).tenureAtPosition; // Handle potential differences in types
  const parts = [];

  if (tenureAtPosition?.numYears) parts.push(`${tenureAtPosition.numYears}y`);
  if (tenureAtPosition?.numMonths) parts.push(`${tenureAtPosition.numMonths}m`);

  return parts.length > 0 ? parts.join(' ') : '';
});

const industry = computed(() => {
  return primaryPosition.value?.companyUrnResolutionResult?.industry || '';
});

const skills = computed(() => {
  return props.lead.extra?.skills?.slice(0, 3).map(s => s.name) || [];
});

const connections = computed(() => {
  return props.lead.extra?.numOfConnections || 0;
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

        <div class="location-row">
          <IconLocation size="10" color="#666" />
          <span class="location">{{ lead.searchResult?.geoRegion || lead.main?.location }}</span>
          <span v-if="connections" class="connections-count">&middot; {{ connections }}+ connections</span>
        </div>

        <div v-if="primaryPosition" class="position-info">
          <div class="company-row">
            <span class="title">{{ primaryPosition.title }}</span>
            <span>&middot;</span>
            <span class="company-name">{{ primaryPosition.companyName }}</span>
            <span v-if="tenure" class="tenure">({{ tenure }})</span>
          </div>
          <div v-if="industry" class="industry">
            <IconIndustry size="10" color="#666" />
            <span>{{ industry }}</span>
          </div>
        </div>

        <div v-if="primaryPosition.description" class="position-description">
          {{ primaryPosition.description }}
        </div>

        <div v-if="skills.length > 0" class="skills-row">
          <span v-for="skill in skills" :key="skill" class="skill-tag">{{ skill }}</span>
        </div>

        <template v-if="summary">
          <AppDivider class="mt-1" />
          <p class="summary">{{ summary }}</p>
        </template>
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
  gap: 6px;
}

.name-row h3 {
  margin: 0;
  font-size: 0.96em;
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

.company-row {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.9em;
}

.title {
  font-weight: 600;
  color: #333;
}

.tenure {
  color: #666;
}

.position-info {
  margin-top: 4px;
}

.industry {
  font-size: 0.8em;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 1px;
}

.position-description {
  margin-top: 4px;
  font-size: 0.8em;
  color: #222;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.location-row {
  font-size: 0.8em;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
}

.connections-count {
  white-space: nowrap;
}

.skills-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;
}

.skill-tag {
  font-size: 0.75em;
  background-color: #f3f3f3;
  color: #666;
  padding: 1px 6px;
  border-radius: 10px;
}

.summary {
  margin: 4px 0 0;
  font-size: 0.8em;
  color: #222;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}
</style>

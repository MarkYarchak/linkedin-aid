<script lang="ts" setup>
import type { Lead } from '@/types/lead/lead';

interface Props {
  lead: Lead;
}
defineProps<Props>();

const getAvatarUrl = (lead: Lead) => {
  if (lead.extra?.profilePictureDisplayImage) {
    const img = lead.extra.profilePictureDisplayImage;
    return img.rootUrl + img.artifacts[0].fileIdentifyingUrlPathSegment;
  }
  return null;
};

function copyLeadInfo() {
  // Placeholder for future implementation
}
</script>

<template>
  <div class="lead-info">
    <div class="header">
      <img v-if="getAvatarUrl(lead)"
           :src="getAvatarUrl(lead)!"
           :alt="`${lead.main?.firstName} ${lead.main?.lastName}`"
           class="avatar" />
      <h3>{{ lead.main?.firstName }} {{ lead.main?.lastName }}</h3>

      <button
        type="button"
        @click="copyLeadInfo"
      >
        Copy info
      </button>
    </div>

    <div class="info-row">
      <strong>Headline:</strong> {{ lead.main?.headline }}
    </div>
    <div class="info-row">
      <strong>Company:</strong> {{ lead.main?.defaultPosition?.companyName || 'N/A' }}
    </div>
    <div class="info-row">
      <strong>Location:</strong> {{ lead.main?.location }}
    </div>

    <div v-if="lead.extra?.skills?.length" class="skills">
      <h4>Top Skills</h4>
      <div class="skill-tags">
        <span v-for="skill in lead.extra.skills.slice(0, 5)" :key="skill.name" class="skill-tag">
          {{ skill.name }}
        </span>
      </div>
    </div>

    <div v-if="lead.insights?.elements?.length" class="insights">
      <h4>Recent Insights</h4>
      <ul>
        <li v-for="insight in lead.insights.elements.slice(0, 3)" :key="insight.insightId">
          {{ insight.activityUnion?.postActivity?.message?.text || 'Activity' }}
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.lead-info {
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  gap: 10px;
}

.header button {
  margin-left: auto;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #eee;
}

.lead-info h3 {
  margin: 0;
  font-size: 1.1em;
  color: #0a66c2;
}

.lead-info h4 {
  margin-top: 15px;
  margin-bottom: 8px;
  font-size: 0.95em;
  border-bottom: 1px solid #eee;
  padding-bottom: 4px;
}

.info-row {
  margin-bottom: 6px;
  font-size: 0.9em;
  line-height: 1.4;
}

.skill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.skill-tag {
  background-color: #f3f6f8;
  color: rgba(0,0,0,0.6);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8em;
}

.insights ul {
  margin: 0;
  padding-left: 20px;
  font-size: 0.85em;
}

.insights li {
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

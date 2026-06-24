<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useCopyLead } from '@/composables/useCopyLead';
import { sanitizeText } from '@/helpers/text-helper';
import { getRelativeTime } from '@/helpers/date-helper';
import AppCopyButton from '@/components/ui/AppCopyButton.vue';
import AppAvatar from '@/components/ui/AppAvatar.vue';
import CopyLeadModal from '@/components/modals/CopyLeadModal.vue';
import type { OptionalDeepReadonly } from '@/types/common';
import type { Lead } from '@/types/lead/lead';

interface Props {
  lead: OptionalDeepReadonly<Lead>;
}
const props = defineProps<Props>();

const { sessionTitle, isTitleCopied, copySessionTitle } = useCopyLead(props.lead);

const showCopyModal = ref(false);

const avatarUrl = computed(() => {
  const lead = props.lead;

  if (lead.extra?.profilePictureDisplayImage) {
    const img = lead.extra.profilePictureDisplayImage;
    return img.rootUrl + img.artifacts[0].fileIdentifyingUrlPathSegment;
  }
  if (lead.searchResult?.profilePictureDisplayImage) {
    const img = lead.searchResult.profilePictureDisplayImage;
    return img.rootUrl + img.artifacts[0].fileIdentifyingUrlPathSegment;
  }
  return null;
});

const getInsightContent = (insight: any) => {
  const activity = insight.activityUnion;
  const date = insight.createdAt ? getRelativeTime(insight.createdAt) : '';

  if (activity.postActivity) {
    const post = activity.postActivity;
    if (post.rootActivity) {
      return {
        type: 'Reshared Post',
        text: post.message?.text || post.rootActivity.message?.text || 'Reshared content',
        url: post.activityUrl,
        date
      };
    }
    return {
      type: 'Post',
      text: post.message?.text || 'Post content',
      url: post.activityUrl,
      date
    };
  } else if (activity.commentActivity) {
    return {
      type: 'Comment',
      text: activity.commentActivity.commentary?.text || 'Comment content',
      url: activity.commentActivity.activityUrl,
      date
    };
  }
  return { type: 'Activity', text: 'Unknown activity', date };
};

function copyLeadInfo() {
  showCopyModal.value = true;
}
</script>

<template>
  <div class="lead-info">
    <div class="header">
      <AppAvatar
        :src="avatarUrl"
        :alt="`${lead.main?.firstName || lead.searchResult?.firstName} ${lead.main?.lastName || lead.searchResult?.lastName}`"
        size="md"
      />
      <div class="header-info">
        <h3>{{ lead.main?.firstName || lead.searchResult?.firstName }} {{ lead.main?.lastName || lead.searchResult?.lastName }}</h3>
        <div v-if="lead.main?.defaultPosition?.title" class="header-position">{{ lead.main.defaultPosition.title }}</div>
        <div v-else-if="lead.searchResult?.currentPositions?.[0]?.title" class="header-position">
          {{ lead.searchResult.currentPositions[0].title }}
        </div>
        <div v-else class="header-position no-role">No current role listed</div>
      </div>
      <div class="header-actions">
        <AppCopyButton
          v-if="sessionTitle"
          :label="isTitleCopied ? 'Copied!' : 'Title'"
          @click="copySessionTitle"
        />
        <AppCopyButton primary @click="copyLeadInfo" />
      </div>
    </div>

    <div class="info-row">
      <strong>Headline:</strong> {{ lead.main?.headline }}
    </div>
    <div class="info-row">
      <strong>Company:</strong> {{ lead.main?.defaultPosition?.companyName || lead.searchResult?.currentPositions?.[0]?.companyName || 'N/A' }}
    </div>
    <div class="info-row">
      <strong>Location:</strong> {{ lead.main?.location || lead.searchResult?.geoRegion }}
    </div>

    <div v-if="lead.main?.summary || lead.searchResult?.summary" class="summary">
      <h4>Summary</h4>
      <p class="summary-text">{{ sanitizeText(lead.main?.summary || lead.searchResult?.summary || '') }}</p>
    </div>

    <div v-if="lead.main?.defaultPosition?.description" class="summary">
      <h4>
        Job Description
        <span v-if="lead.main?.defaultPosition?.location" class="sub-info">
          &middot; {{ lead.main.defaultPosition.location }}
        </span>
      </h4>
      <p class="summary-text">{{ sanitizeText(lead.main.defaultPosition.description) }}</p>
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
      <h4>Recent Activity</h4>
      <ul>
        <li v-for="insight in lead.insights.elements.slice(0, 5)" :key="insight.insightId">
          <div class="insight-header">
            <div class="insight-header-left">
              <span class="insight-type">{{ getInsightContent(insight).type }}</span>
              <span>&middot;</span>
              <span class="insight-date">{{ getInsightContent(insight).date }}</span>
            </div>
            <a v-if="getInsightContent(insight).url"
               :href="getInsightContent(insight).url"
               target="_blank"
               class="insight-link">View</a>
          </div>
          <span class="insight-text">{{ sanitizeText(getInsightContent(insight).text) }}</span>
        </li>
      </ul>
    </div>

    <CopyLeadModal
      :show="showCopyModal"
      :lead="lead"
      @close="showCopyModal = false"
    />
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  flex-shrink: 0;
}

.header-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.header-position {
  font-size: 0.9em;
  color: #333;
  font-weight: 500;
  line-height: 1.2;
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.no-role {
  color: #999;
  font-style: italic;
}

.lead-info h3 {
  margin: 0;
  font-size: 1.15em;
  color: #0a66c2;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

.sub-info {
  font-size: 0.85em;
  font-weight: normal;
  color: #666;
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

.summary-text {
  margin: 4px 0 0 0;
  font-size: 0.85em;
  line-height: 1.4;
  color: #555;
  white-space: pre-wrap;
  overflow: hidden;
}

.insights ul {
  list-style-type: none;
  margin: 0;
  padding-left: 0;
  font-size: 0.85em;
}

.insights li {
  margin-bottom: 8px;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 8px;
  background-color: #fafafa;
}

.insight-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.insight-header-left {
  display: flex;
  align-items: center;
  gap: 4px;
}

.insight-type {
  font-size: 0.8em;
  font-weight: bold;
  text-transform: uppercase;
  color: #666;
}

.insight-date {
  font-size: 0.8em;
  color: #606060;
}

.insight-link {
  font-size: 0.8em;
  color: #0a66c2;
  text-decoration: none;
}

.insight-link:hover {
  text-decoration: underline;
}

.insight-text {
  display: -webkit-box;
  -webkit-line-clamp: 7;
  -webkit-box-orient: vertical;
  overflow: hidden;
  white-space: pre-wrap;
}
</style>

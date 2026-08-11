<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useDataStore } from '@/store/data-store';
import { getEffectivePositions, getLeadAvatarUrl } from '@/helpers/lead-helper';
import AppAvatar from '@/components/ui/AppAvatar.vue';
import AppCheckbox from '@/components/ui/AppCheckbox.vue';
import IconLocation from '@/components/icons/IconLocation.vue';
import IconIndustry from '@/components/icons/IconIndustry.vue';
import AppDivider from '@/components/ui/AppDivider.vue';
import type { OptionalDeepReadonly } from '@/types/common';
import type { Lead } from '@/types/lead/lead';

interface Props {
  lead: OptionalDeepReadonly<Lead>;
}
const props = defineProps<Props>();

const selected = defineModel<boolean>('selected', { default: false });

const { leadPositionRelationsMap, companiesMap } = useDataStore();

const avatarUrl = computed(() => getLeadAvatarUrl(props.lead));

const isSaved = computed(() => {
  return props.lead.searchResult?.saved || props.lead.main?.savedLead || false;
});

const isPremium = computed(() => {
  return props.lead.searchResult?.premium || false;
});

const summary = computed(() => {
  return props.lead.searchResult?.summary || props.lead.main?.summary || '';
});

const currentPositions = computed(() => {
  const mainPositions = props.lead.main?.positions.filter(p => p.current);
  if (mainPositions?.length) {
    return getEffectivePositions(props.lead.entityUrn, mainPositions as any[], leadPositionRelationsMap.value, companiesMap.value);
  }
  return props.lead.searchResult?.currentPositions || [];
});

const primaryPosition = computed(() => {
  const current = currentPositions.value;
  const manual = current.find(p => (p as any).isManuallyLinked);
  return manual || current[0];
});

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

const isExpanded = ref(false);

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

const secondDegreeBadge = computed(() => {
  return props.lead.searchResult?.spotlightBadges?.find(b => b.id === 'SECOND_DEGREE_CONNECTION');
});
</script>

<template>
  <div
    class="lead-search-preview"
    :class="{ expanded: isExpanded, selected: selected }"
    @click="toggleExpand"
  >
    <div class="content">
      <div class="selection-area">
        <AppCheckbox v-model="selected" @click.stop />
      </div>
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
        </div>

        <div v-if="primaryPosition" class="position-info">
          <div class="company-row">
            <span class="title">{{ primaryPosition.title }}</span>
            <span>&middot;</span>
            <span class="company-name" :class="{ 'manually-linked': (primaryPosition as any).isManuallyLinked }">
              <v-icon v-if="(primaryPosition as any).isManuallyLinked" icon="mdi-link" size="12" class="mr-1" />
              {{ primaryPosition.companyName }}
            </span>
            <span v-if="tenure" class="tenure">({{ tenure }})</span>
          </div>
          <div v-if="industry" class="industry">
            <IconIndustry size="10" color="#666" />
            <span>{{ industry }}</span>
          </div>
        </div>

        <template v-if="primaryPosition?.description">
          <pre v-if="isExpanded" class="position-description">{{ primaryPosition.description }}</pre>
          <div v-else class="position-description">
            {{ primaryPosition.description }}
          </div>
        </template>

        <template v-if="summary">
          <AppDivider class="mt-1" />
          <div v-if="isExpanded" class="about-section">
            <h4 class="about-header">About</h4>
            <pre class="summary">{{ summary }}</pre>
          </div>
          <p v-else class="summary">{{ summary }}</p>
        </template>
      </div>
      <slot name="actions" :lead="lead" />
    </div>
  </div>
</template>

<style scoped>
.lead-search-preview {
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #ffffff;
  transition: all 0.2s;
  cursor: pointer;
}

.lead-search-preview:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.lead-search-preview.selected {
  border-color: #0a66c2;
  background-color: #f0f7ff;
}

.selection-area {
  padding-top: 4px;
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

.expanded .name-row h3 {
  white-space: normal;
  overflow: visible;
  text-overflow: clip;
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

.custom-company-badge {
  font-size: 10px;
  color: white;
  background-color: #0073b1;
  padding: 1px 4px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
}

.company-name.manually-linked {
  color: #0a66c2;
  font-weight: 500;
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

.expanded .position-description {
  display: block;
  overflow: visible;
}

.location-row {
  font-size: 0.8em;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
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

pre.summary,
pre.position-description {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: inherit;
}

.about-header {
  margin: 8px 0 4px;
  font-size: 0.85em;
  font-weight: 600;
  color: #333;
}

.expanded .summary {
  display: block;
  overflow: visible;
}
</style>

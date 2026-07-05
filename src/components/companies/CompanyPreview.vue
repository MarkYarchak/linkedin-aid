<script lang="ts" setup>
import { computed, ref, onMounted, nextTick, watch } from 'vue';
import { sanitizeText } from '@/helpers/text-helper';
import AppAvatar from '@/components/ui/AppAvatar.vue';
import AppCheckbox from '@/components/ui/AppCheckbox.vue';
import CompanyPreviewDense from './CompanyPreviewDense.vue';
import type { OptionalDeepReadonly } from '@/types/common';
import type { Company } from '@/types/company/company';

interface Props {
  company: OptionalDeepReadonly<Company>;
  selectable?: boolean;
  dense?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  selectable: false,
  dense: false,
});

const selected = defineModel<boolean>('selected', { default: false });

const isExpanded = ref(false);
const isTruncated = ref(false);
const descriptionRef = ref<HTMLElement | null>(null);

const isCurrentlyDense = computed(() => props.dense && !isExpanded.value);

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

const checkTruncation = () => {
  if (descriptionRef.value) {
    const { scrollHeight, clientHeight } = descriptionRef.value;
    isTruncated.value = scrollHeight > clientHeight;
  }
};

onMounted(() => {
  if (!isCurrentlyDense.value) {
    checkTruncation();
  }
});

watch(isCurrentlyDense, async (val) => {
  if (!val) {
    await nextTick();
    checkTruncation();
  }
});

watch(() => props.company.main?.description, async () => {
  if (!isCurrentlyDense.value) {
    await nextTick();
    checkTruncation();
  }
});

const logoUrl = computed(() => {
  const company = props.company;
  if (company.main?.companyPictureDisplayImage) {
    const img = company.main.companyPictureDisplayImage;
    if (img.artifacts && img.artifacts.length > 0) {
      return img.rootUrl + img.artifacts[0].fileIdentifyingUrlPathSegment;
    }
  }
  return null;
});

const revenueRangeString = computed(() => {
  if (props.company.main?.revenueRange) {
    const { estimatedMinRevenue, estimatedMaxRevenue } = props.company.main.revenueRange;
    return `${estimatedMinRevenue.currencyCode} ${estimatedMinRevenue.amount} ${estimatedMinRevenue.unit.toLowerCase()} - ${estimatedMaxRevenue.currencyCode} ${estimatedMaxRevenue.amount} ${estimatedMaxRevenue.unit.toLowerCase()}`;
  }
  return 'N/A';
});
</script>

<template>
  <div
    class="company-info"
    :class="{ selected: selected, 'is-dense': isCurrentlyDense }"
    @click="toggleExpand"
  >
    <div v-if="isCurrentlyDense" class="dense-view">
      <div v-if="selectable" class="selection-area">
        <AppCheckbox v-model="selected" @click.stop />
      </div>
      <CompanyPreviewDense :company="company" />
    </div>

    <template v-else>
      <div class="header">
        <div v-if="selectable" class="selection-area">
          <AppCheckbox v-model="selected" @click.stop />
        </div>
        <AppAvatar
          :src="logoUrl"
          :alt="company.main?.name"
          shape="square"
          size="md"
        />
        <h3>{{ company.main?.name }}</h3>
      </div>

      <div class="info-row">
        <strong>Industry:</strong> {{ company.main?.industry || 'N/A' }}
      </div>
      <div class="info-row">
        <strong>Location:</strong> {{ company.main?.location || 'N/A' }}
      </div>
      <div class="info-row" v-if="company.main?.website">
        <strong>Website:</strong> <a :href="company.main.website" target="_blank" @click.stop>{{ company.main.website }}</a>
      </div>
      <div class="info-row" v-if="company.extra?.employeeDisplayCount">
        <strong>Headcount:</strong> {{ company.extra.employeeDisplayCount }} employees
      </div>
      <div class="info-row" v-if="company.main?.revenueRange">
        <strong>Revenue:</strong> {{ revenueRangeString }}
      </div>
      <div class="info-row" v-if="company.main?.description">
        <strong>Description:</strong>
        <p
          ref="descriptionRef"
          :class="['description', { 'is-clamped': !isExpanded }]"
        >
          {{ sanitizeText(company.main.description) }}
        </p>
        <button
          v-if="isTruncated || isExpanded"
          class="toggle-button"
          @click.stop="toggleExpand"
        >
          {{ isExpanded ? 'Show less' : 'Show more' }}
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.company-info {
  padding: 4px 4px 12px;
  transition: background-color 0.2s;
  border-radius: 8px;
  cursor: pointer;
}

.company-info:hover {
  background-color: #f9f9f9;
}

.company-info.selected {
  background-color: #f0f7ff;
}

.company-info.selected:hover {
  background-color: #e1efff;
}

.company-info.is-dense {
  padding: 4px;
}

.dense-view {
  display: flex;
  align-items: center;
  gap: 10px;
}

.selection-area {
  display: flex;
  align-items: center;
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

.company-info h3 {
  margin: 0;
  font-size: 1.1em;
  color: #0a66c2;
}

.company-info h4 {
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

.description {
  margin: 4px 0 0 0;
  overflow: hidden;
  color: #666;
  white-space: pre-wrap;
}

.description.is-clamped {
  display: -webkit-box;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
}

.toggle-button {
  background: none;
  border: none;
  color: #0a66c2;
  padding: 0;
  font-weight: 600;
  cursor: pointer;
  margin-top: 4px;
}

.toggle-button:hover {
  text-decoration: underline;
}
</style>

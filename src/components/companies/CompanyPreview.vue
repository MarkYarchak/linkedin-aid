<script lang="ts" setup>
import { computed, ref, onMounted, nextTick, watch } from 'vue';
import { useDataStore } from '@/store/data-store';
import { sanitizeText } from '@/helpers/text-helper';
import { getDisplayImageUrl } from '@/helpers/image-helper';
import { getEntityExpirationInfo } from '@/helpers/date-helper';
import AppAvatar from '@/components/ui/AppAvatar.vue';
import AppCheckbox from '@/components/ui/AppCheckbox.vue';
import IconChevronDown from '@/components/icons/IconChevronDown.vue';
import IconChevronUp from '@/components/icons/IconChevronUp.vue';
import CompanyPreviewDense from './CompanyPreviewDense.vue';
import type { OptionalDeepReadonly } from '@/types/common';
import type { Company } from '@/types/company/company';
import type { DisplayImage } from '@/types/linkedin-common';

interface Props {
  company: OptionalDeepReadonly<Company>;
  selectable?: boolean;
  dense?: boolean;
  accordion?: boolean;
  showExpiration?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  selectable: false,
  dense: false,
  accordion: false,
  showExpiration: false,
});

const selected = defineModel<boolean>('selected', { default: false });

const isAccordion = computed(() => props.accordion);
const isAccordionExpanded = ref(false);
const isDescriptionExpanded = ref(false);
const isTruncated = ref(false);
const descriptionRef = ref<HTMLElement | null>(null);

const isCurrentlyDense = computed(() => {
  if (isAccordion.value) {
    return !isAccordionExpanded.value;
  }
  return props.dense;
});

const toggleAccordion = () => {
  if (isAccordion.value) {
    isAccordionExpanded.value = !isAccordionExpanded.value;
  }
};

const toggleDescriptionExpand = () => {
  isDescriptionExpanded.value = !isDescriptionExpanded.value;
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
  return getDisplayImageUrl(props.company.main?.companyPictureDisplayImage as DisplayImage);
});

const { capturedEntitiesTTL } = useDataStore();
const expirationInfo = computed(() => getEntityExpirationInfo(props.company.updatedAt, capturedEntitiesTTL.value));

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
    :class="{
      selected: selected,
      'is-dense': isCurrentlyDense,
      'is-accordion': isAccordion,
      'is-expanded': isAccordion && isAccordionExpanded
    }"
  >
    <div
      v-if="isCurrentlyDense"
      class="dense-view"
      :class="{ 'is-clickable': isAccordion }"
      @click="isAccordion ? toggleAccordion() : undefined"
    >
      <div v-if="selectable" class="selection-area" @click.stop>
        <AppCheckbox v-model="selected" @click.stop />
      </div>
      <CompanyPreviewDense :company="company" :show-expiration="showExpiration">
        <template #actions>
          <div @click.stop>
            <slot name="actions" :company="company" />
          </div>
        </template>
      </CompanyPreviewDense>
      <div v-if="isAccordion" class="accordion-toggle" title="Expand">
        <IconChevronDown :size="16" color="#666" />
      </div>
    </div>

    <template v-else>
      <div
        class="header"
        :class="{ 'is-clickable': isAccordion }"
        @click="isAccordion ? toggleAccordion() : undefined"
      >
        <div v-if="selectable" class="selection-area" @click.stop>
          <AppCheckbox v-model="selected" @click.stop />
        </div>
        <AppAvatar
          :src="logoUrl"
          :alt="company.main?.name"
          shape="square"
          size="md"
        />
        <h3 class="company-name">{{ company.main?.name }}</h3>

        <div v-if="showExpiration" class="expiration ml-auto">
          {{ expirationInfo }}
        </div>
        <div v-if="$slots.actions" class="actions-area" :class="{ 'ml-auto': !showExpiration }" @click.stop>
          <slot name="actions" :company="company" />
        </div>
        <div v-if="isAccordion" class="accordion-toggle" :class="{ 'ml-auto': !showExpiration && !$slots.actions }" title="Collapse">
          <IconChevronUp :size="16" color="#666" />
        </div>
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
          :class="['description', { 'is-clamped': !isDescriptionExpanded }]"
        >
          {{ sanitizeText(company.main.description) }}
        </p>
        <button
          v-if="isTruncated || isDescriptionExpanded"
          class="toggle-button"
          @click.stop="toggleDescriptionExpand"
        >
          {{ isDescriptionExpanded ? 'Show less' : 'Show more' }}
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.company-info {
  padding: 4px 4px 12px;
  transition: background-color 0.2s;
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
  padding: 8px;
  border: 1px solid #e5e7eb;
}

.dense-view {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.dense-view.is-clickable,
.header.is-clickable {
  cursor: pointer;
}

.accordion-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  padding: 2px;
  border-radius: 4px;
  flex-shrink: 0;
  transition: color 0.2s, background-color 0.2s;
}

.dense-view:hover .accordion-toggle,
.header:hover .accordion-toggle {
  color: #0a66c2;
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

.company-name {
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

.expiration {
  color: #94a3b8;
  font-weight: 500;
  font-size: 0.75rem;
}

.ml-auto {
  margin-left: auto;
}

.actions-area {
  display: flex;
  align-items: center;
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

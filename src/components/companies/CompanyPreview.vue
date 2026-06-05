<script lang="ts" setup>
import { computed } from 'vue';
import { sanitizeText } from '@/helpers/text-helper';
import AppAvatar from '@/components/ui/AppAvatar.vue';
import type { Company } from '@/types/company/company';

interface Props {
  company: Company;
}
const props = defineProps<Props>();

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
  <div class="company-info">
    <div class="header">
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
      <strong>Website:</strong> <a :href="company.main.website" target="_blank">{{ company.main.website }}</a>
    </div>
    <div class="info-row" v-if="company.extra?.employeeDisplayCount">
      <strong>Headcount:</strong> {{ company.extra.employeeDisplayCount }} employees
    </div>
    <div class="info-row" v-if="company.main?.revenueRange">
      <strong>Revenue:</strong> {{ revenueRangeString }}
    </div>
    <div class="info-row" v-if="company.main?.description">
      <strong>Description:</strong>
      <p class="description">{{ sanitizeText(company.main.description) }}</p>
    </div>
  </div>
</template>

<style scoped>
.company-info {
  padding: 4px 4px 12px;
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
</style>

<script lang="ts" setup>
import { computed } from 'vue';
import type { Company } from '@/types/company/company';

interface Props {
  company: Company;
}
const props = defineProps<Props>();

const getLogoUrl = (company: Company) => {
  if (company.main?.companyPictureDisplayImage) {
    const img = company.main.companyPictureDisplayImage;
    if (img.artifacts && img.artifacts.length > 0) {
      return img.rootUrl + img.artifacts[0].fileIdentifyingUrlPathSegment;
    }
  }
  return null;
};

const revenueRangeString = computed(() => {
  if (props.company.main?.revenueRange) {
    const { estimatedMinRevenue, estimatedMaxRevenue } = props.company.main.revenueRange;
    return `${estimatedMinRevenue.currencyCode} ${estimatedMinRevenue.amount} ${estimatedMinRevenue.unit.toLowerCase()} - ${estimatedMaxRevenue.currencyCode} ${estimatedMaxRevenue.amount} ${estimatedMaxRevenue.unit.toLowerCase()}`;
  }
  return 'N/A';
});

function copyCompanyInfo() {
  // Placeholder for future implementation
}
</script>

<template>
  <div class="company-info">
    <div class="header">
      <img v-if="getLogoUrl(company)"
           :src="getLogoUrl(company)!"
           :alt="company.main?.name"
           class="logo" />
      <h3>{{ company.main?.name }}</h3>

      <button
        type="button"
        @click="copyCompanyInfo"
      >
        Copy info
      </button>
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
      <p class="description">{{ company.main.description }}</p>
    </div>
  </div>
</template>

<style scoped>
.company-info {
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

.logo {
  width: 48px;
  height: 48px;
  border-radius: 4px;
  object-fit: cover;
  border: 1px solid #eee;
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
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: #666;
}
</style>

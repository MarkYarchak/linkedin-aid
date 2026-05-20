<script lang="ts" setup>
import { computed } from 'vue';
import LeadPreview from '@/components/LeadPreview.vue';
import LeadSearchPage from '@/components/LeadSearchPage.vue';
import CompanyPreview from '@/components/CompanyPreview.vue';
import { useLeads } from '@/composables/useLeads';
import { useCompanies } from '@/composables/useCompanies';
import {
  isSalesNavigatorLeadUrl,
  isSalesNavigatorCompanyUrl,
  isSalesNavigatorPeopleSearchUrl,
} from '@/helpers/url-helpers';

interface Props {
  tabUrl: string;
}
const props = defineProps<Props>();

const { leads, currentUrlLead } = useLeads(props.tabUrl);
const { currentUrlCompany } = useCompanies(props.tabUrl);

const isLeadPage = computed(() => isSalesNavigatorLeadUrl(props.tabUrl));
const isCompanyPage = computed(() => isSalesNavigatorCompanyUrl(props.tabUrl));
const isPeopleSearchPage = computed(() => isSalesNavigatorPeopleSearchUrl(props.tabUrl));
</script>

<template>
  <div class="captured-data-view">
    <template v-if="isLeadPage">
      <LeadPreview v-if="currentUrlLead" :lead="currentUrlLead" />
      <div v-else class="no-leads">
        No leads collected yet. Navigate to a Sales Navigator lead profile to collect data.
      </div>
    </template>

    <template v-else-if="isPeopleSearchPage">
      <LeadSearchPage :leads="leads" :tab-url="props.tabUrl" />
    </template>

    <template v-else-if="isCompanyPage">
      <CompanyPreview v-if="currentUrlCompany" :company="currentUrlCompany" />
      <div v-else class="no-leads">
        No company collected yet. Navigate to a Sales Navigator company profile to collect data.
      </div>
    </template>

    <template v-else>
      <div class="no-leads">
        Navigate to a Sales Navigator profile to collect data.
      </div>
    </template>
  </div>
</template>

<style scoped>
.captured-data-view {
  display: flex;
  flex-direction: column;
  padding: 10px;
}

.no-leads {
  padding: 20px;
  text-align: center;
  color: #666;
  font-size: 0.9em;
}
</style>

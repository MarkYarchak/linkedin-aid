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
  isSalesNavigatorCompanySearchUrl,
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
const isCompanySearchPage = computed(() => isSalesNavigatorCompanySearchUrl(props.tabUrl));
</script>

<template>
  <div class="captured-data-view">
    <div class="tab-content">
      <template v-if="isLeadPage">
        <div v-if="currentUrlLead" class="leads-list">
          <LeadPreview :lead="currentUrlLead" />
        </div>
        <div v-else class="no-leads">
          No leads collected yet. Navigate to a Sales Navigator lead profile to collect data.
        </div>
      </template>

      <template v-else-if="isPeopleSearchPage">
        <LeadSearchPage :leads="leads" :tab-url="props.tabUrl" />
      </template>

      <template v-else-if="isCompanyPage || isCompanySearchPage">
        <div v-if="currentUrlCompany" class="leads-list">
          <CompanyPreview :company="currentUrlCompany" />
        </div>
        <div v-else class="no-leads">
          No company collected yet. {{ isCompanySearchPage ? 'Collect companies from search results.' : 'Navigate to a Sales Navigator company profile to collect data.' }}
        </div>
      </template>

      <template v-else>
        <div class="no-leads">
          Navigate to a Sales Navigator profile to collect data.
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.captured-data-view {
  display: flex;
  flex-direction: column;
}

.tab-content {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.leads-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.no-leads {
  padding: 20px;
  text-align: center;
  color: #666;
  font-size: 0.9em;
}
</style>

<script lang="ts" setup>
import { computed } from 'vue';
import LeadPreview from '@/components/LeadPreview.vue';
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

const { sortedLeads } = useLeads(props.tabUrl);
const { sortedCompanies } = useCompanies(props.tabUrl);

const isLeadPage = computed(() => isSalesNavigatorLeadUrl(props.tabUrl));
const isCompanyPage = computed(() => isSalesNavigatorCompanyUrl(props.tabUrl));
const isPeopleSearchPage = computed(() => isSalesNavigatorPeopleSearchUrl(props.tabUrl));
const isCompanySearchPage = computed(() => isSalesNavigatorCompanySearchUrl(props.tabUrl));
</script>

<template>
  <div class="scrapper-view">
    <div class="tab-content">
      <template v-if="isLeadPage || isPeopleSearchPage">
        <div v-if="sortedLeads.length" class="leads-list">
          <LeadPreview v-for="lead in sortedLeads" :key="lead.entityUrn" :lead="lead" />
        </div>
        <div v-else class="no-leads">
          No leads captured yet. {{ isPeopleSearchPage ? 'Capture leads from search results.' : 'Navigate to a Sales Navigator lead profile to capture data.' }}
        </div>
      </template>

      <template v-else-if="isCompanyPage || isCompanySearchPage">
        <div v-if="sortedCompanies.length" class="leads-list">
          <CompanyPreview v-for="company in sortedCompanies" :key="company.entityUrn" :company="company" />
        </div>
        <div v-else class="no-leads">
          No company captured yet. {{ isCompanySearchPage ? 'Capture companies from search results.' : 'Navigate to a Sales Navigator company profile to capture data.' }}
        </div>
      </template>

      <template v-else>
        <div class="no-leads">
          Navigate to a Sales Navigator profile to capture data.
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.scrapper-view {
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
  gap: 15px;
}

.no-leads {
  padding: 20px;
  text-align: center;
  color: #666;
  font-size: 0.9em;
}
</style>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import ScrapeActions from '@/components/ScrapeActions.vue';
import LeadPreview from '@/components/LeadPreview.vue';
import CompanyPreview from '@/components/CompanyPreview.vue';
import { useLeads } from '@/composables/useLeads';
import { useCompanies } from '@/composables/useCompanies';
import { isSalesNavigatorLeadUrl, isSalesNavigatorCompanyUrl } from '@/helpers/url-helpers';

interface Props {
  tabUrl: string;
}
const props = defineProps<Props>();

const { sortedLeads } = useLeads(props.tabUrl);
const { sortedCompanies } = useCompanies(props.tabUrl);

const activeTab = ref<'preview' | 'scrape'>('preview');

const isLeadPage = computed(() => isSalesNavigatorLeadUrl(props.tabUrl));
const isCompanyPage = computed(() => isSalesNavigatorCompanyUrl(props.tabUrl));
const isShowTabs = computed(() => isLeadPage.value || isCompanyPage.value);
</script>

<template>
  <div class="scrapper-view">
    <div v-if="isShowTabs" class="tabs">
      <button
        :class="{ active: activeTab === 'preview' }"
        @click="activeTab = 'preview'"
      >
        View {{ isLeadPage ? 'Lead' : 'Company' }}
      </button>
      <button
        :class="{ active: activeTab === 'scrape' }"
        @click="activeTab = 'scrape'"
      >
        Scrape
      </button>
    </div>

    <div v-if="!isShowTabs || activeTab === 'preview'" class="tab-content">
      <template v-if="isLeadPage">
        <div v-if="sortedLeads.length" class="leads-list">
          <LeadPreview v-for="lead in sortedLeads" :key="lead.entityUrn" :lead="lead" />
        </div>
        <div v-else class="no-leads">
          No leads captured yet. Navigate to a Sales Navigator lead profile to capture data.
        </div>
      </template>

      <template v-else-if="isCompanyPage">
        <div v-if="sortedCompanies.length" class="leads-list">
          <CompanyPreview v-for="company in sortedCompanies" :key="company.entityUrn" :company="company" />
        </div>
        <div v-else class="no-leads">
          No company captured yet. Navigate to a Sales Navigator company profile to capture data.
        </div>
      </template>

      <template v-else>
        <div class="no-leads">
          Navigate to a Sales Navigator profile to capture data.
        </div>
      </template>
    </div>

    <div v-if="isShowTabs && activeTab === 'scrape'" class="tab-content">
      <ScrapeActions :tab-url="tabUrl" />
    </div>
  </div>
</template>

<style scoped>
.scrapper-view {
  min-width: 320px;
  max-height: 500px;
  display: flex;
  flex-direction: column;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #ddd;
  background: #f5f5f5;
}

.tabs button {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 0;
  background: none;
  cursor: pointer;
  font-weight: 600;
  color: #666;
  outline: none;
}

.tabs button.active {
  color: #0073b1;
  border-bottom: 2px solid #0073b1;
  background: white;
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

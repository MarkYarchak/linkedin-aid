<script lang="ts" setup>
import { computed } from 'vue';
import LeadPage from '@/components/pages/LeadPage.vue';
import LeadSearchPage from '@/components/pages/LeadSearchPage.vue';
import CompanyPage from '@/components/pages/CompanyPage.vue';
import {
  isSalesNavigatorLeadUrl,
  isSalesNavigatorCompanyUrl,
  isSalesNavigatorPeopleSearchUrl,
} from '@/helpers/url-helpers';

interface Props {
  tabUrl: string;
}
const props = defineProps<Props>();

const isLeadPage = computed(() => isSalesNavigatorLeadUrl(props.tabUrl));
const isCompanyPage = computed(() => isSalesNavigatorCompanyUrl(props.tabUrl));
const isPeopleSearchPage = computed(() => isSalesNavigatorPeopleSearchUrl(props.tabUrl));
</script>

<template>
  <div class="captured-data-view">
    <LeadPage
      v-if="isLeadPage"
      :tab-url="props.tabUrl"
    />

    <LeadSearchPage
      v-else-if="isPeopleSearchPage"
      :tab-url="props.tabUrl"
    />

    <CompanyPage
      v-else-if="isCompanyPage"
      :tab-url="props.tabUrl"
    />

    <div v-else class="no-data">
      Navigate to a Sales Navigator profile to collect data.
    </div>
  </div>
</template>

<style scoped>
.captured-data-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}
</style>

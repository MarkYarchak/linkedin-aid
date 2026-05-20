<script setup lang="ts">
import { useCompanies } from '@/composables/useCompanies';
import CompanyPreview from '@/components/companies/CompanyPreview.vue';

interface Props {
  tabUrl: string;
}
const props = defineProps<Props>();

const { currentUrlCompany } = useCompanies(props.tabUrl);
</script>

<template>
  <div class="company-page">
    <CompanyPreview v-if="currentUrlCompany" :company="currentUrlCompany" />
    <div v-else class="no-data">
      No company collected yet. Navigate to a Sales Navigator company profile to collect data.
    </div>
  </div>
</template>

<style scoped>
.company-page {
  padding: 10px;
}
</style>

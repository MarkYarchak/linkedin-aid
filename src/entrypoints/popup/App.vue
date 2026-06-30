<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { browser } from 'wxt/browser';
import { useDataStore } from '@/store/data-store';
import CapturedDataView from '@/components/views/CapturedDataView.vue';
import LegendView from '@/components/views/LegendView.vue';

const tabUrl = ref('');
const isLinkedIn = ref(false);
const isLoading = ref(true);

const { isLoaded, loadData } = useDataStore();
loadData();

onMounted(async () => {
  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (tab?.url) {
      tabUrl.value = tab.url;
      isLinkedIn.value = tab.url.includes('linkedin.com');
    }
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div v-if="isLoading || !isLoaded" class="loading">
    Loading...
  </div>
  <CapturedDataView
    v-else-if="isLinkedIn"
    :tab-url="tabUrl"
  />
  <LegendView v-else />
</template>

<style scoped>
.loading {
  padding: 20px;
  text-align: center;
}
</style>

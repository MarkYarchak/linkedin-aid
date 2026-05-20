<script lang="ts" setup>
import CapturedDataView from '@/components/views/CapturedDataView.vue';
import { onMounted, ref } from 'vue';
import { browser } from 'wxt/browser';

const tabUrl = ref('');
const isLinkedIn = ref(false);
const isLoading = ref(true);

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
  <div v-if="isLoading" class="loading">
    Loading...
  </div>
  <CapturedDataView
    v-else-if="isLinkedIn"
    :tab-url="tabUrl"
  />
  <div v-else class="no-data">
    This extension only works on LinkedIn.
  </div>
</template>

<style scoped>
.loading {
  padding: 20px;
  text-align: center;
}
</style>

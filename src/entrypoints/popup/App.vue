<script lang="ts" setup>
import ScrapperView from '@/components/ScrapperView.vue';
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
  <div v-else-if="isLinkedIn">
    <ScrapperView :tab-url="tabUrl" />
  </div>
  <div v-else class="not-linkedin">
    <p>This extension only works on LinkedIn.</p>
  </div>
</template>

<style scoped>
.not-linkedin {
  padding: 20px;
  text-align: center;
  min-width: 200px;
}

.loading {
  padding: 20px;
  text-align: center;
}

.not-linkedin p {
  margin-bottom: 10px;
}
</style>

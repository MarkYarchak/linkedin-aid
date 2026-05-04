<script lang="ts" setup>
import { computed } from 'vue';
import { browser } from 'wxt/browser';
import { MessageType } from '@/constants/message-types';
import { isSalesNavigatorLeadUrl as isLeadUrl, isSalesNavigatorCompanyUrl as isCompanyUrl } from '@/helpers/url-helpers';

interface Props {
  tabUrl: string;
}
const props = defineProps<Props>();

const isSalesNavigatorLeadUrl = computed(() => isLeadUrl(props.tabUrl));
const isSalesNavigatorCompanyUrl = computed(() => isCompanyUrl(props.tabUrl));

async function sendToActiveTab(type: MessageType, data?: any) {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });

  if (tab?.id) {
    await browser.tabs.sendMessage(tab.id, { type, data });
  }
}

function onLeadScrape() {
  sendToActiveTab(MessageType.SCRAPE_LEAD);
}

function onCompanyScrape() {
  sendToActiveTab(MessageType.SCRAPE_COMPANY);
}
</script>

<template>
  <div class="scraper-actions">
    <div v-if="isSalesNavigatorLeadUrl">
      <button type="button" @click="onLeadScrape">
        Scrape lead
      </button>
    </div>

    <div v-if="isSalesNavigatorCompanyUrl">
      <button type="button" @click="onCompanyScrape">
        Scrape company
      </button>
    </div>
  </div>
</template>

<style scoped>
.scraper-actions {
  padding: 1em;
}
</style>

<script lang="ts" setup>
import { browser } from 'wxt/browser';
import { MessageType } from '@/constants/message-types';

async function sendToActiveTab(type: MessageType, data?: any) {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });

  if (tab?.id) {
    await browser.tabs.sendMessage(tab.id, { type, data });
  }
}

function onLeadScrape() {
  sendToActiveTab(MessageType.SCRAPE_LEAD);
}

function onAccountScrape() {
  sendToActiveTab(MessageType.SCRAPE_ACCOUNT);
}
</script>

<template>
  <div class="card">
    <button type="button" @click="onLeadScrape">
      Scrape lead
    </button>

    <button type="button" @click="onAccountScrape">
      Scrape account
    </button>
  </div>
</template>

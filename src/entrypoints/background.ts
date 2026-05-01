import { browser } from 'wxt/browser';
import { MessageType } from '@/constants/message-types';
import { isSalesNavigatorCompanyUrl, isSalesNavigatorLeadUrl } from '@/helpers/url-helpers';
import type { Lead } from '@/types/lead';

export default defineBackground(() => {
  const lastTabUrls: Record<number, string> = {};

  browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.url) {
      lastTabUrls[tabId] = tab.url;
    }

    if (changeInfo.status !== 'loading') return;
    if (!tab.url?.includes('linkedin.com/sales')) return;

    if (isSalesNavigatorLeadUrl(tab.url)) {
      browser.scripting.executeScript({
        target: { tabId },
        world: 'MAIN',
        injectImmediately: true,
        files: ['/handle-lead-profile.js'],
      });
    }

    if (isSalesNavigatorCompanyUrl(tab.url)) {
      browser.scripting.executeScript({
        target: { tabId },
        world: 'MAIN',
        injectImmediately: true,
        files: ['/handle-account-profile.js'],
      });
    }
  });

  async function updateLeadInStorage(urn: string, update: Partial<Lead>) {
    const storage = await browser.storage.local.get('capturedLeads');
    const leads: Record<string, Lead> = (storage.capturedLeads || {}) as Record<string, Lead>;

    const existingLead = leads[urn] || { entityUrn: urn, updatedAt: Date.now() };
    leads[urn] = {
      ...existingLead,
      ...update,
      updatedAt: Date.now(),
    };

    await browser.storage.local.set({ capturedLeads: leads });
  }

  let lastActiveUrn: string | null = null;

  browser.runtime.onMessage.addListener((msg, sender) => {
    const tabUrl = sender.tab?.id ? lastTabUrls[sender.tab.id] : undefined;

    if (msg.type === MessageType.LEAD_CAPTURED) {
      console.log('Lead captured in background', msg.data);
      const urn = msg.data.entityUrn;
      if (urn) {
        lastActiveUrn = urn;
        updateLeadInStorage(urn, { main: msg.data, profileUrl: tabUrl });
      }
    }

    if (msg.type === MessageType.LEAD_EXTRA_CAPTURED) {
      console.log('Lead extra captured in background', msg.data);
      const urn = msg.data.entityUrn;
      if (urn) {
        lastActiveUrn = urn;
        updateLeadInStorage(urn, { extra: msg.data, profileUrl: tabUrl });
      }
    }

    if (msg.type === MessageType.LEAD_INSIGHTS_CAPTURED) {
      console.log('Lead insights captured in background', msg.data);
      if (lastActiveUrn) {
        updateLeadInStorage(lastActiveUrn, { insights: msg.data });
      }
    }

    if (msg.type === MessageType.SCRAPE_LEAD_RESULT) {
      console.log(MessageType.SCRAPE_LEAD_RESULT, msg.data);
    }

    if (msg.type === MessageType.SCRAPE_ACCOUNT_RESULT) {
      console.log(MessageType.SCRAPE_ACCOUNT_RESULT, msg.data);
    }
  });
});

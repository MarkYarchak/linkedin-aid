import { browser } from 'wxt/browser';
import { MessageType } from '@/constants/message-types';
import { BASE_URL } from '@/constants/urls';
import type { Lead } from '@/types/lead/lead';

export class LeadService {
  private lastTabUrls: Record<number, string> = {};

  setTabUrl(tabId: number, url: string) {
    this.lastTabUrls[tabId] = url;
  }

  async updateLeadInStorage(urn: string, update: Partial<Lead>) {
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

  handleMessage(msg: any, sender: any) {
    const tabUrl = sender.tab?.id ? this.lastTabUrls[sender.tab.id] : undefined;

    if (msg.type === MessageType.LEAD_CAPTURED) {
      const urn = msg.data.entityUrn;
      if (urn) {
        this.updateLeadInStorage(urn, { main: msg.data, profileUrl: tabUrl });
      }
    }

    if (msg.type === MessageType.LEAD_EXTRA_CAPTURED) {
      const urn = msg.data.entityUrn;
      if (urn) {
        this.updateLeadInStorage(urn, { extra: msg.data, profileUrl: tabUrl });
      }
    }

    if (msg.type === MessageType.LEAD_INSIGHTS_CAPTURED) {
      const urn = new URL(msg.url, BASE_URL).searchParams.get('profile');
      if (urn) {
        this.updateLeadInStorage(urn, { insights: msg.data });
      }
    }

    if (msg.type === MessageType.SCRAPE_LEAD_RESULT) {
      console.log(MessageType.SCRAPE_LEAD_RESULT, msg.data);
    }

    if (msg.type === MessageType.SCRAPE_COMPANY_RESULT) {
      console.log(MessageType.SCRAPE_COMPANY_RESULT, msg.data);
    }
  }
}

export const leadService = new LeadService();

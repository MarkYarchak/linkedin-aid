import { browser } from 'wxt/browser';
import { MessageType } from '@/constants/message-types';
import { BASE_URL } from '@/constants/urls';
import type { Lead } from '@/types/lead/lead';
import type { SalesApiInsightsV2 } from '@/types/lead/salesApiInsightsV2';

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

  async updateLeadInsightsInStorage(urn: string, data: SalesApiInsightsV2) {
    const isPagination = data.paging?.start > 0;

    if (isPagination) {
      const storage = await browser.storage.local.get('capturedLeads');
      const leads: Record<string, Lead> = (storage.capturedLeads || {}) as Record<string, Lead>;
      const existingLead = leads[urn];

      if (existingLead?.insights) {
        const mergedElements = [...(existingLead.insights.elements || []), ...(data.elements || [])];
        // Remove duplicates by insightId if necessary, though LinkedIn usually doesn't send them
        const uniqueElements = Array.from(new Map(mergedElements.map((item) => [item.insightId, item])).values());

        await this.updateLeadInStorage(urn, {
          insights: {
            ...data,
            elements: uniqueElements,
          },
        });
      } else {
        await this.updateLeadInStorage(urn, { insights: data });
      }
    } else {
      await this.updateLeadInStorage(urn, { insights: data });
    }
  }

  async handleMessage(msg: any, sender: any) {
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
        const data = msg.data as SalesApiInsightsV2;
        this.updateLeadInsightsInStorage(urn, data);
      }
    }

    if (msg.type === MessageType.SCRAPE_LEAD_RESULT) {
      console.log(MessageType.SCRAPE_LEAD_RESULT, msg.data);
    }
  }
}

export const leadService = new LeadService();

import merge from 'deepmerge';
import { db } from '@/db/schema';
import { MessageType } from '@/constants/message-types';
import { BASE_URL } from '@/constants/urls';
import {
  getSalesNavigatorLeadUrl,
  isSalesNavigatorLeadUrl,
  normalizeSalesNavigatorLeadUrl,
} from '@/helpers/url-helpers';
import type { Lead } from '@/types/lead/lead';
import type { SalesApiInsightsV2 } from '@/types/lead/salesApiInsightsV2';

export class LeadService {
  private lastTabUrls: Record<number, string> = {};

  setTabUrl(tabId: number, url: string) {
    this.lastTabUrls[tabId] = url;
  }

  async updateLeadsInStorage(updates: Record<string, { update: Partial<Lead>, deepMerge?: boolean }>) {
    const urns = Object.keys(updates);
    const existingLeads = await db.leads.bulkGet(urns);
    const leadsToPut: Lead[] = [];

    for (let i = 0; i < urns.length; i++) {
      const urn = urns[i];
      const { update, deepMerge } = updates[urn];
      const existingLead = existingLeads[i] || { entityUrn: urn, updatedAt: Date.now() };

      let updatedLead: Lead;
      if (deepMerge) {
        updatedLead = merge(existingLead, update);
      } else {
        updatedLead = {
          ...existingLead,
          ...update,
        };
      }
      updatedLead.updatedAt = Date.now();
      leadsToPut.push(updatedLead);
    }

    await db.leads.bulkPut(leadsToPut);
  }

  async updateLeadInStorage(urn: string, update: Partial<Lead>, deepMerge = false) {
    await this.updateLeadsInStorage({ [urn]: { update, deepMerge } });
  }

  async updateLeadInsightsInStorage(urn: string, data: SalesApiInsightsV2) {
    const isPagination = data.paging?.start > 0;

    if (isPagination) {
      const existingLead = await db.leads.get(urn);

      if (existingLead?.insights) {
        const mergedElements = [...(existingLead.insights.elements || []), ...(data.elements || [])];
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

    const getProfileUrl = (urn: string) => {
      if (tabUrl && isSalesNavigatorLeadUrl(tabUrl)) {
        return normalizeSalesNavigatorLeadUrl(tabUrl);
      }
      const url = getSalesNavigatorLeadUrl(urn);
      return url ? normalizeSalesNavigatorLeadUrl(url) : undefined;
    };

    if (msg.type === MessageType.LEAD_CAPTURED) {
      const urn = msg.data.entityUrn;
      if (urn) {
        this.updateLeadInStorage(urn, { main: msg.data, profileUrl: getProfileUrl(urn) });
      }
    }

    if (msg.type === MessageType.LEAD_EXTRA_CAPTURED) {
      const urn = msg.data.entityUrn;
      if (urn) {
        this.updateLeadInStorage(urn, { extra: msg.data, profileUrl: getProfileUrl(urn) });
      }
    }

    if (msg.type === MessageType.LEAD_INSIGHTS_CAPTURED) {
      const urn = new URL(msg.url, BASE_URL).searchParams.get('profile');
      if (urn) {
        const data = msg.data as SalesApiInsightsV2;
        this.updateLeadInsightsInStorage(urn, data);
      }
    }
  }
}

export const leadService = new LeadService();

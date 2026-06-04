import { browser } from 'wxt/browser';
import merge from 'deepmerge';
import { MessageType } from '@/constants/message-types';
import { BASE_URL } from '@/constants/urls';
import {
  getSalesNavigatorLeadUrl,
  isSalesNavigatorLeadUrl,
  normalizeSalesNavigatorLeadUrl,
} from '@/helpers/url-helpers';
import type { Lead } from '@/types/lead/lead';
import type { SalesApiInsightsV2 } from '@/types/lead/salesApiInsightsV2';
import type { PersonasStorage } from '@/types/search/search';
import type { SalesApiPersonasResponse } from '@/types/search/salesApiPersonas';

export class LeadService {
  private lastTabUrls: Record<number, string> = {};

  setTabUrl(tabId: number, url: string) {
    this.lastTabUrls[tabId] = url;
  }

  async updateLeadInStorage(urn: string, update: Partial<Lead>, deepMerge = false) {
    const storage = await browser.storage.local.get('capturedLeads');
    const leads: Record<string, Lead> = (storage.capturedLeads || {}) as Record<string, Lead>;

    const existingLead = leads[urn] || { entityUrn: urn, updatedAt: Date.now() };

    if (deepMerge) {
      leads[urn] = merge(existingLead, update);
      leads[urn].updatedAt = Date.now();
    } else {
      leads[urn] = {
        ...existingLead,
        ...update,
        updatedAt: Date.now(),
      };
    }

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

    if (msg.type === MessageType.PERSONAS_CAPTURED) {
      const data = msg.data as SalesApiPersonasResponse;
      const url = new URL(msg.url, BASE_URL);
      const targetCompanyId = url.searchParams.get('targetCompanyId');

      const storage = await browser.storage.session.get('personas');
      const personasStorage: PersonasStorage = (storage.personas || { general: [], byCompany: {} }) as PersonasStorage;

      if (targetCompanyId) {
        const companyUrn = `urn:li:fs_salesCompany:${targetCompanyId}`;
        personasStorage.byCompany[companyUrn] = data.elements;
      } else {
        personasStorage.general = data.elements;
      }

      await browser.storage.session.set({ personas: personasStorage });
    }
  }
}

export const leadService = new LeadService();

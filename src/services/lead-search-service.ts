import { browser } from 'wxt/browser';
import { MessageType } from '@/constants/message-types';
import { BASE_URL } from '@/constants/urls';
import { companyService } from '@/services/company-service';
import { leadService } from '@/services/lead-service';
import { getLeadSearchTabSessionKey, getLeadSearchSessionKey } from '@/helpers/search-url-helpers';
import {
  getSalesNavigatorLeadUrl,
  getSalesNavigatorCompanyUrl,
  isSalesNavigatorLeadUrl,
  normalizeSalesNavigatorLeadUrl,
} from '@/helpers/url-helpers';
import type { SalesApiLeadSearchResponse } from '@/types/search/salesApiLeadSearch';
import type { SearchSession } from '@/types/search/search';
import type { PersonasStorage } from '@/types/search/search';
import type { SalesApiPersonasResponse } from '@/types/search/salesApiPersonas';

export class LeadSearchService {
  private lastTabUrls: Record<number, string> = {};

  setTabUrl(tabId: number, url: string) {
    this.lastTabUrls[tabId] = url;
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

    if (msg.type === MessageType.LEAD_SEARCH_CAPTURED) {
      const data = msg.data as SalesApiLeadSearchResponse;
      const requestUrl = new URL(msg.url, BASE_URL);
      const apiQuery = requestUrl.searchParams.get('query');
      const sessionId = requestUrl.searchParams.get('sessionId');

      const sessionKey = (apiQuery ? getLeadSearchSessionKey(apiQuery, sessionId) : null)
        || (tabUrl ? getLeadSearchTabSessionKey(tabUrl) : null)
        || apiQuery;

      let companyUrn: string | undefined;
      let personaId: string | undefined;

      if (sessionKey && apiQuery) {
        const companyMatch = apiQuery.match(/type:CURRENT_COMPANY,values:List\(\(id:(\d+)/);
        const organizationId = requestUrl.searchParams.get('organizationId');
        if (companyMatch || organizationId) {
          companyUrn = `urn:li:fs_salesCompany:${companyMatch ? companyMatch[1] : organizationId}`;
        }

        const personaMatch = apiQuery.match(/type:PERSONA,values:List\(\(id:(\d+)/);
        if (personaMatch) {
          personaId = personaMatch[1];
        }

        const storage = await browser.storage.session.get('searchSessions');
        const sessions: Record<string, SearchSession> = (storage.searchSessions || {}) as Record<string, SearchSession>;

        const session = sessions[sessionKey] || {
          query: apiQuery,
          tabUrl,
          total: data.paging.total,
          pageSize: data.paging.count,
          leadUrnsByPage: {},
          updatedAt: Date.now(),
          searchTitle: data.metadata.searchTitle,
          companyUrn,
          personaId,
        };

        const page = Math.floor(data.paging.start / data.paging.count);
        const leadUrns = data.elements.map(e => e.entityUrn).filter((urn): urn is string => !!urn);

        session.leadUrnsByPage[page] = leadUrns;
        if (tabUrl) {
          session.tabUrl = tabUrl;
        }
        session.updatedAt = Date.now();
        session.total = data.paging.total;
        session.pageSize = data.paging.count;
        session.searchTitle = data.metadata.searchTitle;
        session.heroCard = data.metadata.heroCard;
        session.companyUrn = companyUrn || session.companyUrn;
        session.personaId = personaId || session.personaId;

        if (data.metadata.heroCard?.entityType === 'COMPANY') {
          const companyData = data.metadata.heroCard.entity['com.linkedin.sales.company.Company'];
          if (companyData?.entityUrn) {
            await companyService.updateCompanyInStorage(companyData.entityUrn, {
              main: companyData as any,
              profileUrl: getSalesNavigatorCompanyUrl(companyData.entityUrn) || undefined,
            }, true);
          }
        }

        sessions[sessionKey] = session;
        await browser.storage.session.set({ searchSessions: sessions });
      }

      if (data.elements) {
        for (const element of data.elements) {
          const urn = element.entityUrn;
          if (urn) {
            await leadService.updateLeadInStorage(urn, {
              searchResult: element,
              profileUrl: getProfileUrl(urn),
            }, true);
          }
        }
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

export const leadSearchService = new LeadSearchService();

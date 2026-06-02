import { browser } from 'wxt/browser';
import merge from 'deepmerge';
import { parseLinkedInUrn } from '@/helpers/urn';
import { MessageType } from '@/constants/message-types';
import { getSalesNavigatorCompanyUrl, isSalesNavigatorCompanyUrl } from '@/helpers/url-helpers';
import type { Company } from '@/types/company/company';

export class CompanyService {
  private lastTabUrls: Record<number, string> = {};

  setTabUrl(tabId: number, url: string) {
    this.lastTabUrls[tabId] = url;
  }

  async findCompanies(): Promise<Record<string, Company>> {
    const storage = await browser.storage.local.get('capturedCompanies');
    return (storage.capturedCompanies || {}) as Record<string, Company>;
  }

  async findCompanyById(id: string): Promise<Company | undefined> {
    const companies = await this.findCompanies();
    const companyEntries = Object.values(companies);
    return companyEntries
      .find((company) => parseLinkedInUrn(company.entityUrn).id === id);
  }

  async updateCompanyInStorage(urn: string, update: Partial<Company>, deepMerge = false) {
    const companies = await this.findCompanies();

    const existingCompany = companies[urn] || { entityUrn: urn, updatedAt: Date.now() };

    if (deepMerge) {
      companies[urn] = merge(existingCompany, update);
      companies[urn].updatedAt = Date.now();
    } else {
      companies[urn] = {
        ...existingCompany,
        ...update,
        updatedAt: Date.now(),
      };
    }

    await browser.storage.local.set({ capturedCompanies: companies });
  }

  async handleMessage(msg: any, sender: any) {
    const tabUrl = sender.tab?.id ? this.lastTabUrls[sender.tab.id] : undefined;

    const getProfileUrl = (urn: string) => {
      if (tabUrl && isSalesNavigatorCompanyUrl(tabUrl)) {
        return tabUrl;
      }
      return getSalesNavigatorCompanyUrl(urn) || undefined;
    };

    if (msg.type === MessageType.COMPANY_CAPTURED) {
      const urn = msg.data.entityUrn;
      if (urn) {
        this.updateCompanyInStorage(urn, { main: msg.data, profileUrl: getProfileUrl(urn) });
      }
    }

    if (msg.type === MessageType.COMPANY_EXTRA_CAPTURED) {
      const urn = msg.data.entityUrn;
      if (urn) {
        this.updateCompanyInStorage(urn, { extra: msg.data, profileUrl: getProfileUrl(urn) });
      }
    }
  }
}

export const companyService = new CompanyService();

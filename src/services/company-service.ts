import merge from 'deepmerge';
import { db } from '@/db/schema';
import { parseLinkedInUrn } from '@/helpers/urn';
import { MessageType } from '@/constants/message-types';
import {
  getSalesNavigatorCompanyUrl,
  isSalesNavigatorCompanyUrl,
  normalizeUrl,
} from '@/helpers/url-helpers';
import type { Company } from '@/types/company/company';

export class CompanyService {
  private lastTabUrls: Record<number, string> = {};

  setTabUrl(tabId: number, url: string) {
    this.lastTabUrls[tabId] = url;
  }

  async findCompanies(): Promise<Record<string, Company>> {
    const companies = await db.companies.toArray();
    const map: Record<string, Company> = {};
    companies.forEach(c => map[c.entityUrn] = c);
    return map;
  }

  async findCompanyById(id: string): Promise<Company | undefined> {
    // We can use Dexie to filter if we had indexed ID, but for now we can still do it in memory or use filter
    return db.companies.filter(c => parseLinkedInUrn(c.entityUrn).id === id).first();
  }

  async updateCompaniesInStorage(updates: Record<string, { update: Partial<Company>, deepMerge?: boolean }>) {
    const urns = Object.keys(updates);
    const existingCompanies = await db.companies.bulkGet(urns);
    const companiesToPut: Company[] = [];

    for (let i = 0; i < urns.length; i++) {
      const urn = urns[i];
      const { update, deepMerge } = updates[urn];
      const existingCompany = existingCompanies[i] || { entityUrn: urn, updatedAt: Date.now() };

      let updatedCompany: Company;
      if (deepMerge) {
        updatedCompany = merge(existingCompany, update, {
          arrayMerge: (destinationArray, sourceArray) => sourceArray,
        });
      } else {
        updatedCompany = {
          ...existingCompany,
          ...update,
        };
      }
      updatedCompany.updatedAt = Date.now();
      companiesToPut.push(updatedCompany);
    }

    await db.companies.bulkPut(companiesToPut);
  }

  async updateCompanyInStorage(urn: string, update: Partial<Company>, deepMerge = false) {
    await this.updateCompaniesInStorage({ [urn]: { update, deepMerge } });
  }

  async handleMessage(msg: any, sender: any) {
    const tabUrl = sender.tab?.id ? this.lastTabUrls[sender.tab.id] : undefined;

    const getProfileUrl = (urn: string) => {
      if (tabUrl && isSalesNavigatorCompanyUrl(tabUrl)) {
        return normalizeUrl(tabUrl);
      }
      const url = getSalesNavigatorCompanyUrl(urn);
      return url ? normalizeUrl(url) : undefined;
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

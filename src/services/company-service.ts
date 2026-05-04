import { browser } from 'wxt/browser';
import { parseLinkedInUrn } from '@/helpers/urn';
import { MessageType } from '@/constants/message-types';
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

  async updateCompanyInStorage(urn: string, update: Partial<Company>) {
    const companies = await this.findCompanies();

    const existingCompany = companies[urn] || { entityUrn: urn, updatedAt: Date.now() };
    companies[urn] = {
      ...existingCompany,
      ...update,
      updatedAt: Date.now(),
    };

    await browser.storage.local.set({ capturedCompanies: companies });
  }

  async handleMessage(msg: any, sender: any) {
    const tabUrl = sender.tab?.id ? this.lastTabUrls[sender.tab.id] : undefined;

    if (msg.type === MessageType.COMPANY_CAPTURED) {
      const urn = msg.data.entityUrn;
      if (urn) {
        this.updateCompanyInStorage(urn, { main: msg.data, profileUrl: tabUrl });
      }
    }

    if (msg.type === MessageType.COMPANY_EXTRA_CAPTURED) {
      const urn = msg.data.entityUrn;
      if (urn) {
        this.updateCompanyInStorage(urn, { extra: msg.data, profileUrl: tabUrl });
      }
    }

    if (msg.type === MessageType.SCRAPE_COMPANY_RESULT) {
      console.log(MessageType.SCRAPE_COMPANY_RESULT, msg.data);
    }
  }
}

export const companyService = new CompanyService();

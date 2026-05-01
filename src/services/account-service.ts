import { browser } from 'wxt/browser';
import { MessageType } from '@/constants/message-types';
import type { Company } from '@/types/company/company';

export class AccountService {
  private lastTabUrls: Record<number, string> = {};

  setTabUrl(tabId: number, url: string) {
    this.lastTabUrls[tabId] = url;
  }

  async updateCompanyInStorage(urn: string, update: Partial<Company>) {
    const storage = await browser.storage.local.get('capturedCompanies');
    const companies: Record<string, Company> = (storage.capturedCompanies || {}) as Record<string, Company>;

    const existingCompany = companies[urn] || { entityUrn: urn, updatedAt: Date.now() };
    companies[urn] = {
      ...existingCompany,
      ...update,
      updatedAt: Date.now(),
    };

    await browser.storage.local.set({ capturedCompanies: companies });
  }

  handleMessage(msg: any, sender: any) {
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

    if (msg.type === MessageType.COMPANY_INSIGHTS_CAPTURED) {
      const urn = msg.url.split('/').pop()?.split('?')[0];
      if (urn) {
        this.updateCompanyInStorage(urn, { insights: msg.data });
      }
    }

    if (msg.type === MessageType.SCRAPE_COMPANY_RESULT) {
      console.log(MessageType.SCRAPE_COMPANY_RESULT, msg.data);
    }
  }
}

export const accountService = new AccountService();

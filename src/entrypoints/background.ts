import { browser } from 'wxt/browser';
import {
  isSalesNavigatorCompanyUrl,
  isSalesNavigatorLeadUrl,
  isSalesNavigatorPeopleSearchUrl,
} from '@/helpers/url-helpers';
import { leadService } from '@/services/lead-service';
import { leadSearchService } from '@/services/lead-search-service';
import { companyService } from '@/services/company-service';

export default defineBackground(() => {
  browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.url) {
      leadService.setTabUrl(tabId, tab.url);
      leadSearchService.setTabUrl(tabId, tab.url);
      companyService.setTabUrl(tabId, tab.url);
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
        files: ['/handle-company-profile.js'],
      });
    }

    if (isSalesNavigatorPeopleSearchUrl(tab.url)) {
      browser.scripting.executeScript({
        target: { tabId },
        world: 'MAIN',
        injectImmediately: true,
        files: ['/handle-lead-search.js'],
      });
    }
  });

  browser.runtime.onMessage.addListener((msg, sender) => {
    leadService.handleMessage(msg, sender);
    leadSearchService.handleMessage(msg, sender);
    companyService.handleMessage(msg, sender);
  });
});

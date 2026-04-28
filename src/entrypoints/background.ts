import { browser } from 'wxt/browser';
import { MessageType } from '@/constants/message-types';
import { isSalesNavigatorCompanyUrl, isSalesNavigatorLeadUrl } from '@/helpers/url-helpers';

export default defineBackground(() => {
  browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
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
        files: ['/handle-account-profile.js'],
      });
    }
  });

  browser.runtime.onMessage.addListener((msg) => {
    if (msg.type === MessageType.RESULT_LEAD) {
      console.log(MessageType.RESULT_LEAD, msg.data);
    }

    if (msg.type === MessageType.RESULT_ACCOUNT) {
      console.log(MessageType.RESULT_ACCOUNT, msg.data);
    }
  });
});

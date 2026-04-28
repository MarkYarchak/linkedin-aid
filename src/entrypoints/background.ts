import { browser } from 'wxt/browser';
import { MessageType } from '@/constants/message-types';
import { interceptXHR } from '@/background/xhr-interceptor';

export default defineBackground(() => {
  browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status !== 'loading') return;
    if (!tab.url?.includes('linkedin.com/sales')) return;

    browser.scripting.executeScript({
      target: { tabId },
      world: 'MAIN',
      injectImmediately: true,
      func: interceptXHR,
    });
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

import { browser } from 'wxt/browser';
import { MessageType } from '@/constants/message-types';
import { scrapeLead } from '@/content/scrape-lead';
import { scrapeAccount } from '@/content/scrape-account';

export default defineContentScript({
  matches: ['*://*.linkedin.com/*'],
  runAt: 'document_idle',
  main() {
    console.log('✅ LinkedIn Extension has been initialized!');

    browser.runtime.onMessage.addListener((msg) => {
      if (msg.type === MessageType.SCRAPE_LEAD) {
        const lead = scrapeLead();

        browser.runtime.sendMessage({
          type: MessageType.RESULT_LEAD,
          data: { lead },
        });
      }

      if (msg.type === MessageType.SCRAPE_ACCOUNT) {
        const account = scrapeAccount();

        browser.runtime.sendMessage({
          type: MessageType.RESULT_ACCOUNT,
          data: { account },
        });
      }
    });
  },
});

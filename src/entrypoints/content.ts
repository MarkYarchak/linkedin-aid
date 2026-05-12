import { proxyWindowMessages } from '@/content/window-messages';

export default defineContentScript({
  matches: ['*://*.linkedin.com/*'],
  runAt: 'document_idle',
  main() {
    console.log('✅ LinkedIn Extension has been initialized!');

    proxyWindowMessages();
  },
});

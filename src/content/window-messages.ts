import { browser } from 'wxt/browser';
import { MessageType } from '@/constants/message-types';

export function proxyWindowMessages() {
  const messageTypes = new Set([
    MessageType.LEAD_CAPTURED,
    MessageType.LEAD_EXTRA_CAPTURED,
    MessageType.LEAD_INSIGHTS_CAPTURED,
    MessageType.COMPANY_CAPTURED,
    MessageType.COMPANY_EXTRA_CAPTURED,
    MessageType.LEAD_SEARCH_CAPTURED,
    MessageType.PERSONAS_CAPTURED,
  ]);

  window.addEventListener('message', (event) => {
    if (event.source !== window) return;

    if (messageTypes.has(event.data?.type)) {
      browser.runtime.sendMessage(event.data);
    }
  });
}

export function postWindowMessage(message: any, targetOrigin = '*') {
  window.postMessage(message, targetOrigin);
}

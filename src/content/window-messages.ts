import { browser } from 'wxt/browser';
import { MessageType } from '@/constants/message-types';

const proxyMessageTypes = new Set([
  MessageType.LEAD_CAPTURED,
  MessageType.LEAD_EXTRA_CAPTURED,
  MessageType.LEAD_INSIGHTS_CAPTURED,
]);

export function handleWindowMessages() {
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;

    if (proxyMessageTypes.has(event.data?.type)) {
      browser.runtime.sendMessage(event.data);
    }
  });
}

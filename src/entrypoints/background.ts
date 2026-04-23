import { browser } from 'wxt/browser';
import { MessageType } from '@/constants/message-types';

export default defineBackground(() => {
  browser.runtime.onMessage.addListener((msg) => {
    if (msg.type === MessageType.RESULT_LEAD) {
      console.log(MessageType.RESULT_LEAD, msg.data);
    }

    if (msg.type === MessageType.RESULT_ACCOUNT) {
      console.log(MessageType.RESULT_ACCOUNT, msg.data);
    }
  });
});

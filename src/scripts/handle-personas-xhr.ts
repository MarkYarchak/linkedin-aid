import { handleXhr } from '@/scripts/xhr-interceptor';
import { MessageType } from '@/constants/message-types';
import { postWindowMessage } from '@/content/window-messages';
import type { SalesApiPersonasResponse } from '@/types/search/salesApiPersonas';

export function handlePersonasXhr() {
  handleXhr<SalesApiPersonasResponse>(
    '/sales-api/salesApiPersonas',
    (data, url) => {
      postWindowMessage({
        type: MessageType.PERSONAS_CAPTURED,
        url,
        data,
      });
    },
  );
}

import { handleXhr } from '@/scripts/xhr-interceptor';
import { MessageType } from '@/constants/message-types';
import { postWindowMessage } from '@/content/window-messages';
import type { SalesApiLeadSearchResponse } from '@/types/search/salesApiLeadSearch';

export function handleLeadSearchXhr() {
  handleXhr<SalesApiLeadSearchResponse>(
    '/sales-api/salesApiLeadSearch',
    (data, url) => {
      postWindowMessage({
        type: MessageType.LEAD_SEARCH_CAPTURED,
        url,
        data,
      });
    },
  );
}

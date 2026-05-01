import { handleXhr } from '@/scripts/xhr-interceptor';
import { MessageType } from '@/constants/message-types';
import { postWindowMessage } from '@/content/window-messages';
import type { SalesApiProfiles } from '@/types/lead/salesApiProfiles';
import type { SalesApiProfiles2 } from '@/types/lead/salesApiProfiles2';
import type { SalesApiInsightsV2 } from '@/types/lead/salesApiInsightsV2';

export function handleLeadProfileXhr() {
  handleXhr<SalesApiProfiles>(
    /\/sales-api\/salesApiProfiles\/.*decoration=.*firstName/,
    (data, url) => {
      postWindowMessage({
        type: MessageType.LEAD_CAPTURED,
        url,
        data,
      });
    },
  );

  handleXhr<SalesApiProfiles2>(
    /\/sales-api\/salesApiProfiles\/.*decoration=.*educations/,
    (data, url) => {
      postWindowMessage({
        type: MessageType.LEAD_EXTRA_CAPTURED,
        url,
        data,
      });
    },
  );

  handleXhr<SalesApiInsightsV2>('/sales-api/salesApiInsightsV2', (data, url) => {
    postWindowMessage({
      type: MessageType.LEAD_INSIGHTS_CAPTURED,
      url,
      data,
    });
  });
}

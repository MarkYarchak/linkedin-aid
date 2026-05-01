import { handleXhr } from '@/scripts/xhr-interceptor';
import { MessageType } from '@/constants/message-types';
import type { SalesApiProfiles } from '@/types/salesApiProfiles';
import type { SalesApiProfiles2 } from '@/types/salesApiProfiles2';
import type { SalesApiInsightsV2 } from '@/types/salesApiInsightsV2';

export function handleLeadProfileXhr() {
  handleXhr<SalesApiProfiles>(
    /\/sales-api\/salesApiProfiles\/.*decoration=.*firstName/,
    (data, url) => {
      console.log('[LI] XHR SalesApiProfiles (Main) URL', url);
      console.log('[LI] XHR SalesApiProfiles (Main) data', data);

      window.postMessage(
        {
          type: MessageType.LEAD_CAPTURED,
          data,
        },
        '*',
      );
    },
  );

  handleXhr<SalesApiProfiles2>(
    /\/sales-api\/salesApiProfiles\/.*decoration=.*educations/,
    (data, url) => {
      console.log('[LI] XHR SalesApiProfiles2 (Extra) URL', url);
      console.log('[LI] XHR SalesApiProfiles2 (Extra) data', data);

      window.postMessage(
        {
          type: 'LEAD_EXTRA_CAPTURED',
          data,
        },
        '*',
      );
    },
  );

  handleXhr<SalesApiInsightsV2>('/sales-api/salesApiInsightsV2', (data, url) => {
    console.log('[LI] XHR URL', url);
    console.log('[LI] XHR data', data);

    window.postMessage(
      {
        type: 'LEAD_INSIGHTS_CAPTURED',
        data,
      },
      '*',
    );
  });
}

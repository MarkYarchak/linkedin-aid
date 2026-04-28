import { handleXhr } from '@/background/xhr-interceptor';
import type { SalesApiProfiles } from '@/types/salesApiProfiles';
import type { SalesApiInsightsV2 } from '@/types/salesApiInsightsV2';

export function handleLeadProfileXhr() {
  handleXhr<SalesApiProfiles>('/sales-api/salesApiProfiles', (data, url) => {
    console.log('[LI] XHR URL', url);
    console.log('[LI] XHR data', data);
  });

  handleXhr<SalesApiInsightsV2>('/sales-api/salesApiInsightsV2', (data, url) => {
    console.log('[LI] XHR URL', url);
    console.log('[LI] XHR data', data);
  });
}

import type { SalesApiProfiles } from '@/types/lead/salesApiProfiles';
import type { SalesApiProfiles2 } from '@/types/lead/salesApiProfiles2';
import type { SalesApiInsightsV2 } from '@/types/lead/salesApiInsightsV2';

export interface Lead {
  entityUrn: string;
  profileUrl?: string;
  main?: SalesApiProfiles;
  extra?: SalesApiProfiles2;
  insights?: SalesApiInsightsV2;
  updatedAt: number;
}

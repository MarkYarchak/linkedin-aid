import type { SalesApiProfiles } from './salesApiProfiles';
import type { SalesApiProfiles2 } from './salesApiProfiles2';
import type { SalesApiInsightsV2 } from './salesApiInsightsV2';

export interface Lead {
  entityUrn: string;
  profileUrl?: string;
  main?: SalesApiProfiles;
  extra?: SalesApiProfiles2;
  insights?: SalesApiInsightsV2;
  updatedAt: number;
}

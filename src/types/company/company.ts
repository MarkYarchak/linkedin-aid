import type { SalesApiCompanies } from './salesApiCompanies';
import type { SalesApiCompanies2 } from './salesApiCompanies2';

export interface Company {
  entityUrn: string;
  updatedAt: number;
  profileUrl?: string;
  main?: SalesApiCompanies;
  extra?: SalesApiCompanies2;
}

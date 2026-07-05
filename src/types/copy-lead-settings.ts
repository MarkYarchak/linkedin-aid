import type { TitleTarget, TitleState } from '@/helpers/title-helper';

export interface CopyLeadSettings {
  leadFields: {
    fullName: boolean;
    headline: boolean;
    location: boolean;
    summary: boolean;
    position: {
      title: boolean;
      companyName: boolean;
      industry: boolean;
      location: boolean;
      startedOn: boolean;
      description: boolean;
    };
  };
  companyFields: {
    name: boolean;
    description: boolean;
    industry: boolean;
    location: boolean;
    revenueRange: boolean;
    specialties: boolean;
    type: boolean;
    yearFounded: boolean;
    employeeCount: boolean;
  };
  titleTargets?: TitleTarget[];
  titleStates?: TitleState[];
  selectedTarget?: string;
  selectedState?: string;
  prefix?: string;
  viewMode?: string;
  wrapText?: boolean;
  insightFilters?: string[];
}

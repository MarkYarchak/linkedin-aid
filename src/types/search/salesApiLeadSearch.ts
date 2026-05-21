import { DisplayImage } from '@/types/linkedin-common';

export interface SalesApiLeadSearchResponse {
  metadata: SalesApiLeadSearchMetadata;
  elements: LeadSearchResult[];
  paging: Paging;
}

export interface SalesApiLeadSearchMetadata {
  suggestedFilters: SuggestedFilter[];
  totalDisplayCount: string;
  filters: Filter[];
  searchTitle: string;
  tracking: {
    requestId: string;
    sessionId: string;
  };
  recentSearchId: number;
  heroCard?: HeroCard;
}

export interface SuggestedFilter {
  displayValue: string;
  type: string;
  id: string;
}

export interface Filter {
  singleFilterMetadata?: {
    values?: FilterValue[];
    type?: string;
    disabledValues?: {
      disabledValuesMessage: {
        attributes: FilterAttribute[];
        text: string;
      };
      values: any[];
    };
  };
  aggregatedFilterMetadata?: {
    filterGroup?: {
      type: string;
      values: FilterValue[];
    };
    type: string;
    selected?: string;
    values?: FilterValue[];
  };
}

export interface FilterAttribute {
  start: number;
  length: number;
  type: string;
}

export interface FilterValue {
  displayValue?: string;
  parent?: {
    id: string;
  };
  selectionType?: 'INCLUDED' | 'EXCLUDED';
  displayImage?: DisplayImage;
  displayCount?: string;
  id?: string;
  icon?: string;
  values?: FilterValue[];
  selectedSubFilter?: string;
  type?: string;
  disabledValues?: {
    disabledValuesMessage: {
      attributes: FilterAttribute[];
      text: string;
    };
    values: any[];
  };
}

export interface HeroCard {
  spotlightBadges: SpotlightBadge[];
  entityType: 'COMPANY' | string;
  entity: {
    'com.linkedin.sales.company.Company'?: SalesCompany;
    [key: string]: any;
  };
  trackingId: string;
}

export interface SalesCompany {
  description: string;
  companyPictureDisplayImage: DisplayImage;
  industry: string;
  employeeCount: number;
  employeeCountRange: string;
  entityUrn: string;
  employeeDisplayCount: string;
  requestId: string;
  name: string;
  companyBackgroundCoverImage: DisplayImage;
  location: string;
  account: {
    starred: boolean;
    saved: boolean;
    listCount: number;
  };
  trackingId: string;
}

export interface SpotlightBadge {
  displayValue: string;
  popup?: {
    message?: {
      text: string;
    };
    header: {
      text: string;
    };
    config: {
      supportsDataFetch: boolean;
      popupTypes: string[];
    };
  };
  associatedEntityUrnsUnions: Array<{ companyUrn?: string; memberUrn?: string }>;
  id: string;
}

export interface LeadSearchResult {
  lastName: string;
  memorialized: boolean;
  objectUrn: string;
  geoRegion: string;
  saved: boolean;
  openLink: boolean;
  premium: boolean;
  currentPositions: DecoratedPosition[];
  entityUrn: string;
  viewed: boolean;
  spotlightBadges: SpotlightBadge[];
  profilePictureDisplayImage?: DisplayImage;
  trackingId: string;
  blockThirdPartyDataSharing: boolean;
  summary?: string;
  pendingInvitation: boolean;
  degree: number;
  fullName: string;
  listCount: number;
  firstName: string;
  $recipeType: 'com.linkedin.sales.deco.desktop.searchv2.LeadSearchResult';
  unlocked?: boolean;
}

export interface DecoratedPosition {
  tenureAtPosition?: {
    numYears?: number;
    numMonths?: number;
  };
  companyName: string;
  title: string;
  companyUrnResolutionResult: DecoratedCompanyEntity;
  companyUrn: string;
  posId: number;
  current: boolean;
  $recipeType: 'com.linkedin.sales.deco.common.profile.DecoratedPosition';
  tenureAtCompany?: {
    numYears?: number;
    numMonths?: number;
  };
  startedOn?: {
    month?: number;
    year: number;
  };
  description?: string;
}

export interface DecoratedCompanyEntity {
  entityUrn: string;
  name: string;
  companyPictureDisplayImage: DisplayImage;
  industry: string;
  location: string;
  $recipeType: 'com.linkedin.sales.deco.common.company.DecoratedCompanyEntity';
}

export interface Paging {
  total: number;
  count: number;
  start: number;
  links: PagingLink[];
}

export interface PagingLink {
  rel: string;
  href: string;
  type: string;
}



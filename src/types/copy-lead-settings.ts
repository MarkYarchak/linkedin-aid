import type { TitleTarget, TitleState } from '@/helpers/title-helper';

/**
 * Primary action triggered when copying leads in bulk.
 * - `configure`: open the modal and let the user pick fields / review the preview.
 * - `instant`: copy straight away using the saved preferences.
 */
export type BulkCopyPrimaryAction = 'configure' | 'instant';
export type CopyLeadProfileDestination = 'linkedin' | 'sales-navigator';

export interface CopyLeadActions {
  generateSessionTitle: boolean;
  saveTitlePreferences: boolean;
  openLinkedInProfile: boolean;
  openProfileDestination: CopyLeadProfileDestination;
}

export const DEFAULT_COPY_LEAD_ACTIONS: CopyLeadActions = {
  generateSessionTitle: true,
  saveTitlePreferences: true,
  openLinkedInProfile: false,
  openProfileDestination: 'linkedin',
};

export interface BulkCopyLeadSettings {
  leadFields?: {
    fullName: boolean;
    location: boolean;
    summary: boolean;
    recentActivity: boolean;
    mutualConnections: boolean;
    heroCard: boolean;
    position: {
      title: boolean;
      companyName: boolean;
      industry: boolean;
      location: boolean;
      startedOn: boolean;
      description: boolean;
    };
  };
  primaryAction?: BulkCopyPrimaryAction;
  prefix?: string;
  viewMode?: string;
  wrapText?: boolean;
}

export interface CopyLeadModalVisibility {
  leadBasicInfo: boolean;
  currentPositionFields: boolean;
  companiesFields: boolean;
  skills: boolean;
  titleSettings: boolean;
}

export const DEFAULT_COPY_LEAD_MODAL_VISIBILITY: CopyLeadModalVisibility = {
  leadBasicInfo: true,
  currentPositionFields: true,
  companiesFields: true,
  skills: true,
  titleSettings: true,
};

export interface CopyLeadSettings {
  actions?: CopyLeadActions;
  modalVisibility?: CopyLeadModalVisibility;
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

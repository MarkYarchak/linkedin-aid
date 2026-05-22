import { DisplayImage } from '@/types/linkedin-common';

export interface CompanyUrnResolutionResult {
  name: string;
  companyPictureDisplayImage: DisplayImage;
  entityUrn: string;
  industry?: string;
}

export interface DateRange {
  year: number;
  month?: number;
}

export interface Position {
  companyName: string;
  title: string;
  companyUrnResolutionResult?: CompanyUrnResolutionResult;
  companyUrn?: string;
  posId: number;
  current: boolean;
  startedOn: DateRange;
  description?: string;
  endedOn?: DateRange;
  location?: string;
  new?: boolean;
  tenureAtPosition?: {
    numYears?: number;
    numMonths?: number;
  };
}

export interface DefaultPosition {
  companyName: string;
  title: string;
  companyUrn: string;
  posId: number;
  createdAt: number;
  current: boolean;
  startedOn: DateRange;
  new?: boolean;
  description?: string;
  location?: string;
}

export interface ProfileUnlockInfo {
  showProfileUnlock: boolean;
}

export interface CrmStatus {
  imported: boolean;
}

export interface SalesApiProfiles {
  lastName: string;
  memorialized: boolean;
  objectUrn: string;
  contactInfo: any;
  crmStatus: CrmStatus;
  unlocked: boolean;
  entityUrn: string;
  headline: string;
  profileUnlockInfo: ProfileUnlockInfo;
  crmManualMatched: boolean;
  summary?: string;
  pendingInvitation: boolean;
  defaultPosition: DefaultPosition;
  degree: number;
  fullName: string;
  positions: Position[];
  listCount: number;
  savedLead: boolean;
  firstName: string;
  flagshipProfileUrl: string;
  location: string;
}

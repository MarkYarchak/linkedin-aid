export interface Artifact {
  width: number;
  fileIdentifyingUrlPathSegment: string;
  height: number;
}

export interface CompanyPictureDisplayImage {
  rootUrl: string;
  artifacts: Artifact[];
}

export interface CompanyUrnResolutionResult {
  name: string;
  companyPictureDisplayImage: CompanyPictureDisplayImage;
  entityUrn: string;
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
}

export interface DefaultPosition {
  companyName: string;
  title: string;
  companyUrn: string;
  posId: number;
  createdAt: number;
  current: boolean;
  startedOn: DateRange;
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
  summary: string;
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

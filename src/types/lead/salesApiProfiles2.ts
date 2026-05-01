import { DisplayImage } from '@/types/linkedin-common';

export interface SchoolResolutionResult {
  entityUrn: string;
  name: string;
  schoolPictureDisplayImage: DisplayImage;
  url: string;
}

export interface Education {
  fieldsOfStudy: string[];
  school: string;
  degree: string;
  schoolName: string;
  eduId: number;
  schoolResolutionResult: SchoolResolutionResult;
}

export interface LatestTouchPointActivity {
  activityType: string;
  performedAt: number;
}

export interface Skill {
  name: string;
  numOfEndorsement: number;
}

export interface ProfileBackgroundPicture {
  "com.linkedin.common.VectorImage": DisplayImage;
}

export interface DateRange {
  month?: number;
  year: number;
}

export interface PictureInfo {
  logo: string;
}

export interface CompanyResolutionResult {
  entityUrn: string;
  name: string;
  companyPictureDisplayImage: DisplayImage;
  pictureInfo?: PictureInfo;
}

export interface VolunteeringExperience {
  role: string;
  companyName: string;
  cause?: string;
  startedOn: DateRange;
  companyResolutionResult?: CompanyResolutionResult;
  company?: string;
}

export interface MemberBadges {
  premium: boolean;
  openLink: boolean;
  jobSeeker: boolean;
}

export interface SalesApiProfiles2 {
  educations: Education[];
  latestTouchPointActivity: LatestTouchPointActivity;
  skills: Skill[];
  profileBackgroundPicture: ProfileBackgroundPicture;
  entityUrn: string;
  numOfConnections: number;
  profilePictureDisplayImage: DisplayImage;
  showTotalConnectionsPage: boolean;
  blockThirdPartyDataSharing: boolean;
  languages: any[];
  noteCount: number;
  volunteeringExperiences: VolunteeringExperience[];
  relatedColleagueCompanyId: number;
  numOfSharedConnections: number;
  memberBadges: MemberBadges;
}

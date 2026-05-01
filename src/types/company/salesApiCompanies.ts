import type { DisplayImage } from '../linkedin-common';

export interface EmployeeGrowthPercentage {
  timespan: string;
  percentage: number;
}

export interface EmployeeResolutionResult {
  firstName: string;
  lastName: string;
  entityUrn: string;
  fullName: string;
  profilePictureDisplayImage: DisplayImage;
  pictureInfo: Record<string, any>;
}

export interface Headquarters {
  country: string;
  geographicArea: string;
  city: string;
  postalCode: string;
  line1: string;
  line2?: string;
}

export interface Revenue {
  currencyCode: string;
  amount: number;
  unit: string;
}

export interface RevenueRange {
  estimatedMinRevenue: Revenue;
  estimatedMaxRevenue: Revenue;
}

export interface CompanyAccount {
  starred: boolean;
  saved: boolean;
  noteCount: number;
  listCount: number;
}

export interface SalesApiCompanies {
  description: string;
  industry: string;
  type: string;
  specialties: string[];
  flagshipCompanyUrl: string;
  entityUrn: string;
  employeeGrowthPercentages: EmployeeGrowthPercentage[];
  website: string;
  employeesResolutionResults: Record<string, EmployeeResolutionResult>;
  companyPictureDisplayImage: DisplayImage;
  pictureInfo: {
    logo: string;
  };
  yearFounded: number;
  headquarters: Headquarters;
  revenueRange: RevenueRange;
  name: string;
  companyBackgroundCoverImage: DisplayImage;
  location: string;
  employees: string[];
  account: CompanyAccount;
}

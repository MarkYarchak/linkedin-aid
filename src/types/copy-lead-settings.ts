export interface CopyLeadSettings {
  leadFields: {
    fullName: boolean;
    headline: boolean;
    location: boolean;
    summary: boolean;
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
}

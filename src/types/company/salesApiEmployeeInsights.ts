export interface LinkedInDate {
  month: number;
  year: number;
  day: number;
}

export interface HeadCountByDate {
  dateOn: LinkedInDate;
  employeeCount: number;
  monthlyPercentageDifference?: number;
}

export interface MonthlyHeadCount {
  headCountsByDate: HeadCountByDate[];
  employeePercentageDifference: number;
  employeeCount: number;
}

export interface SalesApiEmployeeInsights {
  medianTenure: number;
  monthlyHeadCounts: MonthlyHeadCount[];
}

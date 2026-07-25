export interface LeadPositionRelation {
  leadUrn: string;
  relations: Record<number, string>; // posId -> companyUrn
  createdAt: number;
  updatedAt: number;
}

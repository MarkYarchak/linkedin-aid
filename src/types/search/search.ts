export interface SearchSession {
  recentSearchId: number;
  total: number;
  pageSize: number;
  leadUrnsByPage: Record<number, string[]>;
  updatedAt: number;
  searchTitle?: string;
}

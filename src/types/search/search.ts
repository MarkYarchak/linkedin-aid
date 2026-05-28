export interface SearchSession {
  query: string;
  total: number;
  pageSize: number;
  leadUrnsByPage: Record<number, string[]>;
  updatedAt: number;
  searchTitle?: string;
  heroCard?: any;
}

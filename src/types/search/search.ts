export interface SearchSession {
  sessionId: string;
  total: number;
  pageSize: number;
  leadUrnsByPage: Record<number, string[]>;
  updatedAt: number;
  searchTitle?: string;
  heroCard?: any;
}

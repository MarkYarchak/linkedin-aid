import { Persona } from '@/types/search/salesApiPersonas';

export enum SearchSessionSource {
  SEARCH = 'search',
  COMPANY = 'company',
}

export interface SearchSession {
  query: string;
  tabUrl?: string;
  total: number;
  pageSize: number;
  leadUrnsByPage: Record<number, string[]>;
  updatedAt: number;
  searchTitle?: string;
  heroCard?: any;
  companyUrn?: string;
  personaId?: string;
  source?: SearchSessionSource;
}

export interface PersonasStorage {
  general: Persona[];
  byCompany: Record<string, Persona[]>;
}

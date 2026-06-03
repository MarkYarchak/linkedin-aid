import { Persona } from '@/types/search/salesApiPersonas';

export interface SearchSession {
  query: string;
  total: number;
  pageSize: number;
  leadUrnsByPage: Record<number, string[]>;
  updatedAt: number;
  searchTitle?: string;
  heroCard?: any;
}

export interface PersonasStorage {
  general: Persona[];
  byCompany: Record<string, Persona[]>;
}

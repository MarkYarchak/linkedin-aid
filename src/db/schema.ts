import Dexie, { type EntityTable } from 'dexie';
import type { Lead } from '@/types/lead/lead';
import type { Company } from '@/types/company/company';
import type { SearchSession } from '@/types/search/search';
import type { LeadPositionRelation } from '@/types/lead/lead-position-relation';

export interface AppDatabase extends Dexie {
  leads: EntityTable<Lead, 'entityUrn'>;
  companies: EntityTable<Company, 'entityUrn'>;
  searchSessions: EntityTable<SearchSession, 'id'>;
  leadPositionRelations: EntityTable<LeadPositionRelation, 'leadUrn'>;
}

const db = new Dexie('LinkedinAidDatabase') as AppDatabase;

db.version(5).stores({
  leads: 'entityUrn, updatedAt',
  companies: 'entityUrn, updatedAt',
  searchSessions: 'id, updatedAt, companyUrn',
  leadPositionRelations: 'leadUrn, updatedAt',
});

export { db };

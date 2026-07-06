import Dexie, { type EntityTable } from 'dexie';
import type { Lead } from '@/types/lead/lead';
import type { Company } from '@/types/company/company';
import type { SearchSession } from '@/types/search/search';

export interface AppDatabase extends Dexie {
  leads: EntityTable<Lead, 'entityUrn'>;
  companies: EntityTable<Company, 'entityUrn'>;
  searchSessions: EntityTable<SearchSession, 'id'>;
}

const db = new Dexie('LinkedinAidDatabase') as AppDatabase;

// Schema declaration:
// We index entityUrn as primary key.
// We might also want to index updatedAt for sorting/filtering.
db.version(2).stores({
  leads: 'entityUrn, updatedAt',
  companies: 'entityUrn, updatedAt',
  searchSessions: 'id, updatedAt, companyUrn'
});

export { db };

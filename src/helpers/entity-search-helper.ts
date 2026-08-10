import type { Lead } from '@/types/lead/lead';
import type { Company } from '@/types/company/company';
import type { SearchSession } from '@/types/search/search';

export function matchesLead(
  lead: Lead,
  query: string,
  relationsMap?: Record<string, Record<number, string>>,
  companiesMap?: Record<string, Company>
): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  const main = lead.main;
  const sr = lead.searchResult;

  const matchesBase = (
    main?.fullName?.toLowerCase().includes(q) ||
    main?.headline?.toLowerCase().includes(q) ||
    main?.location?.toLowerCase().includes(q) ||
    main?.summary?.toLowerCase().includes(q) ||
    main?.positions?.some(p => p.title?.toLowerCase().includes(q) || p.companyName?.toLowerCase().includes(q)) ||
    sr?.fullName?.toLowerCase().includes(q) ||
    sr?.summary?.toLowerCase().includes(q) ||
    sr?.currentPositions?.some(p => p.title?.toLowerCase().includes(q) || p.companyName?.toLowerCase().includes(q))
  ) ?? false;

  if (matchesBase) return true;

  // Check manual relations
  if (relationsMap && companiesMap) {
    const relations = relationsMap[lead.entityUrn];
    if (relations) {
      return Object.values(relations).some(companyUrn => {
        const company = companiesMap[companyUrn];
        return company?.main?.name?.toLowerCase().includes(q);
      });
    }
  }

  return false;
}

export function matchesCompany(company: Company, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  const main = company.main;

  return (
    main?.name?.toLowerCase().includes(q) ||
    main?.industry?.toLowerCase().includes(q) ||
    main?.location?.toLowerCase().includes(q) ||
    main?.description?.toLowerCase().includes(q) ||
    main?.specialties?.some(s => s.toLowerCase().includes(q))
  ) ?? false;
}

export function matchesSession(session: SearchSession, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();

  return (
    session.query?.toLowerCase().includes(q) ||
    session.searchTitle?.toLowerCase().includes(q)
  ) ?? false;
}

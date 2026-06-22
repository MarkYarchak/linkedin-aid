import { isSalesNavigatorPeopleSearchUrl } from '@/helpers/url-helpers';
import type { SearchSession } from '@/types/search/search';

export interface LeadSearchTabSignature {
  origin: string;
  pathname: string;
  query: string | null;
  sessionId: string | null;
}

export function getLeadSearchTabSignature(url: string): LeadSearchTabSignature | null {
  if (!isSalesNavigatorPeopleSearchUrl(url)) {
    return null;
  }

  try {
    const parsed = new URL(url);
    return {
      origin: parsed.origin,
      pathname: parsed.pathname,
      query: parsed.searchParams.get('query'),
      sessionId: parsed.searchParams.get('sessionId'),
    };
  } catch {
    return null;
  }
}

export function leadSearchTabSignaturesEqual(a: LeadSearchTabSignature, b: LeadSearchTabSignature): boolean {
  if (a.origin !== b.origin || a.pathname !== b.pathname) {
    return false;
  }

  const sessionKeyA = getLeadSearchTabSessionKeyFromSignature(a);
  const sessionKeyB = getLeadSearchTabSessionKeyFromSignature(b);

  return sessionKeyA === sessionKeyB;
}

function getLeadSearchTabSessionKeyFromSignature(sig: LeadSearchTabSignature): string {
  return getLeadSearchSessionKey(sig.query ?? '', sig.sessionId);
}

function extractFiltersFromQuery(query: string): string {
  const match = query.match(/filters:List\((.*)\)/);
  if (!match) {
    return query;
  }
  const content = match[1];
  let balance = 1;
  for (let i = 0; i < content.length; i++) {
    if (content[i] === '(') balance++;
    else if (content[i] === ')') balance--;
    if (balance === 0) {
      return content.substring(0, i);
    }
  }
  return content;
}

function normalizeFilters(filters: string): string {
  let normalized = decodeURIComponent(filters);

  // Normalize URNs to IDs (e.g., urn:li:organization:5307199 -> 5307199)
  normalized = normalized.replace(/urn:li:[^:]+:(\d+)/g, '$1');

  // Remove ephemeral or descriptive fields that might differ between pages
  normalized = normalized.replace(/,text:[^,)]+/g, '');
  normalized = normalized.replace(/,selectionType:[^,)]+/g, '');
  normalized = normalized.replace(/,parent:\(id:0\)/g, '');

  // Remove whitespace
  normalized = normalized.replace(/\s+/g, '');

  return normalized;
}

export function getLeadSearchSessionKey(query: string, sessionId?: string | null): string {
  const filters = extractFiltersFromQuery(query);
  const normalizedFilters = normalizeFilters(filters);

  if (sessionId) {
    return `sessionId:${sessionId};filters:${normalizedFilters}`;
  }
  return `filters:${normalizedFilters}`;
}

/** Stable session storage key from a Sales Navigator people-search tab URL. */
export function getLeadSearchTabSessionKey(tabUrl: string): string | null {
  const sig = getLeadSearchTabSignature(tabUrl);
  if (!sig) {
    return null;
  }
  return getLeadSearchSessionKey(sig.query ?? '', sig.sessionId);
}

export function leadSearchTabUrlsMatch(a: string, b: string): boolean {
  const sigA = getLeadSearchTabSignature(a);
  const sigB = getLeadSearchTabSignature(b);
  if (!sigA || !sigB) {
    return false;
  }
  return leadSearchTabSignaturesEqual(sigA, sigB);
}

export function findSearchSessionForTabUrl(
  sessions: SearchSession[],
  tabUrl: string,
): SearchSession | null {
  const matching = sessions.filter(
    s => s.tabUrl && leadSearchTabUrlsMatch(s.tabUrl, tabUrl),
  );
  if (matching.length === 0) {
    return null;
  }
  return matching.sort((a, b) => b.updatedAt - a.updatedAt)[0];
}

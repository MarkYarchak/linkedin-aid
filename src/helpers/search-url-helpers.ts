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
  return a.origin === b.origin
    && a.pathname === b.pathname
    && a.query === b.query
    && a.sessionId === b.sessionId;
}

export function leadSearchTabUrlsMatch(a: string, b: string): boolean {
  const sigA = getLeadSearchTabSignature(a);
  const sigB = getLeadSearchTabSignature(b);
  if (!sigA || !sigB) {
    return false;
  }
  return leadSearchTabSignaturesEqual(sigA, sigB);
}

/** Stable session storage key from a Sales Navigator people-search tab URL. */
export function getLeadSearchTabSessionKey(tabUrl: string): string | null {
  const sig = getLeadSearchTabSignature(tabUrl);
  if (!sig) {
    return null;
  }
  const query = sig.query ?? '';
  const sessionId = sig.sessionId ?? '';
  return `${sig.origin}${sig.pathname}?query=${query}&sessionId=${sessionId}`;
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

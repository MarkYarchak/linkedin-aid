import { BASE_URL } from '@/constants/urls';
import { parseLinkedInUrn } from '@/helpers/urn';

export function isSalesNavigatorLeadUrl(url: string): boolean {
  return /\/sales\/lead\/[^/?#]+/.test(url);
}

export function isSalesNavigatorCompanyUrl(url: string): boolean {
  return /\/sales\/company\/[^/?#]+/.test(url);
}

export function isSalesNavigatorPeopleSearchUrl(url: string): boolean {
  return /\/sales\/search\/people/.test(url);
}

export function isSalesNavigatorCompanySearchUrl(url: string): boolean {
  return /\/sales\/search\/company/.test(url);
}

export function getSalesNavigatorCompanyUrl(urn: string): string | null {
  try {
    const { id } = parseLinkedInUrn(urn);
    return `${BASE_URL}/sales/company/${id}`;
  } catch (e) {
    return null;
  }
}

export function getSalesNavigatorLeadUrl(urn: string): string | null {
  try {
    const { id } = parseLinkedInUrn(urn);
    return `${BASE_URL}/sales/lead/${id}`;
  } catch (e) {
    return null;
  }
}

export function normalizeSalesNavigatorLeadUrl(url: string): string {
  const normalized = normalizeUrl(url);
  // Matches .../sales/lead/ID where ID can be (ID) or just ID
  const match = normalized.match(/(.*\/sales\/lead\/)\(?([^/?#)]+)\)?/);
  if (match) {
    const [, prefix, id] = match;
    return `${prefix}${id}`;
  }
  return normalized;
}

export function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.origin + parsed.pathname;
  } catch (e) {
    return url.split(/[?#]/)[0];
  }
}

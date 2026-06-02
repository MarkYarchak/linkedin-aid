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

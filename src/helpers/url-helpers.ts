import { BASE_URL } from '@/constants/urls';
import { parseLinkedInUrn } from '@/helpers/urn';

export function isSalesNavigatorLeadUrl(url: string): boolean {
  return /\/sales\/lead\/[^/?#]+/.test(url);
}

export function isSalesNavigatorCompanyUrl(url: string): boolean {
  return /\/sales\/company\/[^/?#]+/.test(url);
}

export function getSalesNavigatorCompanyUrl(urn: string): string | null {
  try {
    const { id } = parseLinkedInUrn(urn);
    return `${BASE_URL}/sales/company/${id}`;
  } catch (e) {
    return null;
  }
}

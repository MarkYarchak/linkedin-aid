export function isSalesNavigatorLeadUrl(url: string): boolean {
  return /\/sales\/lead\/[^/?#]+/.test(url);
}

export function isSalesNavigatorCompanyUrl(url: string): boolean {
  return /\/sales\/company\/[^/?#]+/.test(url);
}

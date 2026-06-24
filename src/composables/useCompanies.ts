import { computed } from 'vue';
import { getSalesNavigatorCompanyUrl, normalizeUrl } from '@/helpers/url-helpers';
import { useDataStore } from '@/store/data-store';

export function useCompanies(tabUrl?: string) {
  const { companiesMap, loadData } = useDataStore();

  const companies = computed(() => {
    return Object.values(companiesMap.value).sort((a, b) => b.updatedAt - a.updatedAt);
  });

  const currentUrlCompany = computed(() => {
    if (!tabUrl) return null;
    const profileUrl = normalizeUrl(tabUrl);
    return companies.value.find(company => {
      const storedUrl = company.profileUrl || getSalesNavigatorCompanyUrl(company.entityUrn);
      return storedUrl ? normalizeUrl(storedUrl) === profileUrl : false;
    }) || null;
  });

  return {
    companies,
    currentUrlCompany,
    loadCompanies: loadData,
  };
}

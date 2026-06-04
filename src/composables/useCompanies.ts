import { ref, onMounted, computed, onUnmounted } from 'vue';
import { browser } from 'wxt/browser';
import { getSalesNavigatorCompanyUrl, normalizeUrl } from '@/helpers/url-helpers';
import type { Company } from '@/types/company/company';

export function useCompanies(tabUrl?: string) {
  const companiesMap = ref<Record<string, Company>>({});

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

  const loadCompanies = async () => {
    const storage = await browser.storage.local.get(['capturedCompanies']);
    if (storage.capturedCompanies) {
      companiesMap.value = storage.capturedCompanies as Record<string, Company>;
    }
  };

  const changesListener = (changes: any, areaName: string) => {
    if (areaName === 'local' && changes.capturedCompanies) {
      companiesMap.value = changes.capturedCompanies.newValue as Record<string, Company>;
    }
  };

  onMounted(() => {
    loadCompanies();

    browser.storage.onChanged.addListener(changesListener);
  });

  onUnmounted(() => {
    browser.storage.onChanged.removeListener(changesListener);
  });

  return {
    companies,
    currentUrlCompany,
    loadCompanies,
  };
}

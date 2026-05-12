import { ref, onMounted, computed, onUnmounted } from 'vue';
import { browser } from 'wxt/browser';
import type { Company } from '@/types/company/company';

export function useCompanies(tabUrl?: string) {
  const companies = ref<Record<string, Company>>({});

  const sortedCompanies = computed(() => {
    let result = Object.values(companies.value);

    if (tabUrl) {
      result = result.filter(company => company.profileUrl === tabUrl);
    }

    return result.sort((a, b) => b.updatedAt - a.updatedAt);
  });

  const loadCompanies = async () => {
    const storage = await browser.storage.local.get(['capturedCompanies']);
    if (storage.capturedCompanies) {
      companies.value = storage.capturedCompanies as Record<string, Company>;
    }
  };

  const changesListener = (changes: any, areaName: string) => {
    if (areaName === 'local' && changes.capturedCompanies) {
      companies.value = changes.capturedCompanies.newValue as Record<string, Company>;
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
    sortedCompanies,
    loadCompanies,
  };
}

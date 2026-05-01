import { ref, onMounted, computed } from 'vue';
import { browser } from 'wxt/browser';
import type { Lead } from '@/types/lead';

export function useLeads(tabUrl?: string) {
  const leads = ref<Record<string, Lead>>({});

  const sortedLeads = computed(() => {
    let result = Object.values(leads.value);
    
    if (tabUrl) {
      result = result.filter(lead => lead.profileUrl === tabUrl);
    }
    
    return result.sort((a, b) => b.updatedAt - a.updatedAt);
  });

  const loadLeads = async () => {
    const storage = await browser.storage.local.get(['capturedLeads']);
    if (storage.capturedLeads) {
      leads.value = storage.capturedLeads as Record<string, Lead>;
    }
  };

  onMounted(() => {
    loadLeads();

    const listener = (changes: any, areaName: string) => {
      if (areaName === 'local' && changes.capturedLeads) {
        leads.value = changes.capturedLeads.newValue as Record<string, Lead>;
      }
    };

    browser.storage.onChanged.addListener(listener);
    return () => browser.storage.onChanged.removeListener(listener);
  });

  return {
    leads,
    sortedLeads,
    loadLeads,
  };
}

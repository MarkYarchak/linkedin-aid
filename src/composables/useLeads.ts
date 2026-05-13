import { ref, onMounted, onUnmounted, computed } from 'vue';
import { browser } from 'wxt/browser';
import type { Lead } from '@/types/lead/lead';

export function useLeads(tabUrl?: string) {
  const leadsMap = ref<Record<string, Lead>>({});

  const leads = computed(() => {
    return Object.values(leadsMap.value).sort((a, b) => b.updatedAt - a.updatedAt);
  });

  const currentUrlLead = computed(() => {
    if (!tabUrl) return null;
    return leads.value.find(lead => lead.profileUrl === tabUrl) || null;
  });

  const loadLeads = async () => {
    const storage = await browser.storage.local.get(['capturedLeads']);
    if (storage.capturedLeads) {
      leadsMap.value = storage.capturedLeads as Record<string, Lead>;
    }
  };


  const changesListener = (changes: any, areaName: string) => {
    if (areaName === 'local' && changes.capturedLeads) {
      leadsMap.value = changes.capturedLeads.newValue as Record<string, Lead>;
    }
  };

  onMounted(() => {
    loadLeads();

    browser.storage.onChanged.addListener(changesListener);
  });

  onUnmounted(() => {
    browser.storage.onChanged.removeListener(changesListener);
  });

  return {
    leads,
    currentUrlLead,
    loadLeads,
  };
}

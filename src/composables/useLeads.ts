import { ref, onMounted, onUnmounted, computed } from 'vue';
import { browser } from 'wxt/browser';
import { normalizeSalesNavigatorLeadUrl } from '@/helpers/url-helpers';
import { normalizePersonaSearchId } from '@/helpers/urn';
import type { Lead } from '@/types/lead/lead';
import type { SearchSession } from '@/types/search/search';

export function useLeads(tabUrl?: string) {
  const leadsMap = ref<Record<string, Lead>>({});
  const sessionsMap = ref<Record<string, SearchSession>>({});

  const leads = computed(() => {
    return Object.values(leadsMap.value).sort((a, b) => b.updatedAt - a.updatedAt);
  });

  const sessions = computed(() => {
    return Object.values(sessionsMap.value);
  });

  const getSessionsByCompany = (companyUrn: string) => {
    return sessions.value.filter(s => s.companyUrn === companyUrn);
  };

  const companyUrns = computed(() => {
    const map: Record<string, string[]> = {};
    sessions.value.forEach(s => {
      if (s.companyUrn) {
        if (!map[s.companyUrn]) map[s.companyUrn] = [];
        Object.values(s.leadUrnsByPage).forEach(pageUrns => {
          pageUrns.forEach(urn => {
            if (!map[s.companyUrn!].includes(urn)) map[s.companyUrn!].push(urn);
          });
        });
      }
    });
    return map;
  });

  const getLeadsByCompany = (companyUrn: string) => {
    const leadUrns = companyUrns.value[companyUrn] || [];
    return leadUrns.map(urn => leadsMap.value[urn]).filter(Boolean);
  };

  const getLeadsByPersona = (companyUrn: string, personaId?: string) => {
    const normalizedPersonaId = personaId ? normalizePersonaSearchId(personaId) : undefined;
    const personaSessions = getSessionsByCompany(companyUrn).filter(s => {
      if (normalizedPersonaId) {
        return s.personaId && normalizePersonaSearchId(s.personaId) === normalizedPersonaId;
      }
      return !!s.personaId;
    });
    const leadUrns = new Set<string>();
    personaSessions.forEach(session => {
      Object.values(session.leadUrnsByPage).forEach(pageUrns => {
        pageUrns.forEach(urn => leadUrns.add(urn));
      });
    });
    return Array.from(leadUrns).map(urn => leadsMap.value[urn]).filter(Boolean);
  };

  const getSavedLeadsByCompany = (companyUrn: string) => {
    return getLeadsByCompany(companyUrn).filter(lead => lead.searchResult?.saved);
  };

  const currentUrlLead = computed(() => {
    if (!tabUrl) return null;
    const profileUrl = normalizeSalesNavigatorLeadUrl(tabUrl);
    return leads.value.find(lead => {
      if (!lead.profileUrl) return false;
      return normalizeSalesNavigatorLeadUrl(lead.profileUrl) === profileUrl;
    }) || null;
  });

  const loadData = async () => {
    const [leadsStorage, sessionsStorage] = await Promise.all([
      browser.storage.local.get(['capturedLeads']),
      browser.storage.session.get(['searchSessions'])
    ]);

    if (leadsStorage.capturedLeads) {
      leadsMap.value = leadsStorage.capturedLeads as Record<string, Lead>;
    }
    if (sessionsStorage.searchSessions) {
      sessionsMap.value = sessionsStorage.searchSessions as Record<string, SearchSession>;
    }
  };


  const changesListener = (changes: any, areaName: string) => {
    if (areaName === 'local' && changes.capturedLeads) {
      leadsMap.value = changes.capturedLeads.newValue as Record<string, Lead>;
    }
    if (areaName === 'session' && changes.searchSessions) {
      sessionsMap.value = changes.searchSessions.newValue as Record<string, SearchSession>;
    }
  };

  onMounted(() => {
    loadData();

    browser.storage.onChanged.addListener(changesListener);
  });

  onUnmounted(() => {
    browser.storage.onChanged.removeListener(changesListener);
  });

  return {
    leads,
    currentUrlLead,
    getLeadsByCompany,
    getLeadsByPersona,
    getSavedLeadsByCompany,
    loadLeads: loadData,
  };
}

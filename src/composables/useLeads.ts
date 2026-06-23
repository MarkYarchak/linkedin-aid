import { ref, onMounted, onUnmounted, computed } from 'vue';
import { browser } from 'wxt/browser';
import { normalizeSalesNavigatorLeadUrl } from '@/helpers/url-helpers';
import { normalizePersonaSearchId } from '@/helpers/urn';
import { useSearchSessions } from '@/composables/useSearchSessions';
import type { Lead } from '@/types/lead/lead';

export function useLeads(tabUrl?: string) {
  const { sessions, searchPageSessions, getSessionsByCompany } = useSearchSessions();
  const leadsMap = ref<Record<string, Lead>>({});

  const leads = computed(() => {
    return Object.values(leadsMap.value).sort((a, b) => b.updatedAt - a.updatedAt);
  });

  const getLeadByUrn = (urn: string) => {
    return leadsMap.value[urn];
  };

  const companyUrns = computed(() => {
    const map: Record<string, string[]> = {};
    searchPageSessions.value.forEach(s => {
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

  const getLeadsByCompany = (companyUrn: string, includeAllSessions = false) => {
    let leadUrns: string[];
    if (includeAllSessions) {
      const set = new Set<string>();
      sessions.value
        .filter(s => s.companyUrn === companyUrn)
        .forEach(s => {
          Object.values(s.leadUrnsByPage).forEach(pageUrns => {
            pageUrns.forEach(urn => set.add(urn));
          });
        });
      leadUrns = Array.from(set);
    } else {
      leadUrns = companyUrns.value[companyUrn] || [];
    }
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
    return getLeadsByCompany(companyUrn, true).filter(lead => lead.searchResult?.saved);
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
    const [leadsStorage] = await Promise.all([
      browser.storage.local.get(['capturedLeads']),
    ]);

    if (leadsStorage.capturedLeads) {
      leadsMap.value = leadsStorage.capturedLeads as Record<string, Lead>;
    }
  };


  const changesListener = (changes: any, areaName: string) => {
    if (areaName === 'local' && changes.capturedLeads) {
      leadsMap.value = changes.capturedLeads.newValue as Record<string, Lead>;
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
    getLeadByUrn,
    getLeadsByCompany,
    getLeadsByPersona,
    getSavedLeadsByCompany,
    loadLeads: loadData,
  };
}

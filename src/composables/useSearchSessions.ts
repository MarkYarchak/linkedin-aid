import { computed } from 'vue';
import { findSearchSessionForTabUrl } from '@/helpers/search-url-helpers';
import { useDataStore } from '@/store/data-store';
import { SearchSessionSource } from '@/types/search/search';

export function useSearchSessions(tabUrl?: string) {
  const { sessionsMap, loadData } = useDataStore();

  const sessions = computed(() => {
    return Object.values(sessionsMap.value).sort((a, b) => b.updatedAt - a.updatedAt);
  });

  const searchPageSessions = computed(() => {
    return sessions.value.filter(s => s.source === SearchSessionSource.SEARCH);
  });

  const currentSession = computed(() => {
    if (!tabUrl) return null;
    return findSearchSessionForTabUrl(sessions.value, tabUrl);
  });

  const getSessionsByCompany = (companyUrn: string, source?: SearchSessionSource) => {
    return sessions.value.filter(s => s.companyUrn === companyUrn && (!source || s.source === source));
  };

  return {
    sessions,
    searchPageSessions,
    currentSession,
    getSessionsByCompany,
    loadSessions: loadData,
  };
}

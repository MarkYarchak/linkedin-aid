import { ref, onMounted, onUnmounted, computed } from 'vue';
import { browser } from 'wxt/browser';
import type { SearchSession } from '@/types/search/search';

export function useSearchSessions(tabUrl?: string) {
  const sessionsMap = ref<Record<string, SearchSession>>({});

  const sessions = computed(() => {
    return Object.values(sessionsMap.value).sort((a, b) => b.updatedAt - a.updatedAt);
  });

  const currentSessionId = computed(() => {
    if (!tabUrl) return null;
    try {
      const url = new URL(tabUrl);
      return url.searchParams.get('sessionId');
    } catch (e) {
      return null;
    }
  });

  const currentSession = computed(() => {
    if (currentSessionId.value === null) return null;
    return sessionsMap.value[currentSessionId.value] || null;
  });

  const loadSessions = async () => {
    const storage = await browser.storage.session.get('searchSessions');
    if (storage.searchSessions) {
      sessionsMap.value = storage.searchSessions as Record<string, SearchSession>;
    }
  };

  const changesListener = (changes: any, areaName: string) => {
    if (areaName === 'session' && changes.searchSessions) {
      sessionsMap.value = changes.searchSessions.newValue as Record<string, SearchSession>;
    }
  };

  onMounted(() => {
    loadSessions();
    browser.storage.onChanged.addListener(changesListener);
  });

  onUnmounted(() => {
    browser.storage.onChanged.removeListener(changesListener);
  });

  return {
    sessions,
    currentSession,
    loadSessions,
  };
}

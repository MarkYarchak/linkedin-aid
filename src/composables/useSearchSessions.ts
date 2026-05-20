import { ref, onMounted, onUnmounted, computed, watchEffect } from 'vue';
import { browser } from 'wxt/browser';
import type { SearchSession } from '@/types/search/search';

export function useSearchSessions(tabUrl?: string) {
  const sessionsMap = ref<Record<string, SearchSession>>({});
  const currentSessionId = ref<string | null>(null);

  const sessions = computed(() => {
    return Object.values(sessionsMap.value).sort((a, b) => b.updatedAt - a.updatedAt);
  });

  const currentSession = computed(() => {
    if (currentSessionId.value === null) return null;
    return sessionsMap.value[currentSessionId.value] || null;
  });

  watchEffect(() => {
    if (sessions.value.length > 0 && currentSessionId.value === null) {
      if (tabUrl) {
        try {
          const url = new URL(tabUrl);
          const sessionIdFromUrl = url.searchParams.get('sessionId');
          if (sessionIdFromUrl && sessionsMap.value[sessionIdFromUrl]) {
            currentSessionId.value = sessionIdFromUrl;
            return;
          }
        } catch (e) {
          // ignore
        }
      }
      currentSessionId.value = sessions.value[0].sessionId;
    }
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
    currentSessionId,
    currentSession,
    loadSessions,
  };
}

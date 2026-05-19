import { ref, onMounted, onUnmounted, computed } from 'vue';
import { browser } from 'wxt/browser';
import type { SearchSession } from '@/types/search/search';

export function useSearchSessions() {
  const sessionsMap = ref<Record<number, SearchSession>>({});
  const currentSessionId = ref<number | null>(null);

  const sessions = computed(() => {
    return Object.values(sessionsMap.value).sort((a, b) => b.updatedAt - a.updatedAt);
  });

  const currentSession = computed(() => {
    if (currentSessionId.value === null) return null;
    return sessionsMap.value[currentSessionId.value] || null;
  });

  const loadSessions = async () => {
    const storage = await browser.storage.local.get('searchSessions');
    if (storage.searchSessions) {
      sessionsMap.value = storage.searchSessions as Record<number, SearchSession>;
    }
  };

  const changesListener = (changes: any, areaName: string) => {
    if (areaName === 'local' && changes.searchSessions) {
      sessionsMap.value = changes.searchSessions.newValue as Record<number, SearchSession>;
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

import { ref, onMounted, onUnmounted, computed } from 'vue';
import { browser } from 'wxt/browser';
import type { PersonasStorage } from '@/types/search/search';
import type { Persona } from '@/types/search/salesApiPersonas';

export function usePersonas() {
  const personasStorage = ref<PersonasStorage>({ general: [], byCompany: {} });

  const generalPersonas = computed(() => personasStorage.value.general);
  const companyPersonasMap = computed(() => personasStorage.value.byCompany);

  const getPersonasByCompany = (companyUrn: string): Persona[] => {
    return companyPersonasMap.value[companyUrn] || [];
  };

  const loadPersonas = async () => {
    const storage = await browser.storage.session.get(['personas']);
    if (storage.personas) {
      personasStorage.value = storage.personas as PersonasStorage;
    }
  };

  const changesListener = (changes: any, areaName: string) => {
    if (areaName === 'session' && changes.personas) {
      personasStorage.value = changes.personas.newValue as PersonasStorage;
    }
  };

  onMounted(() => {
    loadPersonas();
    browser.storage.onChanged.addListener(changesListener);
  });

  onUnmounted(() => {
    browser.storage.onChanged.removeListener(changesListener);
  });

  return {
    generalPersonas,
    companyPersonasMap,
    getPersonasByCompany,
    loadPersonas,
  };
}

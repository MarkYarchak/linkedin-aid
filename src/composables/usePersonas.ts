import { computed } from 'vue';
import { useDataStore } from '@/store/data-store';
import type { DeepReadonly } from 'vue';
import type { Persona } from '@/types/search/salesApiPersonas';

export function usePersonas() {
  const { personasStorage, loadData } = useDataStore();

  const generalPersonas = computed(() => personasStorage.value.general);
  const companyPersonasMap = computed(() => personasStorage.value.byCompany);

  const getPersonasByCompany = (companyUrn: string): DeepReadonly<Persona[]> => {
    return companyPersonasMap.value[companyUrn] || [];
  };

  return {
    generalPersonas,
    companyPersonasMap,
    getPersonasByCompany,
    loadPersonas: loadData,
  };
}

import { ref, readonly } from 'vue';
import { browser } from 'wxt/browser';
import { liveQuery } from 'dexie';
import { db } from '@/db/schema';
import type { Lead } from '@/types/lead/lead';
import type { Company } from '@/types/company/company';
import type { SearchSession, PersonasStorage } from '@/types/search/search';

export type SessionData = { searchSessions: Record<string, SearchSession>, personas: PersonasStorage };
export type CustomStorageChange<T = unknown> = { oldValue: T, newValue: T };

const leadsMap = ref<Record<string, Lead>>({});
const companiesMap = ref<Record<string, Company>>({});
const sessionsMap = ref<Record<string, SearchSession>>({});
const personasStorage = ref<PersonasStorage>({ general: [], byCompany: {} });
const isLoaded = ref(false);

// Sync Dexie to Vue refs
liveQuery(() => db.leads.toArray()).subscribe((leads) => {
  const map: Record<string, Lead> = {};
  leads.forEach(l => map[l.entityUrn] = l);
  leadsMap.value = map;
});

liveQuery(() => db.companies.toArray()).subscribe((companies) => {
  const map: Record<string, Company> = {};
  companies.forEach(c => map[c.entityUrn] = c);
  companiesMap.value = map;
});

const loadData = async () => {
  const session = await browser.storage.session.get<SessionData>(['searchSessions', 'personas']);

  if (session.searchSessions) sessionsMap.value = session.searchSessions;
  if (session.personas) personasStorage.value = session.personas;
  isLoaded.value = true;
};

// Listen for changes and update partially
browser.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'session') {
    if (changes.searchSessions) {
      const { oldValue, newValue } = changes.searchSessions as CustomStorageChange<SessionData['searchSessions']>;
      if (newValue && oldValue && Object.keys(newValue).length === Object.keys(oldValue).length + 1) {
        const newKeys = Object.keys(newValue).filter(k => !oldValue[k]);
        if (newKeys.length === 1) {
          sessionsMap.value[newKeys[0]] = newValue[newKeys[0]];
          return;
        }
      }
      sessionsMap.value = newValue || {};
    }
    if (changes.personas) {
      const { newValue } = changes.personas as CustomStorageChange<SessionData['personas']>;
      personasStorage.value = newValue || { general: [], byCompany: {} };
    }
  }
});

export const useDataStore = () => {
  return {
    leadsMap: readonly(leadsMap),
    companiesMap: readonly(companiesMap),
    sessionsMap: readonly(sessionsMap),
    personasStorage: readonly(personasStorage),
    isLoaded: readonly(isLoaded),
    loadData,
  };
};

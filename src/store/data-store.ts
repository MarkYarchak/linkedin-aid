import { ref, readonly } from 'vue';
import { browser } from 'wxt/browser';
import type { Lead } from '@/types/lead/lead';
import type { Company } from '@/types/company/company';
import type { SearchSession, PersonasStorage } from '@/types/search/search';

export type LocalData = { capturedLeads: Record<string, Lead>, capturedCompanies: Record<string, Company> };
export type SessionData = { searchSessions: Record<string, SearchSession>, personas: PersonasStorage };
export type CustomStorageChange<T = unknown> = { oldValue: T, newValue: T };

const leadsMap = ref<Record<string, Lead>>({});
const companiesMap = ref<Record<string, Company>>({});
const sessionsMap = ref<Record<string, SearchSession>>({});
const personasStorage = ref<PersonasStorage>({ general: [], byCompany: {} });
const isLoaded = ref(false);

const loadData = async () => {
  const [local, session] = await Promise.all([
    browser.storage.local.get<LocalData>(['capturedLeads', 'capturedCompanies']),
    browser.storage.session.get<SessionData>(['searchSessions', 'personas']),
  ]);

  if (local.capturedLeads) leadsMap.value = local.capturedLeads;
  if (local.capturedCompanies) companiesMap.value = local.capturedCompanies;
  if (session.searchSessions) sessionsMap.value = session.searchSessions;
  if (session.personas) personasStorage.value = session.personas;
  isLoaded.value = true;
};

// Listen for changes and update partially
browser.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local') {
    if (changes.capturedLeads) {
      const { oldValue, newValue } = changes.capturedLeads as CustomStorageChange<LocalData['capturedLeads']>;
      if (newValue && oldValue && Object.keys(newValue).length === Object.keys(oldValue).length + 1) {
        // Find the new key
        const newKeys = Object.keys(newValue).filter(k => !oldValue[k]);
        if (newKeys.length === 1) {
          leadsMap.value[newKeys[0]] = newValue[newKeys[0]];
          return;
        }
      }
      leadsMap.value = newValue || {};
    }
    if (changes.capturedCompanies) {
      const { oldValue, newValue } = changes.capturedCompanies as CustomStorageChange<LocalData['capturedCompanies']>;
      if (newValue && oldValue && Object.keys(newValue).length === Object.keys(oldValue).length + 1) {
        const newKeys = Object.keys(newValue).filter(k => !oldValue[k]);
        if (newKeys.length === 1) {
          companiesMap.value[newKeys[0]] = newValue[newKeys[0]];
          return;
        }
      }
      companiesMap.value = newValue || {};
    }
  } else if (areaName === 'session') {
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
      const { newValue } = changes.searchSessions as CustomStorageChange<SessionData['personas']>;
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

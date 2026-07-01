import { ref, readonly } from 'vue';
import { browser } from 'wxt/browser';
import { liveQuery } from 'dexie';
import ms from 'ms';
import { db } from '@/db/schema';
import type { Lead } from '@/types/lead/lead';
import type { Company } from '@/types/company/company';
import type { SearchSession, PersonasStorage } from '@/types/search/search';
import type { CopyLeadSettings } from '@/types/copy-lead-settings';

export type SessionData = {
  searchSessions: Record<string, SearchSession>,
  personas: PersonasStorage,
  lead_titles: Record<string, string>,
};

export type LocalData = {
  copyLeadSettings: CopyLeadSettings,
  bulkCopyLeadSettings: {
    leadFields?: any;
    prefix?: string;
    viewMode?: string;
    wrapText?: boolean;
  },
};

export type CustomStorageChange<T = unknown> = { oldValue: T, newValue: T };

const leadsMap = ref<Record<string, Lead>>({});
const companiesMap = ref<Record<string, Company>>({});
const sessionsMap = ref<Record<string, SearchSession>>({});
const personasStorage = ref<PersonasStorage>({ general: [], byCompany: {} });
const leadTitles = ref<Record<string, string>>({});
const copyLeadSettings = ref<CopyLeadSettings | null>(null);
const bulkCopyLeadSettings = ref<LocalData['bulkCopyLeadSettings'] | null>(null);
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

const cleanupOldData = async () => {
  const threshold = Date.now() - ms('30d');

  const oldLeadsCount = await db.leads.where('updatedAt').below(threshold).delete();
  const oldCompaniesCount = await db.companies.where('updatedAt').below(threshold).delete();

  if (oldLeadsCount > 0 || oldCompaniesCount > 0) {
    console.log(`Cleaned up ${oldLeadsCount} leads and ${oldCompaniesCount} companies older than 30 days.`);
  }
};

const loadData = async () => {
  await cleanupOldData();

  const [session, local] = await Promise.all([
    browser.storage.session.get<SessionData>(['searchSessions', 'personas', 'lead_titles']),
    browser.storage.local.get<LocalData>(['copyLeadSettings', 'bulkCopyLeadSettings']),
  ]);

  if (session.searchSessions) sessionsMap.value = session.searchSessions;
  if (session.personas) personasStorage.value = session.personas;
  if (session.lead_titles) leadTitles.value = session.lead_titles;

  if (local.copyLeadSettings) copyLeadSettings.value = local.copyLeadSettings;
  if (local.bulkCopyLeadSettings) bulkCopyLeadSettings.value = local.bulkCopyLeadSettings;

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
    if (changes.lead_titles) {
      const { newValue } = changes.lead_titles as CustomStorageChange<SessionData['lead_titles']>;
      leadTitles.value = newValue || {};
    }
  }

  if (areaName === 'local') {
    if (changes.copyLeadSettings) {
      const { newValue } = changes.copyLeadSettings as CustomStorageChange<LocalData['copyLeadSettings']>;
      copyLeadSettings.value = newValue || null;
    }
    if (changes.bulkCopyLeadSettings) {
      const { newValue } = changes.bulkCopyLeadSettings as CustomStorageChange<LocalData['bulkCopyLeadSettings']>;
      bulkCopyLeadSettings.value = newValue || null;
    }
  }
});

export const useDataStore = () => {
  return {
    leadsMap: readonly(leadsMap),
    companiesMap: readonly(companiesMap),
    sessionsMap: readonly(sessionsMap),
    personasStorage: readonly(personasStorage),
    leadTitles: readonly(leadTitles),
    copyLeadSettings: readonly(copyLeadSettings),
    bulkCopyLeadSettings: readonly(bulkCopyLeadSettings),
    isLoaded: readonly(isLoaded),
    loadData,
  };
};

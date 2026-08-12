import { ref, readonly, computed } from 'vue';
import { browser } from 'wxt/browser';
import { liveQuery } from 'dexie';
import ms from 'ms';
import { db } from '@/db/schema';
import { storageService } from '@/services/storage-service';
import type { Lead } from '@/types/lead/lead';
import type { Company } from '@/types/company/company';
import type { SearchSession, PersonasStorage } from '@/types/search/search';
import type { LeadPositionRelation } from '@/types/lead/lead-position-relation';
import type { CopyLeadSettings, BulkCopyLeadSettings } from '@/types/copy-lead-settings';

export type SessionData = {
  personas: PersonasStorage,
  lead_titles: Record<string, string>,
};

export type LocalData = {
  theme: 'light' | 'dark' | 'system',
  copyLeadSettings: CopyLeadSettings,
  bulkCopyLeadSettings: BulkCopyLeadSettings,
  entitiesTTL?: number,
};

export type CustomStorageChange<T = unknown> = { oldValue: T, newValue: T };
export type LeadsMap = Record<string, Lead>;
export type CompaniesMap = Record<string, Company>;

const leadsMap = ref<LeadsMap>({});
const companiesMap = ref<CompaniesMap>({});
const sessionsMap = ref<Record<string, SearchSession>>({});
const leadPositionRelations = ref<LeadPositionRelation[]>([]);
const personasStorage = ref<PersonasStorage>({ general: [], byCompany: {} });
const leadTitles = ref<Record<string, string>>({});
const copyLeadSettings = ref<CopyLeadSettings | null>(null);
const bulkCopyLeadSettings = ref<LocalData['bulkCopyLeadSettings'] | null>(null);
const entitiesTTL = ref<number>(30);
const theme = ref<LocalData['theme']>('system');
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

liveQuery(() => db.searchSessions.toArray()).subscribe((sessions) => {
  const map: Record<string, SearchSession> = {};
  sessions.forEach(s => map[s.id] = s);
  sessionsMap.value = map;
});

liveQuery(() => db.leadPositionRelations.toArray()).subscribe((relations) => {
  leadPositionRelations.value = relations;
});

const cleanupOldData = async () => {
  if (entitiesTTL.value === -1) return;

  const threshold = Date.now() - ms(`${entitiesTTL.value}d`);

  const oldLeadUrns = await db.leads.where('updatedAt').below(threshold).primaryKeys();
  const oldCompaniesCount = await db.companies.where('updatedAt').below(threshold).delete();
  const oldSessionsCount = await db.searchSessions.where('updatedAt').below(threshold).delete();

  if (oldLeadUrns.length > 0) {
    await db.transaction('rw', db.leads, db.leadPositionRelations, async () => {
      await db.leads.bulkDelete(oldLeadUrns);
      await db.leadPositionRelations.where('leadUrn').anyOf(oldLeadUrns).delete();
    });
  }

  if (oldLeadUrns.length > 0 || oldCompaniesCount > 0 || oldSessionsCount > 0) {
    console.log(`Cleaned up ${oldLeadUrns.length} leads (and their relations), ${oldCompaniesCount} companies, and ${oldSessionsCount} sessions older than ${entitiesTTL.value} days.`);
  }
};

const loadData = async () => {
  const [session, local] = await Promise.all([
    storageService.getSession(['personas', 'lead_titles']),
    storageService.getLocal(['copyLeadSettings', 'bulkCopyLeadSettings', 'entitiesTTL', 'theme']),
  ]);

  if (session.personas) personasStorage.value = session.personas;
  if (session.lead_titles) leadTitles.value = session.lead_titles;

  if (local.copyLeadSettings) copyLeadSettings.value = local.copyLeadSettings;
  if (local.bulkCopyLeadSettings) bulkCopyLeadSettings.value = local.bulkCopyLeadSettings;
  if (local.entitiesTTL !== undefined) entitiesTTL.value = local.entitiesTTL;
  if (local.theme) theme.value = local.theme;

  await cleanupOldData();

  isLoaded.value = true;
};

// Listen for changes and update partially
browser.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'session') {
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
    if (changes.entitiesTTL) {
      const { newValue } = changes.entitiesTTL as CustomStorageChange<LocalData['entitiesTTL']>;
      entitiesTTL.value = newValue || 30;
    }
    if (changes.theme) {
      const { newValue } = changes.theme as CustomStorageChange<LocalData['theme']>;
      theme.value = newValue || 'system';
    }
  }
});

export const useDataStore = () => {
  const leadPositionRelationsMap = computed(() => {
    const map: Record<string, Record<number, string>> = {};
    leadPositionRelations.value.forEach(r => {
      map[r.leadUrn] = r.relations;
    });
    return map;
  });

  return {
    leadsMap: readonly(leadsMap),
    companiesMap: readonly(companiesMap),
    sessionsMap: readonly(sessionsMap),
    leadPositionRelationsMap,
    personasStorage: readonly(personasStorage),
    leadTitles: readonly(leadTitles),
    copyLeadSettings: readonly(copyLeadSettings),
    bulkCopyLeadSettings: readonly(bulkCopyLeadSettings),
    entitiesTTL: readonly(entitiesTTL),
    theme: readonly(theme),
    isLoaded: readonly(isLoaded),
    loadData,
  };
};

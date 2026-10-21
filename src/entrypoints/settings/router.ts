import {
  createRouter,
  createWebHashHistory,
} from 'vue-router';

const SettingsGeneralPage = defineAsyncComponent(() => import('@/entrypoints/settings/pages/SettingsGeneralPage.vue'));
const SettingsCapturedEntitiesPage = defineAsyncComponent(() => import('@/entrypoints/settings/pages/SettingsCapturedEntitiesPage.vue'));
const SettingsSessionsPage = defineAsyncComponent(() => import('@/entrypoints/settings/pages/SettingsSessionsPage.vue'));
const SettingsTitlesPage = defineAsyncComponent(() => import('@/entrypoints/settings/pages/SettingsTitlesPage.vue'));
const SettingsCopyPage = defineAsyncComponent(() => import('@/entrypoints/settings/pages/SettingsCopyPage.vue'));
const SettingsCrmPage = defineAsyncComponent(() => import('@/entrypoints/settings/pages/crm/SettingsCrmPage.vue'));
const SettingsCrmEntitiesPage = defineAsyncComponent(() => import('@/entrypoints/settings/pages/crm/SettingsCrmEntitiesPage.vue'));
const SettingsAiTab = defineAsyncComponent(() => import('@/entrypoints/settings/pages/crm/SettingsAiPage.vue'));
const SettingsSignalsTab = defineAsyncComponent(() => import('@/entrypoints/settings/pages/crm/SettingsSignalsPage.vue'));
const SettingsInteractionsTab = defineAsyncComponent(() => import('@/entrypoints/settings/pages/crm/SettingsInteractionsPage.vue'));

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: SettingsGeneralPage },
    { path: '/captured-entities', component: SettingsCapturedEntitiesPage },
    { path: '/sessions', component: SettingsSessionsPage },
    { path: '/titles', component: SettingsTitlesPage },
    { path: '/copy', component: SettingsCopyPage },
    {
      path: '/crm',
      component: SettingsCrmPage,
      children: [
        { path: '', redirect: '/crm/entities' },
        { path: 'entities', component: SettingsCrmEntitiesPage },
        { path: 'ai', component: SettingsAiTab },
        { path: 'signals', component: SettingsSignalsTab },
        { path: 'interactions', component: SettingsInteractionsTab },
      ],
    },
  ],
});

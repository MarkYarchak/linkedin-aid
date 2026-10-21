import {
  createRouter,
  createWebHashHistory,
} from 'vue-router';

// Root pages
const SettingsGeneralPage = defineAsyncComponent(() => import('@/entrypoints/settings/pages/SettingsGeneralPage.vue'));
const SettingsCapturedEntitiesPage = defineAsyncComponent(() => import('@/entrypoints/settings/pages/SettingsCapturedEntitiesPage.vue'));
const SettingsSessionsPage = defineAsyncComponent(() => import('@/entrypoints/settings/pages/SettingsSessionsPage.vue'));
const SettingsTitlesPage = defineAsyncComponent(() => import('@/entrypoints/settings/pages/SettingsTitlesPage.vue'));
const SettingsCopyPage = defineAsyncComponent(() => import('@/entrypoints/settings/pages/SettingsCopyPage.vue'));
// CRM pages
const SettingsCrmPage = defineAsyncComponent(() => import('@/entrypoints/settings/pages/crm/SettingsCrmPage.vue'));
const SettingsCrmHomePage = defineAsyncComponent(() => import('@/entrypoints/settings/pages/crm/SettingsCrmHomePage.vue'));
const SettingsCrmEntitiesPage = defineAsyncComponent(() => import('@/entrypoints/settings/pages/crm/SettingsCrmEntitiesPage.vue'));
const SettingsCrmAiPage = defineAsyncComponent(() => import('@/entrypoints/settings/pages/crm/SettingsCrmAiPage.vue'));
const SettingsCrmSignalsTab = defineAsyncComponent(() => import('@/entrypoints/settings/pages/crm/SettingsCrmSignalsTab.vue'));
const SettingsCrmInteractionsTab = defineAsyncComponent(() => import('@/entrypoints/settings/pages/crm/SettingsCrmInteractionsTab.vue'));

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
        { path: '', component: SettingsCrmHomePage },
        { path: 'entities', component: SettingsCrmEntitiesPage },
        { path: 'ai', component: SettingsCrmAiPage },
        { path: 'signals', component: SettingsCrmSignalsTab },
        { path: 'interactions', component: SettingsCrmInteractionsTab },
      ],
    },
  ],
});

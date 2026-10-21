import {
  createRouter,
  createWebHashHistory,
} from 'vue-router';

const SettingsGeneralTab = defineAsyncComponent(() => import('@/entrypoints/settings/pages/SettingsGeneralTab.vue'));
const SettingsCapturedEntitiesTab = defineAsyncComponent(() => import('@/entrypoints/settings/pages/SettingsCapturedEntitiesTab.vue'));
const SettingsSessionsTab = defineAsyncComponent(() => import('@/entrypoints/settings/pages/SettingsSessionsTab.vue'));
const SettingsTitlesTab = defineAsyncComponent(() => import('@/entrypoints/settings/pages/SettingsTitlesTab.vue'));
const SettingsCopyTab = defineAsyncComponent(() => import('@/entrypoints/settings/pages/SettingsCopyTab.vue'));
const SettingsCrmTab = defineAsyncComponent(() => import('@/entrypoints/settings/pages/crm/SettingsCrmTab.vue'));

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: SettingsGeneralTab },
    { path: '/captured-entities', component: SettingsCapturedEntitiesTab },
    { path: '/sessions', component: SettingsSessionsTab },
    { path: '/titles', component: SettingsTitlesTab },
    { path: '/copy', component: SettingsCopyTab },
    { path: '/crm', component: SettingsCrmTab },
  ],
});

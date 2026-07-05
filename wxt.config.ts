import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  manifest: {
    name: 'LinkedIn AID',
    description: 'LinkedIn SN data interceptor & assistant',
    permissions: ['scripting', 'storage', 'tabs'],
    host_permissions: ['*://*.linkedin.com/*'],
    options_ui: {
      page: 'settings.html',
      open_in_tab: true,
    },
  },
  modules: ['@wxt-dev/module-vue'],
});

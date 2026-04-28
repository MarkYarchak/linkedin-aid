import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  manifest: {
    permissions: ['scripting', 'storage', 'tabs'],
    host_permissions: ['*://*.linkedin.com/*'],
  },
  modules: ['@wxt-dev/module-vue'],
});

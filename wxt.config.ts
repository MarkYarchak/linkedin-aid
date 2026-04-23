import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  manifest: {
    permissions: ['storage', 'tabs'],
  },
  modules: ['@wxt-dev/module-vue'],
});

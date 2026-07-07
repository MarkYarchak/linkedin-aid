import { watch } from 'vue';
import { useTheme as useVuetifyTheme, type ThemeInstance } from 'vuetify';
import { useDataStore } from '@/store/data-store';

export const useAppTheme = () => {
  let vuetifyTheme: ThemeInstance;
  try {
    vuetifyTheme = useVuetifyTheme();
  } catch (e) {
    // Vuetify not installed in this entry point
  }
  const { theme } = useDataStore();

  const applyTheme = (newTheme: 'light' | 'dark' | 'system') => {
    let resolvedTheme: 'light' | 'dark';
    if (newTheme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      resolvedTheme = isDark ? 'dark' : 'light';
    } else {
      resolvedTheme = newTheme;
    }

    if (vuetifyTheme) {
      vuetifyTheme.change(resolvedTheme);
    }

    if (resolvedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const initTheme = () => {
    // Watch for theme changes in store
    watch(() => theme.value, (newTheme) => {
      applyTheme(newTheme);
    }, { immediate: true });

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (theme.value === 'system') {
        applyTheme('system');
      }
    });
  };

  return {
    initTheme,
    applyTheme,
  };
};

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = string;

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'theme-dark', // Default to Dark Luff
      setTheme: (theme) => {
        set({ theme });
        // Update document root class immediately
        if (typeof document !== 'undefined') {
          document.documentElement.className = theme === 'light' ? '' : theme;
        }
      },
    }),
    {
      name: 'luff-theme-storage',
    }
  )
);

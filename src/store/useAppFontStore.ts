import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppFontState {
  appFontFamilyString: string;
  appFontId: string;
  setAppFontId: (id: string, fontString: string) => void;
}

export const useAppFontStore = create<AppFontState>()(
  persist(
    (set) => ({
      appFontFamilyString: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      appFontId: 'app-system',
      setAppFontId: (id, fontString) => {
        set({ appFontId: id, appFontFamilyString: fontString });
      },
    }),
    {
      name: 'luff-app-font-storage',
    }
  )
);

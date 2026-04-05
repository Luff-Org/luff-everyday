import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_THEME, STORAGE_KEYS } from "@/lib/constants";

interface ThemeState {
  theme: string;
  setTheme: (theme: string) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: DEFAULT_THEME,
      setTheme: (theme) => {
        set({ theme });
        if (typeof document !== "undefined") {
          document.documentElement.className =
            theme === "light" ? "" : theme;
        }
      },
    }),
    { name: STORAGE_KEYS.theme }
  )
);

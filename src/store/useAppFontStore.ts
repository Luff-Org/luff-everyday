import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_FONT_ID,
  DEFAULT_FONT_STRING,
  STORAGE_KEYS,
} from "@/lib/constants";

interface AppFontState {
  appFontFamilyString: string;
  appFontId: string;
  setAppFontId: (id: string, fontString: string) => void;
}

export const useAppFontStore = create<AppFontState>()(
  persist(
    (set) => ({
      appFontFamilyString: DEFAULT_FONT_STRING,
      appFontId: DEFAULT_FONT_ID,
      setAppFontId: (id, fontString) => {
        set({ appFontId: id, appFontFamilyString: fontString });
      },
    }),
    { name: STORAGE_KEYS.font }
  )
);

"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/shared/store/useThemeStore";
import { useAppFontStore } from "@/shared/store/useAppFontStore";

/**
 * Keeps the document in sync with the persisted theme/font stores.
 *
 * First paint is handled by the pre-paint script in `layout.tsx`, which reads
 * the same localStorage keys before the browser renders anything — so this
 * component never has to hide the tree to avoid a flash. It only applies
 * *changes* made after hydration (e.g. picking a theme in settings).
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((state) => state.theme);
  const appFontFamilyString = useAppFontStore(
    (state) => state.appFontFamilyString,
  );

  useEffect(() => {
    document.documentElement.className = theme === "light" ? "" : theme;
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--app-font",
      appFontFamilyString,
    );
  }, [appFontFamilyString]);

  return <>{children}</>;
}

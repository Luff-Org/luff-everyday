"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/shared/store/useThemeStore";
import { useAppFontStore } from "@/shared/store/useAppFontStore";
import { useHasMounted } from "@/shared/lib/useHasMounted";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((state) => state.theme);
  const appFontFamilyString = useAppFontStore(
    (state) => state.appFontFamilyString,
  );
  const mounted = useHasMounted();

  useEffect(() => {
    document.documentElement.className = theme === "light" ? "" : theme;
    document.body.style.fontFamily = appFontFamilyString;
  }, [theme, appFontFamilyString]);

  // To prevent hydration flashes, we wait until mounted
  if (!mounted) {
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }

  return <>{children}</>;
}

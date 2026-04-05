"use client";

import { useEffect, useState } from "react";
import { useThemeStore } from "@/store/useThemeStore";
import { useAppFontStore } from "@/store/useAppFontStore";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((state) => state.theme);
  const appFontFamilyString = useAppFontStore((state) => state.appFontFamilyString);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.documentElement.className = theme === "light" ? "" : theme;
    document.body.style.fontFamily = appFontFamilyString;
  }, [theme, appFontFamilyString]);

  // To prevent hydration flashes, we wait until mounted
  if (!mounted) {
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }

  return <>{children}</>;
}

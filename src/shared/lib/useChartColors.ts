import { useEffect, useState } from "react";
import { useThemeStore } from "@/shared/store/useThemeStore";
import { CHART_FALLBACK_COLORS } from "@/shared/lib/constants";

export type ChartColors = {
  primary: string;
  sub: string;
  error: string;
};

/**
 * Reads live theme colors from CSS custom properties for chart.js. Re-runs on
 * theme change, since these values aren't available at render time. Falls back
 * to `CHART_FALLBACK_COLORS` on the server / before mount.
 */
export function useChartColors(): ChartColors {
  const themeId = useThemeStore((s) => s.theme);
  const [colors, setColors] = useState<ChartColors>({ ...CHART_FALLBACK_COLORS });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const style = getComputedStyle(document.body);
    const read = (prop: string, fallback: string) =>
      style.getPropertyValue(prop).trim() || fallback;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setColors({
      primary: read("--primary", CHART_FALLBACK_COLORS.primary),
      sub: read("--sub-text", CHART_FALLBACK_COLORS.sub),
      error: read("--error", CHART_FALLBACK_COLORS.error),
    });
  }, [themeId]);

  return colors;
}

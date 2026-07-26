// ─────────────────────────────────────────────────────────────────────────────
// WCAG contrast helpers.
//
// The theme palettes in `constants.ts` are hand-picked for *character*, not for
// legibility — auditing them found 23 of 32 themes with a `sub` colour under
// 3:1 against their own background (some as low as 1.3:1, i.e. invisible), plus
// four with an unreadable `fg`. Rather than hand-tuning 32 palettes and hoping
// the next one added is fine, `readableOn` nudges a colour toward whichever of
// black/white gives more separation until it clears a contrast floor. Hue is
// preserved by lerping in RGB, so themes keep their identity.
// ─────────────────────────────────────────────────────────────────────────────

type Rgb = [number, number, number];

function hexToRgb(hex: string): Rgb {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex([r, g, b]: Rgb): string {
  const part = (v: number) =>
    Math.round(Math.min(255, Math.max(0, v)))
      .toString(16)
      .padStart(2, "0");
  return `#${part(r)}${part(g)}${part(b)}`;
}

/** WCAG 2.1 relative luminance. */
export function luminance(hex: string): number {
  const channel = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const [r, g, b] = hexToRgb(hex).map(channel);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.1 contrast ratio, 1..21. Symmetric in its arguments. */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const lerp = (from: Rgb, to: Rgb, t: number): Rgb => [
  from[0] + (to[0] - from[0]) * t,
  from[1] + (to[1] - from[1]) * t,
  from[2] + (to[2] - from[2]) * t,
];

/**
 * Return `color` unchanged if it already meets `target` contrast against `bg`,
 * otherwise the closest variant that does.
 *
 * The pole to move toward is chosen by which of black/white actually contrasts
 * more with `bg` — not by a luminance threshold, which picks wrong for
 * mid-bright backgrounds (the `honey` theme's #f2a900 sits just under 0.5
 * luminance yet needs *darker* text, since white only reaches 1.9:1 on it).
 * If even the pole can't hit `target` the pole is returned: best effort beats
 * leaving text at 1.3:1.
 */
export function readableOn(color: string, bg: string, target: number): string {
  if (contrastRatio(color, bg) >= target) return color;

  const white: Rgb = [255, 255, 255];
  const black: Rgb = [0, 0, 0];
  const pole = contrastRatio("#ffffff", bg) >= contrastRatio("#000000", bg) ? white : black;
  if (contrastRatio(rgbToHex(pole), bg) < target) return rgbToHex(pole);

  // Contrast increases monotonically as we travel toward the pole, so bisect
  // for the smallest shift that clears the floor — keeps as much of the
  // original hue as the target allows.
  const from = hexToRgb(color);
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    if (contrastRatio(rgbToHex(lerp(from, pole, mid)), bg) >= target) hi = mid;
    else lo = mid;
  }
  return rgbToHex(lerp(from, pole, hi));
}

import { describe, it, expect } from "vitest";
import { contrastRatio, luminance, readableOn } from "./contrast";
import { THEMES } from "./constants";

describe("contrastRatio", () => {
  it("is 21:1 for black on white and 1:1 for a colour on itself", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#3b82f6", "#3b82f6")).toBeCloseTo(1, 5);
  });

  it("is symmetric", () => {
    expect(contrastRatio("#0f172a", "#f8fafc")).toBeCloseTo(
      contrastRatio("#f8fafc", "#0f172a"),
      10,
    );
  });

  it("ranks luminance as expected", () => {
    expect(luminance("#ffffff")).toBeGreaterThan(luminance("#808080"));
    expect(luminance("#808080")).toBeGreaterThan(luminance("#000000"));
  });
});

describe("readableOn", () => {
  it("leaves a colour untouched when it already clears the floor", () => {
    expect(readableOn("#ffffff", "#000000", 4.5)).toBe("#ffffff");
  });

  it("lifts an unreadable colour to exactly meet the floor", () => {
    // dark-luff's sub on its own background: 2.4:1 before, >= 3:1 after.
    const fixed = readableOn("#475569", "#0f172a", 3);
    expect(contrastRatio("#475569", "#0f172a")).toBeLessThan(3);
    expect(contrastRatio(fixed, "#0f172a")).toBeGreaterThanOrEqual(3);
  });

  it("darkens rather than lightens on a mid-bright background", () => {
    // `honey` (#f2a900) sits just under 0.5 luminance but white only reaches
    // 1.9:1 on it — a naive luminance-threshold check picks the wrong pole.
    const fixed = readableOn("#ffffff", "#f2a900", 4.5);
    expect(luminance(fixed)).toBeLessThan(luminance("#f2a900"));
    expect(contrastRatio(fixed, "#f2a900")).toBeGreaterThanOrEqual(4.5);
  });

  it("falls back to the best available pole when the target is unreachable", () => {
    // Nothing hits 21:1 against mid-grey; the better pole is returned instead.
    expect(readableOn("#808080", "#767676", 21)).toBe("#000000");
  });

  it("keeps every shipped theme legible at its role's floor", () => {
    for (const t of THEMES) {
      expect(contrastRatio(readableOn(t.fg, t.bg, 4.5), t.bg)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(readableOn(t.sub, t.bg, 3), t.bg)).toBeGreaterThanOrEqual(3);
      expect(contrastRatio(readableOn(t.primary, t.bg, 4.5), t.bg)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(readableOn(t.error, t.bg, 3), t.bg)).toBeGreaterThanOrEqual(3);
    }
  });

  it("keeps sub-text dimmer than foreground so hierarchy survives", () => {
    for (const t of THEMES) {
      const fg = contrastRatio(readableOn(t.fg, t.bg, 4.5), t.bg);
      const sub = contrastRatio(readableOn(t.sub, t.bg, 3), t.bg);
      expect(sub).toBeLessThanOrEqual(fg);
    }
  });
});

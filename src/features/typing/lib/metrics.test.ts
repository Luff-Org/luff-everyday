import { describe, it, expect } from "vitest";
import { computeFinalStats, computeLiveTally, computeWpm } from "./metrics";

describe("computeWpm", () => {
  it("returns zeros before any time elapses", () => {
    expect(computeWpm(100, 10, 0)).toEqual({ wpm: 0, rawWpm: 0 });
  });

  it("uses 5 chars per word over elapsed minutes", () => {
    expect(computeWpm(100, 0, 1)).toEqual({ wpm: 20, rawWpm: 20 });
    expect(computeWpm(100, 50, 1)).toEqual({ wpm: 20, rawWpm: 30 });
  });
});

describe("computeFinalStats", () => {
  it("counts a perfect single word", () => {
    expect(computeFinalStats(["cat"], [], 0, "cat")).toEqual({
      correct: 3,
      incorrect: 0,
      extra: 0,
      missed: 0,
    });
  });

  it("counts inter-word spaces and missed chars", () => {
    // "cat" typed fully (3 + 1 space), then "do" of "dog" -> 1 missed
    expect(computeFinalStats(["cat", "dog"], ["cat"], 1, "do")).toEqual({
      correct: 6,
      incorrect: 0,
      extra: 0,
      missed: 1,
    });
  });

  it("attributes over-typed characters to extra", () => {
    expect(computeFinalStats(["hi"], [], 0, "hiii")).toMatchObject({
      correct: 2,
      extra: 2,
    });
  });
});

describe("computeLiveTally", () => {
  it("ignores missed/extra and counts typed chars only", () => {
    expect(computeLiveTally(["cat", "dog"], ["cat"], 1, "do")).toEqual({
      correct: 6,
      incorrect: 0,
    });
  });

  it("counts incorrect characters", () => {
    expect(computeLiveTally(["cat"], [], 0, "cxt")).toEqual({
      correct: 2,
      incorrect: 1,
    });
  });
});

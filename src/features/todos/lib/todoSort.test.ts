import { describe, it, expect } from "vitest";
import { getBucket, getDueDateLabel, sortByUrgency } from "./todoSort";

const NOW = new Date("2026-07-25T12:00:00");

describe("getBucket", () => {
  it("classifies dates relative to now", () => {
    expect(getBucket(null, NOW)).toBe("noDate");
    expect(getBucket("2026-07-24", NOW)).toBe("overdue");
    expect(getBucket("2026-07-25", NOW)).toBe("today");
    expect(getBucket("2026-07-30", NOW)).toBe("thisWeek");
  });
});

describe("getDueDateLabel", () => {
  it("uses friendly relative labels", () => {
    expect(getDueDateLabel("2026-07-25", NOW)).toBe("Today");
    expect(getDueDateLabel("2026-07-26", NOW)).toBe("Tomorrow");
    expect(getDueDateLabel("2026-07-24", NOW)).toBe("Overdue by 1d");
  });
});

describe("sortByUrgency", () => {
  it("orders overdue first, then by priority", () => {
    const todos = [
      { id: "a", dueDate: null, priority: "LOW" as const },
      { id: "b", dueDate: "2026-07-24", priority: "LOW" as const },
      { id: "c", dueDate: "2026-07-25", priority: "URGENT" as const },
    ];
    const sorted = sortByUrgency(todos, NOW).map((t) => t.id);
    expect(sorted).toEqual(["b", "c", "a"]);
  });
});

import { describe, it, expect } from "vitest";
import { parseQuickAdd } from "./todoParser";

const NOW = new Date("2026-07-25T09:00:00");

describe("parseQuickAdd", () => {
  it("extracts priority, tags, and a clean title", () => {
    const result = parseQuickAdd("Buy milk !high #home #errands", NOW);
    expect(result.title).toBe("Buy milk");
    expect(result.priority).toBe("HIGH");
    expect(result.tags).toEqual(["home", "errands"]);
  });

  it("dedupes tags and lowercases them", () => {
    const result = parseQuickAdd("Task #Work #work", NOW);
    expect(result.tags).toEqual(["work"]);
  });

  it("ignores unknown priority tokens", () => {
    const result = parseQuickAdd("Ship it !someday", NOW);
    expect(result.priority).toBeNull();
    expect(result.title).toBe("Ship it !someday");
  });

  it("parses a natural-language due date out of the title", () => {
    const result = parseQuickAdd("Call dentist tomorrow", NOW);
    expect(result.title).toBe("Call dentist");
    expect(result.dueDate).not.toBeNull();
    expect(result.dueDate!.getDate()).toBe(26);
  });
});

import { describe, it, expect } from "vitest";
import { createTodoSchema, updateTodoSchema, reorderSchema } from "./validation";

describe("createTodoSchema", () => {
  it("accepts a minimal raw quick-add", () => {
    expect(createTodoSchema.parse({ raw: "Buy milk !high" })).toMatchObject({
      raw: "Buy milk !high",
    });
  });

  it("rejects an invalid priority", () => {
    expect(() => createTodoSchema.parse({ title: "x", priority: "BOGUS" })).toThrow();
  });

  it("normalizes tags to trimmed lowercase", () => {
    const parsed = createTodoSchema.parse({ title: "x", tags: [" Work ", "HOME"] });
    expect(parsed.tags).toEqual(["work", "home"]);
  });
});

describe("updateTodoSchema", () => {
  it("rejects an invalid recurrence", () => {
    expect(() => updateTodoSchema.parse({ recurrence: "HOURLY" })).toThrow();
  });
});

describe("reorderSchema", () => {
  it("requires items with id and numeric order", () => {
    expect(() => reorderSchema.parse({ items: [{ id: "a" }] })).toThrow();
    expect(reorderSchema.parse({ items: [{ id: "a", order: 2 }] })).toBeTruthy();
  });
});

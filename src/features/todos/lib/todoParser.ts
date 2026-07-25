import * as chrono from "chrono-node";
import type { Priority } from "@prisma/client";

export interface ParsedTodo {
  title: string;
  dueDate: Date | null;
  priority: Priority | null;
  tags: string[];
}

const PRIORITY_MAP: Record<string, Priority> = {
  low: "LOW",
  medium: "MEDIUM",
  high: "HIGH",
  urgent: "URGENT",
};

export function parseQuickAdd(input: string, now: Date = new Date()): ParsedTodo {
  let text = input;
  let priority: Priority | null = null;
  const tags: string[] = [];

  text = text.replace(/!(\w+)/g, (match, word: string) => {
    const mapped = PRIORITY_MAP[word.toLowerCase()];
    if (mapped) {
      priority = mapped;
      return "";
    }
    return match;
  });

  text = text.replace(/#(\w+)/g, (_match, word: string) => {
    tags.push(word.toLowerCase());
    return "";
  });

  let dueDate: Date | null = null;
  const results = chrono.parse(text, now);
  if (results.length > 0) {
    const result = results[0];
    dueDate = result.start.date();
    text = text.slice(0, result.index) + text.slice(result.index + result.text.length);
  }

  const title = text.replace(/\s+/g, " ").trim();

  return { title, dueDate, priority, tags: Array.from(new Set(tags)) };
}

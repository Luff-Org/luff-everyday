"use client";

import { clsx } from "clsx";
import { useTodoStore } from "@/features/todos/store/useTodoStore";
import { TagChip } from "./TagChip";

export function TagFilterChips() {
  const tags = useTodoStore((s) => s.tags);
  const tagFilter = useTodoStore((s) => s.tagFilter);
  const setTagFilter = useTodoStore((s) => s.setTagFilter);

  if (tags.length === 0) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      <button
        onClick={() => setTagFilter(null)}
        className={clsx(
          "shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors",
          tagFilter === null
            ? "bg-primary text-background border-transparent"
            : "border-sub-text/25 text-sub-text bg-background/40 hover:border-sub-text/45",
        )}
      >
        All
      </button>
      {tags.map((tag) => (
        <TagChip
          key={tag.id}
          name={tag.name}
          color={tag.color}
          active={tagFilter === tag.id}
          onClick={() => setTagFilter(tagFilter === tag.id ? null : tag.id)}
        />
      ))}
    </div>
  );
}

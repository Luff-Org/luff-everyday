"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { parseQuickAdd } from "@/features/todos/lib/todoParser";
import { useTodoStore } from "@/features/todos/store/useTodoStore";
import { pickTagColor } from "@/features/todos/lib/tagColors";
import { PriorityBadge } from "./PriorityBadge";
import { TagChip } from "./TagChip";
import { DateTimePicker } from "./DateTimePicker";
import type { Priority } from "@prisma/client";

const SUGGESTED_TAGS = ["shopping", "learning", "work", "personal", "health"];
const PRIORITIES: Priority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

const fieldClass =
  "bg-background/40 border border-sub-text/20 rounded-lg px-2.5 py-1.5 text-xs font-bold text-foreground outline-none focus:border-primary/50 transition-colors";
const labelClass = "text-[10px] font-black uppercase tracking-widest text-sub-text/50";

export function QuickAddBar() {
  const [value, setValue] = useState("");
  const [description, setDescription] = useState("");
  const [manualPriority, setManualPriority] = useState<Priority | "">("");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const addTodo = useTodoStore((s) => s.addTodo);

  const composedTitle = useMemo(() => {
    const trimmed = value.trim();
    if (!trimmed) return "";
    const extras = [
      ...selectedTags.map((t) => `#${t}`),
      manualPriority ? `!${manualPriority.toLowerCase()}` : null,
    ].filter(Boolean);
    return extras.length ? `${trimmed} ${extras.join(" ")}` : trimmed;
  }, [value, selectedTags, manualPriority]);

  const preview = useMemo(
    () => (composedTitle ? parseQuickAdd(composedTitle) : null),
    [composedTitle],
  );

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const submit = () => {
    if (!composedTitle) return;
    addTodo({
      raw: composedTitle,
      dueDate: dueDate ? dueDate.toISOString() : undefined,
      description: description.trim() || null,
    });
    setValue("");
    setDescription("");
    setSelectedTags([]);
    setManualPriority("");
    setDueDate(null);
  };

  const hasPreview = preview && (preview.priority || preview.tags.length > 0);

  return (
    <div className="w-full flex flex-col gap-4 bg-background/30 backdrop-blur-md border border-sub-text/20 rounded-2xl p-5">
      <div className="flex items-center gap-3">
        <button
          onClick={submit}
          disabled={!composedTitle}
          className="text-primary shrink-0 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110 transition-transform"
        >
          <Plus className="w-5 h-5" />
        </button>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder="What needs doing?"
          className="flex-1 bg-transparent outline-none text-foreground placeholder:text-sub-text/50 font-medium"
        />
      </div>

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Add a description (optional)"
        rows={2}
        className="w-full pl-8 bg-transparent outline-none text-sm text-sub-text placeholder:text-sub-text/40 resize-none"
      />

      <div className="flex flex-wrap items-end gap-4 pl-8">
        <div className="flex flex-col gap-1">
          <span className={labelClass}>Due date</span>
          <DateTimePicker value={dueDate} onChange={setDueDate} />
        </div>

        <div className="flex flex-col gap-1">
          <span className={labelClass}>Priority</span>
          <select
            value={manualPriority}
            onChange={(e) => setManualPriority(e.target.value as Priority | "")}
            style={{ colorScheme: "dark" }}
            className={`${fieldClass} cursor-pointer`}
          >
            <option value="">Auto</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p.charAt(0) + p.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 pl-8">
        <span className={labelClass}>Tags</span>
        <div className="flex flex-wrap items-center gap-1.5">
          {SUGGESTED_TAGS.map((tag) => (
            <TagChip
              key={tag}
              name={tag}
              color={pickTagColor(tag)}
              active={selectedTags.includes(tag)}
              onClick={() => toggleTag(tag)}
            />
          ))}
        </div>
      </div>

      {hasPreview && (
        <div className="flex flex-wrap items-center gap-2 pl-8">
          {preview!.priority && <PriorityBadge priority={preview!.priority} />}
          {preview!.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sub-text/10 text-sub-text"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={submit}
          disabled={!composedTitle}
          className="px-5 py-2 bg-primary text-background font-black text-xs rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed"
        >
          Add Task
        </button>
      </div>
    </div>
  );
}

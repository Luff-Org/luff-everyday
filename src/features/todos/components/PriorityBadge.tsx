"use client";

import type { Priority } from "@prisma/client";

const PRIORITY_STYLES: Record<Priority, string> = {
  LOW: "bg-sub-text/10 text-sub-text",
  MEDIUM: "bg-primary/10 text-primary",
  HIGH: "bg-amber-500/10 text-amber-500",
  URGENT: "bg-error/10 text-error",
};

const PRIORITIES: Priority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

interface PriorityBadgeProps {
  priority: Priority;
  onChange?: (priority: Priority) => void;
}

export function PriorityBadge({ priority, onChange }: PriorityBadgeProps) {
  const className = `px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide whitespace-nowrap ${PRIORITY_STYLES[priority]}`;

  if (!onChange) {
    return <span className={className}>{priority.toLowerCase()}</span>;
  }

  return (
    <select
      value={priority}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => onChange(e.target.value as Priority)}
      className={`${className} border-none outline-none cursor-pointer appearance-none`}
    >
      {PRIORITIES.map((p) => (
        <option key={p} value={p} className="bg-background text-foreground normal-case">
          {p.toLowerCase()}
        </option>
      ))}
    </select>
  );
}

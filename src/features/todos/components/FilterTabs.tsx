"use client";

import { motion } from "framer-motion";
import { useTodoStore, type TodoFilter } from "@/features/todos/store/useTodoStore";

const FILTERS: { id: TodoFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "today", label: "Today" },
  { id: "upcoming", label: "Upcoming" },
  { id: "completed", label: "Completed" },
];

export function FilterTabs() {
  const filter = useTodoStore((s) => s.filter);
  const setFilter = useTodoStore((s) => s.setFilter);

  return (
    <div className="flex items-center gap-1 bg-background/30 backdrop-blur-md p-1 rounded-xl border border-sub-text/10 w-fit">
      {FILTERS.map((f) => (
        <button
          key={f.id}
          onClick={() => setFilter(f.id)}
          className={`relative px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            filter === f.id ? "text-background" : "text-sub-text hover:text-foreground"
          }`}
        >
          {filter === f.id && (
            <motion.div
              layoutId="todo-filter-pill"
              className="absolute inset-0 bg-primary rounded-lg"
              transition={{ type: "spring", duration: 0.4 }}
            />
          )}
          <span className="relative z-10">{f.label}</span>
        </button>
      ))}
    </div>
  );
}

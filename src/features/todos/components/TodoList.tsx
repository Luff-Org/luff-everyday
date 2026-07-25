"use client";

import { useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { useTodoStore } from "@/features/todos/store/useTodoStore";
import { getBucket, sortByUrgency } from "@/features/todos/lib/todoSort";
import { TodoItem } from "./TodoItem";
import { EmptyState } from "./EmptyState";

export function TodoList() {
  const todos = useTodoStore((s) => s.todos);
  const filter = useTodoStore((s) => s.filter);
  const tagFilter = useTodoStore((s) => s.tagFilter);

  const filtered = useMemo(() => {
    let result = todos;

    if (filter === "completed") {
      result = result.filter((t) => t.completed);
    } else {
      result = result.filter((t) => !t.completed);
      if (filter === "today") {
        result = result.filter((t) => {
          const bucket = getBucket(t.dueDate);
          return bucket === "overdue" || bucket === "today";
        });
      } else if (filter === "upcoming") {
        result = result.filter((t) => {
          const bucket = getBucket(t.dueDate);
          return bucket === "thisWeek" || bucket === "noDate";
        });
      }
    }

    if (tagFilter) {
      result = result.filter((t) => t.tags.some((tag) => tag.tagId === tagFilter));
    }

    return sortByUrgency(result);
  }, [todos, filter, tagFilter]);

  if (filtered.length === 0) {
    return <EmptyState filter={filter} />;
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      <AnimatePresence initial={false}>
        {filtered.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </AnimatePresence>
    </div>
  );
}

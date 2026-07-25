"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Trash2 } from "lucide-react";
import { useTodoStore, type Todo } from "@/features/todos/store/useTodoStore";
import { PriorityBadge } from "./PriorityBadge";
import { DueDateLabel } from "./DueDateLabel";
import { TagChip } from "./TagChip";
import { SubtaskList } from "./SubtaskList";
import { DateTimePicker } from "./DateTimePicker";

const labelClass = "text-[10px] font-black uppercase tracking-widest text-sub-text/50";

export function TodoItem({ todo }: { todo: Todo }) {
  const [expanded, setExpanded] = useState(false);
  const toggleComplete = useTodoStore((s) => s.toggleComplete);
  const updateTodo = useTodoStore((s) => s.updateTodo);
  const deleteTodo = useTodoStore((s) => s.deleteTodo);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="group bg-background/30 backdrop-blur-md border border-sub-text/20 rounded-2xl p-4"
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => toggleComplete(todo.id)}
          className={`mt-0.5 w-5 h-5 rounded-full border-2 shrink-0 transition-colors ${
            todo.completed
              ? "bg-primary border-primary"
              : "border-sub-text/40 hover:border-primary"
          }`}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-2">
            <span
              className={`font-bold text-sm ${
                todo.completed ? "text-sub-text/40 line-through" : "text-foreground"
              }`}
            >
              {todo.title}
            </span>
            <PriorityBadge
              priority={todo.priority}
              onChange={(priority) => updateTodo(todo.id, { priority })}
            />
            {todo.dueDate && <DueDateLabel dueDate={todo.dueDate} />}
          </div>

          {todo.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {todo.tags.map((t) => (
                <TagChip key={t.tagId} name={t.tag.name} color={t.tag.color} />
              ))}
            </div>
          )}

          {todo.description && !expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="block text-xs text-sub-text/60 mt-2 line-clamp-1 text-left hover:text-sub-text"
            >
              {todo.description}
            </button>
          )}

          {todo.subtasks.length > 0 && !expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="text-[11px] font-bold text-sub-text mt-2 hover:text-primary"
            >
              {todo.subtasks.filter((s) => s.completed).length}/{todo.subtasks.length}{" "}
              subtasks
            </button>
          )}

          {expanded && (
            <div className="flex flex-col gap-2 pl-0 pt-2">
              <textarea
                defaultValue={todo.description ?? ""}
                onBlur={(e) => {
                  const nextValue = e.target.value.trim();
                  if (nextValue !== (todo.description ?? "")) {
                    updateTodo(todo.id, { description: nextValue || null });
                  }
                }}
                placeholder="Add a description..."
                rows={2}
                className="w-full bg-background/40 border border-sub-text/15 rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-sub-text/40 outline-none focus:border-primary/40 resize-none"
              />

              <div className="flex flex-col gap-1">
                <span className={labelClass}>Due date</span>
                <DateTimePicker
                  value={todo.dueDate ? new Date(todo.dueDate) : null}
                  onChange={(date) =>
                    updateTodo(todo.id, { dueDate: date ? date.toISOString() : null })
                  }
                />
              </div>

              <SubtaskList todoId={todo.id} subtasks={todo.subtasks} />
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setExpanded((e) => !e)}
            className="p-1.5 text-sub-text hover:text-foreground"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          </button>
          <button
            onClick={() => deleteTodo(todo.id)}
            className="p-1.5 text-sub-text hover:text-error"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

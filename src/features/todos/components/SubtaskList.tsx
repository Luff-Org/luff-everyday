"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { useTodoStore, type Subtask } from "@/features/todos/store/useTodoStore";

export function SubtaskList({
  todoId,
  subtasks,
}: {
  todoId: string;
  subtasks: Subtask[];
}) {
  const [value, setValue] = useState("");
  const addSubtask = useTodoStore((s) => s.addSubtask);
  const toggleSubtask = useTodoStore((s) => s.toggleSubtask);
  const deleteSubtask = useTodoStore((s) => s.deleteSubtask);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    addSubtask(todoId, trimmed);
    setValue("");
  };

  return (
    <div className="flex flex-col gap-1.5 pl-8 pt-2">
      {subtasks.map((subtask) => (
        <div key={subtask.id} className="group flex items-center gap-2">
          <button
            onClick={() => toggleSubtask(todoId, subtask.id)}
            className={`w-3.5 h-3.5 rounded-full border shrink-0 transition-colors ${
              subtask.completed ? "bg-primary border-primary" : "border-sub-text/60"
            }`}
          />
          <span
            className={`text-xs flex-1 ${
              subtask.completed ? "text-sub-text/60 line-through" : "text-sub-text"
            }`}
          >
            {subtask.title}
          </span>
          <button
            onClick={() => deleteSubtask(todoId, subtask.id)}
            className="opacity-0 group-hover:opacity-100 text-sub-text/70 hover:text-error transition-opacity"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
      <div className="flex items-center gap-2 mt-1">
        <Plus className="w-3 h-3 text-sub-text/60 shrink-0" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder="Add subtask"
          className="flex-1 bg-transparent outline-none text-xs text-foreground placeholder:text-sub-text/60"
        />
      </div>
    </div>
  );
}

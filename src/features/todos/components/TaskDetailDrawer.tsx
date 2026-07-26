"use client";

import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Trash2,
  Link2,
  ExternalLink,
  GitBranch,
  Zap,
  MapPin,
  Clock,
  Plus,
} from "lucide-react";
import type { EnergyLevel } from "@prisma/client";
import { useTodoStore, type Todo } from "@/features/todos/store/useTodoStore";
import { PriorityBadge } from "./PriorityBadge";
import { TagChip } from "./TagChip";
import { DateTimePicker } from "./DateTimePicker";
import { SubtaskList } from "./SubtaskList";
import { TodoImageUpload } from "./TodoImageUpload";

const labelClass = "text-[10px] font-black uppercase tracking-widest text-sub-text/70";
const fieldClass =
  "bg-background/40 border border-sub-text/35 rounded-lg px-2.5 py-1.5 text-xs font-bold text-foreground outline-none focus:border-primary/50 transition-colors placeholder:text-sub-text/60 placeholder:font-medium";

const ENERGY_LEVELS: EnergyLevel[] = ["LOW", "MEDIUM", "HIGH"];
const ENERGY_STYLES: Record<EnergyLevel, string> = {
  LOW: "text-sub-text",
  MEDIUM: "text-amber-500",
  HIGH: "text-error",
};

export function TaskDetailDrawer({ todo, onClose }: { todo: Todo; onClose: () => void }) {
  const allTodos = useTodoStore((s) => s.todos);
  const updateTodo = useTodoStore((s) => s.updateTodo);
  const deleteTodo = useTodoStore((s) => s.deleteTodo);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [depQuery, setDepQuery] = useState("");

  const blockerIds = useMemo(
    () => new Set(todo.dependsOn.map((d) => d.blockingId)),
    [todo.dependsOn],
  );

  const depCandidates = useMemo(() => {
    const q = depQuery.trim().toLowerCase();
    return allTodos
      .filter((t) => t.id !== todo.id && !blockerIds.has(t.id))
      .filter((t) => !q || t.title.toLowerCase().includes(q))
      .slice(0, 6);
  }, [allTodos, todo.id, blockerIds, depQuery]);

  const addLink = () => {
    const url = linkUrl.trim();
    if (!url) return;
    const withScheme = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    updateTodo(todo.id, {
      links: [
        ...todo.links.map((l) => ({ url: l.url, title: l.title })),
        { url: withScheme, title: linkTitle.trim() || null },
      ],
    });
    setLinkUrl("");
    setLinkTitle("");
  };

  const removeLink = (id: string) => {
    updateTodo(todo.id, {
      links: todo.links
        .filter((l) => l.id !== id)
        .map((l) => ({ url: l.url, title: l.title })),
    });
  };

  const addDependency = (blockingId: string) => {
    updateTodo(todo.id, { dependsOn: [...Array.from(blockerIds), blockingId] });
    setDepQuery("");
  };

  const removeDependency = (blockingId: string) => {
    updateTodo(todo.id, {
      dependsOn: Array.from(blockerIds).filter((id) => id !== blockingId),
    });
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999]"
      />
      <motion.div
        key="drawer"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 300 }}
        className="fixed top-0 right-0 h-full w-full max-w-md bg-background border-l border-sub-text/35 z-[1000] overflow-y-auto"
      >
        <div className="flex items-start justify-between gap-3 p-5 border-b border-sub-text/20 sticky top-0 bg-background/95 backdrop-blur-md">
          <input
            defaultValue={todo.title}
            onBlur={(e) => {
              const next = e.target.value.trim();
              if (next && next !== todo.title) updateTodo(todo.id, { title: next });
            }}
            className="flex-1 bg-transparent outline-none text-base font-black text-foreground"
          />
          <button onClick={onClose} className="p-1 text-sub-text hover:text-foreground shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-5 p-5">
          <div className="flex flex-col gap-1.5">
            <span className={labelClass}>Description</span>
            <textarea
              defaultValue={todo.description ?? ""}
              onBlur={(e) => {
                const next = e.target.value.trim();
                if (next !== (todo.description ?? "")) {
                  updateTodo(todo.id, { description: next || null });
                }
              }}
              placeholder="Short summary..."
              rows={2}
              className={`w-full ${fieldClass} resize-none`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <span className={labelClass}>Priority</span>
              <PriorityBadge
                priority={todo.priority}
                onChange={(priority) => updateTodo(todo.id, { priority })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className={labelClass}>Energy</span>
              <div className="flex items-center gap-1">
                {ENERGY_LEVELS.map((level) => (
                  <button
                    key={level}
                    onClick={() =>
                      updateTodo(todo.id, {
                        energyLevel: todo.energyLevel === level ? null : level,
                      })
                    }
                    className={`p-1.5 rounded-lg border transition-colors ${
                      todo.energyLevel === level
                        ? "border-primary/50 bg-primary/10"
                        : "border-sub-text/25 hover:border-sub-text/45"
                    }`}
                    title={level}
                  >
                    <Zap
                      className={`w-3.5 h-3.5 ${
                        todo.energyLevel === level ? ENERGY_STYLES[level] : "text-sub-text/60"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className={labelClass}>Start date</span>
              <DateTimePicker
                value={todo.startDate ? new Date(todo.startDate) : null}
                onChange={(date) =>
                  updateTodo(todo.id, { startDate: date ? date.toISOString() : null })
                }
                placeholder="Set start"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className={labelClass}>Due date</span>
              <DateTimePicker
                value={todo.dueDate ? new Date(todo.dueDate) : null}
                onChange={(date) =>
                  updateTodo(todo.id, { dueDate: date ? date.toISOString() : null })
                }
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className={labelClass}>Estimate (min)</span>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sub-text/70 shrink-0" />
                <input
                  type="number"
                  min={0}
                  defaultValue={todo.estimatedMinutes ?? ""}
                  onBlur={(e) => {
                    const raw = e.target.value.trim();
                    const next = raw ? Number(raw) : null;
                    if (next !== todo.estimatedMinutes) {
                      updateTodo(todo.id, { estimatedMinutes: next });
                    }
                  }}
                  placeholder="—"
                  className={`w-full ${fieldClass}`}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className={labelClass}>Context</span>
              <input
                defaultValue={todo.context ?? ""}
                onBlur={(e) => {
                  const next = e.target.value.trim();
                  if (next !== (todo.context ?? "")) {
                    updateTodo(todo.id, { context: next || null });
                  }
                }}
                placeholder="e.g. @computer"
                className={fieldClass}
              />
            </div>

            <div className="flex flex-col gap-1.5 col-span-2">
              <span className={labelClass}>Location</span>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-sub-text/70 shrink-0" />
                <input
                  defaultValue={todo.location ?? ""}
                  onBlur={(e) => {
                    const next = e.target.value.trim();
                    if (next !== (todo.location ?? "")) {
                      updateTodo(todo.id, { location: next || null });
                    }
                  }}
                  placeholder="e.g. Office"
                  className={`w-full ${fieldClass}`}
                />
              </div>
            </div>
          </div>

          {todo.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {todo.tags.map((t) => (
                <TagChip key={t.tagId} name={t.tag.name} color={t.tag.color} />
              ))}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <span className={labelClass}>Subtasks</span>
            <SubtaskList todoId={todo.id} subtasks={todo.subtasks} />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className={labelClass}>Links</span>
            <div className="flex flex-col gap-1.5">
              {todo.links.map((link) => (
                <div key={link.id} className="group flex items-center gap-2">
                  <Link2 className="w-3.5 h-3.5 text-sub-text/60 shrink-0" />
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 min-w-0 text-xs text-primary hover:underline truncate flex items-center gap-1"
                  >
                    {link.title || link.url}
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                  <button
                    onClick={() => removeLink(link.id)}
                    className="opacity-0 group-hover:opacity-100 text-sub-text/70 hover:text-error transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-1.5 mt-1">
                <input
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  placeholder="Title (optional)"
                  className={`${fieldClass} w-28`}
                />
                <input
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addLink();
                  }}
                  placeholder="https://..."
                  className={`flex-1 ${fieldClass}`}
                />
                <button
                  onClick={addLink}
                  disabled={!linkUrl.trim()}
                  className="p-1.5 text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <TodoImageUpload
            images={todo.images.map((img) => ({ url: img.url, publicId: img.publicId }))}
            onChange={(images) => updateTodo(todo.id, { images })}
          />

          <div className="flex flex-col gap-1.5">
            <span className={labelClass}>Blocked by</span>
            <div className="flex flex-col gap-1.5">
              {todo.dependsOn.map((dep) => (
                <div key={dep.blockingId} className="group flex items-center gap-2">
                  <GitBranch className="w-3.5 h-3.5 text-sub-text/60 shrink-0" />
                  <span
                    className={`flex-1 min-w-0 text-xs truncate ${
                      dep.blocking.completed
                        ? "text-sub-text/60 line-through"
                        : "text-foreground"
                    }`}
                  >
                    {dep.blocking.title}
                  </span>
                  {!dep.blocking.completed && (
                    <span className="text-[9px] font-black uppercase text-amber-500 shrink-0">
                      open
                    </span>
                  )}
                  <button
                    onClick={() => removeDependency(dep.blockingId)}
                    className="opacity-0 group-hover:opacity-100 text-sub-text/70 hover:text-error transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <div className="relative">
                <input
                  value={depQuery}
                  onChange={(e) => setDepQuery(e.target.value)}
                  placeholder="Search tasks to block on..."
                  className={`w-full ${fieldClass}`}
                />
                {depQuery.trim() && depCandidates.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1 bg-background border border-sub-text/35 rounded-lg shadow-xl z-10 overflow-hidden">
                    {depCandidates.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => addDependency(t.id)}
                        className="w-full text-left px-2.5 py-1.5 text-xs text-foreground hover:bg-sub-text/20 truncate"
                      >
                        {t.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className={labelClass}>Notes</span>
            <textarea
              defaultValue={todo.notes ?? ""}
              onBlur={(e) => {
                const next = e.target.value.trim();
                if (next !== (todo.notes ?? "")) {
                  updateTodo(todo.id, { notes: next || null });
                }
              }}
              placeholder="Longer notes, context, links to remember..."
              rows={6}
              className={`w-full ${fieldClass} resize-none`}
            />
          </div>

          <button
            onClick={() => {
              deleteTodo(todo.id);
              onClose();
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 text-error text-xs font-black rounded-lg border border-error/20 hover:bg-error/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete task
          </button>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}

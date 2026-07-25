"use client";

import { ListTodo, CheckCircle2, Circle, Percent, AlertTriangle, CalendarClock } from "lucide-react";
import type { Priority } from "@prisma/client";
import type { TodoStats } from "@/features/todos/types";
import { StatTile } from "./StatTile";

const PRIORITY_META: Record<Priority, { label: string; className: string }> = {
  URGENT: { label: "Urgent", className: "bg-error" },
  HIGH: { label: "High", className: "bg-primary" },
  MEDIUM: { label: "Medium", className: "bg-sub-text" },
  LOW: { label: "Low", className: "bg-sub-text/50" },
};
const PRIORITY_ORDER: Priority[] = ["URGENT", "HIGH", "MEDIUM", "LOW"];

export function TodoStatsPanel({ stats }: { stats: TodoStats }) {
  const maxDay = Math.max(1, ...stats.completedLast7Days.map((d) => d.count));

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <ListTodo className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-black tracking-tight text-foreground">
          Todos
        </h2>
      </div>

      {stats.total === 0 ? (
        <div className="rounded-xl border border-dashed border-sub-text/20 p-8 text-center text-sub-text">
          No todos yet — add one to start tracking what you get done.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile icon={ListTodo} label="Total" value={stats.total} />
            <StatTile icon={Circle} label="Active" value={stats.active} />
            <StatTile icon={CheckCircle2} label="Done" value={stats.completed} />
            <StatTile
              icon={Percent}
              label="Completion"
              value={stats.completionRate}
              suffix="%"
              accent
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatTile icon={AlertTriangle} label="Overdue" value={stats.overdue} />
            <StatTile icon={CalendarClock} label="Due Today" value={stats.dueToday} />
          </div>

          {/* Active by priority */}
          <div className="rounded-xl border border-sub-text/10 bg-background/40 p-4">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-sub-text">
              Active by priority
            </h3>
            <div className="flex flex-col gap-2">
              {PRIORITY_ORDER.map((p) => {
                const count = stats.byPriority[p];
                const pct = stats.active > 0 ? (count / stats.active) * 100 : 0;
                return (
                  <div key={p} className="flex items-center gap-3">
                    <span className="w-16 text-xs font-bold text-sub-text">
                      {PRIORITY_META[p].label}
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-sub-text/10">
                      <div
                        className={`h-full rounded-full ${PRIORITY_META[p].className}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-6 text-right text-xs font-black text-foreground">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 7-day completion activity */}
          <div className="rounded-xl border border-sub-text/10 bg-background/40 p-4">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-sub-text">
              Completed last 7 days
            </h3>
            <div className="flex items-end justify-between gap-2 h-24">
              {stats.completedLast7Days.map((d) => (
                <div key={d.date} className="flex flex-1 flex-col items-center gap-1.5">
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className="w-full rounded-t bg-primary/70"
                      style={{ height: `${(d.count / maxDay) * 100}%` }}
                      title={`${d.count} completed`}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-sub-text">
                    {new Date(`${d.date}T00:00:00`).toLocaleDateString(undefined, {
                      weekday: "narrow",
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

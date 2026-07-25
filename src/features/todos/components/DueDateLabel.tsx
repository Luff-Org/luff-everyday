import { getBucket, getDueDateLabel } from "@/features/todos/lib/todoSort";

export function DueDateLabel({ dueDate }: { dueDate: string | null }) {
  if (!dueDate) return null;

  const bucket = getBucket(dueDate);
  const color =
    bucket === "overdue"
      ? "text-error"
      : bucket === "today"
        ? "text-primary"
        : "text-sub-text";

  return <span className={`text-[11px] font-bold ${color}`}>{getDueDateLabel(dueDate)}</span>;
}

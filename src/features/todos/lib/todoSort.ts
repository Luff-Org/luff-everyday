import type { Priority } from "@prisma/client";

export type UrgencyBucket = "overdue" | "today" | "thisWeek" | "noDate";

const BUCKET_ORDER: UrgencyBucket[] = ["overdue", "today", "thisWeek", "noDate"];

const PRIORITY_WEIGHT: Record<Priority, number> = {
  URGENT: 3,
  HIGH: 2,
  MEDIUM: 1,
  LOW: 0,
};

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function diffDaysFromNow(dueDate: Date | string, now: Date): number {
  const due = startOfDay(new Date(dueDate));
  const today = startOfDay(now);
  return Math.round((due.getTime() - today.getTime()) / 86_400_000);
}

export function getBucket(
  dueDate: Date | string | null,
  now: Date = new Date(),
): UrgencyBucket {
  if (!dueDate) return "noDate";
  const diff = diffDaysFromNow(dueDate, now);
  if (diff < 0) return "overdue";
  if (diff === 0) return "today";
  return "thisWeek";
}

export function getDueDateLabel(
  dueDate: Date | string | null,
  now: Date = new Date(),
): string {
  if (!dueDate) return "";
  const diff = diffDaysFromNow(dueDate, now);

  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Overdue by 1d";
  if (diff < -1) return `Overdue by ${Math.abs(diff)}d`;
  if (diff > 1 && diff <= 7) return `in ${diff}d`;
  return new Date(dueDate).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function sortByUrgency<
  T extends { dueDate: Date | string | null; priority: Priority },
>(todos: T[], now: Date = new Date()): T[] {
  return [...todos].sort((a, b) => {
    const bucketA = BUCKET_ORDER.indexOf(getBucket(a.dueDate, now));
    const bucketB = BUCKET_ORDER.indexOf(getBucket(b.dueDate, now));
    if (bucketA !== bucketB) return bucketA - bucketB;

    const weightDiff = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
    if (weightDiff !== 0) return weightDiff;

    const aTime = a.dueDate ? new Date(a.dueDate).getTime() : 0;
    const bTime = b.dueDate ? new Date(b.dueDate).getTime() : 0;
    return aTime - bTime;
  });
}

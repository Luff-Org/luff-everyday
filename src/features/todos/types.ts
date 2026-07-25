import type {
  Prisma,
  Priority,
  RecurrenceRule,
  EnergyLevel,
} from "@prisma/client";
import type { TODO_INCLUDE } from "@/features/todos/server/todoInclude";

/** Server-side todo shape (Date objects) as returned by Prisma with relations. */
export type TodoWithRelations = Prisma.TodoGetPayload<{
  include: typeof TODO_INCLUDE;
}>;

/** Recursively converts Date fields to ISO strings — i.e. the JSON wire shape. */
export type Serialized<T> = T extends Date
  ? string
  : T extends (infer U)[]
    ? Serialized<U>[]
    : T extends object
      ? { [K in keyof T]: Serialized<T[K]> }
      : T;

/** Client-side todo shape after JSON serialization. Single source of truth. */
export type Todo = Serialized<TodoWithRelations>;
export type Subtask = Todo["subtasks"][number];
export type TodoTagWithTag = Todo["tags"][number];
export type Tag = TodoTagWithTag["tag"];
export type TodoLink = Todo["links"][number];
/** A dependency edge with the summarized blocker task it points at. */
export type TodoDependency = Todo["dependsOn"][number];
export type BlockerTodo = TodoDependency["blocking"];

export type TodoFilter = "all" | "today" | "upcoming" | "completed";

/** One day's completed-todo count for the 7-day activity mini-chart. */
export interface DayActivity {
  date: string; // YYYY-MM-DD
  count: number;
}

/** Aggregated todo stats for the profile dashboard. */
export interface TodoStats {
  total: number;
  active: number;
  completed: number;
  completionRate: number; // 0–100
  overdue: number;
  dueToday: number;
  tagCount: number;
  byPriority: Record<Priority, number>; // active todos per priority
  completedLast7Days: DayActivity[];
}

export interface TodoUpdatePatch {
  title?: string;
  description?: string | null;
  notes?: string | null;
  priority?: Priority;
  startDate?: string | null;
  dueDate?: string | null;
  estimatedMinutes?: number | null;
  energyLevel?: EnergyLevel | null;
  context?: string | null;
  location?: string | null;
  recurrence?: RecurrenceRule;
  tags?: string[];
  /** Full replacement set of attached links. */
  links?: TodoLinkInput[];
  /** Full replacement set of blocker task ids (tasks this todo waits on). */
  dependsOn?: string[];
}

/** One link attached to a task (create/replace payload). */
export interface TodoLinkInput {
  url: string;
  title?: string | null;
}

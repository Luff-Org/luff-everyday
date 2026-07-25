import type { Prisma, Priority, RecurrenceRule } from "@prisma/client";
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

export type TodoFilter = "all" | "today" | "upcoming" | "completed";

export interface TodoUpdatePatch {
  title?: string;
  description?: string | null;
  priority?: Priority;
  dueDate?: string | null;
  recurrence?: RecurrenceRule;
  tags?: string[];
}

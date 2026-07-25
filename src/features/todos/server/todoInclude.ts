import type { Prisma } from "@prisma/client";

/** Canonical relations loaded with every todo. Runtime-free (safe to import anywhere). */
export const TODO_INCLUDE = {
  subtasks: { orderBy: { order: "asc" } },
  tags: { include: { tag: true } },
} satisfies Prisma.TodoInclude;

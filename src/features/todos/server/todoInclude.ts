import type { Prisma } from "@prisma/client";

/** Canonical relations loaded with every todo. Runtime-free (safe to import anywhere). */
export const TODO_INCLUDE = {
  subtasks: { orderBy: { order: "asc" } },
  tags: { include: { tag: true } },
  links: { orderBy: { order: "asc" } },
  images: { orderBy: { order: "asc" } },
  // Dependencies: the tasks this todo waits on, with just enough of each blocker
  // to render a chip and know whether it still gates completion.
  dependsOn: {
    include: {
      blocking: {
        select: { id: true, title: true, completed: true, priority: true },
      },
    },
  },
} satisfies Prisma.TodoInclude;

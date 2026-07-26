import type { Prisma, RecurrenceRule } from "@prisma/client";
import { prisma } from "@/shared/lib/prisma";
import { pickTagColor } from "@/features/todos/lib/tagColors";
import { TODO_INCLUDE } from "./todoInclude";

function nextDueDate(current: Date, recurrence: RecurrenceRule): Date {
  const next = new Date(current);
  if (recurrence === "DAILY") next.setDate(next.getDate() + 1);
  else if (recurrence === "WEEKLY") next.setDate(next.getDate() + 7);
  else if (recurrence === "MONTHLY") next.setMonth(next.getMonth() + 1);
  return next;
}

/** All Prisma access for todos/subtasks/tags. No request or business logic here. */
export const todoRepository = {
  list(userId: string) {
    return prisma.todo.findMany({
      where: { userId },
      include: TODO_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
  },

  findOwned(id: string, userId: string) {
    return prisma.todo.findFirst({ where: { id, userId } });
  },

  /** Ensures each tag exists for the user; returns link rows for nested writes. */
  async upsertTagLinks(userId: string, names: string[]) {
    return Promise.all(
      names.map(async (name) => {
        const tag = await prisma.tag.upsert({
          where: { userId_name: { userId, name } },
          create: { userId, name, color: pickTagColor(name) },
          update: {},
        });
        return { tagId: tag.id };
      }),
    );
  },

  create(userId: string, data: Omit<Prisma.TodoUncheckedCreateInput, "userId">) {
    return prisma.todo.create({
      data: { ...data, userId },
      include: TODO_INCLUDE,
    });
  },

  async update(id: string, data: Prisma.TodoUpdateInput) {
    return prisma.todo.update({ where: { id }, data, include: TODO_INCLUDE });
  },

  clearTagLinks(todoId: string) {
    return prisma.todoTag.deleteMany({ where: { todoId } });
  },

  /** Replaces all attached links for a todo. */
  setLinks(todoId: string, links: { url: string; title?: string | null }[]) {
    return prisma.$transaction([
      prisma.todoLink.deleteMany({ where: { todoId } }),
      prisma.todoLink.createMany({
        data: links.map((l, i) => ({
          todoId,
          url: l.url,
          title: l.title ?? null,
          order: i,
        })),
      }),
    ]);
  },

  /** Replaces all attached images for a todo (max 3, enforced at the validation layer). */
  setImages(todoId: string, images: { url: string; publicId: string }[]) {
    return prisma.$transaction([
      prisma.todoImage.deleteMany({ where: { todoId } }),
      prisma.todoImage.createMany({
        data: images.map((img, i) => ({
          todoId,
          url: img.url,
          publicId: img.publicId,
          order: i,
        })),
      }),
    ]);
  },

  /** Replaces the set of tasks a todo waits on (blockers). */
  setDependencies(blockedId: string, blockingIds: string[]) {
    return prisma.$transaction([
      prisma.todoDependency.deleteMany({ where: { blockedId } }),
      prisma.todoDependency.createMany({
        data: blockingIds.map((blockingId) => ({ blockedId, blockingId })),
      }),
    ]);
  },

  /** How many of the given ids are todos owned by this user. */
  countOwnedIn(userId: string, ids: string[]) {
    return prisma.todo.count({ where: { userId, id: { in: ids } } });
  },

  /** All dependency edges across the user's todos — for in-memory cycle checks. */
  listDependencyEdges(userId: string) {
    return prisma.todoDependency.findMany({
      where: { blocked: { userId } },
      select: { blockedId: true, blockingId: true },
    });
  },

  /** Blockers of a todo that are still incomplete (gate completion). */
  incompleteBlockers(todoId: string) {
    return prisma.todo.findMany({
      where: { blocking: { some: { blockedId: todoId } }, completed: false },
      select: { id: true, title: true },
    });
  },

  delete(id: string) {
    return prisma.todo.delete({ where: { id } });
  },

  reorder(userId: string, items: { id: string; order: number }[]) {
    return prisma.$transaction(
      items.map((item) =>
        prisma.todo.updateMany({
          where: { id: item.id, userId },
          data: { order: item.order },
        }),
      ),
    );
  },

  /**
   * Marks a todo complete and, when recurring, spawns the next occurrence
   * (cloning subtasks + tags) atomically.
   */
  completeWithRecurrence(id: string, userId: string) {
    return prisma.$transaction(
      async (tx) => {
        const existing = await tx.todo.findFirst({
          where: { id, userId },
          include: { subtasks: true, tags: true },
        });
        if (!existing) return null;

        const completed = await tx.todo.update({
          where: { id },
          data: { completed: true, completedAt: new Date() },
          include: TODO_INCLUDE,
        });

        if (existing.recurrence === "NONE") return { completed, next: null };

        const dueDate = nextDueDate(existing.dueDate ?? new Date(), existing.recurrence);
        const next = await tx.todo.create({
          data: {
            title: existing.title,
            description: existing.description,
            notes: existing.notes,
            priority: existing.priority,
            dueDate,
            estimatedMinutes: existing.estimatedMinutes,
            energyLevel: existing.energyLevel,
            context: existing.context,
            location: existing.location,
            recurrence: existing.recurrence,
            recurringParentId: existing.id,
            userId,
            subtasks: {
              create: existing.subtasks.map((s) => ({
                title: s.title,
                completed: false,
                order: s.order,
              })),
            },
            tags: { create: existing.tags.map((t) => ({ tagId: t.tagId })) },
          },
          include: TODO_INCLUDE,
        });

        return { completed, next };
      },
      // Three sequential round trips (one with nested creates) against a pooled remote
      // Postgres overrun Prisma's 5s interactive-transaction default on a cold pool.
      { maxWait: 10_000, timeout: 20_000 },
    );
  },

  // ── Stats ──

  /**
   * Everything the profile's todo panel needs, as concurrent aggregate queries.
   *
   * Counting in Postgres instead of scanning every row into the app keeps this
   * flat as a user's backlog grows: the only rows transferred are the completed
   * ones inside the 7-day activity window. The `where` clauses line up with
   * `@@index([userId, completed, dueDate])` and
   * `@@index([userId, completed, completedAt])`, and running them in parallel
   * costs roughly one round trip against a pooled remote database.
   */
  statsBundle(
    userId: string,
    window: {
      now: Date;
      startOfToday: Date;
      endOfToday: Date;
      weekStart: Date;
    },
  ) {
    return Promise.all([
      prisma.todo.groupBy({
        by: ["completed"],
        where: { userId },
        _count: { _all: true },
      }),
      prisma.todo.groupBy({
        by: ["priority"],
        where: { userId, completed: false },
        _count: { _all: true },
      }),
      prisma.todo.count({
        where: { userId, completed: false, dueDate: { lt: window.now } },
      }),
      prisma.todo.count({
        where: {
          userId,
          completed: false,
          dueDate: { gte: window.startOfToday, lte: window.endOfToday },
        },
      }),
      prisma.todo.findMany({
        where: {
          userId,
          completed: true,
          completedAt: { gte: window.weekStart },
        },
        select: { completedAt: true },
      }),
      prisma.tag.count({ where: { userId } }),
    ]);
  },

  // ── Tags ──
  listTags(userId: string) {
    return prisma.tag.findMany({ where: { userId }, orderBy: { name: "asc" } });
  },

  upsertTag(userId: string, name: string, color: string) {
    return prisma.tag.upsert({
      where: { userId_name: { userId, name } },
      create: { userId, name, color },
      update: { color },
    });
  },

  // ── Subtasks ──
  countSubtasks(todoId: string) {
    return prisma.subtask.count({ where: { todoId } });
  },

  createSubtask(todoId: string, title: string, order: number) {
    return prisma.subtask.create({ data: { title, todoId, order } });
  },

  findOwnedSubtask(subtaskId: string, todoId: string, userId: string) {
    return prisma.subtask.findFirst({
      where: { id: subtaskId, todoId, todo: { userId } },
    });
  },

  updateSubtask(subtaskId: string, data: Prisma.SubtaskUpdateInput) {
    return prisma.subtask.update({ where: { id: subtaskId }, data });
  },

  deleteSubtask(subtaskId: string) {
    return prisma.subtask.delete({ where: { id: subtaskId } });
  },
};

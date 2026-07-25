import type { Prisma, Priority } from "@prisma/client";
import type { TodoStats } from "@/features/todos/types";
import { HttpError } from "@/shared/lib/http";
import { parseQuickAdd } from "@/features/todos/lib/todoParser";
import { pickTagColor } from "@/features/todos/lib/tagColors";
import {
  createTodoSchema,
  updateTodoSchema,
  createSubtaskSchema,
  updateSubtaskSchema,
  reorderSchema,
  createTagSchema,
} from "@/features/todos/validation";
import { todoRepository } from "./todo.repository";
import type { UpdateTodoInput } from "@/features/todos/validation";

/** Maps validated scalar fields onto a Prisma update payload (only set keys present). */
function applyScalarFields(
  data: Prisma.TodoUpdateInput,
  input: Pick<
    UpdateTodoInput,
    | "title"
    | "description"
    | "notes"
    | "priority"
    | "startDate"
    | "dueDate"
    | "estimatedMinutes"
    | "energyLevel"
    | "context"
    | "location"
    | "recurrence"
  >,
) {
  if (input.title !== undefined) data.title = input.title;
  if (input.description !== undefined) data.description = input.description;
  if (input.notes !== undefined) data.notes = input.notes;
  if (input.priority !== undefined) data.priority = input.priority;
  if (input.startDate !== undefined) {
    data.startDate = input.startDate ? new Date(input.startDate) : null;
  }
  if (input.dueDate !== undefined) {
    data.dueDate = input.dueDate ? new Date(input.dueDate) : null;
  }
  if (input.estimatedMinutes !== undefined) {
    data.estimatedMinutes = input.estimatedMinutes;
  }
  if (input.energyLevel !== undefined) data.energyLevel = input.energyLevel;
  if (input.context !== undefined) data.context = input.context;
  if (input.location !== undefined) data.location = input.location;
  if (input.recurrence !== undefined) data.recurrence = input.recurrence;
}

/**
 * True if making `blockedId` depend on every id in `blockingIds` would introduce
 * a cycle, given the existing dependency `edges` (each: blocked depends on blocking).
 */
function wouldCreateCycle(
  edges: { blockedId: string; blockingId: string }[],
  blockedId: string,
  blockingIds: string[],
): boolean {
  if (blockingIds.includes(blockedId)) return true; // self-dependency
  // adjacency: task -> tasks it depends on (must finish first)
  const dependsOn = new Map<string, string[]>();
  for (const e of edges) {
    const list = dependsOn.get(e.blockedId) ?? [];
    list.push(e.blockingId);
    dependsOn.set(e.blockedId, list);
  }
  // From each proposed blocker, can we already reach blockedId? If so, adding the
  // new edge closes a loop.
  const seen = new Set<string>();
  const stack = [...blockingIds];
  while (stack.length) {
    const node = stack.pop()!;
    if (node === blockedId) return true;
    if (seen.has(node)) continue;
    seen.add(node);
    for (const next of dependsOn.get(node) ?? []) stack.push(next);
  }
  return false;
}

/** Business logic for todos: validates input, applies rules, delegates to the repository. */
export const todoService = {
  list: (userId: string) => todoRepository.list(userId),

  async create(userId: string, body: unknown) {
    const input = createTodoSchema.parse(body);
    const parsed = input.raw ? parseQuickAdd(input.raw) : null;

    const title = (input.title ?? parsed?.title ?? "").trim();
    if (!title) throw new HttpError(400, "Title is required");

    const dueDate = input.dueDate
      ? new Date(input.dueDate)
      : (parsed?.dueDate ?? null);
    const priority: Priority = input.priority ?? parsed?.priority ?? "MEDIUM";
    const tagNames = input.tags ?? parsed?.tags ?? [];

    const tagLinks = await todoRepository.upsertTagLinks(userId, tagNames);
    return todoRepository.create(userId, {
      title,
      description: input.description ?? null,
      notes: input.notes ?? null,
      startDate: input.startDate ? new Date(input.startDate) : null,
      dueDate,
      priority,
      estimatedMinutes: input.estimatedMinutes ?? null,
      energyLevel: input.energyLevel ?? null,
      context: input.context ?? null,
      location: input.location ?? null,
      tags: { create: tagLinks },
      links: input.links?.length
        ? {
            create: input.links.map((l, i) => ({
              url: l.url,
              title: l.title ?? null,
              order: i,
            })),
          }
        : undefined,
    });
  },

  async update(userId: string, id: string, body: unknown) {
    const input = updateTodoSchema.parse(body);
    const existing = await todoRepository.findOwned(id, userId);
    if (!existing) throw new HttpError(404, "Not found");

    const data: Prisma.TodoUpdateInput = {};
    applyScalarFields(data, input);
    if (input.completed !== undefined) {
      data.completed = input.completed;
      data.completedAt = input.completed ? new Date() : null;
    }
    if (input.order !== undefined) data.order = input.order;
    if (input.tags !== undefined) {
      await todoRepository.clearTagLinks(id);
      const tagLinks = await todoRepository.upsertTagLinks(userId, input.tags);
      data.tags = { create: tagLinks };
    }

    // Links: full replacement of the attached-link set.
    if (input.links !== undefined) {
      await todoRepository.setLinks(id, input.links);
    }

    // Dependencies: validate ownership, reject self/cycles, then replace.
    if (input.dependsOn !== undefined) {
      const blockingIds = Array.from(new Set(input.dependsOn)).filter(
        (bid) => bid !== id,
      );
      if (blockingIds.length) {
        const owned = await todoRepository.countOwnedIn(userId, blockingIds);
        if (owned !== blockingIds.length) {
          throw new HttpError(400, "Unknown blocker task");
        }
        const edges = await todoRepository.listDependencyEdges(userId);
        // Drop this task's current outgoing edges — they're being replaced.
        const rest = edges.filter((e) => e.blockedId !== id);
        if (wouldCreateCycle(rest, id, blockingIds)) {
          throw new HttpError(409, "That would create a circular dependency");
        }
      }
      await todoRepository.setDependencies(id, blockingIds);
    }

    return todoRepository.update(id, data);
  },

  async remove(userId: string, id: string) {
    const existing = await todoRepository.findOwned(id, userId);
    if (!existing) throw new HttpError(404, "Not found");
    await todoRepository.delete(id);
    return { success: true };
  },

  async complete(userId: string, id: string) {
    const existing = await todoRepository.findOwned(id, userId);
    if (!existing) throw new HttpError(404, "Not found");

    // Can't finish a task while any blocker it depends on is still open.
    const blockers = await todoRepository.incompleteBlockers(id);
    if (blockers.length) {
      throw new HttpError(
        409,
        `Blocked by ${blockers.length} unfinished task${blockers.length > 1 ? "s" : ""}`,
      );
    }

    const result = await todoRepository.completeWithRecurrence(id, userId);
    if (!result) throw new HttpError(404, "Not found");
    return result;
  },

  async reorder(userId: string, body: unknown) {
    const { items } = reorderSchema.parse(body);
    await todoRepository.reorder(userId, items);
    return { success: true };
  },

  async stats(userId: string): Promise<TodoStats> {
    try {
      const now = new Date();
      const startOfToday = new Date(now);
      startOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date(startOfToday);
      endOfToday.setHours(23, 59, 59, 999);
      const weekStart = new Date(startOfToday);
      weekStart.setDate(weekStart.getDate() - 6);

      const [todos, tagCount] = await todoRepository.listForStats(userId);

      let completedCount = 0;
      let activeCount = 0;
      let overdue = 0;
      let dueToday = 0;
      const byPriority: Record<Priority, number> = {
        LOW: 0,
        MEDIUM: 0,
        HIGH: 0,
        URGENT: 0,
      };

      const dayKey = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
          d.getDate(),
        ).padStart(2, "0")}`;
      const buckets = new Map<string, number>();
      for (let i = 0; i < 7; i++) {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        buckets.set(dayKey(d), 0);
      }

      for (const t of todos) {
        if (t.completed) {
          completedCount++;
          if (t.completedAt) {
            const key = dayKey(new Date(t.completedAt));
            if (buckets.has(key)) {
              buckets.set(key, (buckets.get(key) ?? 0) + 1);
            }
          }
        } else {
          activeCount++;
          byPriority[t.priority] = (byPriority[t.priority] ?? 0) + 1;
          if (t.dueDate) {
            const due = new Date(t.dueDate);
            if (due < now) overdue++;
            if (due >= startOfToday && due <= endOfToday) dueToday++;
          }
        }
      }

      const total = completedCount + activeCount;

      return {
        total,
        active: activeCount,
        completed: completedCount,
        completionRate: total > 0 ? Math.round((completedCount / total) * 100) : 0,
        overdue,
        dueToday,
        tagCount,
        byPriority,
        completedLast7Days: Array.from(buckets, ([date, count]) => ({
          date,
          count,
        })),
      };
    } catch (error) {
      console.error("Failed to fetch todo stats:", error);
      return {
        total: 0,
        active: 0,
        completed: 0,
        completionRate: 0,
        overdue: 0,
        dueToday: 0,
        tagCount: 0,
        byPriority: { LOW: 0, MEDIUM: 0, HIGH: 0, URGENT: 0 },
        completedLast7Days: [],
      };
    }
  },

  // ── Tags ──
  listTags: (userId: string) => todoRepository.listTags(userId),

  createTag(userId: string, body: unknown) {
    const { name, color } = createTagSchema.parse(body);
    return todoRepository.upsertTag(userId, name, color ?? pickTagColor(name));
  },

  // ── Subtasks ──
  async addSubtask(userId: string, todoId: string, body: unknown) {
    const { title } = createSubtaskSchema.parse(body);
    const todo = await todoRepository.findOwned(todoId, userId);
    if (!todo) throw new HttpError(404, "Not found");
    const order = await todoRepository.countSubtasks(todoId);
    return todoRepository.createSubtask(todoId, title, order);
  },

  async updateSubtask(
    userId: string,
    todoId: string,
    subtaskId: string,
    body: unknown,
  ) {
    const input = updateSubtaskSchema.parse(body);
    const existing = await todoRepository.findOwnedSubtask(subtaskId, todoId, userId);
    if (!existing) throw new HttpError(404, "Not found");
    return todoRepository.updateSubtask(subtaskId, input);
  },

  async removeSubtask(userId: string, todoId: string, subtaskId: string) {
    const existing = await todoRepository.findOwnedSubtask(subtaskId, todoId, userId);
    if (!existing) throw new HttpError(404, "Not found");
    await todoRepository.deleteSubtask(subtaskId);
    return { success: true };
  },
};

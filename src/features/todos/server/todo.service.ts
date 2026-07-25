import type { Prisma, Priority } from "@prisma/client";
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
      dueDate,
      priority,
      tags: { create: tagLinks },
    });
  },

  async update(userId: string, id: string, body: unknown) {
    const input = updateTodoSchema.parse(body);
    const existing = await todoRepository.findOwned(id, userId);
    if (!existing) throw new HttpError(404, "Not found");

    const data: Prisma.TodoUpdateInput = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.description !== undefined) data.description = input.description;
    if (input.dueDate !== undefined) {
      data.dueDate = input.dueDate ? new Date(input.dueDate) : null;
    }
    if (input.priority !== undefined) data.priority = input.priority;
    if (input.recurrence !== undefined) data.recurrence = input.recurrence;
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

    return todoRepository.update(id, data);
  },

  async remove(userId: string, id: string) {
    const existing = await todoRepository.findOwned(id, userId);
    if (!existing) throw new HttpError(404, "Not found");
    await todoRepository.delete(id);
    return { success: true };
  },

  async complete(userId: string, id: string) {
    const result = await todoRepository.completeWithRecurrence(id, userId);
    if (!result) throw new HttpError(404, "Not found");
    return result;
  },

  async reorder(userId: string, body: unknown) {
    const { items } = reorderSchema.parse(body);
    await todoRepository.reorder(userId, items);
    return { success: true };
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

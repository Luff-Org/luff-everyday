import { z } from "zod";
import { Priority, RecurrenceRule } from "@prisma/client";

const prioritySchema = z.nativeEnum(Priority);
const recurrenceSchema = z.nativeEnum(RecurrenceRule);
const tagName = z
  .string()
  .transform((s) => s.trim().toLowerCase())
  .pipe(z.string().min(1).max(30));
const tagList = z.array(tagName);

/** Create a todo — either from a raw quick-add string or explicit fields. */
export const createTodoSchema = z.object({
  raw: z.string().optional(),
  title: z.string().trim().min(1).max(500).optional(),
  description: z.string().max(2000).nullish(),
  dueDate: z.string().min(1).nullish(),
  priority: prioritySchema.optional(),
  tags: tagList.optional(),
});

export const updateTodoSchema = z.object({
  title: z.string().trim().min(1).max(500).optional(),
  description: z.string().max(2000).nullable().optional(),
  dueDate: z.string().min(1).nullable().optional(),
  priority: prioritySchema.optional(),
  recurrence: recurrenceSchema.optional(),
  completed: z.boolean().optional(),
  order: z.number().int().optional(),
  tags: tagList.optional(),
});

export const createSubtaskSchema = z.object({
  title: z.string().trim().min(1).max(500),
});

export const updateSubtaskSchema = z.object({
  title: z.string().trim().min(1).max(500).optional(),
  completed: z.boolean().optional(),
  order: z.number().int().optional(),
});

export const reorderSchema = z.object({
  items: z.array(z.object({ id: z.string(), order: z.number().int() })),
});

export const createTagSchema = z.object({
  name: tagName,
  color: z.string().optional(),
});

export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;
export type ReorderInput = z.infer<typeof reorderSchema>;

import { z } from "zod";
import { Priority, RecurrenceRule, EnergyLevel } from "@prisma/client";

const prioritySchema = z.nativeEnum(Priority);
const recurrenceSchema = z.nativeEnum(RecurrenceRule);
const energySchema = z.nativeEnum(EnergyLevel);
const tagName = z
  .string()
  .transform((s) => s.trim().toLowerCase())
  .pipe(z.string().min(1).max(30));
const tagList = z.array(tagName);

/** A single attached link. Title optional; url must look like a URL. */
const linkSchema = z.object({
  url: z.string().trim().url().max(2000),
  title: z.string().trim().max(200).nullish(),
});
const linkList = z.array(linkSchema).max(50);

/** Full-replacement set of blocker task ids (cuids). */
const dependsOnList = z.array(z.string().min(1)).max(50);

const estimatedMinutes = z.number().int().min(0).max(60 * 24 * 30);
const shortText = z.string().trim().max(120);

/** Create a todo — either from a raw quick-add string or explicit fields. */
export const createTodoSchema = z.object({
  raw: z.string().optional(),
  title: z.string().trim().min(1).max(500).optional(),
  description: z.string().max(2000).nullish(),
  notes: z.string().max(20000).nullish(),
  startDate: z.string().min(1).nullish(),
  dueDate: z.string().min(1).nullish(),
  priority: prioritySchema.optional(),
  estimatedMinutes: estimatedMinutes.nullish(),
  energyLevel: energySchema.nullish(),
  context: shortText.nullish(),
  location: shortText.nullish(),
  tags: tagList.optional(),
  links: linkList.optional(),
});

export const updateTodoSchema = z.object({
  title: z.string().trim().min(1).max(500).optional(),
  description: z.string().max(2000).nullable().optional(),
  notes: z.string().max(20000).nullable().optional(),
  startDate: z.string().min(1).nullable().optional(),
  dueDate: z.string().min(1).nullable().optional(),
  priority: prioritySchema.optional(),
  estimatedMinutes: estimatedMinutes.nullable().optional(),
  energyLevel: energySchema.nullable().optional(),
  context: shortText.nullable().optional(),
  location: shortText.nullable().optional(),
  recurrence: recurrenceSchema.optional(),
  completed: z.boolean().optional(),
  order: z.number().int().optional(),
  tags: tagList.optional(),
  links: linkList.optional(),
  dependsOn: dependsOnList.optional(),
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

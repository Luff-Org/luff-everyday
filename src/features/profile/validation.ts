import { z } from "zod";

/** Editable profile fields — only name and avatar image are user-editable. */
export const updateProfileSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  image: z
    .union([z.string().trim().url().max(2000), z.literal(""), z.null()])
    .optional()
    .transform((v) => (v ? v : null)),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

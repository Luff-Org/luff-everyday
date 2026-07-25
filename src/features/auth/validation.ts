import { z } from "zod";

const normalized = z.string().transform((s) => s.trim().toLowerCase());

export const registerSchema = z.object({
  username: normalized.pipe(
    z
      .string()
      .regex(
        /^[a-z0-9_]{3,20}$/,
        "Username must be 3-20 characters: letters, numbers, underscore only.",
      ),
  ),
  email: normalized.pipe(
    z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "A valid email is required."),
  ),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export type RegisterInput = z.infer<typeof registerSchema>;

import { z } from "zod";

/** Wire shape for a submitted typing-test result. */
export const testResultSchema = z.object({
  wpm: z.number().int().nonnegative(),
  rawWpm: z.number().int().nonnegative(),
  accuracy: z.number().min(0).max(100),
  duration: z.number().int().positive(),
});

export type TestResultInput = z.infer<typeof testResultSchema>;

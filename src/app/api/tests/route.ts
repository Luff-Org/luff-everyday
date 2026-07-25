import { z } from "zod";
import { route, requireUser } from "@/shared/lib/http";
import { prisma } from "@/shared/lib/prisma";

const testResultSchema = z.object({
  wpm: z.number().int().nonnegative(),
  rawWpm: z.number().int().nonnegative(),
  accuracy: z.number().min(0).max(100),
  duration: z.number().int().positive(),
});

export const POST = route(async (req) => {
  const userId = await requireUser();
  const data = testResultSchema.parse(await req.json());
  return prisma.testResult.create({ data: { ...data, userId } });
});

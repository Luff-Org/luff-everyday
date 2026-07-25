import { testResultSchema } from "@/features/typing/validation";
import type { TypingStats } from "@/features/typing/types";
import { testRepository } from "./test.repository";

/** Business logic for typing-test results: validates input, shapes stats. */
export const testService = {
  createResult(userId: string, body: unknown) {
    const data = testResultSchema.parse(body);
    return testRepository.create(userId, data);
  },

  async stats(userId: string): Promise<TypingStats> {
    try {
      const [agg, byDuration, recent] = await Promise.all([
        testRepository.aggregate(userId),
        testRepository.bestByDuration(userId),
        testRepository.recent(userId),
      ]);

      const round = (n: number | null) => Math.round(n ?? 0);

      return {
        totalTests: agg._count,
        bestWpm: agg._max.wpm ?? 0,
        avgWpm: round(agg._avg.wpm),
        avgRawWpm: round(agg._avg.rawWpm),
        avgAccuracy: Number((agg._avg.accuracy ?? 0).toFixed(1)),
        bestByDuration: byDuration.map((row) => ({
          duration: row.duration,
          bestWpm: row._max.wpm ?? 0,
        })),
        history: recent.map((r) => ({
          id: r.id,
          wpm: r.wpm,
          rawWpm: r.rawWpm,
          accuracy: r.accuracy,
          duration: r.duration,
          createdAt: r.createdAt.toISOString(),
        })),
      };
    } catch (error) {
      console.error("Failed to fetch typing stats:", error);
      return {
        totalTests: 0,
        bestWpm: 0,
        avgWpm: 0,
        avgRawWpm: 0,
        avgAccuracy: 0,
        bestByDuration: [],
        history: [],
      };
    }
  },
};

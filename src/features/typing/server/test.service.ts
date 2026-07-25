import { testResultSchema } from "@/features/typing/validation";
import type { TypingStats } from "@/features/typing/types";
import { testRepository } from "./test.repository";

/** Shape returned for a user with no recorded tests (and as the error fallback). */
const EMPTY_STATS: TypingStats = {
  totalTests: 0,
  bestWpm: 0,
  avgWpm: 0,
  avgRawWpm: 0,
  avgAccuracy: 0,
  bestByDuration: [],
  history: [],
};

/** Business logic for typing-test results: validates input, shapes stats. */
export const testService = {
  createResult(userId: string, body: unknown) {
    const data = testResultSchema.parse(body);
    return testRepository.create(userId, data);
  },

  async stats(userId: string): Promise<TypingStats> {
    try {
      const [totals, perDuration, recent] =
        await testRepository.statsBundle(userId);

      if (totals._count === 0) return EMPTY_STATS;

      return {
        totalTests: totals._count,
        bestWpm: totals._max.wpm ?? 0,
        avgWpm: Math.round(totals._avg.wpm ?? 0),
        avgRawWpm: Math.round(totals._avg.rawWpm ?? 0),
        avgAccuracy: Number((totals._avg.accuracy ?? 0).toFixed(1)),
        bestByDuration: perDuration.map((row) => ({
          duration: row.duration,
          bestWpm: row._max.wpm ?? 0,
        })),
        // Queried newest-first for the index; the chart reads left-to-right.
        history: recent.reverse().map((r) => ({
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
      return EMPTY_STATS;
    }
  },
};

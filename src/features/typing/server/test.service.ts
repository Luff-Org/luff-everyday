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
      const results = await testRepository.listForStats(userId);
      const totalTests = results.length;

      if (totalTests === 0) {
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

      let bestWpm = 0;
      let totalWpm = 0;
      let totalRawWpm = 0;
      let totalAccuracy = 0;
      const durationMap = new Map<number, number>();

      for (const r of results) {
        if (r.wpm > bestWpm) bestWpm = r.wpm;
        totalWpm += r.wpm;
        totalRawWpm += r.rawWpm;
        totalAccuracy += r.accuracy;

        const currentBest = durationMap.get(r.duration) ?? 0;
        if (r.wpm > currentBest) {
          durationMap.set(r.duration, r.wpm);
        }
      }

      const bestByDuration = Array.from(durationMap.entries())
        .map(([duration, bestWpm]) => ({ duration, bestWpm }))
        .sort((a, b) => a.duration - b.duration);

      // Take last 30 tests in ascending order for history chart
      const history = results
        .slice(0, 30)
        .reverse()
        .map((r) => ({
          id: r.id,
          wpm: r.wpm,
          rawWpm: r.rawWpm,
          accuracy: r.accuracy,
          duration: r.duration,
          createdAt: r.createdAt.toISOString(),
        }));

      return {
        totalTests,
        bestWpm,
        avgWpm: Math.round(totalWpm / totalTests),
        avgRawWpm: Math.round(totalRawWpm / totalTests),
        avgAccuracy: Number((totalAccuracy / totalTests).toFixed(1)),
        bestByDuration,
        history,
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

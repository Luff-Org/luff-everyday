import type { Prisma } from "@prisma/client";
import { prisma } from "@/shared/lib/prisma";

/** All Prisma access for typing-test results. No request or business logic here. */
export const testRepository = {
  create(
    userId: string,
    data: Omit<Prisma.TestResultUncheckedCreateInput, "userId">,
  ) {
    return prisma.testResult.create({ data: { ...data, userId } });
  },

  /**
   * Everything the profile's typing panel needs, as three concurrent queries.
   *
   * Totals and per-duration bests are computed by Postgres rather than by
   * pulling every row into the app, so the work stays flat as a user's history
   * grows; only the 30 points the chart actually draws are transferred. All
   * three are covered by `@@index([userId, createdAt])` and run in parallel, so
   * this costs roughly one round trip on a pooled remote database.
   */
  statsBundle(userId: string, historySize = 30) {
    return Promise.all([
      prisma.testResult.aggregate({
        where: { userId },
        _count: true,
        _max: { wpm: true },
        _avg: { wpm: true, rawWpm: true, accuracy: true },
      }),
      prisma.testResult.groupBy({
        by: ["duration"],
        where: { userId },
        _max: { wpm: true },
        orderBy: { duration: "asc" },
      }),
      // Newest-first so the index is walked backwards and the limit applies;
      // the service reverses into chronological order for the chart.
      prisma.testResult.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: historySize,
        select: {
          id: true,
          wpm: true,
          rawWpm: true,
          accuracy: true,
          duration: true,
          createdAt: true,
        },
      }),
    ]);
  },
};

import type { Prisma } from "@prisma/client";
import { prisma } from "@/shared/lib/prisma";

/** All Prisma access for typing-test results. No request or business logic here. */
export const testRepository = {
  create(userId: string, data: Prisma.TestResultUncheckedCreateInput) {
    return prisma.testResult.create({ data: { ...data, userId } });
  },

  aggregate(userId: string) {
    return prisma.testResult.aggregate({
      where: { userId },
      _count: true,
      _max: { wpm: true },
      _avg: { wpm: true, rawWpm: true, accuracy: true },
    });
  },

  bestByDuration(userId: string) {
    return prisma.testResult.groupBy({
      by: ["duration"],
      where: { userId },
      _max: { wpm: true },
      orderBy: { duration: "asc" },
    });
  },

  /** Last `take` results, oldest first, for the trend chart. */
  recent(userId: string, take = 30) {
    return prisma.testResult
      .findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take,
        select: {
          id: true,
          wpm: true,
          rawWpm: true,
          accuracy: true,
          duration: true,
          createdAt: true,
        },
      })
      .then((rows) => rows.reverse());
  },

  /** Fetches all test results for a user to calculate stats efficiently in memory. */
  listForStats(userId: string) {
    return prisma.testResult.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        wpm: true,
        rawWpm: true,
        accuracy: true,
        duration: true,
        createdAt: true,
      },
    });
  },
};

import { todoService } from "@/features/todos/server/todo.service";
import { testService } from "@/features/typing/server/test.service";
import type { TodoStats } from "@/features/todos/types";
import type { TypingStats } from "@/features/typing/types";
import { TypingStatsPanel } from "./TypingStatsPanel";
import { TodoStatsPanel } from "./TodoStatsPanel";

/**
 * Server component that fetches both stat aggregations directly (no HTTP hop)
 * and renders the panels. Wrapped in <Suspense> by the page so the shell can
 * stream first while these DB queries resolve.
 */
export async function ProfileDashboard({ userId }: { userId: string }) {
  let statsData: { todos: TodoStats; typing: TypingStats } | null = null;

  try {
    const [todos, typing] = await Promise.all([
      todoService.stats(userId),
      testService.stats(userId),
    ]);
    statsData = { todos, typing };
  } catch (error) {
    console.error("ProfileDashboard stats error:", error);
  }

  if (!statsData) {
    return (
      <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-center">
        Unable to load dashboard statistics at this time. Please ensure the database connection is available and try refreshing.
      </div>
    );
  }

  return (
    <>
      <TypingStatsPanel stats={statsData.typing} />
      <TodoStatsPanel stats={statsData.todos} />
    </>
  );
}

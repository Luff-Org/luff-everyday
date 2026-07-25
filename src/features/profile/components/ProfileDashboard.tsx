import { todoService } from "@/features/todos/server/todo.service";
import { testService } from "@/features/typing/server/test.service";
import { TypingStatsPanel } from "./TypingStatsPanel";
import { TodoStatsPanel } from "./TodoStatsPanel";

/**
 * Server component that fetches both stat aggregations directly (no HTTP hop)
 * and renders the panels. Wrapped in <Suspense> by the page so the shell can
 * stream first while these DB queries resolve.
 */
export async function ProfileDashboard({ userId }: { userId: string }) {
  const [todos, typing] = await Promise.all([
    todoService.stats(userId),
    testService.stats(userId),
  ]);

  return (
    <>
      <TypingStatsPanel stats={typing} />
      <TodoStatsPanel stats={todos} />
    </>
  );
}

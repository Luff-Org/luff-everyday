import { todoService } from "@/features/todos/server/todo.service";
import { testService } from "@/features/typing/server/test.service";
import type { TodoStats } from "@/features/todos/types";
import type { TypingStats } from "@/features/typing/types";
import { TypingStatsPanel } from "./TypingStatsPanel";
import { TodoStatsPanel } from "./TodoStatsPanel";

export async function TypingDashboard({ userId }: { userId: string }) {
  let stats: TypingStats | null = null;
  try {
    stats = await testService.stats(userId);
  } catch (error) {
    console.error("TypingDashboard stats error:", error);
  }

  if (!stats) {
    return (
      <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-center">
        Unable to load typing statistics. Please try refreshing.
      </div>
    );
  }

  return <TypingStatsPanel stats={stats} />;
}

export async function TodoDashboard({ userId }: { userId: string }) {
  let stats: TodoStats | null = null;
  try {
    stats = await todoService.stats(userId);
  } catch (error) {
    console.error("TodoDashboard stats error:", error);
  }

  if (!stats) {
    return (
      <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-center">
        Unable to load todo statistics. Please try refreshing.
      </div>
    );
  }

  return <TodoStatsPanel stats={stats} />;
}

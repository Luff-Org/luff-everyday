import type { TodoStats } from "@/features/todos/types";
import type { TypingStats } from "@/features/typing/types";

/** Combined dashboard payload returned by GET /api/profile. */
export interface ProfileStats {
  todos: TodoStats;
  typing: TypingStats;
}

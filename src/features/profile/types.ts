import type { TodoStats } from "@/features/todos/types";
import type { TypingStats } from "@/features/typing/types";

/** Combined dashboard payload returned by GET /api/profile. */
export interface ProfileStats {
  todos: TodoStats;
  typing: TypingStats;
}

/** Editable-account shape returned by PATCH /api/profile. */
export interface ProfileUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

import { route, requireUser } from "@/shared/lib/http";
import { todoService } from "@/features/todos/server/todo.service";
import { testService } from "@/features/typing/server/test.service";
import type { ProfileStats } from "@/features/profile/types";

export const GET = route(async (): Promise<ProfileStats> => {
  const userId = await requireUser();
  const [todos, typing] = await Promise.all([
    todoService.stats(userId),
    testService.stats(userId),
  ]);
  return { todos, typing };
});

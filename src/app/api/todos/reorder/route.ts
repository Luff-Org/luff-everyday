import { route, requireUser } from "@/shared/lib/http";
import { todoService } from "@/features/todos/server/todo.service";

export const POST = route(async (req) => {
  const userId = await requireUser();
  return todoService.reorder(userId, await req.json());
});

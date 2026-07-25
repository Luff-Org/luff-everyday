import { route, requireUser } from "@/shared/lib/http";
import { todoService } from "@/features/todos/server/todo.service";

export const GET = route(async () => {
  const userId = await requireUser();
  return todoService.list(userId);
});

export const POST = route(async (req) => {
  const userId = await requireUser();
  return todoService.create(userId, await req.json());
});

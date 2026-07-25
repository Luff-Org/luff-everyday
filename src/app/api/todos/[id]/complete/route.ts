import { route, requireUser } from "@/shared/lib/http";
import { todoService } from "@/features/todos/server/todo.service";

type Ctx = { params: Promise<{ id: string }> };

export const POST = route<Ctx>(async (_req, { params }) => {
  const userId = await requireUser();
  const { id } = await params;
  return todoService.complete(userId, id);
});

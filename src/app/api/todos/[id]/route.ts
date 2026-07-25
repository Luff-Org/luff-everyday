import { route, requireUser } from "@/shared/lib/http";
import { todoService } from "@/features/todos/server/todo.service";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = route<Ctx>(async (req, { params }) => {
  const userId = await requireUser();
  const { id } = await params;
  return todoService.update(userId, id, await req.json());
});

export const DELETE = route<Ctx>(async (_req, { params }) => {
  const userId = await requireUser();
  const { id } = await params;
  return todoService.remove(userId, id);
});

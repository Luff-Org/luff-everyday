import { route, requireUser } from "@/shared/lib/http";
import { todoService } from "@/features/todos/server/todo.service";

type Ctx = { params: Promise<{ id: string; subtaskId: string }> };

export const PATCH = route<Ctx>(async (req, { params }) => {
  const userId = await requireUser();
  const { id, subtaskId } = await params;
  return todoService.updateSubtask(userId, id, subtaskId, await req.json());
});

export const DELETE = route<Ctx>(async (_req, { params }) => {
  const userId = await requireUser();
  const { id, subtaskId } = await params;
  return todoService.removeSubtask(userId, id, subtaskId);
});

import type { Todo, Subtask, Tag, TodoUpdatePatch } from "@/features/todos/types";
import type { CreateTodoInput } from "@/features/todos/validation";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: init?.body
      ? { "Content-Type": "application/json", ...init?.headers }
      : init?.headers,
  });
  if (!res.ok) throw new Error(`Request to ${url} failed (${res.status})`);
  return res.json() as Promise<T>;
}

/** Typed client for the todos API. The single place that talks HTTP to `/api/todos`. */
export const todosApi = {
  list: () => request<Todo[]>("/api/todos"),
  listTags: () => request<Tag[]>("/api/todos/tags"),

  create: (body: CreateTodoInput) =>
    request<Todo>("/api/todos", { method: "POST", body: JSON.stringify(body) }),

  update: (id: string, patch: TodoUpdatePatch & { completed?: boolean }) =>
    request<Todo>(`/api/todos/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),

  remove: (id: string) =>
    request<{ success: boolean }>(`/api/todos/${id}`, { method: "DELETE" }),

  complete: (id: string) =>
    request<{ completed: Todo; next: Todo | null }>(
      `/api/todos/${id}/complete`,
      { method: "POST" },
    ),

  addSubtask: (todoId: string, title: string) =>
    request<Subtask>(`/api/todos/${todoId}/subtasks`, {
      method: "POST",
      body: JSON.stringify({ title }),
    }),

  updateSubtask: (
    todoId: string,
    subtaskId: string,
    patch: { title?: string; completed?: boolean; order?: number },
  ) =>
    request<Subtask>(`/api/todos/${todoId}/subtasks/${subtaskId}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),

  removeSubtask: (todoId: string, subtaskId: string) =>
    request<{ success: boolean }>(
      `/api/todos/${todoId}/subtasks/${subtaskId}`,
      { method: "DELETE" },
    ),
};

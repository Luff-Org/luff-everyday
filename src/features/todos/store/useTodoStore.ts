import { create } from "zustand";
import { toast } from "sonner";
import { parseQuickAdd } from "@/features/todos/lib/todoParser";
import { todosApi, ApiError } from "@/features/todos/api";
import type {
  Todo,
  Subtask,
  Tag,
  TodoFilter,
  TodoUpdatePatch,
} from "@/features/todos/types";

export type { Todo, Subtask, Tag, TodoFilter, TodoUpdatePatch };

interface TodoState {
  todos: Todo[];
  tags: Tag[];
  filter: TodoFilter;
  tagFilter: string | null;
  isLoading: boolean;
  /** False until the first list request has settled — lets the UI tell "still
   *  loading" apart from "loaded and genuinely empty". */
  hasLoaded: boolean;
  loadInitialData: () => Promise<void>;
  fetchTodos: () => Promise<void>;
  fetchTags: () => Promise<void>;
  addTodo: (input: {
    raw: string;
    dueDate?: string | null;
    description?: string | null;
  }) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  updateTodo: (id: string, patch: TodoUpdatePatch) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  addSubtask: (todoId: string, title: string) => Promise<void>;
  toggleSubtask: (todoId: string, subtaskId: string) => Promise<void>;
  deleteSubtask: (todoId: string, subtaskId: string) => Promise<void>;
  setFilter: (filter: TodoFilter) => void;
  setTagFilter: (tagId: string | null) => void;
}

const isTempId = (id: string) => id.startsWith("temp-");

/** A dropped session mid-visit: bounce to login rather than showing an error. */
function isUnauthorized(error: unknown) {
  return error instanceof ApiError && error.status === 401;
}

export const useTodoStore = create<TodoState>((set, get) => {
  /** In-flight initial load, so React's double-invoked effects (StrictMode) and
   *  remounts share one pair of requests instead of racing duplicates. */
  let initialLoad: Promise<void> | null = null;

  /**
   * Runs an already-applied optimistic mutation against the server: on failure
   * it restores `snapshot` and shows `errorMessage`; on success runs `reconcile`.
   */
  async function commit<T>(
    snapshot: Todo[],
    request: () => Promise<T>,
    errorMessage: string,
    reconcile?: (result: T) => void,
  ): Promise<void> {
    try {
      reconcile?.(await request());
    } catch (error) {
      console.error(error);
      set({ todos: snapshot });
      toast.error(errorMessage);
    }
  }

  return {
    todos: [],
    tags: [],
    filter: "all",
    tagFilter: null,
    isLoading: false,
    hasLoaded: false,

    /**
     * Page-entry fetch: todos and tags go out together rather than one after the
     * other, and the route is already guarded by middleware, so this does not
     * wait on `useSession()` resolving first.
     */
    loadInitialData: () => {
      if (initialLoad) return initialLoad;

      initialLoad = (async () => {
        set({ isLoading: true });
        try {
          const [todos, tags] = await Promise.all([
            todosApi.list(),
            todosApi.listTags(),
          ]);
          set({ todos, tags, isLoading: false, hasLoaded: true });
        } catch (error) {
          if (isUnauthorized(error)) {
            window.location.href = "/login?callbackUrl=/todos";
            return;
          }
          console.error(error);
          set({ isLoading: false, hasLoaded: true });
          toast.error("Couldn't load your todos.");
        } finally {
          initialLoad = null;
        }
      })();

      return initialLoad;
    },

    fetchTodos: async () => {
      set({ isLoading: true });
      try {
        set({ todos: await todosApi.list(), isLoading: false, hasLoaded: true });
      } catch (error) {
        console.error(error);
        set({ isLoading: false, hasLoaded: true });
        toast.error("Couldn't load your todos.");
      }
    },

    fetchTags: async () => {
      try {
        set({ tags: await todosApi.listTags() });
      } catch (error) {
        console.error(error);
      }
    },

    addTodo: async ({ raw, dueDate: dueDateOverride, description }) => {
      const parsed = parseQuickAdd(raw);
      if (!parsed.title) return;

      const finalDueDate =
        dueDateOverride !== undefined
          ? dueDateOverride
          : parsed.dueDate
            ? parsed.dueDate.toISOString()
            : null;

      const snapshot = get().todos;
      const tempId = `temp-${crypto.randomUUID()}`;
      const optimisticTodo: Todo = {
        id: tempId,
        title: parsed.title,
        description: description ?? null,
        notes: null,
        completed: false,
        completedAt: null,
        priority: parsed.priority ?? "MEDIUM",
        startDate: null,
        dueDate: finalDueDate,
        estimatedMinutes: null,
        energyLevel: null,
        context: null,
        location: null,
        order: 0,
        recurrence: "NONE",
        recurringParentId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: "",
        subtasks: [],
        links: [],
        dependsOn: [],
        tags: parsed.tags.map((name) => ({
          todoId: tempId,
          tagId: name,
          tag: { id: name, name, color: "#94a3b8", userId: "" },
        })),
      };

      set({ todos: [optimisticTodo, ...snapshot] });

      await commit(
        snapshot,
        () => todosApi.create({ raw, dueDate: dueDateOverride, description }),
        "Couldn't add that todo.",
        (created) => {
          set((state) => ({
            todos: state.todos.map((t) => (t.id === tempId ? created : t)),
          }));
          get().fetchTags();
        },
      );
    },

    toggleComplete: async (id) => {
      if (isTempId(id)) {
        toast.info("Still saving that todo, try again in a moment.");
        return;
      }
      const snapshot = get().todos;
      const todo = snapshot.find((t) => t.id === id);
      if (!todo) return;

      if (todo.completed) {
        set({
          todos: snapshot.map((t) =>
            t.id === id ? { ...t, completed: false, completedAt: null } : t,
          ),
        });
        await commit(
          snapshot,
          () => todosApi.update(id, { completed: false }),
          "Couldn't update that todo.",
        );
        return;
      }

      set({
        todos: snapshot.map((t) =>
          t.id === id
            ? { ...t, completed: true, completedAt: new Date().toISOString() }
            : t,
        ),
      });

      await commit(
        snapshot,
        () => todosApi.complete(id),
        "Couldn't complete that todo.",
        ({ next }) => {
          if (next) set((state) => ({ todos: [next, ...state.todos] }));
        },
      );
    },

    updateTodo: async (id, patch) => {
      if (isTempId(id)) {
        toast.info("Still saving that todo, try again in a moment.");
        return;
      }
      const snapshot = get().todos;
      // tags/links/dependsOn are relations whose wire shape differs from the
      // patch shape (ids need resolving server-side) — apply scalars locally
      // and let the server response reconcile the relations.
      const { tags: _tags, links: _links, dependsOn: _dependsOn, ...localPatch } = patch;
      set({
        todos: snapshot.map((t) => (t.id === id ? { ...t, ...localPatch } : t)),
      });

      await commit(
        snapshot,
        () => todosApi.update(id, patch),
        "Couldn't update that todo.",
        (updated) => {
          set((state) => ({
            todos: state.todos.map((t) => (t.id === id ? updated : t)),
          }));
        },
      );
    },

    deleteTodo: async (id) => {
      const snapshot = get().todos;
      set({ todos: snapshot.filter((t) => t.id !== id) });
      if (isTempId(id)) return;
      await commit(
        snapshot,
        () => todosApi.remove(id),
        "Couldn't delete that todo.",
      );
    },

    addSubtask: async (todoId, title) => {
      if (!title.trim()) return;
      if (isTempId(todoId)) {
        toast.info("Still saving that todo, try again in a moment.");
        return;
      }
      const snapshot = get().todos;
      const tempId = `temp-${crypto.randomUUID()}`;
      set({
        todos: snapshot.map((t) =>
          t.id === todoId
            ? {
                ...t,
                subtasks: [
                  ...t.subtasks,
                  {
                    id: tempId,
                    title: title.trim(),
                    completed: false,
                    order: t.subtasks.length,
                    todoId,
                  },
                ],
              }
            : t,
        ),
      });

      await commit(
        snapshot,
        () => todosApi.addSubtask(todoId, title),
        "Couldn't add that subtask.",
        (created) => {
          set((state) => ({
            todos: state.todos.map((t) =>
              t.id === todoId
                ? {
                    ...t,
                    subtasks: t.subtasks.map((s) =>
                      s.id === tempId ? created : s,
                    ),
                  }
                : t,
            ),
          }));
        },
      );
    },

    toggleSubtask: async (todoId, subtaskId) => {
      const snapshot = get().todos;
      const todo = snapshot.find((t) => t.id === todoId);
      const subtask = todo?.subtasks.find((s) => s.id === subtaskId);
      if (!subtask) return;
      if (isTempId(subtaskId)) {
        toast.info("Still saving that subtask, try again in a moment.");
        return;
      }
      const nextCompleted = !subtask.completed;

      set({
        todos: snapshot.map((t) =>
          t.id === todoId
            ? {
                ...t,
                subtasks: t.subtasks.map((s) =>
                  s.id === subtaskId ? { ...s, completed: nextCompleted } : s,
                ),
              }
            : t,
        ),
      });

      await commit(
        snapshot,
        () =>
          todosApi.updateSubtask(todoId, subtaskId, {
            completed: nextCompleted,
          }),
        "Couldn't update that subtask.",
      );
    },

    deleteSubtask: async (todoId, subtaskId) => {
      const snapshot = get().todos;
      set({
        todos: snapshot.map((t) =>
          t.id === todoId
            ? { ...t, subtasks: t.subtasks.filter((s) => s.id !== subtaskId) }
            : t,
        ),
      });

      if (isTempId(subtaskId)) return;
      await commit(
        snapshot,
        () => todosApi.removeSubtask(todoId, subtaskId),
        "Couldn't delete that subtask.",
      );
    },

    setFilter: (filter) => set({ filter }),
    setTagFilter: (tagId) => set({ tagFilter: tagId }),
  };
});

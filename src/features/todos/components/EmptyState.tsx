import { ListTodo } from "lucide-react";
import type { TodoFilter } from "@/features/todos/store/useTodoStore";

const COPY: Record<TodoFilter, { title: string; desc: string }> = {
  all: {
    title: "No todos yet",
    desc: "Add your first task above to get started.",
  },
  today: {
    title: "Nothing due today",
    desc: "Enjoy the clear schedule.",
  },
  upcoming: {
    title: "Nothing on the horizon",
    desc: "Add a task with a due date to see it here.",
  },
  completed: {
    title: "Nothing completed yet",
    desc: "Finished tasks will show up here.",
  },
};

export function EmptyState({ filter }: { filter: TodoFilter }) {
  const copy = COPY[filter];

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <ListTodo className="w-10 h-10 mb-4 text-sub-text/45" />
      <h3 className="text-foreground font-bold mb-1">{copy.title}</h3>
      <p className="text-sub-text text-sm">{copy.desc}</p>
    </div>
  );
}

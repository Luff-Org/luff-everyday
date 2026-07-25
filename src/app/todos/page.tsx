"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ListTodo } from "lucide-react";
import { useHasMounted } from "@/shared/lib/useHasMounted";
import { useTodoStore } from "@/features/todos/store/useTodoStore";
import { QuickAddBar } from "@/features/todos/components/QuickAddBar";
import { FilterTabs } from "@/features/todos/components/FilterTabs";
import { TagFilterChips } from "@/features/todos/components/TagFilterChips";
import { TodoList } from "@/features/todos/components/TodoList";
import TodosLoading from "./loading";

export default function TodosPage() {
  const mounted = useHasMounted();
  const { status } = useSession();
  const router = useRouter();
  const fetchTodos = useTodoStore((s) => s.fetchTodos);
  const fetchTags = useTodoStore((s) => s.fetchTags);

  useEffect(() => {
    if (status === "authenticated") {
      fetchTodos();
      fetchTags();
    } else if (status === "unauthenticated") {
      router.replace("/login?callbackUrl=/todos");
    }
  }, [status, fetchTodos, fetchTags, router]);

  if (!mounted || status !== "authenticated") {
    return <TodosLoading />;
  }

  return (
    <div className="w-full flex flex-col items-center pb-20">
      <div className="w-full max-w-2xl mt-8">
        <div className="flex items-center gap-2 mb-8">
          <ListTodo className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            Smart Todos
          </h1>
        </div>

        <div className="flex flex-col gap-4 mb-6">
          <QuickAddBar />
          <div className="flex flex-col gap-3">
            <FilterTabs />
            <TagFilterChips />
          </div>
        </div>

        <TodoList />
      </div>
    </div>
  );
}

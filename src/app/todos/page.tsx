"use client";

import { useEffect } from "react";
import { ListTodo } from "lucide-react";
import { useTodoStore } from "@/features/todos/store/useTodoStore";
import { QuickAddBar } from "@/features/todos/components/QuickAddBar";
import { FilterTabs } from "@/features/todos/components/FilterTabs";
import { TagFilterChips } from "@/features/todos/components/TagFilterChips";
import { TodoList } from "@/features/todos/components/TodoList";

export default function TodosPage() {
  const loadInitialData = useTodoStore((s) => s.loadInitialData);

  // Fires on mount without waiting for `useSession()`: `src/proxy.ts` already
  // guarantees a signed-in user here, and gating on the client session put a
  // full round trip in front of every data fetch. A dropped session surfaces as
  // a 401, which the store turns into a redirect to /login.
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  return (
    <div className="w-full flex flex-col items-center pb-20">
      <div className="w-full max-w-2xl mt-8">
        <div className="flex items-center gap-2 mb-8">
          <ListTodo className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            Smart Todos
          </h1>
        </div>

        {/* Chrome is data-independent, so it renders instantly and stays put —
            only the list swaps a skeleton for real rows. */}
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

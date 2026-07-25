import { route, requireUser } from "@/shared/lib/http";
import { todoService } from "@/features/todos/server/todo.service";
import { testService } from "@/features/typing/server/test.service";
import { profileService } from "@/features/profile/server/profile.service";
import type { ProfileStats, ProfileUser } from "@/features/profile/types";

export const GET = route(async (): Promise<ProfileStats> => {
  const userId = await requireUser();
  const [todos, typing] = await Promise.all([
    todoService.stats(userId),
    testService.stats(userId),
  ]);
  return { todos, typing };
});

export const PATCH = route(async (req): Promise<ProfileUser> => {
  const userId = await requireUser();
  return profileService.update(userId, await req.json());
});

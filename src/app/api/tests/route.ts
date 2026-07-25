import { route, requireUser } from "@/shared/lib/http";
import { testService } from "@/features/typing/server/test.service";

export const POST = route(async (req) => {
  const userId = await requireUser();
  return testService.createResult(userId, await req.json());
});

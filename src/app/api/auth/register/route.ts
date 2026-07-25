import { route } from "@/shared/lib/http";
import { registerUser } from "@/features/auth/register.service";

export const POST = route(async (req) => registerUser(await req.json()));

import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/features/auth";

/** Error carrying an HTTP status; thrown from services/handlers and mapped by `route`. */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

/** Returns the authenticated user id, or throws `HttpError(401)`. */
export async function requireUser(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new HttpError(401, "Unauthorized");
  return session.user.id;
}

type RouteHandler<Ctx> = (req: Request, ctx: Ctx) => Promise<unknown>;

/**
 * Wraps an API route handler: JSON-encodes the returned value and centralizes
 * error handling — `HttpError` → its status, `ZodError` → 400, anything else → 500.
 * Handlers return plain data (or nothing) instead of building responses.
 */
export function route<Ctx = unknown>(handler: RouteHandler<Ctx>) {
  return async (req: Request, ctx: Ctx): Promise<NextResponse> => {
    try {
      const result = await handler(req, ctx);
      return NextResponse.json(result ?? { success: true });
    } catch (err) {
      if (err instanceof HttpError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      if (err instanceof ZodError) {
        return NextResponse.json(
          { error: "Invalid request", issues: err.flatten() },
          { status: 400 },
        );
      }
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        (err as { code: string }).code === "P2003"
      ) {
        return NextResponse.json(
          { error: "User account no longer exists. Please log in again." },
          { status: 401 },
        );
      }
      console.error("Unhandled route error", err);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  };
}

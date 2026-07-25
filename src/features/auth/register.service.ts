import bcrypt from "bcryptjs";
import { prisma } from "@/shared/lib/prisma";
import { HttpError } from "@/shared/lib/http";
import { registerSchema } from "./validation";

/** Validates registration input and creates a credentials user. */
export async function registerUser(body: unknown) {
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    throw new HttpError(400, parsed.error.issues[0]?.message ?? "Invalid input.");
  }
  const { username, email, password } = parsed.data;

  const existingByEmail = await prisma.user.findUnique({ where: { email } });
  if (existingByEmail) {
    throw new HttpError(
      409,
      existingByEmail.password
        ? "An account with this email already exists."
        : "This email is already registered via Google. Sign in with Google instead.",
    );
  }

  const existingByUsername = await prisma.user.findUnique({ where: { username } });
  if (existingByUsername) {
    throw new HttpError(409, "That username is taken.");
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: { username, email, password: hashedPassword },
  });

  return { success: true };
}

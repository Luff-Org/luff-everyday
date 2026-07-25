import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/features/auth/config";

const { auth } = NextAuth(authConfig);

const PROTECTED_PREFIXES = ["/todos"];

export default auth((req) => {
  const { nextUrl } = req;
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    nextUrl.pathname.startsWith(prefix),
  );

  if (isProtected && !req.auth) {
    const loginUrl = new URL("/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/todos/:path*"],
};

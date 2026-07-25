import type { NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

/**
 * Edge-safe auth config (no Prisma adapter — Prisma Client can't run on the
 * Edge runtime). Used by middleware.ts. src/lib/auth.ts extends this with the
 * adapter for use in route handlers / server components.
 */
export const authConfig: NextAuthConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
};

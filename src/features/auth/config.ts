import type { NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

/**
 * Edge-safe auth config (no Prisma adapter — Prisma Client can't run on the
 * Edge runtime). Used by middleware.ts. src/lib/auth.ts extends this with the
 * adapter for use in route handlers / server components.
 */
export const authConfig: NextAuthConfig = {
  trustHost: true,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user?.id) {
        token.sub = user.id;
      }
      // Client called useSession().update(...) after a profile edit — merge the
      // new values in immediately instead of waiting for the next sign-in.
      if (trigger === "update" && session) {
        if (typeof session.name === "string") token.name = session.name;
        if ("image" in session) token.picture = session.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
};

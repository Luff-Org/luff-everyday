"use client";

import { SessionProvider } from "next-auth/react";

/**
 * Session context only — deliberately does NOT gate rendering on auth.
 *
 * Every route either renders fine while `useSession()` is still resolving (the
 * header swaps in a placeholder for the account slot) or is already guarded by
 * `src/proxy.ts`, so blocking the whole tree on the session fetch only ever
 * cost time.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchOnWindowFocus={false}>{children}</SessionProvider>
  );
}

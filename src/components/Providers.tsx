"use client";

import { useState, useEffect } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

function AuthLoadingGuard({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    // Force a minimum loading time to ensure smooth hydration of all items
    const timer = setTimeout(() => {
      if (status !== "loading") {
        setHasInitialized(true);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [status]);

  if (status === "loading" || !hasInitialized) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthLoadingGuard>{children}</AuthLoadingGuard>
    </SessionProvider>
  );
}

"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="w-full flex flex-col items-center justify-center py-32 text-center">
      <div className="w-16 h-16 rounded-2xl bg-error/10 flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8 text-error" />
      </div>
      <h1 className="text-2xl font-black text-foreground mb-2">
        Something went wrong
      </h1>
      <p className="text-sub-text max-w-sm mb-8">
        An unexpected error occurred. Try again, or head back home if it keeps
        happening.
      </p>
      <button
        onClick={() => reset()}
        className="px-8 py-3.5 bg-primary text-background font-black rounded-2xl hover:scale-105 transition-transform"
      >
        Try again
      </button>
    </div>
  );
}

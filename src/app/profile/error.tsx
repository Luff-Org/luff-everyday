"use client";

import { useEffect } from "react";

export default function ProfileError({
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
    <div className="w-full flex flex-col items-center pb-20">
      <div className="w-full max-w-3xl mt-8 rounded-2xl border border-dashed border-sub-text/20 p-8 text-center">
        <p className="text-foreground font-bold">Couldn&apos;t load your stats.</p>
        <p className="mt-1 text-sm text-sub-text">
          Something went wrong while fetching your dashboard.
        </p>
        <button
          onClick={reset}
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-background hover:opacity-90"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

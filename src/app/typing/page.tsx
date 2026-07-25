"use client";

import { useTypingStore } from "@/features/typing/store/useTypingStore";
import TypingArea from "@/features/typing/components/TypingArea";
import ResultScreen from "@/features/typing/components/ResultScreen";
import { useHasMounted } from "@/shared/lib/useHasMounted";
import { TypingSkeleton } from "./loading";

export default function Home() {
  const status = useTypingStore((state) => state.status);
  // The word list is generated randomly at store init, so server and client
  // markup can't match — the test itself only renders once hydrated.
  const mounted = useHasMounted();

  return (
    <div className="flex-1 flex flex-col justify-center w-full pt-16">
      {!mounted ? (
        <TypingSkeleton />
      ) : status === "finished" ? (
        <ResultScreen />
      ) : (
        <TypingArea />
      )}
    </div>
  );
}

"use client";

import { useTypingStore } from "@/features/typing/store/useTypingStore";
import TypingArea from "@/features/typing/components/TypingArea";
import ResultScreen from "@/features/typing/components/ResultScreen";
import { useHasMounted } from "@/shared/lib/useHasMounted";

export default function Home() {
  const status = useTypingStore((state) => state.status);
  const mounted = useHasMounted();

  if (!mounted) {
    return (
      <div className="flex-1 flex flex-col justify-center w-full pt-16">
        <div className="animate-pulse flex gap-2 flex-wrap text-sub-text/40 text-2xl h-40">
          Loading workspace...
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-center w-full pt-16">
      {status === "finished" ? <ResultScreen /> : <TypingArea />}
    </div>
  );
}

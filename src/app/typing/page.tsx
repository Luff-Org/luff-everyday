"use client";

import { useTypingStore } from "@/features/typing/store/useTypingStore";
import TypingArea from "@/features/typing/components/TypingArea";
import ResultScreen from "@/features/typing/components/ResultScreen";
import { useHasMounted } from "@/shared/lib/useHasMounted";
import TypingLoading from "./loading";

export default function Home() {
  const status = useTypingStore((state) => state.status);
  const mounted = useHasMounted();

  if (!mounted) {
    return <TypingLoading />;
  }

  return (
    <div className="flex-1 flex flex-col justify-center w-full pt-16">
      {status === "finished" ? <ResultScreen /> : <TypingArea />}
    </div>
  );
}

"use client";

import { useTypingStore } from "@/store/useTypingStore";
import TypingArea from "@/components/TypingArea";
import ResultScreen from "@/components/ResultScreen";
import { useState, useEffect } from "react";

export default function Home() {
  const status = useTypingStore((state) => state.status);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

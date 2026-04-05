"use client";

import { useTypingStore } from "@/store/useTypingStore";
import TypingArea from "@/components/TypingArea";
import ResultScreen from "@/components/ResultScreen";
import Header from "@/components/Header";

import { useState, useEffect } from "react";

export default function Home() {
  const status = useTypingStore((state) => state.status);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <main className="flex w-full flex-col items-center flex-1 py-8 h-full">
        <Header />
        <div className="flex-1 flex flex-col justify-center w-full max-w-4xl pt-16">
           <div className="animate-pulse flex gap-2 flex-wrap text-sub-text/40 text-2xl h-40">Loading workspace...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex w-full flex-col items-center flex-1 py-8 h-full">
      <Header />
      <div className="flex-1 flex flex-col justify-center w-full max-w-4xl pt-16">
        {status === "finished" ? <ResultScreen /> : <TypingArea />}
      </div>
    </main>
  );
}

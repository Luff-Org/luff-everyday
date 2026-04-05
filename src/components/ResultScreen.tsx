"use client";

import { useEffect, useState } from "react";
import { useTypingStore } from "@/store/useTypingStore";
import { RotateCcw, ChevronRight } from "lucide-react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
);

import { useSession } from "next-auth/react";
import { useThemeStore } from "@/store/useThemeStore";

export default function ResultScreen() {
  const { correctChars, incorrectChars, wpmHistory, reset, duration, status } =
    useTypingStore();
  const { data: session } = useSession();
  const currentThemeId = useThemeStore((s) => s.theme);

  const [colors, setColors] = useState({
    primary: "#646669",
    sub: "#646669",
    error: "#ca4754",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const style = getComputedStyle(document.body);
      setColors({
        primary: style.getPropertyValue("--primary").trim() || "#e2b714",
        sub: style.getPropertyValue("--sub-text").trim() || "#646669",
        error: style.getPropertyValue("--error").trim() || "#ca4754",
      });
    }
  }, [currentThemeId]);

  const finalWpm =
    wpmHistory.length > 0 ? wpmHistory[wpmHistory.length - 1].wpm : 0;
  const rawWpm =
    wpmHistory.length > 0 ? wpmHistory[wpmHistory.length - 1].rawWpm : 0;
  const totalChars = correctChars + incorrectChars;
  const accuracy =
    totalChars > 0 ? Number(((correctChars / totalChars) * 100).toFixed(2)) : 0;

  useEffect(() => {
    if (status === "finished" && session?.user && finalWpm > 0) {
      // Save result to db
      fetch("/api/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wpm: finalWpm, rawWpm, accuracy, duration }),
      }).catch(console.error);
    }
  }, [status, session, finalWpm, rawWpm, accuracy, duration]);

  // Keyboard Event Listener for Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "Enter" && e.shiftKey) || e.key === "Escape") {
        e.preventDefault();
        reset();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [reset]);

  if (status !== "finished") return null;

  const chartData = {
    labels: wpmHistory.map((point) => point.time),
    datasets: [
      {
        label: "WPM",
        data: wpmHistory.map((point) => point.wpm),
        borderColor: colors.primary,
        backgroundColor: colors.primary,
        tension: 0.4,
        pointStyle: wpmHistory.map((point) =>
          point.err > 0 ? "crossRot" : "circle",
        ),
        pointBackgroundColor: wpmHistory.map((point) =>
          point.err > 0 ? colors.error : colors.primary,
        ),
        pointBorderColor: wpmHistory.map((point) =>
          point.err > 0 ? (colors.error || "#ff0000") : "transparent",
        ),
        pointBorderWidth: wpmHistory.map((point) => (point.err > 0 ? 4 : 0)),
        pointRadius: wpmHistory.map((point) => (point.err > 0 ? 6 : 3)),
        pointHoverRadius: 10,
      },
      {
        label: "Raw WPM",
        data: wpmHistory.map((point) => point.rawWpm),
        borderColor: colors.sub,
        backgroundColor: "transparent",
        borderDash: [5, 5],
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    color: colors.sub,
    plugins: {
      tooltip: {
        titleFont: { family: "monospace" },
        bodyFont: { family: "monospace" },
        callbacks: {
          label: function (context: any) {
            return ` ${context.dataset.label}: ${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Words Per Minute",
          color: colors.sub,
        },
        grid: { color: "rgba(128, 128, 128, 0.1)" },
        ticks: { color: colors.sub, font: { family: "monospace" } },
      },
      x: {
        grid: { display: false },
        ticks: { color: colors.sub, font: { family: "monospace" } },
      },
    },
  };

  return (
    <div className="w-full flex flex-col items-center animate-in fade-in duration-500 pb-12">
      {/* Back Button to Test */}
      <div className="w-full mb-8 flex justify-start">
        <button
          onClick={reset}
          className="flex items-center gap-2 text-sub-text hover:text-primary transition-colors text-sm font-medium outline-none"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          back to test
        </button>
      </div>

      <div className="flex flex-col md:flex-row w-full gap-8 mt-4 items-stretch">
        {/* Left Side Main Stats */}
        <div className="flex flex-col justify-start gap-8 min-w-[180px]">
          <div className="flex flex-col">
            <span className="text-primary text-4xl font-medium tracking-wide">
              wpm
            </span>
            <span className="text-foreground font-bold text-7xl leading-none font-mono">
              {finalWpm}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-primary text-4xl font-medium tracking-wide">
              acc
            </span>
            <span className="text-foreground font-bold text-7xl leading-none font-mono">
              {accuracy}%
            </span>
          </div>
        </div>

        {/* Chart Window */}
        <div className="flex-1 w-full h-[250px] md:h-auto min-h-[300px]">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Bottom Sub-Stats Row */}
      <div className="flex flex-wrap gap-x-16 gap-y-6 mt-12 justify-start w-full">
        <div className="flex flex-col">
          <span className="text-lg text-primary tracking-wide">test type</span>
          <span className="text-2xl font-bold font-mono text-foreground opacity-90">
            time {duration}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-lg text-primary tracking-wide">raw</span>
          <span className="text-2xl font-bold font-mono text-foreground opacity-90">
            {rawWpm}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-lg text-primary tracking-wide">characters</span>
          <span className="text-2xl font-bold font-mono text-foreground opacity-90">
            {correctChars}/{incorrectChars}/0/0
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-lg text-primary tracking-wide">time</span>
          <span className="text-2xl font-bold font-mono text-foreground opacity-90">
            {duration}s
          </span>
        </div>
      </div>

      {/* Restart Controls & Hints */}
      <div className="w-full flex flex-col items-center mt-12 gap-4 text-sm text-sub-text font-mono opacity-80 select-none">
        <button
          onClick={reset}
          className="hover:text-foreground transition p-4 rounded-full hover:bg-background/50 outline-none focus:bg-background/80 focus:text-foreground"
          title="Restart Test"
          tabIndex={1}
        >
          <RotateCcw className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center gap-2 mt-2 opacity-70">
          <div className="flex items-center gap-2">
            <kbd className="bg-card-bg px-2 py-0.5 rounded text-xs">shift</kbd>
            <span>+</span>
            <kbd className="bg-card-bg px-2 py-0.5 rounded text-xs">enter</kbd>
            <span className="ml-2">- restart test</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="bg-card-bg px-2 py-0.5 rounded text-xs">esc</kbd>
            <span className="ml-[10px]">- stop / reset</span>
          </div>
        </div>
      </div>
    </div>
  );
}

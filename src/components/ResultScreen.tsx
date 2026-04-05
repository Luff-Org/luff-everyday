"use client";

import { useEffect } from "react";
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
  Tooltip
);

import { useSession } from "next-auth/react";

export default function ResultScreen() {
  const { correctChars, incorrectChars, wpmHistory, reset, duration, status } = useTypingStore();
  const { data: session } = useSession();

  const finalWpm = wpmHistory.length > 0 ? wpmHistory[wpmHistory.length - 1].wpm : 0;
  const rawWpm = wpmHistory.length > 0 ? wpmHistory[wpmHistory.length - 1].rawWpm : 0;
  const totalChars = correctChars + incorrectChars;
  const accuracy = totalChars > 0 ? Number(((correctChars / totalChars) * 100).toFixed(2)) : 0;

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

  if (status !== "finished") return null;
  
  const chartData = {
    labels: wpmHistory.map((point) => point.time),
    datasets: [
      {
        label: "WPM",
        data: wpmHistory.map((point) => point.wpm),
        borderColor: "var(--primary)",
        backgroundColor: "var(--primary)",
        tension: 0.4,
        pointStyle: wpmHistory.map((point) => point.err > 0 ? "crossRot" : "circle"),
        pointBackgroundColor: wpmHistory.map((point) => point.err > 0 ? "var(--error)" : "var(--primary)"),
        pointBorderColor: wpmHistory.map((point) => point.err > 0 ? "var(--error)" : "transparent"),
        pointBorderWidth: wpmHistory.map((point) => point.err > 0 ? 2 : 0),
        pointRadius: wpmHistory.map((point) => point.err > 0 ? 6 : 3),
        pointHoverRadius: 8,
      },
      {
        label: "Raw WPM",
        data: wpmHistory.map((point) => point.rawWpm),
        borderColor: "var(--sub-text)",
        backgroundColor: "transparent",
        borderDash: [5, 5],
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 0,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    color: "var(--sub-text)",
    plugins: {
      tooltip: {
        titleFont: { family: "monospace" },
        bodyFont: { family: "monospace" },
        callbacks: {
          label: function(context: any) {
            return ` ${context.dataset.label}: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Words Per Minute", color: "var(--sub-text)" },
        grid: { color: "rgba(128, 128, 128, 0.1)" },
        ticks: { color: "var(--sub-text)", font: { family: "monospace" } }
      },
      x: {
        grid: { display: false },
        ticks: { color: "var(--sub-text)", font: { family: "monospace" } }
      }
    }
  };

  return (
    <div className="w-full flex flex-col items-center animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row w-full gap-8 mt-4 items-stretch">
        
        {/* Left Side Main Stats */}
        <div className="flex flex-col justify-start gap-8 min-w-[180px]">
          <div className="flex flex-col">
            <span className="text-primary text-4xl font-medium tracking-wide">wpm</span>
            <span className="text-foreground font-bold text-7xl leading-none font-mono">{finalWpm}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-primary text-4xl font-medium tracking-wide">acc</span>
            <span className="text-foreground font-bold text-7xl leading-none font-mono">{accuracy}%</span>
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
            <span className="text-2xl font-bold font-mono text-foreground opacity-90">time {duration}</span>
         </div>
         <div className="flex flex-col">
            <span className="text-lg text-primary tracking-wide">raw</span>
            <span className="text-2xl font-bold font-mono text-foreground opacity-90">{rawWpm}</span>
         </div>
         <div className="flex flex-col">
            <span className="text-lg text-primary tracking-wide">characters</span>
            <span className="text-2xl font-bold font-mono text-foreground opacity-90">{correctChars}/{incorrectChars}/0/0</span>
         </div>
         <div className="flex flex-col">
            <span className="text-lg text-primary tracking-wide">time</span>
            <span className="text-2xl font-bold font-mono text-foreground opacity-90">{duration}s</span>
         </div>
      </div>

      <button
        onClick={reset}
        className="flex items-center justify-center p-4 mt-16 rounded-lg text-sub-text hover:text-foreground hover:bg-background/80 transition group focus:outline-none"
        title="Next Test"
      >
        <RotateCcw className="w-8 h-8 group-hover:-rotate-90 transition-transform duration-300" />
      </button>
    </div>
  );
}

"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
} from "chart.js";
import { useChartColors } from "@/shared/lib/useChartColors";
import type { TypingHistoryPoint } from "@/features/typing/types";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

export function TypingTrendChart({ history }: { history: TypingHistoryPoint[] }) {
  const colors = useChartColors();

  const labels = history.map((p) =>
    new Date(p.createdAt).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
  );

  const data = {
    labels,
    datasets: [
      {
        label: "WPM",
        data: history.map((p) => p.wpm),
        borderColor: colors.primary,
        backgroundColor: colors.primary,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 8,
      },
      {
        label: "Raw",
        data: history.map((p) => p.rawWpm),
        borderColor: colors.sub,
        backgroundColor: "transparent",
        borderDash: [5, 5],
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: colors.sub, maxTicksLimit: 8 },
      },
      y: {
        grid: { color: `${colors.sub}22` },
        ticks: { color: colors.sub },
        beginAtZero: true,
      },
    },
  } as const;

  return (
    <div className="h-64 w-full">
      <Line data={data} options={options} />
    </div>
  );
}

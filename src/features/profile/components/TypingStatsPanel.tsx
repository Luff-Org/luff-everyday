"use client";

import { Gauge, Zap, Target, Hash, Keyboard } from "lucide-react";
import type { TypingStats } from "@/features/typing/types";
import { StatTile } from "./StatTile";
import { TypingTrendChart } from "./TypingTrendChart";

export function TypingStatsPanel({ stats }: { stats: TypingStats }) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Keyboard className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-black tracking-tight text-foreground">
          Typing
        </h2>
      </div>

      {stats.totalTests === 0 ? (
        <div className="rounded-xl border border-dashed border-sub-text/20 p-8 text-center text-sub-text">
          No tests yet — take a typing test to start tracking your speed.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile icon={Zap} label="Best WPM" value={stats.bestWpm} accent />
            <StatTile icon={Gauge} label="Avg WPM" value={stats.avgWpm} />
            <StatTile
              icon={Target}
              label="Avg Accuracy"
              value={stats.avgAccuracy}
              suffix="%"
            />
            <StatTile icon={Hash} label="Tests" value={stats.totalTests} />
          </div>

          {stats.bestByDuration.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {stats.bestByDuration.map((b) => (
                <div
                  key={b.duration}
                  className="flex items-baseline gap-1.5 rounded-lg border border-sub-text/10 bg-background/40 px-3 py-1.5"
                >
                  <span className="text-xs font-bold text-sub-text">
                    {b.duration}s
                  </span>
                  <span className="text-sm font-black text-foreground">
                    {b.bestWpm}
                  </span>
                  <span className="text-xs text-sub-text">wpm</span>
                </div>
              ))}
            </div>
          )}

          {stats.history.length > 1 && (
            <div className="rounded-xl border border-sub-text/10 bg-background/40 p-4">
              <TypingTrendChart history={stats.history} />
            </div>
          )}
        </>
      )}
    </section>
  );
}

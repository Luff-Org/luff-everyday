"use client";

import Header from "@/components/Header";
import { useThemeStore } from "@/store/useThemeStore";
import { clsx } from "clsx";
import { Paintbrush, Check } from "lucide-react";
import { useState } from "react";
import { themes } from "@/lib/themes";

export default function SettingsPage() {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="w-full flex flex-col items-center flex-1 pb-16">
      <div className="max-w-5xl w-full px-8 pb-10">
        <Header />

        <div className="mt-16 w-full animate-in fade-in duration-500">
          <div className="flex flex-col mb-10 w-full items-center">
            <h1 className="text-3xl font-bold text-sub-text flex items-center justify-center gap-2 mb-2">
              <Paintbrush className="w-6 h-6" /> theme
            </h1>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 w-full">
            {themes.map((t) => (
              <ThemeChip key={t.id} t={t} selected={theme === t.id} onSelect={() => setTheme(t.id)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ThemeChip({ t, selected, onSelect }: { t: any, selected: boolean, onSelect: () => void }) {
  const [hovered, setHovered] = useState(false);
  const active = selected || hovered;

  return (
    <button
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ 
        backgroundColor: t.bg,
        borderColor: selected ? t.primary : 'transparent',
        color: t.primary
      }}
      className={clsx(
        "relative flex items-center px-4 py-2.5 rounded-lg border-2 transition-all duration-200 w-full overflow-hidden outline-none cursor-pointer",
        active ? "scale-[1.03] shadow-xl z-10" : "scale-100 z-0 shadow-sm opacity-90"
      )}
    >
      <div 
        className={clsx(
          "flex-1 flex justify-center transition-transform duration-300 ease-out font-mono font-bold text-sm tracking-wide",
          active ? "-translate-x-4" : "translate-x-0"
        )}
      >
        {t.name}
      </div>

      <div 
        className={clsx(
          "flex gap-1.5 z-10 items-center transition-all duration-300 ease-out absolute right-3",
          active ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none"
        )}
      >
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.bg, border: `1px solid ${t.sub}` }} />
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.primary }} />
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.sub }} />
      </div>
    </button>
  );
}

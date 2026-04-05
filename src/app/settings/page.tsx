"use client";

import { useThemeStore } from "@/store/useThemeStore";
import { useAppFontStore } from "@/store/useAppFontStore";
import { clsx } from "clsx";
import { Paintbrush, Monitor, ArrowLeft } from "lucide-react";
import { useState } from "react";
import {
  THEMES,
  APP_FONTS,
  type ThemeDef,
  type FontDef,
} from "@/lib/constants";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { theme, setTheme } = useThemeStore();
  const { appFontId, setAppFontId } = useAppFontStore();
  const router = useRouter();

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full pb-10">
        <div className="mt-8 mb-8 w-full">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sub-text hover:text-primary transition-colors text-sm font-medium w-fit outline-none"
          >
            <ArrowLeft className="w-4 h-4" />
            back
          </button>
        </div>

        <div className="mt-8 w-full animate-in fade-in duration-500">
          <div className="flex flex-col mb-4 w-full items-start">
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2 mb-1">
              <Monitor className="w-5 h-5 text-primary" /> font family
            </h1>
            <p className="text-sm text-sub-text opacity-70 max-w-2xl">
              Change the font family used throughout the entire website. Choose
              from modern sans-serifs, classic serifs, or playful display fonts.
            </p>
          </div>

          <div className="bg-foreground/[0.01] p-6 rounded-xl mb-16 shadow-none">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 w-full">
              {APP_FONTS.map((font) => (
                <FontChip
                  key={font.id}
                  font={font}
                  selected={appFontId === font.id}
                  onSelect={() => setAppFontId(font.id, font.fontString)}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col mb-4 w-full items-start">
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2 mb-1">
              <Paintbrush className="w-5 h-5 text-primary" /> themes
            </h1>
            <p className="text-sm text-sub-text opacity-70 max-w-2xl">
              Select a color palette that matches your vibe. We offer a wide
              range of minimalist and vibrant themes.
            </p>
          </div>

          <div className="bg-foreground/[0.01] p-6 rounded-xl shadow-none">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 w-full">
              {THEMES.map((t) => (
                <ThemeChip
                  key={t.id}
                  t={t}
                  selected={theme === t.id}
                  onSelect={() => setTheme(t.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ThemeChip({
  t,
  selected,
  onSelect,
}: {
  t: ThemeDef;
  selected: boolean;
  onSelect: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const active = selected || hovered;

  return (
    <button
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: t.bg,
        borderColor: selected ? t.primary : "transparent",
        color: t.primary,
      }}
      className={clsx(
        "relative flex items-center px-4 py-3 rounded-lg border transition-all duration-300 w-full overflow-hidden outline-none cursor-pointer",
        selected
          ? "border-primary shadow-md z-10"
          : "border-foreground/[0.05] bg-foreground/[0.03] hover:border-foreground/[0.1] hover:bg-foreground/[0.06]",
        active ? "scale-[1.03]" : "scale-100",
      )}
    >
      <div
        className={clsx(
          "flex-1 flex justify-center transition-transform duration-300 ease-out font-bold text-sm tracking-wide",
          active ? "-translate-x-4" : "translate-x-0",
        )}
      >
        {t.name}
      </div>

      <div
        className={clsx(
          "flex gap-1.5 z-10 items-center transition-all duration-300 ease-out absolute right-3",
          active
            ? "opacity-100 translate-x-0"
            : "opacity-0 translate-x-4 pointer-events-none",
        )}
      >
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: t.bg, border: `1px solid ${t.sub}` }}
        />
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: t.primary }}
        />
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: t.sub }}
        />
      </div>
    </button>
  );
}

function FontChip({
  font,
  selected,
  onSelect,
}: {
  font: FontDef;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      style={{ fontFamily: font.fontString }}
      className={clsx(
        "relative flex items-center justify-center px-4 py-3.5 rounded-lg border transition-all duration-300 w-full min-h-[52px] overflow-hidden outline-none cursor-pointer",
        selected
          ? "border-primary text-background bg-primary shadow-md scale-[1.03] z-10 font-bold"
          : "border-foreground/[0.08] text-sub-text bg-foreground/[0.04] hover:bg-foreground/[0.07] hover:border-foreground/[0.15] hover:text-foreground",
      )}
    >
      <span className="text-center font-medium text-sm tracking-wide">
        {font.name}
      </span>
    </button>
  );
}

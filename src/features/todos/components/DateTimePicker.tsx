"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { Calendar as CalendarIcon, X, ChevronLeft, ChevronRight } from "lucide-react";

interface DateTimePickerProps {
  value: Date | null;
  onChange: (value: Date | null) => void;
  placeholder?: string;
}

const POPOVER_WIDTH_ESTIMATE = 320;
const POPOVER_HEIGHT_ESTIMATE = 400;

function combine(date: Date, time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);
  const next = new Date(date);
  next.setHours(hours, minutes, 0, 0);
  return next;
}

function toTimeString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Set due date",
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const openPicker = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;

    let left = rect.left;
    let top = rect.bottom + 8;

    if (left + POPOVER_WIDTH_ESTIMATE > window.innerWidth - 8) {
      left = window.innerWidth - POPOVER_WIDTH_ESTIMATE - 8;
    }
    if (top + POPOVER_HEIGHT_ESTIMATE > window.innerHeight - 8) {
      top = rect.top - POPOVER_HEIGHT_ESTIMATE - 8;
    }

    setCoords({ top: Math.max(8, top), left: Math.max(8, left) });
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || popoverRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };
    const close = () => setOpen(false);

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  const handleSelectDate = (date: Date | undefined) => {
    if (!date) return;
    const time = value ? toTimeString(value) : "09:00";
    onChange(combine(date, time));
  };

  const handleTimeChange = (time: string) => {
    const base = value ?? new Date();
    onChange(combine(base, time));
  };

  return (
    <div className="relative inline-block">
      <button
        ref={triggerRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          open ? setOpen(false) : openPicker();
        }}
        className={`flex items-center gap-1.5 bg-background/40 border border-sub-text/20 rounded-lg px-2.5 py-1.5 text-xs font-bold outline-none focus:border-primary/50 transition-colors ${
          value ? "text-foreground" : "text-sub-text/60"
        }`}
      >
        <CalendarIcon className="w-3.5 h-3.5" />
        {value
          ? value.toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })
          : placeholder}
      </button>
      {value && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onChange(null);
          }}
          className="absolute -right-1.5 -top-1.5 w-4 h-4 rounded-full bg-sub-text/20 text-sub-text hover:bg-error hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-2.5 h-2.5" />
        </button>
      )}

      {open &&
        coords &&
        createPortal(
          <div
            ref={popoverRef}
            onClick={(e) => e.stopPropagation()}
            style={{ position: "fixed", top: coords.top, left: coords.left, zIndex: 9999 }}
            className="bg-background border border-sub-text/20 rounded-2xl shadow-2xl p-3 w-fit"
          >
            <DayPicker
              mode="single"
              selected={value ?? undefined}
              onSelect={handleSelectDate}
              showOutsideDays
              components={{
                Chevron: ({ orientation }) =>
                  orientation === "left" ? (
                    <ChevronLeft className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  ),
              }}
            />
            <div className="flex items-center gap-2 mt-2 pt-3 border-t border-sub-text/10">
              <span className="text-[10px] font-black uppercase tracking-widest text-sub-text/50 shrink-0">
                Time
              </span>
              <input
                type="time"
                value={value ? toTimeString(value) : "09:00"}
                onChange={(e) => handleTimeChange(e.target.value)}
                style={{ colorScheme: "dark" }}
                className="flex-1 bg-background/40 border border-sub-text/20 rounded-lg px-2 py-1 text-xs font-bold text-foreground outline-none focus:border-primary/50"
              />
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-full mt-3 px-3 py-1.5 bg-primary text-background font-black text-xs rounded-lg hover:scale-[1.02] transition-transform"
            >
              Done
            </button>
          </div>,
          document.body,
        )}
    </div>
  );
}

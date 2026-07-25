import type { LucideIcon } from "lucide-react";

export function StatTile({
  icon: Icon,
  label,
  value,
  suffix,
  accent = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  suffix?: string;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-sub-text/10 bg-background/40 p-4">
      <div className="flex items-center gap-1.5 text-sub-text">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-bold uppercase tracking-wide">{label}</span>
      </div>
      <div
        className={`text-3xl font-black tracking-tight ${
          accent ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
        {suffix && (
          <span className="ml-1 text-base font-bold text-sub-text">{suffix}</span>
        )}
      </div>
    </div>
  );
}

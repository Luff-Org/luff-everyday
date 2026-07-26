interface TagChipProps {
  name: string;
  color: string;
  active?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
}

export function TagChip({ name, color, active, onClick, onRemove }: TagChipProps) {
  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${
        onClick ? "cursor-pointer" : ""
      } ${
        active
          ? "border-transparent text-background"
          : "border-sub-text/25 text-sub-text bg-background/40 hover:border-sub-text/45"
      }`}
      style={active ? { backgroundColor: color } : undefined}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
      {name}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 opacity-60 hover:opacity-100"
        >
          ×
        </button>
      )}
    </span>
  );
}

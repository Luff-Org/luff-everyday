import { Skeleton, SkeletonScreen } from "@/shared/ui/Skeleton";

/**
 * Word-bar widths in px. A fixed table rather than `Math.random()` so the
 * server and client render byte-identical markup (and so the placeholder does
 * not reshuffle on every re-render).
 */
const WORD_WIDTHS = [
  62, 44, 88, 51, 35, 73, 96, 40, 58, 67, 82, 46, 31, 77, 54, 91, 39, 64, 48,
  85, 57, 42, 70, 36, 93, 49, 61, 79, 33, 68, 52, 87, 45, 74, 38, 66, 50, 83,
  41, 72, 59, 34, 90, 47, 63, 76, 37, 55, 81, 43, 69, 32, 86, 60, 53, 78, 65,
  30, 94, 56, 71, 46, 84, 39, 62, 75, 44, 89, 51, 67, 35, 80,
];

/**
 * Mirrors TypingArea 1:1 — same 3.5rem line rows, same 14rem viewport, same
 * 40px timer spacer — so swapping in the real test causes no layout shift.
 */
export function TypingSkeleton() {
  return (
    <SkeletonScreen
      label="Preparing typing test"
      className="w-full flex flex-col items-start gap-4"
    >
      {/* Timer slot. Invisible in the real idle view too — this only holds the
          40px of vertical space so nothing jumps when the test takes over. */}
      <div className="min-h-[40px]" />

      <div
        className="relative w-full h-[14rem] overflow-hidden"
        style={{ lineHeight: "3.5rem" }}
      >
        <div className="flex flex-wrap gap-x-3">
          {WORD_WIDTHS.map((width, i) => (
            <span key={i} className="flex h-[3.5rem] items-center">
              <Skeleton
                className="h-[1.5rem] rounded-md"
                delay={i * 35}
                style={{ width }}
              />
            </span>
          ))}
        </div>
      </div>

      <div className="w-full flex flex-col items-center mt-12 gap-4">
        <div className="p-4">
          <Skeleton className="h-6 w-6 rounded-full" accent />
        </div>
        <div className="flex flex-col items-center gap-2 mt-2">
          <Skeleton className="h-4 w-56 rounded" delay={200} />
        </div>
      </div>
    </SkeletonScreen>
  );
}

export default function TypingLoading() {
  return (
    <div className="flex-1 flex flex-col justify-center w-full pt-16">
      <TypingSkeleton />
    </div>
  );
}

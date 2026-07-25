import { Skeleton, SkeletonScreen } from "@/shared/ui/Skeleton";

/** Fixed silhouettes — deliberately not random so the placeholder renders
 *  identically on the server and on the client. */
const CHART_BAR_HEIGHTS = [
  38, 52, 45, 61, 55, 70, 64, 48, 58, 72, 66, 80, 74, 62, 69, 85, 77,
];
const PRIORITY_BAR_WIDTHS = [70, 45, 30, 15];
const WEEK_BAR_HEIGHTS = [45, 70, 30, 85, 55, 40, 65];

/** Matches StatTile's box model: `rounded-xl border p-4`, icon+label row over a
 *  `text-3xl` number, so tiles don't resize when the real values land. */
function StatTileSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-sub-text/10 bg-background/40 p-4">
      <div className="flex items-center gap-1.5">
        <Skeleton className="h-4 w-4 rounded" delay={delay} />
        <Skeleton className="h-3 w-20 rounded" delay={delay + 40} />
      </div>
      <div className="flex h-9 items-center">
        <Skeleton className="h-7 w-16 rounded-lg" delay={delay + 80} />
      </div>
    </div>
  );
}

function SectionHeadingSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <Skeleton className="h-5 w-5 rounded" accent />
      <Skeleton className="h-7 w-24 rounded" delay={60} />
    </div>
  );
}

export function HeaderSkeleton() {
  return (
    <SkeletonScreen
      label="Loading profile"
      className="flex items-center gap-4 rounded-2xl border border-sub-text/10 bg-background/40 p-5"
    >
      <Skeleton className="h-16 w-16 shrink-0 rounded-full" accent />
      <div className="min-w-0 flex flex-col gap-2">
        <Skeleton className="h-7 w-48 rounded-lg" delay={80} />
        <Skeleton className="h-4 w-56 rounded" delay={140} />
      </div>
    </SkeletonScreen>
  );
}

/** Mirrors TypingStatsPanel: heading, 4 tiles, per-duration pills, trend chart. */
export function TypingStatsSkeleton() {
  return (
    <SkeletonScreen label="Loading typing stats" className="flex flex-col gap-4">
      <SectionHeadingSkeleton />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[0, 1, 2, 3].map((tile) => (
          <StatTileSkeleton key={tile} delay={tile * 90} />
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {[0, 1, 2].map((pill) => (
          <div
            key={pill}
            className="flex items-baseline gap-1.5 rounded-lg border border-sub-text/10 bg-background/40 px-3 py-1.5"
          >
            <Skeleton className="h-3 w-6 rounded" delay={pill * 70} />
            <Skeleton className="h-3.5 w-7 rounded" delay={pill * 70 + 40} />
            <Skeleton className="h-3 w-7 rounded" delay={pill * 70 + 80} />
          </div>
        ))}
      </div>

      {/* Same `p-4` frame and `h-64` canvas the real chart occupies. */}
      <div className="rounded-xl border border-sub-text/10 bg-background/40 p-4">
        <div className="flex h-64 w-full items-end gap-2">
          {CHART_BAR_HEIGHTS.map((height, i) => (
            <Skeleton
              key={i}
              className="flex-1 rounded-t"
              delay={i * 45}
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>
    </SkeletonScreen>
  );
}

/** Mirrors TodoStatsPanel: heading, 4 + 2 tiles, priority bars, 7-day chart. */
export function TodoStatsSkeleton() {
  return (
    <SkeletonScreen label="Loading todo stats" className="flex flex-col gap-4">
      <SectionHeadingSkeleton />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[0, 1, 2, 3].map((tile) => (
          <StatTileSkeleton key={tile} delay={tile * 90} />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[0, 1].map((tile) => (
          <StatTileSkeleton key={tile} delay={360 + tile * 90} />
        ))}
      </div>

      <div className="rounded-xl border border-sub-text/10 bg-background/40 p-4">
        <Skeleton className="mb-3 h-3.5 w-32 rounded" />
        <div className="flex flex-col gap-2">
          {PRIORITY_BAR_WIDTHS.map((pct, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-3 w-16 rounded" delay={i * 80} />
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-sub-text/10">
                <Skeleton
                  className="h-full rounded-full"
                  delay={i * 80 + 40}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <Skeleton className="h-3 w-4 rounded" delay={i * 80 + 80} />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-sub-text/10 bg-background/40 p-4">
        <Skeleton className="mb-3 h-3.5 w-40 rounded" />
        <div className="flex h-24 items-end justify-between gap-2">
          {WEEK_BAR_HEIGHTS.map((height, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="flex w-full flex-1 items-end">
                <Skeleton
                  className="w-full rounded-t"
                  delay={i * 70}
                  style={{ height: `${height}%` }}
                />
              </div>
              <Skeleton className="h-2.5 w-2 rounded" delay={i * 70 + 40} />
            </div>
          ))}
        </div>
      </div>
    </SkeletonScreen>
  );
}

/** Complete structured placeholder that mirrors the entire profile page. */
export function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-8 w-full">
      <HeaderSkeleton />
      <TypingStatsSkeleton />
      <TodoStatsSkeleton />
    </div>
  );
}

import { Skeleton, SkeletonScreen } from "@/shared/ui/Skeleton";

/** Per-row shape: title width, how many meta chips, whether a tag strip shows.
 *  Fixed rather than random so the placeholder is stable across renders. */
const ROWS = [
  { title: "w-2/5", meta: 2, tags: true },
  { title: "w-3/5", meta: 1, tags: false },
  { title: "w-1/3", meta: 2, tags: false },
  { title: "w-1/2", meta: 1, tags: true },
  { title: "w-2/5", meta: 1, tags: false },
];

/**
 * Placeholder for the task list. Mirrors TodoItem's box model exactly — same
 * `rounded-2xl p-4` card, same 20px check circle, same `gap-3` columns — so the
 * real rows drop in without moving anything.
 */
export function TodoSkeletonList() {
  return (
    <SkeletonScreen label="Loading todos" className="flex flex-col gap-3 w-full">
      {ROWS.map((row, i) => (
        <div
          key={i}
          className="bg-background/30 border border-sub-text/20 rounded-2xl p-4"
        >
          <div className="flex items-start gap-3">
            <Skeleton
              className="mt-0.5 h-5 w-5 rounded-full shrink-0"
              delay={i * 90}
            />

            <div className="flex-1 min-w-0 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Skeleton
                  className={`h-4 ${row.title} max-w-[280px] rounded`}
                  delay={i * 90 + 40}
                />
                {Array.from({ length: row.meta }).map((_, m) => (
                  <Skeleton
                    key={m}
                    className="h-4 w-14 rounded-full shrink-0"
                    delay={i * 90 + 80 + m * 40}
                  />
                ))}
              </div>

              {row.tags && (
                <div className="flex gap-1.5">
                  <Skeleton
                    className="h-[18px] w-16 rounded-full"
                    delay={i * 90 + 160}
                  />
                  <Skeleton
                    className="h-[18px] w-12 rounded-full"
                    delay={i * 90 + 200}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </SkeletonScreen>
  );
}

/**
 * Route-level fallback while Next streams the page chunk in. The page itself
 * renders its real chrome immediately and only skeletons the list, so this is
 * the navigation-time view.
 */
export default function TodosLoading() {
  return (
    <div className="w-full flex flex-col items-center pb-20">
      <div className="w-full max-w-2xl mt-8">
        <div className="flex items-center gap-2 mb-8">
          <Skeleton className="h-6 w-6 rounded" accent />
          <Skeleton className="h-7 w-40 rounded-lg" delay={60} />
        </div>

        <div className="flex flex-col gap-4 mb-6">
          {/* QuickAddBar */}
          <div className="w-full flex flex-col gap-4 bg-background/30 border border-sub-text/20 rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-5 rounded shrink-0" accent />
              <Skeleton className="h-5 w-52 rounded" delay={60} />
            </div>
            <Skeleton className="ml-8 h-8 w-2/3 rounded" delay={120} />
            <div className="flex flex-wrap items-end gap-4 pl-8">
              <Skeleton className="h-8 w-40 rounded-lg" delay={160} />
              <Skeleton className="h-8 w-24 rounded-lg" delay={200} />
            </div>
            <div className="flex flex-wrap gap-1.5 pl-8">
              {[64, 60, 48, 62, 54].map((w, i) => (
                <Skeleton
                  key={i}
                  className="h-[22px] rounded-full"
                  delay={240 + i * 40}
                  style={{ width: w }}
                />
              ))}
            </div>
            <div className="flex justify-end">
              <Skeleton className="h-9 w-24 rounded-xl" accent delay={300} />
            </div>
          </div>

          {/* FilterTabs */}
          <div className="flex items-center gap-1 bg-background/30 p-1 rounded-xl border border-sub-text/10 w-fit">
            {[44, 56, 76, 82].map((w, i) => (
              <Skeleton
                key={i}
                className="h-[26px] rounded-lg"
                delay={i * 70}
                style={{ width: w }}
              />
            ))}
          </div>
        </div>

        <TodoSkeletonList />
      </div>
    </div>
  );
}

export function TodoSkeletonList() {
  return (
    <div className="flex flex-col gap-3 w-full" aria-busy="true" aria-label="Loading todos">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-4 p-4 rounded-xl border border-sub-text/10 bg-background/50 animate-pulse shadow-sm"
        >
          <div className="flex items-center gap-3.5 flex-1 min-w-0">
            <div className="w-5 h-5 rounded-md bg-sub-text/20 shrink-0" />
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              <div className="h-4 bg-sub-text/20 rounded-md w-3/4 max-w-[280px]" />
              <div className="flex items-center gap-2">
                <div className="h-3 bg-sub-text/10 rounded w-16" />
                <div className="h-3 bg-sub-text/10 rounded w-12" />
              </div>
            </div>
          </div>
          <div className="h-6 w-16 bg-sub-text/10 rounded-full shrink-0" />
        </div>
      ))}
    </div>
  );
}

export default function TodosLoading() {
  return (
    <div className="w-full flex flex-col items-center pb-20">
      <div className="w-full max-w-2xl mt-8">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-6 h-6 rounded bg-primary/20 animate-pulse" />
          <div className="h-7 w-36 rounded-lg bg-sub-text/20 animate-pulse" />
        </div>

        <div className="flex flex-col gap-4 mb-6">
          {/* Quick Add Bar Skeleton */}
          <div className="h-12 w-full rounded-xl bg-sub-text/10 animate-pulse border border-sub-text/10" />
          {/* Filter Tabs Skeleton */}
          <div className="flex gap-2">
            {[0, 1, 2, 3].map((tab) => (
              <div key={tab} className="h-9 w-20 rounded-lg bg-sub-text/10 animate-pulse" />
            ))}
          </div>
        </div>

        <TodoSkeletonList />
      </div>
    </div>
  );
}

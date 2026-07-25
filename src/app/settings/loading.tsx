export default function SettingsLoading() {
  return (
    <div className="w-full flex flex-col items-center pb-20" aria-busy="true" aria-label="Loading settings">
      <div className="w-full max-w-4xl">
        <div className="mt-8 mb-8 w-full">
          <div className="h-5 w-20 animate-pulse rounded bg-sub-text/15" />
        </div>

        <div className="mt-8 w-full animate-pulse flex flex-col gap-12">
          {/* Font Family Section Skeleton */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="h-6 w-36 rounded-lg bg-sub-text/20" />
              <div className="h-4 w-96 max-w-full rounded bg-sub-text/10" />
            </div>

            <div className="bg-foreground/[0.01] p-6 rounded-xl border border-sub-text/10">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 w-full">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-14 rounded-lg bg-sub-text/15" />
                ))}
              </div>
            </div>
          </div>

          {/* Themes Section Skeleton */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="h-6 w-28 rounded-lg bg-sub-text/20" />
              <div className="h-4 w-96 max-w-full rounded bg-sub-text/10" />
            </div>

            <div className="bg-foreground/[0.01] p-6 rounded-xl border border-sub-text/10">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 w-full">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div key={i} className="h-12 rounded-lg bg-sub-text/15" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

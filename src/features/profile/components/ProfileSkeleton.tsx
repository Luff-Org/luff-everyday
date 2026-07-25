export function HeaderSkeleton() {
  return (
    <div
      className="flex flex-col sm:flex-row items-center gap-6 rounded-2xl border border-sub-text/10 bg-background/60 p-6 shadow-lg backdrop-blur"
      aria-busy="true"
      aria-label="Loading header"
    >
      <div className="h-20 w-20 animate-pulse rounded-full bg-sub-text/15 ring-4 ring-primary/10 shrink-0" />
      <div className="flex flex-1 flex-col items-center sm:items-start gap-2.5 w-full">
        <div className="h-7 w-48 animate-pulse rounded-lg bg-sub-text/15" />
        <div className="h-4 w-64 animate-pulse rounded-md bg-sub-text/10" />
        <div className="mt-1 flex items-center gap-2">
          <div className="h-6 w-24 animate-pulse rounded-full bg-primary/15" />
          <div className="h-6 w-32 animate-pulse rounded-full bg-sub-text/10" />
        </div>
      </div>
    </div>
  );
}

export function TypingStatsSkeleton() {
  return (
    <section className="flex flex-col gap-4" aria-busy="true" aria-label="Loading typing stats">
      <div className="flex items-center gap-2.5">
        <div className="h-5 w-5 animate-pulse rounded bg-primary/20" />
        <div className="h-6 w-24 animate-pulse rounded bg-sub-text/15" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[0, 1, 2, 3].map((tile) => (
          <div
            key={tile}
            className="flex flex-col justify-between h-[88px] animate-pulse rounded-xl border border-sub-text/10 bg-background/40 p-4"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-16 rounded bg-sub-text/15" />
              <div className="h-4 w-4 rounded bg-sub-text/10" />
            </div>
            <div className="h-7 w-12 rounded-lg bg-sub-text/20" />
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {[0, 1, 2].map((pill) => (
          <div key={pill} className="h-8 w-20 animate-pulse rounded-lg bg-sub-text/10" />
        ))}
      </div>

      <div className="h-44 w-full animate-pulse rounded-xl border border-sub-text/10 bg-background/40 p-4" />
    </section>
  );
}

export function TodoStatsSkeleton() {
  return (
    <section className="flex flex-col gap-4" aria-busy="true" aria-label="Loading todo stats">
      <div className="flex items-center gap-2.5">
        <div className="h-5 w-5 animate-pulse rounded bg-primary/20" />
        <div className="h-6 w-24 animate-pulse rounded bg-sub-text/15" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[0, 1, 2, 3].map((tile) => (
          <div
            key={tile}
            className="flex flex-col justify-between h-[88px] animate-pulse rounded-xl border border-sub-text/10 bg-background/40 p-4"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-16 rounded bg-sub-text/15" />
              <div className="h-4 w-4 rounded bg-sub-text/10" />
            </div>
            <div className="h-7 w-12 rounded-lg bg-sub-text/20" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[0, 1].map((tile) => (
          <div
            key={tile}
            className="flex flex-col justify-between h-[88px] animate-pulse rounded-xl border border-sub-text/10 bg-background/40 p-4"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-16 rounded bg-sub-text/15" />
              <div className="h-4 w-4 rounded bg-sub-text/10" />
            </div>
            <div className="h-7 w-12 rounded-lg bg-sub-text/20" />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-sub-text/10 bg-background/40 p-4">
        <div className="h-3.5 w-32 animate-pulse rounded bg-sub-text/15" />
        {[0, 1, 2, 3].map((bar) => (
          <div key={bar} className="flex items-center gap-3">
            <div className="h-3 w-12 animate-pulse rounded bg-sub-text/10" />
            <div className="h-2 flex-1 animate-pulse rounded-full bg-sub-text/10" />
            <div className="h-3 w-4 animate-pulse rounded bg-sub-text/10" />
          </div>
        ))}
      </div>

      <div className="h-36 w-full animate-pulse rounded-xl border border-sub-text/10 bg-background/40 p-4" />
    </section>
  );
}

/** Complete structured placeholder that mirrors the entire profile page during loading. */
export function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-8 w-full">
      <HeaderSkeleton />
      <TypingStatsSkeleton />
      <TodoStatsSkeleton />
    </div>
  );
}

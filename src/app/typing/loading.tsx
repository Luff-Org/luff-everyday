export default function TypingLoading() {
  return (
    <div className="flex-1 flex flex-col justify-center w-full pt-16 max-w-4xl mx-auto" aria-busy="true" aria-label="Loading typing test workspace">
      <div className="flex flex-col gap-8 w-full animate-pulse">
        {/* Controls / Mode bar skeleton */}
        <div className="flex items-center justify-between gap-4 p-3 rounded-xl border border-sub-text/10 bg-background/50">
          <div className="flex items-center gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-8 w-16 rounded-lg bg-sub-text/15" />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-8 w-12 rounded-lg bg-sub-text/15" />
            ))}
          </div>
        </div>

        {/* Live stats / Timer placeholder */}
        <div className="flex items-center justify-between px-2">
          <div className="h-10 w-16 rounded-lg bg-primary/20" />
          <div className="flex items-center gap-6">
            <div className="h-5 w-20 rounded bg-sub-text/15" />
            <div className="h-5 w-20 rounded bg-sub-text/15" />
          </div>
        </div>

        {/* Text paragraph lines skeleton */}
        <div className="flex flex-wrap gap-3 p-6 rounded-2xl border border-sub-text/10 bg-background/40 min-h-[160px] items-center">
          {Array.from({ length: 28 }).map((_, i) => (
            <div
              key={i}
              className="h-6 rounded-md bg-sub-text/15"
              style={{ width: `${Math.floor(35 + (i * 17) % 55)}px` }}
            />
          ))}
        </div>

        {/* Keyboard hint skeleton */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <div className="h-4 w-48 rounded bg-sub-text/10" />
        </div>
      </div>
    </div>
  );
}

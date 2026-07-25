/** Structured placeholder that mirrors the two stat panels while they stream in. */
export function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true" aria-label="Loading stats">
      {[0, 1].map((section) => (
        <section key={section} className="flex flex-col gap-4">
          <div className="h-5 w-28 animate-pulse rounded bg-sub-text/10" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[0, 1, 2, 3].map((tile) => (
              <div
                key={tile}
                className="h-[88px] animate-pulse rounded-xl bg-sub-text/5"
              />
            ))}
          </div>
          <div className="h-40 animate-pulse rounded-xl bg-sub-text/5" />
        </section>
      ))}
    </div>
  );
}

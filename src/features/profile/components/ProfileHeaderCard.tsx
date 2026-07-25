export function ProfileHeaderCard({
  name,
  email,
}: {
  name?: string | null;
  email?: string | null;
}) {
  const displayName = name?.trim() || "Anonymous";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-sub-text/10 bg-background/40 p-5">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-2xl font-black text-primary">
        {initial}
      </div>
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-black tracking-tight text-foreground">
          {displayName}
        </h1>
        {email && <p className="truncate text-sm text-sub-text">{email}</p>}
      </div>
    </div>
  );
}

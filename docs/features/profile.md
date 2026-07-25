# Feature: profile dashboard

Owns: how stats are aggregated and rendered at `/profile`.

Code: `src/features/profile/**`, route `src/app/api/profile/route.ts`, page `src/app/profile/page.tsx`.

## Composition

The route is the only place two features compose:

```ts
export const GET = route(async (): Promise<ProfileStats> => {
  const userId = await requireUser();
  const [todos, typing] = await Promise.all([
    todoService.stats(userId),
    testService.stats(userId),
  ]);
  return { todos, typing };
});
```

`ProfileStats` (`features/profile/types.ts`) is just `{ todos: TodoStats; typing: TypingStats }`,
importing each half from its owning feature — the profile feature defines no tables of its own.

## Rendering: server-first, streamed

`src/app/profile/page.tsx` is a server component:

1. `await auth()`; redirect to `/login?callbackUrl=/profile` if the session expired mid-visit
   (middleware normally handles this).
2. Render `ProfileHeaderCard` (name/email from the session) immediately.
3. Render `<Suspense fallback={<ProfileSkeleton />}><ProfileDashboard userId={…} /></Suspense>`
   so the shell paints while the aggregations resolve.

`ProfileDashboard` awaits the stats on the server — no client session round trip and no
`/api/profile` fetch on first paint. `features/profile/api.ts` (`profileApi.get()`) exists for
client-side refetching.

Panels: `TypingStatsPanel`, `TodoStatsPanel`, `TypingTrendChart`, with `StatTile` for individual
metrics. Chart colours come from live theme CSS variables via `shared/lib/useChartColors.ts`.

## Todo stats

`todoService.stats` issues six queries in parallel through the repository, then shapes them:

| Field | Derivation |
| :--- | :--- |
| `total`, `active`, `completed` | `groupBy completed` with counts; `total` is their sum |
| `completionRate` | `round(completed / total * 100)`, `0` when `total === 0` |
| `overdue` | active todos with `dueDate < now` |
| `dueToday` | active todos with `dueDate` inside today's local bounds |
| `tagCount` | the user's `Tag` rows |
| `byPriority` | `groupBy priority` over **active** todos, merged into a zero-filled record so all four keys always exist |
| `completedLast7Days` | 7 zero-filled buckets keyed local `YYYY-MM-DD` (oldest first), filled from todos completed since `startOfToday - 6 days` |

All day math uses **server local time** (`setHours(0,0,0,0)`, `getFullYear/getMonth/getDate`),
so a user in a different timezone sees the server's day boundaries. Fixing that means passing a
timezone offset from the client — a deliberate open item, not an oversight.

## Typing stats

`testService.stats` — see [typing.md](typing.md#stats): totals, best/avg WPM, avg raw WPM, avg
accuracy (one decimal), best WPM per duration, and the latest 30 results oldest-first.

## Empty accounts

Everything degrades to zeros: `completionRate: 0`, all `byPriority` keys `0`,
`bestByDuration: []`, `history: []`, and 7 buckets of `0`. No panel needs a null guard beyond
"is the array empty".

## Extending

- New tile: add the field to `TodoStats` / `TypingStats`, compute it in the owning service (add
  the query to that feature's repository), then render it. Update
  [../api-contracts.md](../api-contracts.md).
- Keep aggregation in the owning feature's service — the profile route composes, it does not
  compute.
- Prefer one more parallel query over post-processing a large `findMany` in JS; the existing
  stats path returns counts, not rows (the only exception is `completedSince`, which selects
  just `completedAt`).

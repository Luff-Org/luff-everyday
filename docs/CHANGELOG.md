# Changelog

Notable schema, API and infrastructure changes. Newest first. Feature-level detail lives in the
`docs/features/*` pages; this file records what changed and what it broke.

## 2026-07-25 — Todo image attachments

New `TodoImage` model (migration `20260725163051_add_todo_images`) — up to 3 photos per todo,
2MB each, uploaded through the existing `/api/upload` route (folder `"todos"`). Same
full-replacement write protocol as `TodoLink`.

- `POST/PATCH /api/todos*` accept an `images: {url, publicId}[]` field (max 3); response `Todo`
  now includes `images` alongside `links`.
- `POST /api/upload` size limit is now per-folder instead of a flat 5MB: `avatars` stays 5MB,
  `todos` is capped at 2MB (server-enforced; the client also checks before uploading).
- New `TodoImageUpload` component (`features/todos/components/`), used in both `QuickAddBar`
  (create) and `TaskDetailDrawer` (edit).
- Deleting a `Todo` cascades `TodoImage` rows; the Cloudinary asset itself is not cleaned up
  (same gap as the profile avatar today).

## 2026-07-25 — Loading states rebuilt, startup path unblocked

No schema or API-contract changes. Behavioural and performance work.

### Removed artificial and structural delays

- `Providers` held the entire app behind a full-screen loader for a hardcoded **1200 ms**
  `setTimeout` on every page load, plus however long `useSession()` took. Both gates are gone;
  `Providers` is now just `SessionProvider`. Auth-only routes are already guarded by
  `src/proxy.ts`, and `Header`'s new `AuthSlot` reserves its footprint while the session
  resolves.
- `ThemeProvider` rendered the whole tree with `visibility: hidden` until mount. Replaced by a
  pre-paint inline script in `layout.tsx` that reads the persisted theme/font keys and stamps
  `<html>` before first paint. `<html>` now carries `suppressHydrationWarning`.
- `globals.css` pulled ~25 Google font families through a render-blocking `@import`. Now a
  `media="print"` `<link>` promoted to `media="all"` on load, behind `preconnect`.
- `/todos` waited for the client session to resolve *before* starting its data fetch, and
  fetched todos and tags one after the other. New `useTodoStore.loadInitialData()` fires both in
  parallel on mount and de-duplicates concurrent calls; a 401 redirects to `/login`.
- `prefetch={false}` removed from all nav links, so route shells prefetch again.
- Body font moved from `inter.className` to the `--app-font` variable chain, so the font picker
  actually wins over the next/font class.

### Stats queries now aggregate in Postgres

Both services matched their documented design only on paper — each pulled every row for the user
and reduced in JS.

- `testRepository.statsBundle` replaces `listForStats`/`aggregate`/`bestByDuration`/`recent`:
  `aggregate` + `groupBy duration` + the 30 charted rows, run concurrently.
- `todoRepository.statsBundle` replaces `listForStats`: `groupBy completed`, `groupBy priority`,
  two `count`s, the completed rows inside the 7-day window, and the tag count — concurrently,
  covered by the existing `[userId, completed, dueDate]` and `[userId, completed, completedAt]`
  indexes.

Output shapes are unchanged; averages now come from SQL `AVG` and can differ in the last
decimal.

### Skeletons

New `shared/ui/Skeleton.tsx` (`Skeleton`, `SkeletonScreen`) with theme-derived colours, a sweep
animation, staggered delays and a `prefers-reduced-motion` fallback. Every loader on `/typing`,
`/todos`, `/profile` and `/settings` was rebuilt to mirror the box model of the component it
replaces. `shared/ui/LoadingScreen.tsx` deleted (its only caller was the removed auth gate).
See [frontend.md](frontend.md#loading-states).

## 2026-07-25 — Database rebuild, task detail fields, profile dashboard, docs

### Database rebuilt from scratch (breaking)

Every table was dropped and the migration history squashed. The three previous migrations
(`20260725061326_add_todos`, `20260725063738_add_credentials_auth`,
`20260725070000_add_task_detail_fields`) were deleted and replaced by a single baseline,
`20260725124525_init`, generated from the current `prisma/schema.prisma`.

- All existing rows were destroyed (the database held 1 user, 1 todo, 1 tag, 2 test results).
- `migration_lock.toml` is now tracked, so `prisma migrate` no longer regenerates it.
- Any other environment pointed at its own database must run `npx prisma migrate reset` (dev) —
  `migrate deploy` cannot reconcile a history that was rewritten.
- Procedure documented in [database.md](database.md#full-reset-drops-all-data).

### Schema additions (in the new baseline)

Beyond the previously migrated tables:

- `Todo`: `notes` (`@db.Text`), `startDate`, `estimatedMinutes`, `energyLevel`, `context`,
  `location`, `recurrence`, `recurringParentId`.
- New enums `RecurrenceRule`, `EnergyLevel`.
- New table `TodoLink` — attached reference URLs, ordered, cascade on todo delete.
- New table `TodoDependency` — self-relation join (`blockedId`, `blockingId`) for task blockers,
  composite PK, index on `blockingId`.
- Index `Todo(userId, completed, dueDate)`.

### API additions

- `GET /api/profile` — combined todo + typing stats for the dashboard.
- `PATCH /api/todos/{id}` accepts `notes`, `startDate`, `estimatedMinutes`, `energyLevel`,
  `context`, `location`, `recurrence`, `links`, `dependsOn`.
- `POST /api/todos` accepts the same detail fields plus `links`.
- `POST /api/todos/{id}/complete` now returns `{ completed, next }` and 409s when a blocker is
  unfinished; previously it always completed.
- New error cases: 400 `Unknown blocker task`, 409 `That would create a circular dependency`,
  409 `Blocked by N unfinished task(s)`.

### Fixes

- `todoRepository.completeWithRecurrence` ran its interactive transaction on Prisma's 5s
  default. Three sequential round trips (one with nested creates) against a pooled remote
  Postgres overran it, producing intermittent 500s when completing a recurring todo. Now
  `{ maxWait: 10s, timeout: 20s }`.

### Tooling

- `scripts/smoke-api.mjs` + `npm run smoke` — end-to-end API smoke test (37 checks) that
  registers a throwaway user, exercises every route, and cleans up after itself.
- `docs/` — this documentation set.

## Earlier

Recovered from git history; these landed before the docs existed.

- **Optimistic id race guard** (`3afcb1f`) — store actions reject `temp-` ids with an info toast
  instead of firing requests against ids the server has never seen.
- **Header re-render fix** (`bf2ebd6`) — granular Zustand selectors instead of whole-store
  subscriptions; removed unnecessary `backdrop-blur`.
- **Feature-based architecture** (PR #3) — moved from `components/`+`lib/`+`store/` to
  `src/features/*` + `src/shared/*`; introduced `route()`/`requireUser()`, the
  service/repository split, and Prisma-derived types.
- **Credentials auth** — `User.username` + `User.password` (bcrypt), `POST /api/auth/register`,
  login page sign-in/sign-up toggle.
- **Todos feature** — `Todo`, `Subtask`, `Tag`, `TodoTag`; quick-add parsing, urgency sorting,
  optimistic store.
- **Typing test** — engine, metrics, `TestResult` persistence, Google OAuth.

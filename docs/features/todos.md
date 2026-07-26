# Feature: smart todos

Owns: todo domain rules — quick-add parsing, urgency sorting, tags, recurrence, dependencies.

Code: `src/features/todos/**`, routes under `src/app/api/todos/**`, page `src/app/todos/page.tsx`.
Wire shapes in [../api-contracts.md](../api-contracts.md); tables in [../data-model.md](../data-model.md).

## Quick add

`features/todos/lib/todoParser.ts` turns one free-text line into structured fields. Pure, and
takes `now` as a parameter so it is testable.

```
"write docs tomorrow !high #docs"
  → { title: "write docs", dueDate: <tomorrow>, priority: "HIGH", tags: ["docs"] }
```

| Token | Meaning | Notes |
| :--- | :--- | :--- |
| `!low` `!medium` `!high` `!urgent` | priority | case-insensitive; unknown `!word` is left in the title |
| `#tag` | tag | lowercased, deduplicated |
| natural-language date | due date | `chrono-node`; **first** match only, then removed from the title |

Everything left over, whitespace-collapsed and trimmed, becomes the title.

The parser runs in two places: in the client store for an instant optimistic row, and again in
`todoService.create` on the server (the request sends `raw`, so the server is authoritative).
Explicit fields in the request override parsed values: `title ?? parsed.title`,
`dueDate ?? parsed.dueDate`, `priority ?? parsed.priority ?? "MEDIUM"`,
`tags ?? parsed.tags`. Empty resolved title → `HttpError(400, "Title is required")`.

## Urgency buckets and sorting

`features/todos/lib/todoSort.ts`, applied client-side (the API returns `createdAt desc`).

Buckets, in order: `overdue` → `today` → `thisWeek` → `noDate`. Note `thisWeek` means *any*
future date, not only within 7 days — the name is narrower than the behaviour.

`sortByUrgency` sorts by bucket, then by priority weight (`URGENT` 3 → `LOW` 0), then by due
date ascending (missing dates sort as epoch 0).

`getDueDateLabel` renders: `Today`, `Tomorrow`, `Overdue by Nd`, `in Nd` (2–7 days), otherwise
a localized `MMM D`.

## Filters

Client-side, from `useTodoStore`: `all`, `today`, `upcoming`, `completed`, plus an optional
single-tag filter. No server query parameters — the full list is fetched once and filtered in
memory.

## Tags

Per user, unique on `(userId, lowercased name)`, names ≤30 chars. Colour is assigned
deterministically from the name (`pickTagColor`: 31-multiplier hash over a 10-colour palette),
so the same tag name always looks the same, and `POST /api/todos/tags` with an explicit
`color` overrides it.

Assignment on create/update is **full replacement**: existing `TodoTag` links are deleted, each
submitted name is upserted into `Tag`, and fresh links are created. Sending `tags: []` clears
them; omitting the key leaves them untouched.

## Attached links

Up to 50 per todo (`url` must parse as a URL, ≤2000 chars; `title` ≤200). Writes replace the
whole set inside a transaction, with `order` = position in the submitted array. Cleared with
`links: []`.

## Attached images

Up to `MAX_TODO_IMAGES` (3) per todo, each ≤`MAX_TODO_IMAGE_BYTES` (2MB)
(`features/todos/lib/constants.ts`). Unlike links, the client never sends raw file bytes to
`/api/todos` — `TodoImageUpload` (`features/todos/components/TodoImageUpload.tsx`) uploads
each file to `POST /api/upload` (folder `"todos"`) as soon as it's picked, which is what
actually enforces the 2MB cap server-side (`src/app/api/upload/route.ts`'s per-folder
`MAX_BYTES`), then holds the returned `{url, publicId}` pairs in local state. Only on
create/save does that list travel to `/api/todos` as `images`, written the same way as
links: full replacement inside a transaction, `order` = position in the array, cleared with
`images: []`. Used from both `QuickAddBar` (create) and `TaskDetailDrawer` (edit) via the
same component. Deleting a todo cascades `TodoImage` rows, but does **not** delete the
underlying Cloudinary asset (matches the profile avatar's replace behaviour).

## Recurrence

`recurrence` ∈ `NONE | DAILY | WEEKLY | MONTHLY`. Nothing is scheduled in the background —
the next occurrence is created **on completion**, in the same transaction, by
`todoRepository.completeWithRecurrence`:

1. Load the todo with subtasks + tag links (ownership-scoped).
2. Mark it complete, set `completedAt`.
3. If `recurrence === NONE`, return `{ completed, next: null }`.
4. Otherwise compute the next due date from the previous `dueDate` (or now if unset):
   `DAILY` +1 day, `WEEKLY` +7 days, `MONTHLY` +1 month (JS `setMonth`, so Jan 31 → Mar 3 in a
   non-leap year — month-end dates drift).
5. Create the clone: scalars copied, subtasks cloned as incomplete, same tags re-linked,
   `recurringParentId` = the completed todo's id.
6. Return `{ completed, next }` — the client prepends `next` to the list.

Not cloned: attached links, attached images, dependency edges, `startDate`. `recurringParentId` is a soft
reference (no FK), so deleting the parent leaves it dangling by design.

The transaction runs with `{ maxWait: 10s, timeout: 20s }` — three sequential round trips (one
with nested creates) exceed Prisma's 5s interactive default against a pooled remote Postgres,
which surfaced as intermittent 500s on completing recurring todos.

Completing via `PATCH { completed: true }` skips all of this — it flips the flag and
`completedAt` only. That path exists for un-completing; the client uses `POST /complete` to
complete.

## Dependencies (blockers)

`TodoDependency(blockedId, blockingId)` = "blocked waits on blocking". Set through
`PATCH /api/todos/{id}` with `dependsOn: string[]`, always a full replacement.

Validation order in `todoService.update`:

1. Dedupe; drop a self-reference silently.
2. Every remaining id must be a todo owned by the caller → otherwise 400 `Unknown blocker task`.
3. Load all of the user's edges, drop this todo's current outgoing edges (they're being
   replaced), and run a DFS from each proposed blocker: if `blockedId` is reachable, the new
   edge closes a loop → 409 `That would create a circular dependency`.
4. Replace the edge set in a transaction.

Completion gate: `POST /api/todos/{id}/complete` first queries blockers that are still
incomplete; if any exist → 409 `Blocked by N unfinished task(s)`. The gate is checked at
completion time, not at edit time, so you can plan a chain in any order.

`TODO_INCLUDE` hydrates `dependsOn[].blocking` with `{ id, title, completed, priority }` —
enough to render a chip and know whether it still gates completion, without loading whole rows.

## Client behaviour

Store: `features/todos/store/useTodoStore.ts`. Every mutation is optimistic with snapshot
rollback and a Sonner toast on failure; unsaved rows carry `temp-` ids and reject actions that
need a real id. Full protocol in [../frontend.md](../frontend.md).

## Extending

- New scalar field: `schema.prisma` → migration → `createTodoSchema`/`updateTodoSchema` →
  `applyScalarFields` in the service → `TodoUpdatePatch` in `types.ts` → UI. The `Todo` type
  updates itself from Prisma.
- New relation: add it to `TODO_INCLUDE` so it appears in every todo response (and therefore
  in `Todo`), then add replace-style repository helpers.
- New domain rule: service, not component — see the invariant list in
  [../data-model.md](../data-model.md).

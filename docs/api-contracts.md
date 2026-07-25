# API contracts

Owns: every HTTP endpoint — auth requirement, request schema, response shape, status codes.

All bodies are JSON (`Content-Type: application/json`). All responses are JSON. Timestamps
are ISO 8601 strings (`Serialized<>` converts Prisma `Date` → `string`).

## Conventions

Every handler is wrapped by `route()` from `shared/lib/http.ts`:

| Situation | Status | Body |
| :--- | :--- | :--- |
| Handler returns a value | 200 | the value, JSON-encoded |
| Handler returns `undefined` | 200 | `{ "success": true }` |
| No session (`requireUser()`) | 401 | `{ "error": "Unauthorized" }` |
| Zod validation failure | 400 | `{ "error": "Invalid request", "issues": { "formErrors": [], "fieldErrors": { … } } }` |
| Service `HttpError(400\|404\|409, msg)` | as thrown | `{ "error": "<msg>" }` |
| Unexpected throw | 500 | `{ "error": "Internal Server Error" }` (logged server-side) |

**Ownership** is enforced per request: a row that exists but belongs to another user returns
404 `{"error":"Not found"}`, identical to a row that does not exist.

**Auth transport** is a NextAuth JWT session cookie (`authjs.session-token`, or
`__Secure-authjs.session-token` over HTTPS). There is no API-key or bearer path. Middleware
guards page routes only — `/api/*` relies on `requireUser()`.

## Endpoint map

| Method | Path | Auth | Purpose |
| :--- | :--- | :--- | :--- |
| GET/POST | `/api/auth/[...nextauth]` | — | NextAuth handlers (signin, callback, session, csrf, signout) |
| POST | `/api/auth/register` | — | Create a credentials account |
| GET | `/api/todos` | ✅ | List the user's todos with relations |
| POST | `/api/todos` | ✅ | Create a todo (quick-add string or explicit fields) |
| PATCH | `/api/todos/{id}` | ✅ | Partial update, incl. tags/links/dependencies |
| DELETE | `/api/todos/{id}` | ✅ | Delete a todo (cascades subtasks/links/tags/deps) |
| POST | `/api/todos/{id}/complete` | ✅ | Complete, honouring blockers + recurrence |
| POST | `/api/todos/reorder` | ✅ | Bulk-set manual `order` |
| GET | `/api/todos/tags` | ✅ | List the user's tags |
| POST | `/api/todos/tags` | ✅ | Create or recolor a tag |
| POST | `/api/todos/{id}/subtasks` | ✅ | Add a subtask |
| PATCH | `/api/todos/{id}/subtasks/{subtaskId}` | ✅ | Update a subtask |
| DELETE | `/api/todos/{id}/subtasks/{subtaskId}` | ✅ | Delete a subtask |
| POST | `/api/tests` | ✅ | Save a typing-test result |
| GET | `/api/profile` | ✅ | Combined todo + typing stats |

---

## Shared response shapes

### `Todo`

Returned by `GET /api/todos` (as an array), `POST /api/todos`, `PATCH /api/todos/{id}`, and
nested in the complete response. Relations always follow `TODO_INCLUDE`.

```json
{
  "id": "cms0d87sg0004kjpnwk2lf4e1",
  "title": "write docs",
  "description": null,
  "notes": null,
  "completed": false,
  "completedAt": null,
  "priority": "HIGH",
  "startDate": null,
  "dueDate": "2026-07-26T12:48:51.394Z",
  "estimatedMinutes": null,
  "energyLevel": null,
  "context": null,
  "location": null,
  "order": 0,
  "recurrence": "NONE",
  "recurringParentId": null,
  "createdAt": "2026-07-25T12:48:53.872Z",
  "updatedAt": "2026-07-25T12:48:53.872Z",
  "userId": "cms0d84yz0000kjpna0p1yeh7",
  "subtasks": [
    { "id": "…", "title": "sub one", "completed": false, "order": 0, "todoId": "…" }
  ],
  "tags": [
    { "todoId": "…", "tagId": "…",
      "tag": { "id": "…", "name": "docs", "color": "#22d3ee", "userId": "…" } }
  ],
  "links": [
    { "id": "…", "url": "https://example.com", "title": "ref", "order": 0,
      "createdAt": "2026-07-25T12:48:53.872Z", "todoId": "…" }
  ],
  "dependsOn": [
    { "blockedId": "…", "blockingId": "…",
      "blocking": { "id": "…", "title": "blocker task", "completed": false, "priority": "MEDIUM" } }
  ]
}
```

Ordering inside relations: `subtasks` and `links` by `order` ascending; `dependsOn`
unordered; the todo list itself by `createdAt` descending.

### `Subtask`

```json
{ "id": "…", "title": "sub one", "completed": false, "order": 0, "todoId": "…" }
```

### `Tag`

```json
{ "id": "…", "name": "docs", "color": "#22d3ee", "userId": "…" }
```

---

## Auth

### `POST /api/auth/register`

Public. Creates a username/password account. Handled by
`features/auth/register.service.ts`.

Request (`registerSchema`):

| Field | Type | Rules |
| :--- | :--- | :--- |
| `username` | string | trimmed + lowercased, then `^[a-z0-9_]{3,20}$` |
| `email` | string | trimmed + lowercased, `^[^\s@]+@[^\s@]+\.[^\s@]+$` |
| `password` | string | ≥8 chars; stored as bcrypt hash (cost 12) |

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"username":"harsh","email":"harsh@example.com","password":"supersecret"}'
```

| Status | Body | When |
| :--- | :--- | :--- |
| 200 | `{"success":true}` | created |
| 400 | `{"error":"Username must be 3-20 characters: letters, numbers, underscore only."}` | first Zod issue message (validation is `safeParse`, so the message is human-facing, not the `issues` envelope) |
| 409 | `{"error":"An account with this email already exists."}` | email taken by a credentials account |
| 409 | `{"error":"This email is already registered via Google. Sign in with Google instead."}` | email belongs to an OAuth-only user (`password === null`) |
| 409 | `{"error":"That username is taken."}` | username taken |

No session is created — the client signs in afterwards via
`signIn("credentials", …)`.

### `GET|POST /api/auth/[...nextauth]`

NextAuth v5 catch-all. Relevant sub-routes: `/api/auth/csrf`, `/api/auth/session`,
`/api/auth/signin/google`, `/api/auth/callback/google`,
`/api/auth/callback/credentials`, `/api/auth/signout`. Shapes are NextAuth's own; see
[auth.md](auth.md). `GET /api/auth/session` returns `null` when unauthenticated, else:

```json
{ "user": { "name": null, "email": "…", "image": null, "id": "cms0d84yz0000kjpna0p1yeh7" },
  "expires": "2026-08-24T12:48:51.382Z" }
```

---

## Todos

### `GET /api/todos`

Returns `Todo[]` for the session user, newest first. No query parameters — filtering
(`all` / `today` / `upcoming` / `completed`, tag filter) happens client-side in the store.

### `POST /api/todos`

Create. Either pass `raw` for quick-add parsing, or explicit fields, or both (explicit fields
win over parsed ones).

Request (`createTodoSchema`) — all optional:

| Field | Type | Rules / effect |
| :--- | :--- | :--- |
| `raw` | string | quick-add source; parsed for title, due date, `!priority`, `#tags` |
| `title` | string | 1–500 after trim; overrides parsed title |
| `description` | string \| null | ≤2000 |
| `notes` | string \| null | ≤20000 |
| `startDate` | string \| null | any `Date`-parseable string |
| `dueDate` | string \| null | overrides the parsed date |
| `priority` | `LOW\|MEDIUM\|HIGH\|URGENT` | overrides parsed; default `MEDIUM` |
| `estimatedMinutes` | int \| null | 0 … 43200 |
| `energyLevel` | `LOW\|MEDIUM\|HIGH` \| null | |
| `context` | string \| null | ≤120 |
| `location` | string \| null | ≤120 |
| `tags` | string[] | each trimmed+lowercased, 1–30 chars; overrides parsed tags; tags are upserted per user |
| `links` | `{url, title?}[]` | ≤50; `url` must parse as a URL, ≤2000 chars; `title` ≤200; `order` = array index |

Title resolution: `title ?? parsed.title`, trimmed. If empty → 400 `{"error":"Title is required"}`.

```bash
curl -X POST http://localhost:3000/api/todos -b cookies.txt \
  -H 'Content-Type: application/json' \
  -d '{"raw":"write docs tomorrow !high #docs","links":[{"url":"https://example.com","title":"ref"}]}'
```

| Status | Body |
| :--- | :--- |
| 200 | the created `Todo` |
| 400 | `{"error":"Title is required"}` or the Zod `issues` envelope |
| 401 | `{"error":"Unauthorized"}` |

### `PATCH /api/todos/{id}`

Partial update. Omitted keys are untouched; `null` clears a nullable column.

Request (`updateTodoSchema`) — all optional: `title`, `description`, `notes`, `startDate`,
`dueDate`, `priority`, `estimatedMinutes`, `energyLevel`, `context`, `location`,
`recurrence` (`NONE|DAILY|WEEKLY|MONTHLY`), `completed` (bool), `order` (int),
`tags` (string[]), `links` (`{url,title?}[]`), `dependsOn` (string[] of todo ids).

Relation semantics — all three are **full replacement**, not merge:

- `tags` — existing `TodoTag` links are deleted, tags upserted per user, new links created.
- `links` — existing `TodoLink` rows deleted, submitted list re-created with `order` = index.
- `dependsOn` — the set of blockers this todo waits on. Deduplicated; a self-reference is
  silently dropped. Every id must be a todo owned by the caller, and the resulting graph must
  be acyclic.

Setting `completed` here also maintains `completedAt` (`now()` when true, `null` when false).
Note that `PATCH { completed: true }` **bypasses** the blocker gate and recurrence spawn —
those live in `POST /{id}/complete`. The client uses PATCH only to un-complete.

```bash
curl -X PATCH http://localhost:3000/api/todos/$ID -b cookies.txt \
  -H 'Content-Type: application/json' \
  -d '{"priority":"URGENT","dependsOn":["cms0d8cw20007kjpntvwwct2n"]}'
```

| Status | Body | When |
| :--- | :--- | :--- |
| 200 | updated `Todo` | |
| 400 | `{"error":"Unknown blocker task"}` | a `dependsOn` id isn't owned by the caller / doesn't exist |
| 400 | Zod `issues` envelope | schema violation |
| 404 | `{"error":"Not found"}` | todo missing or not owned |
| 409 | `{"error":"That would create a circular dependency"}` | the edge set would close a loop |

### `DELETE /api/todos/{id}`

| Status | Body |
| :--- | :--- |
| 200 | `{"success":true}` |
| 404 | `{"error":"Not found"}` |

Cascades to subtasks, links, tag links, and dependency edges on both sides. A spawned
recurring child is **not** deleted (its `recurringParentId` just dangles).

### `POST /api/todos/{id}/complete`

Empty body. The domain-aware completion path.

```json
{ "completed": { /* Todo */ }, "next": null }
```

`next` is the newly spawned occurrence (a full `Todo`) when `recurrence != NONE`, else
`null`. Next due date = previous `dueDate` (or now, if unset) plus 1 day / 7 days / 1 month.
The clone copies title, description, notes, priority, estimate, energy, context, location and
recurrence; clones subtasks reset to incomplete; re-links the same tags; sets
`recurringParentId` to the completed todo. Links and dependencies are **not** cloned. Both
writes happen in one transaction.

| Status | Body | When |
| :--- | :--- | :--- |
| 200 | `{"completed":Todo,"next":Todo\|null}` | |
| 404 | `{"error":"Not found"}` | todo missing or not owned |
| 409 | `{"error":"Blocked by 2 unfinished tasks"}` | at least one blocker is still open (count is pluralized) |

### `POST /api/todos/reorder`

```json
{ "items": [ { "id": "…", "order": 0 }, { "id": "…", "order": 1 } ] }
```

Applies each `order` in a single transaction, scoped by `userId` (ids not owned by the caller
match nothing and are silently skipped — no error). Returns `{"success":true}`.

### `GET /api/todos/tags`

Returns `Tag[]` for the user, ordered by `name` ascending.

### `POST /api/todos/tags`

```json
{ "name": "docs", "color": "#22d3ee" }
```

`name` is trimmed + lowercased, 1–30 chars. `color` optional — omitted means a colour is
picked deterministically from the name hash. Upsert semantics on `(userId, name)`: an
existing tag has its colour updated. Returns the `Tag`.

### `POST /api/todos/{id}/subtasks`

```json
{ "title": "sub one" }
```

`title` 1–500 after trim. `order` is assigned as the current subtask count. Returns the
`Subtask`. 404 if the parent todo isn't owned.

### `PATCH /api/todos/{id}/subtasks/{subtaskId}`

Optional `title` (1–500), `completed` (bool), `order` (int). Returns the updated `Subtask`.
404 unless the subtask belongs to that todo **and** the todo belongs to the caller.

### `DELETE /api/todos/{id}/subtasks/{subtaskId}`

`{"success":true}`, or 404 as above.

---

## Typing

### `POST /api/tests`

Save a completed test result.

| Field | Type | Rules |
| :--- | :--- | :--- |
| `wpm` | int | ≥0 |
| `rawWpm` | int | ≥0 |
| `accuracy` | number | 0–100 |
| `duration` | int | >0, seconds |

```bash
curl -X POST http://localhost:3000/api/tests -b cookies.txt \
  -H 'Content-Type: application/json' \
  -d '{"wpm":80,"rawWpm":85,"accuracy":96.5,"duration":30}'
```

Response 200:

```json
{ "id": "…", "wpm": 80, "rawWpm": 85, "accuracy": 96.5, "duration": 30,
  "createdAt": "2026-07-25T12:49:14.285Z", "userId": "…" }
```

400 on schema violation, 401 unauthenticated. Results from anonymous visitors are simply
not persisted — the client skips the call.

---

## Profile

### `GET /api/profile`

Combined dashboard payload (`ProfileStats`); the two halves are aggregated in parallel.

```json
{
  "todos": {
    "total": 2,
    "active": 1,
    "completed": 1,
    "completionRate": 50,
    "overdue": 0,
    "dueToday": 0,
    "tagCount": 1,
    "byPriority": { "LOW": 0, "MEDIUM": 0, "HIGH": 1, "URGENT": 0 },
    "completedLast7Days": [
      { "date": "2026-07-19", "count": 0 },
      { "date": "2026-07-25", "count": 1 }
    ]
  },
  "typing": {
    "totalTests": 1,
    "bestWpm": 80,
    "avgWpm": 80,
    "avgRawWpm": 85,
    "avgAccuracy": 96.5,
    "bestByDuration": [ { "duration": 30, "bestWpm": 80 } ],
    "history": [
      { "id": "…", "wpm": 80, "rawWpm": 85, "accuracy": 96.5, "duration": 30,
        "createdAt": "2026-07-25T12:49:14.285Z" }
    ]
  }
}
```

Semantics:

- `completionRate` — `round(completed / total * 100)`, `0` when `total === 0`.
- `byPriority` — counts **active** todos only; all four keys always present.
- `completedLast7Days` — exactly 7 buckets, oldest first, keyed `YYYY-MM-DD` in **server
  local time**; a day with no completions is `0`.
- `overdue` — active todos with `dueDate < now`. `dueToday` — active todos due within today's
  local bounds.
- `avgWpm` / `avgRawWpm` — rounded to integers; `avgAccuracy` to one decimal.
- `bestByDuration` — grouped by `duration`, ascending.
- `history` — the latest 30 results, returned **oldest first** for charting.

Empty account: zeros throughout, `bestByDuration: []`, `history: []`, and 7 zero buckets.

401 when unauthenticated.

---

## Status-code summary

| Code | Meaning here |
| :--- | :--- |
| 200 | Success (including `{"success":true}` acknowledgements) |
| 400 | Schema violation, missing title, or unknown blocker id |
| 401 | No/expired session cookie |
| 404 | Row missing **or** owned by another user |
| 409 | Domain conflict: duplicate account, blocked completion, dependency cycle |
| 500 | Unhandled server error (details only in server logs) |

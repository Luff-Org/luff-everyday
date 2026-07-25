# Testing

Owns: the unit suite, what is covered, and the API smoke test.

## Layers

| Layer | Tool | Command | Covers |
| :--- | :--- | :--- | :--- |
| Unit | Vitest | `npm test` | Pure logic: parsers, metrics, sort, zod schemas |
| Types + routes | TypeScript / Next | `npm run build` | Whole-project type check incl. route handler signatures |
| Lint | ESLint | `npm run lint` | `eslint-config-next` flat config |
| End to end (HTTP) | `scripts/smoke-api.mjs` | `npm run smoke` | Every API route against a running server + real DB |

Current status: 4 test files / 19 tests passing, lint clean, build clean, 37/37 smoke checks
passing.

## Unit suite

`npm test` runs `vitest run` over `src/**/*.test.ts`. Config: `vitest.config.ts`. Tests are
colocated with the code they cover:

| File | Covers |
| :--- | :--- |
| `features/todos/lib/todoParser.test.ts` | Quick-add parsing: title extraction, `!priority`, `#tags`, natural-language dates |
| `features/todos/lib/todoSort.test.ts` | `getBucket`, `getDueDateLabel`, `sortByUrgency` |
| `features/todos/validation.test.ts` | Zod schema accept/reject boundaries |
| `features/typing/lib/metrics.test.ts` | `computeFinalStats`, `computeLiveTally`, `computeWpm` |

What belongs here: anything pure and deterministic. Functions that take `now: Date = new
Date()` as a parameter (parser, sort) are written that way *so* they can be tested — keep that
pattern rather than mocking the clock.

What does not: React components (no jsdom/RTL configured), services and repositories (they
need a database — covered by the smoke test instead).

## Smoke test

`scripts/smoke-api.mjs` exercises the real HTTP surface against a real database. It registers
a throwaway credentials user (`smoke_<random>`), runs every route, then deletes that user —
the cascade removes every row it created, so it leaves the database exactly as it found it.

```bash
npm run dev      # terminal 1
npm run smoke    # terminal 2  →  node --env-file=.env scripts/smoke-api.mjs
```

`BASE_URL` overrides the target (default `http://localhost:3000`). Cleanup connects with
`DIRECT_URL` (falling back to `DATABASE_URL`) and retries up to 3 times, because a pooled
Neon connection can be cold. Exit code is non-zero if any check fails.

Checks performed:

- **Auth** — unauthenticated 401; register 200; duplicate email 409; invalid input 400;
  credentials login yields a session with `user.id`.
- **Create** — quick-add parses priority/due date/tags; links attach; explicit title path;
  empty title 400.
- **Dependencies** — set blockers 200; completing a blocked task 409; cycle 409; self-edge
  filtered (200); unknown blocker id 400.
- **Subtasks** — create/patch/delete 200.
- **Recurrence** — completing a `DAILY` todo returns 200 with a spawned `next`; the previously
  blocked task then completes 200.
- **Tags / reorder / list** — 200, and the list reflects the spawned occurrence.
- **Typing** — result saved 200; invalid payload 400.
- **Profile** — 200 with exactly 7 day-buckets and the expected typing totals.
- **Deletes / ownership** — delete 200; unknown id 404 on both `DELETE` and `PATCH`.

### Manual login flow (if scripting something else)

```bash
J=$(mktemp)
CSRF=$(curl -s -c $J http://localhost:3000/api/auth/csrf | sed -E 's/.*"csrfToken":"([^"]+)".*/\1/')
curl -s -b $J -c $J -X POST http://localhost:3000/api/auth/callback/credentials \
  -d "username=you&password=yourpassword&csrfToken=$CSRF&json=true" -o /dev/null
curl -s -b $J http://localhost:3000/api/todos
```

Beware: parsing ids out of a todo response with a greedy `sed` grabs the **last** `"id"` in
the JSON (a nested tag or link), not the todo's. Parse with `node -e`/`jq`, not regex.

## Before opening a PR

```bash
npm test && npm run lint && npm run build
npm run dev &  npm run smoke     # when the change touches API, services, or the schema
```

`npm run build` is the gate that catches route-handler type errors; lint alone will not.

## Gaps worth knowing

- No component or hook tests (no jsdom setup).
- No isolated service/repository tests — service behaviour is only asserted through the smoke
  test, which needs a live database.
- The smoke test asserts status codes and key fields, not full response schemas.
- No CI workflow in the repo; the commands above are run locally.

# Architecture

Owns: folder layout, layering rules, the request lifecycle, import boundaries.

## Shape

Feature-based. Code lives under `src/features/*` and `src/shared/*`. `src/app` holds only
Next.js routing shells — pages are thin, API routes delegate.

```
src/
  app/                        Next routing only
    page.tsx                  landing (3D mascot)
    typing/ todos/ profile/   feature pages
    settings/ login/          app pages
    error.tsx global-error.tsx not-found.tsx unauthorized/
    api/                      route handlers (see api-contracts.md)
  features/
    typing/
      components/             TypingArea, ResultScreen
      store/                  useTypingStore (engine state machine)
      lib/                    words, constants, metrics (pure, tested)
      server/                 test.service, test.repository
      types.ts validation.ts
    todos/
      components/             QuickAddBar, TodoList, TodoItem, TaskDetailDrawer, …
      store/                  useTodoStore (optimistic writes)
      api.ts                  typed HTTP client for /api/todos
      server/                 todo.service, todo.repository, todoInclude
      lib/                    todoParser, todoSort, tagColors (pure, tested)
      types.ts validation.ts
    profile/
      components/             ProfileDashboard, panels, charts, StatTile
      api.ts types.ts
    auth/
      index.ts                NextAuth instance (adapter + credentials)
      config.ts               edge-safe config (no Prisma)
      register.service.ts validation.ts
  shared/
    ui/                       generic presentational (Tooltip, LoadingScreen)
    components/               app-wide (Header, UserMenu, Providers, ThemeProvider,
                              DynamicFavicon, 3d/MascotCat)
    store/                    useThemeStore, useAppFontStore
    lib/                      prisma, http (route helpers), constants, hooks
    types/                    ambient types (next-auth.d.ts)
  proxy.ts                    middleware entry (Next 16 naming)
```

## Layering rules (server)

Every `app/api/**/route.ts` is thin and follows **validate → service → respond**:

```ts
export const POST = route(async (req) => {
  const userId = await requireUser();          // throws HttpError(401) if unauthed
  return todoService.create(userId, await req.json());
});
```

| Layer | File | Responsibility | Must not |
| :--- | :--- | :--- | :--- |
| Route | `app/api/**/route.ts` | Pull `userId`, read params/body, call one service method | Build `NextResponse`, touch Prisma, hold business rules |
| Service | `features/*/server/*.service.ts` | Zod-parse input, ownership checks, domain rules, normalization | Import `next/server`, call Prisma directly |
| Repository | `features/*/server/*.repository.ts` | All Prisma calls, transactions, aggregations | Contain request or business logic |

### `shared/lib/http.ts`

Three exports carry the whole convention:

- `HttpError(status, message)` — thrown by services; carries the HTTP status.
- `requireUser()` — returns the session user id or throws `HttpError(401, "Unauthorized")`.
- `route(handler)` — wraps a handler: JSON-encodes the return value (`?? { success: true }`)
  and maps thrown errors:

| Thrown | Response |
| :--- | :--- |
| `HttpError` | `{ error: message }` at `err.status` |
| `ZodError` | `{ error: "Invalid request", issues: <flatten()> }` at 400 |
| anything else | `{ error: "Internal Server Error" }` at 500, logged via `console.error` |

Handlers therefore return **plain data**, never responses.

## Request lifecycle (authenticated write)

```
POST /api/todos
  │
  ├─ proxy.ts middleware — only guards page routes (/todos, /profile), not /api
  ├─ route(): try { … }
  ├─ requireUser() → auth() → JWT session → userId   (401 if absent)
  ├─ todoService.create(userId, body)
  │    ├─ createTodoSchema.parse(body)                (400 on ZodError)
  │    ├─ parseQuickAdd(raw) when `raw` given         (title/date/priority/tags)
  │    ├─ todoRepository.upsertTagLinks(userId, tags)
  │    └─ todoRepository.create(userId, data)         (include: TODO_INCLUDE)
  └─ NextResponse.json(todo)
```

## Types

`features/todos/types.ts` is the single source of truth for todo shapes, derived from
Prisma rather than hand-written:

```ts
export type TodoWithRelations = Prisma.TodoGetPayload<{ include: typeof TODO_INCLUDE }>;
export type Todo = Serialized<TodoWithRelations>;   // Date → string, the JSON wire shape
export type Subtask = Todo["subtasks"][number];     // relations derived, never redeclared
```

`Serialized<T>` recursively maps `Date → string`, so client code consumes exactly what the
API emits. `TODO_INCLUDE` (`features/todos/server/todoInclude.ts`) is runtime-free, so it is
safe to import from client type positions.

Typing and profile stats types are hand-written interfaces (`features/typing/types.ts`,
`features/profile/types.ts`) because they are aggregation shapes, not table rows.

## Import boundaries

- Alias `@/*` → `src/*`. Use it; no deep relative climbs across features.
- `shared/*` must not import from `features/*` — the one intentional exception is `Header`,
  which renders typing controls and imports `features/typing/lib`.
- Features do not import each other's internals. Cross-feature composition happens in
  `app/` (e.g. `api/profile/route.ts` calls both `todoService` and `testService`) or through
  a feature's public types (`profile/types.ts` imports `TodoStats` / `TypingStats`).
- Feature-specific constants live under the feature (`features/typing/lib/constants.ts`);
  only app-wide constants (themes, fonts, storage keys, chart fallbacks) go in
  `shared/lib/constants.ts`.

## Edge vs Node runtime

Prisma Client cannot run on the Edge runtime, so auth config is split:

- `features/auth/config.ts` — providers/session/pages/callbacks only. Imported by
  `src/proxy.ts` (middleware, Edge).
- `features/auth/index.ts` — extends that config with `PrismaAdapter` and the credentials
  provider. Imported by route handlers and server components (Node).

## Client data flow

```
component → useTodoStore → todosApi (features/todos/api.ts) → /api/todos
```

The store applies an optimistic update, then reconciles or rolls back through its local
`commit()` helper. New HTTP calls belong in `todosApi` / `profileApi`, not inline `fetch`.
Details in [frontend.md](frontend.md).

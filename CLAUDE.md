# CLAUDE.md

Guidance for working in this repo. Keep this current when architecture changes.

## What this is

`luff-everyday` — a Next.js 16 (App Router) + React 19 productivity suite. Two shipped
features: a **typing test** and **smart todos**. Auth via NextAuth v5 (Google + credentials),
data in Postgres via Prisma, client state in Zustand, styling in Tailwind.

## Commands

- `npm run dev` — dev server (Turbopack)
- `npm run build` — `prisma generate && next build` (the full type + route gate)
- `npm run lint` — ESLint (flat config)
- `npm test` — Vitest unit suite (`src/**/*.test.ts`)

## Architecture

Feature-based. Code lives under `src/features/*` and `src/shared/*`; `src/app` holds only
Next routing shells.

```
src/
  app/               Next routing only — pages are thin, API routes delegate to services
  features/
    typing/          components · store · lib (words, constants, metrics)
    todos/           components · store · api (client) · server (repo+service) · validation · types
    auth/            NextAuth instance (index.ts) · config.ts · register.service · validation
  shared/
    ui/              generic presentational (Tooltip, LoadingScreen)
    components/      app-wide (Header, Providers, ThemeProvider, DynamicFavicon, 3d/)
    store/           app-wide Zustand (theme, font)
    lib/             prisma, http (route helpers), constants (theme/font), useHasMounted
    types/           ambient types (next-auth.d.ts)
```

### Layering rules (API)

Every `app/api/**/route.ts` is thin and follows: **validate → service → respond**.

```ts
export const POST = route(async (req) => {
  const userId = await requireUser();          // throws HttpError(401) if unauthed
  return todoService.create(userId, await req.json());
});
```

- `route()` and `requireUser()` live in `shared/lib/http.ts`. `route()` centralizes
  try/catch and maps `HttpError` → its status, `ZodError` → 400, anything else → 500.
  Handlers return **plain data**, never build `NextResponse` themselves.
- **Validation**: zod schemas in `features/*/validation.ts`. Never trust `req.json()` raw.
- **Service** (`features/todos/server/todo.service.ts`): business rules, ownership checks
  (throw `HttpError(404)`), input normalization.
- **Repository** (`features/todos/server/todo.repository.ts`): the only place with Prisma
  calls. No request or business logic.

### Client data flow (todos)

`component → useTodoStore → todosApi (features/todos/api.ts) → /api/todos`. The store applies
optimistic updates and reconciles/rolls back via the local `commit()` helper. Add new HTTP
calls to `todosApi`, not inline `fetch`.

### Types

`features/todos/types.ts` is the single source of truth, **derived from Prisma**
(`TodoWithRelations = Prisma.TodoGetPayload<...>`, then `Serialized<>` for the JSON wire
shape). Don't hand-write duplicate todo/tag/subtask interfaces.

## Conventions

- Import alias: `@/*` → `src/*`.
- Feature-specific constants live under the feature (e.g. `features/typing/lib/constants.ts`);
  only app-wide constants (themes, fonts, storage keys) go in `shared/lib/constants.ts`.
- `shared/*` must not import from `features/*` — except `Header`, which renders typing controls
  and imports `features/typing/lib` intentionally.
- Pure logic (parsers, metrics, sort, schemas) is unit-tested; colocate `*.test.ts` beside it.
- Middleware entry is `src/proxy.ts` (Next 16 naming) — guards `/todos`.

## Notes

- No DB schema changes are needed for typical feature work; schema is in `prisma/schema.prisma`.
- `prisma generate` runs on `postinstall` and in `build`.

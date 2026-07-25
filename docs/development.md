# Development

Owns: local setup, commands, conventions, how to add a feature end to end.

## Prerequisites

- Node.js 20+ (built and verified on Node 24)
- A PostgreSQL database (Neon works out of the box)
- Google OAuth credentials, if you want Google sign-in (credentials login works without them)

## Setup

```bash
npm install                 # postinstall runs `prisma generate`
cp .env.example .env        # fill in the values below
npx prisma migrate deploy   # apply the migration baseline to your database
npm run dev                 # http://localhost:3000
```

### Environment variables

| Variable | Required | Notes |
| :--- | :--- | :--- |
| `DATABASE_URL` | ✅ | Pooled connection, used at runtime |
| `DIRECT_URL` | ✅ | Unpooled connection, used by Prisma Migrate |
| `NEXTAUTH_URL` | prod | Canonical origin; `http://localhost:3000` locally |
| `NEXTAUTH_SECRET` | ✅ | 32+ random chars (`openssl rand -base64 32`) |
| `GOOGLE_CLIENT_ID` | optional | Omit to run with credentials login only |
| `GOOGLE_CLIENT_SECRET` | optional | |

`.env` is gitignored; `.env.example` is the tracked template. Details in
[database.md](database.md) and [auth.md](auth.md).

## Commands

| Command | What it does |
| :--- | :--- |
| `npm run dev` | Dev server (Turbopack) on :3000 |
| `npm run build` | `prisma generate && next build` — the full type + route gate |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint (flat config, `eslint-config-next`) |
| `npm test` | Vitest unit suite (`src/**/*.test.ts`) |

`npm run build` is the real gate: it type-checks the whole project including route handler
signatures. Run it before opening a PR — `lint` alone will not catch a bad `Ctx` type.

Only one dev server can run per project directory; Next refuses a second with "Another next
dev server is already running" and prints the PID to kill.

## Conventions

- **Import alias** `@/*` → `src/*`. Use it across features; relative imports only within the
  same folder.
- **Feature ownership** — new code goes under `src/features/<feature>/`, not `src/app`. `app/`
  holds routing shells only.
- **Constants** — feature-specific under the feature (`features/typing/lib/constants.ts`);
  app-wide (themes, fonts, storage keys) in `shared/lib/constants.ts`.
- **`shared/*` must not import `features/*`** — the sole intentional exception is `Header`,
  which imports `features/typing/lib` to render typing controls.
- **Validation** — zod schemas in `features/*/validation.ts`. Never trust `req.json()` raw.
- **Types** — derive from Prisma (`Prisma.TodoGetPayload`, `Serialized<>`); don't hand-write
  duplicate row interfaces.
- **Tests** — pure logic (parsers, metrics, sort, schemas) is unit-tested with a colocated
  `*.test.ts`.
- **Comments** explain *why*, not *what*; match the density of the file you are editing.

## Adding an API endpoint

1. Schema (if new columns): edit `prisma/schema.prisma`, then
   `npx prisma migrate dev --name <verb_noun>`.
2. Validation: add/extend the zod schema in `features/<feature>/validation.ts`.
3. Repository: add the Prisma call to `features/<feature>/server/*.repository.ts`.
4. Service: add the method — parse input, check ownership (`findOwned` → `HttpError(404)`),
   apply domain rules, call the repository.
5. Route: create `src/app/api/**/route.ts` using `route()` + `requireUser()`; return plain
   data.
6. Client: add the call to the feature's `api.ts`, then wire it into the store with the
   snapshot → optimistic → `commit()` pattern.
7. Document it in [api-contracts.md](api-contracts.md); update [data-model.md](data-model.md)
   if the schema changed.
8. Verify: `npm test && npm run lint && npm run build`, plus a smoke call
   ([testing.md](testing.md)).

## Adding a feature

Create `src/features/<name>/` with the subfolders you actually need
(`components/`, `store/`, `server/`, `lib/`, `api.ts`, `types.ts`, `validation.ts`), then a
thin page under `src/app/<name>/page.tsx`. If the page must be authenticated, add its prefix
to both `PROTECTED_PREFIXES` and `config.matcher` in `src/proxy.ts`, and keep the in-page
session check as a fallback.

## Deployment

Vercel (`vercel.json` present). The build command runs `prisma generate` first.
Apply migrations with `npx prisma migrate deploy` — as a release step or manually before
promoting; `next build` does not migrate. Set `NEXTAUTH_URL` to the production origin and add
`<origin>/api/auth/callback/google` to the Google OAuth client's redirect URIs.

# luff-everyday — Documentation

Reference docs for `luff-everyday`, a Next.js 16 (App Router) + React 19 productivity
suite: a **typing test**, **smart todos**, and a **profile dashboard** over Postgres.

These docs describe the system as it exists in the repo. When behaviour changes, update
the page that owns it — each page states what it owns at the top.

## Index

| Page | Owns |
| :--- | :--- |
| [architecture.md](architecture.md) | Folder layout, layering rules, request lifecycle, import boundaries |
| [data-model.md](data-model.md) | Every table, column, enum, index, cascade rule + ER diagram |
| [api-contracts.md](api-contracts.md) | Every HTTP endpoint: auth, request schema, response shape, status codes |
| [auth.md](auth.md) | NextAuth v5 setup, Google + credentials providers, session strategy, route guarding |
| [frontend.md](frontend.md) | Pages, client state (Zustand), optimistic update protocol, theming/fonts |
| [database.md](database.md) | Migration workflow, env vars, reset procedure, Neon specifics, troubleshooting |
| [development.md](development.md) | Local setup, commands, conventions, adding a feature end to end |
| [testing.md](testing.md) | Unit suite, what is covered, the API smoke-test script |
| [features/todos.md](features/todos.md) | Todo domain rules: quick-add parsing, recurrence, dependencies, tags |
| [features/typing.md](features/typing.md) | Typing engine: state machine, metric math, word buffer |
| [features/profile.md](features/profile.md) | Stats aggregation and dashboard rendering |
| [CHANGELOG.md](CHANGELOG.md) | Notable schema/API changes, newest first |

## System at a glance

```
Browser ──► Next.js App Router (src/app)
              │  pages: thin shells
              │  api:   validate → service → respond
              ▼
        feature services (src/features/*/server)   business rules, ownership checks
              ▼
        feature repositories                       the only Prisma callers
              ▼
        Postgres (Neon) via Prisma 5
```

Auth is NextAuth v5 with a **JWT** session strategy; the Prisma adapter persists
Google-linked accounts. Client state is Zustand with optimistic writes.

## Current state

- Schema: 11 application tables, 3 enums — see [data-model.md](data-model.md).
- Migrations: a single squashed baseline, `prisma/migrations/20260725124525_init`.
- Endpoints: 11 route files under `src/app/api` — see [api-contracts.md](api-contracts.md).
- Verified green: `npm run lint`, `npm test` (19 tests / 4 files), `npm run build`, plus a
  full authenticated API smoke test (see [testing.md](testing.md)).

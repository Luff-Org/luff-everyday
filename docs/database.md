# Database & migrations

Owns: connection setup, migration workflow, reset procedure, Neon specifics, troubleshooting.

Postgres via Prisma 5 (`prisma@5.22.0`, `@prisma/client@5.22.0`). Provider `postgresql`.
Hosted on Neon in this project, but nothing is Neon-specific except the pooled/direct URL pair.

## Connection

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")   // pooled (PgBouncer) — runtime queries
  directUrl = env("DIRECT_URL")     // unpooled — Prisma Migrate only
}
```

Both are required. Migrations need session-level operations (advisory locks, `CREATE TYPE`
in a transaction) that a transaction-mode pooler does not support, hence `directUrl`. On Neon
the direct host is the pooled host with `-pooler` removed:

```
DATABASE_URL="postgresql://user:pw@ep-xxxx-pooler.region.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
DIRECT_URL="postgresql://user:pw@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

`shared/lib/prisma.ts` caches the client on `globalThis` outside production, so Next's dev
hot-reload doesn't leak a new connection pool per reload.

## Migration workflow

| Task | Command |
| :--- | :--- |
| Change the schema, create + apply a migration locally | `npx prisma migrate dev --name <verb_noun>` |
| Apply pending migrations (CI / production) | `npx prisma migrate deploy` |
| Check drift between schema, migrations and DB | `npx prisma migrate status` |
| Regenerate the client only | `npx prisma generate` (also runs on `postinstall` and in `build`) |
| Inspect data | `npx prisma studio` |

Rules:

- Every schema change ships with a migration. Never `prisma db push` against a database that
  has a migration history — it creates drift `migrate deploy` can't reconcile.
- Migration folders are committed (`prisma/migrations/**`, including `migration_lock.toml`).
- Name migrations after the change, e.g. `add_task_detail_fields`, not `update`.

### Current history

A single squashed baseline: `prisma/migrations/20260725124525_init/migration.sql` (206 lines)
— 3 enums, 11 tables, 8 unique/regular indexes, 12 foreign keys, all cascading. It replaced
three incremental migrations (`add_todos`, `add_credentials_auth`,
`add_task_detail_fields`) that were dropped during the 2026-07-25 rebuild.

## Full reset (drops all data)

Destructive: every row in every table is deleted. Only for development databases.

```bash
npx prisma migrate reset --force --skip-seed   # drops the schema, replays migrations
```

To rebuild the history from scratch as well (what the 2026-07-25 rebuild did):

```bash
rm -rf prisma/migrations
npx prisma migrate reset --force --skip-seed   # empty DB, no migrations to replay
npx prisma migrate dev --name init             # fresh single baseline, applied
npx prisma migrate status                      # expect "Database schema is up to date!"
```

If the database is shared with anyone or holds anything you care about, take a Neon branch or
`pg_dump` first — `reset` has no undo.

There is **no seed script**. `prisma/` contains only `schema.prisma` and `migrations/`;
`--skip-seed` is passed for clarity, not necessity.

## Prisma usage rules

- Repositories are the only Prisma callers (`features/*/server/*.repository.ts`). See
  [architecture.md](architecture.md).
- Multi-statement writes that must not half-apply use `prisma.$transaction` — link
  replacement, dependency replacement, reorder, and complete-with-recurrence all do.
- Todo reads go through `TODO_INCLUDE` so the wire shape stays consistent and
  `TodoWithRelations` stays accurate.
- Aggregations (`groupBy`, `aggregate`, `count`) belong in the repository; the service shapes
  the result into the documented stats payload.

## Troubleshooting

**`Can't reach database server at ep-…-pooler…:5432`**
Neon suspends idle compute; the first connection after idle can fail while it wakes, and
long-lived processes keep a dead pool after a compute restart. Two cases:

- One-off script → retry; it succeeds on the second attempt.
- Running dev server → **restart it**. A `prisma migrate reset` restarts the Neon compute and
  invalidates the connection pool the dev server cached, which surfaces as every API route
  returning 500 with this message until restart.

**`The table "public"."X" does not exist`**
The client is generated from a schema newer than the database. Run
`npx prisma migrate status`, then `migrate dev` (local) or `migrate deploy`.

**`Drift detected: your database schema is not in sync with your migration history`**
Something changed the DB outside Migrate (usually a stray `db push`). In development, reset.
In production, write a corrective migration — never reset.

**Enum / type errors after editing `schema.prisma`**
`npx prisma generate`, then restart the dev server and the TypeScript server; Prisma's types
are generated into `node_modules/@prisma/client`.

**`prisma migrate` hangs or reports a lock**
Two migrate processes are racing, or a previous run died holding the advisory lock. Wait for
the timeout, verify with `migrate status`, and confirm `DIRECT_URL` is unpooled — pointing it
at the pooler is the usual cause.

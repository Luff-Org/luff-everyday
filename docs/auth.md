# Auth

Owns: NextAuth v5 wiring, providers, session strategy, route guarding, registration.

Package is `next-auth@5.0.0-beta.32` (Auth.js v5) plus `@auth/prisma-adapter`.

## Two configs, one reason

Prisma Client cannot run on the Edge runtime, and middleware runs on Edge. So the config is
split:

| File | Contents | Imported by |
| :--- | :--- | :--- |
| `features/auth/config.ts` | providers (Google), `session.strategy = "jwt"`, `pages.signIn = "/login"`, `session` callback | `src/proxy.ts` (Edge middleware) |
| `features/auth/index.ts` | spreads `authConfig`, adds `PrismaAdapter(prisma)` and the Credentials provider; exports `handlers`, `auth`, `signIn`, `signOut` | route handlers, server components, `requireUser()` |

Importing `features/auth` (the Node one) from middleware would break the build — keep the
split.

## Session strategy: JWT

```ts
session: { strategy: "jwt" }
callbacks: {
  async session({ session, token }) {
    if (session.user && token.sub) session.user.id = token.sub;
    return session;
  },
}
```

Consequences worth knowing:

- The `Session` table exists (the adapter defines it) but is **never written** — sessions live
  in the signed cookie.
- `session.user.id` exists only because of that callback; it comes from `token.sub`. The
  ambient type is declared in `src/shared/types/next-auth.d.ts`.
- The credentials provider requires JWT sessions in Auth.js v5 — database sessions are not
  supported for it.
- Revocation is not immediate: a JWT stays valid until expiry (30 days by default).

## Providers

### Google OAuth

`GoogleProvider({ clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET })`.
The Prisma adapter persists the `User` + `Account` rows on first sign-in. Redirect URI to
register with Google: `<origin>/api/auth/callback/google`.

### Credentials (username + password)

Defined in `features/auth/index.ts`:

1. `username` is trimmed + lowercased; empty username or password → `null` (rejected).
2. `prisma.user.findUnique({ where: { username } })`.
3. Reject when the user has no `password` (OAuth-only account).
4. `bcrypt.compare(password, user.password)`.
5. On success return `{ id, name, email, image }` — the id becomes `token.sub`.

Failures always return `null`, so Auth.js reports the generic `CredentialsSignin` error; the
login page maps it to "Invalid username or password." No enumeration of which half was wrong.

## Registration

`POST /api/auth/register` → `registerUser()` in `features/auth/register.service.ts`.

```
validate (registerSchema, safeParse → first message)
  → email taken?      409 (message differs for OAuth-only accounts)
  → username taken?   409
  → bcrypt.hash(password, 12)
  → prisma.user.create({ username, email, password })
  → { success: true }
```

Registration does **not** sign the user in; the login page calls
`signIn("credentials", …)` right after a successful register.

Rules (`features/auth/validation.ts`): username `^[a-z0-9_]{3,20}$` after
trim+lowercase, email regex `^[^\s@]+@[^\s@]+\.[^\s@]+$` after trim+lowercase, password ≥8
chars.

## Account-linking behaviour

`User.email` is unique, so one email = one account. Consequences:

- Registering an email that already exists as a Google account → 409 with "Sign in with
  Google instead."
- Signing in with Google using an email that exists as a credentials account → Auth.js
  refuses with `OAuthAccountNotLinked`; the login page renders "This email is already
  registered with a password. Sign in with username and password instead."

There is no linking flow. Adding one would mean handling `signIn` callbacks explicitly.

## Route protection

### Middleware — `src/proxy.ts`

Next 16 names the middleware entry `proxy.ts` (not `middleware.ts`).

```ts
const PROTECTED_PREFIXES = ["/todos", "/profile"];
export const config = { matcher: ["/todos/:path*", "/profile/:path*"] };
```

Unauthenticated requests to those pages are redirected to
`/login?callbackUrl=<pathname>`. The matcher does **not** cover `/api/*`.

### API routes

Each handler calls `requireUser()` (`shared/lib/http.ts`), which resolves `auth()` and throws
`HttpError(401)` when `session.user.id` is missing. This is the only API auth gate — do not
rely on middleware for API protection.

### Pages, second line of defence

- Client pages (`/todos`) check `useSession().status` and `router.replace("/login?…")` if the
  session expires mid-visit.
- Server pages (`/profile`) `await auth()` and `redirect("/login?callbackUrl=/profile")`.

Both are belt-and-braces behind middleware; keep them when adding protected pages.

## Environment variables

| Variable | Purpose |
| :--- | :--- |
| `NEXTAUTH_URL` | Canonical origin. Auto-detected on Vercel, but set explicitly in production |
| `NEXTAUTH_SECRET` | JWT signing secret; 32+ random chars |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth credentials |

The project deliberately keeps the legacy `NEXTAUTH_*` / `GOOGLE_CLIENT_*` names instead of
v5's `AUTH_*` convention, because `config.ts` passes them explicitly rather than relying on
auto-detection. Renaming them would silently break Google sign-in.

## Client-side session access

`shared/components/Providers.tsx` mounts `SessionProvider`; components use
`useSession()`. `UserMenu` / `Header` read `session.user` for the avatar and menu, and call
`signOut()`.

## Cookie names (useful for scripted testing)

`authjs.session-token` over HTTP, `__Secure-authjs.session-token` over HTTPS, plus
`authjs.csrf-token`. A scripted login is: `GET /api/auth/csrf` → `POST
/api/auth/callback/credentials` with `username`, `password`, `csrfToken`, `json=true`,
carrying cookies forward. Working example in [testing.md](testing.md).

# Frontend

Owns: pages, client state, the optimistic-update protocol, theming and fonts.

Next.js 16 App Router, React 19, Tailwind CSS 3, Framer Motion, Zustand 4, Chart.js, Sonner
toasts, `lucide-react` icons, React Three Fiber for the mascot.

## Routes

| Route | Rendering | Notes |
| :--- | :--- | :--- |
| `/` | static | Landing page + 3D cat mascot (`shared/components/3d/MascotCat.tsx`) |
| `/typing` | static, client store | Typing test; swaps `TypingArea` ↔ `ResultScreen` on `status` |
| `/todos` | client | Guarded by middleware; fetches todos + tags on `authenticated` |
| `/profile` | dynamic (server) | `await auth()`, streams panels inside `<Suspense>` |
| `/settings` | static, client | Theme + font pickers |
| `/login` | static, client | Sign-in / sign-up toggle, Google button, error mapping |
| `/unauthorized` | static | Fallback page |
| `error.tsx`, `global-error.tsx`, `not-found.tsx` | — | App-level error/404 shells |

`src/app/layout.tsx` mounts `Providers` (SessionProvider), `ThemeProvider`,
`DynamicFavicon`, `Header`, and Sonner's `<Toaster />`. It also derives a native
`color-scheme` per theme from background luminance, so native selects/date pickers/scrollbars
match the palette.

Pages stay thin: they wire hooks/params and compose feature components. Feature logic lives
under `src/features/*`.

## Client state (Zustand)

| Store | Scope | Persisted |
| :--- | :--- | :--- |
| `features/todos/store/useTodoStore.ts` | todos, tags, `filter`, `tagFilter`, `isLoading`, `hasLoaded` | no (server is the source) |
| `features/typing/store/useTypingStore.ts` | typing engine state machine | no |
| `shared/store/useThemeStore.ts` | active theme id | localStorage `luff-theme-storage` |
| `shared/store/useAppFontStore.ts` | active font id | localStorage `luff-app-font-storage` |

Subscribe with **granular selectors** (`useTodoStore((s) => s.fetchTodos)`), not whole-store
destructuring — `Header` was re-rendering on every store change before this was fixed.

## Data flow

```
component → useTodoStore → todosApi (features/todos/api.ts) → /api/todos
component → profileApi  (features/profile/api.ts)          → /api/profile
```

`api.ts` per feature is the only place that talks HTTP. It sets `Content-Type` when a body is
present and throws `Error("Request to <url> failed (<status>)")` on non-2xx. Add new calls
there — no inline `fetch` in components or stores.

## Optimistic update protocol

Every mutating store action follows the same three steps, using the local `commit()` helper:

```ts
const snapshot = get().todos;          // 1. capture
set({ todos: /* optimistic next state */ });   // 2. apply immediately
await commit(
  snapshot,
  () => todosApi.update(id, patch),   // 3. send
  "Couldn't update that todo.",       //    on failure: restore snapshot + toast.error
  (updated) => set(/* reconcile with server row */),
);
```

`commit()` restores the whole `todos` array on failure — actions must therefore snapshot
before mutating, and must not interleave two independent optimistic writes that both expect
to roll back to different baselines.

### Temp ids

A newly created todo/subtask gets `temp-${crypto.randomUUID()}` until the server responds.
`isTempId()` gates actions that need a real id:

- `toggleComplete`, `updateTodo`, `addSubtask`, `toggleSubtask` on a temp id → `toast.info`
  ("Still saving that todo, try again in a moment.") and return.
- `deleteTodo` / `deleteSubtask` on a temp id → remove locally, skip the request.

This is what prevents the create-then-immediately-act race.

### Relations are server-reconciled

`updateTodo` strips `tags`, `links` and `dependsOn` from the local patch — their wire shape
differs from the patch shape (names/ids need resolving server-side). Scalars apply locally;
relations arrive with the server response, which replaces the row.

## Todos UI composition

| Component | Role |
| :--- | :--- |
| `QuickAddBar` | Free-text quick add; parses locally for instant feedback and sends `raw` |
| `FilterTabs` | `all` / `today` / `upcoming` / `completed` |
| `TagFilterChips` | Single-tag filter, colours from `Tag.color` |
| `TodoList` | Applies filter + `sortByUrgency`, renders items |
| `TodoItem` | Row: checkbox, title, `PriorityBadge`, `DueDateLabel`, `TagChip`s, subtask expander |
| `SubtaskList` | Inline add/toggle/delete of subtasks |
| `TaskDetailDrawer` | Full editor: notes, dates, estimate, energy, context, location, links, blockers, recurrence |
| `DateTimePicker` | `react-day-picker` based date + time selection |
| `EmptyState` | Zero-state per filter |

Sorting/labelling logic is pure and tested: `features/todos/lib/todoSort.ts`
(`getBucket`, `getDueDateLabel`, `sortByUrgency`) — see [features/todos.md](features/todos.md).

## Typing UI

`TypingArea` renders the word buffer with a character-following caret and drives the store
(`inputChar`, `deleteChar`, `inputSpace`, `tick`). `ResultScreen` shows the WPM/accuracy
summary plus a Chart.js line chart of `wpmHistory`, and posts the result to `/api/tests` when
signed in. Keyboard: any key starts, `Shift+Enter` restarts, `Esc` resets.

## Profile UI

`/profile` is a server component: it authenticates, renders `ProfileHeaderCard` immediately,
and streams `ProfileDashboard` (which awaits the aggregations) inside `<Suspense
fallback={<ProfileSkeleton />}>`. Panels: `TypingStatsPanel`, `TodoStatsPanel`,
`TypingTrendChart`, with `StatTile` for individual metrics.

## Loading states

Every placeholder is built from `shared/ui/Skeleton.tsx`:

- `<Skeleton>` — one block. Styled by the `.skeleton` class in `globals.css`: base fill and
  sweep highlight are both derived from the theme's `--sub-text` / `--foreground` / `--primary`
  via `color-mix`, so skeletons re-tint with the theme instead of hard-coding greys. `accent`
  switches the fill to the primary colour; `delay` offsets the sweep so sibling rows animate as
  a wave. `prefers-reduced-motion` drops the sweep and leaves a static tint.
- `<SkeletonScreen label>` — wraps a group as one `role="status" aria-busy` live region.
  Individual blocks are `aria-hidden`, so assistive tech hears one message, not N boxes.

**Rule: a skeleton mirrors the box model of the thing it replaces** — same padding, radius,
border and fixed heights — so the swap causes no layout shift. Any randomness (bar widths,
chart silhouettes) must come from a fixed table, never `Math.random()`, or server and client
markup diverge.

Where each lives:

| Placeholder | Mirrors |
| :--- | :--- |
| `app/typing/loading.tsx` → `TypingSkeleton` | `TypingArea` (3.5rem line rows, 14rem viewport, 40px timer slot) |
| `app/todos/loading.tsx` → `TodoSkeletonList` | `TodoItem` rows; used in-page by `TodoList` |
| `app/todos/loading.tsx` (default) | the whole todos screen, for route transitions |
| `features/profile/components/ProfileSkeleton.tsx` | `StatTile`, `TypingStatsPanel`, `TodoStatsPanel` |
| `app/settings/loading.tsx` | one chip per real `APP_FONTS` / `THEMES` entry |

Loaders are scoped as tightly as the data allows. `/todos` renders its title, `QuickAddBar` and
`FilterTabs` immediately — none of them need server data — and skeletons only the list.
`TodoList` gates on the store's `hasLoaded`, not `isLoading`, so the empty state can't flash in
the render before the first request starts.

## Theming and fonts

`shared/lib/constants.ts` holds 32 `ThemeDef`s (`bg`, `primary`, `sub`, `fg`, `error`) and 20
`FontDef`s. Tailwind classes reference the theme's CSS custom properties (`text-primary`,
`text-sub-text`), which `layout.tsx` emits as one class-per-theme stylesheet.

### Opacity modifiers need `<alpha-value>`

`tailwind.config.ts` maps each colour through
`color-mix(in srgb, var(--x) calc(<alpha-value> * 100%), transparent)`, **not** a bare
`var(--x)`. Tailwind cannot split a bare `var()` into channels, so with the plain form every
opacity modifier (`bg-card-bg/30`, `text-sub-text/50`) silently compiles to *no CSS at all* —
the utility just vanishes from the stylesheet. If you add a theme colour, use the `alpha()`
helper in that config; don't write `var(--x)` directly.

### Contrast is enforced, not hand-tuned

Palettes are authored for character, and an audit found 23/32 themes with `sub` under 3:1
against their own background (lowest 1.3:1), 4 with an unreadable `fg`, and 9 with unreadable
primary buttons. So `layout.tsx` runs every text-role colour through `readableOn()`
(`shared/lib/contrast.ts`) before emitting it: `fg` and `primary` to 4.5:1, `sub` and `error`
to 3:1. `primary` gets the higher floor because it doubles as a button *fill* under
`text-background`, and contrast is symmetric. Colours already clearing their floor pass
through byte-identical.

Add a theme by dropping a `ThemeDef` into `THEMES` — no contrast hand-checking needed, and
`contrast.test.ts` asserts the floors hold for every shipped theme. Note `DynamicFavicon` and
`MascotCat` read the *raw* `THEMES` hex values, which is intentional: neither renders text.

`--card-bg` / `--card-border` are likewise derived (`color-mix` of the corrected `fg` over
`bg`, at 11% and 30%) rather than reusing `--background` (identical to the page, so surfaces
disappear) or `--sub-text` (too close to `bg` in the dark themes). Todo cards deliberately use
only `--card-border` on a transparent fill — a filled surface was tried and rejected as too
heavy; `--card-bg` remains in use for the typing `<kbd>` chips and toast borders.

**First paint is set before React runs.** A small inline script in `<head>` reads the same
localStorage keys the zustand stores persist to (`STORAGE_KEYS`) and stamps the theme class and
`--app-font` onto `<html>`. `ThemeProvider` then only applies *changes* made after hydration.
This replaced an older approach that hid the entire tree until mounted; don't reintroduce it —
the script is what makes the correct theme available on the first frame. `<html>` carries
`suppressHydrationWarning` because that script mutates its attributes.

The ~25 picker font families are loaded from Google Fonts via a `media="print"` `<link>` that
the same script promotes to `media="all"` on load, keeping it off the critical path. It is
deliberately *not* an `@import` in `globals.css` — that blocks rendering. `DynamicFavicon`
redraws the favicon in the active palette. Defaults: theme `dark-luff`, font `app-system`
(unset falls through to the self-hosted next/font Inter).

Chart.js cannot read CSS variables, so `shared/lib/useChartColors.ts` reads the computed
values after mount (re-running on theme change) and falls back to `CHART_FALLBACK_COLORS`
during SSR.

## Hydration

Theme and font no longer need a mount gate — the pre-paint script handles them (see above).
The one remaining use of `shared/lib/useHasMounted.ts` is `/typing`: the word buffer is
generated randomly at store init, so server and client markup can't match, and the page shows
`TypingSkeleton` until hydration.

`Providers` mounts `SessionProvider` and nothing else. It must not gate rendering on
`useSession()`: routes needing auth are already guarded by `src/proxy.ts`, and the header's
`AuthSlot` reserves its own footprint while the session resolves, so blocking the tree only
ever added latency.

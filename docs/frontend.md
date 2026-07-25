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
| `features/todos/store/useTodoStore.ts` | todos, tags, `filter`, `tagFilter`, `isLoading` | no (server is the source) |
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

## Theming and fonts

`shared/lib/constants.ts` holds 32 `ThemeDef`s (`bg`, `primary`, `sub`, `fg`, `error`) and 20
`FontDef`s. `ThemeProvider` writes the active theme's colours to CSS custom properties
(`--primary`, `--sub-text`, `--error`, …) on `document.body`; Tailwind classes reference those
variables (`text-primary`, `text-sub-text`). `DynamicFavicon` redraws the favicon in the
active palette. Defaults: theme `dark-luff`, font `app-system`.

Chart.js cannot read CSS variables, so `shared/lib/useChartColors.ts` reads the computed
values after mount (re-running on theme change) and falls back to `CHART_FALLBACK_COLORS`
during SSR.

## Hydration

Anything that depends on persisted client state renders a placeholder until mounted, via
`shared/lib/useHasMounted.ts` — `/typing` shows "Loading workspace…", `/todos` renders an
empty shell. Skipping this reintroduces theme/font hydration mismatches.

# Feature: typing test

Owns: the typing engine — state machine, word buffer, metric math, result persistence.

Code: `src/features/typing/**`, route `src/app/api/tests/route.ts`, page `src/app/typing/page.tsx`.

## State machine

`features/typing/store/useTypingStore.ts`, status ∈ `idle | typing | finished`.

```
idle ──first keypress (inputChar/inputSpace calls start())──► typing
typing ──tick() reaches timeLeft 0 ──► finished   (finish() also callable directly)
finished ──reset()──► idle (regenerates the word buffer)
```

State: `originalWords`, `typedWords`, `currentWordIndex`, `currentWordInput`, `duration`,
`timeLeft`, `startTime`, `endTime`, `wpmHistory`, and the four character counters
(`correctChars`, `incorrectChars`, `missedChars`, `extraChars`).

Input actions: `inputChar` (blocked once the word exceeds its length + `MAX_EXTRA_CHARS`),
`deleteChar` (backspaces into the previous word, restoring what was typed), `inputSpace`
(commits the current word; ignored on an empty input). `tick` is driven by a 1s interval from
the component.

## Word buffer

`features/typing/lib/words.ts` generates from a fixed word list. `WORD_BATCH_SIZE` (100) words
at a time; when the cursor comes within `WORD_PREFETCH_THRESHOLD` (20) words of the end,
another batch is appended — so the test never runs out mid-flow.

## Constants

`features/typing/lib/constants.ts`: `WORD_BATCH_SIZE` 100, `MAX_EXTRA_CHARS` 5,
`WORD_PREFETCH_THRESHOLD` 20, `DURATION_OPTIONS` `[15, 30, 60, 120]`, `DEFAULT_DURATION` 30,
`LINE_HEIGHT_PX` 56 (used for typing-area scroll math).

## Metric math

`features/typing/lib/metrics.ts` — pure, no React/store imports, unit-tested.

| Function | Purpose |
| :--- | :--- |
| `computeFinalStats` | Full tally over completed words + the in-progress word: `correct`, `incorrect`, `extra` (typed past a word's length), `missed` (word left short). Counts one correct char per inter-word space |
| `computeLiveTally` | Cheaper per-tick tally: only chars actually typed, capped at each word's length; ignores extra/missed |
| `computeWpm` | Standard 5-chars-per-word: `wpm = correct/5/minutes`, `rawWpm = (correct+incorrect)/5/minutes`; both rounded, `0` when no time has elapsed |

Two tallies exist on purpose: the live one keeps ticks cheap and monotonic, the final one is
strict about extra/missed characters for the result screen. They therefore disagree slightly at
the boundary — that's expected, not a bug.

`wpmHistory` accumulates `{ time, wpm, rawWpm, err }` per second, where `err` is *new* errors
this tick (previous total subtracted, floored at 0), so the result chart can plot mistakes as
discrete events. `finish()` appends a final point at `time === duration` if the last tick
didn't land there.

## Result persistence

`ResultScreen` posts to `POST /api/tests` when a session exists (`{ wpm, rawWpm, accuracy,
duration }`); anonymous runs are simply not saved. Server side:
`testService.createResult` parses `testResultSchema` (wpm/rawWpm non-negative ints, accuracy
0–100, duration positive int) and `testRepository.create` inserts a `TestResult`.

Accuracy is computed client-side from the final tally and sent as a float; the server stores it
as given (`Float`) and does not recompute it.

## Stats

`testService.stats(userId)` feeds `/api/profile` with three parallel queries:
`aggregate` (count, max wpm, avg wpm/rawWpm/accuracy), `groupBy duration` (best wpm per
duration, ascending), and the latest 30 results reversed to oldest-first for the trend chart.
Averages are rounded (accuracy to one decimal). Shape in
[../api-contracts.md](../api-contracts.md).

## UI

`TypingArea` renders the buffer with per-character correct/incorrect/extra styling and a
character-following caret, and owns the timer interval. `ResultScreen` shows the summary plus a
Chart.js line chart (WPM + raw WPM + error markers) coloured from live theme variables via
`shared/lib/useChartColors.ts`.

Keyboard: any key starts the test, `Shift+Enter` restarts, `Esc` resets. Duration is selected
from the header controls (`Header` imports `features/typing/lib` — the one sanctioned
`shared → features` import).

## Extending

- New duration: add to `DURATION_OPTIONS`. Nothing else changes — `duration` is stored as an
  int and `bestByDuration` groups dynamically.
- New metric on the result screen: derive it in `metrics.ts` with a colocated test. Only add a
  column to `TestResult` if the profile dashboard needs it historically — the result screen can
  compute anything from store state for free.
- Word lists / languages: `features/typing/lib/words.ts`; keep generation pure so the store
  stays testable.

# Stage 5b Review — Highland Games Tracker v2 Progress Page Lifts View

gpt review pass, 2026-05-24 — the S&C lifts view on the Progress page,
and the Throws / Lifts toggle.

## Findings by severity

### Critical

None found.

### Major

**1. `topSessionBestsInWindow()` includes future-dated sessions in "Best 3."**

File/function: `shared.js` → `topSessionBestsInWindow()`

The Stage 5b spec defines Best 3 as the top three session-bests "within
the rolling last 365 days," and the acceptance criteria require Best 3
to show "the top 3 session-bests of the last 365 days."

The helper computes a cutoff with `isoDaysBefore(today, days)` and
excludes sessions older than the cutoff, but it does not exclude
sessions dated after `todayIso`. The effective filter is:

```js
if (typeof session.date !== 'string' || session.date < cutoff) continue;
```

So a future-dated session, whether from a typo or imported data,
qualifies for Best 3 and can displace real recent marks.

Why it matters: Best 3 can misrepresent current progress by including a
session outside the rolling 365-day window. This is a correctness
issue, not just polish.

Suggested fix:

```js
if (
  typeof session.date !== 'string' ||
  session.date < cutoff ||
  session.date > today
) continue;
```

Add a regression test with a future-dated high mark and confirm it is
excluded.

### Minor

None found.

### Nit

None found.

## Checks that passed

- The Progress page has the top-level Throws / Lifts toggle, opens on
  Throws, keeps the Throws window filter visible by default, and hides
  the Lifts mode selector until the Lifts side is selected.
- `progress.js` swaps the visible view and secondary control correctly
  in `setSide()`, and the Lifts side renders through `renderLifts()`
  using only active `userLifts`.
- The direction-aware percentage helper is implemented correctly for
  higher-is-better and lower-is-better / time cases: higher uses
  `best / pr`, time uses `pr / best`, and both clamp at 100 with
  below-PR values capped at 99.
- Snapshot mode uses `mostRecentLiftMark()`, which walks chronologically
  sorted sessions from newest to oldest and takes the direction-aware
  best attempt from the latest session containing that lift.
- Best 3 correctly uses session-bests rather than pooled attempts: each
  qualifying session contributes one direction-aware best, then the
  helper sorts and takes three. The only issue is the missing upper
  date bound noted above.
- The test suite covers the main Stage 5b contracts: direction-aware
  percentages, Snapshot selection including time / min behavior, Best 3
  session-best behavior, 365-day cutoff boundary, fewer-than-3
  sessions, active-lift filtering, empty states, and toggle behavior.

## Verdict

**Ship after fixes** — no Critical finding, but fix the Best 3
future-date inclusion before shipping Stage 5b.

---

## Resolution

The Major was fixed by ccode in commit `61fc5d2` — `topSessionBestsInWindow`
now bounds the window at both ends (`session.date > today` added to the
skip condition), with two regression tests: a future-dated high mark is
excluded, and a session dated exactly today still qualifies. The full
browser suite ran 348/348. A Major triggers no re-review under the
Higgins Method; Stage 5b shipped, tagged `v2.0.0-stage5b`.

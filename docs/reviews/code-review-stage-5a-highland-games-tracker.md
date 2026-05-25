# Code Review — Stage 5a Highland Games Tracker

**Project:** Highland Games Tracker v2  
**Stage:** 5a — Progress page for throws  
**Reviewer:** gpt / Mimir  
**Builder:** ccode  
**Skill level:** L1 — Supported  
**Project risk:** Normal — low  
**Verdict:** Fix-and-re-review

## Scope reviewed

This was an independent review of the Stage 5a build against the Higgins Method one-pass review rule and the Stage 5a acceptance criteria. The review focused on the new throws-only Progress page, especially:

- Window selection: Last session, Past 3 sessions, Year to date.
- Best-in-window calculation across all attempts in the selected sessions.
- Percentage calculation against PR, including the 99% cap below PR.
- Empty state handling.
- Navigation relink from See the Gap to Progress.
- Keeping the page throws-only, with S&C lifts deferred to Stage 5b.
- Ensuring Stage 5a remains read-only and does not affect unrelated app areas.

---

## Findings by severity

## Critical

### 1. `percentOfPr()` can display over 100%, violating the Stage 5a percentage invariant.

**File/function:** `shared.js` → `percentOfPr(best, pr)`

The Stage 5a spec says the Progress percentage should be capped so that a displayed `100%` means the best-in-window equals the PR. The review prompt also calls out the expectation that the percentage should never exceed `100%`.

The helper currently follows this shape:

```js
const rounded = Math.round(pct);
return best < pr ? Math.min(99, rounded) : rounded;
```

That correctly handles the “just below PR” case, but it does **not** handle `best > pr`. If `best = 500` and `pr = 400`, the helper returns `125`. `progress.js` then renders `125%`, while only clamping the visual bar width to `100%`.

Why it matters: the page can show progress above `100%`, and it marks `pct >= 100` as “at-or-past,” even though the spec wants `100%` to mean exact PR equality. This is especially worth guarding because the tests only prove the normal invariant case where the PR is already the all-time max; they do not test `best > pr`.

**Suggested fix:** make `percentOfPr()` enforce the display invariant directly.

Recommended version:

```js
function percentOfPr(best, pr) {
  if (!Number.isFinite(best) || !Number.isFinite(pr) || pr <= 0) return null;
  if (best === pr) return 100;
  return Math.min(99, Math.round((best / pr) * 100));
}
```

That keeps the user-facing rule simple: **only exact PR equality displays `100%`.**

---

## Major

None found.

---

## Minor

### 1. Test coverage does not directly exercise the rendered Progress empty state.

**Files:** `tests.html`, `tests.js`, `progress.js`

The spec says tests should cover an event with no marks in the selected window yielding the empty state. The current tests cover `bestMarkInSessions()` returning `null` as an empty-state trigger, but they do not load `progress.js` in `tests.html`, so they do not directly test that `buildProgressRow()` renders `"no marks logged"`.

The implementation itself does render `"no marks logged"` when `best === null || pct === null`, so this is a coverage gap, not a functional defect.

---

## Nit

None found.

---

## Checks that passed

- `progress.html` exists and loads `shared.js` and `progress.js`.
- The Progress page has the three required window controls: Last session, Past 3 sessions, Year to date.
- The default active UI state is Past 3 sessions.
- The core window and best-in-window helpers are pure and live in `shared.js`.
- `sessionsInWindow()` handles `last`, `past3`, and `ytd`.
- `bestMarkInSessions()` scans finite attempts across selected sessions and returns the value plus date.
- The nav relink is correct in the checked pages: `index.html`, `session.html`, `tests.html`, and `progress.html` all point to `progress.html` and label it “Progress.”
- The page remains throws-only, with no S&C view and no Throws/Lifts toggle, which is expected for Stage 5a.

---

## Verdict

**Fix-and-re-review** — one Critical finding: `percentOfPr()` does not fully enforce the Stage 5a “percentage never exceeds 100 / 100 means PR equality” acceptance rule.

# Highland Games Tracker — Stage 5a Spec Sketch (v1)

**Date:** 2026-05-22
**Skill level:** L1 — Supported
**Project risk:** Normal — low (a read-only display page; writes no data)
**Repo:** `~/dev/highland-games-tracker` — on `main`, tagged `v2.0.0-stage4c`
**Design source:** `v2-plan.md` (Stage 5 section · Storage schema v2) · this session's resolved decisions (2026-05-22 — the Stage 5 5a/5b split and the Progress-page design)

---

## What this is

Stage 5 of the Highland Games Tracker v2 build, **split into two** (see "Why Stage 5 is split"). This is **Stage 5a** — the **Progress page** for throws.

Stage 5 replaces v1's "See the Gap" with a Progress page: a "where am I now, against my PR" view. 5a builds that page for the **throws** — for each throw event, the best mark inside a chosen time window, shown as a percentage of the PR. The **S&C lifts** view, and the Throws/Lifts toggle that switches to it, are **Stage 5b**.

`v2-plan.md` holds the full design (the Stage 5 section, the v2 storage schema). Read it alongside this sketch.

## Why Stage 5 is split (5a / 5b)

`v2-plan.md` scoped Stage 5 as a single page — a windowed vs-PR comparison. In planning (2026-05-22) it grew: throws and S&C lifts have different logging cadences — throws every session, S&C only on notable sessions — so a single session-window filter does not serve both. The decision: the Progress page carries an in-page **Throws / Lifts toggle**, each side with its own logic. That is two distinct views, and it splits cleanly — the same way Stage 3 and Stage 4 were split:

- **5a — the Progress page (throws).** The windowed vs-PR comparison for the eight throws — essentially `v2-plan.md`'s Stage 5 as written. Replaces See the Gap. Independently shippable. *(This sketch.)*
- **5b — the lifts view.** The Throws / Lifts toggle, plus the lifts view with its two modes — Snapshot (most-recent mark vs PR) and Best 3 (the top three marks of the rolling last 365 days vs PR).

5a is the smaller, v2-plan-scoped piece and ships first; 5b adds the lifts dimension.

## Stage 5a scope — the buildable chunk

1. **A new Progress page** (`progress.html`, `progress.js`). The page replaces See the Gap. `gap.html` and `gap.js` are **retired** — deleted — and the page is rebuilt fresh as `progress.html` / `progress.js` (Resolved decision 2).

2. **The window filter** (`progress.html`, `progress.js`). One in-page control at the top of the page — a segmented filter with three windows, the same control pattern as the existing competition/training filters elsewhere in the app:
   - **Last session** — the single most recent session.
   - **Past 3 sessions** — the three most recent sessions (fewer if fewer exist).
   - **Year to date** — sessions dated on or after January 1 of the current calendar year.
   Default selection: **Past 3 sessions**. The filter replaces v1 See the Gap's competition/training/all filter.

3. **A vs-PR row per throw** (`progress.js`). For each of the eight throw events (the `ITEMS` throws), a row showing: the event name; the **best mark within the selected window** — the max across all attempts of all in-window sessions for that event; the **PR** (`prs[event]`); and the **percentage of PR** — `round(bestInWindow / prs[event] × 100)` — with a progress bar. The best mark's **date** is shown inline alongside it.

4. **Empty state** (`progress.js`). A throw event with no marks in the selected window shows **"no marks logged"** in place of the percentage and bar. If no sessions exist at all, every row reads "no marks logged."

5. **The nav rename** (`index.html`, `session.html`, `tests.html`, `progress.html`). The nav entry **"See the Gap" becomes "Progress"**, and every page's nav link to `gap.html` is repointed to `progress.html`.

6. **Pure window / percentage helpers** (`shared.js`). The window selection (which sessions fall in Last / Past 3 / Year-to-date), the best-in-window computation, and the percentage are pure, DOM-free helpers in `shared.js` — unit-testable like `formatLiftMark`, `detectMilestones`, and `recomputeDerivedState`. `progress.js` stays a thin rendering layer over them.

7. **Tests** (`tests.js`). Cover: the three window selections — Last / Past 3 / Year-to-date, including the YTD calendar-year boundary and the fewer-than-3-sessions case; best-in-window as the max across in-window sessions; the percentage; an event with no marks in the window yielding the empty state.

## Acceptance criteria

Stage 5a is done when all of these are true:

- [ ] A `progress.html` / `progress.js` Progress page exists, and `gap.html` / `gap.js` are gone.
- [ ] The page shows one row per throw event — event name, the best mark in the selected window with its date, the PR, and the percentage of PR with a bar.
- [ ] The window filter offers Last session / Past 3 sessions / Year to date, defaults to Past 3 sessions, and changing it recomputes every row.
- [ ] Best-in-window is the maximum mark across all in-window sessions for that event; the percentage is `bestInWindow / prs[event]`, rounded.
- [ ] An event with no marks in the window reads "no marks logged"; a no-sessions state reads "no marks logged" on every row.
- [ ] The nav reads "Progress" and links to `progress.html` from every page.
- [ ] The window / best / percentage logic lives in pure `shared.js` helpers with test coverage (scope point 7).
- [ ] `version` stays `2`; the Set page, Log Session, the celebration system, and the profile modal are unaffected.

## Explicitly NOT in Stage 5a

- The **S&C lifts view** and the **Throws / Lifts toggle** — **Stage 5b.**
- **Goals as a percentage.** `v2-plan.md` deliberately removed the goal comparison from this page — goals' home is the celebration system. The Progress page is vs-**PR** only.
- The **tap-a-percentage-for-when-and-where detail panel** that v1's See the Gap carried. 5a shows the best mark's date inline; the expandable detail panel is not rebuilt (see Open items).
- **Row sorting.** 5a renders the eight throws in fixed `ITEMS` order (Resolved decision 5).
- Any **data write.** 5a is read-only — it renders `prs` and `sessions`; it changes no stored data.

## Known interim state (by design)

- **The Progress page is throws-only after 5a.** No lifts view, no Throws / Lifts toggle — Stage 5b adds both. A review should treat the absence of the toggle and the lifts view as expected, not a 5a defect.

## Resolved decisions

Settled in the 2026-05-22 planning session; spec-level calls are noted as such.

1. **Stage 5 is split 5a / 5b.** 5a is the throws Progress page; 5b is the Throws / Lifts toggle and the lifts view. Throws and S&C have different logging cadences — every session vs. notable-only — so they need separate views; the page grew past one stage, as Stage 3 and Stage 4 did.

2. **The Progress page is new files; See the Gap is retired.** `gap.html` / `gap.js` are deleted and the page is rebuilt as `progress.html` / `progress.js`, rather than rewritten in place. The page is fundamentally the v2 Progress page, not the comeback-tracker-era "See the Gap"; a clean filename is worth the small nav relink across three files. *(Spec-level call — Oak can override at spec review.)*

3. **One filter — the window — default Past 3 sessions.** The page carries a single in-page control: Last session / Past 3 sessions / Year to date. It replaces v1's competition/training/all filter. The default is Past 3 sessions — a small recent window, more reliably populated than "Last session" alone. *(Default is a spec-level call.)*

4. **5a is throws-only, no toggle.** The Throws / Lifts toggle is part of 5b, built when the lifts view is built. 5a's page is a single throws view with no toggle UI.

5. **Minimal rows, fixed order.** Each row shows the event, the best-in-window mark with its date, the PR, and the percentage with a bar — no expandable when/where detail panel (v1 had one; deferred). The eight throws render in fixed `ITEMS` order, not sorted by percentage. Both keep 5a small; either is a builder/Oak-tweakable call.

## Tech notes (decided)

- Vanilla HTML/CSS/JS, no build step, browser localStorage — unchanged. `version` stays `2` (5a reads data, writes none).
- **The window, best-in-window, and percentage logic should be pure helpers in `shared.js`** — no DOM, unit-testable, the same pattern as `formatLiftMark` / `detectMilestones` / `recomputeDerivedState`. `progress.js` is a thin rendering layer.
- **Window selection:** order sessions by `date` (then by save order / `id` for same-date ties). "Last session" = the most recent one; "Past 3 sessions" = the three most recent; "Year to date" = sessions whose `date` is on or after January 1 of the current year.
- **Throws are all higher-is-better** (distance / height) — best-in-window is the `max`. 5a has no `time`-direction case; that arrives with lifts in 5b.
- **The percentage is always ≤ 100%.** `prs[event]` is the all-time max across every session (Stage 4 keeps it so); the window is a subset of all sessions, so the best-in-window can equal but never exceed the PR. 100% means the selected window contains the PR-setting session.
- `progress.js` may reuse or adapt v1 See the Gap's row/bar styling in `styles.css` — builder's call whether to carry the `gap-*` classes forward under new names.
- The `prs` the page reads is the live, Stage-4-maintained PR.

## Files Stage 5a touches

- `progress.html` — **new** — the Progress page markup.
- `progress.js` — **new** — the window filter, the per-throw rows, the empty state; a thin layer over the `shared.js` helpers.
- `gap.html`, `gap.js` — **deleted.**
- `shared.js` — the pure window / best-in-window / percentage helpers.
- `index.html`, `session.html`, `tests.html` — the nav link `gap.html` → `progress.html`, and the label "See the Gap" → "Progress".
- `styles.css` — Progress page styling (rows, the percentage bar).
- `tests.js` — new coverage (scope point 7).
- `app.js` — untouched.

## Risk note

Project risk is **Normal**, and 5a sits at the **low** end of it — a **read-only display page**. It computes from `prs` and `sessions` and renders; it writes no stored data, adds no derived-data logic, and changes no schema. There is no data-loss surface here, unlike 4c.

The gpt review's job is correctness, not safety:

- The window selection — "Last session", "Past 3 sessions", and especially the "Year to date" calendar-year boundary; the fewer-than-three-sessions case.
- Best-in-window as the max across the in-window sessions; the percentage rounding; the ≤ 100% expectation.
- The empty state — no marks in the window, and the no-sessions case.
- That the nav relink is correct on every page, and `gap.*` is fully gone.
- That the Set page, Log Session, and the celebration system are untouched.

## Open items

None blocking.

- The **when/where detail panel** from v1's See the Gap is not rebuilt in 5a — the best mark's date is shown inline instead. If the fuller detail is wanted, it is a v2.x polish, not a 5a blocker.
- **Row sorting** — 5a uses fixed `ITEMS` order. If a sorted-by-gap view is wanted (v1 sorted by percentage), it is a small follow-up; flagged, not blocking.
- The exact **visual treatment** of the rows and bars is builder's discretion, carried from the See the Gap styling.

## Handoff prompt for the next ccode session

```text
ccd, this is Stage 5a of the Highland Games Tracker v2 build — the
first of a two-way split Stage 5.

Read these two files:
  - docs/specs/v2-stage5a-spec.md  (this spec — scope, acceptance
                                    criteria, resolved decisions)
  - v2-plan.md  (repo root — full v2 design: the Stage 5 section, the
                 v2 storage schema)

The project is at ~/dev/highland-games-tracker, on main, tagged
v2.0.0-stage4c. Stage 5a is the Progress page for throws — it replaces
v1's "See the Gap." Build a new progress.html / progress.js: a window
filter (Last session / Past 3 sessions / Year to date, default Past
3), and one row per throw event showing the best mark in the selected
window, its date, the PR, and the percentage of PR with a bar. An
event with no marks in the window reads "no marks logged." Retire
gap.html / gap.js, and repoint the nav on every page from "See the
Gap" -> "Progress" and gap.html -> progress.html.

It does NOT build the S&C lifts view or the Throws/Lifts toggle —
those are Stage 5b. 5a is throws-only.

Put the window / best-in-window / percentage logic in pure shared.js
helpers (DOM-free, unit-tested), with progress.js a thin rendering
layer — the same pattern as detectMilestones and recomputeDerivedState.

Build to the spec's Acceptance criteria. Note the Resolved decisions —
do not relitigate them. Project risk is Normal — low; this is a
read-only page and writes no data.

Skill level: L1 — Supported. Reviewer: gpt.

Atomic commits, v1 style (small, focused, feat:/fix:/chore:/refactor:
prefixes, one concern each — the helpers, the page, the nav relink,
and the tests are natural separate commits). Do not push — give me the
push commands when the local commits are ready.
```

## Review prompt for the gpt review pass

```text
You are gpt — the Reviewer in the Higgins Method, a solo build system.
A build was done by ccode (Claude Code, a separate model); your job is
an independent cross-check. This is Stage 5a of the Highland Games
Tracker v2 project — the Progress page for throws, the first of a
two-way split Stage 5. Skill level: L1 — Supported. Project risk:
Normal — low (a read-only display page).

WHAT TO READ — attach all 11 files. The list is alphabetical to match
the file picker, and numbered so you know when all 11 are attached:

1.  higgins-method.md — your Reviewer role, the L1 level, the
    one-review-pass rule.
2.  index.html — confirm the nav relink ("Progress" / progress.html).
3.  progress.html — the new Progress page markup.
4.  progress.js — the new Progress page logic.
5.  session.html — confirm the nav relink.
6.  shared.js — the new window / best-in-window / percentage helpers.
7.  styles.css — the Progress page styling.
8.  tests.html — confirm the nav relink.
9.  tests.js — the test suite.
10. v2-plan.md — the full v2 design (the Stage 5 section, Storage
    schema v2).
11. v2-stage5a-spec.md — the Stage 5a spec. "Acceptance criteria" is
    the bar; "Resolved decisions" fix the design calls (do not
    relitigate them); "Risk note" says where to concentrate; "Known
    interim state" says what is expected rather than a bug.

Review the code itself — do not rely on ccode's build report. This
must be an independent read.

CONCENTRATE HERE
5a writes no data — the review is about correctness, not safety:
- The window selection: "Last session", "Past 3 sessions", and the
  "Year to date" calendar-year boundary (on or after Jan 1 of this
  year); the fewer-than-3-sessions case.
- Best-in-window as the max across the in-window sessions for each
  event; the percentage (bestInWindow / prs[event], rounded); the
  percentage should never exceed 100%.
- The empty state — an event with no marks in the window, and the
  no-sessions case.
- The nav relink on every page; gap.html / gap.js fully removed.

ALSO CHECK
- The window / best / percentage logic is in pure shared.js helpers
  with test coverage; progress.js is a thin rendering layer.
- No S&C lifts view and no Throws/Lifts toggle were built (those are
  Stage 5b) — their absence is expected, not a defect.
- The Set page, Log Session, the celebration system, and the profile
  modal are untouched; version stays 2.
- Whether the build meets each item in the spec's Acceptance criteria.

HOW TO REPORT
- Classify every finding: Critical / Major / Minor / Nit.
  Critical = a wrong computation that misrepresents progress, or an
  acceptance criterion unmet.
- Be specific: file, function, what is wrong, why it matters.
- Separate real defects from style preferences.
- This is a personal/community vanilla-JS localStorage app at L1 /
  Normal risk — calibrate to that. Don't demand enterprise hardening.

METHOD CONSTRAINT
This is the one review pass. A second round happens only if this pass
finds something Critical. Give one complete review — findings by
severity, then a one-line verdict: ship as-is, ship after fixes, or
fix-and-re-review (Critical only).
```

Attach the listed files only — don't paste ccode's build report; gpt's review must be an independent read.

---

*End of sketch. Update only via cowork session.*

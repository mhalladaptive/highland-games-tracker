# Highland Games Tracker — Stage 5b Spec Sketch (v1)

**Date:** 2026-05-23
**Skill level:** L1 — Supported
**Project risk:** Normal — low (a read-only display view; writes no data)
**Repo:** `~/dev/highland-games-tracker` — on `main`, tagged `v2.0.0-stage5a`
**Design source:** `v2-plan.md` (Stage 5 section · Storage schema v2 · Unit system) · `v2-stage5a-spec.md` (the Progress page 5b extends) · this session's resolved decisions (2026-05-23 — the Stage 5b planning session)

---

## What this is

Stage 5 of the Highland Games Tracker v2 build, **split into two** (the split is explained in `v2-stage5a-spec.md`). This is **Stage 5b** — the **S&C lifts view** on the Progress page, plus the **Throws / Lifts toggle** that reaches it. 5b **completes Stage 5**, and with it the v2 feature build before launch polish (Stage 6).

Stage 5a built the Progress page for **throws** — a windowed vs-PR comparison, one row per throw event, replacing v1's "See the Gap." 5b adds the other half: a parallel view for the athlete's **S&C lifts**, and a top-level toggle to switch between the two. Throws and lifts are logged at different cadences — throws every session, S&C only on notable sessions — so the lifts view does not reuse the throws window filter; it has its own two modes.

`v2-plan.md` holds the full v2 design (the Stage 5 section, the v2 storage schema, the Unit system). `v2-stage5a-spec.md` describes the page 5b extends. Read both alongside this sketch.

## Builds on Stage 5a — sequencing

5b can be **spec'd** independently (this sketch), but it **cannot be built until 5a has shipped** — it adds a toggle and a second view onto the `progress.html` / `progress.js` page that 5a creates. The ccode handoff for 5b waits on `v2.0.0-stage5a`.

## Stage 5b scope — the buildable chunk

1. **The Throws / Lifts toggle** (`progress.html`, `progress.js`). A top-level segmented control at the top of the Progress page — the same control pattern as 5a's window filter and the app's existing competition/training filters. Two options: **Throws** and **Lifts**. The page **opens on Throws** (Resolved decision 3). Switching the toggle swaps the view below it **and** the secondary control (scope point 2).

2. **A per-side secondary control** (`progress.html`, `progress.js`). Below the toggle sits one secondary control whose options depend on the selected side:
   - **Throws side** — 5a's **window filter** (Last session / Past 3 sessions / Year to date), unchanged.
   - **Lifts side** — a **mode selector**: **Snapshot** and **Best 3** (scope points 3–4). Default mode: **Snapshot** (Resolved decision 5).
   The two controls never mix — throws never get Snapshot/Best 3, lifts never get the session windows. The secondary control is swapped, not shared.

3. **The lifts view — Snapshot mode** (`progress.js`). One row per **active** `userLift` (`active: true` — Resolved decision 4). Each row shows: the lift `name`; the **most-recent mark** — the best attempt of the lift's most recently dated session that has marks for it, direction-aware (`max` for higher-is-better units, `min` for `time`); that mark's **date**, shown inline; the **PR** (`prs[liftId]`); and the **percentage of PR** with a bar (scope point 5). There is no window on Snapshot — "most recent" is the single latest mark, however old. The inline date matters here: a notable-only lift's latest mark may be months old, and the date keeps that honest.

4. **The lifts view — Best 3 mode** (`progress.js`). For each active `userLift`, the **top 3 session-bests within the rolling last 365 days**: take each in-window session's single best attempt for the lift (direction-aware), then take the top 3 of those — three different days, not three attempts from one day (Resolved decision 2). Each of the three is shown with its **date**, **mark**, **percentage of PR**, and a bar. Fewer than 3 qualifying sessions → show the 1 or 2 that exist. The 365-day window is rolling from today and is fixed — there is no window control on the lifts side (Resolved decision 6).

5. **Direction-aware percentage** (`shared.js`). The percentage is the mark as a fraction of the PR — but the direction of "better" varies by unit. For higher-is-better units the percentage is `bestMark / pr`; for `time` (lower-is-better) it is `pr / bestMark` — the ratio flips so the result still reads as "fraction of the way to your PR," ≤ 100%, for every unit (Resolved decision 1). 5a's throw percentage helper handles only the higher-is-better case; 5b generalizes it (or adds a lift-facing helper) to take the unit `direction`. Rounded the same way 5a rounds.

6. **Lift empty states** (`progress.js`). Two cases:
   - **A lift with no qualifying marks** — in Snapshot, a lift with no marks at all; in Best 3, a lift with no sessions in the last 365 days — shows **"no marks logged"** in place of the mark / percentage / bar, the same line 5a uses for a throw with no marks in the window.
   - **No active lifts defined at all** — the Lifts view shows a single section-level empty state pointing to the Set page, mirroring the Log Session S&C empty state from Stage 4a: **"No S&C lifts yet — add them on the Set PRs & Goals page,"** with *Set PRs & Goals page* a link to `index.html`.

7. **Pure helpers in `shared.js`** (`shared.js`). The most-recent-mark selection (Snapshot), the top-3-session-bests-in-365-days selection (Best 3), and the direction-aware percentage are pure, DOM-free helpers — unit-testable like `formatLiftMark`, `detectMilestones`, `recomputeDerivedState`, and 5a's window helpers. `progress.js` stays a thin rendering layer over them.

8. **Tests** (`tests.js`). Cover: the toggle switches the view and the secondary control; Snapshot picks the most-recent session's best attempt, direction-aware (a `time` lift picks the `min`); Best 3 picks the top 3 session-bests within 365 days — including the 365-day boundary, the fewer-than-3-sessions case, and that three big attempts in one session do **not** fill all three slots; the direction-aware percentage flips for `time` and lands ≤ 100% both ways; only active lifts render; both empty states.

## Acceptance criteria

Stage 5b is done when all of these are true:

- [ ] The Progress page has a top-level Throws / Lifts toggle; it opens on Throws; switching it swaps both the view and the secondary control.
- [ ] On the Lifts side the secondary control is a Snapshot / Best 3 mode selector, defaulting to Snapshot; the Throws side keeps 5a's window filter unchanged.
- [ ] Snapshot shows one row per active lift — name, most-recent mark with its date, PR, and percentage-of-PR with a bar.
- [ ] Best 3 shows, per active lift, the top 3 session-bests of the last 365 days — each with date, mark, percentage, and bar; fewer than 3 qualifying sessions shows the 1–2 that exist.
- [ ] The "most recent" mark and each session-best are the direction-aware best attempt — `max` for higher-is-better units, `min` for `time`.
- [ ] The percentage is direction-aware — `bestMark / pr` for higher-is-better, `pr / bestMark` for `time` — and never exceeds 100%.
- [ ] A lift with no qualifying marks reads "no marks logged"; with no active lifts at all, the Lifts view shows the linked Set-page empty state.
- [ ] Only active `userLifts` appear in the lifts view.
- [ ] The selection / percentage logic lives in pure `shared.js` helpers with test coverage; `progress.js` is a thin rendering layer.
- [ ] The 5a throws view, its window filter, the Set page, Log Session, the celebration system, and the profile modal are all unaffected; `version` stays `2`.
- [ ] Tests cover scope point 8.

## Explicitly NOT in Stage 5b

- **Goals as a percentage.** The Progress page is vs-PR only — `v2-plan.md` removed the goal comparison deliberately; goals live in the celebration system. Unchanged from 5a.
- **Changes to the 5a throws view.** 5b wraps the throws view in the toggle but does not alter it — same rows, same window filter.
- **Soft-deleted lifts.** A lift with `active: false` does not appear in the lifts view, even with historical marks (Resolved decision 4).
- **The when/where detail panel** v1's See the Gap carried — deferred in 5a, still deferred.
- Any **data write.** 5b is read-only — it renders `prs` and `sessions`; it changes no stored data.
- **Stage 6** — final visual polish, the cross-device smoke test, the `v2.0.0` tag, the GitHub release, analytics.

## Known interim state (by design)

- After 5b, **Stage 5 is complete** — the Progress page covers both throws and lifts. The remaining v2 work is Stage 6 (launch polish), not a feature gap.
- A soft-deleted lift's history is still in the data and still resolves in the Log Session Past Sessions detail view (Stage 4a) — it is only the **Progress page** that shows active lifts only. Intentional, not an inconsistency: Progress is a forward-looking "where am I now" view.

## Resolved decisions

Settled in the 2026-05-23 planning session. Spec-level calls — open to override at spec review — are marked as such.

1. **Direction-aware percentage — the ratio flips for `time`.** For higher-is-better units the percentage is `bestMark / pr`; for `time` it is `pr / bestMark`. Both land ≤ 100% and read as "fraction of the way to your PR," so every row on the page — throw or lift — uses one mental model. It keys off the unit `direction` field already added in 3b and consumed by 4b / 4c.

2. **Best 3 = top 3 session-bests, not top 3 attempts.** Each in-window session contributes its single best attempt; the top 3 of those session-bests are shown. The alternative — pooling every attempt and taking the 3 best numbers — lets one strong session fill all three slots and collapses "Best 3" into "best 3 of one day." Session-bests make the mode a three-best-days story, and match how 4b detection and 5a's throw row already treat a session's best attempt as the unit.

3. **The page opens on Throws; the toggle is top-level; the secondary control swaps per side.** Throws is the every-session data and the 5a page already exists as the throws view; lifts is the notable-only secondary view. The window filter (throws) and the mode selector (lifts) are distinct controls, swapped with the toggle, never combined.

4. **The lifts view shows active lifts only.** *(Spec-level call.)* `active: true` `userLifts` only. A soft-deleted lift is not part of the athlete's current program, and Progress is a "where am I now" view. Its history remains intact and visible in Log Session's Past Sessions detail.

5. **Default lift mode: Snapshot.** *(Spec-level call.)* "Most recent mark vs PR" is the most direct "how am I doing right now," and it mirrors 5a's instinct of defaulting to a recent view. Best 3 is one tap away.

6. **Best 3 render: three stacked entries per lift; the 365-day window is fixed.** *(Spec-level call on the render.)* Each lift renders its name and, beneath it, up to three entries — each a date, mark, percentage, and bar. The 365-day window is rolling and fixed: lifts log notable-only, so a session-count window would span an unpredictable amount of calendar time; a fixed year is the stable frame for sparse data.

## Tech notes (decided)

- Vanilla HTML/CSS/JS, no build step, browser localStorage — unchanged. `version` stays `2` (5b reads data, writes none).
- 5b extends `progress.html` / `progress.js` from 5a — it does not create files. The throws view, the window filter, and 5a's helpers stay; 5b adds the toggle, the lifts view, and the lift helpers around them.
- **The lift helpers belong in `shared.js`** as pure, DOM-free, unit-tested functions, the same pattern as `formatLiftMark` / `detectMilestones` / `recomputeDerivedState` and 5a's window helpers. Suggested shape: a most-recent-session-best selector, a top-3-session-bests-in-365-days selector, and a direction-aware percentage. `progress.js` renders over them.
- **Direction-aware best attempt.** A session's best attempt for a lift is `max` of its attempts for higher-is-better units, `min` for `time`. A `time` lift's marks are stored as seconds (Stage 4a), so the `min` seconds is the fastest. This is the same `direction` logic 4b's detection uses — reuse it, do not re-derive it.
- **Lift marks display** via `formatLiftMark` (the Stage 4a helper) — `"102.5 kg"`, `"3:45"` for a time mark, `"12 reps"`.
- **The 365-day window:** a session qualifies for Best 3 if its `date` is within 365 days of today. Take each qualifying session's best attempt, sort those session-bests by the unit direction, take the top 3.
- **The percentage is always ≤ 100%** — `prs[liftId]` is the all-time best across every session (Stage 4 keeps it so), and any single mark is by definition no better than the all-time best, in either direction.
- `progress.js` may reuse 5a's row/bar styling for the lift rows; the Best 3 three-entry block is new layout.
- The toggle and mode selector can be static markup in `progress.html` toggled by `progress.js`, or built in `progress.js` — builder's call; model 5a's window filter.

## Files Stage 5b touches

- `progress.html` — the Throws / Lifts toggle, the lift mode selector, the lifts view container.
- `progress.js` — the toggle and mode-selector wiring; the Snapshot and Best 3 lift views; the lift empty states; a thin layer over the `shared.js` helpers.
- `shared.js` — the most-recent-mark and top-3-session-bests selectors; the direction-aware percentage (generalizing 5a's throw percentage).
- `styles.css` — the toggle, the mode selector, the lift rows, the Best 3 three-entry block.
- `tests.js` — new coverage (scope point 8).
- `index.html`, `session.html`, `tests.html` — untouched (the nav already reads "Progress" from 5a).
- `app.js`, `session.js` — untouched.

## Risk note

Project risk is **Normal**, and 5b — like 5a — sits at the **low** end of it: a **read-only display view**. It computes from `prs` and `sessions` and renders; it writes no stored data, adds no derived-data logic, and changes no schema. There is no data-loss surface.

The gpt review's job is correctness:

- The **direction-aware percentage** — the `time` flip; that both directions land ≤ 100%; that a throw or higher-is-better lift is unaffected.
- **Snapshot** — the most-recent mark is the latest *dated* session's best attempt, direction-aware; the inline date is that session's date.
- **Best 3** — the top 3 *session-bests* (not 3 attempts); the rolling 365-day boundary; the fewer-than-3 case; that one strong session cannot occupy more than one slot.
- The **empty states** — a lift with no qualifying marks; no active lifts at all.
- That **only active lifts** appear; that the **5a throws view and its window filter are unchanged**.

## Open items

None blocking.

- The exact **visual treatment** of the toggle, the mode selector, and the Best 3 three-entry block is builder's discretion, carried from 5a's styling — Stage 6 is where the Progress page gets its polish pass.
- Whether a lift row shows the `protocol` alongside the `name` — 5a's throw rows show only the event name; the lift `protocol` ("1RM", "AMRAP 30s") could add useful context or could be noise. Builder / Oak call at spec review; non-blocking, leans toward name-only for parity with throws.

## Handoff prompt for the next ccode session

```text
ccd, this is Stage 5b of the Highland Games Tracker v2 build — the
second half of a two-way split Stage 5, and the last feature stage
before launch polish.

Read these three files:
  - docs/specs/v2-stage5b-spec.md  (this spec — scope, acceptance
                                    criteria, resolved decisions)
  - docs/specs/v2-stage5a-spec.md  (the Progress page 5b extends)
  - v2-plan.md  (repo root — full v2 design: the Stage 5 section, the
                 v2 storage schema, the Unit system)

The project is at ~/dev/highland-games-tracker, on main, tagged
v2.0.0-stage5a. Stage 5a built the Progress page for throws — a
windowed vs-PR comparison. Stage 5b adds the S&C lifts half: a
top-level Throws / Lifts toggle, and a lifts view with two modes —
Snapshot (the most-recent mark vs PR) and Best 3 (the top 3
session-bests of the rolling last 365 days vs PR). The page opens on
Throws; the secondary control swaps with the toggle (the window filter
for throws, the mode selector for lifts).

The percentage is direction-aware: bestMark / pr for higher-is-better
units, pr / bestMark for time — both <= 100%. Best 3 takes each
session's best attempt then the top 3 of those, NOT the 3 best
attempts pooled. Only active userLifts appear.

Put the most-recent-mark selection, the top-3-session-bests selection,
and the direction-aware percentage in pure shared.js helpers (DOM-free,
unit-tested), with progress.js a thin rendering layer — the same
pattern as 5a's window helpers and detectMilestones.

Build to the spec's Acceptance criteria. Note the Resolved decisions —
do not relitigate them. Project risk is Normal — low; this is a
read-only view and writes no data.

Skill level: L1 — Supported. Reviewer: gpt.

Atomic commits, v1 style (small, focused, feat:/fix:/chore:/refactor:
prefixes, one concern each — the toggle, the Snapshot view, the Best 3
view, the helpers, and the tests are natural separate commits). Do not
push — give me the push commands when the local commits are ready.
```

## Review prompt for the gpt review pass

```text
You are gpt — the Reviewer in the Higgins Method, a solo build system.
A build was done by ccode (Claude Code, a separate model); your job is
an independent cross-check. This is Stage 5b of the Highland Games
Tracker v2 project — the S&C lifts view on the Progress page and the
Throws / Lifts toggle, the second half of a two-way split Stage 5.
Skill level: L1 — Supported. Project risk: Normal — low (a read-only
display view).

WHAT TO READ — attach all 9 files. The list is alphabetical to match
the file picker, and numbered so you know when all 9 are attached:

1. higgins-method.md — your Reviewer role, the L1 level, the
   one-review-pass rule.
2. progress.html — the toggle, the mode selector, the lifts view
   markup.
3. progress.js — the toggle wiring and the lifts view logic.
4. shared.js — the most-recent-mark / top-3-session-bests /
   direction-aware percentage helpers.
5. styles.css — the Progress page styling.
6. tests.js — the test suite.
7. v2-plan.md — the full v2 design (the Stage 5 section, Storage
   schema v2, the Unit system).
8. v2-stage5a-spec.md — the Stage 5a spec; the throws Progress page
   5b extends.
9. v2-stage5b-spec.md — the Stage 5b spec. "Acceptance criteria" is
   the bar; "Resolved decisions" fix the design calls (do not
   relitigate them); "Risk note" says where to concentrate; "Known
   interim state" says what is expected rather than a bug.

Review the code itself — do not rely on ccode's build report. This
must be an independent read.

CONCENTRATE HERE
5b writes no data — the review is about correctness, not safety:
- The direction-aware percentage: bestMark / pr for higher-is-better,
  pr / bestMark for time; both must land <= 100%; a throw or
  higher-is-better lift must be unaffected by the flip.
- Snapshot: the most-recent mark is the latest dated session's best
  attempt, direction-aware (min for a time lift); the inline date is
  that session's date.
- Best 3: the top 3 SESSION-BESTS (each session's single best
  attempt, then the top 3 of those) — NOT the 3 best attempts pooled;
  the rolling 365-day boundary; the fewer-than-3-sessions case.
- The empty states: a lift with no qualifying marks; no active lifts
  at all.
- Only active userLifts appear; the 5a throws view and its window
  filter are unchanged.

ALSO CHECK
- The toggle opens on Throws and swaps both the view and the
  secondary control.
- The selection / percentage logic is in pure shared.js helpers with
  test coverage; progress.js is a thin rendering layer.
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

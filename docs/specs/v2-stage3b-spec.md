# Highland Games Tracker — Stage 3b Spec Sketch (v1)

**Date:** 2026-05-20
**Skill level:** L1 — Supported
**Project risk:** Normal (overlay unchanged — see Risk note)
**Repo:** `~/dev/highland-games-tracker` — on `main`, tagged `v2.0.0-stage3a`
**Design source:** `v2-plan.md` (Unit system · Storage schema v2) · `v2-stage3a-spec.md` (the 3a/3b seam) · this session's resolved decisions

---

## What this is

Stage 3 of the Highland Games Tracker v2 build was split in two. Stage 3a —
shipped and tagged `v2.0.0-stage3a` — rebuilt the Set page as Set PRs & Goals,
with user-defined lift cards and a unit dropdown. This is **Stage 3b**, the
second half: the **unit conversion engine**.

In 3a, a lift's unit dropdown *locks* (disables) once the lift has any mark — a
PR, a Goal, or a session mark. That lock was a deliberate, stricter
placeholder: 3a never had to display a value it could not stand behind. Stage
3b is what *unlocks* it. When an athlete changes a Weight or Distance lift's
unit, 3b converts that lift's PR, Goal, and every historical session mark to
the new unit.

`v2-plan.md` holds the design (the "Unit system" section, the v2 storage
schema). Read it alongside this sketch. The Resolved decisions section below
records four questions `v2-plan.md` left open, settled in the 2026-05-20
planning session.

## What 3b unlocks — the conversion behavior

3b is **Weight-and-Distance only**. Of the four unit categories:

- **Weight** (`lb`, `kg`) and **Distance** (`mi`, `K`, `m`, `yd`) have real
  conversion factors — these are the categories 3b converts.
- **Time** has a single unit (`time`) — there is nothing within the category
  to change *to*.
- **Count** (`reps`, `rounds`, `cal`) units are not interconvertible — there is
  no honest factor between reps, rounds, and calories.

So for a lift that has marks: if its unit is Weight or Distance, 3b unlocks the
dropdown (filtered to that category) and converts on change. If its unit is
Time or Count, the dropdown stays locked exactly as 3a left it — permanently.
(See Resolved decisions #1.)

## Stage 3b scope — the buildable chunk

1. **Conversion helper** (`shared.js`). Add a pure
   `convertValue(value, fromUnitId, toUnitId)` that converts a numeric value
   between two units in the **same** Weight or Distance category, rounded to
   one decimal place. Back it with a per-unit base factor — add a numeric
   (suggest `toBase`) to each Weight and Distance entry in `UNITS`: Weight base
   `kg`, Distance base `m`. `convertValue` computes
   `value × fromUnit.toBase ÷ toUnit.toBase`, then rounds to one decimal. It
   must never be asked to cross categories or to convert Time/Count units —
   guard accordingly (it must not silently produce a wrong number).

   Exact factors (international definitions):
   - Weight, base `kg`: `lb` → 0.45359237, `kg` → 1.
   - Distance, base `m`: `mi` → 1609.344, `K` → 1000, `m` → 1, `yd` → 0.9144.

2. **Unlock + filter the unit dropdown** (`app.js`). Replace the 3a
   all-or-nothing lock with three states for a lift card's unit dropdown:
   - Lift has **no marks** → full dropdown, all 10 units, enabled. (Unchanged
     from 3a.)
   - Lift **has marks**, unit category **Weight or Distance** → dropdown
     **enabled**, rebuilt to show **only that category's units** (an `lb` lift
     shows `lb`, `kg`; an `m` lift shows `mi`, `K`, `m`, `yd`).
   - Lift **has marks**, unit category **Time or Count** → dropdown
     **disabled**, showing the current unit. (The 3a lock, now scoped to these
     two categories only.)

3. **Live conversion on unit change** (`app.js` — "Option A"). When the
   athlete picks a new unit on a marked Weight/Distance lift, the card's PR and
   Goal inputs re-render immediately to the converted values — they watch `225`
   become `102.1`. The re-render recomputes from the lift's **saved** PR/Goal
   and **saved** unit (`data.prs` / `data.goals` / the stored `userLifts`
   entry), not from whatever is currently in the input — so toggling units
   before Save (`lb → kg → lb`) always returns to the exact saved value and
   never drifts. The 3a `change` handler already swaps the time/number input
   type; this extends it. Live conversion applies to **saved marked lifts
   only** — a brand-new lift's unit change keeps the 3a behavior (input-type
   swap, no value conversion).

4. **Convert historical session marks on Save** (`shared.js`). When a marked
   lift is saved with a unit different from its stored unit, every one of that
   lift's session marks — `sessions[].marks[liftId]` across all sessions —
   converts to the new unit via `convertValue`. The lift's PR and Goal arrive
   already-converted from the (live-converted) card inputs and are written as
   in 3a; the session marks are the values with no input, so they are converted
   in the data layer. This belongs in the pure data layer — extend
   `applyFormSnapshotsToData` (which already receives `currentData` carrying
   the old unit, and the submitted snapshots carrying the new unit), or a pure
   sibling it calls. `applyFormSnapshotsToData` will need to also accept and
   return `sessions`. Only the changed lift's marks convert; every other lift's
   marks, and all throw marks, are left exactly as they are.

5. **Rename the Strength & Conditioning section** (`index.html`). The Set page
   section heading currently reads `Strength & Conditioning`; `v2-plan.md`
   names the section "Strength and Conditioning Milestones." Change the `<h2>`
   to **`Strength and Conditioning Milestones`**. Heading text only — no other
   markup, no framing copy. (A miss in the 3a spec against `v2-plan.md`; a
   distinct concern — its own atomic commit.)

6. **Tests** (`tests.js`). Cover: `convertValue` (kg↔lb both ways, distance
   pairs, round-trip drift behavior, one-decimal rounding); the dropdown's
   three states; the Save-time session-mark conversion (a unit change converts
   that lift's marks and no others; an unchanged unit converts nothing; a lift
   with no session marks does not error).

## Acceptance criteria

Stage 3b is done when all of these are true:

- [ ] `convertValue` converts within Weight and within Distance, rounded to one
      decimal, using the factors above; it never crosses categories or touches
      Time/Count units.
- [ ] A lift with no marks still shows the full 10-unit dropdown, enabled.
- [ ] A marked **Weight or Distance** lift shows an **enabled** dropdown
      filtered to its own category's units.
- [ ] A marked **Time or Count** lift shows a **disabled** dropdown — the 3a
      lock, unchanged.
- [ ] Changing a marked Weight/Distance lift's unit re-renders its PR and Goal
      inputs to the converted values immediately, before Save.
- [ ] Toggling a lift's unit back and forth before Save returns the PR/Goal to
      their exact saved values — no pre-save drift.
- [ ] On Save, a lift whose unit changed has every one of its session marks
      (`sessions[].marks[liftId]`) converted to the new unit; its PR and Goal
      are stored in the new unit.
- [ ] On Save, lifts whose unit did **not** change have their session marks
      untouched; throw marks are never touched.
- [ ] All converted values — PR, Goal, session marks — are stored rounded to
      one decimal place.
- [ ] No session mark is dropped, duplicated, or left in the old unit after a
      conversion.
- [ ] The Set page S&C section heading reads "Strength and Conditioning
      Milestones."
- [ ] Throws, the profile modal, Log Session, See the Gap, and Tests still
      load and work.
- [ ] Tests cover `convertValue`, the dropdown's three states, and the
      Save-time session-mark conversion.

## Explicitly NOT in Stage 3b

- Any **Time or Count** conversion — those units do not convert (Resolved
  decisions #1).
- A **confirmation dialog** before conversion (Resolved decisions #4).
- Any change to **Log Session** — Stage 4. The Log Session section's own
  rename to "Strength and Conditioning Milestones," with milestone-framing
  intro text, is a Stage 4 item (Resolved decisions #5).
- The **celebration system**, milestone firing, PR auto-update from sessions,
  `goalMeta` — Stage 4. `goalMeta` is not written or converted by 3b.
- The **Progress page** — Stage 5.
- `direction` is still carried on each unit and still unused — Stage 4
  milestone logic consumes it.
- **Throws** are untouched — they use feet/inches, not the unit system.
- No storage schema change — 3b operates on the existing v2 shape; no
  migration.

## Resolved decisions

Settled in the 2026-05-20 planning session. `v2-plan.md` specified
"same-category auto-convert" and "round to one decimal" but left these four
open.

1. **Count and Time lifts with marks stay fully locked.** Conversion is
   Weight-and-Distance only. `reps`, `rounds`, and `cal` are not
   interconvertible — there is no honest factor between them, and those
   milestones are recorded in a specific unit on purpose. `time` has only one
   unit. So a marked Time or Count lift keeps the 3a lock permanently; 3b's
   unlock applies only to Weight and Distance.

2. **Conversions round the stored values.** When a value converts, the rounded
   (one-decimal) result is what gets stored — stored numbers always match what
   is shown on screen; no hidden precision. The trade-off: converting is
   slightly lossy, and flipping a unit back and forth drifts the value by up to
   ~0.1. Accepted — on a personal session log, repeated unit-flipping is rare,
   and the alternative (storing full precision) is undercut anyway because the
   Set page's Save reads the rounded value out of the input box.

3. **Conversion is shown live (Option A).** Changing a marked lift's unit
   re-renders the card's PR/Goal to the converted values immediately. The
   alternative — converting only on Save — was rejected: it would briefly show
   e.g. `225` under a `kg` label, which reads as a wrong, alarming value. The
   historical session marks have nowhere to be shown on the Set page, so they
   convert in storage at Save either way.

4. **No confirmation dialog.** A unit conversion is faithful (the mark means
   the same thing, re-expressed) and reversible (change the unit back). Option
   A's live re-render already makes an accidental change visible. Save is the
   existing commit gate. The app reserves a confirm for exactly one thing —
   restoring a backup, which *overwrites* all data; that is the right bar for a
   modal. A conversion does not meet it.

5. **The "Strength and Conditioning Milestones" name.** `v2-plan.md` names the
   section "Strength and Conditioning Milestones"; 3a built it as "Strength &
   Conditioning." 3b corrects the **Set page** heading (scope item 5). The
   **Log Session** section gets the same name in **Stage 4** — and that page is
   where the name matters most: it is where the section could be mistaken for a
   daily workout log. Carry this into the Stage 4 spec.

Known, accepted behavior: the live re-render (decision 3) recomputes PR/Goal
from the lift's *saved* values. If an athlete changes a unit, hand-edits the
PR, then changes the unit again, the hand-edit is replaced by the freshly
converted saved value. This is an unusual sequence and the behavior is
acceptable — flagged so review does not treat it as a defect.

## Tech notes (decided)

- Vanilla HTML/CSS/JS, no build step, browser localStorage — unchanged.
- `convertValue` and the conversion logic live in `shared.js`'s pure layer — no
  DOM, no `localStorage` — so they are unit-testable, same as
  `applyFormSnapshotsToData`.
- The session-mark conversion runs inside the Save path's pure data transform
  (`applyFormSnapshotsToData`, extended to take and return `sessions`, or a
  pure sibling). It detects a unit change by comparing each saved lift
  snapshot's `unit` against the stored `userLifts` entry's `unit`.
- The PR/Goal values are *not* converted by the data layer — they arrive
  already converted from the live-re-rendered inputs (or hand-edited). Only the
  session marks, which have no input, are converted in the data layer. Same
  `convertValue`, same rounding, so the end state is coherent.
- `styles.css`: likely no change. The 3a `.lift-field--locked` styling now
  applies only to marked Time/Count lifts; a marked Weight/Distance lift's
  dropdown is a normal enabled `<select>`.

## Files Stage 3b touches

- `shared.js` — `convertValue` + per-unit `toBase` factors on the Weight and
  Distance units; the session-mark conversion in `applyFormSnapshotsToData`
  (now also handling `sessions`).
- `app.js` — the three-state unit dropdown (unlock + category filter); the live
  PR/Goal conversion on unit `change`.
- `index.html` — the S&C section `<h2>` rename.
- `tests.js` — new coverage.
- `styles.css` — likely none (see Tech notes).
- `session.html`, `gap.html`, `tests.html`, `session.js`, `gap.js` — untouched.

## Risk note

Project risk overlay is **Normal** and unchanged — still a local-only,
single-user, no-accounts, no-money app. But within that, **Stage 3b is the
risk-bearing stage of the whole v2 build.** It is the only stage that *rewrites
an athlete's historical logged data*: the Save-time session-mark conversion
edits marks across every past session. A wrong conversion factor, or a sweep
that misses marks, hits the wrong lift's marks, or double-converts, silently
corrupts logged history — and the athlete may not notice until much later.

Concentrate the gpt review and the tests here:

- The conversion factors are exactly the international definitions above.
- The session-mark sweep finds *all* marks for the changed lift across *all*
  sessions, converts each once, and touches *no other lift's* marks and *no
  throw* marks.
- Conversion runs *only* when the unit actually changed — saving a lift with an
  unchanged unit must leave its marks byte-identical.
- No mark is dropped or duplicated.

## Open items

None — the four questions `v2-plan.md` left open are resolved above. Stage 3b
is handoff-ready.

## Handoff prompt for the next ccode session

```
ccd, this is Stage 3b of the Highland Games Tracker v2 build — the
second half of the split Stage 3.

Read these two files in the repo root:
  - v2-stage3b-spec.md  (this spec sketch — scope + acceptance criteria
                         + resolved decisions)
  - v2-plan.md          (full v2 design — the Unit system section, the
                         v2 storage schema)

The project is at ~/dev/highland-games-tracker, on main, tagged
v2.0.0-stage3a. Stage 3a shipped the Set PRs & Goals page; a lift's
unit dropdown locks once the lift has marks. Stage 3b builds the unit
conversion engine that unlocks it — for Weight and Distance lifts
only. Time and Count lifts stay locked. Do NOT touch Log Session,
the celebration system, or the Progress page.

The spec has no open items — build to it as written. Note especially
the Resolved decisions section: conversion is Weight/Distance only,
stored values are rounded, conversion is shown live on unit change,
and there is no confirmation dialog.

Skill level: L1 — Supported. Project risk: Normal overlay — but 3b is
the risk-bearing stage: it rewrites historical session marks. Get the
conversion factors and the session-mark sweep exactly right. Reviewer:
gpt, concentrating on the Risk note.

Build to the acceptance criteria. Atomic commits, v1 style (small,
focused, feat:/fix:/chore:/refactor: prefixes, one concern each — the
section-heading rename is its own commit, separate from the conversion
engine). Do not push — give me the push commands when the local
commits are ready.
```

## Review prompt for the gpt review pass

```
You are gpt — the Reviewer in the Higgins Method, a solo build system.
A build was done by ccode (Claude Code, a separate model); your job is
an independent cross-check. This is Stage 3b of the Highland Games
Tracker v2 project — the second half of a split Stage 3, the unit
conversion engine. Skill level: L1 — Supported.

Project risk overlay is Normal, but Stage 3b is the risk-bearing stage
of the whole v2 build: it is the only stage that rewrites an athlete's
historical logged data. Review it with that weight.

WHAT TO READ — all attached to this conversation:
- v2-stage3b-spec.md — the Stage 3b spec sketch. Its "Acceptance
  criteria" is the bar the build must meet; its "Resolved decisions"
  fix four design calls — do not relitigate them; its "Risk note" says
  where to concentrate.
- v2-plan.md — the full v2 design (the Unit system section, the v2
  storage schema).
- shared.js, app.js, index.html — the code Stage 3b changed.
- tests.js — the test suite.
- styles.css, session.js — so you can confirm Stage 3b did not touch
  styling or the Log Session page.
- higgins-method.md — your Reviewer role, the L1 level, the one-
  review-pass rule.

Review the code itself — do not ask for or rely on ccode's build
report. This must be an independent read.

CONCENTRATE HERE (the risk surface)
Stage 3b's Save-time conversion REWRITES stored historical data. The
careful parts:
- convertValue(value, fromUnitId, toUnitId). The factors must be the
  exact international definitions (Weight, base kg: lb = 0.45359237;
  Distance, base m: mi = 1609.344, K = 1000, m = 1, yd = 0.9144). It
  must round to one decimal, and it must NOT produce a wrong number
  for a cross-category or a Time/Count pairing — confirm it is guarded.
- The Save-time session-mark sweep (conversion of sessions[].marks).
  It must: convert EVERY mark of the changed lift across ALL sessions;
  convert each mark exactly once; touch NO other lift's marks; touch
  NO throw marks; run ONLY when the lift's unit actually changed. A
  miss here silently corrupts an athlete's logged history.
- applyFormSnapshotsToData — extended in 3b to also handle sessions.
  Confirm it does not mutate its input (currentData, the sessions
  array, the marks arrays) — it must return new structures.
- The live conversion on unit change recomputes PR/Goal from the
  lift's SAVED values, so toggling a unit back and forth before Save
  returns to the exact saved value — no pre-save drift.
- Every converted value — PR, Goal, session marks — is stored rounded
  to one decimal place.

ALSO CHECK
- The unit dropdown's three states: no marks → full 10-unit list;
  marked Weight/Distance → enabled, filtered to that category; marked
  Time/Count → disabled (the 3a lock, unchanged).
- The Set page S&C section heading reads "Strength and Conditioning
  Milestones."
- Throws are untouched; no storage-schema change; goalMeta is not
  written or converted.
- Whether the build meets each item in the spec's Acceptance criteria.
- Whether the tests genuinely cover convertValue, the dropdown states,
  and the session-mark conversion — including the negative cases: a
  lift whose unit did not change, other lifts left untouched, throw
  marks left untouched.

HOW TO REPORT
- Classify every finding: Critical / Major / Minor / Nit. Critical =
  data loss or corruption, or an acceptance criterion unmet.
- Be specific: file, function, what is wrong, why it matters.
- Separate real defects from style preferences.
- This is a personal/community vanilla-JS localStorage app at L1 /
  Normal risk — calibrate to that. Don't demand enterprise hardening,
  don't redesign; review what is there against the spec.

METHOD CONSTRAINT
This is the one review pass. A second round happens only if this pass
finds something Critical. Give one complete review — findings by
severity, then a one-line verdict: ship as-is, ship after fixes, or
fix-and-re-review (Critical only).
```

Attach the listed files only — don't paste ccode's build report; gpt's
review must be an independent read.

---

*End of sketch. Update only via cowork session.*

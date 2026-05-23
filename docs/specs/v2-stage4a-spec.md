# Highland Games Tracker — Stage 4a Spec Sketch (v1)

**Date:** 2026-05-21
**Skill level:** L1 — Supported
**Project risk:** Normal (see Risk note)
**Repo:** `~/dev/highland-games-tracker` — on `main`, tagged `v2.0.0-stage3b`
**Design source:** `v2-plan.md` (Stage 4 section · Lift entry model · Unit system · Storage schema v2) · `v2-stage3a-spec.md` / `v2-stage3b-spec.md` (the `userLifts` + unit precedent) · this session's resolved decisions

---

## What this is

Stage 4 of the Highland Games Tracker v2 build, **split into three** (see "Why
Stage 4 is split"). This is **Stage 4a** — the Log Session page catching up to
the v2 data model.

Stage 3a rebuilt the Set page around user-defined `userLifts`; Log Session was
deliberately left on the v1 hardcoded lift list — the "known interim state" the
3a spec flagged. Stage 4a closes that gap: it does for **Log Session** what 3a
did for the Set page — render the Strength & Conditioning section from the
athlete's `userLifts`, with unit-aware inputs. It carries **no celebration
logic**: milestones, cards, PR auto-update, and recompute-on-edit are Stages 4b
and 4c.

`v2-plan.md` holds the full design (the Stage 4 section, the Lift entry model,
the Unit system, the v2 storage schema). Read it alongside this sketch.

## Why Stage 4 is split (a / b / c)

`v2-plan.md` lists Stage 4 as one stage. It bundles roughly eight pieces across
two families — the Log Session page rework, and the celebration system. Stage 3
was split for less. The split, decided in the 2026-05-21 planning session:

- **4a — Log Session catches up.** Render S&C from `userLifts`, the 3→10
  attempt cap, the section rename and intro text. No celebration logic.
  Independently shippable; page-rework risk only. *(This sketch.)*
- **4b — the celebration system.** Milestone detection at save,
  `session.milestones[]` persistence, `prs`/`prMeta`/`goalMeta` auto-update,
  the three card types, the card queue, the Past Sessions badge and replay.
- **4c — recompute-on-edit, plus the chain prompt.** PR recomputed as
  max-across-sessions and `goalMeta` recomputed when a session is edited or
  deleted; the post-Goal chain prompt and the Set-page achieved-goal callout.
  The recompute is the risk-bearing, derived-data work — isolated for a focused
  review, the way 3b isolated the conversion engine.

4a is the visible half with none of the behavioral risk — the same shape as the
3a / 3b split.

## Stage 4a scope — the buildable chunk

1. **Render the S&C section from `userLifts`** (`session.js`). Today
   `renderForm` loops `ITEMS` and routes `category: 'lift'` items into the
   lifts list — the v1 hardcoded lifts. Change: the **Throws** section still
   renders from `ITEMS` (the fixed eight throws, unchanged). The **S&C** section
   renders one row per **active** `userLift` (`active: true`). The hardcoded
   `ITEMS` lifts are no longer rendered on Log Session.

2. **Unit-aware S&C attempt inputs** (`session.js`). A `userLift` carries a
   `unit` (one of the 10, from the `UNITS` constant). Each lift row shows the
   lift's `name` and `protocol` read-only — Log Session logs marks, it does not
   edit the lift definition; the Set page owns that. Its attempt inputs are
   unit-aware, mirroring the 3a Set-page approach (`buildLiftValueInput` /
   `readLiftCardValue` in `app.js`):
   - **Weight / Distance / Count** units → a value input accepting a plain
     number, with the unit label shown (e.g. `kg`, `m`, `reps`).
   - **`time`** unit → an `mm:ss` / `h:mm:ss` input; the mark is stored as
     **seconds** (`parseTimeToSeconds` on read, `formatSecondsAsTime` on
     display — the same way 3a stores a time-unit PR/Goal).
   Throw rows are unchanged — feet/inches for distance and height events.

3. **S&C attempt cap 3 → 10; throws stay 3** (`session.js`). The attempt cap
   becomes per-row by category: **throw rows cap at 3**, **lift rows cap at 10**
   (`v2-plan.md` — 1RM workups need the room). `buildSessionRow` builds attempt
   slots up to the row's cap; "+ Add attempt" stops at the row's cap. The v1.4
   **gap-detection rule** — a save is blocked when a row's attempts are
   non-contiguous (an empty slot before a filled one) — still applies to both
   throws and lifts, behaviour unchanged.

4. **Rename the S&C section + intro text** (`session.html`). The lift section
   heading `Lifts` becomes **`Strength and Conditioning Milestones`**. Add
   **intro text** below the heading framing the section as
   milestone-logging-only (final copy in Resolved decisions #3). The notes
   textarea label `Lifts notes` becomes **`S&C notes`**. The stored data field
   stays **`liftsNotes`** — display labels only, no schema change.

5. **Empty S&C state** (`session.js`, `session.html`, `styles.css`). When the
   S&C section would render no rows, show a single empty-state line: **"No S&C
   lifts yet — add them on the Set PRs & Goals page,"** with *Set PRs & Goals
   page* a link to `index.html`. Model the markup on the existing
   `#sessions-empty` empty-state. (Resolved decisions #2.)

6. **The Past Sessions detail view resolves `userLifts`** (`session.js`).
   `buildSessionDetailsPanel` / `buildSessionEventLine` build a session's lift
   detail lines by iterating `ITEMS` lifts and formatting via
   `formatMeasurement`. After 4a a session's lift marks are keyed by `userLift`
   ids and stored in the lift's unit. The detail view must resolve each lift id
   against **`userLifts` — active *and* inactive** (an old session can reference
   a since-removed lift) — and format lift marks by the lift's unit. Throws
   still resolve against `ITEMS` and format via `formatMeasurement`.

7. **Editing a past session renders every lift it has marks for — including
   removed ones** (`session.js`). For a **new** session the S&C section renders
   only active lifts. When **editing** a past session, it also renders a row for
   any **inactive** `userLift` that session has marks for — otherwise that row
   never reaches the DOM, `collectFormData` reads nothing for it, and "Update
   Session" silently drops those marks. A removed-lift row renders with a light
   **"removed"** tag and is **fully editable** (so a genuine typo in old data
   can still be fixed). (Resolved decisions #1.)

8. **A unit-aware lift-mark formatter** (`shared.js`). `formatMeasurement`
   formats throws (lb / feet-inches). Lift marks need formatting by unit —
   `"102.5 kg"`, `"3:45"` for a time mark, `"12 reps"`. Add a small **pure**
   helper (suggest `formatLiftMark(value, unitId)`), used by the Past Sessions
   detail view. Pure, no DOM — unit-testable like the other `shared.js`
   helpers.

9. **Tests** (`tests.js`). Cover: the S&C section renders rows from active
   `userLifts`; the 10-attempt cap on lifts and the 3-attempt cap on throws;
   unit-aware lift inputs (number vs `mm:ss`; a time mark round-trips through
   seconds); the gap-detection rule on a lift row; the empty-state condition;
   editing a session that uses an inactive lift renders its (tagged) row and a
   save preserves its marks; the Past Sessions detail view resolves an inactive
   lift id and formats lift marks by unit.

## Acceptance criteria

Stage 4a is done when all of these are true:

- [ ] The Log Session S&C section renders one row per **active** `userLift`;
      the v1 hardcoded `ITEMS` lifts no longer appear.
- [ ] The Throws section is unchanged — the fixed eight throws, feet/inches
      inputs, 3-attempt cap, stone-weight capture.
- [ ] Lift attempt inputs match the lift's unit — a plain number for
      Weight/Distance/Count units, an `mm:ss` field for `time`; time marks are
      stored as seconds.
- [ ] A lift row allows up to **10** attempts; a throw row allows up to **3**.
- [ ] The gap-detection rule still blocks a save when any row's attempts are
      non-contiguous, for both throws and lifts.
- [ ] The S&C section heading reads **"Strength and Conditioning Milestones"**;
      intro text frames it as milestone-only; the notes label reads **"S&C
      notes"**; the stored field is still `liftsNotes`.
- [ ] With no active lifts, the S&C section shows the empty-state line, and
      "Set PRs & Goals page" links to `index.html`.
- [ ] Past Sessions detail correctly shows lift marks — the name resolved from
      `userLifts` (active or inactive), the values formatted by unit.
- [ ] Editing a past session that has marks for a now-inactive lift renders
      that lift's row with a "removed" tag; the row is editable; saving the
      edit **preserves** those marks.
- [ ] Logging a new session, editing one, and deleting one all still work;
      throws, the profile modal, the Set page, and the Tests page are
      unaffected.
- [ ] A new session's lift marks are keyed by `userLift` id and stored in the
      lift's unit.
- [ ] Tests cover the items in scope point 9.

## Explicitly NOT in Stage 4a

- The **celebration system** — milestone detection, `session.milestones[]`,
  `prs`/`prMeta`/`goalMeta` auto-update on save, the PR/Goal/Awesome Day cards,
  the card queue, the Past Sessions milestone badge and replay. **Stage 4b.**
- **Recompute-on-edit** (PR as max-across-sessions, `goalMeta` recompute when a
  session changes) and the **chain prompt** + Set-page achieved-goal callout.
  **Stage 4c.**
- Any unit **conversion**. 4a renders and stores lift marks in the lift's
  *current* unit; 3b's Set-page conversion engine already handles unit changes.
  4a adds no conversion logic.
- Any **storage-schema change**. `session.milestones[]` arrives in 4b.
  `liftsNotes` keeps its field name. `version` stays `2`.
- The **Progress / See the Gap page** — Stage 5 (see Known interim state).

## Known interim state (by design)

- **See the Gap still shows the old lift list.** `gap.js` computes its lift
  comparisons by iterating `ITEMS` lifts. 4a does not touch it. After 4a, See
  the Gap still shows the **migrated v1 lifts** (their ids were preserved into
  `userLifts` by the Stage 2 migration, so they still resolve) but **not** lifts
  an athlete added in v2 (those ids are not in `ITEMS`). The page still loads
  and works; it is just incomplete for v2-added lifts. **Stage 5 replaces See
  the Gap with the Progress page** and fixes this wholesale — patching `gap.js`
  in 4a would be throwaway work. Flagged so the build and review treat it as
  expected, not a 4a defect.
- **No celebration on save.** After 4a, logging a session that beats a PR does
  nothing special — `prs` / `goalMeta` are not auto-updated by a session save.
  That is 4b. A session simply records its marks.

## Resolved decisions

Settled in the 2026-05-21 planning session. `v2-plan.md` specifies the rename,
the intro text, and the 3→10 cap but leaves these open:

1. **A removed lift in an edited session renders with a "removed" tag, fully
   editable.** Editing a past session must render a row for every lift that
   session has marks for — `collectFormData` reads marks out of the rendered
   rows, so a missing row means the marks are dropped on "Update Session." That
   constraint is fixed. The row carries a light "removed" tag so the athlete
   understands why a lift absent from new sessions is present here; it is not
   read-only, so a genuine correction to old data is still possible.

2. **The empty S&C section shows a linked pointer to the Set page.** An empty
   S&C section is a legitimate state — S&C is milestone-only and many sessions
   will have none — so it must not read as an error. The line "No S&C lifts yet
   — add them on the Set PRs & Goals page" both reassures and onboards: it tells
   a new athlete that lifts are defined on the Set page. "Set PRs & Goals page"
   is a link to `index.html`.

3. **Intro text — final copy.** A short line under the heading, framing the
   section per `v2-plan.md`'s positioning ("celebrate the moments, not track
   every rep"). Finalized with Oak on 2026-05-22 — render verbatim:

   > *Not a daily planned lift log - record a S&C Milestone only when a
   > session is worth marking; like a 1RM test, AMRAP PR attempt, etc. Most
   > days, leave it blank.*

   The framing (milestone-only, blank-is-normal) and the exact wording are
   both decided — build the copy as written.

4. **No schema change.** The notes field stays `liftsNotes` in storage; only its
   on-screen label becomes "S&C notes." `session.milestones[]` is a 4b
   addition.

## Tech notes (decided)

- Vanilla HTML/CSS/JS, no build step, browser localStorage — unchanged.
- `session.js` is substantially reworked: lift rendering from `userLifts`,
  unit-aware attempt inputs, the per-category cap, `collectFormData` and
  `findAttemptGaps` lift handling, and the Past Sessions detail path. The
  **throw path stays behaviourally identical** — same feet/inches inputs, same
  3-attempt cap, same stone-weight capture.
- Reuse the existing unit machinery in `shared.js`: the `UNITS` constant,
  `getUnit`, `parseTimeToSeconds` / `formatSecondsAsTime`. The 3a Set page's
  `buildLiftValueInput` / `readLiftCardValue` (`app.js`) are the working model
  for a unit-aware value input — Log Session's attempt inputs follow the same
  shape.
- The v1 `'weight'`-`measurementType` attempt-input branch in `buildAttemptSlot`
  served the hardcoded lifts. Every throw in `ITEMS` is `distance` or `height`,
  so after 4a the throw input path is feet/inches only and lift inputs are
  unit-driven; the dead `'weight'` branch can be removed.
- A session's lift marks (`sessions[].marks[liftId]`) are an array of plain
  numbers in the lift's unit — seconds for a `time` lift. Consistent with how 3a
  stores a lift PR/Goal.
- Migrated v1 lifts kept their `ITEMS` ids through the Stage 2 migration, so a
  v1 session's lift marks already resolve against the migrated `userLifts`
  unchanged. New sessions key lift marks by the `userLift` id (a preserved v1 id
  or a v2 `crypto.randomUUID()`).
- Resolving a session's marks for display: iterate the session's own `marks`
  keys, resolving throw ids against `ITEMS` and lift ids against `userLifts`
  (active + inactive); throws format via `formatMeasurement`, lifts via the new
  `formatLiftMark`.
- The empty-state element: a static hidden `<p>` in `session.html` toggled by
  `session.js`, or built in `session.js` — builder's call; model it on the
  existing `#sessions-empty`.

## Files Stage 4a touches

- `session.js` — render S&C from `userLifts`; unit-aware lift attempt inputs;
  per-category attempt cap; `collectFormData` / `findAttemptGaps` lift handling;
  the empty-state; removed-lift rows in the edit flow; the Past Sessions detail
  view resolving `userLifts` and formatting by unit.
- `session.html` — `Lifts` → `Strength and Conditioning Milestones`; the intro
  text; `Lifts notes` → `S&C notes`; the empty-state element.
- `shared.js` — add the pure `formatLiftMark` helper.
- `styles.css` — the "removed" tag, the empty-state line, lift attempt-input
  styling.
- `tests.js` — new coverage (scope point 9).
- `index.html`, `app.js`, `gap.js`, `gap.html`, `tests.html` — untouched.

## Risk note

Project risk is **Normal** and unchanged — local-only, single-user, no accounts,
no money. 4a does **not** rewrite historical data (that was 3b) and adds no
derived-data logic (that is 4c). Within 4a, the one careful surface is the
**edit path**:

- Editing a past session must render a row for **every lift it has marks for**,
  including inactive lifts. `collectFormData` reads marks from rendered rows
  only — a lift with no row contributes nothing, and "Update Session" would
  write the session back without it. A miss here silently drops logged history.
- The Past Sessions detail view must resolve **inactive** lift ids (old sessions
  reference removed lifts) — a miss shows a blank or broken line, not data loss,
  but still wrong.

Concentrate the gpt review there: log a session against a lift, soft-delete that
lift on the Set page, edit the old session, save — confirm the marks survive.

## Open items

None. Both items that were open here are resolved (with Oak, 2026-05-22):

- **Intro-text wording** — finalized; the decided copy is in Resolved
  decisions #3.
- **The `gap.js` interim-state** — Oak confirmed the scoping recommendation:
  Stage 4a leaves See the Gap untouched and Stage 5 replaces it wholesale.
  The smoke test treats See the Gap's incompleteness for v2-added lifts as
  expected (see Known interim state), not a 4a defect.

The spec is handoff-ready for the ccode session.

## Handoff prompt for the next ccode session

```text
ccd, this is Stage 4a of the Highland Games Tracker v2 build — the
first of a three-way split Stage 4.

Read these two files:
  - docs/specs/v2-stage4a-spec.md  (this spec — scope + acceptance
                                    criteria + resolved decisions)
  - v2-plan.md  (repo root — full v2 design: Stage 4 section, Lift
                 entry model, Unit system, Storage schema v2)

The project is at ~/dev/highland-games-tracker, on main, tagged
v2.0.0-stage3b. Stage 3 shipped the Set PRs & Goals page and the unit
conversion engine. Stage 4a makes the Log Session page render the
athlete's userLifts instead of the v1 hardcoded lift list — the same
move 3a made on the Set page — plus the 3->10 S&C attempt cap and the
"Strength and Conditioning Milestones" rename. It does NOT build the
celebration system (4b) or recompute-on-edit (4c) — no milestones, no
cards, no PR auto-update.

The spec has no open items — build to it as written. Note the Resolved
decisions section, and the Risk note: the careful surface is the edit
path — editing a session must not drop the marks of a since-removed
lift.`1``

Skill level: L1 — Supported. Project risk: Normal — 4a rewrites no
historical data; the care goes to the edit path. Reviewer: gpt.

Build to the acceptance criteria. Atomic commits, v1 style (small,
focused, feat:/fix:/chore:/refactor: prefixes, one concern each — the
section rename is its own commit, separate from the userLifts
rendering). Do not push — give me the push commands when the local
commits are ready.
```

## Review prompt for the gpt review pass

```text
You are gpt — the Reviewer in the Higgins Method, a solo build system.
A build was done by ccode (Claude Code, a separate model); your job is
an independent cross-check. This is Stage 4a of the Highland Games
Tracker v2 project — the first of a three-way split Stage 4, the Log
Session page catching up to the v2 data model. Skill level: L1 —
Supported. Project risk: Normal.

WHAT TO READ — all attached to this conversation:
- v2-stage4a-spec.md — the Stage 4a spec. Its "Acceptance criteria" is
  the bar; its "Resolved decisions" fix four design calls — do not
  relitigate them; its "Risk note" says where to concentrate; its
  "Known interim state" says what is expected rather than a bug.
- v2-plan.md — the full v2 design (Stage 4 section, Lift entry model,
  Unit system, Storage schema v2).
- session.js, session.html — the code Stage 4a rewrote.
- shared.js — for the new formatLiftMark helper and the unit machinery.
- styles.css, tests.js — the styling and the test suite.
- app.js, index.html — so you can confirm the Set page was left
  untouched, and compare 4a's unit-aware inputs to 3a's.
- higgins-method.md — your Reviewer role, the L1 level, the one-
  review-pass rule.

Review the code itself — do not rely on ccode's build report. This
must be an independent read.

CONCENTRATE HERE (the risk surface)
4a rewrites no historical data, but its edit path can silently drop it:
- Editing a past session must render a row for EVERY lift that session
  has marks for, including inactive (soft-deleted) lifts.
  collectFormData reads marks out of rendered rows only — a lift with
  no row is dropped on "Update Session." Test: log a lift, soft-delete
  it on the Set page, edit the old session, save — the marks must
  survive.
- The Past Sessions detail view must resolve inactive lift ids — an old
  session can reference a removed lift.
- The throw path must be behaviourally identical to before — same
  feet/inches inputs, 3-attempt cap, stone-weight capture, gap rule.

ALSO CHECK
- The S&C section renders from active userLifts; the v1 ITEMS lifts no
  longer appear.
- Lift attempt inputs match the unit (number vs mm:ss); time marks
  store as seconds.
- The 10-attempt cap on lifts, 3 on throws; the gap-detection rule on
  both.
- The rename: heading "Strength and Conditioning Milestones", notes
  label "S&C notes", and the stored field still liftsNotes (no schema
  change).
- The empty-state line and its link to index.html.
- NO celebration logic was built — no milestones, no cards, no PR or
  goalMeta auto-update on save (that is 4b); no recompute-on-edit
  (that is 4c).
- Whether the build meets each item in the spec's Acceptance criteria.

HOW TO REPORT
- Classify every finding: Critical / Major / Minor / Nit.
  Critical = data loss or corruption, or an acceptance criterion unmet.
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

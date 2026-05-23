# Highland Games Tracker — Stage 4b Spec Sketch (v1)

**Date:** 2026-05-22
**Skill level:** L1 — Supported
**Project risk:** Normal (see Risk note)
**Repo:** `~/dev/highland-games-tracker` — on `main`, tagged `v2.0.0-stage4a`
**Design source:** `v2-plan.md` (Stage 4 section · Celebration system · Milestone & Session data shapes · Storage schema v2) · `v2-stage4a-spec.md` (the `userLifts` + Log Session precedent) · this session's four resolved decisions (2026-05-22)

---

## What this is

Stage 4 of the Highland Games Tracker v2 build, **split into three** (see "Why Stage 4 is split"). This is **Stage 4b** — the **celebration system**.

Stage 4a brought the Log Session page onto the v2 data model. Stage 4b makes a session *save* do something: detect the milestones in it (PRs broken, goals achieved), record them, auto-update the athlete's PR and goal state, and show a queue of celebration cards. It carries **no recompute-on-edit** and **no chain prompt** — those are Stage 4c.

`v2-plan.md` holds the full design (the Stage 4 section, the Celebration system section, the Milestone and Session data shapes, the v2 storage schema). Read it alongside this sketch.

## Why Stage 4 is split (a / b / c)

`v2-plan.md` lists Stage 4 as one stage; it bundles roughly eight pieces across two families — the Log Session page rework and the celebration system. The split, decided 2026-05-21:

- **4a — Log Session catches up.** Render S&C from `userLifts`, the 3→10 attempt cap, the section rename. *Shipped, tagged `v2.0.0-stage4a`.*
- **4b — the celebration system.** Milestone detection at save, `session.milestones[]` persistence, `prs`/`prMeta`/`goalMeta` auto-update, the three card types, the card queue, the Past Sessions badge and replay. *(This sketch.)*
- **4c — recompute-on-edit, plus the chain prompt.** PR recomputed as max-across-sessions and `goalMeta` recomputed when a session is edited or deleted; the post-Goal chain prompt and the Set-page achieved-goal callout. The risk-bearing derived-data work, isolated for a focused review.

4b is where `goalMeta` and the unit `direction` field finally get consumed.

## Stage 4b scope — the buildable chunk

1. **Milestone detection at session save** (`shared.js` — a pure helper; called from `session.js`). When a **new** session is saved, for each event that has marks in the session, compute the session's **best mark** for that event — `max` of the attempts for higher-is-better units, `min` for `time` (the unit `direction` field added in 3b decides which). Then:
   - **PR.** If the event has an existing `prs[event]` and the session best beats it (per `direction`) → a **PR milestone**. If the event has **no** existing PR, set `prs[event]` from the best mark **silently — no milestone, no card** (Resolved decision 1).
   - **Goal.** If the event has a `goals[event]` value, the session best meets-or-beats it (per `direction`), and the goal is not already achieved (`goalMeta[event]` absent) → a **Goal milestone**. Goal detection is independent of PR history — a first-ever mark can fire a Goal milestone if a goal was set.
   - **Awesome Day.** If the session produced **2 or more** milestones (PR + Goal milestones combined), append one `awesomeDay` milestone.

2. **Persist milestones on the session** (`session.js`). The detected milestones are written to `session.milestones[]` and saved. Shapes (per `v2-plan.md`, with class/tier added per Resolved decision 3):
   - `{ type: 'pr', event, value, previousValue, class, tier }`
   - `{ type: 'goal', event, value, goalValue }`
   - `{ type: 'awesomeDay' }`

3. **Auto-update `prs` / `prMeta` / `goalMeta` at save** (`session.js`). No confirm step — the celebration card is the implicit confirmation.
   - `prs[event]` ← the session best whenever a PR is set (silent first mark) or broken (PR milestone).
   - `prMeta[event]` ← `{ date, location, gamesTitle, sessionId }` from the session, whenever `prs[event]` updates. The session's `games` field maps to `prMeta`'s `gamesTitle`.
   - `goalMeta[event]` ← `{ value: goalValue, achievedAt, achievedInSessionId }` when a Goal milestone fires.

4. **The card queue and the three card types** (`session.js`, `session.html`, `styles.css`). At save, build a card queue from `session.milestones[]`: **all PR cards first** (event order), **then all Goal cards** (event order), **then the Awesome Day card** if present. A same-event PR + Goal show as **two separate cards**. The queue presents as a **modal sequence — one card per screen, tap to advance, forward-only**; advancing past the last card closes back to the page (Resolved decision 2). Card content per `v2-plan.md`'s recap:
   - **PR card** — the new mark large; headline "New Personal Record"; event name; previous PR shown smaller ("was 40'"); date / games title / location / wordmark.
   - **Goal card** — headline "Goal Achieved"; the mark; the goal value shown smaller ("you set 42', you hit 43'2"); date / games title / location / wordmark.
   - **Awesome Day card** — date and games title at top; a list of the session's milestones; headline "Awesome Day"; wordmark.
   - All cards target a **square or 4:5 aspect ratio**, with the wordmark on every card. The exact visual treatment — colors, type, layout — is the build-and-react prototype (see Open items).

5. **Past Sessions badge and replay** (`session.js`, `session.html`, `styles.css`). A session row whose `milestones[]` is non-empty shows a **badge**. The expanded session detail gets a **"View Celebrations"** affordance that **replays the same card-queue modal sequence** — the cards on replay are identical to the ones seen at save, re-derived from `session.milestones[]`.

6. **Graceful handling of pre-4b sessions** (`session.js`). Sessions logged under 4a — and v1-imported sessions — have **no `milestones` field**. Read it as `session.milestones || []`: no badge, no "View Celebrations" affordance, no error. 4b computes nothing for them (Resolved decision 4).

7. **Tests** (`tests.js`). Cover: PR-break detection and the silent first-mark case; Goal detection (meets-or-beats, not-already-achieved, independent of PR history); the Awesome Day 2+ threshold; `time`-unit direction (lower is better); `session.milestones[]` persistence in the correct shapes incl. `class`/`tier`; the `prs`/`prMeta`/`goalMeta` auto-updates; the card-queue order (PRs → Goals → Awesome Day, same-event = two cards); the Past Sessions badge condition; replay re-deriving the same cards; a pre-4b session (no `milestones`) rendering no badge and not erroring.

## Acceptance criteria

Stage 4b is done when all of these are true:

- [ ] Saving a new session detects milestones: a PR milestone when the session best beats an existing `prs[event]`; a Goal milestone when the session best meets-or-beats an unachieved `goals[event]`; an Awesome Day milestone when the session yields 2+ milestones.
- [ ] A first-ever mark for an event sets `prs[event]` silently — no PR milestone, no card.
- [ ] Detection respects the unit `direction`: higher-is-better events use `max` and fire on `>`; `time` events use `min` and fire on `<`.
- [ ] Detected milestones are persisted on `session.milestones[]` in the documented shapes; PR milestones carry `class` and `tier` snapshotted from the profile.
- [ ] On save, `prs` / `prMeta` / `goalMeta` auto-update as specified, with no confirmation step.
- [ ] The card queue presents at save as a one-at-a-time modal sequence — PR cards, then Goal cards, then Awesome Day — tap to advance, forward-only, closing to the page after the last card.
- [ ] A same-event PR + Goal render as two separate cards.
- [ ] Past Sessions rows with milestones show a badge; the detail view's "View Celebrations" replays the identical card sequence.
- [ ] A session with no `milestones` field (4a-logged or v1-imported) shows no badge, offers no replay, and causes no error.
- [ ] Editing or deleting a session still saves/removes it (4a behavior); 4b adds no recompute on edit (see Known interim state).
- [ ] `version` stays `2`; throws, the Set page, the profile modal, and the Tests page are unaffected.
- [ ] Tests cover scope point 7.

## Explicitly NOT in Stage 4b

- **Recompute-on-edit** — PR recomputed as max-across-sessions, `goalMeta` recomputed, when a session is edited or deleted. **Stage 4c.**
- **The chain prompt** ("set a new goal for [event]?") after a Goal card, and the **Set-page achieved-goal callout**. **Stage 4c.**
- **Retroactive milestone detection** on sessions logged before 4b. Not done — see Resolved decision 4. Any backfill rides 4c's recompute engine.
- **Editing a session re-running detection or firing cards.** In 4b, editing a session saves its marks (4a behavior) and does **not** re-detect milestones — see Known interim state.
- The **Save-image (PNG) button** — v2.1. The **native share sheet** — v2.x.
- The **Progress / See the Gap page** — Stage 5.
- **Final visual polish** of the cards — Stage 6.

## Known interim state (by design)

- **Editing a session does not update its milestones.** After 4b, if a session's marks are edited, its `session.milestones[]` — and the `prs` / `goalMeta` those marks drove — are **not** recomputed. A session's celebration data reflects its marks *as first saved*. This is the gap Stage 4c closes; a review should treat it as expected, not a 4b defect.
- **Pre-4b sessions show no celebrations.** Sessions logged under 4a, and v1-imported sessions, carry no `milestones[]` and so show no badge or replay. By design (Resolved decision 4).
- **See the Gap still shows the old lift list.** `gap.js` is untouched by 4b, as in 4a; Stage 5 replaces it. Not a 4b concern.

## Resolved decisions

Settled in the 2026-05-22 planning session.

1. **A first-ever mark sets the PR silently — no card.** The PR card marks beating a *previous* PR; a first mark is a baseline, not progress. Without this, a new athlete's first session fires a card for every event logged — confetti for nothing, and it cheapens the card for the day it means something. Goal detection is unaffected: a first mark can still fire a Goal card, because that requires the athlete to have deliberately set a target.
   - *Consequence flagged for Oak (non-blocking):* a silent first-mark PR produces no milestone, so it carries no `class`/`tier` record — the per-PR progression history begins at the first PR *break*. If the baseline PR's class needs capturing, the fix is to also stamp `class`/`tier` into `prMeta`. Settle at spec review or in 4c.

2. **The card queue presents as a one-at-a-time modal sequence.** One card per screen, tap to advance, forward-only; the last advance closes to the page. Each card gets its own beat — the cards are built square/4:5 to be screenshotted and shared, and a card alone on screen is a clean shot; the Awesome Day card lands last as a finale. No back-navigation in 4b — re-seeing is the replay's job. The Past Sessions "View Celebrations" replay reuses this exact sequence.

3. **Capture `class` + `tier` on the PR milestone.** Snapshotted from `profile` when the PR milestone fires. The profile only knows the *current* class; the class held when a PR was set is unreconstructable later, so it is captured now even though displaying it is deferred. **Display on the card is not decided — possibly never** — and is left to the build-and-react prototype.

4. **4b detects at save, for new sessions only — no retroactive detection.** Detecting milestones across a session history is a state-replay — the same machinery as 4c's recompute — so it stays in 4c. Pre-4b sessions keep an empty/absent `milestones[]`, and 4b handles that gracefully (no badge). Backfilling old sessions, if ever wanted, rides 4c.

## Tech notes (decided)

- Vanilla HTML/CSS/JS, no build step, browser localStorage — unchanged.
- **No schema-version bump.** `session.milestones[]`, `goalMeta`, and the `prMeta` fields are all already part of the v2 schema as `v2-plan.md` defines it — 4b populates them, it does not change the shape. `version` stays `2`. 4a-logged and v1-imported sessions simply lack `milestones`; read it as `session.milestones || []`.
- **Milestone detection should be a pure helper in `shared.js`** (suggest `detectMilestones(session, data)` returning the milestone array) — no DOM, unit-testable like `formatLiftMark` and the conversion helpers. `session.js` calls it at save, persists the result, applies the `prs`/`prMeta`/`goalMeta` updates, and triggers the card modal. Keep detection separate from card rendering.
- **The unit `direction` field** (added in 3b, unused until now) drives detection: `direction: 'higher'` → best is `max`, milestone on `new > current`; `direction: 'lower'` (`time`) → best is `min`, milestone on `new < current`.
- **Best mark per event:** throws are distance/height (higher is better) — `max` of the attempts; lifts use their unit's `direction`. A `time` lift's marks are stored as seconds (per 4a), so the `min` seconds is the best.
- **`prMeta` field naming:** the session field is `games`; `prMeta` uses `gamesTitle` (`v2-plan.md` storage schema). Map `session.games` → `prMeta.gamesTitle` on write.
- **The card modal** is a new overlay component (markup in `session.html` or built in `session.js` — builder's call; model existing patterns). The queue is an index walked over the card list derived from `session.milestones[]`.
- The Set page (`index.html` / `app.js`) needs **no code change** — it reads `prs`/`goals`, which 4b keeps updated; it reflects the new values next time it loads.

## Files Stage 4b touches

- `shared.js` — the pure `detectMilestones` helper (and any pure card-content derivation helper).
- `session.js` — call detection at save; persist `session.milestones[]`; auto-update `prs`/`prMeta`/`goalMeta`; build and show the card-queue modal; the Past Sessions badge and the "View Celebrations" replay; graceful handling of sessions without `milestones`.
- `session.html` — the card modal and the badge / "View Celebrations" elements (or built in `session.js`).
- `styles.css` — the celebration cards, the modal/overlay, the badge.
- `tests.js` — new coverage (scope point 7).
- `index.html`, `app.js`, `gap.js`, `gap.html`, `tests.html` — untouched.

## Risk note

Project risk is **Normal** — local-only, single-user, no accounts, no money. But unlike 4a, **4b writes derived data**: it auto-updates `prs` / `prMeta` / `goalMeta` at save. That is the careful surface. It is all *forward* — driven by a new-session save — and 4b **never rewrites history** (that is 4c), so the blast radius is one session's save at a time.

Concentrate the gpt review on the **detection logic**:

- `direction` handling — a `time` event must fire on a *faster* mark (lower seconds), not a higher number.
- The silent first-mark case — a first mark sets `prs` but must *not* produce a milestone or a card.
- Goal detection — meets-or-beats, and only when not already achieved.
- The Awesome Day threshold — 2+ milestones, and the `awesomeDay` entry itself is not counted toward the threshold.
- The `prs`/`prMeta`/`goalMeta` writes — correct values, and the `games` → `gamesTitle` mapping.

The card modal and badge are UI — lower risk, smoke-test territory. And note the deliberate non-behavior: **editing a session does not recompute milestones in 4b** — by design (Stage 4c), not a defect.

## Open items

None blocking.

- **Card visual design** — colors, typography, exact layout. Carried from `v2-plan.md` as a build-and-react prototype; the content fields, aspect ratio, and wordmark are settled — the visual feel comes together in code.
- **Whether the PR card displays `class`/`tier`** — deferred to the prototype, possibly never (Resolved decision 3). 4b captures the data regardless.
- **A "close / skip" affordance on the card modal** — whether the athlete can dismiss the whole remaining queue mid-sequence, or only tap through. Lean: a close that ends the queue early, since the replay covers re-seeing. Builder's call at prototype; minor.
- **The first-mark / class-capture consequence** under Resolved decision 1 — confirm whether the baseline PR needs its class captured. Non-blocking.

## Handoff prompt for the next ccode session

```text
ccd, this is Stage 4b of the Highland Games Tracker v2 build — the
second of a three-way split Stage 4.

Read these two files:
  - docs/specs/v2-stage4b-spec.md  (this spec — scope, acceptance
                                    criteria, resolved decisions)
  - v2-plan.md  (repo root — full v2 design: Stage 4 section, the
                 Celebration system section, the Milestone and Session
                 data shapes, Storage schema v2)

The project is at ~/dev/highland-games-tracker, on main, tagged
v2.0.0-stage4a. Stage 4a put the Log Session page on the v2 data
model. Stage 4b is the celebration system: detect milestones when a
new session is saved (PRs broken, goals achieved), persist them on
session.milestones[], auto-update prs/prMeta/goalMeta, and show a
one-at-a-time modal queue of PR / Goal / Awesome Day cards, with a
Past Sessions badge and a "View Celebrations" replay.

It does NOT build recompute-on-edit or the chain prompt — those are
Stage 4c. Editing a session in 4b just saves marks; it does not
re-detect. 4b does not retro-detect milestones on older sessions.

Build to the spec's Acceptance criteria. Note the Resolved decisions
(four design calls — do not relitigate them) and the Risk note: the
careful surface is the detection logic, especially the unit-direction
handling and the silent first-mark case.

Skill level: L1 — Supported. Project risk: Normal. Reviewer: gpt.

Atomic commits, v1 style (small, focused, feat:/fix:/chore:/refactor:
prefixes, one concern each — detection, persistence, the card UI, and
the badge/replay are natural separate commits). Do not push — give me
the push commands when the local commits are ready.
```

## Review prompt for the gpt review pass

```text
You are gpt — the Reviewer in the Higgins Method, a solo build system.
A build was done by ccode (Claude Code, a separate model); your job is
an independent cross-check. This is Stage 4b of the Highland Games
Tracker v2 project — the celebration system, the second of a
three-way split Stage 4. Skill level: L1 — Supported. Project risk:
Normal.

WHAT TO READ — all attached to this conversation:
- v2-stage4b-spec.md — the Stage 4b spec. Its "Acceptance criteria" is
  the bar; its "Resolved decisions" fix four design calls — do not
  relitigate them; its "Risk note" says where to concentrate; its
  "Known interim state" says what is expected rather than a bug.
- v2-plan.md — the full v2 design (Stage 4, the Celebration system,
  the Milestone and Session data shapes, Storage schema v2).
- session.js, session.html — the code Stage 4b changed.
- shared.js — for the new detectMilestones helper and the unit
  machinery.
- styles.css, tests.js — the styling and the test suite.
- higgins-method.md — your Reviewer role, the L1 level, the
  one-review-pass rule.

Review the code itself — do not rely on ccode's build report. This
must be an independent read.

CONCENTRATE HERE (the risk surface)
4b writes derived data — prs/prMeta/goalMeta auto-update at save:
- Unit direction: a time event must fire a milestone on a FASTER mark
  (lower seconds), not a higher number; max for higher-is-better.
- The silent first-mark case: a first-ever mark for an event sets
  prs[event] but must NOT produce a milestone or a card.
- Goal detection: meets-or-beats, and only when the goal is not
  already achieved (goalMeta absent).
- Awesome Day: fires at 2+ milestones; the awesomeDay entry itself is
  not counted toward the threshold.
- The prs/prMeta/goalMeta writes — correct values, and the session
  games field mapped to prMeta.gamesTitle.

ALSO CHECK
- session.milestones[] is persisted in the documented shapes; PR
  milestones carry class and tier snapshotted from the profile.
- The card queue order: PR cards, then Goal cards, then Awesome Day;
  a same-event PR+Goal is two separate cards.
- The queue presents one card at a time, tap-to-advance, forward-only.
- Past Sessions badge on milestone-bearing rows; "View Celebrations"
  replays the identical sequence.
- A session with no milestones field (4a-logged / v1-imported) shows
  no badge and does not error.
- NO recompute-on-edit and NO chain prompt were built (Stage 4c); no
  retroactive detection of old sessions. Editing a session not
  re-detecting is expected, not a bug.
- version stays 2; no storage-schema shape change.
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

Attach the listed files only — don't paste ccode's build report; gpt's review must be an independent read.

---

*End of sketch. Update only via cowork session.*

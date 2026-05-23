# Highland Games Tracker — Stage 4c Spec Sketch (v1)

**Date:** 2026-05-22
**Skill level:** L1 — Supported
**Project risk:** Normal (see Risk note — 4c is the highest-risk stage of the v2 build)
**Repo:** `~/dev/highland-games-tracker` — on `main`, tagged `v2.0.0-stage4b`
**Design source:** `v2-plan.md` (Stage 4 — "Edits recompute milestones", the chain prompt, the Set-page callout · Storage schema v2) · `v2-stage4b-spec.md` (the celebration-system / detection precedent) · this session's three resolved decisions (2026-05-22)

---

## What this is

Stage 4 of the Highland Games Tracker v2 build, **split into three** (see "Why Stage 4 is split"). This is **Stage 4c** — the final piece — and it covers two things: **recompute-on-edit** and the **chain prompt** (with its Set-page callout).

Stage 4b made a new-session *save* detect milestones and fire celebration cards. But 4b deliberately left a gap: editing or deleting a session does **not** update the derived `prs` / `prMeta` / `goalMeta`, so a typo that fired a false PR card stays in the data. Stage 4c closes that — when a session is edited or deleted, the derived state is recomputed so it stays honest. And it adds the loop-closer: after a Goal card, the athlete is prompted to set a new goal, with a soft Set-page callout for goals achieved but not yet replaced.

`v2-plan.md` holds the full design (the Stage 4 section, the Celebration system section, the Milestone and Session data shapes, the v2 storage schema). Read it alongside this sketch.

## Why Stage 4 is split (a / b / c)

`v2-plan.md` lists Stage 4 as one stage; it bundles roughly eight pieces. The split, decided 2026-05-21:

- **4a — Log Session catches up.** S&C from `userLifts`, the 3→10 cap, the rename. *Shipped, tagged `v2.0.0-stage4a`.*
- **4b — the celebration system.** Milestone detection at new-session save, `session.milestones[]`, `prs`/`prMeta`/`goalMeta` auto-update, the three card types, the card queue, the Past Sessions badge and replay. *Shipped, tagged `v2.0.0-stage4b`.*
- **4c — recompute-on-edit, plus the chain prompt.** PR recomputed as max-across-sessions and `goalMeta` recomputed when a session is edited or deleted; the post-Goal chain prompt and the Set-page achieved-goal callout. *(This sketch.)*

4c is the **risk-bearing, derived-data** half — isolated for a focused review, the way 3b isolated the unit conversion engine.

## Stage 4c scope — the buildable chunk

1. **Recompute the derived state on session edit / delete** (`shared.js` — a pure helper; called from `session.js`). When a session is **edited** (Update Session) or **deleted**, rebuild the derived data from all remaining sessions:
   - **`prs[event]`** = the best mark across **all** sessions for that event — `max` of the per-session bests for higher-is-better units, `min` for `time` (the unit `direction` field). If no session has marks for an event, `prs[event]` is removed.
   - **`prMeta[event]`** = the `{ date, location, gamesTitle, sessionId }` of whichever session holds that best mark.
   - **`goalMeta[event]`** = recomputed by scanning sessions in date order: the first session whose best meets-or-beats `goals[event]` sets `goalMeta[event] = { value: goalValue, achievedAt, achievedInSessionId }`. If **no** session meets the goal anymore, `goalMeta[event]` is **cleared** — the goal returns to "not yet achieved."
   - The active **`goals[event]` value is never touched** by recompute — only the athlete changes it.
   - Recompute is the same `max`/`min` machinery for new-session saves too, but 4b's save path is unchanged; 4c only adds the edit/delete path.

2. **Recompute the edited session's own `milestones[]`** (`session.js`). After an edit, the **edited session's** `milestones[]` is re-derived by the 4b detection rule (against the recomputed baseline). The result is diffed against the session's old `milestones[]`:
   - A milestone now present that was not before → **created** → fire the 4b celebration card queue (and, for a Goal milestone, the chain prompt — scope point 3).
   - A milestone gone that was there before → **removed** → **silent**.
   - **Every other session's `milestones[]` is left frozen** (Resolved decision 1). See Known interim state.

3. **The chain prompt** (`session.js`, `session.html`, `styles.css`). When a **Goal** card is dismissed in the celebration queue, a chain prompt appears **right after that card**, before the queue advances: *"Want to set a new goal for [event]?"* It carries an **inline, unit-aware input** — the Set page's goal input from Stage 3a, reused — and a **"Not now"** skip. Setting a value updates `goals[event]` and re-evaluates `goalMeta[event]` for that event (a fresh, unmet goal clears `goalMeta`). "Not now" leaves the goal in its achieved-but-unreplaced state, which the Set-page callout (scope point 4) then surfaces. The chain prompt fires after a Goal card whether the card came from a new-session save (4b) or from an edit-created milestone (scope point 2).

4. **The Set-page achieved-goal callout** (`app.js`, `index.html`, `styles.css`). On the Set PRs & Goals page, an event whose **current goal has been achieved and not replaced** shows an **inline soft callout at that event's Goal field** — a small, gentle marker, not a banner, sitting where the athlete would type a new goal value. Condition: `goalMeta[event]` exists and `goalMeta[event].value === goals[event]`.

5. **Tests** (`tests.js`). Cover: recompute on edit and on delete — `prs`/`prMeta`/`goalMeta` rebuilt as best-across-sessions; deleting the PR-holding session drops `prs` to the next best; deleting the last session for an event clears its `prs`/`prMeta`; `goalMeta` clears when no session meets the goal; the active `goals[event]` is never auto-changed; the edited session's `milestones[]` recomputes (created → card, removed → silent) while other sessions' records stay put; the chain prompt updates `goals[event]`; the Set-page callout condition.

## Acceptance criteria

Stage 4c is done when all of these are true:

- [ ] Editing a session recomputes `prs` / `prMeta` / `goalMeta` as the best mark across all sessions, per unit `direction`.
- [ ] Deleting a session recomputes the same way from the remaining sessions; deleting the PR-holding session drops `prs[event]` to the next-best; deleting the last session for an event removes its `prs`/`prMeta`.
- [ ] `goalMeta[event]` is recomputed and **cleared** when no remaining session meets the goal.
- [ ] The active `goals[event]` value is never changed by recompute — only by the athlete (Set page or chain prompt).
- [ ] After an edit, the **edited** session's `milestones[]` is recomputed; a newly-created milestone fires the celebration card queue, a removed one is silent; **no other session's `milestones[]` changes**.
- [ ] After a Goal card, a chain prompt appears for that event with an inline unit-aware input and a "Not now" skip; setting a value updates `goals[event]`.
- [ ] The Set page shows an inline soft callout at the Goal field of any event whose current goal is achieved-and-unreplaced.
- [ ] The Stage 4b new-session save path, the celebration cards, the badge, and the replay are unchanged.
- [ ] `version` stays `2`; throws, the profile modal, and the Tests page are unaffected.
- [ ] Tests cover scope point 5.

## Explicitly NOT in Stage 4c

- **Retroactively rewriting *other* sessions' `milestones[]`.** Only the edited session's record is recomputed; all others stay frozen as-experienced (Resolved decision 1).
- The **Progress / See the Gap page** — Stage 5.
- **Final visual polish** — the celebration cards, the chain prompt's exact look, the callout's exact look. Stage 6.
- The **Save-image (PNG) button** (v2.1) and the **native share sheet** (v2.x).

## Known interim state (by design)

- **Editing one session does not change another session's badge.** Because only the edited session's `milestones[]` recomputes (Resolved decision 1), a rare case persists: if an old typo had suppressed a later session's legitimate milestone, fixing the typo will not retroactively give that later session its badge. The *live* `prs`/`goalMeta` are fully correct; only the frozen historical badge is affected. By design — a `milestones[]` record is a celebration as the athlete experienced it, not a live view. A review should treat this as expected, not a defect.
- **See the Gap still shows the old lift list.** `gap.js` is untouched by 4c, as in 4a/4b; Stage 5 replaces it. Not a 4c concern.

## Resolved decisions

Settled in the 2026-05-22 planning session.

1. **Recompute scope.** An edit or delete recomputes the live `prs` / `prMeta` / `goalMeta` **globally** (best-across-all-sessions, order-independent) and recomputes the **edited session's own `milestones[]`**. Every **other** session's `milestones[]` is left **frozen**. Rationale: a milestone record is a celebration *as the athlete experienced it* — a historical fact — not a continuously-recomputed view. Recompute exists to keep the *current* PR and goal numbers honest after a typo fix, not to rewrite the history of which days felt like a win. Rippling edits into a full replay is heavier and stranger (editing one session would silently add or strip badges on unrelated sessions); the cost of not doing it is one rare edge case (see Known interim state) — a missing badge on an old row, never a wrong number or lost data.

2. **The chain prompt.** Fires **right after each Goal card** in the celebration queue (not batched after the whole queue) — maximum context, the next beat after "Goal Achieved · [event]." It carries an **inline unit-aware input** (the Stage 3a goal input, reused — feet/inches for throws, the unit-aware value input for lifts) so the loop closes in place with zero navigation, plus a **"Not now"** skip.

3. **The Set-page achieved-goal callout.** An **inline soft marker at the event's Goal field** on the Set page — not a top banner. "Soft" per `v2-plan.md`, and contextual: the nudge sits exactly where the athlete acts on it. Shown for any event whose current goal is achieved and not yet replaced.

## Tech notes (decided)

- Vanilla HTML/CSS/JS, no build step, browser localStorage — unchanged. `version` stays `2` (no schema-shape change; 4c only populates and rebuilds existing fields).
- **Recompute should be a pure helper in `shared.js`** (suggest `recomputeDerivedState(data)` returning the rebuilt `prs`/`prMeta`/`goalMeta`) — no DOM, unit-testable like `detectMilestones` and the conversion helpers. `session.js` calls it after an edit or delete, then saves.
- Recompute uses the unit **`direction`** — `prs` is `max` for higher-is-better events, `min` for `time`.
- **`prMeta` tie-break:** if more than one session holds the same best mark, `prMeta` points at the earliest such session (by date, then save order). Builder's call; minor.
- **`goalMeta` recompute:** scan sessions in date order; `achievedInSessionId` / `achievedAt` come from the first session to meet the goal.
- **The edited session's milestone re-derivation** is the careful surface. Re-derive that session's `milestones[]` by the 4b rule, detecting against the baseline as of immediately *before* that session (the best across chronologically-prior sessions), then diff against its old `milestones[]` — created milestones fire the 4b card queue, removed ones are silent. Order sessions by date, then by save order, for "before." See Risk note.
- The **chain prompt reuses the Stage 3a unit-aware goal input**; setting a value writes `goals[event]` and re-evaluates `goalMeta[event]`.
- The **Set-page callout** is driven entirely by data already present (`goalMeta`, `goals`) — `app.js` renders the inline marker when `goalMeta[event]` exists and equals the current `goals[event]`.
- The **4b new-session save path is not changed** — 4c adds the edit/delete recompute path alongside it.

## Files Stage 4c touches

- `shared.js` — the pure `recomputeDerivedState` helper; the edited-session milestone re-derivation helper.
- `session.js` — call recompute on edit/delete; recompute the edited session's `milestones[]`; fire the card queue / chain prompt on edit-created milestones; the chain prompt after Goal cards.
- `session.html` — the chain prompt markup (or built in `session.js`).
- `app.js` — the Set-page achieved-goal callout.
- `index.html` — the callout element (or built in `app.js`).
- `styles.css` — the chain prompt, the callout.
- `tests.js` — new coverage (scope point 5).
- `gap.js`, `gap.html`, `tests.html` — untouched.

## Risk note

Project risk is **Normal** — local-only, single-user, no accounts, no money. But **4c is the highest-risk stage of the v2 build**: it is the only stage that *rewrites historical derived data*. Every edit or delete rebuilds `prs` / `prMeta` / `goalMeta` across the whole dataset. A bug here means a wrong PR, a lost or false goal-achievement record, or corrupted celebration history. This is exactly why Stage 4 was split to isolate 4c for a focused review — the same reasoning as 3b's conversion engine.

Concentrate the gpt review on:

- **Recompute correctness** — `prs` is the correct `max`/`min` per `direction`; `prMeta` points at the right session; `goalMeta` is recomputed and **cleared** when no session meets the goal; the active `goals[event]` is never auto-changed.
- **Delete** — recompute from the remaining sessions; deleting the PR-holder drops to next-best; deleting the last session for an event clears its `prs`/`prMeta`.
- **The edited session's milestone re-derivation** — the baseline it detects against, the created/removed diff, created → card / removed → silent.
- **That no other session's `milestones[]` is touched** by an edit (Resolved decision 1).

The chain prompt and the Set-page callout are UI — lower risk, smoke-test territory.

## Open items

None blocking.

- The chain prompt's and the callout's exact visual treatment — colors, wording, icon — is prototype-light, Stage 6 polish. The behavior, placement, and inputs are settled here.
- `prMeta` tie-break when multiple sessions hold the same best mark — earliest suggested; builder's call.

## Handoff prompt for the next ccode session

```text
ccd, this is Stage 4c of the Highland Games Tracker v2 build — the
final piece of a three-way split Stage 4.

Read these two files:
  - docs/specs/v2-stage4c-spec.md  (this spec — scope, acceptance
                                    criteria, resolved decisions)
  - v2-plan.md  (repo root — full v2 design: Stage 4 section, the
                 Celebration system section, the Milestone and Session
                 data shapes, Storage schema v2)

The project is at ~/dev/highland-games-tracker, on main, tagged
v2.0.0-stage4b. Stage 4b made a new-session save detect milestones and
fire celebration cards. Stage 4c is recompute-on-edit plus the chain
prompt: when a session is edited or deleted, rebuild prs/prMeta/
goalMeta from all sessions so the derived data stays honest; recompute
the edited session's own milestones[] (created -> fire the card,
removed -> silent) while leaving every other session's frozen; after
each Goal card, show a chain prompt to set a new goal inline; and on
the Set page, show a soft inline callout for goals achieved but not
replaced.

Note the Resolved decisions (three design calls — do not relitigate
them) and the Risk note: 4c rewrites historical derived data, so the
careful surface is recompute correctness and the edited-session
milestone re-derivation.

Skill level: L1 — Supported. Project risk: Normal — but 4c is the
highest-risk stage; treat the recompute path with care. Reviewer: gpt.

Atomic commits, v1 style (small, focused, feat:/fix:/chore:/refactor:
prefixes, one concern each — the recompute helper, the edited-session
milestone recompute, the chain prompt, and the Set-page callout are
natural separate commits). Do not push — give me the push commands
when the local commits are ready.
```

## Review prompt for the gpt review pass

```text
You are gpt — the Reviewer in the Higgins Method, a solo build system.
A build was done by ccode (Claude Code, a separate model); your job is
an independent cross-check. This is Stage 4c of the Highland Games
Tracker v2 project — recompute-on-edit and the chain prompt, the final
piece of a three-way split Stage 4. Skill level: L1 — Supported.
Project risk: Normal, but 4c is the highest-risk stage of the build.

WHAT TO READ — attach all 10 files. The list is alphabetical to match
the file picker, and numbered so you know when all 10 are attached:

1.  app.js — for the Set-page achieved-goal callout.
2.  higgins-method.md — your Reviewer role, the L1 level, the
    one-review-pass rule.
3.  index.html — for the Set-page achieved-goal callout.
4.  session.html — the markup Stage 4c changed.
5.  session.js — the code Stage 4c changed.
6.  shared.js — the new recomputeDerivedState helper and the
    detection / unit machinery.
7.  styles.css — styling for the chain prompt and the callout.
8.  tests.js — the test suite.
9.  v2-plan.md — the full v2 design (Stage 4, the Celebration system,
    the Milestone and Session data shapes, Storage schema v2).
10. v2-stage4c-spec.md — the Stage 4c spec. "Acceptance criteria" is
    the bar; "Resolved decisions" fix three design calls (do not
    relitigate them); "Risk note" says where to concentrate; "Known
    interim state" says what is expected rather than a bug.

Review the code itself — do not rely on ccode's build report. This
must be an independent read.

CONCENTRATE HERE (the risk surface)
4c rewrites historical derived data — it is the riskiest stage:
- Recompute correctness: prs is the correct max for higher-is-better
  events and min for time; prMeta points at the session that holds
  that best mark; goalMeta is recomputed and CLEARED when no remaining
  session meets the goal; the active goals[event] value is never
  auto-changed.
- Delete: recompute from the remaining sessions; deleting the
  PR-holding session drops prs to the next best; deleting the last
  session for an event clears its prs/prMeta.
- The edited session's milestones[] re-derivation: the baseline it
  detects against, the created-vs-removed diff, created -> fires the
  card queue, removed -> silent.
- No OTHER session's milestones[] is changed by an edit (Resolved
  decision 1) — editing one session must not rewrite another's badge.

ALSO CHECK
- The chain prompt fires after each Goal card, has an inline
  unit-aware input and a "Not now" skip, and setting a value updates
  goals[event].
- The Set-page callout shows inline at the Goal field for events whose
  current goal is achieved and not replaced.
- The 4b new-session save path, the cards, the badge, and the replay
  are unchanged.
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

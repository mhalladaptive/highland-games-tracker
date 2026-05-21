# Highland Games Tracker — Stage 3a Spec Sketch (v1)

**Date:** 2026-05-20
**Skill level:** L1 — Supported
**Project risk:** Normal (see Risk note)
**Repo:** `~/dev/highland-games-tracker` — on `main`, tagged `v2.0.0-stage2`
**Design source:** `v2-plan.md` (Stage 3 section · Lift entry data model · Unit system · Storage schema v2)

---

## What this is

Stage 3 of the Highland Games Tracker v2 build, **split into two**. This is
**Stage 3a** — the visible half: it replaces the v1 Set Baseline page with
the new **Set PRs & Goals** page. Stage 3b, a separate later build, adds the
unit *conversion engine*.

Stage 3a is where the data Stage 2 added to the schema but left unused —
`goals` and `userLifts` — finally gets a UI. It is the first stage an
athlete sees a real change since the rebrand.

`v2-plan.md` holds the full design (the Stage 3 section, the Lift entry
model, the Unit system, the v2 storage schema). Read it alongside this
sketch.

## Why Stage 3 is split

`v2-plan.md` lists Stage 3 as one stage. It bundles a page rewrite,
user-defined lift cards, and a unit system — and the unit system carries a
*conversion engine* that rewrites stored data (auto-converting a lift's PR,
Goal, and every historical session mark when its unit changes). That engine
is the one genuinely risky piece. Splitting lets 3a ship the entire visible
payoff while the data-rewriting logic is built and reviewed alone in 3b.

**The 3a / 3b seam:**

- **3a** builds the page, the lift cards, and a fully populated unit
  dropdown. A lift's unit is freely editable *until that lift has marks* —
  a PR, a Goal, or a session mark. Once it has any mark, **the unit field
  locks** (disabled).
- **3b** unlocks it: a same-category unit change auto-converts the PR,
  Goal, and all historical session marks; cross-category changes are
  blocked; the dropdown filters to same-category options.

The lock is a deliberate, stricter placeholder for 3b's behavior. It means
3a never displays a value it cannot stand behind.

## Stage 3a scope — the buildable chunk

1. **Replace the Set Baseline page** (`index.html`, `app.js`). The page
   becomes **Set PRs & Goals**. The "Set Baseline" nav link updates to
   "Set PRs & Goals" in all four page headers (`index.html`,
   `session.html`, `gap.html`, `tests.html`). The Stage 2 profile modal
   stays as-is.

2. **Throws section** — the eight throws stay a fixed list (from `ITEMS`).
   Each throw row gets two fields: a **PR** and a **Goal**, using the same
   measurement-appropriate input style as the v1 page (feet/inches for
   distance and height events). The PR field also carries date / location
   metadata, written to `prMeta`; the Goal field is value-only. PR values
   write to `prs`, Goal values to `goals`. The v1 per-stone "stone thrown"
   weight input is not carried onto this page (see Resolved decisions).

3. **Strength & Conditioning section — user-defined lift cards.** Renders
   one card per *active* `userLift`. Each card has: name (free text),
   protocol (free text), unit (dropdown), PR (value), Goal (value).
   Migrated v1 lifts (already in `userLifts` from the Stage 2 migration)
   render as cards. Lift cards carry no date/location metadata — only
   throws do, matching `v2-plan.md`.

4. **"+ Add lift"** — a button at the foot of the S&C section creates a
   new blank card. On save, a new `userLifts` entry is created with a
   stable unique id (e.g. `crypto.randomUUID()`) and `active: true`.

5. **✕ soft-delete** — each card has a ✕ in the top-right corner. It sets
   that lift's `active: false`. The card leaves the Set page; the
   `userLifts` entry and any session marks keyed to its id stay in
   storage. The Set page renders only `active` lifts.

6. **The unit dropdown** — fully populated: the 10 units in 4
   `<optgroup>`s (Weight / Distance / Time / Count), per `v2-plan.md` →
   "Unit system". Define the unit set as a constant (suggest `shared.js`,
   so 3b, Stage 4, and Stage 5 can reuse it); each unit carries `id`,
   `label`, `category`, and `direction`. `direction` is stored but not
   consumed in 3a.

7. **The unit-lock rule** — a lift's unit dropdown is editable while the
   lift has no PR, Goal, or session mark. Once any mark exists for that
   lift, the unit field is disabled. (Stage 3b replaces the lock with
   conversion.)

8. **Lift PR / Goal inputs adapt to the unit** — a plain number for
   Weight / Distance / Count units; an `mm:ss` / `h:mm:ss` time field for
   the `time` unit.

9. **Persistence** — saving writes `prs`, `prMeta`, `goals`, and
   `userLifts` through `saveData`; a reload shows the saved state.

10. **Tests** — cover the new Set-page logic: `userLift` create /
    soft-delete / id assignment, the unit-lock rule, throw PR+Goal
    capture, time-format parse and format.

## Acceptance criteria

Stage 3a is done when all of these are true:

- [ ] The Set Baseline page is gone; `index.html` is the Set PRs & Goals
      page. The nav link reads "Set PRs & Goals" on all four pages.
- [ ] Each of the eight throws shows a PR field and a Goal field. PR
      writes `prs` (with date/location to `prMeta`); Goal writes `goals`.
- [ ] PR and Goal values saved under Stage 2 — and migrated v1 data —
      load and display correctly.
- [ ] The S&C section renders one card per *active* `userLift`; migrated
      v1 lifts appear as cards.
- [ ] "+ Add lift" creates a card; on save it becomes a `userLifts`
      entry with a stable unique id and `active: true`.
- [ ] ✕ on a card sets `active: false`; the card leaves the page; the
      `userLifts` entry and any session marks for its id remain in
      storage.
- [ ] The unit dropdown lists all 10 units under the 4 category
      `<optgroup>`s.
- [ ] A lift's unit is editable while it has no PR / Goal / session mark;
      once any mark exists, the unit field is disabled.
- [ ] A lift card's PR/Goal inputs accept a plain number for
      weight/distance/count units, and `mm:ss` (or `h:mm:ss`) for `time`.
- [ ] Saving persists `prs` / `prMeta` / `goals` / `userLifts`; a reload
      shows the saved state.
- [ ] The profile modal still behaves as in Stage 2.
- [ ] Log Session, See the Gap, and Tests pages still load and work.
- [ ] Tests cover userLift create / soft-delete / id assignment, the
      unit-lock rule, throw PR+Goal capture, and time-format handling.

## Explicitly NOT in Stage 3a

- The **unit conversion engine** — Stage 3b. In 3a the unit simply locks
  once a lift has marks.
- Any change to **Log Session** — Stage 4 (see Known interim state).
- The **celebration system**, milestone firing, PR auto-update from
  sessions — Stage 4.
- The **Progress page** — Stage 5.
- The goal **chain prompt** and the achieved-goal soft callout on the Set
  page — Stage 4.
- `direction` is carried on each unit but nothing in 3a consumes it.

## Known interim state (by design)

Stage 3a moves the **Set page** to user-defined `userLifts`, but **Log
Session is not touched until Stage 4**. Between 3a and Stage 4: the Set
page shows user-defined lift cards while Log Session still shows the v1
hard-coded lift list. A lift added in 3a cannot be logged in a session
until Stage 4; a lift soft-deleted in 3a still appears on Log Session
until then. This is inherent to `v2-plan.md`'s stage ordering (Stage 3 =
Set page, Stage 4 = Log Session) — flagged so the build and the review
treat it as expected, not a defect.

## Tech notes (decided)

- Vanilla HTML/CSS/JS, no build step, browser localStorage — unchanged.
- `index.html` and `app.js` are substantially rewritten; the v1 Set
  Baseline form logic (`buildRow` etc.) is replaced.
- The unit set is a plain JS constant; the lift-card unit dropdown is a
  native `<select>` with `<optgroup>`s.
- The unit-lock needs a "does this lift have any marks" check — a PR or
  Goal value, or any mark for that lift id across `sessions`. Suggest a
  small shared helper in `shared.js`.

## Files Stage 3a touches

- `index.html` — rewritten as the Set PRs & Goals page; nav label.
- `app.js` — rewritten: throws PR+Goal, user-defined lift cards, +Add,
  soft-delete, the unit dropdown and the lock.
- `shared.js` — add the unit-set constant; a "lift has marks" helper.
- `styles.css` — lift card styling, the two-field PR/Goal layout.
- `session.html`, `gap.html`, `tests.html` — the "Set Baseline" →
  "Set PRs & Goals" nav label only.
- `tests.js` — new coverage.
- `session.js` — unchanged (see Known interim state).

## Risk note

Normal. Stage 3a writes `prs` / `goals` / `userLifts` but does not rewrite
historical data — the risky operation is deferred to 3b. The careful part
of 3a is the unit-lock rule: get the "has marks" check right so a unit
cannot be silently changed under existing data.

## Resolved decisions

- **Stone-weight input — dropped from the Set page.** v1's Set Baseline
  page had a per-stone "stone thrown" weight input for Braemar and Open
  Stone. The Set PRs & Goals page does not carry it: a stone's weight is
  neither a PR nor a Goal, and stone weight is captured per-session on
  Log Session, where it belongs. `stoneWeights` stays in the v2 schema
  unchanged, and Log Session's per-session capture is untouched.
- No open items remain — Stage 3a is handoff-ready.

## Handoff prompt for the next ccode session

```
ccd, this is Stage 3a of the Highland Games Tracker v2 build — the
first half of a split Stage 3.

Read these two files in the repo root:
  - v2-stage3a-spec.md  (this spec sketch — scope + acceptance criteria)
  - v2-plan.md          (full v2 design — Stage 3 section, Lift entry
                         model, Unit system, Storage schema v2)

The project is at ~/dev/highland-games-tracker, on main, tagged
v2.0.0-stage2. Stage 2 shipped (schema v2, the migration, the profile
modal). Stage 3a replaces the Set Baseline page with the Set PRs &
Goals page; it does NOT touch Log Session and does NOT build the unit
conversion engine — that is Stage 3b.

The spec has no open items — build to it as written.

Skill level: L1 — Supported. Project risk: Normal — the careful part
is the unit-lock rule (the "does this lift have marks" check), not a
data rewrite. Reviewer: gpt.

Build to the acceptance criteria. Atomic commits, v1 style (small,
focused, feat:/fix:/chore:/refactor: prefixes, one concern each). Do
not push — give me the push commands when the local commits are ready.
```

## Review prompt for the gpt review pass

```
You are gpt — the Reviewer in the Higgins Method, a solo build system.
A build was done by ccode (Claude Code, a separate model); your job is
an independent cross-check. This is Stage 3a of the Highland Games
Tracker v2 project — the first half of a split Stage 3. Skill level:
L1 — Supported. Project risk: Normal.

WHAT TO READ — all attached to this conversation:
- v2-stage3a-spec.md — the Stage 3a spec sketch. Its "Acceptance
  criteria" section is the bar the build must meet; its "Risk note"
  and "Known interim state" say where to concentrate and what is
  expected rather than a bug.
- v2-plan.md — the full v2 design (Stage 3 section, Lift entry model,
  Unit system, Storage schema v2).
- shared.js, app.js, index.html, styles.css — the code Stage 3a
  rewrote or added to.
- tests.js — the test suite.
- session.js — so you can confirm Log Session was left untouched.
- higgins-method.md — your Reviewer role, the L1 level, the "one
  review pass" rule.

CONCENTRATE HERE (the risk surface)
Stage 3a does not rewrite stored data — that is Stage 3b. The careful
parts of 3a are:
- The unit-lock rule. liftHasMarks(data, liftId) must return true if a
  PR, a Goal, OR any session mark exists for that lift id. A miss lets
  a unit be silently changed under existing data.
- Soft-delete. The card's X sets active:false; the userLifts entry and
  any session marks for that id must be retained, never deleted.
- New-lift id assignment. The temporary "new-N" id must be replaced
  with a stable unique id (crypto.randomUUID) on save — no collisions,
  no loss.
- applyFormSnapshotsToData — the pure data-rules function (id
  assignment, soft-delete by absence, trimming, write-or-delete of
  PR/Goal). Confirm it does not mutate its input.
- The 3a/3b boundary. Confirm NO unit-conversion logic was built —
  no same-category auto-convert, no cross-category handling. In 3a the
  unit only locks; 3b converts.

ALSO CHECK
- The Set Baseline page is fully replaced; the nav label reads "Set
  PRs & Goals" on all four pages.
- Throws write PR to prs (with date/location to prMeta) and Goal to
  goals.
- The unit dropdown carries all 10 units in 4 optgroups.
- Time-unit lifts use mm:ss inputs and store seconds;
  parseTimeToSeconds / formatSecondsAsTime round-trip correctly.
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

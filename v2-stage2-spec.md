# Highland Games Tracker — Stage 2 Spec Sketch (v1)

**Date:** 2026-05-19
**Skill level:** L1 — Supported
**Project risk:** Normal (see Risk note)
**Repo:** `~/dev/highland-games-tracker` — on `main`, tagged `v2.0.0-rebrand`
**Design source:** `v2-plan.md` (Stage 2 section · Data model · Class taxonomy · Unit system)

---

## What this is

Stage 2 of the Highland Games Tracker v2 build: the **data-model stage**. It
bumps the localStorage schema from v1 to v2, migrates existing data into the
new shape, teaches the backup importer to accept v1 (`comeback-tracker`)
files, and adds a first-launch profile capture modal.

Per `v2-plan.md`: *"The schema-bump and migration stage. UI doesn't change
yet; the data shape underneath does."* The one exception is the new profile
modal. Stages 3–5 (Set PRs & Goals page, celebration system, Progress page)
build on this foundation and are **not** in Stage 2.

This is the handoff-ready slice. `v2-plan.md` holds the full design detail —
the exact v2 schema, the seven migration steps, the class/tier taxonomy, the
unit system. Read both files.

---

## Stage 2 scope — the buildable chunk

Five pieces:

1. **Storage schema bump v1 → v2** (`shared.js`). Rename `baselines` → `prs`
   and `baselineMeta` → `prMeta`. Add `goals`, `goalMeta` (empty maps) and
   `userLifts` (array). Add a `profile` object. Bump `version: 1` →
   `version: 2`. The v2 shape is in `v2-plan.md` → "Storage schema (v2)".

2. **v1 → v2 migration** (`shared.js`). Runs inside `loadData()` when
   `version: 1` is detected — same pattern as the existing
   `migrateLegacyGamesLocation`. Idempotent (no-op once data is v2).
   Persists via `saveData` when it runs. The seven steps are in
   `v2-plan.md` → "Migration". Schema migration runs **before** the legacy
   games-in-location migration.

3. **userLifts from v1 lifts** (part of the migration). v1 hard-coded lift
   items (`ITEMS` with `category: 'lift'`) that carry a baseline value
   become `userLifts` entries — name and protocol from `ITEMS`,
   `unit: 'lb'`, `active: true`, and the **v1 id preserved** so existing
   session marks still resolve. Lifts with no baseline value, and all
   throws, are not added to `userLifts`.

4. **Backup import accepts v1 files** (`shared.js` `validateBackup`,
   `app.js` import path). `validateBackup` accepts both
   `appName: 'comeback-tracker'` and `'highland-games-tracker'`, and both
   `version: 1` and `version: 2` envelopes. An imported v1 payload runs
   through the schema migration before it is saved, so localStorage always
   lands in v2 shape.

5. **Profile capture modal** (`index.html`, `styles.css`, `app.js`). On
   first launch — when `profile.setupCompletedAt` is absent — a modal
   collects name, gender, weight schedule, class, and tier. All fields
   optional. **Fires on `index.html` only** (decided — it's the home page;
   `session.html`/`gap.html` are secondary entry points). On completion it
   writes `profile` including `setupCompletedAt` and does not reappear.
   The Profile schema and the class/tier taxonomy are in `v2-plan.md` →
   "Profile" and "Class taxonomy".

### Keeping the app shippable — the consumer rename

`v2-plan.md` says the UI doesn't change in Stage 2, and that every stage
stays "independently shippable." Both hold only if the code that *reads*
the renamed fields moves with the rename. `app.js` (Set Baseline page) and
`gap.js` (See the Gap page) read `data.baselines` / `data.baselineMeta`,
and `app.js`'s `collectFormData` returns those keys — all must become
`prs` / `prMeta`. It is a pure mechanical rename: no behavior or visible
change. `session.js` does not touch these fields and needs no change. Do
**not** rename user-facing strings — the page is still titled "Set
Baseline," aria-labels still say "baseline"; Stage 3 replaces that page
wholesale.

---

## Acceptance criteria

Stage 2 is done when all of these are true:

- [ ] A v1 localStorage payload (`version: 1`, `baselines`/`baselineMeta`)
      loads as v2: `baselines` → `prs`, `baselineMeta` → `prMeta`,
      `goals`/`goalMeta`/`userLifts`/`profile` present, `version: 2`.
- [ ] The migration persists — a second `loadData()` reads data already in
      v2 shape, and the v1 `baselines` key is gone from storage.
- [ ] The migration is idempotent — running it on v2 data changes nothing.
- [ ] v1 hard-coded lifts with a baseline value become `userLifts` entries
      with ids preserved; lifts without a baseline, and all throws, do not.
- [ ] A fresh install (empty localStorage) starts in v2 shape.
- [ ] Set Baseline and See the Gap still render and save correctly — no
      visible change from v1.4.
- [ ] Log Session still works (unaffected — it does not read the renamed
      fields).
- [ ] `validateBackup` accepts all four envelope combinations:
      {`comeback-tracker`, `highland-games-tracker`} × {`v1`, `v2`}.
- [ ] An imported v1 backup is schema-migrated to v2 before it is saved.
- [ ] First launch on `index.html` (no `profile.setupCompletedAt`) shows
      the profile modal; all fields optional; on completion it writes
      `profile` with `setupCompletedAt` and never reappears.
- [ ] The tier dropdown appears/hides per the selected class, per the
      `v2-plan.md` taxonomy.
- [ ] The test suite is updated to the v2 shape and passing, with new
      coverage for the migration, backup import (all four combinations),
      and the profile defaults.

---

## Explicitly NOT in Stage 2

- The **Set PRs & Goals page** — Stage 3.
- The **unit system UI** (the 10-option dropdown, same-category
  conversion). `userLifts` carries a `unit` field, but nothing renders or
  edits it yet — Stage 3.
- The **celebration system** and **Log Session** changes — Stage 4.
- The **Progress page** — Stage 5.
- Any *use* of the `profile` data. The modal captures it; nothing reads it
  until the celebration cards in Stage 4.
- Visual change to existing pages, beyond the new modal.

---

## Tech notes (decided)

- Vanilla HTML/CSS/JS, no build step, browser localStorage — unchanged.
- The migration follows the existing `migrateLegacyGamesLocation` shape: a
  function that mutates the data object and returns whether it changed
  anything; `loadData` persists via `saveData` when it did.
- Ordering: schema migration first, then `migrateLegacyGamesLocation`
  (which operates on sessions and is unaffected by the rename).
- Class and tier taxonomy: plain JS constants — suggest `shared.js`, so
  Stage 3 can reuse them.
- Profile modal: plain HTML/CSS — a native `<dialog>` or an overlay div,
  builder's call.

## Files Stage 2 touches

No new files required.

- `shared.js` — v2 schema in `loadData`, the migration + userLifts builder,
  `validateBackup`, class/tier taxonomy constants.
- `app.js` — `baselines`/`baselineMeta` → `prs`/`prMeta` rename; run the
  migration on imported payloads; profile modal first-launch logic.
- `gap.js` — `baselines`/`baselineMeta` → `prs`/`prMeta` rename.
- `index.html` — profile modal markup.
- `styles.css` — profile modal styles.
- `tests.js` — update fixtures/assertions to v2; add migration, import, and
  profile tests.

## Repo state to clear before building

- **Stale git locks.** `.git/HEAD.lock` and `.git/index.lock` are present
  (leftovers from an interrupted git operation). Remove them before the
  first commit.
- **`README.md` shows as deleted** in the working tree, though it is
  committed in history (`3914810`). Decide: restore it
  (`git checkout -- README.md`) or confirm the deletion is intended.
  Resolve before Stage 2 commits so it does not ride along by accident.

## Risk note

Project risk is **Normal**, but the v1 → v2 migration and the v1 backup
import are the risk-bearing surface — a bug there can corrupt or drop an
athlete's logged history. Concentrate the gpt review pass there:
idempotency, the four import combinations, and id preservation for
`userLifts`.

## Open items

- **Throws list audit** (flagged in `v2-plan.md`). Reviewed: the eight
  throws in `ITEMS` — Braemar Stone, Open Stone, heavy/light hammer,
  heavy/light weight for distance, weight for height, sheaf toss — match
  the standard heavy-events slate. The one contested event absent is the
  **caber toss**, deliberately excluded because it is not scored as a
  numeric distance/height (it is judged on the turn / clock position) and
  would need its own scoring model. Recommendation: **no change to the
  throws list in Stage 2**; log the caber as a known gap for a future
  stage.
- No other open items — Stage 2 scope and approach are settled.

## Handoff prompt for the next ccode session

```
ccd, this is Stage 2 of the Highland Games Tracker v2 build.

Read these two files in the repo root:
  - v2-stage2-spec.md   (this spec sketch — scope + acceptance criteria)
  - v2-plan.md          (full v2 design — Stage 2 section, Data model,
                         Class taxonomy, Unit system)

The project is at ~/dev/highland-games-tracker, on main, tagged
v2.0.0-rebrand. Before building, run the repo cleanup in the spec's
"Repo state to clear before building" section (stale .git/*.lock files;
the README.md deletion) and tell me what you did.

Skill level: L1 — Supported. Project risk: Normal — the v1->v2 migration
and backup import are the risk-bearing surface; gpt's review should
concentrate there. Reviewer: gpt.

Build Stage 2 to the acceptance criteria in the spec. Atomic commits,
v1 style (small, focused, feat:/fix:/chore:/refactor: prefixes, one
concern each). Do not push — give me the push commands when the local
commits are ready.
```

---

*End of sketch. Update only via cowork session.*

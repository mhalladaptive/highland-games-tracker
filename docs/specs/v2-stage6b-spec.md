# Stone & Standard — Stage 6b Spec Sketch (v2)

**Date:** 2026-05-26 (rewritten 2026-05-27 early; pre-handoff polish pass 2026-05-27 — see revision history at end)
**Skill level:** L1 — Supported (L1 sub-gates paused for the rest of v2)
**Project risk:** Normal — low (presentation-only; adds three static PNG assets, renames two, flips two implements into the paired-selection branch)
**Repo:** `~/dev/highland-games-tracker` — on `main`, tagged `v2.0.0-stage6a` (when 6a ships)
**Design source:** the 2026-05-26 mid-build session — Oak generated adaptive variants for hammer and sheaf during the 6a build window, plus an updated able-bodied sheaf with taller standards. ccode shipped 6a with hammer and sheaf as single-variant (`silhouette-hammer.png`, `silhouette-sheaf.png`). 6b flips those two implements into the paired-selection branch so adaptive athletes get the adaptive variant.

*(Earlier draft of 6b covered the WOB silhouette pair; ccode incorporated WOB into 6a's mid-build, so this 6b is the rewritten next-stage scope.)*

---

## What this is

**Stage 6b fills the hammer and sheaf adaptive-pair coverage gap** that 6a left as "single-variant treated as the implicit able-bodied for all classes." Three new assets staged in `Images for Cards/`:

- `silhouette-hammer-adaptive.png` — new, adaptive variant with the blade prosthetic.
- `silhouette-sheaf-adaptive.png` — new, adaptive variant with the blade prosthetic.
- `silhouette-sheaf-able-bodied.png` — refreshed able-bodied sheaf with taller standards (replaces the current `silhouette-sheaf.png`).

The 6a selection helper in `shared.js` uses a `SILHOUETTE_PAIRED_IMPLEMENTS` Set to decide which implements take the `-{class}` suffix. Currently the Set contains `stone`, `weight-distance`, and `weight-over-bar`. 6b adds `hammer` and `sheaf` to that Set, renames the on-disk single-variants to `-able-bodied`, and adds the adaptive variants. After 6b, every implement uses the paired selection branch — no more single-variant pattern in the v2.0 ship.

## Stage 6b scope

1. **Stage the three new silhouette assets in `images/silhouettes/`.** Move from `Images for Cards/` (cowork-side working folder) into the app's `images/silhouettes/` directory:
   - `silhouette-hammer-adaptive.png` — net-new.
   - `silhouette-sheaf-adaptive.png` — net-new.
   - `silhouette-sheaf-able-bodied.png` — replaces the existing `silhouette-sheaf.png` (refreshed with taller standards).

2. **Rename the existing single-variant on disk** (`images/silhouettes/`). `silhouette-hammer.png` is renamed to `silhouette-hammer-able-bodied.png`. The content is unchanged; only the filename matches the new paired convention. The existing `silhouette-sheaf.png` is **replaced** by `silhouette-sheaf-able-bodied.png` (the refreshed version with taller standards) — same rename pattern, but the file content is also updated. Original `silhouette-sheaf.png` should be removed.

3. **Update `SILHOUETTE_PAIRED_IMPLEMENTS` in `shared.js`** to include `hammer` and `sheaf` alongside `stone`, `weight-distance`, and `weight-over-bar`. After this change, the selection helper builds `silhouette-hammer-{class}.png` and `silhouette-sheaf-{class}.png` for both events, just like stone / WFD / WOB.

4. **Update test coverage in `tests.js`** to reflect that hammer and sheaf now resolve to classed silhouette filenames. The 6a tests that asserted hammer and sheaf returned the non-classed filename are now wrong; replace those assertions with: adaptive class → `silhouette-{hammer,sheaf}-adaptive.png`; able-bodied or unset class → `silhouette-{hammer,sheaf}-able-bodied.png`. **Symmetrize both events with the stone / WFD / WOB pattern: two assertions each, one adaptive and one able-bodied.** Today the hammer test has two assertions (both → single-variant) and the sheaf test has only one (able-bodied only, no adaptive); after 6b both should be paired. Keep the existing regression guard at `tests.js:3822` (the negative `--no-silhouette` assertion on the happy path) intact.

5. **Version-test mockup update** (cowork-owned, `Images for Cards/card-version-test/`). Already updated in this session: the "All five implements as cards" section uses the new able-bodied sheaf; the style-consistency strip now shows all 10 silhouettes (5 implement pairs). ccode just needs to commit the cowork mockup updates alongside the build commits.

6. **Cowork-side `Images for Cards/silhouette-hammer.png`** (the working-folder mirror of the about-to-be-renamed shipped asset) — leave as expected-orphan in the working folder for now. Cowork will reconcile the mirror folder in the post-build docs follow-up.

**Post-build cowork follow-up (NOT ccode's scope, handled in a separate `docs:` commit after 6b ships):** update `v2-plan.md` and `PICKUP.md` to reflect the post-6b state — eight silhouettes → ten silhouettes; hammer + sheaf gap noted in 6a interim state is closed. Reconcile the `Images for Cards/` mirror folder (rename or remove the orphaned `silhouette-hammer.png`).

## Acceptance criteria

- [ ] Five new/renamed files live at `images/silhouettes/`:
  - `silhouette-hammer-adaptive.png` (net-new)
  - `silhouette-hammer-able-bodied.png` (renamed from `silhouette-hammer.png`, same content)
  - `silhouette-sheaf-adaptive.png` (net-new)
  - `silhouette-sheaf-able-bodied.png` (replaces `silhouette-sheaf.png`, refreshed content)
  - The old `silhouette-hammer.png` and `silhouette-sheaf.png` are removed (no orphaned files).
- [ ] `SILHOUETTE_PAIRED_IMPLEMENTS` in `shared.js` contains `stone`, `weight-distance`, `hammer`, `sheaf`, and `weight-over-bar` — all five implements.
- [ ] An adaptive athlete who PRs a hammer or sheaf event sees the adaptive silhouette; an able-bodied (or unset-class) athlete sees the able-bodied silhouette. Same for the other three implements (regression check).
- [ ] The missing-file defensive un-skinned fallback in `session.js` (the `else` branch on `sil.src` falsy plus the `img.onerror` handler, around lines 945–960) is still in place. The regression guard at `tests.js:3822` (negative `--no-silhouette` assertion on the happy throw card) still passes. (A *positive* test of the fallback firing does not exist today and is not in 6b's scope — see the v2.x "test coverage" backlog item.)
- [ ] `npm run lint` exits 0 and silent.
- [ ] All existing tests pass; the updated hammer + sheaf selection tests pass; the full `tests.html` suite runs green.

## Explicitly NOT in Stage 6b

- Any **further silhouette gap fills** — the v2.0 silhouette set is complete after 6b. Future implements (if any) are post-v2.0.
- **Card layout changes**. The existing throws-PR-card silhouette anchoring rule from 6a should accommodate all 10 silhouettes; if any specific implement reads poorly, that's a follow-on tweak, not 6b's scope.

## Resolved decisions

1. **Hammer and sheaf get adaptive variants** (decided 2026-05-26 late session). Oak generated both during the 6a build window.
2. **The refreshed sheaf able-bodied** replaces the prior version with taller vertical standards — better visual proportion when the sheaf is in flight near the top of the frame.
3. **6b is a separate stage from 6a** (decided mid-build 2026-05-26). The hammer + sheaf adaptive assets came in after the 6a ccode handoff; folding them into 6a would muddle the atomic-commit story and force ccode to refresh context mid-build.
4. **No new visual-language harmonization** (carried from 6a's resolved decision 4). Hammer + sheaf adaptive variants match their able-bodied siblings' style (pure black graphic silhouette, no kilt tartan), not the stone / WFD tartan style.

## Tech notes

- Vanilla HTML/CSS/JS, no build step. No new dependencies.
- Selection logic is the same `silhouette-{implement}-{class}.png` filename builder from 6a — the only code-level change is adding `hammer` and `sheaf` to the `SILHOUETTE_PAIRED_IMPLEMENTS` Set.
- No schema change, no migration, no storage touched.
- The v1 to v2 file renames in `images/silhouettes/` should be done as proper git renames (`git mv`) so the history is preserved; ccode does this.

## Files Stage 6b touches

**ccode-owned (in the 6b build commits):**

- `shared.js` — add `hammer` and `sheaf` to `SILHOUETTE_PAIRED_IMPLEMENTS`.
- `tests.js` — update the hammer + sheaf selection tests to expect classed filenames; symmetrize both with the stone / WFD / WOB two-assertion pattern.
- `images/silhouettes/silhouette-hammer-adaptive.png` — new asset.
- `images/silhouettes/silhouette-hammer-able-bodied.png` — renamed from `silhouette-hammer.png` (unchanged content).
- `images/silhouettes/silhouette-sheaf-adaptive.png` — new asset.
- `images/silhouettes/silhouette-sheaf-able-bodied.png` — replaces `silhouette-sheaf.png` (refreshed content with taller standards).
- `images/silhouettes/silhouette-hammer.png` — removed.
- `images/silhouettes/silhouette-sheaf.png` — removed.
- `Images for Cards/card-version-test/` — cowork mockup updates (already staged in this session).
- `Images for Cards/card-version-test-screenshot.png` — cowork mockup screenshot (already re-shot in this session).

**Cowork-owned (post-build `docs:` follow-up, NOT in the 6b ccode commits):**

- `v2-plan.md` — one-line update (silhouette count, hammer + sheaf adaptive variants now complete).
- `PICKUP.md` — silhouette count updated to 10 (5 pairs), gap notes updated.
- `Images for Cards/silhouette-hammer.png` — reconcile working-folder mirror (rename to match `-able-bodied` convention, or remove as orphan).

## Risk note

Project risk is **Low**. 6b is presentation-only — three new static assets, two file renames, one Set-member addition, two test updates. No schema, no migration, no storage, no audio, no celebration-system logic changes.

The gpt review's focus:

- Hammer + sheaf selection logic is correct: adaptive → adaptive PNG, able-bodied / unset → able-bodied PNG. Same as the existing stone / WFD / WOB selection — should be a one-line Set membership change.
- No regression in the 6a-shipped selection logic for stone, weight-distance, weight-over-bar.
- The old `silhouette-hammer.png` and `silhouette-sheaf.png` files are removed (not orphaned in `images/silhouettes/`).
- The missing-file defensive un-skinned fallback in `session.js` (around lines 945–960) is still in place; the regression guard at `tests.js:3822` still passes. A positive test of the fallback firing is a known gap, not 6b's scope.

## Open items

None blocking. 6b is straightforward.

## Handoff prompt for the next ccode session

```text
ccd, this is Stage 6b of the Stone & Standard v2 build — a small
post-6a addition that fills the hammer + sheaf adaptive-pair
coverage gap.

Read these two files:
  - docs/specs/v2-stage6b-spec.md  (this spec — scope, acceptance,
                                    files)
  - docs/specs/v2-stage6a-spec.md  (the immediately prior stage; 6b
                                    builds on 6a's silhouette
                                    selection helper)

The project is at ~/dev/highland-games-tracker, on main, tagged
v2.0.0-stage6a.

Build in this order — atomic commits, v1 style:

  1. Stage the three new silhouette PNGs into images/silhouettes/
     (from Images for Cards/):
       silhouette-hammer-adaptive.png   (net-new)
       silhouette-sheaf-adaptive.png    (net-new)
       silhouette-sheaf-able-bodied.png (replaces silhouette-sheaf.png,
                                         refreshed with taller standards)
     Use git mv where renaming preserves history.

  2. Rename images/silhouettes/silhouette-hammer.png to
     silhouette-hammer-able-bodied.png (same content, just the
     filename change). Use git mv.

  3. Remove the old images/silhouettes/silhouette-sheaf.png (it's
     replaced by silhouette-sheaf-able-bodied.png in step 1).

  4. Update SILHOUETTE_PAIRED_IMPLEMENTS in shared.js to include
     'hammer' and 'sheaf'. After this change, the selection helper
     resolves hammer and sheaf to classed filenames the same way it
     does stone / WFD / WOB.

  5. Tests in tests.js: update the hammer + sheaf selection tests to
     expect the new classed filenames (adaptive class → adaptive PNG,
     able-bodied or unset class → able-bodied PNG). Symmetrize both
     events with the stone / WFD / WOB pattern — two assertions each,
     one adaptive and one able-bodied. (Today the hammer test has two
     assertions both pointing at the single-variant and the sheaf test
     has only an able-bodied assertion; after 6b both should be
     paired.) Keep the existing happy-path regression guard at
     tests.js:3822 (the negative --no-silhouette assertion) intact.

  6. Commit the cowork-owned version-test mockup updates that are
     already in the working tree (Images for Cards/card-version-test/
     and Images for Cards/card-version-test-screenshot.png) as a
     chore: commit.

Do NOT update v2-plan.md or PICKUP.md — those are cowork-owned
planning docs and will be refreshed in a separate post-build docs:
commit by cowork.

Vanilla HTML/CSS/JS, no build step. No new dependencies. No schema
change. npm run lint must exit 0 and silent.

Skill level: L1 — Supported. Reviewer: gpt.

Do not push — give me the push commands when the local commits are
ready.
```

## Review prompt for the gpt review pass

```text
You are gpt — the Reviewer in the Higgins Method, a solo build system.
A build was done by ccode (Claude Code, a separate model); your job is
an independent cross-check. This is Stage 6b of the Stone & Standard
v2 project — a small post-6a addition that fills the hammer + sheaf
adaptive-pair coverage gap. Skill level: L1 — Supported. Project
risk: Normal — low (presentation-only).

WHAT TO READ — attach these 5 files. The list is alphabetical to
match the file picker, and numbered so you know when all 5 are
attached:

1. higgins-method.md — your Reviewer role, the L1 level, the
   one-review-pass rule.
2. shared.js — the silhouette-selection helper; the
   SILHOUETTE_PAIRED_IMPLEMENTS Set membership change.
3. tests.js — the updated hammer + sheaf selection tests, plus the
   negative `--no-silhouette` regression guard at line 3822 (the
   only test currently touching the defensive-fallback code path;
   see the CONCENTRATE block below).
4. v2-stage6a-spec.md — for the contract that 6b is updating.
5. v2-stage6b-spec.md — this spec. "Acceptance criteria" is the bar.

Review the code itself — do not rely on ccode's build report.

CONCENTRATE HERE
- Hammer + sheaf selection logic is correct: adaptive class →
  adaptive PNG, able-bodied / unset class → able-bodied PNG.
- No regression in the 6a-shipped selection logic for stone,
  weight-distance, weight-over-bar.
- The old silhouette-hammer.png and silhouette-sheaf.png files are
  removed (not orphaned in images/silhouettes/).
- The defensive missing-file un-skinned fallback in session.js
  (the else branch on sil.src falsy plus the img.onerror handler,
  around lines 945–960) is still present. The regression guard at
  tests.js:3822 — the negative --no-silhouette assertion on the
  happy throw card — still passes. A positive test of the fallback
  firing does not exist today and is NOT 6b's scope; do not flag its
  absence as a 6b finding.
- The new PNG assets and renames at images/silhouettes/ match the
  kebab-case filenames the spec lists.

HOW TO REPORT
- Classify every finding: Critical / Major / Minor / Nit.
- Be specific: file, function, what is wrong, why it matters.
- 6b is small and low-risk; calibrate accordingly. Don't demand
  enterprise hardening.

METHOD CONSTRAINT
This is the one review pass. A second round only on Critical. Give
one complete review — findings by severity, then a one-line verdict:
ship as-is, ship after fixes, or fix-and-re-review.
```

Attach the listed files only — don't paste ccode's build report.

---

## Revision history

- **2026-05-26 late** — first draft (then for WOB pair; obsoleted by ccode incorporating WOB into 6a mid-build).
- **2026-05-27 early** — rewritten as the hammer + sheaf adaptive-pair completion scope.
- **2026-05-27 (pre-handoff polish pass)** — cowork walked the spec against on-disk reality before handoff. Seven small edits, all cowork-side, no scope change:
  1. Stripped a leftover `(session.js / asset pipeline)` parenthetical from step 1.
  2. Step 5 — added explicit symmetrization note: hammer and sheaf tests should both be paired (two assertions each), matching stone / WFD / WOB. Today the hammer test has two assertions both → single-variant, and the sheaf test has only an able-bodied assertion.
  3. Step 6 — split. ccode commits the version-test mockup; v2-plan + PICKUP refresh moved to a post-build cowork `docs:` follow-up (matches the 2026-05-27 lessons-banked "spec changes before ccode starts or after the build ships" guidance). Added a cowork-side `Images for Cards/silhouette-hammer.png` orphan-cleanup note as part of the same follow-up.
  4. Acceptance criterion + Risk-note "still tested" claim softened. The defensive un-skinned fallback in `session.js:945–960` IS in place; the only test touching it is the *negative* regression guard at `tests.js:3822`. A *positive* test of the fallback firing is a known gap, logged as a v2.x backlog item, NOT 6b's scope. Review prompt updated to match — gpt is told not to flag the absence of a positive fallback test as a 6b finding.
  5. "Files Stage 6b touches" restructured into **ccode-owned** vs **cowork-owned post-build** sections; v2-plan + PICKUP moved into the cowork list.
  6. Handoff prompt body — removed the old step 7 (v2-plan/PICKUP), with a `Do NOT update v2-plan.md or PICKUP.md` line for clarity.
  7. Review-prompt WHAT TO READ item 3 (`tests.js`) — reworded the "defensive missing-file fallback test" phrasing to match the CONCENTRATE block: the only relevant test today is the negative `--no-silhouette` regression guard at `tests.js:3822`, not a fallback test as such.

*End of sketch. Update only via cowork session.*

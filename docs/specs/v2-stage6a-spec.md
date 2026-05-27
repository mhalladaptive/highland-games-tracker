# Stone & Standard — Stage 6a Spec Sketch (v2)

**Date:** 2026-05-24 · **Revised:** 2026-05-26 — silhouette replaces cut-scene, app renamed to Stone & Standard (see Revision history)
**Skill level:** L1 — Supported (L1 sub-gates paused for the rest of v2)
**Project risk:** Normal — moderate (a presentation change to a shipped feature, plus an app-wide rename that touches storage)
**Repo:** `~/dev/highland-games-tracker` — on `main`, tagged `v2.0.0-stage5b`
**Design source:** `v2-plan.md` · the 2026-05-24 / -25 / -26 card-lift planning conversations

---

## What this is

Stage 6 of the v2 build is the launch-polish basket — the celebration-card visual lift, a cross-device smoke test, Cloudflare Web Analytics, the `v2.0.0` tag, and the GitHub release. **Stage 6a** is the structural piece of that basket: the throws PR celebration card lift, the audio plumbing, and the rebrand from "Highland Games Tracker" to **Stone & Standard**. The remaining Stage 6 items (smoke test, analytics, tag, release) are housekeeping after 6a.

Today the throws PR card is a plain white card. Stage 6a turns it into a moment: a soft-grey card carrying an **implement-specific athlete silhouette** as the hero, audio plumbing for a future sound layer, and a renamed app identity across the surface and the storage layer.

## Revision history

- **2026-05-24** — original sketch. Card hero: Highland Games field background, animated implement cut-scene (two motifs — distance and height — with swappable implement skins), tape-measure reveal.
- **2026-05-25** — the silhouette pivot. Field background dropped; card hero becomes a bold black athlete silhouette on a soft-grey card. Open question left: does the cut-scene still play over the silhouette, or does the silhouette replace it?
- **2026-05-26 (this revision)** — the silhouette **replaces** the cut-scene; cut-scene work is deferred (possible v2.1+ upgrade path). Grey shade locked to `#F4F4F4`. Each implement renders at its own authentic throw moment. Visual-language mix (stone + WFD carry kilt tartan; hammer + sheaf are pure black) accepted as-is for v2.0. Adaptive pair coverage shipped as-is (stone + WFD complete; hammer + sheaf single-only — gaps filled iteratively). **App renamed to Stone & Standard, added to 6a scope.**

The body below is the current state. Where earlier revisions still inform the design rationale, the text below incorporates it. The cut-scene mechanism, the two motifs, and the implement-skin architecture are **removed from 6a** entirely.

## Stage 6a scope — the buildable chunks

1. **The soft-grey card foundation** (`session.js`, `styles.css`). Replace the throws PR card's white background with `#F4F4F4`. Keep the card's content fields and 4:5 aspect ratio (settled in Stage 4 design). The text content — headline, event, mark, the was-line, the meta lines, the wordmark — stays where it is; the visual lift is the background colour, the silhouette, and the wordmark text (see point 4).

2. **The implement-specific silhouette as card hero** (`session.js`, `styles.css`, `shared.js`). When a throws PR card fires, the card displays an athlete silhouette specific to the event's implement, anchored bottom-right of the card so the figure occupies the hero space and the text reads in the upper-left negative space.

   - **Selection key:** `(implement, athleteClass)` where:
     - `implement` is derived from the event id (Open Stone & Braemar Stone → `stone`; Heavy & Light WFD → `weight-distance`; Heavy & Light Hammer → `hammer`; Sheaf Toss → `sheaf`; Weight Over Bar → `weight-over-bar`).
     - `athleteClass` is `adaptive` if the athlete's profile class is one of the four BCAA adaptive classes (Para-Seated, Para Standing Upper Limb Loss, Para Standing Lower Limb Loss, Para Standing Neuro/Muscular); otherwise `able-bodied`.
   - **Default class:** `able-bodied` when the profile class is unset or doesn't map.
   - **Selection is a pure helper in `shared.js`** (DOM-free, unit-testable) — same pattern as `detectMilestones`, `recomputeDerivedState`, and the 5a/5b helpers. `session.js` renders over it.
   - **Asset filenames:** kebab-case `silhouette-[implement]-[class].png` (e.g. `silhouette-stone-adaptive.png`). The app builds the filename from the selection — no lookup table.
   - **Asset path:** cowork stages assets in `images/silhouettes/` (a new directory). The current working copies live in `Images for Cards/`; ccode moves the v2.0 set into `images/silhouettes/` as part of this stage.

3. **Audio plumbing** (`session.js`, `styles.css`). A sound layer on the throws PR card:
   - A play trigger when the card fires (silent for v2.0 — placeholder audio files).
   - A **sound on/off toggle** on the celebration overlay.
   - **Sound off by default.**
   - Preference persisted in a **standalone `localStorage` flag** (not part of the v2 data blob or `profile`). Rename the existing `SOUND_PREF_KEY` in `session.js` to `'stone-and-standard-sound'` as part of point 4's rename work.
   - Placeholder audio files at fixed paths under `audio/`. The card is fully built and testable now; the real clips drop into those paths when recorded.
   - Playback is gesture-initiated (the card fires from Save Session or the View Celebrations replay click), so it is within browser autoplay policy.

4. **App rename to Stone & Standard.** This is the biggest scope addition over the previous draft. The rename touches user-facing surface, storage, backup, and tooling. Atomic commits, v1 style — break the rename into focused commits below.

   **4a. Surface rename** — `index.html`, `session.html`, `progress.html`, `tests.html`, `session.js` (line 788, the wordmark `textContent`), and any string literals that display the app name. All user-facing instances of "Highland Games Tracker" become "Stone & Standard" (with ampersand — keep the `&` rather than spelling out "and"; it's a brand mark, not running prose). Page `<title>` tags, h1 wordmarks, test-runner banners, the celebration-card wordmark.

   **4b. Storage namespace migration** — `shared.js`. Rename the `STORAGE_KEY` constant from `'highland-games-tracker-v1'` to `'stone-and-standard-v1'`. Add a one-time migration in `loadData()` that checks for the old key, copies the value to the new key, and leaves the old key in place (don't `removeItem` — same conservative pattern Stage 1 used when stripping from `comeback-tracker-v1`). The migration runs once when the new key is empty AND the old key has data. Idempotent.

   **4c. Backup envelope rename** — `shared.js` `validateBackup` (line 508). Add `'stone-and-standard'` as an accepted `appName`. Continue accepting `'highland-games-tracker'` and `'comeback-tracker'` for backward compatibility (so existing v1 and v2 backups still import). Update `exportData` to write the new `appName` going forward. Carry the schema migration unchanged — that runs after appName validation.

   **4d. Tooling and metadata** — `package.json` `name` field changes from `"highland-games-tracker"` to `"stone-and-standard"`. `package-lock.json` updates on next `npm install`. Check `biome.json` for any name reference (probably none, but verify).

   **4e. README rewrite** — `README.md`. Replace all brand mentions with Stone & Standard. The app's audience, description, and value prop stay the same; only the name changes.

5. **Defensive un-skinned fallback** (`session.js`). If a silhouette file is missing for any reason (manifest mismatch, asset not yet staged, future event added before its silhouette), the card renders the soft-grey card with text content and no silhouette image (background stays clean grey, layout adjusts). Spec-level call. As of 2026-05-26, all eight throws events have silhouettes staged in `Images for Cards/` — this fallback is purely defensive, not interim state for any specific event.

6. **Scope isolation** (`session.js`). Only the **throws PR card** takes the new silhouette + audio path. Lift PR cards, all Goal cards, and the Awesome Day card keep their current rendering, untouched. The build path branches cleanly on "this is a PR card and its event is a throw."

7. **Tests** (`tests.js`, `tests.html`). Coverage:
   - **Selection helper.** Each throw event maps to the right `(implement, class)` pair. Profile class `Para-Seated` → adaptive; profile class `Amateur A` → able-bodied; profile class unset → able-bodied. Weight Over Bar → un-skinned fallback (selection returns sentinel).
   - **Sound toggle.** Off by default. Toggle persists across reloads in the standalone `localStorage` flag.
   - **Storage migration.** When localStorage has data under the old `highland-games-tracker-v1` key and nothing under `stone-and-standard-v1`, `loadData()` copies and continues. Idempotent on re-call.
   - **Backup import backward-compat.** A backup with `appName: 'highland-games-tracker'` still imports. A backup with `appName: 'stone-and-standard'` imports. A backup with `appName: 'comeback-tracker'` still imports (carries the v1 path).
   - **Scope isolation.** A lift PR card, a Goal card, and an Awesome Day card render without the silhouette path.

## Acceptance criteria

Stage 6a is done when all of these are true:

- [ ] When a throws PR card fires, the card shows the `#F4F4F4` background and the implement-specific silhouette anchored as the hero. The mark, headline, event, was-line, meta lines, and wordmark all stay legible over the silhouette.
- [ ] Silhouette selection lives in a pure `shared.js` helper with test coverage. `session.js` is the rendering layer.
- [ ] Each throw event's PR card resolves to the correct silhouette: Open Stone / Braemar Stone → `silhouette-stone-{class}.png`; Heavy / Light WFD → `silhouette-weight-distance-{class}.png`; Heavy / Light Hammer → `silhouette-hammer-{class}.png` (currently `silhouette-hammer.png` until the adaptive variant lands); Sheaf Toss → `silhouette-sheaf-{class}.png` (currently `silhouette-sheaf.png`); Weight Over Bar → `silhouette-weight-over-bar-{class}.png`.
- [ ] Athletes with a BCAA adaptive profile class get the adaptive silhouette where one exists; otherwise the able-bodied silhouette. Default is able-bodied.
- [ ] Sound is off by default; a toggle on the overlay turns it on; the preference persists across reloads in a standalone `localStorage` flag. Placeholder audio files do not error.
- [ ] The app displays "Stone & Standard" as its name everywhere user-facing: page titles, h1 wordmarks, the celebration-card wordmark, the test-runner banner.
- [ ] `STORAGE_KEY` is `'stone-and-standard-v1'`. A localStorage migration moves data from the old key on first launch with no data at the new key. Idempotent.
- [ ] `validateBackup` accepts `'stone-and-standard'`, `'highland-games-tracker'`, and `'comeback-tracker'` as valid `appName` values. `exportData` writes `'stone-and-standard'` going forward.
- [ ] `package.json` `name` is `"stone-and-standard"`. README is rewritten for the new name.
- [ ] Lift PR cards, Goal cards, and the Awesome Day card render exactly as before — the silhouette + audio path is gated to the throws PR card.
- [ ] `version` stays `2`; the milestone data, the `session.milestones[]` shape, and `showCelebrationQueue`'s contract are unchanged.
- [ ] Vanilla HTML/CSS/JS, no build step, no npm runtime dependency added.
- [ ] `npm run lint` exits 0 and silent.
- [ ] All existing tests pass; new tests added (selection helper, sound toggle, storage migration, backup import backward-compat) pass.

## Explicitly NOT in Stage 6a

- The **animated cut-scene mechanism** (motifs, implement skins, tape-measure / bar-as-ruler reveals) — deferred to a possible v2.1+ enhancement. The silhouette card is the v2.0 hero.
- The **adaptive variants for hammer and sheaf** — Oak to generate iteratively. Single-variant silhouettes ship in v2.0 for those two events.
- The **real audio files** — recorded and injected later; 6a ships silent placeholders.
- The **cross-event visual-language harmonization** — accepted as-is (stone + WFD detailed-with-tartan, hammer + sheaf pure-black graphic). Not regenerating either set to match the other for v2.0.
- The rest of **Stage 6** — the cross-device smoke test, Cloudflare Web Analytics, the `v2.0.0` tag, the GitHub release. Those follow 6a.

## Known interim state (by design)

- **Hammer and sheaf adaptive variants** don't exist yet; an adaptive athlete who PRs a hammer or sheaf gets the existing single silhouette for that implement. Expected.
- **Audio is silent** — placeholder files until real clips are recorded. The plumbing, the toggle, and the off-by-default state are all real and testable now.
- A review should treat all three as expected interim state.

## Resolved decisions

1. **Silhouette replaces the cut-scene** (2026-05-26). Cut-scene mechanism deferred to a possible v2.1+ upgrade. The silhouette is the card hero for v2.0.
2. **Soft-grey card background is `#F4F4F4`** (2026-05-26). Not `#ECECEC`, not the app's existing `#f5f5f7` bg token. Card needs to read distinct from the page background; `#F4F4F4` is the closest reading that still feels like a card.
3. **Each implement at its own throw moment** (2026-05-26). No cross-event throw-beat harmonization. Stone wind-up, weight-distance release, hammer mid-spin, sheaf apex — each is the implement's authentic iconic moment.
4. **Visual-language mix accepted** (2026-05-26). Stone + WFD carry detailed silhouettes with white kilt tartan accents; hammer + sheaf are pure black graphic silhouettes. Not regenerating either for v2.0 — the adaptive vs able-bodied distinction is so rarely shown side-by-side that visual-language consistency between events isn't critical.
5. **Adaptive pair coverage ships as-is** (2026-05-26). Stone and WFD have adaptive + able-bodied pairs. Hammer and sheaf have single silhouettes (treated as able-bodied for selection). Adaptive variants for hammer + sheaf are gaps to be filled iteratively after v2.0.
6. **App renamed to Stone & Standard** (2026-05-26). Added to 6a scope; ships in v2.0. Brand name combines distance (stone) and height (standard = the bar's vertical posts).
7. **Sound off by default**, toggle on the overlay, real clips injected later (2026-05-24, carried forward).
8. **Scope: throws PR card only** (2026-05-24, carried forward). Lift PR, Goal, Awesome Day cards untouched.

## Tech notes

- Vanilla HTML/CSS/JS, no build step — held. Silhouettes are static PNGs; no animation rendering required. No npm runtime dependency added.
- The celebration cards live in `session.js` — the `showCelebrationQueue` queue and the card builders — and `styles.css`. 6a branches the PR-card build path for throws; it does not change `showCelebrationQueue`'s signature or the milestone data.
- **The silhouette selection is a pure helper in `shared.js`** — DOM-free, unit-testable — same pattern as `detectMilestones`, `recomputeDerivedState`, and the 5a/5b helpers. `session.js` renders over it.
- **The storage migration runs once in `loadData()`** — same idempotent pattern as `migrateSchemaV1toV2` (check, do, leave a sentinel). Subsequent loads see the new key populated and skip.
- **No schema change.** The sound preference is a standalone `localStorage` flag. `version` stays `2`. The milestone data, `session.milestones[]`, and the v2 data blob are untouched.
- Audio via the HTML5 `Audio` API; placeholder files at fixed paths so the real clips are a drop-in. The card fires from a user gesture, so playback is within browser autoplay policy.

## Files Stage 6a touches

- `session.js` — the celebration-card build path branches for the throws PR card: the soft-grey background, the silhouette `<img>`, the audio trigger and the sound toggle, the un-skinned fallback for Weight Over Bar. Wordmark `textContent` updated. `SOUND_PREF_KEY` renamed.
- `shared.js` — the pure silhouette-selection helper. `STORAGE_KEY` constant renamed. Storage migration added inside `loadData()`. `validateBackup` accepts the new `appName`; `exportData` writes the new `appName`.
- `styles.css` — the soft-grey card background, the silhouette layout (anchoring, sizing, overflow handling), the sound-toggle styling. Remove any throw-card styling that was specific to the field-photo / cut-scene mechanism (verify what's left from the 2026-05-25 silhouette pivot work).
- `tests.js` — new coverage (selection helper, sound toggle, storage migration, backup import backward-compat).
- `index.html`, `session.html`, `progress.html`, `tests.html` — page `<title>`, h1 wordmark text updated to "Stone & Standard".
- `app.js` — verify any string literals; update if present.
- `package.json` — `name` field. `package-lock.json` regenerates on next `npm install`.
- `README.md` — rewrite for Stone & Standard.
- **New asset files** — `images/silhouettes/silhouette-stone-adaptive.png`, `silhouette-stone-able-bodied.png`, `silhouette-weight-distance-adaptive.png`, `silhouette-weight-distance-able-bodied.png`, `silhouette-hammer.png`, `silhouette-sheaf.png`, `silhouette-weight-over-bar-adaptive.png`, `silhouette-weight-over-bar-able-bodied.png`. Cowork stages the assets in `Images for Cards/`; ccode moves them to `images/silhouettes/` as part of the build.
- **Placeholder audio files** under `audio/` (verify what's there; add silent placeholder MP3/WAV if missing).
- `biome.json` — verify for any app-name reference.

## Risk note

Project risk is **Normal**, sitting at the **moderate** end (higher than the original 6a draft) because the rename touches storage and backup — surfaces with user-data implications. The card visual is presentation-only and low-risk. The rename, by contrast, has two real risk surfaces:

1. **Storage migration correctness.** Users of v2.0-staged builds have data under `highland-games-tracker-v1`. If the migration is wrong (overwrites without check, runs more than once, partial copies, key mismatch), data loss is possible. Mitigation: idempotent guard (only migrate if new key is empty AND old key has data); the migration only *copies*, never deletes the old key. Tests cover the migration paths.
2. **Backup import backward-compat.** Existing exported backups carry `appName: 'highland-games-tracker'` (and v1 carries `'comeback-tracker'`). Both must continue to import. Mitigation: explicit `appName` allowlist in `validateBackup`; tests cover all three.

The gpt review's focus:

- The silhouette path is **isolated to the throws PR card** — a lift PR card, a Goal card, and an Awesome Day card render exactly as before.
- Silhouette selection is correct — each throw event maps to the right `(implement, class)` pair; adaptive athletes get the adaptive variant where one exists; Weight Over Bar maps to the un-skinned fallback.
- Storage migration is **idempotent and safe** — never overwrites a populated new key; never deletes the old key.
- `validateBackup` accepts all three legacy `appName` values; `exportData` writes the new one.
- Sound is genuinely off by default; the toggle works and persists; nothing autoplays against browser policy; the placeholder files do not throw.
- No schema change; `version` stays `2`; the milestone data and `showCelebrationQueue`'s contract are untouched.
- The no-build / vanilla constraint held — no npm runtime dependency added.
- `npm run lint` exits 0 and silent.

## Open items

- **Audio file format and location** — Oak to confirm path under `audio/` (e.g. `audio/throw-shout.mp3`, `audio/stone-clang.mp3`) and that ccode should add silent placeholders at those paths.
- **Card layout for Sheaf Toss** — the sheaf silhouette includes the bar and vertical standards, making it taller than the distance-event silhouettes. The card layout (CSS) may need a sheaf-specific anchoring rule, or the silhouette may need to be re-cropped. Build-and-react during ccode's pass.
- **Hammer + sheaf adaptive variants** — Oak to generate when ready. v2.0 ships single-variant for those events.

## Handoff prompt for the next ccode session

```text
ccd, this is Stage 6a of the Stone & Standard v2 build — the final
feature stage before v2.0 launch. It combines:

  (a) The throws PR celebration card visual lift — soft-grey card with
      an implement-specific athlete silhouette as the hero, plus audio
      plumbing (sound toggle, off by default, placeholder files).
  (b) The app rename from "Highland Games Tracker" to "Stone & Standard"
      across surface, storage, backup, and tooling.

Read these two files:
  - docs/specs/v2-stage6a-spec.md  (this spec — scope, acceptance
                                    criteria, resolved decisions,
                                    files touched, atomic commit
                                    sequence)
  - v2-plan.md  (repo root — Stage 6, the celebration-card design,
                 the audience and product framing)

The project is at ~/dev/highland-games-tracker (note: the repo
directory keeps its old name; the rename is at the brand layer, not
the filesystem layer — leaving the repo directory rename for after
v2.0 ships). The project is on main, tagged v2.0.0-stage5b.

Build in this order — atomic commits, v1 style (feat:/fix:/chore:/
docs:/refactor: prefixes, one concern each):

  1. The soft-grey card background + the silhouette as hero (the
     visual lift). Use the silhouette PNGs already staged in
     "Images for Cards/" — move the v2.0 set into images/silhouettes/
     with the kebab-case naming the spec lists. Build the pure
     selection helper in shared.js first (DOM-free, unit-tested),
     then the render layer in session.js. Defensive un-skinned
     fallback when a silhouette file is missing (all eight throws
     events have silhouettes staged as of 2026-05-26).

  2. The audio plumbing — sound toggle on the overlay, OFF by
     default, preference in a standalone localStorage flag named
     'stone-and-standard-sound', placeholder audio files at fixed
     paths under audio/.

  3. The surface rename — page titles, h1 wordmarks, the celebration-
     card wordmark, the test-runner banner. All user-facing
     "Highland Games Tracker" → "Stone & Standard" (with the
     ampersand, not "and").

  4. The storage namespace migration — STORAGE_KEY renamed, idempotent
     migration in loadData() that copies from the old key to the new
     when the new is empty AND the old has data. Never delete the old
     key.

  5. The backup envelope rename — validateBackup accepts
     'stone-and-standard', 'highland-games-tracker', and
     'comeback-tracker'. exportData writes 'stone-and-standard'.

  6. The tooling and metadata — package.json name field, README
     rewrite for the new brand.

  7. Tests for everything: selection helper (per event, per class,
     fallback for WOB), sound toggle persistence, storage migration
     idempotence, backup import backward-compat across all three
     appName values, scope isolation (lift/goal/awesomeDay cards
     unchanged).

Only the THROWS PR card takes the silhouette + audio path. Lift PR
cards, Goal cards, and the Awesome Day card render exactly as they do
today — leave them untouched.

Put the silhouette selection in a pure shared.js helper (DOM-free,
unit-tested), the same pattern as detectMilestones and the 5a/5b
helpers; session.js (where showCelebrationQueue lives) is the
rendering layer.

Vanilla HTML/CSS/JS, no build step — no animation logic, no npm
runtime dependency. version stays 2; no schema change beyond the
standalone sound-preference flag.

Build to the spec's Acceptance criteria. Note the Resolved decisions —
do not relitigate them. Note the Risk note — concentrate on storage-
migration correctness and backup backward-compat; data-loss surfaces
are the real risk on this stage. The visual feel is build-and-react:
cowork will screenshot your pass and Oak will react on the card
visual.

Skill level: L1 — Supported. Reviewer: gpt.

Do not push — give me the push commands when the local commits are
ready. npm run lint must exit 0 and silent before handoff.
```

## Review prompt for the gpt review pass

```text
You are gpt — the Reviewer in the Higgins Method, a solo build system.
A build was done by ccode (Claude Code, a separate model); your job is
an independent cross-check. This is Stage 6a of the Stone & Standard
v2 project — the final feature stage before v2.0 launch. It bundles
the throws PR celebration card visual lift (silhouette + soft-grey
card + audio plumbing) and the app rename from "Highland Games
Tracker" to "Stone & Standard" (surface + storage + backup + tooling).
Skill level: L1 — Supported. Project risk: Normal — moderate (storage
and backup touched).

WHAT TO READ — attach these 9 files. The list is alphabetical to
match the file picker, and numbered so you know when all 9 are
attached:

1. README.md — the rebrand on the user-facing intro.
2. app.js — any name references; ensure the rebrand is complete.
3. higgins-method.md — your Reviewer role, the L1 level, the
   one-review-pass rule.
4. package.json — name field changed.
5. session.js — the celebration cards, the silhouette render path,
   the sound toggle, the un-skinned fallback, the wordmark.
6. shared.js — the pure silhouette-selection helper, STORAGE_KEY
   rename, the storage migration, validateBackup, exportData.
7. styles.css — the soft-grey card, the silhouette layout, the sound
   toggle styling.
8. tests.js — the new test coverage.
9. v2-stage6a-spec.md — the spec. "Acceptance criteria" is the bar;
   "Resolved decisions" fix the design calls (do not relitigate them);
   "Risk note" says where to concentrate; "Known interim state" says
   what is expected rather than a bug.

If ccode created any new JS or CSS files, attach those too. The
silhouette PNGs and placeholder audio do not need attaching.

Review the code itself — do not rely on ccode's build report. This
must be an independent read.

CONCENTRATE HERE
- Storage migration: idempotent, safe under re-call, never
  destructive of the old key. The migration only runs when the new
  key is empty AND the old key has data.
- Backup import backward-compat: validateBackup accepts
  'stone-and-standard', 'highland-games-tracker', and
  'comeback-tracker'. exportData writes the new name. A v1
  comeback-tracker backup still imports (carries through the schema
  migration).
- The silhouette path is isolated to the throws PR card — a lift PR
  card, a Goal card, and an Awesome Day card render exactly as
  before.
- Silhouette selection: each throw event maps to the right
  (implement, class) pair; adaptive athletes (BCAA adaptive classes)
  get the adaptive variant where one exists; Weight Over Bar maps to
  the un-skinned fallback (no image).
- Audio: sound is genuinely off by default; the toggle works and the
  preference persists; nothing autoplays against browser policy; the
  placeholder files do not throw.
- The rebrand is complete — no "Highland Games Tracker" or
  "highland-games-tracker" strings remain in user-facing surface or
  code constants (test fixtures referencing old keys for migration
  tests are expected and correct).
- No schema change; version stays 2; milestone data and
  showCelebrationQueue's contract are untouched.

ALSO CHECK
- The silhouette selection logic is a pure shared.js helper with
  test coverage; session.js is a thin rendering layer.
- The no-build / vanilla constraint held — no npm runtime dependency.
- npm run lint exits 0 and silent.
- Whether the build meets each item in the spec's Acceptance criteria.

HOW TO REPORT
- Classify every finding: Critical / Major / Minor / Nit.
  Critical = a data-loss path in the storage migration, a backup
  import path broken for legacy appName, an acceptance criterion
  unmet, or the silhouette path leaking into other card types.
- Be specific: file, function, what is wrong, why it matters.
- Separate real defects from style preferences. The visual feel is
  build-and-react and out of scope for the review — do not critique
  colours, spacing, or layout taste; review correctness.
- This is a personal/community vanilla-JS localStorage app at L1 /
  Normal-moderate risk — calibrate to that. Don't demand enterprise
  hardening.

METHOD CONSTRAINT
This is the one review pass. A second round happens only if this
pass finds something Critical. Give one complete review — findings
by severity, then a one-line verdict: ship as-is, ship after fixes,
or fix-and-re-review (Critical only).
```

Attach the listed files only — don't paste ccode's build report; gpt's review must be an independent read.

---

*End of sketch. Update only via cowork session.*

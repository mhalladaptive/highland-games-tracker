# Session notes

Chronological dev journal. Most recent entry at the top. The formal v2 plan
lives in `v2-plan.md` — these notes are the working scratchpad and a record
of what got decided when.

---

## 2026-05-21 (later) — L1 gate re-walk, gate redesign, Stage 4 planning

A second session on the 21st. It began as the L1 gate re-walk the Stage
3b notes recommended before Stage 4 — shared.js first. It turned into
something bigger: a redesign of the L1 gate itself.

### The re-walk

~2.5 hours, cowork-led, Oak describing each piece of shared.js in his own
words. Covered the data layer in real depth — the constant-vs-data
distinction (the recurring gap from Stages 2–3b, and it finally landed),
reading conditions, `=` vs `===`, the ternary, object vs array, the
loadData guard pattern, and `migrateSchemaV1toV2` through the userLifts
reconstruction. Real movement on the mechanism-layer edge the ledger
keeps naming — but slow: 2.5 hours bought roughly two-thirds of one file.

### The gate redesign — Higgins Method v0.3 → v0.4

The slowness was the signal. The old L1 gate ("walk the whole project,
describe every file") had been "pending / not cleared" across three
shipped stages — a gate that can't be cleared isn't gating, it's a red
mark that just travels forward. Oak's call: the gate was mis-sized — too
much in one block, and drifting toward a mastery bar, "learning from AI
how to code" rather than "learning to direct it."

Replaced it. L1 is now three interleaved ~1-hour sub-gates — L1.1 / L1.2
/ L1.3 — functional-depth cold-reads of one file each, ramping easy to
hard, sitting at the front of a build so they cost no separate time.
Three stripes, then the belt. The model is Oak's 30 years of wrestling
coaching: drill briefly, then live-wrestle; mastery accretes from the
reps, not from a checkpoint that blocks the match. `higgins-method.md`
is now v0.4; the cheat sheet and START-HERE updated to match; the skills
ledger has a 2026-05-21 entry for the session.

### Stage 4 — split A/B/C, 4a spec'd

After the gate work Oak chose to start Stage 4 rather than close the
session. Stage 4 as written in `v2-plan.md` bundles ~8 pieces — the Log
Session page rework plus the whole celebration system — bigger than
Stage 3 was when it got split. Decided to split it three ways:

- 4a — Log Session catches up: render S&C from `userLifts`, the 3→10
  attempt cap, the section rename + intro. No celebration logic.
- 4b — the celebration system: milestone detection at save, the cards,
  the queue, the badge-and-replay.
- 4c — recompute-on-edit plus the chain prompt: the risk-bearing
  derived-data work, isolated for a focused review the way 3b was.

Planned 4a in full. Three gaps `v2-plan.md` left open were resolved: a
removed lift in an edited session renders with a "removed" tag and stays
editable (so an edit can't silently drop its marks); an empty S&C
section shows a linked pointer to the Set page; the milestone-framing
intro copy was drafted. Cowork wrote the 4a spec sketch —
`docs/specs/v2-stage4a-spec.md` — handoff-ready, with the ccode and gpt
prompts built in.

### Where it stands

Stage 4a is spec'd and handoff-ready — the next move on the build is a
ccode session from `docs/specs/v2-stage4a-spec.md`, then gpt review. 4b
and 4c get their own planning once 4a ships.

The L1 gate is now clearable under v0.4 — Oak is roughly one ~1-hour
session from the L1.1 sub-gate (a cold-read of a lighter file, gap.js
the natural pick), and v0.4 interleaves it with builds rather than
blocking on it. Today's shared.js depth is banked as the drill for the
eventual L1.3 stripe.

---

## 2026-05-21 — Stage 3a shipped; Stage 3b planned, built, shipped

Long session, the evening of 2026-05-20 into the 21st. Ran the Higgins
loop twice more — Stage 3a from review to ship, and Stage 3b end to end
(plan → spec → build → review → fix → ship). Stage 3 is now complete.

### Stage 3a — reviewed, smoke-tested, fixed, shipped

- Picked up the Stage 3a build from the prior session. First catch: the
  four Stage 3a build commits had already been pushed to `origin/main`
  before review — a step out of Higgins order (Ship follows Review).
  Low-stakes here; flagged.
- gpt review: clean — one Nit only (stale "baselines" wording in
  `index.html`'s backup copy). Fixed by hand, commit `314331c`.
- Browser smoke test (cowork-driven, app served locally over
  `http://localhost:8000`): found one Major a code review structurally
  could not — at desktop widths (≥600px) each throw row laid PR and Goal
  side by side, overflowing the fixed 560px card and clipping the Goal
  field's inches input. Mobile was fine.
- Fix (Option A): stack PR and Goal vertically at all widths, matching
  mobile. ccode built it, commit `7c98211`; re-smoke confirmed; 166/166
  tests green.
- Shipped — pushed, tagged `v2.0.0-stage3a`. Stage 3a ledger entry
  written.

### Stage 3b — planned, built, shipped

- Planning conversation resolved the four questions `v2-plan.md` left
  open on the conversion engine: Count and Time lifts with marks stay
  fully locked (only Weight and Distance convert); conversions round the
  stored values; conversion shows live on unit change; no confirmation
  dialog. Cowork wrote `v2-stage3b-spec.md`.
- ccode built it: six commits (`e4e4418`…`4e7dc5e`) — the `convertValue`
  helper and `toBase` factors, the unlocked category-filtered dropdown,
  live conversion, the Save-time session-mark sweep, the "Strength and
  Conditioning Milestones" heading rename, and tests.
- gpt review: one Major — the `liveConvert` gate omitted the `hasMarks`
  check, so a saved unmarked lift's unit change blanked
  typed-but-unsaved PR/Goal. One Minor, one Nit. Verdict: ship after
  fixes.
- Browser smoke test: the conversion engine verified end to end on
  injected test data — live conversion, the session-mark sweep, other
  lifts and throw marks untouched. The Major was reproduced.
- Near-miss worth recording: the smoke test first appeared to show the
  conversion engine completely dead (`convertValue` undefined), nearly
  reported as a Critical. False alarm — the browser was serving a stale,
  cached pre-3b `shared.js`. Caught by checking the file on disk.
  `python3 -m http.server` sends no cache headers; stale cache bit the
  smoke test three times — hard reload each. See the Stage 3b ledger
  entry.
- ccode fixed the Major, commit `4f5c177` (`liveConvert` gate now
  includes `hasMarks`) plus a regression test. Re-smoke confirmed; full
  suite 195/195.
- Shipped — pushed, tagged `v2.0.0-stage3b`. Stage 3b ledger entry
  written.

### Where it stands

Stage 3 is complete — 3a and 3b both shipped and tagged. Next is
**Stage 4** — the celebration system and the Log Session changes, the
big behavioral stage, and where `goalMeta` and the unit `direction`
field finally get consumed. The L1 gate (code walkthrough) is still
pending from 2026-05-19; the Stage 3b ledger recommends clearing it
before Stage 4.

### Housekeeping

- This session's docs sweep: this `SESSION_NOTES` entry, `PICKUP.md`
  refreshed for Stage 4, and the new files (`v2-stage3b-spec.md`, the
  gpt review docs) — one `docs:` commit.
- The leftover `stage-2-walkthrough-study-sheet.pdf` in the repo is safe
  to `rm` (the real copy is in the Higgins Method folder).

---

## 2026-05-20 — Stage 2 shipped, L1 gate walkthrough, Stage 3a built

Long session, the evening of the 19th into the 20th. Ran the Higgins
loop twice — Stage 2 end to end, and Stage 3 up through the 3a build.

### Method correction — the important one

Early on, cowork overstepped: it took the v2 plan and started writing
Stage 2 code directly. That is ccode's job. Oak caught it and pointed
cowork back at the Higgins Method. Recalibrated for the rest of the
session and going forward: **cowork plans (writes the spec sketch),
ccode builds, gpt reviews.** Recovery was cheap — nothing had been
committed. The lesson, logged in the skills ledger: the spec→build
handoff is where the L1 learning lives; cowork must not cross it.

### Stage 2 — shipped

- Cowork wrote `v2-stage2-spec.md` and handed it to ccode.
- ccode built it: storage schema bump v1→v2 (`baselines`→`prs`,
  `baselineMeta`→`prMeta`, added `goals` / `goalMeta` / `userLifts` /
  `profile`), the v1→v2 migration, the first-launch profile modal.
- gpt review: no Critical or Major; one Minor — `weightSchedule` did
  not default to match gender. Fixed (commit `c5d6f49`).
- Browser smoke test: clean.
- Shipped: pushed to `origin/main`, tagged `v2.0.0-stage2`. Commits
  `ff4a380`, `edcd127`, `dcea47b`, `c5d6f49`.

### L1 gate walkthrough — not cleared this pass

- Walked all ten code files with cowork, Oak describing each in his
  own words.
- Result: the file→role map is solid; the mechanism layer — how
  `shared.js`'s data layer and migration work, how a page's JS builds
  the DOM — is the gap.
- Honest verdict: **L1 gate not cleared this pass.** Re-attempt is
  close: re-read the files (shared.js first), then re-walk.
- First real skills-ledger entry filled in (`skills-ledger.md`, Higgins
  Method folder).
- A printable study sheet was built — `stage-2-walkthrough-study-sheet.pdf`,
  Higgins Method folder — to study before the re-walk.

### Stage 3 — split into 3a + 3b, and 3a built

- **Split decision.** Stage 3 as written bundled too much. Split it:
  **3a** = the Set PRs & Goals page (page rewrite, throws with
  PR+Goal, user-defined lift cards, the unit dropdown, soft-delete).
  **3b** = the unit conversion engine (rewrites stored data — built
  and reviewed on its own).
- **The seam.** In 3a a lift's unit locks once it has any mark; 3b is
  what unlocks it, with conversion.
- **Decision:** the v1 stone-weight input is dropped from the Set page
  — a stone's weight is neither a PR nor a Goal; it stays per-session
  on Log Session.
- Cowork wrote `v2-stage3a-spec.md` and handed it to ccode.
- ccode built Stage 3a: 4 commits (`0df048c`, `ed6999a`, `9767bdb`,
  `bee8cea`), 166/166 tests pass (cowork confirmed headless). The
  3a/3b split held — no conversion engine, Log Session untouched.

### Where it stopped — for tomorrow

Stage 3a is built locally: **4 commits ahead of `origin/main`, not
reviewed, not smoke-tested, not pushed.** Tomorrow:

1. gpt review of Stage 3a — the review prompt is ready at the bottom
   of `v2-stage3a-spec.md`.
2. Browser smoke test — a checklist is derivable from the spec's
   acceptance criteria.
3. Fix anything found → ship (push + tag `v2.0.0-stage3a`) → the
   Stage 3a ledger entry.
4. Then plan Stage 3b.

### Housekeeping / environment

- Antigravity (the IDE) broke via a Google update mid-session; ccode
  now runs in a standalone terminal with VS Code alongside.
- Cowork's sandbox can create files but cannot delete them in the repo
  or `.git` — so git commits, reverts, tag pushes, and file removals
  are run by Oak on the real machine.
- Untracked / uncommitted in the repo: the gpt review doc (`Code
  Review Stage 2 Highland Games Tracker.md`), a leftover copy of the
  study-sheet PDF (safe to `rm`), uncommitted edits to
  `v2-stage2-spec.md`, and a small uncommitted edit to
  `v2-stage3a-spec.md` (the gpt review prompt appended this session).
  One `docs:` commit sweeps the lot.

---

## 2026-05-19 — v2 design session + Stage 1 ship

Big session. Two distinct phases: shipping Stage 1 (the rebrand) and
designing all of Stages 2–5.

### Stage 1 shipped

The fork-and-rebrand strip phase that was planned during the v1.4 wrap-up
landed today. Commits in order:

1. `docs: add v2 planning notes carried from fork pre-work` — brought the
   placeholder `v2-plan.md` over from `comeback-tracker` into
   `highland-games-tracker`.
2. `chore: rename app surface to Highland Games Tracker` — page titles,
   h1 wordmarks, img alt text, test-runner intro banner. Surface-only.
3. `chore: separate v2 storage namespace from v1` — `STORAGE_KEY` moved
   from `comeback-tracker-v1` to `highland-games-tracker-v1`,
   `validateBackup` and `exportData` updated to `highland-games-tracker`,
   test fixtures and assertions updated.
4. `chore: remove personal branding assets` — Adaptive Oak logo and
   adaptive-throw photo deleted from git, `<img>` references stripped
   from every page, `.brand-logo` CSS rule removed,
   See-the-Gap background swapped to generic `grass-field.jpg`.
5. `docs: add README describing the app, audience, install, and roadmap`
   — community-facing README.

Tagged `v2.0.0-rebrand` at HEAD. Pushed to `origin/main`. The v2 repo now
reads as a neutral community Highland Games tool with no traces of the
personal v1.

### v2 design conversation

The bulk of the day was design work for Stages 2–5. Major decisions, in
the order they came up:

**Audience and positioning.** v2 is for the Highland Games community at
large — competitors, masters, comebackers, new athletes — not Matt
personally. Strip out the "comeback" framing.

**v1 frozen.** `comeback-tracker` stays at v1.4 as Matt's personal app.
v2 evolves independently in this repo.

**Lifts → user-defined.** The v1 hard-coded lift list (Overhead Press,
Deadlift, etc., with fixed protocols) was Matt's training program.
Community athletes need to define their own lifts. Each entry has free-text
`name`, free-text `protocol`, and a `unit` from a fixed dropdown.

**Unit system: 10 options across 4 categories.** Weight (`lb`, `kg`),
Distance (`mi`, `K`, `m`, `yd`), Time (`time` — mm:ss format), Count
(`reps`, `rounds`, `cal`). Each unit has a `direction` property — time is
lower-is-better, everything else is higher-is-better. Same-category unit
changes auto-convert; cross-category changes are blocked. Native HTML
`<select>` with `<optgroup>` headers.

**Strength and Conditioning Milestones.** The section formerly called
"Lifts" renames to "Strength and Conditioning Milestones." The rename is
also a product positioning shift: the section is for logging notable
workouts (1RM tests, max efforts, PR attempts) rather than every gym day.
S&C notes textarea label stays as "S&C notes" for compactness.

**10-attempt cap on S&C.** A 1RM workup has 5–7 sets with several singles;
10 is a generous cap. Throws stay at 3 (matches Highland Games competition
format). Gap-detection rule from v1.4 still applies — attempts must be
contiguous.

**PRs and Goals replacing single baseline.** Each event has two reference
marks: a Personal Record (historical) and a Goal (forward-looking aspiration).
Each is optional and independent.

**Goals don't appear as a percentage on Progress.** Long-term goals don't
move enough to be motivating as a tracked percentage. Their functional
home becomes the celebration system instead — Goals are "latent moments
waiting to fire," not "static targets to crawl toward."

**Progress page: vs-PR with session-window filter.** Three filter options
matching the v1 pattern of competition/training/all but with time
dimension:

- Last session logged
- Past 3 sessions
- Year to date (Jan 1 of current year forward)

**Celebration system.** PR card and Goal card fire when a session's marks
break the relevant reference. Cards queue in order: individual PR cards,
individual Goal cards, then an Awesome Day capstone if 2+ milestones.
Same-event PR + Goal hits show as two separate cards, not combined.
Awesome Day threshold is 2+ total milestones in a session.

**Cards persist on the session.** "I always accidentally dismiss things"
problem: cards are stored on the session record under
`session.milestones[]`. Past Sessions list flags milestone-bearing rows,
expanded view replays the queue. The cards look identical later as they
did at save.

**Chain prompt after Goal celebration.** After a Goal card is dismissed,
the athlete is prompted to set a new goal for that event. If they skip,
the Set page shows a soft callout for the event until they set one.

**Edits recompute milestones.** PR is max-across-sessions and is
recomputed on any edit or delete. `goalMeta` (the achievement record) is
recomputed too. Active `goals[event]` value is never auto-changed — the
user owns that field. Edits that create new milestones fire celebration
cards (same flow as save); edits that remove milestones are silent.

**Auto-update on save.** PR field auto-updates when broken; `goalMeta`
auto-writes when achieved. No confirm step — the celebration card is the
implicit confirmation. Typos that create false milestones are handled
through the edit flow.

**Profile capture on first launch.** Modal collects name, gender, weight
schedule, class, tier. All fields optional. Cards pull from it for
personalization.

**Gender separable from weight schedule.** Gender is identity (Male /
Female / Non-binary / Prefer not to say). Weight schedule is the BCAA
weight table the athlete competes from (Men's / Women's). M/F athletes
get a default-match suggestion; non-binary and unspecified athletes pick
explicitly. The app's posture is "this tracker is for them, not to make
assumptions or judgments."

**Class taxonomy.**

- Open: Pro, Amateur A, Amateur B, Amateur C, Amateur (unspecified),
  Novice, Lightweight, Junior
- Masters: Masters, Lightweight Masters (skill tiers like A/B/C drop
  once the athlete crosses 40)
- Adaptive (BCAA framework v3, May 2026): Para-Seated, Para Standing
  Upper Limb Loss, Para Standing Lower Limb Loss, Para Standing
  Neuro/Muscular
- Other: Not specified / training only

**Tier dropdown** appears only when the class supports tiers:

- Masters and Lightweight Masters: M40 / M45 / M50 / M55 / M60 / M65+
  (5-year breakdowns standard in the broader masters athletics community)
- Adaptive: Open / Masters 40+ / Senior Master 50+ per BCAA §7

**Progression-tracking through PRs.** Class at the time of a PR gets
captured on the milestone record, not recomputed from current profile.
An athlete's PR history shows their career arc: Novice → Amateur C →
Amateur B → Amateur A → Masters M40 → Masters M45 across years.

**v1 backup import.** `validateBackup` accepts both `comeback-tracker`
and `highland-games-tracker` envelopes. v1 payloads run through the
schema migration before saving — `baselines` → `prs`, `baselineMeta` →
`prMeta`, hard-coded lifts → `userLifts` entries with their IDs
preserved so session marks still resolve.

**Shareable card visual design — open.** Card content is locked
(centerpiece mark, headline, event, previous value, date, games title,
location, wordmark, square or 4:5 aspect ratio). Visual treatment —
colors, type, exact layout — deferred to a build-and-react prototype
during Stage 4 implementation. Save-image button (Canvas API → PNG) is
v2.1; native share sheet is v2.x.

### What's loaded for tomorrow

- `v2-plan.md` is the full design rendered in detail
- Stage 1 is shipped and tagged
- Stages 2–5 are designed but not implemented
- The natural next move is starting Stage 2 (data model + profile setup)
- One open visual-design item floats; deferred to prototype during Stage 4

See `PICKUP.md` for a paste-able prompt to restore context tomorrow.

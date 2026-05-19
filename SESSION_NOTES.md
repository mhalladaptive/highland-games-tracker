# Session notes

Chronological dev journal. Most recent entry at the top. The formal v2 plan
lives in `v2-plan.md` — these notes are the working scratchpad and a record
of what got decided when.

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

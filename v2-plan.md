# Highland Games Tracker — v2 plan

Working planning document for v2. Edit freely as planning evolves. The
detailed design captured here came out of the May 19, 2026 design session
(see `SESSION_NOTES.md` for the chronological journal). When v2.0 ships,
this doc gets retired or rolled into a CONTRIBUTING / DESIGN file.

## Status

- **Stages 1 through 4 are shipped.** Fork + rebrand (Stage 1) through
  the celebration system (Stage 4c) are built, reviewed, and shipped,
  tagged `v2.0.0-rebrand` and `v2.0.0-stage2` … `v2.0.0-stage4c` on
  `origin/main`.
- **Stage 5 is split into 5a and 5b** (decided 2026-05-22): 5a — the
  throws Progress page, replacing "See the Gap"; 5b — the S&C lifts
  view plus the Throws/Lifts toggle. Both are spec'd and handoff-ready
  (`docs/specs/v2-stage5a-spec.md`, `v2-stage5b-spec.md`); build
  pending — 5b builds after 5a ships.
- **Stage 6 (v2.0 launch polish):** not started.
- **v2.0 launch:** targeted after Stage 5 lands. Sequence is forgiving —
  each stage is independently shippable to a staging URL.

## Audience and intent

Highland Games Tracker is for athletes in the Highland Games community at
any stage of the journey:

- Veterans tracking how their current marks stack up against career peaks
- Athletes coming back from injury, working toward old PRs
- New athletes setting goal marks and chasing them
- Anyone who wants a lightweight, no-account session log

**The app's product positioning is "celebrate the moments," not "track
every rep."** Throws gets logged every session because every throw is
data. Strength & Conditioning Milestones only gets logged when the athlete
hit something notable — a 1RM test, a max-effort day, a planned PR
attempt. This framing changes how athletes approach the app: open it, log
your throws from today, leave S&C blank unless something happened worth
recording.

## Stages

### Stage 1: Fork and Rebrand (✅ shipped)

Forked from `comeback-tracker` v1.4. The strip-phase commits stripped
personal branding ("The Adaptive Oak"), renamed the app surface, moved
the storage namespace to `highland-games-tracker-v1`, accepted only
`highland-games-tracker` envelopes in backup import, removed the
adaptive-oak logo and personal photo, and added a community-facing
README. The fork point is tagged `v1.4-fork`; the end of the strip phase
is tagged `v2.0.0-rebrand`.

### Stage 2: Profile and Data Model

The schema-bump and migration stage. UI doesn't change yet; the data
shape underneath does.

**Storage schema bump v1 → v2.** Rename `baselines` → `prs` and
`baselineMeta` → `prMeta`. Add `goals` and `goalMeta` as new maps. Add
a `userLifts` array — user-defined S&C entries that replace the
hard-coded lift items. Bump `version: 1` → `version: 2`.

**Profile capture on first launch.** A small modal collects name,
gender, weight schedule, class, and tier. All fields optional. Stored
locally; never synced. See Profile schema below.

**Migration logic** runs inside `loadData()` whenever `version: 1` is
detected — same pattern as the games-in-location migration shipped in
v1.4. Idempotent. Persists via `saveData` when migration occurs.

**`validateBackup` accepts both appNames** during import — both
`comeback-tracker` (v1) and `highland-games-tracker` (v2) envelopes
pass validation. The schema migration runs on imported v1 payloads
before saving so localStorage always lands in v2 shape.

**v1 backup import maps the hard-coded lifts** (Overhead Press,
Deadlift, Hang Clean, etc. with their protocols) into `userLifts`
entries with stable IDs preserved from v1, so existing session marks
continue to resolve.

### Stage 3: Set PRs & Goals page

Replaces the v1 Set Baseline page.

**Throws section** stays a fixed list (Braemar Stone, Open Stone, the
hammers, weights for distance, weight over bar, sheaf toss). Each row
has two number inputs: PR and Goal. PRs capture date / location
metadata (via `prMeta`); Goals don't.

**Strength and Conditioning Milestones section** is user-defined.
Each lift renders as a card containing:

- Name (free text)
- Protocol (free text — "1RM," "AMRAP," "30s," "3x5 at tempo")
- Unit (dropdown, see Unit System below)
- PR value (number)
- Goal value (number)

A button at the bottom of the section — "+ Add lift" — creates a new
empty card. Each card has a ✕ in the top-right corner for soft delete
(see Lift soft-delete below).

### Stage 4: Log Session and celebration system

The big behavioral stage.

**Log Session page renames** "Lifts" → "Strength and Conditioning
Milestones" with intro text framing the section as
milestone-logging-only.

**S&C attempt cap** raises from 3 to 10 to accommodate 1RM workups.
Throws stay at 3 (matches Highland Games competition format). Both
keep the v1.4 gap-detection rule that blocks save when attempts are
non-contiguous.

**Celebration system fires at session save.** For each event in the
session:

1. If best mark in this session beats current PR → PR milestone fires.
   `prs[event]` auto-updates. `prMeta[event]` updates with the session's
   date / location / gamesTitle / sessionId.
2. If best mark in this session meets-or-beats the current goal AND
   the goal isn't already achieved → Goal milestone fires.
   `goalMeta[event] = { value: goalValue, achievedAt, achievedInSessionId }`.
3. If total milestones from this session > 1, an Awesome Day capstone
   milestone is appended.

Milestones are persisted on the session record under
`session.milestones[]`. Cards are re-derivable from this list.

**Card queue at save:**

1. All PR cards first (in event order)
2. All Goal cards next
3. Awesome Day summary card if there are 2+ milestones

Same event PR + Goal hits show as **two separate cards**, not combined.

**Card persistence and replay.** Past Sessions list flags
milestone-bearing rows with a badge. Expanded session view has a
"View Celebrations" affordance that replays the queue. The cards an
athlete sees later look identical to the cards they saw at save.

**Chain prompt** appears after a Goal celebration card is dismissed:
*"Want to set a new goal for [event]?"* If the athlete sets one, the
loop closes. If they skip, the goal sits in achieved state with no new
active goal until they set one — the Set page surfaces a soft callout
for any event in this state.

**Edits recompute milestones.**

- PR is computed as max across all sessions for that event. On any
  edit or delete, recompute. `prMeta` updates to whatever session
  currently holds the max.
- `goalMeta` (achievement record) is also recomputed. If no session
  hits the goal anymore, the entry clears and the goal returns to "not
  yet achieved."
- Active `goals[event]` value is sacred — never auto-changed by edits.
  Only the user explicitly updates it via Set page.
- Edits that *create* a new milestone fire the celebration card (same
  flow as save). Edits that *remove* a milestone are silent.

### Stage 5: Progress page

**Note (2026-05-22): Stage 5 was split into 5a and 5b.** 5a is the
throws Progress page; 5b adds the S&C lifts view and the Throws/Lifts
toggle. The per-stage specs — `docs/specs/v2-stage5a-spec.md` and
`v2-stage5b-spec.md` — are authoritative. The single-page design below
is the original scope the split was drawn from.

Replaces v1's "See the Gap."

Lands on a **vs-PR comparison** by default. Goals don't appear as a
percentage on this page — that comparison was removed because long-term
goals don't move enough to be motivating. (Goals' functional home is
the celebration system.)

**Top-of-page filter** has three session-window options, same UX
pattern as v1's competition/training/all filter:

- **Last session** — most recent session only
- **Past 3 sessions** — last 3 sessions
- **Year to date** — sessions since January 1 of current year

For each event the page calculates the best mark within the selected
window and shows it as a percentage of PR. Events with no marks in the
window show "no marks logged."

### Stage 6: v2.0 launch

- Final visual polish on the celebration cards (see Open Items)
- Smoke test across mobile + desktop
- Tag `v2.0.0`
- GitHub release
- Light usage analytics enabled (Cloudflare Web Analytics, no cookies)

## Data model

### Storage schema (v2)

```json
{
  version: 2,
  profile: { ... },       // see Profile below
  prs: { eventId: number },
  prMeta: { eventId: { date, location, gamesTitle, sessionId } },
  goals: { eventId: number },
  goalMeta: { eventId: { value, achievedAt, achievedInSessionId } },
  stoneWeights: { eventId: number },  // unchanged from v1
  userLifts: [ ... ],     // see Lift Entry below
  sessions: [ ... ]       // see Session below
}
```

### Profile

```json
profile: {
  name: string,                // optional
  gender: 'male' | 'female' | 'nonbinary' | 'unspecified',
  weightSchedule: 'mens' | 'womens',  // separable from gender
  class: ClassId,
  tier: TierId,
  setupCompletedAt: ISO8601
}
```

`weightSchedule` is the field that drives which BCAA weight table
applies (men's vs women's). For Male and Female athletes it defaults
to match gender; Non-binary and "Prefer not to say" athletes pick
explicitly.

### Lift entry (user-defined S&C)

```
userLifts: [
  {
    id: string,            // stable UUID, or preserved v1 id on import
    name: string,          // user-typed: "Front Squat", "Trap Bar Deadlift"
    protocol: string,      // user-typed: "1RM", "AMRAP 30s", "3x5"
    unit: UnitId,          // see Unit System below
    active: boolean        // false = soft-deleted
  }
]
```

The user-defined name and protocol are free text. Unit comes from the
fixed Unit System dropdown. `active: false` is the soft-delete flag —
removed lifts stay in the data so historical session marks still
resolve, but they don't appear on Set or Log Session anymore.

### Session

```
sessions: [
  {
    id: number,
    date: ISO8601-date,
    kind: 'competition' | 'training',
    location: string,
    games: string,           // Highland Games title, competition-only
    throwsNotes: string,
    liftsNotes: string,      // S&C notes
    marks: {
      [eventId]: [number, number, ...]  // attempts in order
    },
    stoneWeights: { [eventId]: number },
    milestones: [            // see Milestone shape below
      ...
    ]
  }
]
```

### Milestone

```
milestones: [
  { type: 'pr',          event: eventId, value: number, previousValue: number },
  { type: 'goal',        event: eventId, value: number, goalValue: number },
  { type: 'awesomeDay' }
]
```

The class and tier at the time of the PR also get captured on the
milestone (or in `prMeta`) so cards display the historical class — the
class an athlete was competing in when they set the record, not their
current class. This is how the progression story renders: an athlete's
record list might show Novice → Amateur C → Amateur B → Amateur A →
Masters M40 across years, each PR carrying its class-at-time.

## Class taxonomy

Two dropdowns on the profile: **Class** (broad category) and **Tier**
(age modifier where applicable). Display string concatenates them with
abbreviations or "Open"-suffix omission for brevity.

### Class dropdown

```
── Open ──
Pro
Amateur A
Amateur B
Amateur C
Amateur (unspecified)
Novice
Lightweight
Junior

── Masters ──
Masters
Lightweight Masters

── Adaptive ──
Para-Seated
Para Standing Upper Limb Loss
Para Standing Lower Limb Loss
Para Standing Neuro/Muscular

── Other ──
Not specified / training only
```

### Tier dropdown (varies by Class)

- **Pro** → no tier (Open only)
- **Amateur A / B / C / (unspecified)** → no tier (the letter is the
  tier; Amateur athletes age out into Masters rather than carrying
  letters into age tiers)
- **Novice** → no tier (Novice is by definition transitional; the
  field hides)
- **Lightweight** → no tier (Lightweight athletes who age into Masters
  become Lightweight Masters, a separate class)
- **Junior** → no tier
- **Masters** → M40 / M45 / M50 / M55 / M60 / M65+ (5-year breakdowns)
- **Lightweight Masters** → M40 / M45 / M50 / M55 / M60 / M65+
- **Adaptive (any of the four)** → Open / Masters 40+ / Senior Master
  50+ per BCAA §7. (Future: Master 60+ tier added per BCAA §14.1 when
  the adaptive pool justifies finer breakdown — at that point we add
  one row to this list.)
- **Not specified** → no tier

The Tier dropdown hides entirely when the selected Class doesn't carry
tiers. When Class changes to one that does carry tiers, the dropdown
appears and defaults to Open (where applicable) or the first option.

### Reference: BCAA framework

The four adaptive classes and their tier scheme come directly from
*Adaptive Highland Games Classifications* v3 (May 2026) published by
Broken Caber Adaptive Athletics at brokencaber.org. BCAA is
federation-neutral; the framework is freely adoptable. v2's class
dropdown adopts it as-is.

## Unit system

The S&C unit dropdown carries 10 options organized into 4 categories,
rendered with HTML `<optgroup>` headers:

```
── Weight ──
lb
kg
── Distance ──
mi
K
m
yd
── Time ──
time      (format: mm:ss or h:mm:ss)
── Count ──
reps
rounds
cal
```

**Direction-of-better varies.** For all units except `time`, higher
is better — PR is max, Goal is the next-higher mark, milestone fires
when new > current. For `time`, lower is better — PR is min, Goal is
faster, milestone fires when new < current. Each unit carries a
`direction: 'higher' | 'lower'` property.

**Conversion rules.** Same-category unit changes auto-convert all
stored values for that lift (PR, Goal, every historical session mark).
Within Weight: `kg ↔ lb`. Within Distance: `mi ↔ K ↔ m ↔ yd`. Rounding
to one decimal place keeps the displayed values clean.
**Cross-category unit changes are blocked** — converting from `lb` to
`time` doesn't make physical sense. The dropdown filters its options
when marks exist for the lift, showing only same-category alternatives.

## Celebration system

(Designed in Stage 4 above. The card visual design — colors, type,
exact layout — is the one open item, deferred to a build-and-react
prototype when we hit Stage 4 implementation.)

**Card content recap:**

- **PR card.** Centerpiece is the new mark in large type. Headline
  "New Personal Record." Event name below. Previous PR shown smaller
  ("was 40'"). Date / games title / location / wordmark.
- **Goal card.** Same template, headline "Goal Achieved." Mark in
  centerpiece, goal value shown smaller ("you set 42', you hit 43'2").
  Date / games title / location / wordmark.
- **Awesome Day card.** Date and games title at top. List of all
  milestones. Headline "Awesome Day." Wordmark.

All cards target **square or 4:5 aspect ratio** for Instagram/stories
share-friendliness. Wordmark on every card for share-virality. Cards
are styled for screenshot regardless of whether the implementation
adds a Canvas-rendered PNG download later.

**Save-image button** (Canvas API → PNG download) is a v2.1 addition.
**Native share sheet** (`navigator.share()`) is v2.x.

## Migration

### v1 → v2 storage schema migration

Runs in `loadData()` when `version: 1` is detected:

1. `data.baselines` → `data.prs`
2. `data.baselineMeta` → `data.prMeta`
3. `data.goals = {}`
4. `data.goalMeta = {}`
5. `data.userLifts = [` built from the v1 hard-coded lift items that
   have baseline values, with names and protocols from `ITEMS`,
   `unit: 'lb'`, stable IDs preserved from v1 `]`
6. `data.profile = {}` with empty fields; first launch still triggers
   the profile setup modal because `setupCompletedAt` is absent
7. `data.version = 2`

Idempotent — `data.version === 2` short-circuits the migration.
Persists via `saveData` when migration runs.

### v1 backup import

`validateBackup` accepts both `appName: 'comeback-tracker'` and
`appName: 'highland-games-tracker'`, and accepts both `version: 1`
and `version: 2` envelopes. Imported v1 payloads run through the
schema migration before saving. Tests cover all four combinations
(v1 cb-tracker, v1 hg-tracker [unusual but possible], v2 cb-tracker
[unusual], v2 hg-tracker).

### v1.4 legacy migration carried forward

The `migrateLegacyGamesLocation` migration shipped in v1.4 stays in
`shared.js`. It's a no-op on native v2 localStorage (which never has
v1-shape competition sessions with games-in-location), but runs on
imported v1 backups in addition to the schema migration. Order:
schema migration first (renames `baselines` → `prs`, etc.), then
games-in-location migration (operates on sessions).

## Open items

- **Visual card design** — colors, typography, exact layout.
  Deferred to Stage 4 prototype rather than verbal design. Aspect
  ratio (square/4:5), wordmark, and content fields are settled; the
  visual feel comes together in code.
- **Default ITEMS list audit.** The hard-coded throws list in v1 was
  Matt's training set. For v2 community, audit whether the throws
  list matches what most federations contest. Probably no changes
  needed; flagged for review during Stage 2 implementation.

## Carried over from v1.x backlog

- **Throws / S&C toggle on Log Session — v2.1.** Log Session stacks all
  eight throws above the S&C section, so logging an S&C milestone means
  scrolling past every throw. A Throws / S&C in-page toggle — mirroring
  the Stage 5 Progress page's toggle — fixes that. Originally parked as
  "separate Log Session pages" in the `comeback-tracker` v1.x backlog;
  the in-page toggle is the cleaner form and keeps it consistent with
  the Progress page. Targeted at v2.1.
- **View as a dedicated nav tab.** Promote the read-only session
  browser to its own top-level entry. v2.x.
- **Lightweight usage analytics.** Cloudflare Web Analytics (free,
  no cookies, no PII) on the deployed v2 build so the community
  release surfaces basic visibility into page views and unique
  visitors. Targets v2.0 launch.

## Field notes from v1 use

(empty — add things noticed while using v1.4 over the coming weeks)

# Highland Games Tracker — v2 plan

A working document. Edit freely as planning evolves. Carries over to the
`highland-games-tracker` repo when the fork happens.

## Background

Forking from `comeback-tracker` v1.4. v1 stays frozen as Matt's personal
"Adaptive Oak's Comeback Tracker"; v2 is the community-facing Highland Games
Tracker.

## Decisions locked in (May 2026)

### Audience
Highland Games community at large — competitors, masters athletes, comebackers,
new athletes. Not personal anymore.

### Name and identity
- App name: **Highland Games Tracker**
- Repo: `highland-games-tracker`
- Launch with **wordmark only**. No logo image at v2.0. Real logo deferred
  to v2.x once usage validates the effort.
- Drop: "The Adaptive Oak" logo, Sam's adaptive-throw photo, all "comeback"
  framing in copy.
- Keep (generic, sport-coded, no rework needed at launch): grass-field
  background, training-field background, tape-measure SVG.

### Data model change: PRs and Goals per event
v1's single `baselines` map per event becomes two reference marks per event:

- **PR** — the athlete's best mark ever for that event
- **Goal** — the mark they're working toward

Both fields are optional and independent. A new athlete might fill in Goals
and leave PRs blank. A masters athlete on a comeback might have a PR from
their peak years and a Goal that's the recovery target.

This expands what Progress can say. Instead of one number vs. one baseline,
it's two relationships:

- *Current best vs. PR* — how close to your historical peak
- *Current best vs. Goal* — how close to your target

Both can show as percentages, both can drive a bar, both can be filtered.

### Page rename: "See the Gap" becomes "Progress"
The deficit framing of "Gap" assumes baseline > current — fine for a
comebacker, wrong for an athlete still progressing past their best.
"Progress" works in both directions and feels like a normal training-app tab.

## Strip and rebrand checklist (first 5–10 commits in v2 repo)

These are pre-feature commits — they should land without changing the app's
behavior, just its presentation and identity. Anyone reading the v2 repo from
day one shouldn't see traces of the personal v1.

1. Initialize repo from v1.4: clone with full history, tag the fork point
   (`v1.4-fork`) so future-you can find the boundary.
2. **Rename app surface:**
   - `<title>` and `<h1>` on every page → "Highland Games Tracker"
   - `header` `alt` text, `aria-label`s referencing "Adaptive Oak"
   - Storage key in `shared.js`: `comeback-tracker-v1` → `highland-games-tracker-v1`
     (different key so v1 and v2 can coexist in the same browser if needed)
   - `appName` in `validateBackup`: `comeback-tracker` → `highland-games-tracker`
   - README rewrite
   - CNAME — new domain/subdomain
3. **Remove personal assets:**
   - `images/adaptive-oak-logo.png`
   - `images/adaptive-thrower.jpg`
4. **Strip "comeback" wording:**
   - Header
   - Set Baseline intro paragraph ("pre-2020 marks")
   - Backup help text if it mentions "comeback"
5. Update v2-plan.md → README content; archive or delete this file.

End of strip phase: v2 repo at v1.4 functionality, but rebranded.

## Data model evolution (v2.0 launch features)

These commits introduce the PRs + Goals split. Each should be small and
testable.

### New storage schema
```
{
  version: 2,
  prs: { 'braemar-stone': 426, ... },
  prMeta: { 'braemar-stone': { date: '2019-10-12', location: 'Radford' } },
  goals: { 'braemar-stone': 450, ... },
  goalMeta: {},
  stoneWeights: { ... },           // unchanged
  sessions: [ ... ]                // unchanged
}
```

Old `baselines` and `baselineMeta` become `prs` and `prMeta`. A new pair
`goals` and `goalMeta` appears. `version: 2` gates the migration.

### Migration from v1 backup
When a user imports a v1 backup JSON:
- `data.baselines` → `data.prs`
- `data.baselineMeta` → `data.prMeta`
- `data.goals = {}`, `data.goalMeta = {}`
- bump `version: 1` → `version: 2`

Localstorage migration is handled inside `loadData` similar to the
games-in-location migration we just shipped in v1.4.

### Set Baseline page rebuild
Renamed to "Set PRs & Goals" (or similar — TBD copy).
Each event row gets two number fields side by side: PR and Goal.
Date/location capture continues for PRs (the historical mark). For Goals,
date/location is probably noise — leave it off.

### Progress page rebuild
Each event row shows three numbers, not two:
- Current best from sessions
- PR (with % of PR badge)
- Goal (with % of Goal badge)

Visual TBD. Options to consider:
- Two bars per event (one to PR, one to Goal)
- One bar with markers at PR and Goal positions
- Toggle: "vs PR" / "vs Goal" tab to flip the view

## Sequencing

| Stage | Scope | Done when |
|---|---|---|
| 1 | Fork + rebrand strip | v2 repo deployed at new URL, no v1 traces |
| 2 | Data model: PRs + Goals | New storage shape live, v1 backup import works |
| 3 | Set PRs & Goals page | Two-field input working |
| 4 | Progress page rebuild | Both relationships visible per event |
| 5 | v2.0 tag and release | Public-facing announcement |

Each stage is independently shippable to a staging URL. Real-world feedback
between stages.

## Carried over from v1.x backlog

Items parked in `v2-ideas.md` still apply:
- Throws and Lifts on separate Log Session pages — likely lands in v2.x after
  the data-model rework settles
- View as a dedicated nav tab — v2.x
- Lightweight usage analytics — first deployed v2.0 with this enabled, since
  community release means no direct contact with users

## Open questions to revisit

- **Default ITEMS list.** v1 has a specific throws + lifts list that suits
  Matt. Is this representative of the broader community? Are caber, sheaf,
  and stones all worth keeping as defaults? Should the app allow users to
  add custom events? Probably yes eventually — flag for v2.x.
- **Goal-setting UX.** Should the app suggest a Goal from PR (e.g., "PR + 5%")
  or always leave it blank for the user? Suggested goal is friendlier;
  blank is more honest.
- **Comeback story.** Matt's "I'm working back to pre-2020 marks" is one of
  many valid stories the app should support. Worth a discoverable onboarding
  flow that lets users self-identify (new athlete / progressing / comebacking
  / masters) and gets the right copy in front of them? Or is that
  over-engineering for v2.0?

## Field notes from v1 use

(empty — add things you notice while using v1.4 over the next few weeks)

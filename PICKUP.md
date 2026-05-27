# Pickup prompt

Paste-able prompt for restoring context in a fresh Claude conversation.
Copy the block below into a new session when you want to resume v2 work.

---

```text
Picking up v2 work on Stone & Standard (~/dev/highland-games-tracker —
the repo directory keeps its old name; the rename is at the brand
layer, not the filesystem layer, until after v2.0 ships).

YOUR ROLE — read this first. This is a Cowork session. Under the Higgins
Method, cowork is the PLANNER: cowork turns ideas into spec sketches and
hands them to ccode (Claude Code), who builds; gpt (ChatGPT) reviews.
Cowork does NOT write or edit the app's code.

Context to load before we start:

1. Read v2-plan.md root to bottom — the full v2 design from the
   2026-05-19 design session, mostly locked product decisions. Stages
   1 through 5 are shipped; Stage 6a is spec'd and handoff-ready;
   Stage 6 housekeeping (smoke test, tag, release, analytics) sits
   after 6a. The Status block at the top is current as of 2026-05-26.

2. Read SESSION_NOTES.md, newest entry first — the journal of how we
   got here.

3. Read docs/specs/v2-stage6a-spec.md closely — the active spec. As of
   the 2026-05-26 revision it bundles the throws PR celebration card
   visual lift (soft-grey card with implement-specific silhouette,
   audio plumbing) AND the app rename to Stone & Standard. The spec is
   ccode-handoff-ready: ccode handoff prompt and gpt review prompt are
   at the bottom. The shipped specs (v2-stage2-spec.md through
   v2-stage5b-spec.md) sit in docs/specs/ as models for the cowork
   spec-sketch format.

4. Skim the highland-games-tracker / Stone & Standard entries in the
   skills ledger:
   ~/Documents/Obsidian Vault/Reference/Higgins Method/skills-ledger.md

Current state:

- The v2 feature build is COMPLETE through Stage 6a. Stages 1 through
  6a are shipped and tagged — v2.0.0-rebrand, v2.0.0-stage2,
  v2.0.0-stage3a / 3b, v2.0.0-stage4a / 4b / 4c, v2.0.0-stage5a,
  v2.0.0-stage5b, v2.0.0-stage6a (pushed to origin/main 2026-05-27).
- Stage 6a shipped 2026-05-27 in 9 atomic commits on a feature branch
  (stage-6a-stone-and-standard) plus three follow-up commits (cowork
  docs reconciliation, README softening, and a 1-line chore commit
  cleaning up a duplicated assignment). It bundles:
    (a) The throws PR celebration card lift — soft-grey card (#F4F4F4),
        implement-specific athlete silhouette as hero, no animated
        cut-scene (deferred to a possible v2.1+ upgrade path).
    (b) Audio plumbing — sound on/off toggle on the overlay, off by
        default, preference in a standalone localStorage flag named
        stone-and-standard-sound. Placeholder audio files ship;
        real clips inject later.
    (c) The app rename to "Stone & Standard" across surface, storage
        namespace (stone-and-standard-v1, with idempotent copy-only
        migration from highland-games-tracker-v1), backup envelope
        (validateBackup accepts stone-and-standard, highland-games-
        tracker, and comeback-tracker; exportData writes the new one),
        package.json, and README.
    (d) One bonus UX rename ccode added that's not in the spec — the
        event display name "Weight Over Bar" became "Weight for
        Height" (event id stays stable at weight-over-bar). "Height"
        describes what's measured better than "Bar."
- Eight silhouettes are at images/silhouettes/ in the shipped build:
  stone, weight-distance, and weight-over-bar each as adaptive +
  able-bodied pairs; hammer and sheaf as single-variant. Adaptive
  variants for hammer and sheaf are gaps that 6b closes.
- Stage 6b is SPEC'D and handoff-ready (docs/specs/v2-stage6b-spec.md).
  Small post-6a scope: add hammer + sheaf to
  SILHOUETTE_PAIRED_IMPLEMENTS, rename existing single-variants to
  -able-bodied, add the new adaptive variants (staged in
  Images for Cards/ as silhouette-hammer-adaptive.png,
  silhouette-sheaf-adaptive.png, silhouette-sheaf-able-bodied.png
  with taller standards). Updates tests + cowork mockup +
  v2-plan/PICKUP. Low-risk, presentation-only.
- After 6b ships: the Stage 6 housekeeping — cross-device smoke test
  (mobile + desktop; 5a/5b/6a were desktop-verified, mobile checked
  via CSS only), the v2.0.0 release tag, the GitHub release, and
  Cloudflare Web Analytics.
- Cross-implement visual style remains mixed by accepted decision:
  stone + weight-distance carry detailed silhouettes with white kilt
  tartan accents; hammer + sheaf + WOB are pure black graphic
  silhouettes. Each implement at its own authentic throw moment.
- Tooling: Biome lint in the loop — `npm run lint` is a verification
  step. Test suite runs in-browser via tests.html (371 tests as of
  Stage 6a ship — up from 348 at 5b, +23 tests for selection helper,
  sound, migration, backup).
- L1 gate: PAUSED for the rest of the v2 build, per Oak's 2026-05-23
  decision — to resume after the project ships. Don't plan, surface,
  or push L1 sub-gate work until then.
- Repo state at the 2026-05-27 wrap: on main at v2.0.0-stage6a
  (6c7b541), origin/main synced. The stage-6a-stone-and-standard
  branch is preserved both locally and on origin — safe to delete
  (`git branch -d stage-6a-stone-and-standard && git push origin
  --delete stage-6a-stone-and-standard`) but not blocking. The 6b
  scope assets are staged uncommitted in Images for Cards/ (hammer
  adaptive, sheaf adaptive, sheaf able-bodied with taller standards)
  ready for ccode to move into images/silhouettes/ during the 6b
  build. v2.1 backlog now includes the "athlete adds own photo to
  celebration card" feature alongside the existing v2.1 items
  (Save-image button, native share sheet) — v2.1 becomes a coherent
  "share story" release.

Where I want to start today: [STATE YOUR GOAL. The 6b spec is
handoff-ready, so the natural next move is the ccode build for 6b —
small low-risk presentation-only stage that closes the adaptive-pair
coverage gap. After 6b: Stage 6 housekeeping (cross-device smoke
test, v2.0.0 release tag, GitHub release, Cloudflare Web Analytics).
Other possibilities — jump ahead to one of the housekeeping items,
refine the 6b spec further, or pivot to v2.1 design. State what
you want.]

How I want to work:

- Keep the roles clean: cowork plans, ccode builds, gpt reviews.
- Slow down on multiple-choice questions. Walk through your thinking,
  ask open questions, let me reach the answer rather than picking from
  a menu.
- Atomic commits, v1 style (small, focused, descriptive). One concern
  per commit. (Guidance for ccode, carried in the spec.)
- Don't push to GitHub on my behalf; hand me the push and tag commands.
- Teach mode — I'm learning vibe-coding and appreciate teachable
  moments noted naturally as we go.
- Smoke-test hygiene: when the app is served locally for a smoke test,
  the browser can serve stale cached files — hard-reload (Cmd+Shift+R)
  each page before testing it.
```

---

## Why a pickup prompt exists

Long design sessions load a lot of context. The decisions sit in the
conversation transcript, which evaporates when the session ends. The
plan and notes files persist that context in the repo so future-you (and
future Claude) can reconstruct it from artifacts, not memory.

When you start a new conversation tomorrow:

1. Paste the prompt block above into Claude.
2. Tell Claude what you want to work on today.
3. Claude reads v2-plan.md and SESSION_NOTES.md.
4. You're back where you left off without rebuilding context turn by
   turn.

Edit this prompt freely as the project evolves. The shape should stay
the same — load context → state today's goal → set the working norms.

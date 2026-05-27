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

- The v2 feature build is COMPLETE through Stage 5b. Stages 1 through
  5 are shipped and tagged — v2.0.0-rebrand, v2.0.0-stage2,
  v2.0.0-stage3a / 3b, v2.0.0-stage4a / 4b / 4c, v2.0.0-stage5a,
  v2.0.0-stage5b.
- Stage 6a — v2.0 launch structural — is SPEC'D and handoff-ready
  (docs/specs/v2-stage6a-spec.md, revised 2026-05-26). It bundles:
    (a) The throws PR celebration card lift — soft-grey card (#F4F4F4),
        implement-specific athlete silhouette as hero, no animated
        cut-scene (silhouette replaces it; cut-scene work deferred to
        a possible v2.1+ upgrade path).
    (b) Audio plumbing — sound on/off toggle on the overlay, off by
        default, preference in a standalone localStorage flag.
        Placeholder audio files ship; real clips inject later.
    (c) The app rename from "Highland Games Tracker" to
        "Stone & Standard" across surface, storage namespace (with
        idempotent migration), backup envelope (with backward-compat
        for v1 and v2 imports), package.json, and README.
- Six silhouette assets staged in Images for Cards/ as transparent
  RGBA PNGs: stone adaptive + able-bodied, weight-distance adaptive +
  able-bodied (existing), hammer (single-variant), sheaf (single-
  variant). Hammer + sheaf adaptive variants and a Weight Over Bar
  silhouette are gaps to fill iteratively after v2.0. The 6a spec
  carries an un-skinned fallback for WOB.
- Cross-implement visual style is mixed by accepted decision: stone +
  weight-distance carry detailed silhouettes with white kilt tartan
  accents; hammer + sheaf are pure black graphic silhouettes. Each
  implement renders at its own authentic throw moment (stone wind-up,
  weight-distance release, hammer mid-spin, sheaf apex) — no
  cross-event harmonization.
- The remaining Stage 6 work after 6a: cross-device smoke test (5a/5b
  were desktop-verified, mobile checked via CSS only), the v2.0.0
  tag, the GitHub release, Cloudflare Web Analytics.
- Tooling: the Biome linter is in the loop — `npm run lint` is a
  verification step. The test suite runs in-browser via tests.html
  (348 tests as of Stage 5b; new coverage in 6a).
- L1 gate: PAUSED for the rest of the v2 build, per Oak's 2026-05-23
  decision — to resume after the project ships. Don't plan, surface,
  or push L1 sub-gate work until then.
- Repo state at the 2026-05-26 wrap: on main, everything through
  Stage 5b shipped and tagged. Uncommitted from the 2026-05-26 design
  session: the substantially revised 6a spec, the v2-plan.md updates,
  this PICKUP refresh, the silhouette assets and version-test bundle
  under Images for Cards/, and (when written) the session-end
  SESSION_NOTES entry — one docs: commit closes them.

Where I want to start today: [STATE YOUR GOAL. The 6a spec is
handoff-ready, so the natural next move is the ccode build: hand the
spec to ccode, build atomically per the spec's commit sequence, gpt
review, fix, ship as v2.0.0-stage6a. Other possibilities — refine the
6a spec further before handoff, generate the Weight Over Bar silhouette
and the hammer/sheaf adaptive variants, jump ahead to the v2.0 launch
checklist. State what you want.]

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

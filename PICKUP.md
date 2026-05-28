# Pickup prompt

Paste-able prompt for restoring context in a fresh Claude conversation.
Copy the block below into a new session when you want to resume v2 work.

---

```text
Picking up v2 work on Stone & Standard (~/dev/highland-games-tracker —
the repo directory keeps its old name; the rename is at the brand
layer, not the filesystem layer, until after v2.0 ships).

YOUR ROLE — read this first. This is a Cowork session. Under the
Higgins Method (v0.6, 2026-05-27), cowork is the PLANNER: cowork turns
ideas into spec sketches and hands them to ccode (Claude Code), who
builds; codex (ChatGPT Codex inside VS Code) reviews in review-only
mode. Cowork does NOT write or edit the app's code.

Context to load before we start:

1. Read v2-plan.md root to bottom — the full v2 design from the
   2026-05-19 design session, mostly locked product decisions. Stages
   1 through 6b are shipped; the remaining v2.0 work is the Stage 6
   housekeeping cluster (cross-device smoke test, v2.0.0 launch tag,
   GitHub release, Cloudflare Web Analytics). The Status block at the
   top is current as of 2026-05-27 end-of-day.

2. Read SESSION_NOTES.md, newest entry first — the journal of how we
   got here.

3. Skim docs/specs/ — the shipped spec sketches (v2-stage2-spec.md
   through v2-stage6b-spec.md) sit there as models for the cowork
   spec-sketch format. There's no active feature spec right now —
   the v2.0 feature build is complete.

4. Skim the Stone & Standard entries in the skills ledger:
   ~/Documents/Obsidian Vault/Reference/Higgins Method/skills-ledger.md

5. Skim higgins-method.md — v0.6 (2026-05-27) renamed the Reviewer
   callsign from "gpt" to "codex" and added explicit read-only
   guardrails. Pre-v0.6 spec sketches keep the "gpt" framing as
   historical artifacts.

Current state (end of 2026-05-27):

- The v2 feature build is COMPLETE through Stage 6b. Stages 1
  through 6b are shipped and tagged — v2.0.0-rebrand, v2.0.0-stage2,
  v2.0.0-stage3a/3b, v2.0.0-stage4a/4b/4c, v2.0.0-stage5a/5b,
  v2.0.0-stage6a, and v2.0.0-stage6b on origin/main.
- Stage 6a (2026-05-27) shipped the throws PR celebration card lift —
  soft-grey card (#F4F4F4) with implement-specific athlete silhouette
  hero, audio plumbing (sound toggle off by default, preference key
  stone-and-standard-sound), and the brand rename from Highland Games
  Tracker to Stone & Standard across surface, storage namespace
  (stone-and-standard-v1, idempotent copy-only migration from the old
  key), backup envelope (validateBackup accepts stone-and-standard,
  highland-games-tracker, and comeback-tracker; exportData writes the
  new one), package.json, and README. Bonus UX rename ccode added:
  "Weight Over Bar" event display became "Weight for Height" (event
  id stays stable at weight-over-bar).
- Stage 6b (2026-05-27, same day) shipped the adaptive-pair
  completion — hammer and sheaf joined the
  SILHOUETTE_PAIRED_IMPLEMENTS set. All five throws implements now
  have adaptive + able-bodied silhouette pairs; ten silhouettes live
  at images/silhouettes/.
- Cross-implement visual style remains mixed by accepted decision:
  stone + weight-distance carry detailed silhouettes with white kilt
  tartan accents; hammer + sheaf + WOB are pure black graphic
  silhouettes. Each implement at its own authentic throw moment.
- Higgins Method v0.6 landed 2026-05-27 — Reviewer callsign renamed
  from "gpt" to "codex" to reflect the actual tool (ChatGPT Codex
  inside VS Code, replacing manual file upload to ChatGPT chat).
  Canonical review-prompt opener now enforces read-only mode
  explicitly because Codex is agentic with filesystem access.
- Remaining v2.0 work — Stage 6 housekeeping, all Oak-driven
  verification and packaging, no more feature commits:
    (a) Cross-device smoke test — 5a/5b/6a/6b were desktop-verified;
        mobile only via CSS. Drive the live app on phone + Mac, walk
        each major flow, hard-reload (Cmd+Shift+R) to dodge stale
        cache.
    (b) v2.0.0 launch tag — distinct from the per-stage
        v2.0.0-stage* tags.
    (c) GitHub release at the v2.0.0 tag, with release notes.
    (d) Cloudflare Web Analytics on the deployed v2 build (free, no
        cookies, no PII).
- Stones section moved to v2.1 (decided 2026-05-27, pending input
  from Oak's stone-lifting-expert friend). v2.1 backlog now: Stones
  section + athlete photo overlay on celebration card + Save-image
  button (Canvas API → PNG download) + native share sheet
  (navigator.share()) — coherent "share story + Stones" release.
- Tooling: Biome lint in the loop — `npm run lint` is a verification
  step. Test suite runs in-browser via tests.html (371 tests as of
  Stage 6b ship; same count as 6a since 6b changes were
  assertion-level only).
- L1 gate: STILL PAUSED for the rest of the v2 build through launch,
  per Oak's 2026-05-23 decision — resumes after v2.0 ships.
- Repo state at 2026-05-27 end-of-day: on main at 5bf77b3 (the
  Higgins Method v0.6 docs commit), one commit past v2.0.0-stage6b
  at b5aa667. origin/main synced. The stage-6b-stone-and-standard
  and stage-6a-stone-and-standard branches are preserved both
  locally and on origin — safe to delete
  (`git branch -d <branch> && git push origin --delete <branch>`)
  but not blocking.

Where I want to start today: [STATE YOUR GOAL. The natural next
moves, in rough order: (1) cross-device smoke test of the shipped
app on mobile + desktop — this is the gating check before the launch
tag; (2) v2.0.0 launch tag + GitHub release once smoke test clears;
(3) Cloudflare Web Analytics setup; (4) v2.1 design session for
Stones once you have expert input from your stone-lifting friend.
State what you want.]

How I want to work:

- Keep the roles clean: cowork plans, ccode builds, codex reviews
  in review-only mode.
- Slow down on multiple-choice questions. Walk through your
  thinking, ask open questions, let me reach the answer rather than
  picking from a menu.
- Atomic commits, v1 style (small, focused, descriptive). One
  concern per commit. (Guidance for ccode, carried in the spec.)
- Don't push to GitHub on my behalf; hand me the push and tag
  commands.
- Teach mode — I'm learning vibe-coding and appreciate teachable
  moments noted naturally as we go.
- Smoke-test hygiene: when the app is served locally for a smoke
  test, the browser can serve stale cached files — hard-reload
  (Cmd+Shift+R) each page before testing it.
- Paste blocks for terminal commands contain ONLY commands — no
  hash-prefixed comments or descriptive prose. Descriptions go
  between blocks, not inside them.
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

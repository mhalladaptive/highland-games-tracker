# Pickup prompt

Paste-able prompt for restoring context in a fresh Claude conversation.
Copy the block below into a new session when you want to resume v2 work.

---

```text
Picking up v2 work on Stone & Standard (~/dev/highland-games-tracker —
the repo directory keeps its old name; the rename is at the brand
layer, not the filesystem layer, until after v2.0 ships).

YOUR ROLE — read this first. This is a Cowork session. Under the
Higgins Method (v0.6, 2026-05-27), cowork is the PLANNER: cowork
turns ideas into spec sketches and hands them to ccode (Claude Code),
who builds; codex (ChatGPT Codex inside VS Code) reviews in review-
only mode. Cowork does NOT write or edit the app's code.

Context to load before we start:

1. Read v2-plan.md root to bottom — the full v2 design from the
   2026-05-19 design session, mostly locked product decisions. Stages
   1 through 6c are shipped (twelve tagged stages total). The v2
   feature plus polish build is structurally complete. Remaining v2.0
   work is the four-action launch housekeeping cluster: cross-device
   smoke test, v2.0.0 launch tag, GitHub release, Cloudflare Web
   Analytics. The Status block at the top is current as of 2026-05-28.

2. Read SESSION_NOTES.md, newest entry first — the journal of how we
   got here. The 2026-05-28 entry captures Stage 6c's three-direction
   design pivot, the ccode build, the codex contrast Major and ccode
   fix, the iOS Safari cache lesson, and the lessons banked.

3. Skim docs/specs/ — the shipped spec sketches (v2-stage2-spec.md
   through v2-stage6c-spec.md) sit there as models for the cowork
   spec-sketch format. No active feature spec right now — the v2.0
   feature plus polish build is complete.

4. Skim the Stone & Standard entries in the skills ledger:
   ~/Documents/Obsidian Vault/Reference/Higgins Method/skills-ledger.md

5. Skim higgins-method.md — v0.6 (2026-05-27) renamed the Reviewer
   callsign from "gpt" to "codex" and added explicit read-only
   guardrails. Pre-v0.6 spec sketches (v2-stage6a-spec.md and earlier)
   keep the "gpt" framing as historical artifacts.

Current state (end of 2026-05-28):

- Stages 1 through 6c are shipped and tagged — v2.0.0-rebrand,
  v2.0.0-stage2, v2.0.0-stage3a/3b, v2.0.0-stage4a/4b/4c,
  v2.0.0-stage5a/5b, v2.0.0-stage6a, v2.0.0-stage6b, and
  v2.0.0-stage6c on origin/main.
- Stage 6a (2026-05-27) shipped the throws PR celebration card lift,
  audio plumbing, and the brand rename to Stone & Standard.
- Stage 6b (2026-05-27) completed adaptive-pair coverage for hammer
  and sheaf. Ten silhouettes at images/silhouettes/.
- Stage 6c (2026-05-28) pivoted the throws PR card to an ornate
  Highland Games-themed template (PR shield + parchment medallion
  + stone plaque + brass scroll banner + thistle-and-laurel framing
  + misty mountain backdrop) with silhouette and dynamic text as
  positioned overlays. The 6c design arc went through three
  directions in one evening: first soft-grey+Saltire+wave-animation,
  then a pivot to the ornate template after Oak generated it via
  GPT image gen. Spec was rewritten end-to-end for the template
  approach. The Saltire commit is orphaned v2.x backlog material.
  WCAG AA contrast achieved with #fff8d8 pale-warm-cream body text
  (codex flagged the original #3a2a14 as Major — 1.58:1 plaque,
  2.61:1 scroll; ccode patched, cowork remeasured 9.75:1 plaque,
  7.73:1 scroll, both passing AA normal text).
- Higgins Method v0.6 (2026-05-27) renamed Reviewer callsign from
  "gpt" to "codex" with read-only guardrails.
- iOS Safari cache lesson banked 2026-05-28 — mobile smoke tests
  need cache-bust query string as the first page-load step, not
  desktop's Cmd+Shift+R.
- Remaining v2.0 work — Stage 6 housekeeping, all Oak-driven
  verification and packaging:
    (a) Cross-device smoke test — full app, mobile + desktop, with
        cache-bust query string baked in. Use
        docs/v2.0-smoke-test-checklist.md as the guide (cowork
        wrote it 2026-05-27; refresh for the new ornate card +
        cache-bust before driving).
    (b) v2.0.0 launch tag — distinct from the per-stage tags.
    (c) GitHub release at the v2.0.0 tag with release notes
        summarizing v2.0's arc.
    (d) Cloudflare Web Analytics on the deployed v2 build.
- Stones section is v2.1 (decided 2026-05-27, pending expert input
  from Oak's stone-lifting-expert friend). Reference imagery for
  named-manhood-stone lift positions staged 2026-05-28 in
  Images for Cards/ (stoneman-break-it-off-the-ground, -chest, -lap,
  -shoulder, -overhead).
- v2.1 design-language extension — Goal cards, Awesome Day
  capstones, and lift PR cards all keep their existing v2.0 simpler
  presentations; they pick up the 6c ornate-template design language
  in v2.1. Reference templates staged in Images for Cards/
  (awesome-day-template, s&c-pr-template, s&c-goal-template,
  s&c-awesome-day-template, stone-pr-template).
- v2.1 dashboard redesign — reference mockups staged 2026-05-28
  (s&s-mobile-layout.png mobile portrait, s&S-dashboard.png desktop
  widescreen; the desktop variant still reads HIGHLAND GAMES TRACKER
  pre-rename and will need refresh during v2.1 design).
- v2.1 share-story trio — athlete photo overlay on celebration
  cards, Save-image button (Canvas API → PNG), native share sheet
  (navigator.share()).
- Tooling: Biome lint in the loop — `npm run lint` is a
  verification step. Test suite runs in-browser via tests.html
  (371 tests as of 6c ship; same count as 6a/6b — 6c was DOM
  restructure with dual-class names preserving Stage 4b regex
  selectors).
- L1 gate: STILL PAUSED for the rest of v2.0 launch, per Oak's
  2026-05-23 decision — resumes after v2.0 ships.
- Repo state at 2026-05-28 end-of-day: on main, head is the
  v2.1 dashboard mockups chore commit (three commits past
  v2.0.0-stage6c at 7f8b657). origin/main synced. Stage feature
  branches preserved on origin and safe to delete whenever cleanup
  gets prioritized (stage-6a-stone-and-standard,
  stage-6b-stone-and-standard); not blocking.

Where I want to start today: [STATE YOUR GOAL. The natural next
moves, in rough order: (1) cross-device smoke test of the whole
shipped app on mobile + desktop — this is the gating check before
the v2.0.0 launch tag. With the ornate 6c PR card on the throws PR
path and the cache-bust query string discipline, this should go
faster than tonight's 6c eyeball did; (2) v2.0.0 launch tag once
smoke test clears; (3) GitHub release at the tag with release notes;
(4) Cloudflare Web Analytics setup; (5) v2.1 design session for
Stones (once you have expert input from your stone-lifting friend)
and for the design-language extension to Goal / Awesome Day / Lift
PR cards using the reference templates staged in Images for Cards/.
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
- Smoke-test hygiene on desktop: hard-reload (Cmd+Shift+R) each
  page before testing. Smoke-test hygiene on mobile (banked
  2026-05-28): use a cache-bust query string like
  http://<mac-ip>:8000?v=YYYYMMDD-HHMM as the first page-load step.
  iOS Safari caches localhost resources aggressively and the
  desktop hard-reload trick does not translate.
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

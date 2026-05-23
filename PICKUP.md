# Pickup prompt

Paste-able prompt for restoring context in a fresh Claude conversation.
Copy the block below into a new session when you want to resume v2 work.

---

```text
Picking up v2 work on Highland Games Tracker (~/dev/highland-games-tracker).

YOUR ROLE — read this first. This is a Cowork session. Under the Higgins
Method, cowork is the PLANNER: cowork turns ideas into spec sketches and
hands them to ccode (Claude Code), who builds; gpt (ChatGPT) reviews.
Cowork does NOT write or edit the app's code.

Context to load before we start:

1. Read v2-plan.md root to bottom — the full v2 design from the
   2026-05-19 design session. Mostly locked product decisions; flag
   anything that reads as a recommendation vs. a decision before
   assuming. Stage 5 (the Progress page) is the next unbuilt stage —
   read that section closely. Note: the Status section near the top of
   v2-plan.md is stale — trust the "Current state" list below.

2. Read SESSION_NOTES.md, newest entry first — the journal of how we
   got here.

3. Skim the spec sketches as the model for a cowork spec sketch — they
   live in docs/specs/. v2-stage2-spec.md, v2-stage3a-spec.md,
   v2-stage3b-spec.md, v2-stage4a-spec.md, v2-stage4b-spec.md, and
   v2-stage4c-spec.md are all shipped; v2-stage5a-spec.md is spec'd,
   build pending.

4. Skim the highland-games-tracker entries in the skills ledger:
   ~/Documents/Obsidian Vault/Reference/Higgins Method/skills-ledger.md

Current state:

- Stages 1, 2, 3a, 3b, 4a, 4b, and 4c are SHIPPED and tagged —
  v2.0.0-rebrand, v2.0.0-stage2, v2.0.0-stage3a, v2.0.0-stage3b,
  v2.0.0-stage4a, v2.0.0-stage4b, v2.0.0-stage4c. Stage 4 — the big
  behavioral stage — is complete: 4a put Log Session on userLifts (the
  3→10 attempt cap, the "Strength and Conditioning Milestones" rename);
  4b built the celebration system (milestone detection at save, the
  PR/Goal/Awesome Day cards, the queue, the Past Sessions badge +
  replay); 4c added recompute-on-edit, the chain prompt, and the
  Set-page achieved-goal callout. All three Stage 4 gpt reviews came
  back "ship as-is" with zero findings.
- Tooling: the Biome linter was added 2026-05-22; `npm run lint` is a
  verification step in the loop. Every stage from 4a on is built with
  the linter live.
- Stage 5 is split two ways (decided 2026-05-22): 5a — the Progress
  page for throws, replacing v1's "See the Gap"; 5b — the S&C lifts
  view plus the Throws/Lifts toggle. 5a is spec'd and handoff-ready
  (docs/specs/v2-stage5a-spec.md, with the ccode and gpt prompts built
  in); building it is a ccode session. 5b is not yet spec'd.
- L1 gate: three interleaved ~1-hour sub-gates, L1.1 / L1.2 / L1.3,
  each a functional cold-read of one file at the front of a build.
  None cleared yet — and none attempted across 4a/4b/4c. The planned
  L1.1 target was gap.js, but Stage 5a retires gap.js (rebuilds it as
  progress.js) — so the L1.1 read either happens before 5a builds, or
  retargets to progress.js afterward. See higgins-method.md v0.5 and
  the skills ledger.
- Repo housekeeping to confirm at session start: whether local commits
  are unpushed (the 5a spec commit was local-only at last note) and
  whether the v2-plan.md / SESSION_NOTES.md / PICKUP.md doc edits are
  committed.

Where I want to start today: [STATE YOUR GOAL. Stage 5a is spec'd —
docs/specs/v2-stage5a-spec.md — and building it is a ccode session, not
cowork. Cowork's likely next jobs: planning Stage 5b (the lifts view +
the Throws/Lifts toggle — not yet spec'd); an L1.1 sub-gate cold-read;
or, once ccode has built 5a, the smoke test. State what you want.]

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

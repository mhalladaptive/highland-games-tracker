# Pickup prompt

Paste-able prompt for restoring context in a fresh Claude conversation.
Copy the block below into a new session when you want to resume v2 work.

---

```
Picking up v2 work on Highland Games Tracker (~/dev/highland-games-tracker).

YOUR ROLE — read this first. This is a Cowork session. Under the Higgins
Method, cowork is the PLANNER: cowork turns ideas into spec sketches and
hands them to ccode (Claude Code), who builds; gpt (ChatGPT) reviews.
Cowork does NOT write or edit the app's code.

Context to load before we start:

1. Read v2-plan.md root to bottom — the full v2 design from the
   2026-05-19 design session. Mostly locked product decisions; flag
   anything that reads as a recommendation vs. a decision before
   assuming. Stage 4 (celebration system + Log Session) is the next
   unbuilt stage — read that section closely.

2. Read SESSION_NOTES.md, newest entry first — the journal of how we
   got here.

3. Skim the spec sketches as the model for a cowork spec sketch — they
   now live in docs/specs/: v2-stage2-spec.md, v2-stage3a-spec.md,
   v2-stage3b-spec.md (all shipped), and v2-stage4a-spec.md (spec'd,
   build pending).

4. Skim the highland-games-tracker entries in the skills ledger:
   ~/Documents/Obsidian Vault/Reference/Higgins Method/skills-ledger.md

Current state:

- Stages 1, 2, 3a, and 3b are SHIPPED and tagged — v2.0.0-rebrand,
  v2.0.0-stage2, v2.0.0-stage3a, v2.0.0-stage3b. Stage 3 (the Set PRs &
  Goals page + the unit conversion engine) is complete.
- Stage 4 is split three ways (decided 2026-05-21): 4a — Log Session
  catches up to userLifts (the 3→10 attempt cap, the rename); 4b — the
  celebration system; 4c — recompute-on-edit + the chain prompt. 4a is
  spec'd and handoff-ready (docs/specs/v2-stage4a-spec.md, with the
  ccode and gpt prompts built in); 4b and 4c are not yet planned.
  Stage 4 is where goalMeta and the unit direction field finally get
  used.
- L1 gate: redesigned 2026-05-21 (Higgins Method v0.4). No longer one
  whole-project walkthrough — it is three interleaved ~1-hour sub-gates,
  L1.1 / L1.2 / L1.3, each a functional cold-read of one file at the
  front of a build. None cleared yet. The 2026-05-21 re-walk drilled
  shared.js (the future L1.3 rung); next up is an L1.1 cold-read of a
  lighter file — gap.js is the natural pick. See higgins-method.md v0.4
  and the 2026-05-21 skills-ledger entry.

Where I want to start today: [STATE YOUR GOAL. Stage 4a is spec'd —
docs/specs/v2-stage4a-spec.md. Building it is a ccode session, not
cowork. Cowork's likely next jobs: the L1.1 sub-gate (a ~1-hour
cold-read of gap.js); or, once ccode has built 4a, the smoke test and
then planning 4b. State what you want.]

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

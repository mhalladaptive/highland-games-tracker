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
   v2-stage3b-spec.md (all shipped).

4. Skim the highland-games-tracker entries in the skills ledger:
   ~/Documents/Obsidian Vault/Reference/Higgins Method/skills-ledger.md

Current state:

- Stages 1, 2, 3a, and 3b are SHIPPED and tagged — v2.0.0-rebrand,
  v2.0.0-stage2, v2.0.0-stage3a, v2.0.0-stage3b. Stage 3 (the Set PRs &
  Goals page + the unit conversion engine) is complete.
- Stage 4 — the celebration system and the Log Session changes — is the
  next stage. Not started. It is the big behavioral stage, and where
  goalMeta and the unit direction field finally get used.
- L1 gate: attempted 2026-05-19, NOT cleared. The standing edge is
  reading the mechanism layer of the code. A study sheet is in the
  Higgins Method folder. The Stage 3b ledger entry recommends clearing
  the gate before Stage 4.

Where I want to start today: [STATE YOUR GOAL — the two candidates are
(a) the L1 gate re-walk: open the repo and describe each file in your
own words, shared.js first; or (b) planning Stage 4. The ledger's
recommendation is to clear the gate first.]

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
